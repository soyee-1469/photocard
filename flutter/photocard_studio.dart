import 'dart:math' as math;

import 'package:flutter/material.dart';

/// 기존 Flutter 앱에 붙이는 방법
///
/// ```dart
/// Navigator.of(context).push(
///   MaterialPageRoute(builder: (_) => const PhotocardStudioPage()),
/// );
/// ```
class PhotocardStudioPage extends StatefulWidget {
  const PhotocardStudioPage({super.key});

  @override
  State<PhotocardStudioPage> createState() => _PhotocardStudioPageState();
}

enum _Phase { idle, sealed, opening, revealed }

enum _Rarity { common, rare, epic, legend }

class _PhotocardStudioPageState extends State<PhotocardStudioPage>
    with TickerProviderStateMixin {
  static const _rarityMeta = <_Rarity, (String, Color)>{
    _Rarity.common: ('일반', Color(0xFFD7DCE3)),
    _Rarity.rare: ('레어', Color(0xFF5EB1FF)),
    _Rarity.epic: ('에픽', Color(0xFFC084FC)),
    _Rarity.legend: ('레전드', Color(0xFFFFD166)),
  };

  late final AnimationController _packIn;
  late final AnimationController _flap;
  late final AnimationController _wrapper;
  late final AnimationController _cardOut;
  late final AnimationController _spin;
  late final AnimationController _glow;
  late final AnimationController _pulse;

  _Phase _phase = _Phase.idle;
  _Rarity _rarity = _Rarity.rare;

  @override
  void initState() {
    super.initState();
    _packIn = AnimationController(vsync: this, duration: const Duration(milliseconds: 520));
    _flap = AnimationController(vsync: this, duration: const Duration(milliseconds: 360));
    _wrapper = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
    _cardOut = AnimationController(vsync: this, duration: const Duration(milliseconds: 640));
    _spin = AnimationController(vsync: this, duration: const Duration(milliseconds: 880));
    _glow = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));
    _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
  }

  @override
  void dispose() {
    _packIn.dispose();
    _flap.dispose();
    _wrapper.dispose();
    _cardOut.dispose();
    _spin.dispose();
    _glow.dispose();
    _pulse.dispose();
    super.dispose();
  }

  void _reset() {
    _flap.value = 0;
    _wrapper.value = 0;
    _cardOut.value = 0;
    _spin.value = 0;
    _glow.value = 0;
    _pulse
      ..stop()
      ..value = 0;
    _packIn.value = 0;
  }

  Future<void> _draw([_Rarity? forced]) async {
    if (_phase == _Phase.opening) {
      return;
    }
    _reset();
    setState(() {
      _rarity = forced ?? _roll();
      _phase = _Phase.sealed;
    });
    await _packIn.forward();
  }

  Future<void> _open() async {
    if (_phase != _Phase.sealed) {
      return;
    }
    setState(() => _phase = _Phase.opening);
    await _flap.forward();
    await Future.wait([
      _wrapper.forward(),
      _cardOut.forward(),
    ]);
    await _spin.forward();
    if (!mounted) {
      return;
    }
    setState(() => _phase = _Phase.revealed);
    await _glow.forward();
    _pulse.repeat(reverse: true);
  }

  _Rarity _roll() {
    final roll = math.Random().nextDouble();
    if (roll < 0.05) {
      return _Rarity.legend;
    }
    if (roll < 0.2) {
      return _Rarity.epic;
    }
    if (roll < 0.5) {
      return _Rarity.rare;
    }
    return _Rarity.common;
  }

  @override
  Widget build(BuildContext context) {
    final meta = _rarityMeta[_rarity]!;
    final String? actionLabel = switch (_phase) {
      _Phase.idle => '포토카드 뽑기',
      _Phase.sealed => '오픈하기',
      _Phase.revealed => '다시 뽑기',
      _Phase.opening => null,
    };

    return Scaffold(
      backgroundColor: const Color(0xFF14100E),
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF2A211C), Color(0xFF14100E)],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'PACK OPEN',
                  style: TextStyle(
                    color: Color(0xFFC9A06A),
                    fontSize: 11,
                    letterSpacing: 3,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '포토카드 뽑기',
                  style: TextStyle(
                    color: Color(0xFFF6EFE6),
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.6,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '봉인된 팩이 나타난 뒤 위를 찢으면\n카드가 쓕 나와 한 바퀴 돕니다',
                  style: TextStyle(
                    color: Color(0xB8F6EFE6),
                    fontSize: 15,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 18),
                Expanded(
                  child: Center(
                    child: _phase == _Phase.idle
                        ? const Text(
                            '아직 봉인된 팩이 없어요',
                            style: TextStyle(color: Color(0x66F6EFE6), fontSize: 14),
                          )
                        : AnimatedBuilder(
                            animation: Listenable.merge([
                              _packIn,
                              _flap,
                              _wrapper,
                              _cardOut,
                              _spin,
                              _glow,
                              _pulse,
                            ]),
                            builder: (context, _) => _PackStage(
                              rarityColor: meta.$2,
                              rarityLabel: meta.$1,
                              packIn: _packIn.value,
                              flap: _flap.value,
                              wrapper: _wrapper.value,
                              cardOut: _cardOut.value,
                              spin: _spin.value,
                              glow: _glow.value,
                              pulse: _pulse.value,
                            ),
                          ),
                  ),
                ),
                if (_phase == _Phase.revealed)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Center(
                      child: Text(
                        meta.$1,
                        style: TextStyle(
                          color: meta.$2,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                  )
                else
                  const SizedBox(height: 34),
                if (actionLabel == null)
                  Opacity(
                    opacity: 0.55,
                    child: _PrimaryButton(label: '오픈 중…', onTap: () {}),
                  )
                else
                  _PrimaryButton(
                    label: actionLabel,
                    onTap: _phase == _Phase.sealed ? _open : _draw,
                  ),
                const SizedBox(height: 22),
                const Text(
                  '등급 미리보기',
                  style: TextStyle(
                    color: Color(0x8CF6EFE6),
                    fontSize: 12,
                    letterSpacing: 1.4,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    for (final rarity in _Rarity.values) ...[
                      if (rarity != _Rarity.common) const SizedBox(width: 8),
                      Expanded(
                        child: GestureDetector(
                          onTap: () => _draw(rarity),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            decoration: BoxDecoration(
                              color: _rarity == rarity && _phase != _Phase.idle
                                  ? const Color(0x2EC9A06A)
                                  : const Color(0x0DF6EFE6),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Column(
                              children: [
                                Container(
                                  width: 12,
                                  height: 12,
                                  decoration: BoxDecoration(
                                    color: _rarityMeta[rarity]!.$2,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  _rarityMeta[rarity]!.$1,
                                  style: const TextStyle(
                                    color: Color(0xFFF6EFE6),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PackStage extends StatelessWidget {
  const _PackStage({
    required this.rarityColor,
    required this.rarityLabel,
    required this.packIn,
    required this.flap,
    required this.wrapper,
    required this.cardOut,
    required this.spin,
    required this.glow,
    required this.pulse,
  });

  final Color rarityColor;
  final String rarityLabel;
  final double packIn;
  final double flap;
  final double wrapper;
  final double cardOut;
  final double spin;
  final double glow;
  final double pulse;

  @override
  Widget build(BuildContext context) {
    const width = 236.0;
    const height = 236 / (55 / 85);

    return Transform.translate(
      offset: Offset(0, (1 - packIn) * 56),
      child: Transform.scale(
        scale: 0.82 + packIn * 0.18,
        child: Opacity(
          opacity: packIn.clamp(0, 1),
          child: SizedBox(
            width: width + 40,
            height: height + 50,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Opacity(
                  opacity: (glow * (0.38 + pulse * 0.4)).clamp(0, 1),
                  child: Transform.scale(
                    scale: 1 + pulse * 0.12,
                    child: Container(
                      width: 280,
                      height: 280,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: rarityColor.withOpacity(0.45),
                        boxShadow: [
                          BoxShadow(
                            color: rarityColor.withOpacity(0.7),
                            blurRadius: 48,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Transform(
                  alignment: Alignment.center,
                  transform: Matrix4.identity()
                    ..setEntry(3, 2, 0.0014)
                    ..translate(0.0, (1 - cardOut) * 118)
                    ..rotateY(spin * math.pi * 2),
                  child: _PhotoCard(label: rarityLabel, legend: rarityLabel == '레전드'),
                ),
                Opacity(
                  opacity: 1 - wrapper,
                  child: Transform.translate(
                    offset: Offset(0, wrapper * 90),
                    child: SizedBox(
                      width: width + 18,
                      height: height + 28,
                      child: Stack(
                        children: [
                          const DecoratedBox(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.all(Radius.circular(18)),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Color(0xFF3A2A24), Color(0xFF1A1411)],
                              ),
                            ),
                            child: SizedBox.expand(),
                          ),
                          Align(
                            alignment: Alignment.bottomCenter,
                            child: Padding(
                              padding: const EdgeInsets.only(bottom: 28),
                              child: Text(
                                'PHOTOCARD PACK',
                                style: TextStyle(
                                  color: const Color(0x6BF6EFE6),
                                  fontSize: 10,
                                  letterSpacing: 3,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                          Align(
                            alignment: Alignment.topCenter,
                            child: Transform(
                              alignment: Alignment.topCenter,
                              transform: Matrix4.identity()
                                ..setEntry(3, 2, 0.002)
                                ..rotateX(-flap * 128 * math.pi / 180),
                              child: Container(
                                height: 92,
                                width: double.infinity,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF5A4034), Color(0xFF2C201C)],
                                  ),
                                ),
                                child: const Center(
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      border: Border.fromBorderSide(
                                        BorderSide(color: Color(0xFFC9A06A)),
                                      ),
                                      borderRadius: BorderRadius.all(Radius.circular(99)),
                                    ),
                                    child: Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      child: Text(
                                        'SEALED',
                                        style: TextStyle(
                                          color: Color(0xFFC9A06A),
                                          fontSize: 10,
                                          letterSpacing: 2.2,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PhotoCard extends StatelessWidget {
  const _PhotoCard({required this.label, required this.legend});
  final String label;
  final bool legend;

  @override
  Widget build(BuildContext context) {
    const width = 236.0;
    const height = 236 / (55 / 85);
    return Container(
      width: width,
      height: height,
      padding: const EdgeInsets.fromLTRB(10, 10, 10, 8),
      decoration: BoxDecoration(
        color: legend ? const Color(0xFF161210) : const Color(0xFFFFF8F0),
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(color: Color(0x61000000), blurRadius: 28, offset: Offset(0, 18)),
        ],
      ),
      child: Column(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: const DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF7A5C4A), Color(0xFFC9A06A), Color(0xFF3A2A22)],
                  ),
                ),
                child: SizedBox.expand(),
              ),
            ),
          ),
          SizedBox(
            height: 36,
            child: Center(
              child: Text(
                label.toUpperCase(),
                style: TextStyle(
                  color: legend ? const Color(0xFFF4E7D8) : const Color(0xFF3A2A22),
                  fontSize: 11,
                  letterSpacing: 2.4,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  const _PrimaryButton({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        height: 54,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: const Color(0xFFC9A06A),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: const TextStyle(
            color: Color(0xFF1C1410),
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
