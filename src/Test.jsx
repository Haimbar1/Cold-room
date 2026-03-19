import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Settings, Thermometer, Snowflake, DoorOpen, Brain, Send, Copy, Check, ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// ─── Markdown renderer ───────────────────────────────────────────────────────
function Markdown({ text, isRtl }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  function parseInline(str) {
    // bold **text**, italic *text*, inline code `code`
    const parts = [];
    let rest = str;
    const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
    let last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(str)) !== null) {
      if (m.index > last) parts.push(str.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index} style={{ fontWeight: 700 }}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index} style={{ fontStyle: "italic" }}>{m[3]}</em>);
      else if (m[4]) parts.push(<code key={m.index} style={{ background: "#eef2f8", borderRadius: 3, padding: "1px 5px", fontFamily: "monospace", fontSize: "0.9em" }}>{m[4]}</code>);
      last = m.index + m[0].length;
    }
    if (last < str.length) parts.push(str.slice(last));
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
  }

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { elements.push(<div key={i} style={{ height: 6 }} />); i++; continue; }

    // H3 ###
    if (line.startsWith("### ")) {
      elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#1a3a7a", marginTop: 10, marginBottom: 3, borderBottom: "1px solid #d0dcea", paddingBottom: 3 }}>{parseInline(line.slice(4))}</div>);
      i++; continue;
    }
    // H2 ##
    if (line.startsWith("## ")) {
      elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 15, color: "#1a3a7a", marginTop: 12, marginBottom: 4 }}>{parseInline(line.slice(3))}</div>);
      i++; continue;
    }
    // H1 #
    if (line.startsWith("# ")) {
      elements.push(<div key={i} style={{ fontWeight: 800, fontSize: 16, color: "#0a2060", marginTop: 12, marginBottom: 4 }}>{parseInline(line.slice(2))}</div>);
      i++; continue;
    }
    // Bullet list — *, -, •
    if (/^[\*\-•]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-•]\s/.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: 3, paddingInlineStart: 4 }}>{parseInline(lines[i].replace(/^[\*\-•]\s/, ""))}</li>);
        i++;
      }
      elements.push(<ul key={"ul" + i} style={{ margin: "4px 0", paddingInlineStart: 20, listStyleType: "disc" }}>{items}</ul>);
      continue;
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={i} style={{ marginBottom: 3, paddingInlineStart: 4 }}>{parseInline(lines[i].replace(/^\d+\.\s/, ""))}</li>);
        i++;
      }
      elements.push(<ol key={"ol" + i} style={{ margin: "4px 0", paddingInlineStart: 22 }}>{items}</ol>);
      continue;
    }
    // Markdown table  (lines containing |)
    if (line.includes("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Skip separator rows (|---|---|)
      const dataRows = tableLines.filter(l => !/^\s*\|?\s*[-:]+\s*\|/.test(l));
      const isHeader = tableLines.length > 1 && /^\s*\|?\s*[-:]+\s*\|/.test(tableLines[1]);
      elements.push(
        <div key={"tbl" + i} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <tbody>
              {dataRows.map((row, ri) => {
                const cells = row.split("|").map(c => c.trim()).filter((c, ci, arr) => ci > 0 && ci < arr.length - 1 || c !== "");
                const isHdr = isHeader && ri === 0;
                return (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "#f8fafd" : "#fff" }}>
                    {cells.map((cell, ci) => {
                      const Tag = isHdr ? "th" : "td";
                      return <Tag key={ci} style={{ border: "1px solid #d0dcea", padding: "5px 10px", textAlign: "left", fontWeight: isHdr ? 700 : 400, color: isHdr ? "#1a3a7a" : "#2a3a50", background: isHdr ? "#eef3fb" : "transparent", whiteSpace: "nowrap" }}>{parseInline(cell)}</Tag>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    // Normal paragraph
    elements.push(<p key={i} style={{ margin: "2px 0", lineHeight: 1.7 }}>{parseInline(line)}</p>);
    i++;
  }
  return <div style={{ direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>{elements}</div>;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  pt: {
    appName: "Monitor de Câmara Fria",
    appSub: "Sistema de monitoramento e análise de câmaras frigoríficas",
    tabMonitor: "🌡 Monitoramento",
    tabSettings: "⚙ Configurações",
    tabAI: "🤖 Análise IA",
    min: "Mínimo", max: "Máximo", avg: "Média", spread: "Variação",
    loggers: "Sensores", time: "Hora",
    heatmap: "🌈 Mapa de Calor", frame: "Frame",
    speed: "Velocidade:",
    selected: "Sensor selecionado",
    humidity: "Umidade",
    belowRange: "⬇ Abaixo do intervalo", aboveRange: "⬆ Acima do intervalo", inRange: "✓ Dentro do intervalo",
    history: "Histórico",
    roomDims: "🏗 Dimensões da Câmara",
    width: "Largura (m)", depth: "Comprimento (m)", height: "Altura (m)",
    tempRange: "🌡 Faixa de temperatura OK",
    importFiles: "📂 Importar Arquivos",
    posFile: "Arquivo de posições dos sensores (.xlsx)",
    posFileDesc: "Colunas: B = número | C = ID 7 dígitos | D = nome",
    tempFileLabel: "Arquivo de temperaturas (.xlsx)",
    tempFileDesc: 'Sheet por sensor: "Tag<1234567>" — hora | temp°C | umidade%',
    chooseFile: "Escolher arquivo",
    noFile: "Nenhum selecionado",
    loadDemo: "Carregar dados demo",
    demoLoaded: "✓ Dados demo carregados (3 semanas, 8 sensores)",
    placement: "📍 Posicionamento dos Sensores",
    placementDesc: "Arraste os sensores no esquema ou edite as coordenadas na tabela",
    num: "#", id: "ID", name: "Nome",
    xAxis: "X Larg.", yAxis: "Y Comp.", zAxis: "Z Alt.",
    currentStatus: "📊 Status Atual",
    aiExpert: "🤖 Especialista em Câmaras Frias — IA",
    sendBtn: "Enviar",
    askPlaceholder: "Faça uma pergunta sobre a câmara...",
    noMessages: "❄ Faça uma pergunta ou escolha uma sugestão acima",
    analyzing: "⟳ Analisando...",
    door: "Porta", evap: "Evaporador",
    quickQ: [
      "📈 Tendência 7 dias: o tempo de trabalho do compressor aumentou vs. média mensal?",
      "🔍 Deriva de sensor: algum sensor mostra linha reta sem variação? (possível falha)",
      "💧 Vazamento de gás lento: ciclo do compressor ficou mais longo nas últimas semanas?",
      "❄ Evaporador congelado: ventiladores ligados mas temperatura não cai?",
      "🚪 Porta aberta? Temperatura subiu + umidade saltou nos últimos 30 minutos?",
      "⚡ Defrost: ciclo pulando ou frequente demais? (mais de 1×/hora = desperdício)",
      "🔮 Previsão: com a taxa de subida atual, em quanto tempo chegamos ao limite crítico?",
      "🗺 Qual zona é cronicamente mais quente? (comparar média 7 dias por sensor)",
    ],
    roomElements: "Elementos da câmara",
    addDoor: "➕ Porta",
    addEvap: "➕ Evaporador",
    elementList: "Elementos posicionados",
    doorLabel: "Porta",
    evapLabel: "Evaporador",
    deleteEl: "✕",
    locales: "pt-BR",
  },
  en: {
    appName: "Cold Room Monitor",
    appSub: "Cold storage monitoring & analysis system",
    tabMonitor: "🌡 Monitor",
    tabSettings: "⚙ Settings",
    tabAI: "🤖 AI Analysis",
    min: "Min", max: "Max", avg: "Avg", spread: "Spread",
    loggers: "Loggers", time: "Time",
    heatmap: "🌈 Heatmap", frame: "Frame",
    speed: "Speed:",
    selected: "Selected logger",
    humidity: "Humidity",
    belowRange: "⬇ Below range", aboveRange: "⬆ Above range", inRange: "✓ Within range",
    history: "History",
    roomDims: "🏗 Room Dimensions",
    width: "Width (m)", depth: "Length (m)", height: "Height (m)",
    tempRange: "🌡 Normal temperature range",
    importFiles: "📂 Import Files",
    posFile: "Logger positions file (.xlsx)",
    posFileDesc: "Columns: B = number | C = 7-digit ID | D = name",
    tempFileLabel: "Temperature data file (.xlsx)",
    tempFileDesc: 'Sheet per logger: "Tag<1234567>" — time | temp°C | humidity%',
    chooseFile: "Choose file",
    noFile: "None selected",
    loadDemo: "Load demo data",
    demoLoaded: "✓ Demo data loaded (3 weeks, 8 loggers)",
    placement: "📍 Logger Placement",
    placementDesc: "Drag loggers on the schematic or edit coordinates in the table",
    num: "#", id: "ID", name: "Name",
    xAxis: "X Width", yAxis: "Y Length", zAxis: "Z Height",
    currentStatus: "📊 Current Status",
    aiExpert: "🤖 Cold Room Expert — AI",
    sendBtn: "Send",
    askPlaceholder: "Ask a question about the room...",
    noMessages: "❄ Ask a question or choose a suggestion above",
    analyzing: "⟳ Analyzing...",
    door: "Door", evap: "Evaporator",
    quickQ: [
      "📈 7-day trend: is compressor runtime increasing vs. monthly average?",
      "🔍 Sensor drift/failure: any sensor showing a flat line with no variation?",
      "💧 Slow refrigerant leak: has compressor run time grown over past weeks?",
      "❄ Frozen evaporator? Fans running but temperature not dropping?",
      "🚪 Door left open? Temp spike + humidity surge in last 30 minutes?",
      "⚡ Defrost cycle skipping or too frequent? (>1×/hour wastes energy)",
      "🔮 Predictive: at current temp rise rate, when do we hit critical threshold?",
      "🗺 Which zone is chronically warmest? (compare 7-day average per sensor)",
    ],
    roomElements: "Room elements",
    addDoor: "➕ Door",
    addEvap: "➕ Evaporator",
    elementList: "Placed elements",
    doorLabel: "Door",
    evapLabel: "Evaporator",
    deleteEl: "✕",
    locales: "en-US",
  },
  he: {
    appName: "ניטור חדר קירור",
    appSub: "מערכת ניטור וניתוח חדרי קירור",
    tabMonitor: "🌡 ניטור",
    tabSettings: "⚙ הגדרות",
    tabAI: "🤖 ניתוח AI",
    min: "מינימום", max: "מקסימום", avg: "ממוצע", spread: "פיזור",
    loggers: "לוגרים", time: "זמן",
    heatmap: "🌈 מפת חום", frame: "פריים",
    speed: "מהירות:",
    selected: "לוגר נבחר",
    humidity: "לחות",
    belowRange: "⬇ מתחת לטווח", aboveRange: "⬆ מעל לטווח", inRange: "✓ בטווח תקין",
    history: "היסטוריה",
    roomDims: "🏗 מידות חדר",
    width: "רוחב (מ')", depth: "אורך (מ')", height: "גובה (מ')",
    tempRange: "🌡 טווח טמפרטורה תקין",
    importFiles: "📂 ייבוא קבצים",
    posFile: "קובץ מיקום לוגרים (.xlsx)",
    posFileDesc: "עמודות: B = מספר | C = מזהה 7 ספרות | D = שם",
    tempFileLabel: "קובץ נתוני טמפרטורה (.xlsx)",
    tempFileDesc: 'Sheet לכל לוגר: "Tag<1234567>" — זמן | טמפ°C | לחות%',
    chooseFile: "בחר קובץ",
    noFile: "לא נבחר",
    loadDemo: "טען נתוני דמו",
    demoLoaded: "✓ נטענו נתוני דמו (3 שבועות, 8 לוגרים)",
    placement: "📍 מיקום לוגרים",
    placementDesc: "גרור לוגרים על גבי הסכמה, או ערוך קואורדינטות בטבלה",
    num: "#", id: "מזהה", name: "שם",
    xAxis: "X רוחב", yAxis: "Y אורך", zAxis: "Z גובה",
    currentStatus: "📊 סטטוס נוכחי",
    aiExpert: "🤖 מומחה חדרי קירור — AI",
    sendBtn: "שלח",
    askPlaceholder: "שאל שאלה על החדר...",
    noMessages: "❄ שאל שאלה או בחר הצעה למעלה",
    analyzing: "⟳ מנתח...",
    door: "דלת", evap: "מאייד",
    quickQ: [
      "📈 מגמת 7 ימים: זמן עבודת המדחס עלה ביחס לממוצע החודשי?",
      "🔍 תקלת חיישן: יש חיישן עם קו ישר ללא תנודות? (כנראה קפוא/מקולקל)",
      "💧 דליפת גז איטית: מחזור המדחס התארך בשבועות האחרונים?",
      "❄ מאייד קפוא? מאוורר עובד אבל הטמפרטורה לא יורדת?",
      "🚪 הדלת נשארה פתוחה? טמפ' עלתה + לחות קפצה ב-30 דקות האחרונות?",
      "⚡ מחזור הפשרה: מדלג או תכוף מדי? (יותר מפעם לשעה = בזבוז חשמל)",
      "🔮 תחזית: לפי קצב העלייה הנוכחי, תוך כמה זמן נגיע לסף קריטי?",
      "🗺 איזה אזור חם כרונית? (השווה ממוצע 7 ימים לכל חיישן)",
    ],
    roomElements: "אלמנטים בחדר",
    addDoor: "➕ דלת",
    addEvap: "➕ מאייד",
    elementList: "אלמנטים ממוקמים",
    doorLabel: "דלת",
    evapLabel: "מאייד",
    deleteEl: "✕",
    locales: "he-IL",
  },
};

// ─── XLSX loader ──────────────────────────────────────────────────────────────
function loadXLSX() {
  return new Promise(resolve => {
    if (window.XLSX) return resolve(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve(window.XLSX);
    document.head.appendChild(s);
  });
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_LOGGERS = [
  { id: "7212048", name: "Porta embalagem-Parede",           x: 0.05, y: 0.5,  z: 0.3 },
  { id: "7212033", name: "Prateleira P-Centro",              x: 0.5,  y: 0.5,  z: 0.5 },
  { id: "7211964", name: "Corredor 13-Col meio",             x: 0.7,  y: 0.3,  z: 0.4 },
  { id: "7212047", name: "Corredor 8-Parede final",          x: 0.9,  y: 0.8,  z: 0.2 },
  { id: "8162411", name: "Corredor 15-Porta embalagem",      x: 0.15, y: 0.85, z: 0.7 },
  { id: "8162491", name: "Corredor 15-Proximo radio",        x: 0.35, y: 0.9,  z: 0.6 },
  { id: "8121400", name: "Corredor 3 parede fundo",          x: 0.85, y: 0.15, z: 0.5 },
  { id: "7210001", name: "Evaporador teto centro",           x: 0.5,  y: 0.2,  z: 0.95 },
];
const DEMO_ELEMENTS = [
  { id: "el1", type: "door", label: "Porta Principal", x: 0.05, y: 0.5 },
  { id: "el2", type: "evap", label: "Evaporador",      x: 0.5,  y: 0.1 },
];

function genDemo(loggers) {
  const data = {}; const start = new Date("2026-02-24T15:48:00").getTime();
  const steps = 21 * 24 * 4;
  loggers.forEach((lg, li) => {
    data[lg.id] = [];
    const baseT = 17.5 + (lg.z - 0.5) * 1.5 + (lg.y - 0.5) * 0.8; const baseH = 77 + li * 0.5;
    for (let i = 0; i < steps; i++) {
      const ts = new Date(start + i * 15 * 60000);
      const cycle = Math.sin((i % 96) / 96 * Math.PI * 2) * 0.6;
      const noise = Math.sin(i * 0.37 + li * 1.3) * 0.4 + Math.sin(i * 1.1 + li * 0.7) * 0.3;
      const day = Math.floor(i / 96);
      const bump = (day >= 10 && day <= 12 && (li === 0 || li === 4)) ? 2.5 + Math.sin(i * 0.2) * 0.8 : 0;
      data[lg.id].push({ ts, temp: parseFloat((baseT + cycle + noise + bump).toFixed(2)), hum: parseFloat((baseH + Math.sin(i * 0.15 + li) * 3).toFixed(1)) });
    }
  });
  return data;
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function tColor(t, lo, hi, alpha) {
  let r, g, b;
  if (t < lo) { const f = Math.max(0, Math.min(1, (t - (lo - 8)) / 8)); r = Math.round(f * 0); g = Math.round(80 + f * 100); b = Math.round(200 + f * 55); }
  else if (t > hi) { const f = Math.min(1, (t - hi) / 4); r = Math.round(200 + f * 55); g = Math.round(120 - f * 100); b = Math.round(20); }
  else { const f = (t - lo) / (hi - lo); r = Math.round(30 + f * 180); g = Math.round(180 - f * 40); b = Math.round(80 - f * 50); }
  return alpha != null ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}
function tArr(t, lo, hi) {
  if (t < lo) { const f = Math.max(0, Math.min(1, (t - (lo - 8)) / 8)); return [0, Math.round(80 + f * 100), Math.round(200 + f * 55)]; }
  if (t > hi) { const f = Math.min(1, (t - hi) / 4); return [Math.round(200 + f * 55), Math.round(120 - f * 100), 20]; }
  const f = (t - lo) / (hi - lo); return [Math.round(30 + f * 180), Math.round(180 - f * 40), Math.round(80 - f * 50)];
}

// ─── Heatmap canvas ───────────────────────────────────────────────────────────
function Heatmap({ loggers, elements, timeData, frameIdx, lo, hi, onClick, sel, interp }) {
  const ref = useRef(null); const W = 700, H = 380;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); ctx.clearRect(0, 0, W, H);
    // Light background
    ctx.fillStyle = "#f0f4f8"; ctx.fillRect(0, 0, W, H);
    // Room border
    ctx.strokeStyle = "#b0c0d8"; ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    // Grid
    ctx.strokeStyle = "rgba(160,180,210,0.3)"; ctx.lineWidth = 1;
    for (let i = 1; i < 10; i++) { ctx.beginPath(); ctx.moveTo(i * W / 10, 0); ctx.lineTo(i * W / 10, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * H / 10); ctx.lineTo(W, i * H / 10); ctx.stroke(); }
    if (!timeData || !loggers.length || !Object.keys(timeData).length) return;
    const pts = loggers.map(lg => { const s = timeData[lg.id]; const r = s?.[Math.min(frameIdx, (s?.length ?? 1) - 1)]; return { ...lg, px: lg.x * W, py: (1 - lg.y) * H, temp: r?.temp ?? lo, hum: r?.hum ?? 80 }; });
    if (interp && pts.length > 1) {
      const img = ctx.createImageData(W, H);
      for (let py = 0; py < H; py += 3) for (let px = 0; px < W; px += 3) {
        let ws = 0, ts2 = 0;
        pts.forEach(p => { const d2 = (px - p.px) ** 2 + (py - p.py) ** 2 + 300; const w = 1 / d2; ws += w; ts2 += w * p.temp; });
        const [r, g, b] = tArr(ts2 / ws, lo, hi);
        for (let sy = 0; sy < 3 && py + sy < H; sy++) for (let sx = 0; sx < 3 && px + sx < W; sx++) { const idx = ((py + sy) * W + (px + sx)) * 4; img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 70; }
      }
      ctx.putImageData(img, 0, 0);
    }
    // Elements (doors, evaps)
    (elements || []).forEach(el => {
      const ex = el.x * W, ey = (1 - el.y) * H;
      if (el.type === "door") {
        ctx.fillStyle = "#7a5c3a"; ctx.fillRect(ex - 10, ey - 4, 20, 8);
        ctx.fillStyle = "#5a3e26"; ctx.fillText("🚪", ex - 8, ey + 4);
      } else {
        ctx.beginPath(); ctx.arc(ex, ey, 10, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(80,120,200,0.25)"; ctx.fill();
        ctx.strokeStyle = "#5080c0"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#3060a0"; ctx.font = "9px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("❄", ex, ey);
      }
    });
    // Logger dots
    pts.forEach(p => {
      const col = tColor(p.temp, lo, hi); const isSel = sel?.id === p.id; const rad = isSel ? 19 : 14;
      const grd = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, rad * 2.5);
      grd.addColorStop(0, tColor(p.temp, lo, hi, 0.25)); grd.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(p.px, p.py, rad * 2.5, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
      ctx.beginPath(); ctx.arc(p.px, p.py, rad, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = isSel ? "#1a1a2e" : "rgba(255,255,255,0.8)"; ctx.lineWidth = isSel ? 2.5 : 1.5; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = `bold ${isSel ? 12 : 10}px monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(p.temp.toFixed(1) + "°", p.px, p.py);
      ctx.font = "8px monospace"; ctx.fillStyle = "#444"; ctx.fillText(p.id, p.px, p.py + rad + 10);
    });
  }, [loggers, elements, timeData, frameIdx, lo, hi, interp, sel]);

  const handleClick = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width), my = (e.clientY - rect.top) * (H / rect.height);
    let best = null, bestD = 30;
    loggers.forEach(lg => { const d = Math.hypot(lg.x * W - mx, (1 - lg.y) * H - my); if (d < bestD) { bestD = d; best = lg; } });
    onClick(best);
  }, [loggers, onClick]);

  return <canvas ref={ref} width={W} height={H} onClick={handleClick}
    style={{ width: "100%", height: "auto", cursor: "crosshair", borderRadius: 10, border: "1.5px solid #c0cfe0", display: "block", boxShadow: "0 2px 12px rgba(100,130,180,0.15)" }} />;
}

// ─── Mini chart ───────────────────────────────────────────────────────────────
function MiniChart({ series, lo, hi }) {
  if (!series?.length) return null;
  const W = 200, H = 70, P = 22;
  const temps = series.map(r => r.temp);
  const mn = Math.min(...temps) - 0.3, mx = Math.max(...temps) + 0.3;
  const tx = i => P + (i / (series.length - 1)) * (W - P * 2);
  const ty = t => H - P / 2 - ((t - mn) / (mx - mn)) * (H - P);
  const path = series.map((r, i) => `${i ? "L" : "M"}${tx(i).toFixed(1)},${ty(r.temp).toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", background: "#f5f8fc", borderRadius: 6 }}>
      <rect x={P} y={Math.min(ty(hi), ty(lo))} width={W - P * 2} height={Math.abs(ty(lo) - ty(hi))} fill="rgba(60,180,100,0.12)" />
      <line x1={P} y1={ty(hi)} x2={W - P} y2={ty(hi)} stroke="#5cb85c" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={P} y1={ty(lo)} x2={W - P} y2={ty(lo)} stroke="#5cb85c" strokeWidth={1} strokeDasharray="4 3" />
      <path d={path} fill="none" stroke="#2060c0" strokeWidth={1.8} />
      {[mn, mx].map((v, i) => <text key={i} x={P - 3} y={ty(v)} fill="#7090b0" fontSize={7} textAnchor="end" dominantBaseline="middle">{v.toFixed(1)}°</text>)}
    </svg>
  );
}

// ─── Logger placer ────────────────────────────────────────────────────────────
function Placer({ loggers, setLoggers, elements, setElements, room, lang }) {
  const t = T[lang]; const [drag, setDrag] = useState(null);   // { kind:"logger"|"element", idx }
  const [editI, setEditI] = useState(null); const [ev, setEv] = useState({ x: "", y: "", z: "" });
  const svgRef = useRef(null); const W = 560, H = 280;
  function onMove(e) {
    if (drag == null) return;
    const rect = svgRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    if (drag.kind === "logger") {
      setLoggers(prev => prev.map((lg, i) => i === drag.idx ? { ...lg, x: nx, y: ny } : lg));
    } else {
      setElements(prev => prev.map((el, i) => i === drag.idx ? { ...el, x: nx, y: ny } : el));
    }
  }
  function applyEdit() {
    setLoggers(prev => prev.map((lg, i) => i !== editI ? lg : { ...lg, x: Math.max(0, Math.min(1, parseFloat(ev.x) / room.w || lg.x)), y: Math.max(0, Math.min(1, parseFloat(ev.y) / room.d || lg.y)), z: Math.max(0, Math.min(1, parseFloat(ev.z) / room.h || lg.z)) }));
    setEditI(null);
  }
  function addElement(type) {
    const id = "el" + Date.now();
    setElements(prev => [...prev, { id, type, label: type === "door" ? t.doorLabel : t.evapLabel, x: 0.5, y: 0.5 }]);
  }
  const isRtl = lang === "he";
  const thStyle = { padding: "5px 8px", textAlign: isRtl ? "right" : "left", borderBottom: "1px solid #dde5f0", color: "#7090b0", fontSize: 11, fontWeight: 600 };
  const tdStyle = { padding: "4px 8px", fontSize: 12 };
  const inpS = { width: 55, background: "#fff", border: "1px solid #90b0d0", color: "#1a2a4a", borderRadius: 4, padding: "2px 6px", fontSize: 12 };

  return (
    <div style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <p style={{ color: "#7090b0", fontSize: 12, marginBottom: 8 }}>{t.placementDesc}</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={() => addElement("door")} style={{ background: "#fff3e0", border: "1px solid #f0a060", color: "#c06020", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>{t.addDoor}</button>
        <button onClick={() => addElement("evap")} style={{ background: "#e8f0ff", border: "1px solid #80a8e0", color: "#2050a0", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>{t.addEvap}</button>
      </div>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ background: "#f0f5fb", borderRadius: 8, border: "1.5px solid #c8d8ea", cursor: drag ? "grabbing" : "default", userSelect: "none", display: "block" }}
        onMouseMove={onMove} onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}>
        <rect x={2} y={2} width={W - 4} height={H - 4} fill="none" stroke="#90b0d0" strokeWidth={2} strokeDasharray="8 4" />
        {Array.from({ length: 10 }).map((_, i) => <g key={i}>
          <line x1={i * W / 10} y1={0} x2={i * W / 10} y2={H} stroke="rgba(100,140,200,0.15)" />
          <line x1={0} y1={i * H / 10} x2={W} y2={i * H / 10} stroke="rgba(100,140,200,0.15)" />
        </g>)}
        <text x={W / 2} y={H - 5} textAnchor="middle" fill="#90a8c0" fontSize={10}>{t.depth} ({room.d}m)</text>
        <text x={10} y={H / 2} textAnchor="middle" fill="#90a8c0" fontSize={10} transform={`rotate(-90,10,${H / 2})`}>{t.width} ({room.w}m)</text>
        {elements.map((el, ei) => {
          const ex = el.x * W, ey = (1 - el.y) * H;
          const isDraggingThis = drag?.kind === "element" && drag?.idx === ei;
          return <g key={el.id}
            onMouseDown={e => { e.stopPropagation(); setDrag({ kind: "element", idx: ei }); }}
            style={{ cursor: isDraggingThis ? "grabbing" : "grab" }}>
            {el.type === "door"
              ? <rect x={ex - 14} y={ey - 8} width={28} height={16} rx={3} fill="#f0a060" stroke="#c06020" strokeWidth={2} opacity={0.9} />
              : <circle cx={ex} cy={ey} r={13} fill="#cce0ff" stroke="#4080c0" strokeWidth={2} opacity={0.9} />
            }
            <text x={ex} y={ey} textAnchor="middle" dominantBaseline="middle" fontSize={el.type === "door" ? 13 : 12}>{el.type === "door" ? "🚪" : "❄"}</text>
            <text x={ex} y={ey - 20} textAnchor="middle" fill="#333" fontSize={8} fontWeight="600">{el.label}</text>
            {/* Delete X button */}
            <g onMouseDown={e => { e.stopPropagation(); setElements(prev => prev.filter((_, i) => i !== ei)); }} style={{ cursor: "pointer" }}>
              <circle cx={ex + 14} cy={ey - 12} r={7} fill="#e04030" stroke="#fff" strokeWidth={1.5} />
              <text x={ex + 14} y={ey - 12} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#fff" fontWeight="bold">✕</text>
            </g>
          </g>;
        })}
        {loggers.map((lg, i) => {
          const px = lg.x * W, py = (1 - lg.y) * H;
          return <g key={lg.id} onMouseDown={e => { e.stopPropagation(); setDrag({ kind: "logger", idx: i }); }} style={{ cursor: drag?.kind === "logger" && drag?.idx === i ? "grabbing" : "grab" }}>
            <circle cx={px} cy={py} r={14} fill="rgba(60,120,220,0.15)" stroke="#5090e0" strokeWidth={1.5} />
            <circle cx={px} cy={py} r={5} fill="#2060d0" />
            <text x={px} y={py - 18} textAnchor="middle" fill="#2050a0" fontSize={9} fontWeight="600">{lg.id}</text>
          </g>;
        })}
      </svg>
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", direction: isRtl ? "rtl" : "ltr" }}>
          <thead>
            <tr>
              {[t.num, t.id, t.name, `${t.xAxis} (${room.w}m)`, `${t.yAxis} (${room.d}m)`, `${t.zAxis} (${room.h}m)`, ""].map((h, i) => (
                <th key={i} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loggers.map((lg, i) => (
              <tr key={lg.id} style={{ background: i % 2 ? "#fafcff" : "#fff" }}>
                <td style={{ ...tdStyle, color: "#9090b0" }}>{i + 1}</td>
                <td style={{ ...tdStyle, fontFamily: "monospace", color: "#2050a0", fontWeight: 600 }}>{lg.id}</td>
                <td style={{ ...tdStyle, color: "#404060", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{lg.name}</td>
                {editI === i ? (
                  <>
                    {["x", "y", "z"].map(ax => <td key={ax} style={{ ...tdStyle }}><input value={ev[ax]} onChange={e => setEv(v => ({ ...v, [ax]: e.target.value }))} style={inpS} /></td>)}
                    <td style={tdStyle}><button onClick={applyEdit} style={{ background: "#e8fff0", border: "1px solid #5cb85c", color: "#2a8040", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>✓</button></td>
                  </>
                ) : (
                  <>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{(lg.x * room.w).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{(lg.y * room.d).toFixed(2)}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace" }}>{(lg.z * room.h).toFixed(2)}</td>
                    <td style={tdStyle}><button onClick={() => { setEditI(i); setEv({ x: (lg.x * room.w).toFixed(2), y: (lg.y * room.d).toFixed(2), z: (lg.z * room.h).toFixed(2) }); }} style={{ background: "#f0f4ff", border: "1px solid #b0c4e8", color: "#5070b0", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}>✏</button></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── Smart Insights Panel ─────────────────────────────────────────────────────
function SmartInsights({ loggers, elements, timeData, room, tempRange, lang, onInsights }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const isRtl = lang === "he";

  useEffect(() => {
    if (document.getElementById("crm-keyframes")) return;
    const s = document.createElement("style");
    s.id = "crm-keyframes";
    s.textContent = `
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    `;
    document.head.appendChild(s);
  }, []);

  // Build rich statistical context from full time series
  function buildStatsContext() {
    const now = Date.now();
    const day7 = now - 7 * 24 * 3600000;
    const day30 = now - 30 * 24 * 3600000;

    const stats = loggers.map(lg => {
      const series = timeData[lg.id] || [];
      if (!series.length) return null;
      const all = series.map(r => r.temp);
      const recent7 = series.filter(r => new Date(r.ts).getTime() > day7).map(r => r.temp);
      const prev30 = series.filter(r => { const t = new Date(r.ts).getTime(); return t > day30 && t <= day7; }).map(r => r.temp);
      const mean = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : null;
      const variance = arr => { const m = mean(arr); return arr.length ? arr.reduce((a,b)=>a+(b-m)**2,0)/arr.length : 0; };
      // Detect oscillation pattern (proxy for compressor cycling)
      let crossings = 0;
      const mid = mean(all);
      for (let i = 1; i < all.length; i++) if ((all[i-1]-mid)*(all[i]-mid) < 0) crossings++;
      const oscRate = crossings / (all.length || 1);
      // Recent slope (last 48 readings)
      const tail = all.slice(-48);
      const slope = tail.length > 1 ? (tail[tail.length-1] - tail[0]) / tail.length : 0;
      // Time to critical (temp > tempRange.max + 5)
      const critical = tempRange.max + 5;
      const timeToCrit = slope > 0 ? ((critical - (all[all.length-1]||0)) / slope) * 15 : null; // in minutes

      return {
        id: lg.id, name: lg.name, z: lg.z,
        mean7: mean(recent7)?.toFixed(2),
        mean30: mean(prev30)?.toFixed(2),
        variance7: variance(recent7).toFixed(3),
        currentTemp: all[all.length-1]?.toFixed(2),
        maxEver: Math.max(...all).toFixed(2),
        minEver: Math.min(...all).toFixed(2),
        oscRate: oscRate.toFixed(4),
        slope: slope.toFixed(4),
        timeToCritMin: timeToCrit ? Math.round(timeToCrit) : null,
        totalReadings: all.length,
        isFlatLine: variance(recent7) < 0.01,
      };
    }).filter(Boolean);

    const doors = elements.filter(e => e.type === "door").map(e => e.label).join(", ") || "unspecified";
    const langNote = lang === "pt" ? "Respond in Brazilian Portuguese." : lang === "he" ? "Respond in Hebrew." : "Respond in English.";

    const sensorLines = stats.map(s =>
      "• " + s.id + ' "' + s.name + '": now=' + s.currentTemp + "°C | 7d-avg=" + s.mean7 + "° | 30d-avg=" + s.mean30 + "° | 7d-variance=" + s.variance7 + " | slope=" + s.slope + "°/reading | osc-rate=" + s.oscRate + " | flat-line=" + s.isFlatLine + " | time-to-critical=" + (s.timeToCritMin ?? "N/A") + " min"
    ).join("\n");
    return "COLD ROOM STATISTICAL SUMMARY\nRoom: " + room.w + "x" + room.d + "x" + room.h + "m | OK range: " + tempRange.min + "-" + tempRange.max + "C | Doors: " + doors + "\n\nPer-sensor stats:\n" + sensorLines + "\n\n" + langNote;
  }

  async function fetchInsights() {
    setLoading(true); setError(false); setInsights(null);
    const langNote = lang === "pt" ? "Respond in Brazilian Portuguese." : lang === "he" ? "Respond in Hebrew (use RTL-friendly formatting)." : "Respond in English.";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1200,
          system: `You are an industrial cold room AI analyst. Given statistical sensor data, produce exactly 4 insight cards in this JSON format (no markdown, pure JSON array):
[
  { "icon": "🔧", "category": "Predictive Maintenance", "finding": "one sentence observation", "conclusion": "one sentence actionable recommendation", "severity": "ok|warn|critical" },
  { "icon": "🚪", "category": "Door / Operational Efficiency", "finding": "...", "conclusion": "...", "severity": "ok|warn|critical" },
  { "icon": "⏱", "category": "Survival Forecast", "finding": "...", "conclusion": "...", "severity": "ok|warn|critical" },
  { "icon": "⚡", "category": "Defrost / Energy Optimization", "finding": "...", "conclusion": "...", "severity": "ok|warn|critical" }
]
Base insights on the statistical data provided. Be specific with numbers. ${langNote}`,
          messages: [{ role: "user", content: buildStatsContext() }]
        })
      });
      const d = await res.json();
      const raw = d.content?.find(b => b.type === "text")?.text ?? "[]";
      const clean = raw.replace(new RegExp("^```json\\s*|^```\\s*|```\\s*$", "gm"), "").trim();
      const parsed = JSON.parse(clean); setInsights(parsed); if (onInsights) onInsights(parsed);
    } catch(e) { setError(true); }
    setLoading(false);
  }

  useEffect(() => { if (timeData && loggers.length) fetchInsights(); }, [lang]);

  const sevColor = { ok: { bg: "#f0fff4", border: "#6dca8a", icon: "#2a8a50", label: "#2a6a40" }, warn: { bg: "#fffbeb", border: "#f0c040", icon: "#a07010", label: "#806010" }, critical: { bg: "#fff0f0", border: "#e08080", icon: "#c02020", label: "#a01010" } };
  const title = lang === "pt" ? "🤖 SmartInsights — Resumo Inteligente" : lang === "he" ? "🤖 SmartInsights — תובנות חכמות" : "🤖 SmartInsights — Intelligent Summary";
  const refreshLabel = lang === "pt" ? "↻ Atualizar" : lang === "he" ? "↻ רענן" : "↻ Refresh";
  const loadingLabel = lang === "pt" ? "Analisando dados..." : lang === "he" ? "מנתח נתונים..." : "Analyzing data...";

  return (
    <div style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: "#1a3a7a", fontSize: 15, fontWeight: 700 }}>{title}</h3>
        <button onClick={fetchInsights} disabled={loading} style={{ background: "#f0f4ff", border: "1.5px solid #b0c8f0", color: "#3060b0", borderRadius: 7, padding: "5px 14px", cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>{loading ? "..." : refreshLabel}</button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: "#f5f7fb", border: "1.5px solid #e0e8f4", borderRadius: 10, padding: "14px 16px", animation: "pulse 1.5s ease-in-out infinite" }}>
              <div style={{ height: 12, background: "#e0e8f4", borderRadius: 6, width: "40%", marginBottom: 8 }} />
              <div style={{ height: 10, background: "#e8eef8", borderRadius: 6, width: "90%", marginBottom: 6 }} />
              <div style={{ height: 10, background: "#e8eef8", borderRadius: 6, width: "75%" }} />
            </div>
          ))}
          <div style={{ textAlign: "center", color: "#8090b0", fontSize: 12, marginTop: 4 }}>{loadingLabel}</div>
        </div>
      )}

      {error && (
        <div style={{ background: "#fff0f0", border: "1.5px solid #e08080", borderRadius: 10, padding: 16, color: "#a02020", fontSize: 13, textAlign: "center" }}>
          {lang === "pt" ? "Erro ao carregar insights. " : lang === "he" ? "שגיאה בטעינת תובנות. " : "Failed to load insights. "}
          <button onClick={fetchInsights} style={{ background: "none", border: "none", color: "#3060c0", cursor: "pointer", textDecoration: "underline", fontSize: 13 }}>{refreshLabel}</button>
        </div>
      )}

      {insights && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => {
            const s = sevColor[ins.severity] || sevColor.ok;
            return (
              <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{ins.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.label, textTransform: "uppercase", letterSpacing: 0.4 }}>{ins.category}</span>
                  <span style={{ marginInlineStart: "auto", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.border, color: ins.severity === "ok" ? "#fff" : "#fff", opacity: 0.9 }}>
                    {ins.severity === "ok" ? "✓" : ins.severity === "warn" ? "⚠" : "🔴"}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#2a3a50", lineHeight: 1.6, marginBottom: 5 }}>{ins.finding}</div>
                <div style={{ fontSize: 12, color: s.label, fontWeight: 600, lineHeight: 1.5, borderTop: `1px solid ${s.border}`, paddingTop: 6, marginTop: 4 }}>
                  → {ins.conclusion}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          background: "#1a2a4a", color: "#fff", fontSize: 11, fontWeight: 500,
          padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap",
          pointerEvents: "none", zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: "5px solid #1a2a4a",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ loggers, elements, timeData, frameIdx, room, tempRange, lang, sharedInsights }) {
  const t = T[lang];
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const isRtl = lang === "he";

  function mdToHtml(text) {
    if (!text) return "";
    const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const inline = s => esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code style="background:#eef2f8;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:0.9em">$1</code>');
    const lines = text.split("\n");
    let html = "", i = 0;
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) { html += "<br>"; i++; continue; }
      if (l.startsWith("### ")) { html += "<h4 style='margin:10px 0 4px;color:#1a3a7a;font-size:14px'>" + inline(l.slice(4)) + "</h4>"; i++; continue; }
      if (l.startsWith("## "))  { html += "<h3 style='margin:12px 0 4px;color:#1a3a7a;font-size:15px'>" + inline(l.slice(3)) + "</h3>"; i++; continue; }
      if (l.startsWith("# "))   { html += "<h2 style='margin:12px 0 4px;color:#0a2060;font-size:16px'>" + inline(l.slice(2)) + "</h2>"; i++; continue; }
      if (/^[\*\-•]\s/.test(l)) {
        html += "<ul style='margin:4px 0;padding-left:20px'>";
        while (i < lines.length && /^[\*\-•]\s/.test(lines[i])) { html += "<li style='margin-bottom:3px'>" + inline(lines[i].replace(/^[\*\-•]\s/,"")) + "</li>"; i++; }
        html += "</ul>"; continue;
      }
      if (/^\d+\.\s/.test(l)) {
        html += "<ol style='margin:4px 0;padding-left:22px'>";
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) { html += "<li style='margin-bottom:3px'>" + inline(lines[i].replace(/^\d+\.\s/,"")) + "</li>"; i++; }
        html += "</ol>"; continue;
      }
      if (l.includes("|")) {
        const rows = [];
        while (i < lines.length && lines[i].includes("|")) { rows.push(lines[i]); i++; }
        const dataRows = rows.filter(r => !/^\s*\|?\s*[-:]+\s*\|/.test(r));
        html += "<table style='border-collapse:collapse;margin:8px 0;font-size:12px;width:100%'>";
        dataRows.forEach((row, ri) => {
          const cells = row.split("|").map(c=>c.trim()).filter((c,ci,a)=>ci>0&&ci<a.length-1||c!=="");
          html += "<tr style='background:" + (ri%2===0?"#f8fafd":"#fff") + "'>";
          cells.forEach(cell => { html += "<td style='border:1px solid #d0dcea;padding:5px 10px'>" + inline(cell) + "</td>"; });
          html += "</tr>";
        });
        html += "</table>"; continue;
      }
      html += "<p style='margin:3px 0;line-height:1.7'>" + inline(l) + "</p>"; i++;
    }
    return html;
  }

  function buildHtmlEmail() {
    const sevBg = { ok: "#f0fff4", warn: "#fffbeb", critical: "#fff0f0" };
    const sevBorder = { ok: "#6dca8a", warn: "#f0c040", critical: "#e08080" };
    const sevColor = { ok: "#2a6a40", warn: "#806010", critical: "#a01010" };

    let insightsHtml = "";
    if (sharedInsights && sharedInsights.length) {
      insightsHtml = "<div style='margin-bottom:24px'>"
        + "<h2 style='margin:0 0 12px;color:#1a3a7a;font-size:16px;border-bottom:2px solid #d0dcea;padding-bottom:6px'>🤖 SmartInsights</h2>";
      sharedInsights.forEach(ins => {
        const sev = ins.severity || "ok";
        insightsHtml += "<div style='margin-bottom:10px;padding:12px 16px;background:" + (sevBg[sev]||sevBg.ok) + ";border:1.5px solid " + (sevBorder[sev]||sevBorder.ok) + ";border-radius:8px'>"
          + "<div style='font-weight:700;font-size:12px;color:" + (sevColor[sev]||sevColor.ok) + ";text-transform:uppercase;margin-bottom:6px'>" + (ins.icon||"") + " " + (ins.category||"") + "</div>"
          + "<div style='font-size:13px;color:#2a3a50;line-height:1.6;margin-bottom:6px'>" + (ins.finding||"") + "</div>"
          + "<div style='font-size:12px;font-weight:600;color:" + (sevColor[sev]||sevColor.ok) + ";border-top:1px solid " + (sevBorder[sev]||sevBorder.ok) + ";padding-top:6px'>→ " + (ins.conclusion||"") + "</div>"
          + "</div>";
      });
      insightsHtml += "</div>";
    }

    let chatHtml = "<div>"
      + "<h2 style='margin:0 0 12px;color:#1a3a7a;font-size:16px;border-bottom:2px solid #d0dcea;padding-bottom:6px'>💬 " + (lang==="pt"?"Conversa":lang==="he"?"שיחה":"Conversation") + "</h2>";
    msgs.forEach(m => {
      const isUser = m.role === "user";
      chatHtml += "<div style='margin-bottom:14px;display:flex;justify-content:" + (isUser?"flex-end":"flex-start") + "'>"
        + "<div style='max-width:86%;padding:10px 15px;border-radius:12px;font-size:13px;line-height:1.65;background:" + (isUser?"#e8f0ff":"#fff") + ";color:" + (isUser?"#1a3a7a":"#2a3a50") + ";border:1px solid " + (isUser?"#b0c8f0":"#d8e4f0") + "'>"
        + (isUser ? m.content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;") : mdToHtml(m.content))
        + "</div></div>";
    });
    chatHtml += "</div>";

    return "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#f0f4f8;color:#1a2a4a'>"
      + "<div style='background:#1a3a7a;color:#fff;padding:16px 22px;border-radius:10px;margin-bottom:20px'>"
      + "<div style='font-size:20px;font-weight:700'>❄ Cold Room Monitor</div>"
      + "<div style='font-size:12px;opacity:0.75;margin-top:4px'>" + new Date().toLocaleString() + " · " + room.w + "×" + room.d + "×" + room.h + "m · " + tempRange.min + "–" + tempRange.max + "°C</div>"
      + "</div>"
      + "<div style='background:#fff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.08)'>"
      + insightsHtml + chatHtml
      + "</div></body></html>";
  }

  function copyChat() {
    if (!msgs.length) return;
    const html = buildHtmlEmail();
    const finish = () => { setCopied(true); setTimeout(() => setCopied(false), 2500); };
    // Copy as HTML so it pastes richly into email clients
    try {
      const blob = new Blob([html], { type: "text/html" });
      const item = new ClipboardItem({ "text/html": blob });
      navigator.clipboard.write([item]).then(finish).catch(() => fallbackCopy(html, finish));
    } catch(e) {
      fallbackCopy(html, finish);
    }
  }
  function fallbackCopy(html, cb) {
    // Create a temporary contenteditable div, put HTML in it, select and copy
    const div = document.createElement("div");
    div.contentEditable = "true";
    div.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    div.innerHTML = html;
    document.body.appendChild(div);
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(div);
    sel.removeAllRanges();
    sel.addRange(range);
    try { document.execCommand("copy"); cb(); } catch(e) {}
    sel.removeAllRanges();
    document.body.removeChild(div);
  }


  function ctx() {
    const doors = elements.filter(e => e.type === "door").map(e => `${e.label} @ (${(e.x * room.w).toFixed(1)}m, ${(e.y * room.d).toFixed(1)}m)`).join(", ") || "unspecified";
    const evaps = elements.filter(e => e.type === "evap").map(e => `${e.label} @ (${(e.x * room.w).toFixed(1)}m, ${(e.y * room.d).toFixed(1)}m)`).join(", ") || "unspecified";
    const readings = loggers.map(lg => {
      const r = timeData[lg.id]?.[Math.min(frameIdx, (timeData[lg.id]?.length ?? 1) - 1)];
      return `• ${lg.id} "${lg.name}" (h=${(lg.z * room.h).toFixed(1)}m, x=${(lg.x * room.w).toFixed(1)}, y=${(lg.y * room.d).toFixed(1)}): ${r ? `${r.temp}°C, ${r.hum}% RH` : "N/A"}`;
    }).join("\n");
    const langNote = lang === "pt" ? "Responda em português." : lang === "he" ? "ענה בעברית." : "Answer in English.";
    return `Cold room: ${room.w}×${room.d}×${room.h}m | OK range: ${tempRange.min}–${tempRange.max}°C | Doors: ${doors} | Evaporators: ${evaps}\nReadings:\n${readings}\n${langNote}`;
  }

  const systemPromptBase = `You are an industrial cold room and HVAC expert. You analyze temperature and humidity data from dataloggers.
When answering, apply time-based reasoning:
- TRENDS: compare recent 7-day averages vs. the full period average to detect gradual degradation
- SENSOR HEALTH: flag any sensor with near-zero variance (flat line) as potentially failed or frozen
- COMPRESSOR DUTY: estimate duty cycle from temperature oscillation patterns; increasing cycle time = refrigerant loss or insulation failure
- DEFROST DETECTION: repeated temp spikes at regular intervals = defrost cycles; irregular or absent spikes = defrost fault
- DOOR EVENTS: sudden simultaneous temp rise + humidity jump across nearby sensors = door open event
- PREDICTIVE: if temp is rising, extrapolate time-to-critical using current slope
- HOT ZONES: rank sensors by 7-day mean to identify chronic circulation dead spots
Always give: 1) observation from data, 2) probable cause, 3) recommended action.`;

  const systemPrompt = lang === "pt"
    ? systemPromptBase + " Responda em português brasileiro."
    : lang === "he"
    ? systemPromptBase + " ענה בעברית. השתמש במינוח מקצועי."
    : systemPromptBase + " Respond in English.";

  async function send(text) {
    const msg = text ?? inp.trim(); if (!msg) return;
    setInp(""); const h = [...msgs, { role: "user", content: msg }]; setMsgs(h); setBusy(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: systemPrompt + "\n\nRoom data: " + ctx(), messages: h.map(m => ({ role: m.role, content: m.content })) }) });
      const d = await res.json(); const reply = d.content?.find(b => b.type === "text")?.text ?? "Error";
      setMsgs([...h, { role: "assistant", content: reply }]);
    } catch { setMsgs([...h, { role: "assistant", content: "Connection error" }]); }
    setBusy(false);
  }
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [msgs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", direction: isRtl ? "rtl" : "ltr" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {t.quickQ.map((q, i) => (
          <button key={i} onClick={() => send(q)} style={{ background: "#f0f5ff", border: "1px solid #b8ccea", color: "#3060a0", borderRadius: 20, padding: "5px 13px", fontSize: 11, cursor: "pointer", lineHeight: 1.4, textAlign: isRtl ? "right" : "left" }}>{q}</button>
        ))}
      </div>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: 14, background: "#f8fafd", borderRadius: 10, border: "1px solid #d0dcea", minHeight: 220, maxHeight: 360 }}>
        {!msgs.length && <div style={{ color: "#a0b8d0", fontSize: 13, textAlign: "center", marginTop: 60 }}>{t.noMessages}</div>}
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: m.role === "user" ? (isRtl ? "flex-start" : "flex-end") : (isRtl ? "flex-end" : "flex-start") }}>
            <div style={{ maxWidth: "88%", padding: "10px 15px", borderRadius: 12, fontSize: 13, background: m.role === "user" ? "#e8f0ff" : "#fff", color: m.role === "user" ? "#1a3a7a" : "#2a3a50", border: `1px solid ${m.role === "user" ? "#b0c8f0" : "#d8e4f0"}`, boxShadow: "0 1px 4px rgba(100,140,200,0.1)" }}>
              {m.role === "user"
                ? <div style={{ direction: isRtl ? "rtl" : "ltr", lineHeight: 1.6 }}>{m.content}</div>
                : <Markdown text={m.content} isRtl={isRtl} />}
            </div>
          </div>
        ))}
        {busy && <div style={{ color: "#5080c0", fontSize: 12, textAlign: "center" }}>{t.analyzing}</div>}

      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && !busy && send()}
          placeholder={t.askPlaceholder} dir={isRtl ? "rtl" : "ltr"}
          style={{ flex: 1, background: "#fff", border: "1.5px solid #b0c8e8", color: "#1a2a50", borderRadius: 8, padding: "9px 14px", fontSize: 13, outline: "none" }} />
        <Tooltip text={lang === "pt" ? "Enviar mensagem" : lang === "he" ? "שלח הודעה" : "Send message"}>
          <button onClick={() => send()} disabled={busy}
            style={{ background: busy ? "#c0d0f0" : "#2050c0", border: "none", color: "#fff", borderRadius: 8, width: 40, height: 40, cursor: busy ? "not-allowed" : "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
            {busy
              ? <span style={{ fontSize: 16, animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</span>
              : <span style={{ transform: isRtl ? "scaleX(-1)" : "none", display: "inline-block" }}>➤</span>}
          </button>
        </Tooltip>
        <Tooltip text={copied
          ? (lang === "pt" ? "Copiado!" : lang === "he" ? "הועתק!" : "Copied!")
          : (lang === "pt" ? "Copiar como HTML (cole no email)" : lang === "he" ? "העתק כ-HTML (הדבק במייל)" : "Copy as HTML — paste into email")}>
          <button onClick={copyChat} disabled={msgs.length === 0}
            style={{ background: copied ? "#e8fff0" : "#f0f4ff", border: copied ? "1.5px solid #5cb85c" : "1.5px solid #c0d4f0", borderRadius: 8, width: 40, height: 40, cursor: msgs.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", padding: 0 }}>
            {copied
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a8040" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={msgs.length === 0 ? "#b0c0d8" : "#3060b0"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
            }
          </button>
        </Tooltip>

      </div>


    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend({ lo, hi, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
      <span style={{ color: "#3070c0" }}>↓ {lo}°</span>
      <div style={{ display: "flex", borderRadius: 3, overflow: "hidden", height: 13, width: 160 }}>
        {Array.from({ length: 14 }).map((_, i) => <div key={i} style={{ flex: 1, background: tColor((lo - 8) + i * 14 / 13, lo, hi) }} />)}
      </div>
      <span style={{ color: "#e06020" }}>↑ {hi}°</span>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("pt");
  const [sharedInsights, setSharedInsights] = useState(null);
  const t = T[lang];
  const isRtl = lang === "he";

  const [tab, setTab] = useState("monitor");
  const [loggers, setLoggers] = useState(DEMO_LOGGERS);
  const [elements, setElements] = useState(DEMO_ELEMENTS);
  const [timeData, setTimeData] = useState(() => genDemo(DEMO_LOGGERS));
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [sel, setSel] = useState(null);
  const [interp, setInterp] = useState(true);
  const [room, setRoom] = useState({ w: 10, d: 20, h: 4 });
  const [tr, setTr] = useState({ min: 15, max: 20 });
  const [posFile, setPosFile] = useState(null); const [tempFile, setTempFile] = useState(null); const [msg, setMsg] = useState("");
  const play = useRef(null);

  const total = useMemo(() => Math.max(...Object.values(timeData).map(s => s.length), 1), [timeData]);
  const baseMs = useMemo(() => Math.max(16, Math.round(15000 / total)), [total]);

  useEffect(() => {
    if (playing) { play.current = setInterval(() => setFrameIdx(f => { if (f >= total - 1) { setPlaying(false); return f; } return f + 1; }), Math.round(baseMs / speed)); }
    else clearInterval(play.current);
    return () => clearInterval(play.current);
  }, [playing, speed, total, baseMs]);

  async function handlePos(e) {
    const file = e.target.files[0]; if (!file) return; setPosFile(file.name);
    try {
      const XLSX = await loadXLSX(); const reader = new FileReader();
      reader.onload = ev => {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
        const parsed = rows.filter(r => r[2] && r[3] && String(r[2]).replace(/\D/g, "").length >= 5).map(r => ({ id: String(Math.round(parseFloat(r[2]))), name: String(r[3]), x: 0.5, y: 0.5, z: 0.5 }));
        if (parsed.length) { setLoggers(parsed); setMsg(`✓ ${parsed.length} loggers imported`); }
      };
      reader.readAsArrayBuffer(file);
    } catch { setMsg("Error reading positions file"); }
  }

  async function handleTemp(e) {
    const file = e.target.files[0]; if (!file) return; setTempFile(file.name);
    try {
      const XLSX = await loadXLSX(); const reader = new FileReader();
      reader.onload = ev => {
        const wb = XLSX.read(ev.target.result, { type: "array", cellDates: true });
        const nd = {};
        wb.SheetNames.forEach(sn => {
          const m = sn.match(/(\d{5,8})/); if (!m) return;
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1 });
          const series = rows.slice(1).filter(r => r[0] && r[1] != null).map(r => ({ ts: r[0] instanceof Date ? r[0] : new Date(r[0]), temp: parseFloat(r[1]), hum: parseFloat(r[2]) || 80 })).filter(r => !isNaN(r.temp));
          if (series.length) nd[m[1]] = series;
        });
        if (Object.keys(nd).length) { setTimeData(nd); setFrameIdx(0); setMsg(p => p + ` | ✓ ${Object.keys(nd).length} loggers loaded`); }
      };
      reader.readAsArrayBuffer(file);
    } catch { setMsg(p => p + " | Error reading temperature file"); }
  }

  const selReading = useMemo(() => { if (!sel) return null; const s = timeData[sel.id]; return s?.[Math.min(frameIdx, (s?.length ?? 1) - 1)]; }, [sel, timeData, frameIdx]);
  const firstSeries = useMemo(() => Object.values(timeData)[0], [timeData]);
  const curTime = useMemo(() => firstSeries?.[frameIdx]?.ts, [firstSeries, frameIdx]);

  const stats = useMemo(() => {
    const vals = loggers.map(lg => timeData[lg.id]?.[Math.min(frameIdx, (timeData[lg.id]?.length ?? 1) - 1)]?.temp).filter(v => v != null);
    if (!vals.length) return null;
    return { min: Math.min(...vals).toFixed(2), max: Math.max(...vals).toFixed(2), avg: (vals.reduce((a, b) => a + b) / vals.length).toFixed(2), spread: (Math.max(...vals) - Math.min(...vals)).toFixed(2) };
  }, [loggers, timeData, frameIdx]);

  // Shared styles
  const card = { background: "#fff", border: "1.5px solid #d8e4f0", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(100,140,200,0.08)" };
  const inpS = { background: "#fff", border: "1.5px solid #b8d0e8", color: "#1a2a4a", borderRadius: 6, padding: "7px 10px", fontSize: 13, outline: "none", width: "100%" };
  const cbtn = { background: "#f0f5ff", border: "1.5px solid #c0d4f0", color: "#3060b0", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 15 };

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f8", color: "#1a2a4a", fontFamily: "'Segoe UI', Tahoma, sans-serif", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #d0dcea", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(100,140,200,0.1)", position: "sticky", top: 0, zIndex: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1a3a7a" }}>❄ {t.appName}</h1>
          <div style={{ fontSize: 11, color: "#7090b0" }}>{t.appSub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Language switcher */}
          <div style={{ display: "flex", gap: 4, background: "#f0f4fa", borderRadius: 8, padding: 3 }}>
            {[["pt", "🇧🇷 PT"], ["en", "🇺🇸 EN"], ["he", "🇮🇱 עב"]].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)} style={{ background: lang === code ? "#fff" : "transparent", border: lang === code ? "1px solid #c0d4f0" : "1px solid transparent", color: lang === code ? "#1a3a7a" : "#7090b0", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: lang === code ? 700 : 400, boxShadow: lang === code ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{label}</button>
            ))}
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[["monitor", t.tabMonitor], ["settings", t.tabSettings], ["ai", t.tabAI]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? "#1a3a7a" : "#f0f4fa", border: `1.5px solid ${tab === id ? "#1a3a7a" : "#c0d4f0"}`, color: tab === id ? "#fff" : "#5070a0", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 400 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 20px" }}>

        {/* ─── MONITOR ─── */}
        {tab === "monitor" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {stats && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { l: t.min, v: `${stats.min}°C`, c: "#2060c0" },
                  { l: t.max, v: `${stats.max}°C`, c: "#d04010" },
                  { l: t.avg, v: `${stats.avg}°C`, c: "#208050" },
                  { l: t.spread, v: `${stats.spread}°C`, c: parseFloat(stats.spread) > 3 ? "#c02020" : "#208050" },
                  { l: t.loggers, v: loggers.length, c: "#5070a0" },
                  { l: t.time, v: curTime ? new Date(curTime).toLocaleString(t.locales) : "—", c: "#708090" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", border: "1.5px solid #d8e8f8", borderRadius: 9, padding: "7px 16px", boxShadow: "0 1px 4px rgba(100,140,200,0.07)" }}>
                    <div style={{ fontSize: 10, color: "#90a8c0", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.l}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: s.c, fontFamily: "monospace", marginTop: 2 }}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Legend lo={tr.min} hi={tr.max} t={t} />
                  <button onClick={() => setInterp(v => !v)} style={{ ...cbtn, background: interp ? "#e8f0ff" : "#f5f5f5", color: interp ? "#2050a0" : "#909090", fontSize: 12 }}>{t.heatmap}</button>
                </div>
                <Heatmap loggers={loggers} elements={elements} timeData={timeData} frameIdx={frameIdx} lo={tr.min} hi={tr.max} onClick={setSel} sel={sel} interp={interp} />
              </div>
              {sel && (
                <div style={{ width: 220, ...card, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: "#8090b0", fontSize: 11, fontWeight: 600 }}>{t.selected}</span>
                    <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#a0b0c0", cursor: "pointer", fontSize: 16 }}>✕</button>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 17, color: "#1a3a7a", fontWeight: 700 }}>{sel.id}</div>
                  <div style={{ fontSize: 11, color: "#5070a0", marginBottom: 10, lineHeight: 1.5 }}>{sel.name}</div>
                  {selReading && (() => {
                    const series = timeData[sel.id] || [];
                    const allTemps = series.map(r => r.temp);
                    const seriesMin = allTemps.length ? Math.min(...allTemps) : selReading.temp;
                    const seriesMax = allTemps.length ? Math.max(...allTemps) : selReading.temp;
                    const exceedsHigh = seriesMax > tr.max;
                    const exceedsLow  = seriesMin < tr.min;
                    const nowOk = selReading.temp >= tr.min && selReading.temp <= tr.max;
                    // Overall status: based on CURRENT reading + warn if series had violations
                    const nowStatus = selReading.temp < tr.min ? "low" : selReading.temp > tr.max ? "high" : "ok";
                    const historyAlert = (exceedsHigh || exceedsLow) && nowStatus === "ok";
                    return <>
                      <div style={{ fontSize: 32, fontWeight: 800, color: tColor(selReading.temp, tr.min, tr.max), fontFamily: "monospace" }}>{selReading.temp.toFixed(2)}°C</div>
                      <div style={{ fontSize: 14, color: "#4070a0", marginBottom: 6 }}>💧 {selReading.hum.toFixed(1)}% {t.humidity}</div>
                      <div style={{ fontSize: 10, color: "#a0b0c0", marginBottom: 10 }}>{new Date(selReading.ts).toLocaleString(t.locales)}</div>
                      <MiniChart series={series} lo={tr.min} hi={tr.max} />
                      {/* Series min/max row */}
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 4, fontSize: 11 }}>
                        <span style={{ color: seriesMin < tr.min ? "#c04010" : "#5080a0" }}>
                          ↓ {seriesMin.toFixed(1)}°
                        </span>
                        <span style={{ color: "#8090a0", fontSize: 10 }}>
                          {lang === "pt" ? "série" : lang === "he" ? "סדרה" : "series"}
                        </span>
                        <span style={{ color: seriesMax > tr.max ? "#c04010" : "#5080a0" }}>
                          ↑ {seriesMax.toFixed(1)}°
                        </span>
                      </div>
                      {/* Current frame status */}
                      <div style={{ padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                        background: nowStatus === "low" ? "#e8f4ff" : nowStatus === "high" ? "#fff0e8" : "#e8fff0",
                        color: nowStatus === "low" ? "#1060c0" : nowStatus === "high" ? "#c04010" : "#108040",
                        border: `1.5px solid ${nowStatus === "low" ? "#90c0f0" : nowStatus === "high" ? "#f0a070" : "#70d090"}` }}>
                        {nowStatus === "low" ? t.belowRange : nowStatus === "high" ? t.aboveRange : t.inRange}
                        <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginInlineStart: 4 }}>
                          ({lang === "pt" ? "agora" : lang === "he" ? "עכשיו" : "now"})
                        </span>
                      </div>
                      {/* History violation warning */}
                      {historyAlert && (
                        <div style={{ marginTop: 5, padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                          background: "#fff3e0", color: "#b05000", border: "1.5px solid #f0a030" }}>
                          ⚠ {exceedsHigh && `${lang === "pt" ? "Máx histórico" : lang === "he" ? "מקס היסטורי" : "Historic max"}: ${seriesMax.toFixed(1)}°`}
                          {exceedsHigh && exceedsLow ? " / " : ""}
                          {exceedsLow && `${lang === "pt" ? "Mín histórico" : lang === "he" ? "מינ היסטורי" : "Historic min"}: ${seriesMin.toFixed(1)}°`}
                        </div>
                      )}
                    </>;
                  })()}
                </div>
              )}
            </div>
            {/* Timeline */}
            <div style={card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={() => setFrameIdx(0)} style={cbtn}>⏮</button>
                <button onClick={() => setFrameIdx(f => Math.max(0, f - 96))} style={cbtn}>⏪</button>
                <button onClick={() => setPlaying(p => !p)} style={{ ...cbtn, background: playing ? "#e8fff0" : "#eef2ff", color: playing ? "#108040" : "#2050c0", minWidth: 44 }}>{playing ? "⏸" : "▶"}</button>
                <button onClick={() => setFrameIdx(f => Math.min(total - 1, f + 96))} style={cbtn}>⏩</button>
                <button onClick={() => setFrameIdx(total - 1)} style={cbtn}>⏭</button>
                <span style={{ fontSize: 11, color: "#90a8c0", fontWeight: 600 }}>{t.speed}</span>
                {[0.5, 1, 2, 5, 10].map(s => <button key={s} onClick={() => setSpeed(s)} style={{ ...cbtn, background: speed === s ? "#1a3a7a" : "#f0f4fa", color: speed === s ? "#fff" : "#5070a0", fontWeight: speed === s ? 700 : 400, fontSize: 12, padding: "5px 10px" }}>{s}×</button>)}
              </div>
              <input type="range" min={0} max={total - 1} value={frameIdx} onChange={e => { setPlaying(false); setFrameIdx(+e.target.value); }} style={{ width: "100%", accentColor: "#2050c0", height: 5 }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a0b4c8", marginTop: 5 }}>
                <span>{firstSeries?.[0] ? new Date(firstSeries[0].ts).toLocaleDateString(t.locales) : ""}</span>
                <span style={{ color: "#7090b0", fontWeight: 600 }}>{t.frame} {frameIdx + 1} / {total}</span>
                <span>{firstSeries?.length ? new Date(firstSeries[firstSeries.length - 1].ts).toLocaleDateString(t.locales) : ""}</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── SETTINGS ─── */}
        {tab === "settings" && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 270px", ...card }}>
              <h3 style={{ margin: "0 0 14px", color: "#1a3a7a", fontSize: 14 }}>{t.roomDims}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[["w", t.width], ["d", t.depth], ["h", t.height]].map(([k, label]) => (
                  <label key={k} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <span style={{ fontSize: 11, color: "#7090b0", fontWeight: 600 }}>{label}</span>
                    <input type="number" value={room[k]} min={1} max={200} step={0.5} onChange={e => setRoom(d => ({ ...d, [k]: parseFloat(e.target.value) || d[k] }))} style={inpS} />
                  </label>
                ))}
              </div>
              <h3 style={{ margin: "0 0 14px", color: "#1a3a7a", fontSize: 14 }}>{t.tempRange}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontSize: 11, color: "#7090b0", fontWeight: 600 }}>{t.min} (°C)</span><input type="number" value={tr.min} step={0.5} onChange={e => setTr(r => ({ ...r, min: parseFloat(e.target.value) || r.min }))} style={inpS} /></label>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}><span style={{ fontSize: 11, color: "#7090b0", fontWeight: 600 }}>{t.max} (°C)</span><input type="number" value={tr.max} step={0.5} onChange={e => setTr(r => ({ ...r, max: parseFloat(e.target.value) || r.max }))} style={inpS} /></label>
              </div>
            </div>

            <div style={{ flex: "1 1 270px", ...card }}>
              <h3 style={{ margin: "0 0 14px", color: "#1a3a7a", fontSize: 14 }}>{t.importFiles}</h3>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#5070a0", fontWeight: 600, marginBottom: 4 }}>{t.posFile}</div>
                <div style={{ fontSize: 10, color: "#90a8c0", marginBottom: 8 }}>{t.posFileDesc}</div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div style={{ background: "#f0f4ff", border: "1.5px solid #b0c8e8", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#3060a0", fontWeight: 600 }}>{t.chooseFile}</div>
                  <span style={{ fontSize: 11, color: "#90a8c0" }}>{posFile || t.noFile}</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handlePos} style={{ display: "none" }} />
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#5070a0", fontWeight: 600, marginBottom: 4 }}>{t.tempFileLabel}</div>
                <div style={{ fontSize: 10, color: "#90a8c0", marginBottom: 8 }}>{t.tempFileDesc}</div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <div style={{ background: "#f0f4ff", border: "1.5px solid #b0c8e8", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#3060a0", fontWeight: 600 }}>{t.chooseFile}</div>
                  <span style={{ fontSize: 11, color: "#90a8c0" }}>{tempFile || t.noFile}</span>
                  <input type="file" accept=".xlsx,.xls" onChange={handleTemp} style={{ display: "none" }} />
                </label>
              </div>
              {msg && <div style={{ background: "#e8fff0", border: "1px solid #80d0a0", borderRadius: 7, padding: "7px 12px", fontSize: 12, color: "#208050", marginBottom: 12 }}>{msg}</div>}
              <button onClick={() => { setLoggers(DEMO_LOGGERS); setElements(DEMO_ELEMENTS); setTimeData(genDemo(DEMO_LOGGERS)); setFrameIdx(0); setMsg(t.demoLoaded); }} style={{ background: "#fff8e8", border: "1.5px solid #e0c070", color: "#907020", borderRadius: 7, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{t.loadDemo}</button>
            </div>

            <div style={{ flex: "1 1 100%", ...card }}>
              <h3 style={{ margin: "0 0 12px", color: "#1a3a7a", fontSize: 14 }}>{t.placement}</h3>
              <Placer loggers={loggers} setLoggers={setLoggers} elements={elements} setElements={setElements} room={room} lang={lang} />
            </div>
          </div>
        )}

        {/* ─── AI ─── */}
        {tab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* SmartInsights — full width on top */}
            <div style={{ ...card }}>
              <SmartInsights loggers={loggers} elements={elements} timeData={timeData} room={room} tempRange={tr} lang={lang} onInsights={setSharedInsights} />
            </div>
            {/* Chat — full width below */}
            <div style={{ ...card, minHeight: 480 }}>
              <h3 style={{ margin: "0 0 14px", color: "#1a3a7a", fontSize: 14 }}>{t.aiExpert}</h3>
              <AIChat loggers={loggers} elements={elements} timeData={timeData} frameIdx={frameIdx} room={room} tempRange={tr} lang={lang} sharedInsights={sharedInsights} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
