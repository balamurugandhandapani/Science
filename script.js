/* ==============================
   Periodic Table Explorer
============================== */

const SECTIONS = [
  { title: "1 &middot; Basic Identification",
    fields: ["Atomic Number (Z)","Element Name","Symbol","Atomic Mass (u)","Period","Group (IUPAC 1-18)","Block","Family"] },
  { title: "2 · Atomic Structure",
    fields: ["Protons","Electrons (neutral atom)","Neutrons (most common isotope)","Electron Configuration","Electron Shell Distribution (Bohr rings, per shell)","Valence Electron Count","Valence Shell","Oxidation States (common)","Common Ions"] },
  { title: "3 &middot; Physical Properties",
    fields: ["Natural State (at 25°C/298K)","Color","Density (g/cm3)","Melting Point (K)","Melting Point (°C)","Boiling Point (K)","Boiling Point (°C)","Hardness (Mohs scale)","Crystal Structure"] },
  { title: "4 &middot; Chemical Properties",
    fields: ["Metal / Nonmetal / Metalloid","Organic / Inorganic Chemistry Role","Reactive or Inert","Electronegativity (Pauling scale)","Electron Affinity (eV)","1st Ionization Energy (eV)","Metallic Character","Oxide Type (acid/base character)","pH Value (typical aqueous form)","pH Nature (Acidic/Basic/Neutral)","pH Trend Across Oxidation States","Common Compounds"] },
  { title: "5 &middot; Electrical &amp; Magnetic Properties",
    fields: ["Electrical Conductivity","Thermal Conductivity (W/m·K)","Band Gap - Natural State (eV)","Band Gap - Other Oxidation States / Compounds","Magnetic Property"] },
  { title: "6 &middot; Occurrence",
    fields: ["Natural or Synthetic","Radioactive or Stable","Abundance in Earth's Crust (mg/kg, ppm)","Common Minerals / Ores","Biological Importance"] },
  { title: "7 &middot; Nuclear Properties",
    fields: ["Common Isotopes","Half-life (if radioactive)"] },
  { title: "8 &middot; Industrial &amp; Everyday Uses",
    fields: ["Major Applications","Important Alloys","Toxicity","Biological Role"] },
  { title: "9 · Etymology & Notable Facts",
    fields: ["Element Name Origin / Etymology","Element Symbol Origin","Discovered By","Year / Period Officially Discovered","Specific / Notable Property"] }
];

const bySymbol = {};
ELEMENTS.forEach(e => bySymbol[e["Symbol"]] = e);

function gridPos(el){
  const z = el["Atomic Number (Z)"];
  const period = el["Period"];
  if (z >= 57 && z <= 71) return {row: 9, col: 3 + (z-57)};
  if (z >= 89 && z <= 103) return {row: 10, col: 3 + (z-89)};
  const g = el["Group (IUPAC 1-18)"];
  if (typeof g === "number") return {row: period, col: g};
  return null;
}

function blockClass(b){ return "block-" + (b || "s"); }

function buildTable(){
  const table = document.getElementById("ptable");
  table.style.gridTemplateRows = "repeat(7, 1fr) 14px repeat(2, 1fr)";

  const placeholders = [
    {row:6, col:3, label:"57–71"},
    {row:7, col:3, label:"89–103"}
  ];
  placeholders.forEach(p=>{
    const d = document.createElement("div");
    d.className = "cell placeholder";
    d.style.gridRow = p.row; d.style.gridColumn = p.col;
    d.innerHTML = "<span>"+p.label+"</span>";
    table.appendChild(d);
  });

  for(let c=1;c<=18;c++){
    const s = document.createElement("div");
    s.className = "cell spacer";
    s.style.gridRow = 8; s.style.gridColumn = c;
    table.appendChild(s);
  }

  ELEMENTS.forEach(el=>{
    const pos = gridPos(el);
    if(!pos) return;
    const d = document.createElement("div");
    d.className = "cell " + blockClass(el["Block"]);
    d.style.gridRow = pos.row; d.style.gridColumn = pos.col;
    d.dataset.symbol = el["Symbol"];
    d.innerHTML = `<div class="z">${el["Atomic Number (Z)"]}</div>
                   <div class="sym">${el["Symbol"]}</div>
                   <div class="name">${el["Element Name"]}</div>`;
    d.addEventListener("click", ()=>selectElement(el["Symbol"]));
    table.appendChild(d);
  });
}

