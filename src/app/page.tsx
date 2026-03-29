"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const SunCanvas = dynamic(() => import("@/components/SunCanvas"), { ssr: false });

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Instrument { displayName: string; }
interface LinkedEvent { activityID: string; }
interface EnlilImpact { isGlancingBlow: boolean; isMinorImpact: boolean; location: string; arrivalTime: string; }
interface EnlilEntry {
  modelCompletionTime: string; au: number;
  estimatedShockArrivalTime: string | null; estimatedDuration: string | null;
  isEarthGB: boolean; isEarthMinorImpact: boolean; link: string;
  impactList: EnlilImpact[] | null; cmeIDs: string[];
  kp_18: number | null; kp_90: number | null; kp_135: number | null; kp_180: number | null;
  rmin_re?: number | null;
}
interface CmeAnalysis {
  isMostAccurate: boolean; time21_5: string;
  latitude: number | null; longitude: number | null;
  halfAngle: number; speed: number; type: string;
  note: string; enlilList: EnlilEntry[];
  measurementTechnique: string; imageType: string; levelOfData: number;
  featureCode?: string;
  tilt?: number | null;
  minorHalfWidth?: number | null;
  speedMeasuredAtHeight?: number | null;
  submissionTime?: string;
  link?: string;
}
interface CME {
  activityID: string; catalog: string; startTime: string;
  instruments: Instrument[]; sourceLocation: string;
  activeRegionNum: number | null; note: string;
  submissionTime: string; versionId: number; link: string;
  cmeAnalyses: CmeAnalysis[];
  linkedEvents: LinkedEvent[] | null;
  sentNotifications: { messageID: string; messageIssueTime: string; messageURL: string }[] | null;
}
interface KpIndex { observedTime: string; kpIndex: number; source: string; }
interface GST {
  gstID: string; startTime: string;
  allKpIndex: KpIndex[];
  link: string;
  linkedEvents: LinkedEvent[];
  submissionTime: string; versionId: number;
  sentNotifications: { messageID: string; messageIssueTime: string; messageURL: string }[];
}

