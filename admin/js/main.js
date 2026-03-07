async function loadComponent(id,file){

const res = await fetch(file)
const html = await res.text()

document.getElementById(id).innerHTML = html

}

async function init(){

await loadComponent(
"sidebar",
"components/sidebar.html"
)

const tabs = [
"dashboard",
"users",
"dsd",
"dsnv",
"pvtv"
]

for(const tab of tabs){

const res = await fetch(
`components/${tab}.html`
)

const html = await res.text()

document
.getElementById("mainContent")
.innerHTML += html

}

showTab("dashboard")

}

function showTab(tab){

document
.querySelectorAll(".main > div")
.forEach(div => div.style.display="none")

document
.getElementById(tab+"Tab")
.style.display="block"

if(tab==="users") loadDSNB()
if(tab==="dsd") loadDSD()
if(tab==="dsnv") loadDSNV()
if(tab==="pvtv") loadPVTV()

}

init()