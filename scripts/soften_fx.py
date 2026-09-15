from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

FX = Path("/Users/ymy/project/photocard/assets/fx")
OUT = FX / "soft"
OUT.mkdir(exist_ok=True)

# Glow plates: keep only light, use luminance as alpha.
GLOW = {
    "inner_glow.png": {"tol": 26, "lift": 70},
    "light_flash.png": {"tol": 22, "lift": 55},
    "ring_effect.png": {"tol": 28, "lift": 80},
    "sparkle_trail.png": {"tol": 24, "lift": 60},
    "sparkles.png": {"tol": 30, "lift": 85},
}

# Foil shards: knockout canvas, keep object color.
OBJECT = {
    "particles.png": {"tol": 34},
}


def corner_bg(arr: np.ndarray) -> np.ndarray:
    h, w = arr.shape[:2]
    samples = np.stack(
        [
            arr[2, 2, :3],
            arr[2, w - 3, :3],
            arr[h - 3, 2, :3],
            arr[h - 3, w - 3, :3],
        ]
    )
    return np.median(samples, axis=0)


def knockout_object(src: Path, dest: Path, tol: float) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    bg = corner_bg(arr)
    dist = np.linalg.norm(arr[:, :, :3].astype(np.float32) - bg, axis=2)
    keep = np.clip((dist - tol) / 24, 0, 1)
    alpha = (keep * arr[:, :, 3]).astype(np.uint8)
    arr[:, :, 3] = alpha
    Image.fromarray(arr).filter(ImageFilter.GaussianBlur(radius=0.4)).save(dest)


def to_soft_light(src: Path, dest: Path, tol: float, lift: float) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im).astype(np.float32)
    bg = corner_bg(arr)
    rgb = arr[:, :, :3]
    dist = np.linalg.norm(rgb - bg, axis=2)
    luma = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    bg_luma = float(np.dot(bg, [0.2126, 0.7152, 0.0722]))
    light = np.clip((luma - bg_luma - 8) / max(lift, 1), 0, 1)
    near_bg = np.clip((dist - tol) / 18, 0, 1)
    src_a = arr[:, :, 3] / 255.0
    alpha = np.clip(light * near_bg * src_a, 0, 1)
    alpha = np.power(alpha, 0.82)

    # Warm highlight plate — blend modes do the rest.
    out = np.zeros_like(arr)
    out[:, :, 0] = np.clip(rgb[:, :, 0] + 28, 0, 255)
    out[:, :, 1] = np.clip(rgb[:, :, 1] + 12, 0, 255)
    out[:, :, 2] = np.clip(rgb[:, :, 2] + 4, 0, 255)
    out[:, :, 3] = alpha * 255
    Image.fromarray(out.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=0.6)).save(dest)


for name, opts in GLOW.items():
    to_soft_light(FX / name, OUT / name, **opts)
    print("glow", name)

for name, opts in OBJECT.items():
    knockout_object(FX / name, OUT / name, **opts)
    print("obj", name)