/* ─────────────────────────────────────────────────────────────
   RAW DATA
───────────────────────────────────────────────────────────── */
const CME_DATA: CME[] = [{ "activityID": "2024-01-01T17:00:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-01T17:00Z", "instruments": [{ "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }], "sourceLocation": "", "activeRegionNum": null, "note": "Faint CME where the source is likely the minor movement of field lines behind the limb in SE in AIA 171 starting around 2024-01-01T16:30Z. Fully covered by data gap in STEREO A.", "submissionTime": "2025-02-06T17:44Z", "versionId": 2, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28435/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-02T01:01Z", "latitude": -64.0, "longitude": null, "halfAngle": 26.0, "speed": 416.0, "type": "S", "featureCode": "LE", "imageType": "running difference", "measurementTechnique": "Plane-of-sky", "note": "3D measurement not possible because the source is behind the limb and only SOHO coronagraph imagery is available (data gap in STEREO).", "levelOfData": 0, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": null, "submissionTime": "2024-01-02T13:41Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28436/-1", "enlilList": [] }], "linkedEvents": null, "sentNotifications": null }, { "activityID": "2024-01-02T11:09:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-02T11:09Z", "instruments": [{ "displayName": "STEREO A: SECCHI/COR2" }, { "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }], "sourceLocation": "", "activeRegionNum": null, "note": "The source of this wide CME is likely a very faint opening of field lines behind the SW limb seen in AIA 171 only after 2024-01-02T10:54Z.", "submissionTime": "2024-01-02T19:20Z", "versionId": 1, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28440/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-02T16:23Z", "latitude": -22.0, "longitude": 122.0, "halfAngle": 40.0, "speed": 617.0, "type": "C", "featureCode": "LE", "imageType": "direct", "measurementTechnique": "SWPC_CAT", "note": "Uncertain analysis is based on best fit in swpc_cat since the source is likely far behind the SW limb.", "levelOfData": 1, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": null, "submissionTime": "2024-01-02T19:20Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28441/-1", "enlilList": [{ "modelCompletionTime": "2024-01-02T18:23Z", "au": 2.0, "estimatedShockArrivalTime": null, "estimatedDuration": null, "rmin_re": null, "kp_18": null, "kp_90": null, "kp_135": null, "kp_180": null, "isEarthGB": false, "isEarthMinorImpact": false, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/WSA-ENLIL/28439/-1", "impactList": [{ "isGlancingBlow": true, "isMinorImpact": false, "location": "Mars", "arrivalTime": "2024-01-07T03:00Z" }, { "isGlancingBlow": true, "isMinorImpact": false, "location": "OSIRIS-APEX", "arrivalTime": "2024-01-04T06:00Z" }], "cmeIDs": ["2024-01-02T11:09:00-CME-001"] }] }], "linkedEvents": null, "sentNotifications": [{ "messageID": "20240102-AL-001", "messageIssueTime": "2024-01-02T19:29Z", "messageURL": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/Alert/28442/1" }] }, { "activityID": "2024-01-02T19:00:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-02T19:00Z", "instruments": [{ "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }, { "displayName": "STEREO A: SECCHI/COR2" }], "sourceLocation": "", "activeRegionNum": null, "note": "This CME is visible to the south in SOHO LASCO C2/C3, as well as in STEREO A COR2 coronagraph imagery preceding and following a data gap. The source is a large southern filament eruption which begins to lift-off around 2024-01-02T17:00Z as seen in SDO AIA 171 and 304 imagery. Additionally, dimming is observed in SDO AIA 193 imagery shortly following the filament eruption.", "submissionTime": "2025-02-20T19:13Z", "versionId": 2, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28455/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-03T03:48Z", "latitude": -71.0, "longitude": -9.0, "halfAngle": 31.0, "speed": 462.0, "type": "S", "featureCode": "LE", "imageType": "running difference", "measurementTechnique": "SWPC_CAT", "note": "Measurement based on the approximate source location. There is only one measurable frame available in STEREO A COR2 imagery so this measurement relies primarily on SOHO LASCO C3.", "levelOfData": 0, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": 16.7, "submissionTime": "2024-01-03T17:33Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28456/-1", "enlilList": [] }], "linkedEvents": null, "sentNotifications": null }, { "activityID": "2024-01-02T19:36:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-02T19:36Z", "instruments": [{ "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }], "sourceLocation": "N05E59", "activeRegionNum": 13536, "note": "This CME is visible to the E/SE in SOHO LASCO C2/C3 imagery. The source is likely an eruption and subsequent M1.1 flare from Active Region 13536 starting around 2024-01-02T18:30Z.", "submissionTime": "2024-01-03T19:04Z", "versionId": 1, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28461/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-03T13:00Z", "latitude": -12.0, "longitude": -59.0, "halfAngle": 15.0, "speed": 206.0, "type": "S", "featureCode": "LE", "imageType": "running difference", "measurementTechnique": "SWPC_CAT", "note": "Measurement based on the source location.", "levelOfData": 0, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": 5.7, "submissionTime": "2024-01-03T19:06Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28462/-1", "enlilList": [] }], "linkedEvents": [{ "activityID": "2024-01-02T18:02:00-FLR-001" }], "sentNotifications": null }, { "activityID": "2024-01-03T03:24:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-03T03:24Z", "instruments": [{ "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }, { "displayName": "STEREO A: SECCHI/COR2" }], "sourceLocation": "", "activeRegionNum": null, "note": "This CME is visible to the west in SOHO LASCO C2/C3 and STEREO A COR2 coronagraph imagery. The source is likely related to an opening of field lines visible just on or beyond the western limb.", "submissionTime": "2024-01-03T17:18Z", "versionId": 1, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28453/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-03T11:57Z", "latitude": -4.0, "longitude": 112.0, "halfAngle": 41.0, "speed": 413.0, "type": "S", "featureCode": "LE", "imageType": "running difference", "measurementTechnique": "SWPC_CAT", "note": "Measurement based on the best fit between SOHO LASCO C2/C3 and STEREO A COR2 coronagraph imagery.", "levelOfData": 0, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": 8.6, "submissionTime": "2024-01-03T17:26Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28454/-1", "enlilList": [{ "modelCompletionTime": "2024-01-03T17:34Z", "au": 2.0, "estimatedShockArrivalTime": null, "estimatedDuration": null, "rmin_re": null, "kp_18": null, "kp_90": null, "kp_135": null, "kp_180": null, "isEarthGB": false, "isEarthMinorImpact": false, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/WSA-ENLIL/28457/-1", "impactList": [{ "isGlancingBlow": true, "isMinorImpact": false, "location": "Mars", "arrivalTime": "2024-01-08T04:00Z" }], "cmeIDs": ["2024-01-03T03:24:00-CME-001"] }] }], "linkedEvents": null, "sentNotifications": null }, { "activityID": "2024-01-06T08:12:00-CME-001", "catalog": "M2M_CATALOG", "startTime": "2024-01-06T08:12Z", "instruments": [{ "displayName": "SOHO: LASCO/C2" }, { "displayName": "SOHO: LASCO/C3" }], "sourceLocation": "S06E05", "activeRegionNum": 13536, "note": "CME seen to the SE in SOHO LASCO C2/C3. Source is likely a large dimming region in the vicinity of AR 3536. A complex multi-peaked flare best observed in GOES SUVI 131 occurred with this event.", "submissionTime": "2024-01-06T23:22Z", "versionId": 1, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/28508/-1", "cmeAnalyses": [{ "isMostAccurate": true, "time21_5": "2024-01-06T12:19Z", "latitude": -10.0, "longitude": -15.0, "halfAngle": 10.0, "speed": 706.0, "type": "C", "featureCode": "LE", "imageType": "running difference", "measurementTechnique": "SWPC_CAT", "note": "Measurement using only SOHO LASCO C2/C3 frames due to a COR2A data gap.", "levelOfData": 0, "tilt": null, "minorHalfWidth": null, "speedMeasuredAtHeight": 21.5, "submissionTime": "2024-01-06T23:27Z", "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CMEAnalysis/28509/-1", "enlilList": [{ "modelCompletionTime": "2024-01-06T23:12Z", "au": 2.0, "estimatedShockArrivalTime": "2024-01-09T02:00Z", "estimatedDuration": null, "rmin_re": null, "kp_18": null, "kp_90": 2, "kp_135": 3, "kp_180": 4, "isEarthGB": true, "isEarthMinorImpact": false, "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/WSA-ENLIL/28510/-1", "impactList": [{ "isGlancingBlow": true, "isMinorImpact": false, "location": "Psyche", "arrivalTime": "2024-01-10T08:00Z" }, { "isGlancingBlow": true, "isMinorImpact": false, "location": "Solar Orbiter", "arrivalTime": "2024-01-09T08:00Z" }], "cmeIDs": ["2024-01-06T08:12:00-CME-001"] }] }], "linkedEvents": [{ "activityID": "2024-01-06T05:28:00-FLR-001" }, { "activityID": "2024-01-06T05:41:00-FLR-001" }], "sentNotifications": [{ "messageID": "20240106-AL-001", "messageIssueTime": "2024-01-06T23:55Z", "messageURL": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/Alert/28515/1" }] }];

