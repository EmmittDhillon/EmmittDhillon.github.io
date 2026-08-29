const data = {
  home: {
    title:"Good afternoon",
    subtitle:"Your personal knowledge system — built to compound over time.",
    render: renderHome
  },
  medicine:{title:"Medicine",subtitle:"Clinical knowledge built for real-world outpatient practice.",render:()=>renderCategory("Medicine",medicineCards)},
  finance:{title:"Finance",subtitle:"Build financial knowledge that compounds alongside your career.",render:()=>renderCategory("Finance",financeCards)},
  career:{title:"Career",subtitle:"Professional development, opportunities, negotiation and long-term direction.",render:()=>renderCategory("Career",careerCards)},
  projects:{title:"Projects",subtitle:"Turn ideas into tangible outcomes.",render:renderProjects},
  knowledge:{title:"Knowledge",subtitle:"Concepts, mental models, lessons and questions worth remembering.",render:()=>renderCategory("Knowledge",knowledgeCards)},
  life:{title:"Life",subtitle:"The things that make life richer outside of work.",render:()=>renderCategory("Life",lifeCards)},
  resources:{title:"Resources",subtitle:"Books, articles, courses, people and other useful sources.",render:renderResources},
  inbox:{title:"Inbox",subtitle:"Capture now. Process later.",render:renderInbox},
  settings:{title:"Settings",subtitle:"Customize your knowledge system.",render:renderSettings}
};

const medicineCards=[
 ["✚","Outpatient IM","The practical reference for common complaints, chronic disease and preventive care.","Clinical conditions"],
 ["♥","Cardiology","HTN, HLD, CAD, HF, AF, HCM, chest pain and palpitations.","Clinical specialty"],
 ["◉","Endocrinology","Diabetes, thyroid disease, obesity, osteoporosis and adrenal disorders.","Clinical specialty"],
 ["◌","Pulmonary","Asthma, COPD, OSA, chronic cough and pulmonary nodules.","Clinical specialty"],
 ["▣","GI","GERD, IBS, constipation, liver disease and screening.","Clinical specialty"],
 ["⌁","Nephrology","CKD, AKI, proteinuria, hematuria and electrolyte disorders.","Clinical specialty"],
 ["+","Preventive Care","Cancer screening, vaccines, ASCVD prevention and counseling.","Clinical reference"],
 ["↗","Clinical Algorithms","Fast, decision-oriented workflows for the clinic.","High-yield"],
 ["✦","Clinical Pearls","Short lessons worth remembering.","High-yield"]
];
const financeCards=[
 ["$","Personal Finance","Cash flow, budgeting, insurance and financial organization.","Foundation"],
 ["◈","Investing","Asset allocation, valuation, equities, ETFs and market lessons.","Wealth"],
 ["⌂","Real Estate","Deal analysis, financing, rental properties and development.","Wealth"],
 ["%","Taxes","Tax planning, deductions, retirement accounts and California considerations.","Planning"],
 ["∞","Retirement","401(k), IRA, HSA and long-term retirement strategy.","Planning"],
 ["↗","Financial Independence","Track the path from attending income to financial freedom.","Goals"]
];
const careerCards=[
 ["★","Current Job","Onboarding, workflow, clinical efficiency and lessons from practice.","Now"],
 ["◎","Career Goals","1-, 3-, 5- and 10-year professional direction.","Planning"],
 ["§","Contracts","Compensation, benefits, termination, restrictive covenants and negotiation.","Reference"],
 ["↔","Negotiation","Principles, scripts, preparation and lessons learned.","Skill"],
 ["◇","Leadership","Management, communication, systems and organizational thinking.","Skill"],
 ["▤","Professional Development","CME, teaching, networking and skills to build.","Growth"]
];
const knowledgeCards=[
 ["◇","Concepts","A durable explanation of something worth understanding.","Core"],
 ["◎","Mental Models","Frameworks that improve decisions across domains.","Thinking"],
 ["✦","Lessons","What experience, mistakes and projects taught you.","Experience"],
 ["?","Questions","Things you want to investigate rather than forget.","Curiosity"],
 ["⌁","Ideas","Interesting possibilities waiting to become projects.","Creation"]
];
const lifeCards=[
 ["⌂","Travel","Trips, places, itineraries and future destinations.","Life"],
 ["♨","Cooking","Reliable recipes, techniques and meals worth repeating.","Life"],
 ["○","Personal Development","Reflection, habits, clarity and personal growth.","Growth"],
 ["◆","Hobbies","Interests and things you want to get better at.","Life"]
];

