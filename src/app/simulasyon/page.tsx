"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const SunCanvas = dynamic(() => import("@/components/SunCanvas"), { ssr: false });

/* ─────────────────────────────────────────────────────────────
   STORM LEVEL DATA
───────────────────────────────────────────────────────────── */
type StormLevel = "G1" | "G2" | "G3" | "G4" | "G5";

interface StormConfig {
  level: StormLevel;
  label: string;
  sublabel: string;
  kp: number;
  color: string;
  colorRgb: string;
  cmeSpeed: number;
  auroraLat: string;
  satelliteRisk: string;
  infrastructureRisk: string;
  powerGrid: string;
  radioBlackout: string;
  description: string;
  effects: string[];
}

const STORM_CONFIGS: StormConfig[] = [
  {
    level: "G1",
    label: "Hafif",
    sublabel: "Minor",
    kp: 5,
    color: "#FFD700",
    colorRgb: "255,215,0",
    cmeSpeed: 450,
    auroraLat: "60°N ve üzeri",
    satelliteRisk: "Düşük",
    infrastructureRisk: "Minimal",
    powerGrid: "Zayıf dalgalanmalar",
    radioBlackout: "Az etki",
    description:
      "Zayıf jeomanyetik fırtına. Yüksek enlemlerde aurora gözlemlenebilir. Uzay araçlarında küçük çaplı yönelim düzeltmeleri gerekebilir.",
    effects: [
      "Kutup bölgelerinde aurora görünür",
      "Uydu yörünge düzeltmeleri küçük ölçekte",
      "HF radyo sinyallerinde hafif bozulma",
      "Yüksek enlem güç şebekesi izleme önerilir",
    ],
  },
  {
    level: "G2",
    label: "Orta",
    sublabel: "Moderate",
    kp: 6.5,
    color: "#FFB347",
    colorRgb: "255,179,71",
    cmeSpeed: 700,
    auroraLat: "50°N ve üzeri",
    satelliteRisk: "Orta",
    infrastructureRisk: "Düşük",
    powerGrid: "Yüksek enlem şebekeleri etkilenebilir",
    radioBlackout: "Bölgesel bozulma",
    description:
      "Orta seviye jeomanyetik fırtına. Uyduların yönelim sistemleri etkilenebilir. Yüksek enlikte yaşayan insanlar aurora görebilir.",
    effects: [
      "50°N üzerinde yaygın aurora",
      "Uzay aracı sürüklenmesi artar",
      "HF radyo propagasyonu bozulur",
      "Yüksek enlem devreleri voltaj düzensizliği",
      "Kutup uçuş yolları yeniden planlanabilir",
    ],
  },
  {
    level: "G3",
    label: "Güçlü",
    sublabel: "Strong",
    kp: 7.5,
    color: "#FF6B35",
    colorRgb: "255,107,53",
    cmeSpeed: 900,
    auroraLat: "45°N ve üzeri",
    satelliteRisk: "Yüksek",
    infrastructureRisk: "Orta",
    powerGrid: "Voltaj düzeltmesi gerekli",
    radioBlackout: "Geniş alan kesmesi",
    description:
      "Güçlü jeomanyetik fırtına. Elektrik altyapısında ciddi sorunlar yaşanabilir. İletişim sistemleri bozulur. Navigasyon GPS hataları görülür.",
    effects: [
      "45°N üzeri geniş aurora şeridi",
      "Yüzey şarjı uydu operasyonlarını etkiler",
      "GPS navigasyon hatası artar",
      "Alt frekans radyo sinyalleri kesilir",
      "Güç şebekesinde koruyucu sistem devreye girer",
      "Kutup uçuşları yönlendirilir",
    ],
  },
  {
    level: "G4",
    label: "Çok Şiddetli",
    sublabel: "Severe",
    kp: 8.5,
    color: "#FF4500",
    colorRgb: "255,69,0",
    cmeSpeed: 1400,
    auroraLat: "40°N ve üzeri",
    satelliteRisk: "Kritik",
    infrastructureRisk: "Yüksek",
    powerGrid: "Yaygın devre kesintileri",
    radioBlackout: "HF tamamen kesilir",
    description:
      "Çok şiddetli jeomanyetik fırtına. Güç şebekeleri büyük ölçekte etkilenir. Uydu iletişimi kesintiye uğrar. Petrol boru hatları tehlikeye girer.",
    effects: [
      "40°N üzeri dramatik aurora gösterisi",
      "Uydu takibi ve yönelimi ciddi şekilde bozulur",
      "GPS hatası 10–100 metre artar",
      "HF radyo tamamen çöker",
      "Güç transformatörleri aşırı gerilime maruz kalır",
      "Boru hattı korrozyon kontrol sistemleri devreye girer",
      "Alçak irtifada uzay aracı sürüklenmesi kritik seviyeye ulaşır",
    ],
  },
  {
    level: "G5",
    label: "Ekstrem",
    sublabel: "Extreme",
    kp: 9.5,
    color: "#FF2D55",
    colorRgb: "255,45,85",
    cmeSpeed: 2000,
    auroraLat: "Ekvator'a kadar",
    satelliteRisk: "Felaket",
    infrastructureRisk: "Yıkıcı",
    powerGrid: "Tam çöküş riski",
    radioBlackout: "Küresel tam kesinti",
    description:
      "Ekstrem jeomanyetik fırtına — en yüksek tehlike seviyesi. Tüm küresel altyapı tehdit altında. 1989 Quebec ve 2003 Halloween fırtınalarına eşdeğer.",
    effects: [
      "Ekvator'a yakın bölgelerde bile aurora görülür",
      "Uydu operasyonları tamamen tehlikeye girer",
      "GPS ve navigasyon sistemleri çöker",
      "Tüm frekans bantlarında radyo kesilmesi",
      "Güç şebekesi büyük çaplı çöküş yaşar",
      "Petrol ve gaz boru hatları korunma sistemlerine bağlanır",
      "Uzay araçları acil güvenli moda alınır",
      "Küresel havacılık yeniden yönlendirilir",
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   TIMELINE STEPS
───────────────────────────────────────────────────────────── */
const TIMELINE_STEPS = [
  { icon: "🔥", label: "Güneş Alevi", desc: "X-sınıfı patlama" },
  { icon: "☀️", label: "CME Fırlatma", desc: "Plazma bulutlanır" },
  { icon: "🚀", label: "Uzay Yolculuğu", desc: "1–3 gün sürer" },
  { icon: "🌍", label: "Dünya Teması", desc: "Manyetopor sıkışır" },
  { icon: "⚡", label: "Jeomanyetik Fırtına", desc: "G1–G5 aktif" },
  { icon: "🛡️", label: "Kurtarma Fazı", desc: "24–72 saat" },
];

/* ─────────────────────────────────────────────────────────────
   STAR FIELD (same as main page)
───────────────────────────────────────────────────────────── */
function StarField() {
  const [stars, setStars] = useState<
    { id: number; x: number; y: number; r: number; dur: string; delay: string }[]
  >([]);

  useEffect(() => {
    const s = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.6 + 0.4,
      dur: (Math.random() * 4 + 2).toFixed(1),
      delay: (Math.random() * 5).toFixed(1),
    }));
    setStars(s);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <svg width="100%" height="100%">
        {stars.map((s) => (
          <circle
            key={s.id}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="#E8EAF0"
            className="star"
            style={{ "--dur": `${s.dur}s`, "--delay": `${s.delay}s` } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR (simülasyon sayfası için)
───────────────────────────────────────────────────────────── */
function SimNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 2rem",
        background: scrolled ? "rgba(2,8,24,0.95)" : "rgba(2,8,24,0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,107,53,0.15)",
        transition: "background 0.3s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>☀️</span>
        <span
          className="font-heading"
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#FF6B35",
            letterSpacing: "0.05em",
          }}
        >
          SolarWatch
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link
          href="/"
          style={{
            color: "#8B9AC0",
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B35")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8B9AC0")}
        >
          Ana Panel
        </Link>
        <span
          className="font-heading"
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#FF6B35",
            letterSpacing: "0.08em",
            padding: "0.35rem 0.9rem",
            borderRadius: "6px",
            border: "1px solid rgba(255,107,53,0.4)",
            background: "rgba(255,107,53,0.1)",
          }}
        >
          SİMÜLASYON
        </span>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   COUNT UP (aynı ana sayfadaki gibi)
───────────────────────────────────────────────────────────── */
function CountUp({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const [val, setVal] = useState(0);
  const prevTarget = useRef(target);

  useEffect(() => {
    prevTarget.current = 0;
    const dur = 900;
    const step = 16;
    const steps = dur / step;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setVal(cur);
      if (cur >= target) clearInterval(t);
    }, step);
    return () => clearInterval(t);
  }, [target]);

  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>;
}

/* ─────────────────────────────────────────────────────────────
   STORM SELECTOR (Sol panel)
───────────────────────────────────────────────────────────── */
function StormSelector({
  selected,
  onSelect,
}: {
  selected: StormLevel;
  onSelect: (l: StormLevel) => void;
}) {
  return (
    <div className="sim-panel" style={{ padding: "1.25rem", position: "sticky", top: "80px" }}>
      <div
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.14em",
          color: "#8B9AC0",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          marginBottom: "1rem",
        }}
      >
        FİRTINA SEVİYESİ SEÇ
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {STORM_CONFIGS.map((cfg) => {
          const isActive = selected === cfg.level;
          return (
            <button
              key={cfg.level}
              className={`storm-btn${isActive ? " active" : ""}`}
              style={
                {
                  "--storm-color": cfg.color,
                } as React.CSSProperties
              }
              onClick={() => onSelect(cfg.level)}
              id={`btn-${cfg.level.toLowerCase()}`}
              aria-pressed={isActive}
            >
              {/* Level badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%" }}>
                <span
                  className="font-heading"
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: cfg.color,
                    letterSpacing: "0.04em",
                    textShadow: isActive ? `0 0 12px ${cfg.color}` : "none",
                    transition: "text-shadow 0.4s",
                  }}
                >
                  {cfg.level}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: isActive ? cfg.color : "#8B9AC0",
                    fontWeight: 600,
                    transition: "color 0.3s",
                  }}
                >
                  {cfg.label}
                </span>
                {isActive && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: cfg.color,
                      boxShadow: `0 0 8px ${cfg.color}`,
                      animation: "blink 1s ease infinite",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "rgba(139,154,192,0.7)",
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "0.04em",
                }}
              >
                Kp ≥ {Math.floor(cfg.kp)} · {cfg.sublabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Kpİndeks etiket */}
      <div
        style={{
          marginTop: "1.25rem",
          padding: "0.85rem",
          borderRadius: "10px",
          background: "rgba(255,107,53,0.06)",
          border: "1px solid rgba(255,107,53,0.12)",
        }}
      >
        <div style={{ fontSize: "0.65rem", color: "#8B9AC0", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
          AKTİF Kp İNDEKSİ
        </div>
        <div
          className="font-heading"
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            color: STORM_CONFIGS.find((c) => c.level === selected)?.color ?? "#FF6B35",
            transition: "color 0.5s",
            lineHeight: 1,
          }}
        >
          <CountUp
            key={selected}
            target={STORM_CONFIGS.find((c) => c.level === selected)?.kp ?? 5}
            decimals={1}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUN CENTER (Orta panel)
───────────────────────────────────────────────────────────── */
function SimulationSun({ config }: { config: StormConfig }) {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; delay: number; dur: number }[]
  >([]);

  useEffect(() => {
    // G3 ve üzeri için parçacıklar
    if (config.kp >= 7) {
      setParticles(
        Array.from({ length: 8 }, (_, i) => ({
          id: i,
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          delay: Math.random() * 2,
          dur: 1.5 + Math.random() * 1.5,
        }))
      );
    } else {
      setParticles([]);
    }
  }, [config.kp]);

  const ringCount = config.level === "G5" ? 3 : config.level === "G4" ? 2 : 1;
  const showScanline = config.kp >= 8;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <div
          className="font-heading gradient-solar"
          style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, letterSpacing: "0.08em" }}
        >
          {config.level} — {config.label.toUpperCase()} FİRTINA
        </div>
        <div style={{ color: "#8B9AC0", fontSize: "0.8rem", marginTop: "0.3rem" }}>
          {config.description.split(".")[0]}.
        </div>
      </div>

      {/* Sun wrapper */}
      <div
        style={{
          position: "relative",
          width: "clamp(280px, 40vw, 560px)",
          height: "clamp(280px, 40vw, 560px)",
        }}
      >
        {/* Pulse rings */}
        {Array.from({ length: ringCount }, (_, i) => (
          <div
            key={i}
            className="pulse-ring"
            style={
              {
                "--storm-color": config.color,
                animationDelay: `${i * 0.7}s`,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Floating particles for high severity */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="storm-particle"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                "--storm-color": config.color,
              } as React.CSSProperties
            }
          />
        ))}

        {/* Scanline for G4-G5 */}
        {showScanline && (
          <div
            className="scanline-overlay"
            style={{ "--storm-color": config.color } as React.CSSProperties}
          />
        )}

        {/* 3D Sun */}
        <div
          style={{
            width: "100%",
            height: "100%",
            filter: `drop-shadow(0 0 ${40 + config.kp * 8}px rgba(${config.colorRgb},${0.3 + config.kp * 0.04}))`,
            transition: "filter 1.2s ease",
          }}
        >
          <SunCanvas kpIndex={config.kp} />
        </div>
      </div>

      {/* Severity badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.5rem 1.25rem",
          borderRadius: "50px",
          border: `1px solid rgba(${config.colorRgb},0.5)`,
          background: `rgba(${config.colorRgb},0.1)`,
          color: config.color,
          fontFamily: "var(--font-heading)",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: config.color,
            animation: "blink 1s ease infinite",
            display: "inline-block",
          }}
        />
        CME HIZI ~{config.cmeSpeed.toLocaleString("tr-TR")} km/s · AURORA {config.auroraLat}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   METRICS PANEL (Sağ panel)
───────────────────────────────────────────────────────────── */
function MetricsPanel({ config }: { config: StormConfig }) {
  const riskColor = (risk: string) => {
    if (risk === "Felaket" || risk === "Yıkıcı" || risk === "Kritik") return "#FF2D55";
    if (risk === "Yüksek") return "#FF4500";
    if (risk === "Orta") return "#FF6B35";
    if (risk === "Düşük") return "#FFB347";
    return "#00D4A8";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "80px" }}>
      {/* Metrik kartları */}
      <div className="sim-panel" style={{ padding: "1.25rem" }}>
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            color: "#8B9AC0",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          SİMÜLASYON METRİKLERİ
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {[
            { label: "CME Hızı", value: config.cmeSpeed, suffix: " km/s", isNum: true, color: config.color },
            { label: "Kp İndeksi", value: config.kp, suffix: "", isNum: true, decimals: 1, color: config.color },
            { label: "Aurora Görünürlüğü", value: config.auroraLat, isNum: false, color: "#00D4A8" },
            { label: "Uydu Riski", value: config.satelliteRisk, isNum: false, color: riskColor(config.satelliteRisk) },
            { label: "Altyapı", value: config.infrastructureRisk, isNum: false, color: riskColor(config.infrastructureRisk) },
            { label: "Güç Şebekesi", value: config.powerGrid, isNum: false, color: "#FFB347" },
            { label: "Radyo Kesintisi", value: config.radioBlackout, isNum: false, color: "#8B9AC0" },
          ].map((m, i) => (
            <div
              key={`${config.level}-${i}`}
              className="sim-metric"
              style={{
                paddingBottom: "0.75rem",
                borderBottom: i < 6 ? "1px solid rgba(255,107,53,0.06)" : "none",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ fontSize: "0.65rem", color: "#8B9AC0", letterSpacing: "0.08em", marginBottom: "0.2rem" }}>
                {m.label.toUpperCase()}
              </div>
              <div
                className="font-heading"
                style={{ fontWeight: 700, color: m.color, fontSize: m.isNum ? "1.2rem" : "0.82rem", transition: "color 0.4s" }}
              >
                {m.isNum ? (
                  <>
                    <CountUp key={`${config.level}-${m.label}`} target={m.value as number} decimals={(m as { decimals?: number }).decimals ?? 0} />
                    {m.suffix}
                  </>
                ) : (
                  m.value as string
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Etki listesi */}
      <div className="sim-panel" style={{ padding: "1.25rem" }}>
        <div
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            color: "#8B9AC0",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            marginBottom: "0.85rem",
          }}
        >
          BEKLENTİLEN ETKİLER
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {config.effects.map((effect, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                fontSize: "0.75rem",
                color: "#8B9AC0",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: config.color, marginTop: "2px", flexShrink: 0 }}>›</span>
              {effect}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TIMELINE (Alt bölüm)
───────────────────────────────────────────────────────────── */
function StormTimeline({ config }: { config: StormConfig }) {
  // G seviyesine göre aktif adım sayısı (G1=3, G5=6)
  const activeCount =
    config.level === "G5" ? 6 : config.level === "G4" ? 5 : config.level === "G3" ? 5 : config.level === "G2" ? 4 : 3;

  return (
    <div
      className="sim-panel"
      style={{ padding: "1.5rem 2rem", marginTop: "1.5rem" }}
      id="timeline-section"
    >
      <div
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.14em",
          color: "#8B9AC0",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          marginBottom: "0.5rem",
        }}
      >
        FIRTINA ZAMAN ÇİZELGESİ — {config.level} SENARYOSİ
      </div>
      <div
        style={{
          fontSize: "0.72rem",
          color: "rgba(139,154,192,0.6)",
          marginBottom: "1.5rem",
        }}
      >
        Güneş'ten Dünya'ya tipik {config.level} fırtınası evrimi
      </div>

      <div
        className="timeline-track"
        style={{ "--storm-color": config.color } as React.CSSProperties}
      >
        {TIMELINE_STEPS.map((step, i) => {
          const isActive = i < activeCount;
          return (
            <div
              key={i}
              className={`timeline-step${isActive ? " active" : ""}`}
              style={{ "--storm-color": config.color } as React.CSSProperties}
            >
              <div
                className="timeline-dot"
                style={{ "--storm-color": isActive ? config.color : "rgba(255,107,53,0.2)" } as React.CSSProperties}
              >
                {step.icon}
              </div>
              <div
                style={{
                  marginTop: "0.6rem",
                  textAlign: "center",
                  padding: "0 0.25rem",
                }}
              >
                <div
                  className="font-heading"
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: isActive ? config.color : "#8B9AC0",
                    letterSpacing: "0.04em",
                    marginBottom: "0.2rem",
                    transition: "color 0.4s",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: isActive ? "rgba(139,154,192,0.9)" : "rgba(139,154,192,0.4)",
                    transition: "color 0.4s",
                  }}
                >
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   COMPARISON TABLE
───────────────────────────────────────────────────────────── */
function ComparisonTable({ selected }: { selected: StormLevel }) {
  return (
    <div className="sim-panel" style={{ padding: "1.5rem 2rem", marginTop: "1.5rem", overflowX: "auto" }}>
      <div
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.14em",
          color: "#8B9AC0",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          marginBottom: "1.25rem",
        }}
      >
        TÜM SEVİYE KARŞILAŞTIRMASI
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,107,53,0.15)" }}>
            {["Seviye", "Kp", "CME Hızı", "Aurora", "Uydu Riski", "Şebeke Etkisi"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "0.6rem 0.8rem",
                  textAlign: "left",
                  color: "#8B9AC0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STORM_CONFIGS.map((cfg) => {
            const isRow = cfg.level === selected;
            return (
              <tr
                key={cfg.level}
                style={{
                  borderBottom: "1px solid rgba(255,107,53,0.06)",
                  background: isRow ? `rgba(${cfg.colorRgb},0.08)` : "transparent",
                  transition: "background 0.3s",
                }}
              >
                <td style={{ padding: "0.7rem 0.8rem" }}>
                  <span
                    className="font-heading"
                    style={{
                      fontWeight: 800,
                      color: cfg.color,
                      fontSize: "0.85rem",
                      textShadow: isRow ? `0 0 10px ${cfg.color}` : "none",
                    }}
                  >
                    {cfg.level}
                  </span>
                  <span style={{ color: "#8B9AC0", fontSize: "0.65rem", marginLeft: "0.4rem" }}>
                    {cfg.label}
                  </span>
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: cfg.color, fontWeight: 700 }}>
                  {cfg.kp}
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: "#E8EAF0" }}>
                  ~{cfg.cmeSpeed.toLocaleString("tr-TR")} km/s
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: "#8B9AC0", fontSize: "0.72rem" }}>
                  {cfg.auroraLat}
                </td>
                <td style={{ padding: "0.7rem 0.8rem" }}>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      background: `rgba(${cfg.colorRgb},0.12)`,
                      color: cfg.color,
                      border: `1px solid rgba(${cfg.colorRgb},0.3)`,
                    }}
                  >
                    {cfg.satelliteRisk}
                  </span>
                </td>
                <td style={{ padding: "0.7rem 0.8rem", color: "#8B9AC0", fontSize: "0.72rem" }}>
                  {cfg.powerGrid}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────────────────────── */
export default function SimulasyonPage() {
  const [selectedLevel, setSelectedLevel] = useState<StormLevel>("G1");
  const config = STORM_CONFIGS.find((c) => c.level === selectedLevel)!;

  return (
    <>
      <StarField />
      <SimNavbar />

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* 3-column grid */}
        <div className="sim-layout">
          {/* SOL: Seviye seçici */}
          <div>
            <StormSelector selected={selectedLevel} onSelect={setSelectedLevel} />
          </div>

          {/* ORTA: Güneş + zaman çizelgesi + karşılaştırma */}
          <div>
            <SimulationSun config={config} />
            <StormTimeline config={config} />
            <ComparisonTable selected={selectedLevel} />
          </div>

          {/* SAĞ: Metrikler */}
          <div>
            <MetricsPanel config={config} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,107,53,0.1)",
          padding: "1.5rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          color: "#8B9AC0",
          fontSize: "0.75rem",
          marginTop: "2rem",
        }}
      >
        <div>
          <span className="font-heading" style={{ color: "#FF6B35" }}>
            ☀️ SolarWatch
          </span>{" "}
          — Güneş Fırtınası Simülatörü · NASA Space Apps Hackathon
        </div>
        <Link
          href="/"
          style={{ color: "#FF6B35", textDecoration: "none", fontSize: "0.75rem" }}
        >
          ← Ana Panele Dön
        </Link>
      </footer>
    </>
  );
}
