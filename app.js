const OWNERS=["David","Dubs","Lottie","Dan","Matt","Marnie","Myles"];
const STAGES={"Group Stage":0,"Round of 16":3,"Quarter-final":6,"Semi-final":10,"Final":15,"Winner":25,"Eliminated":0};
let db=null, teams=window.FALLBACK_TEAMS||[], results=[], fixtures=window.FALLBACK_FIXTURES||[], session=null;
function ready(){return window.supabase && typeof SUPABASE_ANON_KEY==="string" && !SUPABASE_ANON_KEY.includes("PASTE_")}
if(ready()) db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
function flag(t){return teams.find(x=>x.team===t)?.flag||""}
function owner(t){return teams.find(x=>x.team===t)?.owner||""}
function flagEmoji(code, teamName){return (window.FALLBACK_TEAMS||[]).find(t=>t.team===teamName||t.code===code)?.flag || code || ""}
function todayISO(){return new Date().toISOString().slice(0,10)}

async function loadData(){
 if(!db){render();return}
 const {data:teamData}=await db.from("teams").select("*").order("id");
 if(teamData?.length) teams=teamData.map(t=>({code:t.flag,flag:flagEmoji(t.flag,t.team),team:t.team,owner:renameOwner(t.owner),stage:t.stage||"Group Stage"}));
 const {data:matchData}=await db.from("results").select("*").order("match_date",{ascending:true}).order("id",{ascending:true});
 results=(matchData||[]).map(r=>({id:r.id,date:r.match_date,teamA:r.team_a,teamB:r.team_b,scoreA:r.score_a,scoreB:r.score_b}));
 try{
  const {data:fixtureData}=await db.from("fixtures").select("*").order("match_date",{ascending:true}).order("kickoff_gmt",{ascending:true});
  if(fixtureData?.length) fixtures=fixtureData.map(f=>({date:f.match_date,time:f.kickoff_gmt,team_a:f.team_a,team_b:f.team_b}));
 }catch(e){}
 const {data:sess}=await db.auth.getSession(); session=sess.session; render();
}
function renameOwner(o){if(o==="Debbie")return"Dubs"; if(o==="Charlotte")return"Lottie"; return o}

function groupStats(){
 const stats=Object.fromEntries(teams.map(t=>[t.team,{...t,P:0,W:0,D:0,L:0,GF:0,GA:0,GD:0,Pts:0}]));
 results.forEach(m=>{const a=Number(m.scoreA),b=Number(m.scoreB),A=stats[m.teamA],B=stats[m.teamB]; if(!A||!B)return; A.P++;B.P++;A.GF+=a;A.GA+=b;B.GF+=b;B.GA+=a;if(a>b){A.W++;B.L++;A.Pts+=3}else if(a<b){B.W++;A.L++;B.Pts+=3}else{A.D++;B.D++;A.Pts++;B.Pts++}});
 Object.values(stats).forEach(s=>s.GD=s.GF-s.GA);
 return Object.values(stats).sort((a,b)=>b.Pts-a.Pts||b.GD-a.GD||b.GF-a.GF||a.team.localeCompare(b.team));
}
function teamTotals(){const gs=Object.fromEntries(groupStats().map(s=>[s.team,s]));return teams.map(t=>{const g=gs[t.team]||{};const bonus=STAGES[t.stage||"Group Stage"]||0;return{...t,match:g.Pts||0,bonus,total:(g.Pts||0)+bonus,stage:t.stage||"Group Stage",gd:g.GD||0}})}
function leaderboardData(){const scores=Object.fromEntries(OWNERS.map(o=>[o,0]));teamTotals().forEach(t=>scores[t.owner]=(scores[t.owner]||0)+t.total);return OWNERS.map(o=>({owner:o,total:scores[o]||0,teams:teams.filter(t=>t.owner===o).length})).sort((a,b)=>b.total-a.total||a.owner.localeCompare(b.owner))}
function fillSelects(){const opts=teams.map(t=>`<option value="${t.team}">${t.flag} ${t.team}</option>`).join("");[teamA,teamB,fixtureTeamA,fixtureTeamB].forEach(s=>{if(s.innerHTML!==opts)s.innerHTML=opts});teamA.value=teamA.value||"Mexico";teamB.value=teamB.value||"South Africa";}

