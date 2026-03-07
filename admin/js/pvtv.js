async function phanVe(){

const date = document.getElementById("date").value

if(!date){
alert("Chọn ngày")
return
}

const res = await fetch("/api/pvtv/phanve?date="+date)

const data = await res.json()

render(data)

}

function render(data){

const tbody = document.querySelector("#pvtvTable tbody")

tbody.innerHTML=""

data.forEach(row=>{

tbody.innerHTML += `
<tr data-id="${row.id}">

<td>${row.nguoiban}</td>

<td contenteditable>${row.dai1||""}</td>
<td contenteditable>${row.dai2||""}</td>
<td contenteditable>${row.dai3||""}</td>

<td contenteditable>${row.tong||""}</td>

<td contenteditable>${row.tratong||""}</td>

<td contenteditable>${row.ban||""}</td>

</tr>
`

})

}

async function saveData(){

const rows = document.querySelectorAll("#pvtvTable tbody tr")

for(const row of rows){

const id = row.dataset.id

const cells = row.querySelectorAll("td")

const body = {
dai1: cells[1].innerText,
dai2: cells[2].innerText,
dai3: cells[3].innerText,
tong: cells[4].innerText,
tratong: cells[5].innerText,
ban: cells[6].innerText
}

await fetch("/api/pvtv/"+id,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
})

}

alert("Đã lưu")

}