// First 2 GST entries shown immediately; last one arrives after 2s
const GST_INITIAL: GST[] = [{ "gstID": "2026-03-13T21:00:00-GST-001", "startTime": "2026-03-13T21:00Z", "allKpIndex": [{ "observedTime": "2026-03-14T00:00Z", "kpIndex": 5.67, "source": "NOAA" }, { "observedTime": "2026-03-14T03:00Z", "kpIndex": 5.67, "source": "NOAA" }, { "observedTime": "2026-03-14T06:00Z", "kpIndex": 6.0, "source": "NOAA" }], "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/45068/-1", "linkedEvents": [{ "activityID": "2026-03-13T07:06:00-IPS-001" }, { "activityID": "2026-03-13T08:08:00-HSS-001" }], "submissionTime": "2026-03-14T00:03Z", "versionId": 1, "sentNotifications": [{ "messageID": "20260314-AL-001", "messageIssueTime": "2026-03-14T00:03Z", "messageURL": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/Alert/45069/1" }] }, { "gstID": "2026-03-20T18:00:00-GST-001", "startTime": "2026-03-20T18:00Z", "allKpIndex": [{ "observedTime": "2026-03-20T21:00Z", "kpIndex": 5.67, "source": "NOAA" }, { "observedTime": "2026-03-21T00:00Z", "kpIndex": 6.67, "source": "NOAA" }, { "observedTime": "2026-03-21T03:00Z", "kpIndex": 7.0, "source": "NOAA" }, { "observedTime": "2026-03-21T06:00Z", "kpIndex": 6.0, "source": "NOAA" }], "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/45201/-1", "linkedEvents": [{ "activityID": "2026-03-18T09:23:00-CME-001" }, { "activityID": "2026-03-20T20:17:00-IPS-001" }], "submissionTime": "2026-03-20T21:03Z", "versionId": 1, "sentNotifications": [{ "messageID": "20260320-AL-003", "messageIssueTime": "2026-03-20T21:03Z", "messageURL": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/Alert/45202/1" }] }];