function render(){
 fillSelects(); if(!todayDate.value) todayDate.value=todayISO();
 const lb=leaderboardData(), totals=teamTotals().sort((a,b)=>b.total-a.total||a.team.localeCompare(b.team)), top=totals[0]||{}, gs=groupStats();
 currentLeader.textContent=lb[0]?.owner||"—"; currentLeaderPoints.textContent=(lb[0]?.total||0)+" pts";
 leaderStat.textContent=`${lb[0]?.owner||"—"} (${lb[0]?.total||0})`; matchStat.textContent=results.length; nationStat.textContent=top.team?`${top.flag} ${top.team} (${top.total})`:"—";
 const todayGames=fixtures.filter(f=>f.date===todayDate.value); feudStat.textContent=todayGames[0]?`${owner(todayGames[0].team_a)} v ${owner(todayGames[0].team_b)}`:"—";
 leaderboard.innerHTML=lb.map((r,i)=>`<div class="leader-row"><div class="rank">${i+1}</div><div><strong>${r.owner}</strong><br><span>${r.teams} teams</span></div><div class="pts">${r.total}</div></div>`).join("");
 const max=Math.max(1,...lb.map(x=>x.total)); chart.innerHTML=lb.map(r=>`<div class="bar-row"><strong>${r.owner}</strong><div class="bar" style="width:${Math.max(4,r.total/max*100)}%"></div><span>${r.total}</span></div>`).join("");
 resultsList.innerHTML=results.length?results.slice().reverse().map(m=>{const a=Number(m.scoreA),b=Number(m.scoreB),pa=a>b?3:a===b?1:0,pb=b>a?3:a===b?1:0;return`<div class="result-item"><div><strong>${flag(m.teamA)} ${m.teamA}</strong> v <strong>${flag(m.teamB)} ${m.teamB}</strong><br><span>${m.date||""} • ${owner(m.teamA)} +${pa}, ${owner(m.teamB)} +${pb}</span></div><div class="result-score">${a}–${b}</div></div>`}).join(""):"<p>No results yet.</p>";
 renderToday(); renderGroupTable(gs); renderTeams(); renderDraw(); renderBanter(lb,totals,gs,todayGames);
 loginForm.classList.toggle("hidden",!!session); resultForm.classList.toggle("hidden",!session); fixtureForm.classList.toggle("hidden",!session);
 adminStatus.textContent=session?`Signed in as ${session.user.email}`:(db?"Sign in to enter scores and fixtures.":"Supabase key not set yet.");
}
function renderToday(){
 const games=fixtures.filter(f=>f.date===todayDate.value);
 todayMatches.innerHTML=games.length?games.map(f=>{
  const oa=owner(f.team_a), ob=owner(f.team_b);
  return `<article class="today-card"><div class="today-time">${f.time||"TBC"} GMT</div><h3>${flag(f.team_a)} ${f.team_a} v ${flag(f.team_b)} ${f.team_b}</h3><div class="owners-line">${oa} v ${ob}</div><p class="banter-copy">“${banterFor(oa,ob,f.team_a,f.team_b)}”</p></article>`
 }).join(""):"<p>No fixtures loaded for this date yet.</p>";
}
function renderGroupTable(gs){const q=(groupSearch.value||"").toLowerCase();const rows=gs.filter(s=>(s.team+s.owner).toLowerCase().includes(q));groupTable.innerHTML='<div class="table-row table-head"><div>Team</div><div>Owner</div><div>P</div><div>W</div><div>D</div><div>L</div><div>GF</div><div>GA</div><div>GD</div><div>Pts</div></div>'+rows.map(s=>`<div class="table-row"><div>${s.flag} <strong>${s.team}</strong></div><div>${s.owner}</div><div>${s.P}</div><div>${s.W}</div><div>${s.D}</div><div>${s.L}</div><div>${s.GF}</div><div>${s.GA}</div><div>${s.GD}</div><div class="pts-cell">${s.Pts}</div></div>`).join("")}
function renderTeams(){const q=(teamSearch.value||"").toLowerCase();const rows=teamTotals().filter(t=>(t.team+t.owner).toLowerCase().includes(q));teamTable.innerHTML='<div class="table-row table-head"><div>Team</div><div>Owner</div><div>Match</div><div>Bonus</div><div>Total</div><div>Stage</div></div>'+rows.map(t=>`<div class="table-row"><div>${t.flag} <strong>${t.team}</strong></div><div>${t.owner}</div><div>${t.match}</div><div>${t.bonus}</div><div class="total">${t.total}</div><div>${t.stage}</div></div>`).join("")}
function renderDraw(){drawGrid.innerHTML=OWNERS.map(o=>`<article class="draw-card"><h3>${o}</h3>${teams.filter(t=>t.owner===o).map(t=>`<span class="pill">${t.flag} ${t.team}</span>`).join("")}</article>`).join("")}
function renderBanter(lb,totals,gs,todayGames){const dRank=lb.findIndex(x=>x.owner==="David")+1,dPts=lb.find(x=>x.owner==="David")?.total||0,eng=totals.find(t=>t.team==="England")||{},feud=todayGames[0];banterFavourite.textContent=`${lb[0]?.owner||"—"}, ${lb[0]?.total||0} pts`;banterFlop.textContent=`${lb[lb.length-1]?.owner||"—"}, ${lb[lb.length-1]?.total||0} pts`;banterDavid.textContent=`${dRank}${suffix(dRank)} place, ${(lb[0]?.total||0)-dPts} behind`;banterEngland.textContent=`${eng.stage||"Group Stage"}, ${eng.total||0} pts`;banterTeam.textContent=totals[0]?`${totals[0].flag} ${totals[0].team}, ${totals[0].total} pts`:"—";banterFeud.textContent=feud?`${owner(feud.team_a)} v ${owner(feud.team_b)} — ${banterFor(owner(feud.team_a),owner(feud.team_b),feud.team_a,feud.team_b)}`:"Awaiting today’s fixtures"}
function suffix(n){return n===1?"st":n===2?"nd":n===3?"rd":"th"}

