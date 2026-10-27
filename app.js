const $ = (id) => document.getElementById(id);
const STORE_KEY = "mlbb_vault_tracker_v2";
const defaults = {
  diamonds:128, passes:1, passDays:12, passPrice:2.06,
  legendGoal:8000, legendFree:0, legendRate:1, legendDate:"",
  aspGoal:60, aspDone:40, aspCost:50, aspFree:20, aspPattern:"2-3-1-1",
  collabGoal:9000, collabFree:10, collabRate:50, collabDate:""
};
const inputs = Object.keys(defaults);
let deferredInstallPrompt = null;
let cycle = {nextClaimAt:Date.now()+86400000, instantBonus:0, prompted:false, lastClaimDay:""};
const DAY=86400000;
function num(id){const n=Number($(id).value);return Number.isFinite(n)?Math.max(0,n):0}
function int(id){return Math.floor(num(id))}
function fmt(n){return Math.round(n).toLocaleString("en-US")}
function money(n){return "$"+Math.max(0,n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}
function setText(id,value){$(id).textContent=value}
function clamp(n,min,max){return Math.min(max,Math.max(min,n))}
function readState(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}catch(e){return {}}}
function persist(){const state={};inputs.forEach(id=>{if($(id))state[id]=$(id).value});state.cycle=cycle;try{localStorage.setItem(STORE_KEY,JSON.stringify(state));setText("saveState","Guardado local")}catch(e){setText("saveState","No se pudo guardar")}}
function save(){persist()}
function load(){const state=readState();inputs.forEach(id=>{if(state[id]!==undefined&&$(id))$(id).value=state[id]});if(state.cycle)cycle={...cycle,...state.cycle};if(!Number.isFinite(Number(cycle.nextClaimAt)))cycle.nextClaimAt=Date.now()+DAY;}
function processElapsed(){
  const now=Date.now();let days=int("passDays");
  if(days>0 && now>=cycle.nextClaimAt){
    const elapsed=Math.floor((now-cycle.nextClaimAt)/DAY)+1;
    const claims=Math.min(days,elapsed);
    $("diamonds").value=String(num("diamonds")+claims*20);
    days-=claims;$("passDays").value=String(days);
    cycle.nextClaimAt += claims*DAY;
    if(days===0){cycle.nextClaimAt=now;cycle.prompted=false;}
    persist();
  }
  if(int("passDays")===0){setText("cycleStatus","Pase agotado");setText("nextClaimLabel","Sin reclamos activos");setText("claimsLeftLabel","0 días");if(!cycle.prompted){cycle.prompted=true;persist();setTimeout(promptRenewal,250)}}
  else {setText("cycleStatus","Ciclo activo");setText("nextClaimLabel",new Date(cycle.nextClaimAt).toLocaleString(undefined,{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}));setText("claimsLeftLabel",`${int("passDays")} días · ${fmt(int("passDays")*20)} 💎`)}
  setText("instantBonusLabel",`${fmt(cycle.instantBonus)} 💎`);
}
function promptRenewal(){if(int("passDays")!==0)return;const yes=confirm("Tu pase semanal llegó a cero. ¿Activaste/compraste un nuevo pase?\n\nPulsa Aceptar para registrar la cantidad; Cancelar si todavía no compraste.");if(yes)registerPasses();}
function registerPasses(){const raw=prompt("¿Cuántos pases semanales nuevos activaste?", "1");if(raw===null)return;const count=Math.floor(Number(raw));if(!Number.isFinite(count)||count<1){alert("Introduce una cantidad válida de 1 o más pases.");return;}const activeDays=int("passDays");const immediate=count*80;$("diamonds").value=String(num("diamonds")+immediate);cycle.instantBonus+=immediate;$("passes").value=String(int("passes")+count);
  if(activeDays>0){$("passDays").value=String(activeDays+count*7);}
  else { // Today's 20-diamond claim is granted once when buying from zero.
    $("diamonds").value=String(num("diamonds")+20);$("passDays").value=String(Math.max(0,count*7-1));cycle.nextClaimAt=Date.now()+DAY;
  }
  cycle.prompted=false;persist();processElapsed();update();
}
function getShared(){const diamonds=num("diamonds"),days=clamp(int("passDays"),0,1000),pending=days*20;return{diamonds,passes:int("passes"),passDays:days,passPrice:num("passPrice"),effective:diamonds+pending,pending}}
function update(){const g=getShared();setText("pendingPreview",`${fmt(g.pending)} diamantes futuros estimados · ${g.passDays} días`);$("effectiveDiamonds").innerHTML=`${fmt(g.effective)} <small>diamantes</small>`;$("passValue").innerHTML=`${money(g.passPrice)} <small>/ pase</small>`;const priority=$("priorityGoal").value;setText("prioritySummary",`${fmt(g.effective)} diamantes`);setText("prioritySummaryNote",`Asignados solo a: ${{legend:"Legend futura",aspirants:"Aspirantes",collab:"Jujutsu Kaisen"}[priority]}.`);
  const lgGoal=num("legendGoal"),lgFree=num("legendFree")*Math.max(1,num("legendRate")),lgNet=Math.max(0,lgGoal-lgFree),lgAllocated=priority==="legend"?g.effective:0,lgMissing=Math.max(0,lgNet-lgAllocated),lgPasses=Math.ceil(lgMissing/220),lgPct=lgGoal?clamp((lgAllocated+lgFree)/lgGoal*100,0,100):100;setText("legendPercent",`${Math.round(lgPct)}%`);$("legendProgress").style.width=`${lgPct}%`;setText("legendMissing",fmt(lgMissing));setText("legendPasses",fmt(lgPasses));setText("legendCost",money(lgPasses*g.passPrice));setText("legendTime",`${Math.ceil(lgPasses)} semanas`);setText("legendStatus",priority==="legend"?(lgMissing===0?"¡Meta cubierta según los valores actuales! Confirma las reglas oficiales del evento antes de gastar.":`Te faltan ${fmt(lgMissing)} diamantes estimados después de asignar el fondo global.`):"No es el objetivo prioritario. El saldo global no se descuenta aquí para evitar contar los mismos diamantes dos veces.");const legendCard=document.querySelector(".legend-result");legendCard.classList.toggle("is-priority",priority==="legend");legendCard.classList.toggle("non-priority",priority!=="legend");updateAllocationBadge(legendCard,priority==="legend");
  const ag=Math.max(1,int("aspGoal")),done=Math.min(int("aspDone"),ag),free=int("aspFree"),pullsLeft=Math.max(0,ag-done-free),aspCost=pullsLeft*num("aspCost"),aspAllocated=priority==="aspirants"?g.effective:0,aspMissing=Math.max(0,aspCost-aspAllocated),aspPct=clamp(done/ag*100,0,100),aspPasses=Math.ceil(aspMissing/220);setText("aspPercent",`${Math.round(aspPct)}%`);$("aspProgress").style.width=`${aspPct}%`;setText("aspRemaining",fmt(pullsLeft));setText("aspDiamonds",fmt(aspCost));setText("aspMissing",fmt(aspMissing));setText("aspPasses",fmt(aspPasses));const pattern=($("aspPattern").value||"").trim();setText("aspStatus",`Patrón registrado: ${pattern||"sin datos"}. ${priority==="aspirants"?"Fondo global aplicado una sola vez":"Este escenario no usa el saldo global mientras no sea prioritario"}; un patrón no garantiza el resultado.`);const aspCard=document.querySelector(".violet-result");aspCard.classList.toggle("is-priority",priority==="aspirants");aspCard.classList.toggle("non-priority",priority!=="aspirants");updateAllocationBadge(aspCard,priority==="aspirants");
  const cg=num("collabGoal"),cf=int("collabFree")*num("collabRate"),cNet=Math.max(0,cg-cf),cAllocated=priority==="collab"?g.effective:0,cmissing=Math.max(0,cNet-cAllocated),cpct=cg?clamp((cAllocated+cf)/cg*100,0,100):100,cpasses=Math.ceil(cmissing/220);setText("collabPercent",`${Math.round(cpct)}%`);$("collabProgress").style.width=`${cpct}%`;setText("collabCost",fmt(cNet));setText("collabMissing",fmt(cmissing));setText("collabPasses",fmt(cpasses));setText("collabMoney",money(cpasses*g.passPrice));setText("collabStatus",priority==="collab"?(cmissing===0?"La meta estimada está cubierta. Verifica las reglas y precios del evento antes de gastar.":`Faltan ${fmt(cmissing)} diamantes después de aplicar el fondo global.`):"Este escenario no usa el saldo global mientras no sea prioritario; así no se contabilizan los mismos diamantes dos veces.");const collabCard=document.querySelector(".red-result");collabCard.classList.toggle("is-priority",priority==="collab");collabCard.classList.toggle("non-priority",priority!=="collab");updateAllocationBadge(collabCard,priority==="collab");}