const recent=[
 {title:"SGLT2 inhibitors in HFpEF",type:"Medicine",tag:"Clinical pearl"},
 {title:"Backdoor Roth IRA",type:"Finance",tag:"Concept"},
 {title:"My First 90 Days as an Attending",type:"Career",tag:"Project"},
 {title:"Real Estate Deal Analysis",type:"Finance",tag:"Framework"},
 {title:"AI Physician Workflow",type:"Project",tag:"Active"}
];

function renderHome(){
 return `
 <div class="feature">
   <div class="eyebrow">Personal Knowledge OS</div>
   <h1>Build knowledge that compounds.</h1>
   <p>This is your private command center for medicine, finance, career, projects and life. Capture ideas, connect concepts and turn what you learn into reusable assets.</p>
   <button class="btn" onclick="newNote()">＋ Add something</button>
 </div>
 <div class="grid grid-4">
   ${stat("127","Notes","Across all areas")}
   ${stat("5","Active projects","Keep moving")}
   ${stat("18","Clinical pearls","High-yield")}
   ${stat("3","Inbox items","Ready to process")}
 </div>
 <div class="section-title"><div><h2>Your knowledge domains</h2><span class="sub">Everything has a home, but links connect the whole system.</span></div></div>
 <div class="grid grid-3">
   ${domain("✚","Medicine","Clinical knowledge and your outpatient reference.","medicine")}
   ${domain("$","Finance","Personal finance, investing and real estate.","finance")}
   ${domain("↗","Career","Your professional life and long-term direction.","career")}
   ${domain("◆","Projects","Ideas turned into tangible outcomes.","projects")}
   ${domain("◇","Knowledge","Concepts, mental models and lessons.","knowledge")}
   ${domain("○","Life","Travel, hobbies and personal development.","life")}
 </div>
 <div class="grid grid-2">
   <section><div class="section-title"><div><h2>Recently added</h2></div><a onclick="navigate('knowledge')">View all →</a></div>
   <div class="card list">${recent.map(r=>listItem(r)).join("")}</div></section>
   <section><div class="section-title"><div><h2>Active projects</h2></div><a onclick="navigate('projects')">View all →</a></div>
   <div class="card">${projectMini("Outpatient IM Knowledge Base",68,"Finish diabetes + preventive care sections")}
   ${projectMini("Personal Financial Plan",42,"Build 5-year net worth model")}
   ${projectMini("AI Physician Workflow",25,"Create first 20 reusable prompts")}</div></section>
 </div>`;
}

function stat(n,l){return `<div class="card stat"><div class="num">${n}</div><div class="label">${l}</div></div>`}
function domain(icon,title,desc,section){return `<div class="card clickable" onclick="navigate('${section}')"><div class="card-icon">${icon}</div><div class="card-title">${title}</div><div class="card-desc">${desc}</div></div>`}
function listItem(r){return `<div class="list-item" onclick="openNote('${r.title}')"><div><strong>${r.title}</strong><small>${r.type}</small></div><span class="tag blue">${r.tag}</span></div>`}
function projectMini(name,pct,next){return `<div class="list-item"><div style="flex:1"><strong>${name}</strong><small>Next: ${next}</small><div class="progress"><span style="width:${pct}%"></span></div></div><span class="tag">${pct}%</span></div>`}

function renderCategory(name,cards){
 return `<div class="header-row"><div><div class="eyebrow">${name}</div><h1>${name}</h1><div class="sub">${data[name.toLowerCase()]?.subtitle||"Your organized knowledge."}</div></div><div class="actions"><button class="btn" onclick="newNote()">＋ New note</button></div></div>
 <div class="grid grid-3">${cards.map(c=>`<div class="card clickable" onclick="openCollection('${c[1]}')"><div class="card-icon">${c[0]}</div><div class="card-title">${c[1]}</div><div class="card-desc">${c[2]}</div><div style="margin-top:14px"><span class="tag">${c[3]}</span></div></div>`).join("")}</div>
 <div class="section-title"><div><h2>Suggested starting points</h2><span class="sub">Build the notes you'll actually use.</span></div></div>
 <div class="card list">${suggestions(name).map(x=>listItem(x)).join("")}</div>`;
}
function suggestions(name){
 if(name==="Medicine") return [{title:"Hypertension",type:"Outpatient IM",tag:"Start here"},{title:"Type 2 Diabetes",type:"Endocrinology",tag:"High-yield"},{title:"Chronic Kidney Disease",type:"Nephrology",tag:"High-yield"},{title:"Chest Pain",type:"Cardiology",tag:"Complaint"}];
 if(name==="Finance") return [{title:"5-Year Financial Model",type:"Personal finance",tag:"Project"},{title:"Asset Allocation",type:"Investing",tag:"Concept"},{title:"Real Estate Deal Analysis",type:"Real estate",tag:"Framework"}];
 if(name==="Career") return [{title:"First 90 Days as an Attending",type:"Career",tag:"Project"},{title:"Compensation & RVUs",type:"Healthcare business",tag:"Concept"},{title:"Negotiation Checklist",type:"Negotiation",tag:"Reference"}];
 return [{title:"How I capture and process knowledge",type:"System",tag:"Core"},{title:"My Mental Models",type:"Thinking",tag:"Core"}];
}