function banterFor(a,b,ta,tb){
 if(a===b)return `${a} has both teams here. A rare stress-free ninety minutes.`;
 const pair=[a,b].sort().join("|");
 const lines={
  "David|Dubs":"Domestic derby. Winner controls the remote and the moral high ground.",
  "David|Lottie":"Dad versus daughter. Family pride is absolutely on the line.",
  "Dubs|Lottie":"Mum versus daughter. Someone is getting a very pointed WhatsApp afterwards.",
  "David|Matt":"Father versus son. The old guard meets Uncle Big Apple.",
  "Dubs|Matt":"Mum versus son. Dubs expects respect, Matt expects points.",
  "Dan|Lottie":"Husband versus wife. A peaceful evening is not guaranteed.",
  "Dan|David":"Son-in-law trying to impress the father-in-law. Dangerous territory.",
  "Dan|Dubs":"Dan attempting to stay in Dubs’ good books. Again.",
  "Dan|Marnie":"Dad versus daughter. No pocket money points available.",
  "Dan|Myles":"Dad versus son. Tactical lecture incoming either way.",
  "Lottie|Marnie":"Mum versus daughter. No mercy expected.",
  "Lottie|Myles":"Mum versus son. Myles has been warned.",
  "Marnie|Myles":"Sibling rivalry has officially reached World Cup level.",
  "Marnie|Matt":"Uncle Matt from the Big Apple faces Marnie. Transatlantic bragging rights.",
  "Matt|Myles":"Uncle Matt attempts to teach Myles a footballing lesson from New York.",
  "Dubs|Marnie":"Grandmother versus granddaughter. Dubs may be smiling, but she wants the points.",
  "David|Marnie":"Grandad versus granddaughter. Miracle Watch meets next generation ambition.",
  "Dubs|Myles":"Grandmother versus grandson. Myles should expect absolutely no sympathy.",
  "David|Myles":"Grandad versus grandson. David’s Miracle Watch faces youthful confidence."
 };
 return lines[pair] || `${a} versus ${b}. ${ta} and ${tb} have been dragged into family politics.`;
}

adminToggle.onclick=()=>adminPanel.classList.toggle("hidden"); teamSearch.oninput=renderTeams; groupSearch.oninput=()=>renderGroupTable(groupStats()); todayDate.onchange=render; showTodayBtn.onclick=renderToday;
loginForm.onsubmit=async e=>{e.preventDefault(); if(!db)return alert("Supabase key not configured."); const {error}=await db.auth.signInWithPassword({email:email.value,password:password.value}); if(error)return alert(error.message); await loadData()}
logoutBtn.onclick=async()=>{await db.auth.signOut(); await loadData()}
resultForm.onsubmit=async e=>{e.preventDefault(); if(!session)return alert("Please sign in first."); const payload={match_date:matchDate.value,team_a:teamA.value,team_b:teamB.value,score_a:Number(scoreA.value),score_b:Number(scoreB.value)}; if(payload.team_a===payload.team_b)return alert("Choose two different teams."); const {error}=await db.from("results").insert([payload]); if(error){console.error(error);return alert("Could not save result. Check Supabase policies.");} scoreA.value="";scoreB.value="";await loadData()}
fixtureForm.onsubmit=async e=>{e.preventDefault(); if(!session)return alert("Please sign in first."); const payload={match_date:fixtureDate.value,kickoff_gmt:fixtureTime.value,team_a:fixtureTeamA.value,team_b:fixtureTeamB.value}; if(payload.team_a===payload.team_b)return alert("Choose two different teams."); if(db){const {error}=await db.from("fixtures").insert([payload]); if(error){console.error(error);return alert("Could not save fixture. Have you created the fixtures table?");}} else fixtures.push({date:payload.match_date,time:payload.kickoff_gmt,team_a:payload.team_a,team_b:payload.team_b}); await loadData()}
loadData();