function escapeHtml(s){
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "H2O, Fe2O3(OH)2" -> "H<sub>2</sub>O, Fe<sub>2</sub>O<sub>3</sub>(OH)<sub>2</sub>"
// also lifts a trailing +/- right after a subscript number into a superscript
// (handles ionic-formula shorthand like "TcO4-" -> TcO4^-)
function formatCompoundText(text){
  let t = escapeHtml(text);
  t = t.replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>');
  t = t.replace(/(<\/sub>)([+-])/g, '$1<sup>$2</sup>');
  return t;
}

// "Fe2+, Cl-, H+" -> "Fe<sup>2+</sup>, Cl<sup>-</sup>, H<sup>+</sup>"
function formatIonText(text){
  let t = escapeHtml(text);
  t = t.replace(/([A-Z][a-z]?)(\d*[+-])/g, '$1<sup>$2</sup>');
  return t;
}

// "U-238 (99.27%); Tc-97: 4.21 Myear" -> "\u00b2\u00b3\u2078U (99.27%); ..." using real <sup> tags
// converts standard "Symbol-MassNumber" isotope notation into superscript-prefixed nuclide notation
function formatIsotopeText(text){
  let t = escapeHtml(text);
  t = t.replace(/([A-Z][a-z]?)-(\d+)/g, '<sup>$2</sup>$1');
  return t;
}

const CHEMICAL_FORMULA_FIELDS = {
  "Common Compounds": formatCompoundText,
  "Common Ions": formatIonText,
  "Common Isotopes": formatIsotopeText,
  "Half-life (if radioactive)": formatIsotopeText,
};

function fmt(v, field){
  if (v === null || v === undefined || v === "") return "—";
  const formatter = field ? CHEMICAL_FORMULA_FIELDS[field] : null;
  if (formatter) return formatter(String(v));
  return escapeHtml(v);
}

function selectElement(sym){
  const el = bySymbol[sym];
  if(!el) return;

  document.querySelectorAll(".cell.selected").forEach(c=>c.classList.remove("selected"));
  const cell = document.querySelector(`.cell[data-symbol="${sym}"]`);
  if(cell){ cell.classList.add("selected"); }

  document.getElementById("emptyState").style.display = "none";
  const detail = document.getElementById("detail");
  detail.classList.add("show");

  document.getElementById("dSym").textContent = el["Symbol"];
  document.getElementById("dName").textContent = el["Element Name"];
  document.getElementById("dSub").innerHTML =
    `<span>Z = ${el["Atomic Number (Z)"]}</span>` +
    `<span>${fmt(el["Atomic Mass (u)"])} u</span>` +
    `<span>Period ${el["Period"]}</span>` +
    `<span>Group ${fmt(el["Group (IUPAC 1-18)"])}</span>` +
    `<span>${el["Family"]}</span>`;

  const badges = document.getElementById("dBadges");
  const isRadio = el["Radioactive or Stable"] === "Radioactive";
  badges.innerHTML = `
    <span class="badge ${isRadio ? 'radioactive':'stable'}">${el["Radioactive or Stable"]}</span>
    <span class="badge">${el["Metal / Nonmetal / Metalloid"]}</span>
    <span class="badge">${el["Natural or Synthetic"].split(' (')[0]}</span>
  `;

  const sectionsEl = document.getElementById("sections");
  sectionsEl.innerHTML = "";
  SECTIONS.forEach(sec=>{
    const box = document.createElement("div");
    box.className = "section";
    let rows = "";
    sec.fields.forEach(f=>{
      rows += `<div class="field-row"><div class="k">${escapeHtml(f)}</div><div class="v">${fmt(el[f], f)}</div></div>`;
    });
    box.innerHTML = `<h3>${sec.title}</h3>${rows}`;
    sectionsEl.appendChild(box);
  });
}

const input = document.getElementById("searchInput");
const suggestions = document.getElementById("suggestions");
let activeIndex = -1;

function renderSuggestions(query){
  const q = query.trim().toLowerCase();
  if(!q){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
  const matches = ELEMENTS.filter(e =>
    e["Element Name"].toLowerCase().includes(q) || e["Symbol"].toLowerCase().includes(q)
  ).slice(0, 12);
  if(matches.length === 0){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
  suggestions.innerHTML = matches.map((e,i)=>
    `<div class="suggestion-item" data-symbol="${e["Symbol"]}" data-idx="${i}">
       <span>${e["Element Name"]} <span class="sym">${e["Symbol"]}</span></span>
       <span class="z">Z=${e["Atomic Number (Z)"]}</span>
     </div>`
  ).join("");
  suggestions.classList.add("show");
  activeIndex = -1;
  suggestions.querySelectorAll(".suggestion-item").forEach(item=>{
    item.addEventListener("click", ()=>{
      selectElement(item.dataset.symbol);
      input.value = "";
      suggestions.classList.remove("show");
    });
  });
}

input.addEventListener("input", e=> renderSuggestions(e.target.value));
input.addEventListener("keydown", e=>{
  const items = suggestions.querySelectorAll(".suggestion-item");
  if(e.key === "ArrowDown"){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, items.length-1); updateActive(items); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); updateActive(items); }
  else if(e.key === "Enter"){
    e.preventDefault();
    const target = items[activeIndex] || items[0];
    if(target){ selectElement(target.dataset.symbol); input.value=""; suggestions.classList.remove("show"); }
  } else if(e.key === "Escape"){
    suggestions.classList.remove("show");
  }
});
function updateActive(items){
  items.forEach(it=>it.classList.remove("active"));
  if(items[activeIndex]) items[activeIndex].classList.add("active");
}
document.addEventListener("click", e=>{
  if(!e.target.closest(".search-box")) suggestions.classList.remove("show");
});

buildTable();
selectElement("H");

/* perodic table block wise filter option */

document.querySelectorAll('#legend span').forEach(item => {
  item.addEventListener('click', () => {
    const block = item.dataset.block;
    const wasActive = item.classList.contains('active');

    document.querySelectorAll('#legend span').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('dimmed'));

    if (!wasActive) {
      item.classList.add('active');
      document.querySelectorAll('.cell').forEach(c => {
        if (!c.classList.contains('block-' + block) &&
            !c.classList.contains('placeholder') &&
            !c.classList.contains('spacer')) {
          c.classList.add('dimmed');
        }
      });
    }
  });
});