// 포토카드 스캔 분석기. macOS Vision 프레임워크만 쓴다 (추가 설치 없음).
// 사용: vision <이미지 경로>...   → 파일마다 JSON 한 줄 출력
import Foundation
import Vision
import CoreGraphics
import ImageIO

struct Line: Encodable { let text: String; let conf: Float; let box: [Double] }
struct Result: Encodable {
  let path: String
  var ok: Bool = true
  var error: String? = nil
  var width: Int = 0
  var height: Int = 0
  var faces: Int = 0
  var faceBoxes: [[Double]] = []
  var lines: [Line] = []
  var mean: [Double] = [0, 0, 0]      // 평균 RGB (0-255)
  var stddev: Double = 0              // 밝기 표준편차. 낮으면 단색 뒷면
  var edge: Double = 0                // 인접 픽셀 차이 평균. 사진은 높고 단색은 낮다
  var print: [Float] = []             // 이미지 특징 벡터 (Vision feature print)
}

func loadImage(_ path: String) -> CGImage? {
  let url = URL(fileURLWithPath: path)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil) else { return nil }
  return CGImageSourceCreateImageAtIndex(src, 0, [kCGImageSourceShouldCache: false] as CFDictionary)
}

func colorStats(_ img: CGImage) -> ([Double], Double, Double) {
  let w = 64, h = 96
  var buf = [UInt8](repeating: 0, count: w * h * 4)
  let cs = CGColorSpaceCreateDeviceRGB()
  guard let ctx = CGContext(data: &buf, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4, space: cs,
                            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return ([0,0,0], 0, 0) }
  ctx.interpolationQuality = .medium
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  var sum = [0.0, 0.0, 0.0]; var lum = [Double](repeating: 0, count: w * h)
  for i in 0..<(w * h) {
    let r = Double(buf[i*4]), g = Double(buf[i*4+1]), b = Double(buf[i*4+2])
    sum[0] += r; sum[1] += g; sum[2] += b
    lum[i] = 0.299*r + 0.587*g + 0.114*b
  }
  let n = Double(w * h)
  let mean = sum.map { $0 / n }
  let lmean = lum.reduce(0, +) / n
  let variance = lum.reduce(0) { $0 + ($1 - lmean) * ($1 - lmean) } / n
  var edge = 0.0; var cnt = 0.0
  for y in 1..<(h-1) { for x in 1..<(w-1) {
    let i = y * w + x
    edge += abs(lum[i] - lum[i+1]) + abs(lum[i] - lum[i+w]); cnt += 2
  } }
  return (mean, variance.squareRoot(), edge / cnt)
}

func inverted(_ img: CGImage) -> CGImage? {
  // 어두운 바탕의 흰 글자는 색을 뒤집어야 잘 읽힌다
  let w = img.width, h = img.height
  guard let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { return nil }
  ctx.interpolationQuality = .high
  ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
  ctx.setBlendMode(.difference); ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
  return ctx.makeImage()
}

func ocr(_ handler: VNImageRequestHandler, langs: [String]) -> [Line] {
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.recognitionLanguages = langs
  req.usesLanguageCorrection = false
  try? handler.perform([req])
  var out: [Line] = []
  for o in req.results ?? [] {
    guard let c = o.topCandidates(1).first else { continue }
    let b = o.boundingBox
    out.append(Line(text: c.string, conf: c.confidence, box: [b.minX, b.minY, b.width, b.height]))
  }
  return out
}

func analyze(_ path: String) -> Result {
  var r = Result(path: path)
  guard let img = loadImage(path) else { r.ok = false; r.error = "이미지를 열 수 없음"; return r }
  r.width = img.width; r.height = img.height
  let (mean, sd, edge) = colorStats(img)
  r.mean = mean.map { ($0 * 10).rounded() / 10 }; r.stddev = (sd * 10).rounded() / 10; r.edge = (edge * 100).rounded() / 100
  let handler = VNImageRequestHandler(cgImage: img, options: [:])
  let faces = VNDetectFaceRectanglesRequest()
  let fp = VNGenerateImageFeaturePrintRequest()
  do { try handler.perform([faces, fp]) } catch { r.ok = false; r.error = "\(error)"; return r }
  r.faces = faces.results?.count ?? 0
  r.faceBoxes = (faces.results ?? []).map { [$0.boundingBox.minX, $0.boundingBox.minY, $0.boundingBox.width, $0.boundingBox.height] }
  if let f = fp.results?.first as? VNFeaturePrintObservation, f.elementType == .float {
    var arr = [Float](repeating: 0, count: f.elementCount)
    _ = arr.withUnsafeMutableBytes { f.data.copyBytes(to: $0) }
    r.print = arr
  }
  // OCR은 영어 우선, 한국어 우선 두 번 돌려서 합친다. 뒷면의 작은 로고 글자가 한쪽에서만 잡히는 일이 잦다.
  var seen: [String: Line] = [:]
  func take(_ lines: [Line]) {
    for l in lines {
      let key = l.text.lowercased().replacingOccurrences(of: " ", with: "")
      if key.isEmpty { continue }
      if let old = seen[key], old.conf >= l.conf { continue }
      seen[key] = l
    }
  }
  for langs in [["en-US", "ko-KR", "ja-JP"], ["ko-KR", "en-US", "ja-JP"]] { take(ocr(handler, langs: langs)) }
  if let inv = inverted(img) {
    let h2 = VNImageRequestHandler(cgImage: inv, options: [:])
    take(ocr(h2, langs: ["en-US", "ko-KR", "ja-JP"]))
  }
  r.lines = seen.values.sorted { $0.box[1] > $1.box[1] }
  return r
}

let enc = JSONEncoder()
for path in CommandLine.arguments.dropFirst() {
  let r = analyze(path)
  if let d = try? enc.encode(r), let s = String(data: d, encoding: .utf8) { print(s); fflush(stdout) }
}