function updateAllocationBadge(card,isPriority){let badge=card.querySelector(".allocation-label");if(!badge){badge=document.createElement("span");badge.className="allocation-label";card.querySelector(".result-kicker").insertAdjacentElement("afterend",badge)}badge.textContent=isPriority?"✓ OBJETIVO PRIORITARIO · FONDO APLICADO":"FONDO GLOBAL NO ASIGNADO"}
document.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>{update();save()}));$("priorityGoal").addEventListener("change",()=>{update();save()});document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(t=>{const active=t===tab;t.classList.toggle("active",active);t.setAttribute("aria-selected",String(active))});document.querySelectorAll(".tab-panel").forEach(p=>{const active=p.id===`panel-${tab.dataset.tab}`;p.hidden=!active;p.classList.toggle("active",active)})}));
$("resetBtn").addEventListener("click",()=>{if(!confirm("¿Restablecer todos los valores del tracker a los iniciales?"))return;Object.entries(defaults).forEach(([id,value])=>$(id).value=value);cycle={nextClaimAt:Date.now()+DAY,instantBonus:0,prompted:false,lastClaimDay:""};persist();update()});$("registerPassBtn").addEventListener("click",registerPasses);$("syncClockBtn").addEventListener("click",()=>{processElapsed();update();save()});$("settingsBtn").addEventListener("click",()=>$ ("settingsDialog").showModal());
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false});$("installBtn").addEventListener("click",async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$("installBtn").hidden=true});
load();processElapsed();update();setInterval(()=>{processElapsed();update()},60000);
