import { 
  Settings, Thermometer, Snowflake, DoorOpen, Brain, 
  Send, Copy, Check, ChevronLeft, ChevronRight, 
  Maximize2, Minimize2, Play, Pause, SkipBack, SkipForward 
} from 'lucide-react';

// ─── Markdown renderer ───────────────────────────────────────────────────────
function Markdown({ text, isRtl }) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;
  function parseInline(str) {
    const parts = [];
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
    if (line.startsWith("### ")) { elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 14, color: "#1a3a7a", marginTop: 10, marginBottom: 3, borderBottom: "1px solid #d0dcea", paddingBottom: 3 }}>{parseInline(line.slice(4))}</div>); i++; continue; }
    if (line.startsWith("## "))  { elements.push(<div key={i} style={{ fontWeight: 700, fontSize: 15, color: "#1a3a7a", marginTop: 12, marginBottom: 4 }}>{parseInline(line.slice(3))}</div>); i++; continue; }
    if (line.startsWith("# "))   { elements.push(<div key={i} style={{ fontWeight: 800, fontSize: 16, color: "#0a2060", marginTop: 12, marginBottom: 4 }}>{parseInline(line.slice(2))}</div>); i++; continue; }
    if (/^[\*\-•]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[\*\-•]\s/.test(lines[i])) { items.push(<li key={i} style={{ marginBottom: 3, paddingInlineStart: 4 }}>{parseInline(lines[i].replace(/^[\*\-•]\s/, ""))}</li>); i++; }
      elements.push(<ul key={"ul" + i} style={{ margin: "4px 0", paddingInlineStart: 20, listStyleType: "disc" }}>{items}</ul>); continue;
    }
    if (line.includes("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|")) { tableLines.push(lines[i]); i++; }
      const dataRows = tableLines.filter(l => !/^\s*\|?\s*[-:]+\s*\|/.test(l));
      elements.push(
        <div key={"tbl" + i} style={{ overflowX: "auto", margin: "8px 0" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "#f8fafd" : "#fff" }}>
                  {row.split("|").filter(c => c.trim()).map((cell, ci) => (
                    <td key={ci} style={{ border: "1px solid #d0dcea", padding: "5px 10px" }}>{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ); continue;
    }
    elements.push(<p key={i} style={{ margin: "2px 0", lineHeight: 1.7 }}>{parseInline(line)}</p>);
    i++;
  }
  return <div style={{ direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}>{elements}</div>;
}

// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  pt: {
    appName: "Monitor de Câmara Fria", appSub: "Sistema de monitoramento e análise de câmaras frigoríficas",
    tabMonitor: "🌡 Monitoramento", tabSettings: "⚙ Configurações", tabAI: "🤖 Análise IA",
    min: "Mínimo", max: "Máximo", avg: "Média", spread: "Variação", loggers: "Sensores", time: "Hora",
    heatmap: "🌈 Mapa de Calor", frame: "Frame", speed: "Velocidade:", selected: "Sensor selecionado",
    humidity: "Umidade", belowRange: "⬇ Abaixo do intervalo", aboveRange: "⬆ Acima do intervalo", inRange: "✓ Dentro do intervalo",
    history: "Histórico", roomDims: "🏗 Dimensões da Câmara", width: "Largura (m)", depth: "Comprimento (m)", height: "Altura (m)",
    tempRange: "🌡 Faixa de temperatura OK", importFiles: "📂 Importar Arquivos",
    posFile: "Arquivo de posições dos sensores (.xlsx)", posFileDesc: "Colunas: B = número | C = ID 7 dígitos | D = nome",
    tempFileLabel: "Arquivo de temperaturas (.xlsx)", tempFileDesc: 'Sheet por sensor: "Tag<1234567>" — hora | temp°C | umidade%',
    chooseFile: "Escolher arquivo", noFile: "Nenhum selecionado", loadDemo: "Carregar dados demo",
    demoLoaded: "✓ Dados demo carregados (3 semanas, 8 sensores)", placement: "📍 Posicionamento dos Sensores",
    placementDesc: "Arraste os sensores no esquema ou edite as coordenadas na tabela",
    num: "#", id: "ID", name: "Nome", xAxis: "X Larg.", yAxis: "Y Comp.", zAxis: "Z Alt.",
    currentStatus: "📊 Status Atual", aiExpert: "🤖 Especialista em Câmaras Frias — IA",
    sendBtn: "Enviar", askPlaceholder: "Faça uma pergunta sobre a câmara...",
    noMessages: "❄ Faça uma pergunta ou escolha uma sugestão acima", analyzing: "⟳ Analisando...",
    door: "Porta", evap: "Evaporador",
    quickQ: ["📈 Tendência 7 dias", "🔍 Deriva de sensor", "💧 Vazamento de gás", "❄ Evaporador congelado", "🚪 Porta aberta?", "⚡ Defrost", "🔮 Previsão", "🗺 Qual zona é cronicamente mais quente?"],
    roomElements: "Elementos da câmara", addDoor: "➕ Porta", addEvap: "➕ Evaporador",
    elementList: "Elementos posicionados", doorLabel: "Porta", evapLabel: "Evaporador", deleteEl: "✕", locales: "pt-BR",
  },
  en: {
    appName: "Cold Room Monitor", appSub: "Cold storage monitoring & analysis system",
    tabMonitor: "🌡 Monitor", tabSettings: "⚙ Settings", tabAI: "🤖 AI Analysis",
    min: "Min", max: "Max", avg: "Avg", spread: "Spread", loggers: "Loggers", time: "Time",
    heatmap: "🌈 Heatmap", frame: "Frame", speed: "Speed:", selected: "Selected logger",
    humidity: "Humidity", belowRange: "⬇ Below range", aboveRange: "⬆ Above range", inRange: "✓ Within range",
    history: "History", roomDims: "🏗 Room Dimensions", width: "Width (m)", depth: "Length (m)", height: "Height (m)",
    tempRange: "🌡 Normal temperature range", importFiles: "📂 Import Files",
    posFile: "Logger positions file (.xlsx)", posFileDesc: "Columns: B = number | C = 7-digit ID | D = name",
    tempFileLabel: "Temperature data file (.xlsx)", tempFileDesc: 'Sheet per logger: "Tag<1234567>" — time | temp°C | humidity%',
    chooseFile: "Choose file", noFile: "None selected", loadDemo: "Load demo data",
    demoLoaded: "✓ Demo data loaded (3 weeks, 8 loggers)", placement: "📍 Logger Placement",
    placementDesc: "Drag loggers on the schematic or edit coordinates in the table",
    num: "#", id: "ID", name: "Name", xAxis: "X Width", yAxis: "Y Length", zAxis: "Z Height",
    currentStatus: "📊 Current Status", aiExpert: "🤖 Cold Room Expert — AI",
    sendBtn: "Send", askPlaceholder: "Ask a question about the room...",
    noMessages: "❄ Ask a question or choose a suggestion above", analyzing: "⟳ Analyzing...",
    door: "Door", evap: "Evaporator",
    quickQ: ["📈 7-day trend", "🔍 Sensor failure", "💧 Slow refrigerant leak", "❄ Frozen evaporator?", "🚪 Door left open?", "⚡ Defrost cycle", "🔮 Predictive", "🗺 Which zone is chronically warmest?"],
    roomElements: "Room elements", addDoor: "➕ Door", addEvap: "➕ Evaporador",
    elementList: "Placed elements", doorLabel: "Door", evapLabel: "Evaporador", deleteEl: "✕", locales: "en-US",
  },
  he: {
    appName: "ניטור חדר קירור", appSub: "מערכת ניטור וניתוח חדרי קירור",
    tabMonitor: "🌡 ניטור", tabSettings: "⚙ הגדרות", tabAI: "🤖 ניתוח AI",
    min: "מינימום", max: "מקסימום", avg: "ממוצע", spread: "פיזור", loggers: "לוגרים", time: "זמן",
    heatmap: "🌈 מפת חום", frame: "פריים", speed: "מהירות:", selected: "לוגר נבחר",
    humidity: "לחות", belowRange: "⬇ מתחת לטווח", aboveRange: "⬆ מעל לטווח", inRange: "✓ בטווח תקין",
    history: "היסטוריה", roomDims: "🏗 מידות חדר", width: "רוחב (מ')", depth: "אורך (מ')", height: "גובה (מ')",
    tempRange: "🌡 טווח טמפרטורה תקין", importFiles: "📂 ייבוא קבצים",
    posFile: "קובץ מיקום לוגרים (.xlsx)", posFileDesc: "עמודות: B = מספר | C = מזהה 7 ספרות | D = שם",
    tempFileLabel: "קובץ נתוני טמפרטורה (.xlsx)", tempFileDesc: 'Sheet לכל לוגר: "Tag<1234567>" — זמן | טמפ°C | לחות%',
    chooseFile: "בחר קובץ", noFile: "לא נבחר", loadDemo: "טען נתוני דמו",
    demoLoaded: "✓ נטענו נתוני דמו (3 שבועות, 8 לוגרים)", placement: "📍 מיקום לוגרים",
    placementDesc: "גרור לוגרים על גבי הסכמה, או ערוך קואורדינטות בטבלה",
    num: "#", id: "מזהה", name: "שם", xAxis: "X רוחב", yAxis: "Y אורך", zAxis: "Z גובה",
    currentStatus: "📊 סטטוס נוכחי", aiExpert: "🤖 מומחה חדרי קירור — AI",
    sendBtn: "שלח", askPlaceholder: "שאל שאלה על החדר...",
    noMessages: "❄ שאל שאלה או בחר הצעה למעלה", analyzing: "⟳ מנתח...",
    door: "דלת", evap: "מאייד",
    quickQ: ["📈 מגמת 7 ימים", "🔍 תקלת חיישן", "💧 דליפת גז איטית", "❄ מאייד קפוא?", "🚪 הדלת נשארה פתוחה?", "⚡ מחזור הפשרה", "🔮 תחזית", "🗺 איזה אזור חם כרונית?"],
    roomElements: "אלמנטים בחדר", addDoor: "➕ דלת", addEvap: "➕ מאייד",
    elementList: "אלמנטים ממוקמים", doorLabel: "דלת", evapLabel: "מאייד", deleteEl: "✕", locales: "he-IL",
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

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_LOGGERS = [
  { id: "7212048", name: "Porta embalagem-Parede",      x: 0.05, y: 0.5,  z: 0.3 },
  { id: "7212033", name: "Prateleira P-Centro",         x: 0.5,  y: 0.5,  z: 0.5 },
  { id: "7211964", name: "Corredor 13-Col meio",        x: 0.7,  y: 0.3,  z: 0.4 },
  { id: "7212047", name: "Corredor 8-Parede final",     x: 0.9,  y: 0.8,  z: 0.2 },
  { id: "8162411", name: "Corredor 15-Porta embalagem", x: 0.15, y: 0.85, z: 0.7 },
  { id: "8162491", name: "Corredor 15-Proximo radio",   x: 0.35, y: 0.9,  z: 0.6 },
  { id: "8121400", name: "Corredor 3 parede fundo",     x: 0.85, y: 0.15, z: 0.5 },
  { id: "7210001", name: "Evaporador teto centro",      x: 0.5,  y: 0.2,  z: 0.95 },
];
const DEMO_ELEMENTS = [
  { id: "el1", type: "door", label: "Porta Principal", x: 0.05, y: 0.5 },
  { id: "el2", type: "evap", label: "Evaporador",      x: 0.5,  y: 0.1 },
];

function genDemo(loggers) {
  const data = {};
  const start = new Date("2026-02-24T15:48:00").getTime();
  const steps = 21 * 24 * 4;
  loggers.forEach((lg, li) => {
    data[lg.id] = [];
    const baseT = 17.5 + (lg.z - 0.5) * 1.5 + (lg.y - 0.5) * 0.8;
    const baseH = 77 + li * 0.5;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function tColor(t, lo, hi, alpha) {
  let r, g, b;
  if (t < lo) { const f = Math.max(0, Math.min(1, (t - (lo - 8)) / 8)); r = 0; g = Math.round(80 + f * 100); b = Math.round(200 + f * 55); }
  else if (t > hi) { const f = Math.min(1, (t - hi) / 4); r = Math.round(200 + f * 55); g = Math.round(120 - f * 100); b = 20; }
  else { const f = (t - lo) / (hi - lo); r = Math.round(30 + f * 180); g = Math.round(180 - f * 40); b = Math.round(80 - f * 50); }
  return alpha != null ? `rgba(${r},${g},${b},${alpha})` : `rgb(${r},${g},${b})`;
}

function tArr(t, lo, hi) {
  if (t < lo) { const f = Math.max(0, Math.min(1, (t - (lo - 8)) / 8)); return [0, Math.round(80 + f * 100), Math.round(200 + f * 55)]; }
  if (t > hi) { const f = Math.min(1, (t - hi) / 4); return [Math.round(200 + f * 55), Math.round(120 - f * 100), 20]; }
  const f = (t - lo) / (hi - lo); return [Math.round(30 + f * 180), Math.round(180 - f * 40), Math.round(80 - f * 50)];
}

function buildStatsContext(loggers, timeData, room, tempRange) {
  try {
    const stats = loggers.map(lg => {
      const series = timeData[lg.id] || [];
      if (!series.length) return null;
      const sample = series.slice(-60);
      const avg = (sample.reduce((a, b) => a + b.temp, 0) / sample.length).toFixed(2);
      return `Logger ${lg.id} (${lg.name}): Avg: ${avg}°C`;
    }).filter(Boolean).join('\n');
    return `Cold room ${room.w}x${room.d}m. Range: ${tempRange.min}-${tempRange.max}°C.\n${stats}`;
  } catch(e) { return "Data error"; }
}

// ─── Canvas Components ────────────────────────────────────────────────────────
function Heatmap({ loggers, elements, timeData, frameIdx, lo, hi, onClick, sel, interp }) {
  const ref = useRef(null);
  const W = 700, H = 380;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f0f4f8"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#b0c0d8"; ctx.lineWidth = 2; ctx.strokeRect(2, 2, W - 4, H - 4);
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
    pts.forEach(p => {
      const col = tColor(p.temp, lo, hi); const rad = (sel?.id === p.id) ? 18 : 14;
      ctx.beginPath(); ctx.arc(p.px, p.py, rad, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = (sel?.id === p.id) ? "#1a3a7a" : "#fff"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.fillText(p.temp.toFixed(1) + "°", p.px, p.py);
    });
  }, [loggers, elements, timeData, frameIdx, lo, hi, interp, sel]);

  const handleClick = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width), my = (e.clientY - rect.top) * (H / rect.height);
    let best = null, bestD = 30;
    loggers.forEach(lg => { const d = Math.hypot(lg.x * W - mx, (1 - lg.y) * H - my); if (d < bestD) { bestD = d; best = lg; } });
    onClick(best);
  }, [loggers, onClick]);

  return <canvas ref={ref} width={W} height={H} onClick={handleClick} style={{ width: "100%", borderRadius: 10, border: "1.5px solid #c0cfe0" }} />;
}

// ─── UI Components ────────────────────────────────────────────────────────────
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
      <path d={path} fill="none" stroke="#2060c0" strokeWidth={1.8} />
    </svg>
  );
}