function renderProjects(){
 return `<div class="header-row"><div><div class="eyebrow">Projects</div><h1>Make things.</h1><div class="sub">Knowledge becomes valuable when it changes what you do.</div></div><button class="btn primary" onclick="newProject()">＋ New project</button></div>
 <div class="grid grid-2">
 ${projectCard("Outpatient IM Knowledge Base",68,"Medicine","Finish diabetes + preventive care sections","High")}
 ${projectCard("Personal Financial Plan",42,"Finance","Build 5-year net worth model","High")}
 ${projectCard("AI Physician Workflow",25,"Technology","Create first 20 reusable prompts","Medium")}
 ${projectCard("Real Estate Research",18,"Finance","Analyze 10 real properties","Medium")}
 </div>
 <div class="section-title"><div><h2>Project rules</h2><span class="sub">Keep projects outcome-focused.</span></div></div>
 <div class="card note-body"><h3>Every project should answer four questions</h3><ul><li><b>Why am I doing this?</b> Define the payoff.</li><li><b>What does done look like?</b> Make the outcome concrete.</li><li><b>What is the next action?</b> Never leave a project without one.</li><li><b>What did I learn?</b> Move lessons back into your Knowledge system.</li></ul></div>`;
}
function projectCard(n,pct,area,next,priority){return `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px"><div><div class="card-title">${n}</div><div class="card-desc">${area}</div></div><span class="tag ${priority==="High"?"orange":""}">${priority}</span></div><div class="progress"><span style="width:${pct}%"></span></div><div style="display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--muted)"><span>${next}</span><b>${pct}%</b></div></div>`}

function renderResources(){
 return `<div class="header-row"><div><div class="eyebrow">Resources</div><h1>Useful, not hoarded.</h1><div class="sub">Save resources because they support a question, project or concept.</div></div><button class="btn primary" onclick="newResource()">＋ Add resource</button></div>
 <div class="grid grid-4">${["Books","Articles","Courses","Websites"].map((x,i)=>`<div class="card clickable"><div class="card-icon">${["▤","▧","□","⌁"][i]}</div><div class="card-title">${x}</div><div class="card-desc">${[12,24,7,18][i]} saved resources</div></div>`).join("")}</div>
 <div class="section-title"><div><h2>Resource library</h2></div></div>
 <div class="card list">${["ABIM Internal Medicine Knowledge Check","ACC/AHA Clinical Guidelines","A Random Walk Down Wall Street","Obsidian Help & Documentation"].map((x,i)=>listItem({title:x,type:["Medicine","Medicine","Finance","Knowledge System"][i],tag:["Reference","Guideline","Book","Tool"][i]})).join("")}</div>`;
}
function renderInbox(){
 return `<div class="header-row"><div><div class="eyebrow">Inbox</div><h1>Capture first. Organize later.</h1><div class="sub">Don't interrupt your thinking just to find the perfect folder.</div></div><button class="btn primary" onclick="newNote()">＋ Capture</button></div>
 <div class="card list">${[
 {title:"Look into SGLT2 use in CKD",type:"Captured today",tag:"Process"},
 {title:"Idea: physician transition-to-attending guide",type:"Captured today",tag:"Idea"},
 {title:"Research apartment development economics",type:"Captured yesterday",tag:"Finance"}
 ].map(x=>listItem(x)).join("")}</div>
 <div class="section-title"><div><h2>Processing rule</h2></div></div><div class="card note-body"><p>During your weekly review, each item should be <b>deleted, turned into a permanent note, linked to an existing note, or converted into a project/task.</b></p></div>`;
}
function renderSettings(){return `<div class="header-row"><div><div class="eyebrow">Settings</div><h1>Make it yours.</h1><div class="sub">This starter version stores demo content in the browser.</div></div></div><div class="card note-body"><h3>Next upgrades</h3><ul><li>Persistent notes using local storage or a database.</li><li>Markdown editor and attachments.</li><li>Real full-text search.</li><li>Tags, properties and linked-note relationships.</li><li>Login and private cloud sync.</li><li>AI search across your own notes.</li></ul><p><b>Important:</b> Do not enter patient-identifiable information or PHI into this system.</p></div>`}

