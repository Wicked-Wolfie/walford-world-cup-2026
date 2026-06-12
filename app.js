
const TEAMS = window.TEAMS;
const OWNERS = ["David","Debbie","Charlotte","Dan","Matt","Marnie","Myles"];
const STAGES = {"Group Stage":0,"Round of 16":3,"Quarter-final":6,"Semi-final":10,"Final":15,"Winner":25,"Eliminated":0};
const defaultState = {
  matches:[
    {date:"2026-06-01",teamA:"Mexico",teamB:"South Africa",scoreA:2,scoreB:0},
    {date:"2026-06-02",teamA:"South Korea",teamB:"Czechia",scoreA:2,scoreB:1}
  ],
  stages:Object.fromEntries(TEAMS.map(t=>[t.team,"Group Stage"]))
};
let state = JSON.parse(localStorage.getItem("walfordWebsiteState") || JSON.stringify(defaultState));

function save(){localStorage.setItem("walfordWebsiteState", JSON.stringify(state))}
function team(team){return TEAMS.find(t=>t.team===team)}
function owner(teamName){return team(teamName)?.owner || ""}
function flag(teamName){return team(teamName)?.flag || ""}
function matchPts(){
  const pts = Object.fromEntries(TEAMS.map(t=>[t.team,0]));
  state.matches.forEach(m=>{
    let a=Number(m.scoreA), b=Number(m.scoreB);
    if(a>b) pts[m.teamA]+=3;
    else if(a<b) pts[m.teamB]+=3;
    else {pts[m.teamA]+=1; pts[m.teamB]+=1}
  });
  return pts;
}
function totals(){
  const mp = matchPts();
  return TEAMS.map(t=>{
    const bonus = STAGES[state.stages[t.team] || "Group Stage"] || 0;
    return {...t, match:mp[t.team]||0, bonus, total:(mp[t.team]||0)+bonus, stage:state.stages[t.team]||"Group Stage"}
  });
}
function leaderboard(){
  const score = Object.fromEntries(OWNERS.map(o=>[o,0]));
  totals().forEach(t=>score[t.owner]+=t.total);
  return OWNERS.map(o=>({owner:o,total:score[o]})).sort((a,b)=>b.total-a.total || a.owner.localeCompare(b.owner));
}
function init(){
  const opts = TEAMS.map(t=>`<option value="${t.team}">${t.flag} ${t.team}</option>`).join("");
  teamA.innerHTML=opts; teamB.innerHTML=opts; teamA.value="Mexico"; teamB.value="South Africa";
  render();
}
function render(){
  save();
  const lb = leaderboard();
  const tt = totals().sort((a,b)=>b.total-a.total)[0];
  heroLeader.textContent = lb[0].owner;
  heroPoints.textContent = lb[0].total + " pts";
  statLeader.textContent = lb[0].owner + " (" + lb[0].total + ")";
  statMatches.textContent = state.matches.length;
  statTeam.textContent = tt.flag + " " + tt.team + " (" + tt.total + ")";
  statAlive.textContent = totals().filter(t=>t.stage!=="Eliminated").length;
  leaderboard.innerHTML = lb.map((r,i)=>`<div class="leader-row"><div class="medal">${i+1}</div><div><strong>${r.owner}</strong><br><span>${ownedTeams(r.owner).length} teams</span></div><div class="points">${r.total}</div></div>`).join("");
  favourite.textContent = `${lb[0].owner}, ${lb[0].total} pts`;
  flop.textContent = `${lb[lb.length-1].owner}, ${lb[lb.length-1].total} pts`;
  const dRank = lb.findIndex(x=>x.owner==="David")+1, dPts=lb.find(x=>x.owner==="David").total;
  davidWatch.textContent = `${dRank}${suffix(dRank)} place, ${lb[0].total-dPts} behind`;
  const eng = totals().find(t=>t.team==="England");
  englandWatch.textContent = `${eng.stage}, ${eng.total} pts`;
  teamTournament.textContent = `${tt.flag} ${tt.team}, ${tt.total} pts`;
  renderResults(); renderDraw(); renderTeams(); renderBonuses(); renderPoster();
}
function ownedTeams(o){return TEAMS.filter(t=>t.owner===o)}
function suffix(n){return n===1?"st":n===2?"nd":n===3?"rd":"th"}
function renderResults(){
  resultsList.innerHTML = state.matches.map((m,i)=>{
    let a=Number(m.scoreA), b=Number(m.scoreB), pa=a>b?3:a===b?1:0, pb=b>a?3:a===b?1:0;
    return `<div class="result-item"><div><strong>${flag(m.teamA)} ${m.teamA}</strong> v <strong>${flag(m.teamB)} ${m.teamB}</strong><br><span>${m.date||""} • ${owner(m.teamA)} +${pa}, ${owner(m.teamB)} +${pb}</span></div><div class="result-score">${a}–${b}</div><button class="small-btn" onclick="deleteMatch(${i})">Delete</button></div>`
  }).join("");
}
function renderDraw(){
  drawGrid.innerHTML = OWNERS.map(o=>`<article class="draw-card"><h3>${o}</h3>${ownedTeams(o).map(t=>`<span class="team-pill">${t.flag} ${t.team}</span>`).join("")}</article>`).join("");
}
function renderPoster(){
  posterDraw.innerHTML = OWNERS.map(o=>`<div class="poster-box"><strong>${o}</strong>${ownedTeams(o).map(t=>`${t.flag} ${t.team}`).join("<br>")}</div>`).join("");
}
function renderTeams(){
  const q=(search.value||"").toLowerCase();
  const rows = totals().filter(t=>(t.team+t.owner).toLowerCase().includes(q));
  teamTable.innerHTML = `<div class="table-row table-head"><div>Team</div><div>Owner</div><div>Match</div><div>Bonus</div><div>Total</div><div>Stage</div></div>` +
    rows.map(t=>`<div class="table-row"><div>${t.flag} <strong>${t.team}</strong></div><div>${t.owner}</div><div>${t.match}</div><div>${t.bonus}</div><div class="total">${t.total}</div><div>${t.stage}</div></div>`).join("");
}
function renderBonuses(){
  bonusGrid.innerHTML = TEAMS.map(t=>{
    const options = Object.keys(STAGES).map(s=>`<option ${state.stages[t.team]===s?"selected":""}>${s}</option>`).join("");
    return `<div class="bonus-row"><div>${t.flag} <strong>${t.team}</strong><br><span>${t.owner}</span></div><select onchange="setStage('${t.team.replaceAll("'","\'")}', this.value)">${options}</select></div>`
  }).join("");
}
function deleteMatch(i){state.matches.splice(i,1); render()}
function setStage(t,s){state.stages[t]=s; render()}
resultForm.addEventListener("submit", e=>{
  e.preventDefault();
  if(teamA.value===teamB.value) return alert("Choose two different teams");
  state.matches.push({date:date.value, teamA:teamA.value, teamB:teamB.value, scoreA:Number(scoreA.value), scoreB:Number(scoreB.value)});
  scoreA.value=""; scoreB.value=""; render();
});
search.addEventListener("input", renderTeams);
init();