function Legend({ lo, hi }) {
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

function Placer({ loggers, setLoggers, elements, setElements, room, lang }) {
  const t = T[lang];
  const [drag, setDrag] = useState(null);
  const svgRef = useRef(null);
  const W = 560, H = 280;

  function onMove(e) {
    if (drag == null) return;
    const rect = svgRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    if (drag.kind === "logger") setLoggers(prev => prev.map((lg, i) => i === drag.idx ? { ...lg, x: nx, y: ny } : lg));
    else setElements(prev => prev.map((el, i) => i === drag.idx ? { ...el, x: nx, y: ny } : el));
  }

  return (
    <div style={{ direction: lang === "he" ? "rtl" : "ltr" }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseUp={() => setDrag(null)} style={{ background: "#f0f5fb", border: "1px solid #ddd" }}>
        {loggers.map((lg, i) => <circle key={lg.id} cx={lg.x * W} cy={(1 - lg.y) * H} r={10} fill="#2060d0" onMouseDown={() => setDrag({ kind: "logger", idx: i })} />)}
      </svg>
    </div>
  );
}

// ─── SmartInsights ────────────────────────────────────────────────────────────
function SmartInsights({ loggers, timeData, room, tempRange, lang, onInsights }) {
  const [insights, setInsights] = useState([
    { icon: "🔧", category: "Predictive Maintenance", severity: "ok", finding: "", conclusion: "", loading: false },
    { icon: "🚪", category: "Door Efficiency", severity: "ok", finding: "", conclusion: "", loading: false },
    { icon: "⏱", category: "Survival Forecast", severity: "ok", finding: "", conclusion: "", loading: false },
    { icon: "⚡", category: "Energy Optimization", severity: "ok", finding: "", conclusion: "", loading: false }
  ]);
  const isRtl = lang === "he";

  const fetchCat = async (catName) => {
    const context = buildStatsContext(loggers, timeData, room, tempRange);
    setInsights(prev => prev.map(i => i.category === catName ? { ...i, loading: true } : i));
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonMode: true,
          messages: [
            { role: "system", content: `Return ONLY JSON object: {"finding": "...", "conclusion": "...", "severity": "ok|warn|critical"}. Topic: ${catName}` },
            { role: "user", content: context }
          ]
        })
      });
      const d = await res.json();
      const result = JSON.parse(d.choices[0].message.content);
      setInsights(prev => {
        const updated = prev.map(i => i.category === catName ? { ...i, ...result, loading: false } : i);
        if (onInsights) onInsights(updated);
        return updated;
      });
    } catch (e) {
      setInsights(prev => prev.map(i => i.category === catName ? { ...i, loading: false, finding: "Error" } : i));
    }
  };

  useEffect(() => {
    const run = async () => {
      for (const ins of insights) {
        if (!ins.finding && !ins.loading) await fetchCat(ins.category);
      }
    };
    if (timeData && Object.keys(timeData).length > 0) run();
  }, [timeData]);

  const sevColor = { ok: { bg: "#f0fff4", border: "#6dca8a", label: "#2a6a40" }, warn: { bg: "#fffbeb", border: "#f0c040", label: "#806010" }, critical: { bg: "#fff0f0", border: "#e08080", label: "#a01010" } };

  return (
    <div style={{ direction: isRtl ? "rtl" : "ltr" }}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: 15 }}>{isRtl ? "🤖 תובנות חכמות" : "🤖 SmartInsights"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {insights.map((ins, i) => {
          const s = sevColor[ins.severity] || sevColor.ok;
          return (
            <div key={i} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: s.label }}>{ins.icon} {ins.category}</div>
              {ins.loading ? <div style={{ fontSize: 11 }}>Analisando...</div> : (
                <><div style={{ fontSize: 13, marginTop: 4 }}>{ins.finding}</div>{ins.conclusion && <div style={{ fontSize: 11, marginTop: 5, borderTop: `1px solid ${s.border}`, paddingTop: 5 }}>→ {ins.conclusion}</div>}</>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AIChat ───────────────────────────────────────────────────────────────────
function AIChat({ loggers, elements, timeData, frameIdx, room, tempRange, lang, sharedInsights }) {
  const t = T[lang];
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const isRtl = lang === "he";

  async function send(text) {
    const msg = text ?? inp.trim(); if (!msg || busy) return;
    setInp(""); setBusy(true);
    const history = [...msgs, { role: "user", content: msg }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [{ role: "system", content: "You are a Cold Room expert." }, ...history], 
          stream: true 
        })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: ") && l !== "data: [DONE]");
        for (const line of lines) {
          const json = JSON.parse(line.replace("data: ", ""));
          fullText += json.choices[0].delta?.content || "";
          setMsgs(prev => {
            const updated = [...prev];
            updated[updated.length - 1].content = fullText;
            return updated;
          });
        }
      }
    } catch (e) { setMsgs([...history, { role: "assistant", content: "Error" }]); }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, direction: isRtl ? "rtl" : "ltr" }}>
      <div ref={ref} style={{ flex: 1, minHeight: 200, background: "#f8fafd", padding: 10, overflowY: "auto" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: m.role === "user" ? "right" : "left" }}>
            <div style={{ display: "inline-block", padding: 8, background: m.role === "user" ? "#e8f0ff" : "#fff", borderRadius: 10 }}>
              <Markdown text={m.content} isRtl={isRtl} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1 }} />
        <button onClick={() => send()}>➤</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("pt");
  const [tab, setTab] = useState("monitor");
  const [loggers, setLoggers] = useState(DEMO_LOGGERS);
  const [elements, setElements] = useState(DEMO_ELEMENTS);
  const [timeData, setTimeData] = useState(() => genDemo(DEMO_LOGGERS));
  const [frameIdx, setFrameIdx] = useState(0);
  const [room, setRoom] = useState({ w: 10, d: 20, h: 4 });
  const [tr, setTr] = useState({ min: 15, max: 20 });
  const [sharedInsights, setSharedInsights] = useState(null);
  const t = T[lang];

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f8", fontFamily: "sans-serif", direction: lang === "he" ? "rtl" : "ltr" }}>
      <header style={{ background: "#fff", padding: "10px 20px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ddd" }}>
        <h2>❄ {t.appName}</h2>
        <div>
          <button onClick={() => setTab("monitor")} style={{ background: tab === "monitor" ? "#1a3a7a" : "#eee", color: tab === "monitor" ? "#fff" : "#000" }}>{t.tabMonitor}</button>
          <button onClick={() => setTab("ai")} style={{ background: tab === "ai" ? "#1a3a7a" : "#eee", color: tab === "ai" ? "#fff" : "#000" }}>{t.tabAI}</button>
          <button onClick={() => setTab("settings")} style={{ background: tab === "settings" ? "#1a3a7a" : "#eee", color: tab === "settings" ? "#fff" : "#000" }}>{t.tabSettings}</button>
        </div>
      </header>
      <main style={{ padding: 20 }}>
        {tab === "monitor" && <Heatmap loggers={loggers} timeData={timeData} frameIdx={frameIdx} lo={tr.min} hi={tr.max} onClick={() => {}} sel={null} interp={true} />}
        {tab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SmartInsights loggers={loggers} timeData={timeData} room={room} tempRange={tr} lang={lang} onInsights={setSharedInsights} />
            <AIChat loggers={loggers} elements={elements} timeData={timeData} frameIdx={frameIdx} room={room} tempRange={tr} lang={lang} sharedInsights={sharedInsights} />
          </div>
        )}
        {tab === "settings" && <Placer loggers={loggers} setLoggers={setLoggers} elements={elements} setElements={setElements} room={room} lang={lang} />}
      </main>
    </div>
  );
}
