const $ = (id) => document.getElementById(id);
const STORE_KEY = "mlbb_vault_tracker_v1";
const defaults = {
  diamonds:128, passes:1, passDays:12, passPrice:2.06,
  legendGoal:8000, legendFree:0, legendRate:1, legendDate:"",
  aspGoal:60, aspDone:40, aspCost:50, aspFree:20, aspPattern:"2-3-1-1",
  collabGoal:9000, collabFree:10, collabRate:50, collabDate:""
};
const inputs = Object.keys(defaults);
let deferredInstallPrompt = null;
function num(id){const n=Number($(id).value);return Number.isFinite(n)?Math.max(0,n):0}
function int(id){return Math.floor(num(id))}
function fmt(n){return Math.round(n).toLocaleString("en-US")}
function money(n){return "$"+Math.max(0,n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function setText(id,value){$(id).textContent=value}
function clamp(n,min,max){return Math.min(max,Math.max(min,n))}
function getShared(){
  const diamonds=num("diamonds"), days=clamp(int("passDays"),0,70);
  // User can adjust days remaining; estimate 20 diamonds per remaining day.
  const pending=days*20;
  return {diamonds, passes:int("passes"), passDays:days, passPrice:num("passPrice"), effective:diamonds+pending, pending};
}
function update(){
  const g=getShared();
  setText("pendingPreview",`${fmt(g.pending)} diamantes pendientes estimados`);
  $("effectiveDiamonds").innerHTML=`${fmt(g.effective)} <small>diamantes</small>`;
  $("passValue").innerHTML=`${money(g.passPrice)} <small>/ pase</small>`;
  const priority=$("priorityGoal").value;
  setText("prioritySummary",`${fmt(g.effective)} diamantes`);
  setText("prioritySummaryNote",`Asignados solo a: ${{legend:"Legend futura",aspirants:"Aspirantes",collab:"Jujutsu Kaisen"}[priority]}.`);
  // Legend goal. Shared balance is applied only if Legend is the selected priority.
  const lgGoal=num("legendGoal"), lgFree=num("legendFree")*Math.max(1,num("legendRate"));
  const lgNet=Math.max(0,lgGoal-lgFree), lgAllocated=priority==="legend"?g.effective:0, lgMissing=Math.max(0,lgNet-lgAllocated);
  const lgPasses=Math.ceil(lgMissing/220), lgPct=lgGoal?clamp((lgAllocated+lgFree)/lgGoal*100,0,100):100;
  setText("legendPercent",`${Math.round(lgPct)}%`);$("legendProgress").style.width=`${lgPct}%`;
  setText("legendMissing",fmt(lgMissing));setText("legendPasses",fmt(lgPasses));
  setText("legendCost",money(lgPasses*g.passPrice));setText("legendTime",`${Math.ceil(lgPasses)} semanas`);
  setText("legendStatus",priority==="legend"?(lgMissing===0?"¡Meta cubierta según los valores actuales! Confirma las reglas oficiales del evento antes de gastar.":`Te faltan ${fmt(lgMissing)} diamantes estimados después de asignar el fondo global.`):`No es el objetivo prioritario. El saldo global no se descuenta aquí para evitar contar los mismos diamantes dos veces.`);
  const legendCard=document.querySelector(".legend-result");legendCard.classList.toggle("is-priority",priority==="legend");legendCard.classList.toggle("non-priority",priority!=="legend");updateAllocationBadge(legendCard,priority==="legend");
  // Aspirants. Free tickets reduce remaining pulls; shared wallet only applies to selected priority.
  const ag=Math.max(1,int("aspGoal")), done=Math.min(int("aspDone"),ag), free=int("aspFree");
  const pullsLeft=Math.max(0,ag-done-free), aspCost=pullsLeft*num("aspCost"), aspAllocated=priority==="aspirants"?g.effective:0, aspMissing=Math.max(0,aspCost-aspAllocated);
  const aspPct=clamp(done/ag*100,0,100), aspPasses=Math.ceil(aspMissing/220);
  setText("aspPercent",`${Math.round(aspPct)}%`);$("aspProgress").style.width=`${aspPct}%`;
  setText("aspRemaining",fmt(pullsLeft));setText("aspDiamonds",fmt(aspCost));setText("aspMissing",fmt(aspMissing));setText("aspPasses",fmt(aspPasses));
  const pattern=($("aspPattern").value||"").trim();
  setText("aspStatus",priority==="aspirants"?`Patrón registrado: ${pattern||"sin datos"}. Fondo global aplicado una sola vez; un patrón no garantiza el resultado.`:`Patrón registrado: ${pattern||"sin datos"}. Este escenario no usa el saldo global mientras no sea prioritario; un patrón no garantiza el resultado.`);
  const aspCard=document.querySelector(".violet-result");aspCard.classList.toggle("is-priority",priority==="aspirants");aspCard.classList.toggle("non-priority",priority!=="aspirants");updateAllocationBadge(aspCard,priority==="aspirants");
  // Collaboration budget; shared wallet is assigned only when this goal is prioritized.
  const cg=num("collabGoal"), cf=int("collabFree")*num("collabRate"), cNet=Math.max(0,cg-cf), cAllocated=priority==="collab"?g.effective:0, cmissing=Math.max(0,cNet-cAllocated);
  const cpct=cg?clamp((cAllocated+cf)/cg*100,0,100):100, cpasses=Math.ceil(cmissing/220);
  setText("collabPercent",`${Math.round(cpct)}%`);$("collabProgress").style.width=`${cpct}%`;
  setText("collabCost",fmt(cNet));setText("collabMissing",fmt(cmissing));setText("collabPasses",fmt(cpasses));setText("collabMoney",money(cpasses*g.passPrice));
  setText("collabStatus",priority==="collab"?(cmissing===0?"La meta estimada está cubierta. Verifica las reglas y precios del evento antes de gastar.":`Faltan ${fmt(cmissing)} diamantes después de aplicar el fondo global.`):`Este escenario no usa el saldo global mientras no sea prioritario; así no se contabilizan los mismos diamantes dos veces.`);
  const collabCard=document.querySelector(".red-result");collabCard.classList.toggle("is-priority",priority==="collab");collabCard.classList.toggle("non-priority",priority!=="collab");updateAllocationBadge(collabCard,priority==="collab");
}
function updateAllocationBadge(card,isPriority){
  let badge=card.querySelector(".allocation-label");
  if(!badge){badge=document.createElement("span");badge.className="allocation-label";const kicker=card.querySelector(".result-kicker");kicker.insertAdjacentElement("afterend",badge)}
  badge.textContent=isPriority?"✓ OBJETIVO PRIORITARIO · FONDO APLICADO":"FONDO GLOBAL NO ASIGNADO";
}

function save(){
  const state={};inputs.forEach(id=>{if($(id))state[id]=$(id).value});
  try{localStorage.setItem(STORE_KEY,JSON.stringify(state));setText("saveState","Guardado local");}catch(e){setText("saveState","No se pudo guardar");}
}
function load(){
  try{const state=JSON.parse(localStorage.getItem(STORE_KEY)||"{}");inputs.forEach(id=>{if(state[id]!==undefined&&$(id))$(id).value=state[id]});}catch(e){}
}
document.querySelectorAll("input").forEach(el=>el.addEventListener("input",update));
$("priorityGoal").addEventListener("change",update);
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(t=>{const active=t===tab;t.classList.toggle("active",active);t.setAttribute("aria-selected",String(active))});
  document.querySelectorAll(".tab-panel").forEach(p=>{const active=p.id===`panel-${tab.dataset.tab}`;p.hidden=!active;p.classList.toggle("active",active)});
}));
$("resetBtn").addEventListener("click",()=>{
  if(!confirm("¿Restablecer todos los valores del tracker a los iniciales?"))return;
  Object.entries(defaults).forEach(([id,value])=>$(id).value=value);
  update();
});
$("settingsBtn").addEventListener("click",()=>$("settingsDialog").showModal());
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",async()=>{
  if(!deferredInstallPrompt)return;
  deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true;
});
load();update();