function navigate(section){
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.section===section));
 const d=data[section]||data.home;
 document.getElementById("content").innerHTML=d.render();
 window.scrollTo({top:0,behavior:"smooth"});
 if(window.innerWidth<900) document.querySelector(".sidebar").classList.remove("open");
}
function openCollection(title){
 openModal(`<div class="eyebrow">Collection</div><h2>${title}</h2><div class="note-body"><p>This is a starter collection page. Add notes here as you build your system.</p><h3>Recommended structure</h3><ul><li>What is it?</li><li>When should I think about it?</li><li>Diagnosis / evaluation</li><li>Treatment</li><li>Monitoring</li><li>When to refer</li><li>Common mistakes</li><li>Related notes</li><li>Sources</li></ul><button class="btn primary" onclick="newNote('${title}')">＋ Add note</button></div>`);
}
function openNote(title){
 let body=`<div class="eyebrow">Note</div><h2>${title}</h2><div class="note-body">`;
 if(title.includes("SGLT2")) body+=`<h3>Core idea</h3><p>Use this space for the concise explanation you want to remember and apply. Add your evidence/source and link related concepts.</p><h3>Practical application</h3><ul><li>What should I do in clinic?</li><li>What should I monitor?</li><li>When should I reconsider?</li></ul><h3>Related</h3><p><span class="tag blue">HFpEF</span> <span class="tag blue">CKD</span> <span class="tag blue">Diabetes</span></p>`;
 else body+=`<h3>Why this matters</h3><p>This note is a placeholder for your personal understanding of <b>${title}</b>.</p><h3>Your takeaway</h3><p>Write the thing you would want future-you to remember in 30 seconds.</p><h3>Sources</h3><p>Add supporting resources and links.</p>`;
 body+=`</div>`; openModal(body);
}
function openModal(html){document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.remove("hidden")}
function newNote(prefill=""){openModal(`<div class="eyebrow">New note</div><h2>Capture knowledge</h2><div class="form"><label>Title<input id="noteTitle" value="${prefill}" placeholder="e.g. Hypertension follow-up"></label><label>Area<select id="noteArea"><option>Medicine</option><option>Finance</option><option>Career</option><option>Knowledge</option><option>Life</option></select></label><label>Note<textarea placeholder="What do you want future-you to remember?"></textarea></label><button class="btn primary" onclick="saveDemo()">Save note</button></div>`)}
function newProject(){openModal(`<div class="eyebrow">New project</div><h2>Start something</h2><div class="form"><label>Project name<input placeholder="e.g. Build outpatient diabetes guide"></label><label>Outcome<textarea placeholder="What does done look like?"></textarea></label><button class="btn primary" onclick="saveDemo()">Create project</button></div>`)}
function newResource(){openModal(`<div class="eyebrow">New resource</div><h2>Add a useful resource</h2><div class="form"><label>Title<input placeholder="Book, article, course or website"></label><label>Why am I saving this?<textarea placeholder="What question, project or note does this support?"></textarea></label><button class="btn primary" onclick="saveDemo()">Add resource</button></div>`)}
function saveDemo(){document.getElementById("modalContent").innerHTML=`<h2>Saved locally</h2><p class="sub">This starter build is ready for the next step: connecting real persistent storage so your notes survive across devices.</p><button class="btn primary" onclick="document.getElementById('modal').classList.add('hidden')">Continue</button>`}
document.getElementById("nav").addEventListener("click",e=>{const b=e.target.closest(".nav-item");if(b)navigate(b.dataset.section)});
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.add("hidden");
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")e.currentTarget.classList.add("hidden")});
document.getElementById("themeBtn").onclick=()=>document.body.classList.toggle("dark");
document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.addEventListener("keydown",e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.getElementById("search").focus()}});
document.getElementById("search").addEventListener("input",e=>{
 const q=e.target.value.trim().toLowerCase(); let box=document.getElementById("searchResults");
 if(!box){box=document.createElement("div");box.id="searchResults";box.className="search-results hidden";document.body.appendChild(box)}
 if(!q){box.classList.add("hidden");return}
 const results=[...recent,...suggestions("Medicine"),...suggestions("Finance"),...suggestions("Career")].filter((x,i,a)=>x.title.toLowerCase().includes(q)&&a.findIndex(y=>y.title===x.title)===i).slice(0,8);
 box.innerHTML=results.length?results.map(r=>`<div class="result" onclick="openNote('${r.title.replaceAll("'","\\'")}');document.getElementById('searchResults').classList.add('hidden')"><strong>${r.title}</strong><small>${r.type}</small></div>`).join(""):`<div class="result"><small>No matching notes yet.</small></div>`;
 box.classList.remove("hidden");
});
navigate("home");