const GST_LATE: GST = { "gstID": "2026-03-22T09:00:00-GST-001", "startTime": "2026-03-22T09:00Z", "allKpIndex": [{ "observedTime": "2026-03-22T12:00Z", "kpIndex": 6.67, "source": "NOAA" }, { "observedTime": "2026-03-22T15:00Z", "kpIndex": 6.0, "source": "NOAA" }, { "observedTime": "2026-03-22T18:00Z", "kpIndex": 6.67, "source": "NOAA" }, { "observedTime": "2026-03-22T21:00Z", "kpIndex": 6.33, "source": "NOAA" }, { "observedTime": "2026-03-23T00:00Z", "kpIndex": 6.33, "source": "NOAA" }], "link": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/45234/-1", "linkedEvents": [{ "activityID": "2026-03-21T19:13:00-HSS-001" }], "submissionTime": "2026-03-22T12:02Z", "versionId": 1, "sentNotifications": [{ "messageID": "20260322-AL-001", "messageIssueTime": "2026-03-22T12:02Z", "messageURL": "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/Alert/45235/1" }] };

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function maxKp(gst: GST): number {
  return Math.max(...gst.allKpIndex.map(k => k.kpIndex));
}
function kpLevel(kp: number): { label: string; cls: string; g: string } {
  if (kp >= 9) return { label: "Şiddetli Ekstrem", cls: "kp-g5", g: "G5" };
  if (kp >= 8) return { label: "Çok Şiddetli", cls: "kp-g4", g: "G4" };
  if (kp >= 7) return { label: "Güçlü", cls: "kp-g3", g: "G3" };
  if (kp >= 6) return { label: "Orta", cls: "kp-g2", g: "G2" };
  return { label: "Hafif", cls: "kp-g1", g: "G1" };
}
function cmeSpeedColor(speed: number) {
  if (speed >= 800) return "#FF2D55";
  if (speed >= 500) return "#FF6B35";
  if (speed >= 300) return "#FFB347";
  return "#00D4A8";
}
function fmtDT(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

/* ─────────────────────────────────────────────────────────────
   STAR BACKGROUND
───────────────────────────────────────────────────────────── */
function StarField() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; r: number; dur: string; delay: string }[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 1.8 + 0.4,
      dur: (Math.random() * 4 + 2).toFixed(1),
      delay: (Math.random() * 5).toFixed(1),
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {stars.map(s => (
          <circle
            key={s.id}
            cx={`${s.x}%`} cy={`${s.y}%`} r={s.r}
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
   NAVBAR
───────────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 2rem",
      background: scrolled ? "rgba(2,8,24,0.95)" : "rgba(2,8,24,0.6)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,107,53,0.15)",
      transition: "background 0.3s",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: "64px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span style={{ fontSize: "1.5rem" }}>☀️</span>
        <span className="font-heading" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FF6B35", letterSpacing: "0.05em" }}>
          SolarWatch
        </span>
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        {["Panel", "CME Olayları", "GST Uyarıları", "Hakkında"].map(item => (
          <a key={item} href="#" style={{ color: "#8B9AC0", fontSize: "0.85rem", letterSpacing: "0.05em", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF6B35")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8B9AC0")}
          >{item}</a>
        ))}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO
───────────────────────────────────────────────────────────── */
function HeroSection({ latestKp, kpIndex }: { latestKp: number; kpIndex: number }) {
  const { label, g } = kpLevel(latestKp);
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "0 2rem", paddingTop: "64px",
      position: "relative", zIndex: 1
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "3rem", flexWrap: "wrap" }}>
        {/* Text side */}
        <div style={{ flex: "1 1 480px" }} className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <span className="live-dot" />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#FF2D55", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              CANLI İZLEME
            </span>
          </div>
          <h1 className="font-heading" style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "0.02em" }}>
            <span className="gradient-solar">GÜNEŞ FIRTINASI</span>
            <br />
            <span style={{ color: "#E8EAF0" }}>ERKEN UYARI</span>
            <br />
            <span style={{ color: "#E8EAF0" }}>SİSTEMİ</span>
          </h1>
          <p style={{ color: "#8B9AC0", fontSize: "1rem", lineHeight: 1.7, maxWidth: "480px", marginBottom: "2rem" }}>
            Koronel kütle fırlatma (CME) takibi ve jeomanyetik fırtına uyarıları{" "}
            <span style={{ color: "#FFB347" }}>NASA DONKI API</span> ile gerçek zamanlı sunulmaktadır. Dünya'yı koruyun — uzay havasının önünde kalın.
          </p>
          {/* Alert badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.6rem",
            padding: "0.6rem 1.2rem", borderRadius: "50px", border: "1px solid",
            marginBottom: "2.5rem",
            color: latestKp >= 7 ? "#FF2D55" : latestKp >= 6 ? "#FF6B35" : "#FFB347",
            borderColor: latestKp >= 7 ? "rgba(255,45,85,0.5)" : latestKp >= 6 ? "rgba(255,107,53,0.5)" : "rgba(255,179,71,0.5)",
            background: latestKp >= 7 ? "rgba(255,45,85,0.1)" : latestKp >= 6 ? "rgba(255,107,53,0.1)" : "rgba(255,179,71,0.1)",
            fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 700,
          }}>
            <span style={{ animation: "blink 1s ease infinite", display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />
            GÜNCEL UYARI: {g} — {label.toUpperCase()} · Kp {latestKp.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a href="#dashboard" style={{
              padding: "0.75rem 1.75rem", borderRadius: "8px",
              background: "linear-gradient(135deg, #FF6B35, #FF2D55)",
              color: "#fff", fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em",
              boxShadow: "0 0 20px rgba(255,107,53,0.4)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,107,53,0.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(255,107,53,0.4)"; }}
            >CANLI VERİYİ GÖR ↓</a>
            <a href="#info" style={{
              padding: "0.75rem 1.75rem", borderRadius: "8px",
              background: "transparent", border: "1px solid rgba(255,107,53,0.4)",
              color: "#FF6B35", fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.08em",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,107,53,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >NASIL ÇALIŞIR</a>
          </div>
        </div>

        {/* Sun animation — Three.js */}
        <div style={{
          flex: "0 0 auto",
          width: 380,
          height: 380,
          filter: `drop-shadow(0 0 ${40 + kpIndex * 4}px rgba(255,${kpIndex >= 7 ? 45 : kpIndex >= 5 ? 107 : 179},${kpIndex >= 7 ? 85 : 53},${0.35 + kpIndex * 0.03}))`,
          transition: "filter 1s ease",
        }}>
          <SunCanvas kpIndex={kpIndex} />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   STATUS DASHBOARD CARDS
───────────────────────────────────────────────────────────── */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1200;
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
  return <>{target % 1 === 0 ? Math.round(val) : val.toFixed(2)}{suffix}</>;
}

function StatusDashboard({ gstList, cmeList }: { gstList: GST[]; cmeList: CME[] }) {
  const latest = gstList[gstList.length - 1];
  const kp = maxKp(latest);
  const { label, g } = kpLevel(kp);
  const topCme = [...cmeList].sort((a, b) => (b.cmeAnalyses[0]?.speed ?? 0) - (a.cmeAnalyses[0]?.speed ?? 0))[0];
  const topSpeed = topCme?.cmeAnalyses[0]?.speed ?? 0;
  const earthHits = cmeList.filter(c => c.cmeAnalyses.some(a => a.enlilList.some(e => e.isEarthGB))).length;

  const cards = [
    {
      icon: "🌡️",
      title: "Jeomanyetik Fırtına Seviyesi",
      main: `${g} — ${label}`,
      sub: `Kp Endeksi: ${kp.toFixed(2)}`,
      color: kp >= 7 ? "#FF2D55" : kp >= 6 ? "#FF6B35" : "#FFB347",
      detail: `${latest.allKpIndex.length} ölçüm · NOAA`,
    },
    {
      icon: "☀️",
      title: "En Hızlı CME Hızı",
      main: null,
      mainNum: topSpeed,
      mainSuffix: " km/s",
      sub: `Aktivite ID: ${topCme?.activityID.slice(0, 19)}`,
      color: cmeSpeedColor(topSpeed),
      detail: `Toplam ${cmeList.length} CME olayı takip edildi`,
    },
    {
      icon: "🌍",
      title: "Dünya'ya Yönelik Çarpmalar",
      main: null,
      mainNum: earthHits,
      mainSuffix: " olay",
      sub: `Doğrulanmış Dünya-GB CME'leri`,
      color: earthHits > 0 ? "#FF2D55" : "#00D4A8",
      detail: `Toplam ${cmeList.length} CME gözleminden`,
    },
  ];

  return (
    <section id="dashboard" style={{ padding: "5rem 2rem", position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
      <h2 className="font-heading" style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "0.1em", color: "#E8EAF0", marginBottom: "3rem" }}>
        ⚡ GERÇEK ZAMANLI DURUM
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {cards.map((c, i) => (
          <div key={i} className="glass" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${c.color}, transparent)` }} />
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{c.icon}</div>
            <div style={{ color: "#8B9AC0", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{c.title.toUpperCase()}</div>
            <div className="font-heading" style={{ fontSize: "1.5rem", fontWeight: 800, color: c.color, marginBottom: "0.4rem" }}>
              {c.main ?? <><CountUp target={c.mainNum!} />{c.mainSuffix}</>}
            </div>
            <div style={{ color: "#8B9AC0", fontSize: "0.8rem", marginBottom: "0.5rem" }}>{c.sub}</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(139,154,192,0.6)", borderTop: "1px solid rgba(255,107,53,0.1)", paddingTop: "0.5rem" }}>{c.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   CME TABLE
───────────────────────────────────────────────────────────── */
function CmeTable({ cmeList }: { cmeList: CME[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <section style={{ padding: "2rem 2rem 5rem", position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
      <h2 className="font-heading" style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.1em", color: "#E8EAF0", marginBottom: "2rem" }}>
        🌪️ KORONEL KÜTLE FIRLATMA OLAYLARI
        <span style={{ fontSize: "0.7rem", color: "#8B9AC0", marginLeft: "1rem", fontWeight: 400, letterSpacing: "0.05em" }}>
          NASA M2M KATALOG · {cmeList.length} kayıt
        </span>
      </h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,107,53,0.2)" }}>
              {["Aktivite ID", "Başlangıç Zamanı", "Hız (km/s)", "Tür", "Yarı Açı", "Aletler", "Dünya-GB", ""].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", color: "#8B9AC0", fontFamily: "var(--font-heading)", fontSize: "0.65rem", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cmeList.map(cme => {
              const best = cme.cmeAnalyses.find(a => a.isMostAccurate) ?? cme.cmeAnalyses[0];
              const earthGB = best?.enlilList.some(e => e.isEarthGB) ?? false;
              const speed = best?.speed ?? 0;
              const isOpen = expanded === cme.activityID;
              return [
                <tr key={cme.activityID}
                  onClick={() => setExpanded(isOpen ? null : cme.activityID)}
                  style={{
                    borderBottom: "1px solid rgba(255,107,53,0.08)",
                    cursor: "pointer", transition: "background 0.2s",
                    background: isOpen ? "rgba(255,107,53,0.05)" : "transparent",
                  }}
                  onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(255,107,53,0.04)"; }}
                  onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "0.8rem 1rem", color: "#E8EAF0", fontFamily: "var(--font-heading)", fontSize: "0.7rem" }}>{cme.activityID.slice(0, 23)}</td>
                  <td style={{ padding: "0.8rem 1rem", color: "#8B9AC0", whiteSpace: "nowrap" }}>{fmtDate(cme.startTime)}</td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <span style={{ color: cmeSpeedColor(speed), fontWeight: 700 }}>{speed}</span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 700,
                      background: best?.type === "C" ? "rgba(255,45,85,0.15)" : "rgba(255,179,71,0.15)",
                      color: best?.type === "C" ? "#FF2D55" : "#FFB347",
                      border: `1px solid ${best?.type === "C" ? "rgba(255,45,85,0.3)" : "rgba(255,179,71,0.3)"}`,
                    }}>{best?.type ?? "—"}</span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem", color: "#8B9AC0" }}>{best?.halfAngle ?? "—"}°</td>
                  <td style={{ padding: "0.8rem 1rem", color: "#8B9AC0", fontSize: "0.72rem" }}>{cme.instruments.map(i => i.displayName.split(": ")[0]).join(", ")}</td>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <span style={{ color: earthGB ? "#FF2D55" : "#00D4A8", fontWeight: 700, fontSize: "0.7rem" }}>
                      {earthGB ? "⚠ EVET" : "HAYIR"}
                    </span>
                  </td>
                  <td style={{ padding: "0.8rem 1rem", color: "#8B9AC0" }}>{isOpen ? "▲" : "▼"}</td>
                </tr>,
                isOpen && (
                  <tr key={`${cme.activityID}-detail`}>
                    <td colSpan={8} style={{ padding: "0 1rem 1rem", background: "rgba(255,107,53,0.04)" }}>
                      <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,107,53,0.15)", marginTop: "0.25rem" }}>
                        <p style={{ color: "#8B9AC0", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: "1rem" }}><strong style={{ color: "#FFB347" }}>Not:</strong> {cme.note}</p>
                        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                          {best && (<>
                            <InfoChip label="Enlem" value={best.latitude !== null ? `${best.latitude}°` : "—"} />
                            <InfoChip label="Boylam" value={best.longitude !== null ? `${best.longitude}°` : "—"} />
                            <InfoChip label="Teknik" value={best.measurementTechnique} />
                            <InfoChip label="Görüntü Türü" value={best.imageType} />
                          </>)}
                          {cme.linkedEvents && <InfoChip label="Bağlantılı Olaylar" value={cme.linkedEvents.map(e => e.activityID.slice(11)).join(", ")} />}
                          {best?.enlilList.map((e, i) => e.impactList?.map((imp, j) => (
                            <InfoChip key={`${i}-${j}`} label={`Çarpma: ${imp.location}`} value={`~${fmtDate(imp.arrivalTime)}${imp.isGlancingBlow ? " (yüzeysel)" : ""}`} danger />
                          )))}
                        </div>
                        <a href={cme.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.75rem", color: "#FF6B35", fontSize: "0.75rem", textDecoration: "none" }}>
                          🔗 DONKI'de Görüntüle →
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InfoChip({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ fontSize: "0.72rem" }}>
      <span style={{ color: "#8B9AC0", marginRight: "0.3rem" }}>{label}:</span>
      <span style={{ color: danger ? "#FF6B35" : "#E8EAF0" }}>{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GST PANEL
───────────────────────────────────────────────────────────── */
function GstPanel({ gstList, newEntryId }: { gstList: GST[]; newEntryId: string | null }) {
  return (
    <section style={{ padding: "2rem 2rem 5rem", position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
      <h2 className="font-heading" style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.1em", color: "#E8EAF0", marginBottom: "2rem" }}>
        🧲 JEOMANYETİK FIRTINA OLAYLARI
        <span style={{ fontSize: "0.7rem", color: "#8B9AC0", marginLeft: "1rem", fontWeight: 400, letterSpacing: "0.05em" }}>
          NASA NOAA · {gstList.length} kayıt
        </span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {gstList.map(gst => {
          const kp = maxKp(gst);
          const { label, cls, g } = kpLevel(kp);
          const isNew = gst.gstID === newEntryId;
          return (
            <div key={gst.gstID} className={`glass ${isNew ? "new-entry" : ""}`} style={{ padding: "1.5rem 2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    {isNew && <span className="live-dot" />}
                    <span className="font-heading" style={{ color: "#E8EAF0", fontSize: "0.85rem", fontWeight: 700 }}>
                      GST · {fmtDT(gst.startTime)}
                    </span>
                    {isNew && (
                      <span style={{
                        fontSize: "0.65rem", fontFamily: "var(--font-heading)", fontWeight: 700,
                        padding: "0.2rem 0.5rem", borderRadius: "4px",
                        background: "rgba(255,45,85,0.2)", color: "#FF2D55", border: "1px solid rgba(255,45,85,0.4)",
                        animation: "blink 1.5s ease infinite",
                      }}>YENİ · API GÜNCELLEMESİ</span>
                    )}
                  </div>
                  <div style={{ color: "#8B9AC0", fontSize: "0.75rem" }}>
                    ID: <span style={{ color: "#FFB347" }}>{gst.gstID}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div className={cls} style={{ padding: "0.4rem 0.9rem", borderRadius: "6px", border: "1px solid", fontFamily: "var(--font-heading)", fontSize: "0.8rem", fontWeight: 800 }}>
                    {g} — {label} · Kp {kp.toFixed(2)}
                  </div>
                  <a href={gst.link} target="_blank" rel="noopener noreferrer" style={{ color: "#FF6B35", fontSize: "0.75rem", textDecoration: "none" }}>🔗 DONKI</a>
                </div>
              </div>

              {/* Kp index timeline */}
              <div style={{ marginTop: "1.25rem" }}>
                <div style={{ fontSize: "0.7rem", color: "#8B9AC0", marginBottom: "0.6rem", letterSpacing: "0.08em" }}>KP ENDEKSİ ÖLÇÜMLERI</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {gst.allKpIndex.map((k, i) => {
                    const { cls: kc } = kpLevel(k.kpIndex);
                    return (
                      <div key={i} className={kc} style={{
                        padding: "0.35rem 0.75rem", borderRadius: "6px", border: "1px solid",
                        fontSize: "0.72rem",
                      }}>
                        <span style={{ opacity: 0.7, marginRight: "0.4rem" }}>
                          {new Date(k.observedTime).toISOString().slice(11, 16)}Z
                        </span>
                        <strong>Kp {k.kpIndex.toFixed(2)}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linked events */}
              {gst.linkedEvents.length > 0 && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {gst.linkedEvents.map((e, i) => (
                    <span key={i} style={{
                      fontSize: "0.68rem", padding: "0.2rem 0.5rem", borderRadius: "4px",
                      background: "rgba(255,179,71,0.1)", color: "#FFB347", border: "1px solid rgba(255,179,71,0.25)"
                    }}>🔗 {e.activityID}</span>
                  ))}
                </div>
              )}

              {/* Notifications */}
              <div style={{ marginTop: "0.75rem", fontSize: "0.7rem", color: "#8B9AC0" }}>
                📨 {gst.sentNotifications.length} bildirim gönderildi
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   INFO CARDS
───────────────────────────────────────────────────────────── */
function InfoCards() {
  const cards = [
    {
      icon: "☀️",
      title: "CME Nedir?",
      body: "Koronel Kütle Fırlatma (CME), Güneş'in koronasından fırlayan devasa bir plazma ve manyetik alan patlamasıdır. Dünya'ya yöneldiklerinde jeomanyetik fırtınalar tetikleyebilir, uyduları sekteye uğratabilir ve geniş alanlarda aurora oluşturabilirler.",
    },
    {
      icon: "🛡️",
      title: "Kendinizi Koruyun",
      body: "G4–G5 olaylarında yüksek irtifa uçuşlarından kaçının. Kritik verilerinizi yedekleyin. Elektroniklerinizi aşırı gerilime karşı koruyun. Elektrik şebekesi operatörleri koruyucu protokolleri önceden devreye almalıdır.",
    },
    {
      icon: "🔭",
      title: "Veri Kaynakları",
      body: "Bu sistem NASA'nın DONKI (Bildirim, Bilgi ve Enformasyon Veritabanı) ve NOAA SWPC gerçek zamanlı akışlarını kullanmaktadır. Tüm veriler kamuya açıktır.",
      link: "https://api.nasa.gov",
    },
  ];
  return (
    <section id="info" style={{ padding: "2rem 2rem 6rem", position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
      <h2 className="font-heading" style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "0.1em", color: "#E8EAF0", marginBottom: "2rem" }}>
        📚 BİLGİ BANKASI
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {cards.map((c, i) => (
          <div key={i} className="glass" style={{ padding: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{c.icon}</div>
            <h3 className="font-heading" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#FF6B35", marginBottom: "0.8rem", letterSpacing: "0.05em" }}>{c.title.toUpperCase()}</h3>
            <p style={{ color: "#8B9AC0", fontSize: "0.83rem", lineHeight: 1.7 }}>{c.body}</p>
            {c.link && (
              <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", color: "#FF6B35", fontSize: "0.75rem", textDecoration: "none" }}>
                → NASA Açık Veri Portalı
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────────────────────── */
function Toast({ visible, gst }: { visible: boolean; gst: GST }) {
  const kp = maxKp(gst);
  const { label, g } = kpLevel(kp);
  if (!visible) return null;
  return (
    <div className="toast-anim" style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200,
      padding: "1rem 1.5rem", borderRadius: "12px",
      background: "rgba(2,8,24,0.97)", border: "1px solid rgba(255,45,85,0.5)",
      boxShadow: "0 0 30px rgba(255,45,85,0.3)",
      maxWidth: "340px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
        <span className="live-dot" />
        <span className="font-heading" style={{ color: "#FF2D55", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em" }}>
          YENİ API VERİSİ ALINDI
        </span>
      </div>
      <div style={{ color: "#E8EAF0", fontSize: "0.82rem", fontWeight: 600 }}>
        GST Olayı — {g} {label} Fırtınası
      </div>
      <div style={{ color: "#8B9AC0", fontSize: "0.73rem", marginTop: "0.2rem" }}>
        {fmtDT(gst.startTime)} · Max Kp {kp.toFixed(2)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      position: "relative", zIndex: 1,
      borderTop: "1px solid rgba(255,107,53,0.1)",
      padding: "2rem",
      display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      color: "#8B9AC0", fontSize: "0.78rem",
    }}>
      <div>
        <span className="font-heading" style={{ color: "#FF6B35" }}>☀️ SolarWatch</span>
        {" "} — NASA Space Apps Hackathon için geliştirildi
      </div>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <a href="https://api.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#8B9AC0", textDecoration: "none" }}>NASA Açık Veri</a>
        <a href="https://donki.nasa.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#8B9AC0", textDecoration: "none" }}>DONKI API</a>
        <a href="https://www.noaa.gov/space-weather" target="_blank" rel="noopener noreferrer" style={{ color: "#8B9AC0", textDecoration: "none" }}>NOAA SWPC</a>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────────────────────── */
export default function Home() {
  const [gstList, setGstList] = useState<GST[]>(GST_INITIAL);
  const [newEntryId, setNewEntryId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGstList(prev => [...prev, GST_LATE]);
      setNewEntryId(GST_LATE.gstID);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 7000);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const latestKp = maxKp(gstList[gstList.length - 1]);

  return (
    <>
      <StarField />
      <Navbar />
      <main style={{ position: "relative", zIndex: 1 }}>
        <HeroSection latestKp={latestKp} kpIndex={latestKp} />
        <StatusDashboard gstList={gstList} cmeList={CME_DATA} />
        <CmeTable cmeList={CME_DATA} />
        <GstPanel gstList={gstList} newEntryId={newEntryId} />
        <InfoCards />
      </main>
      <Footer />
      <Toast visible={toastVisible} gst={GST_LATE} />
    </>
  );
}
