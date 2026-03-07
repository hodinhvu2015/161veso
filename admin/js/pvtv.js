function resetFilter(){

document.getElementById("filterNgay").value=""

loadPVTV()

}

async function loadPVTV(){

const res = await fetch("/api/pvtv")

const data = await res.json()

document.getElementById("pvtvList").innerHTML =

data.map(d=>`

<tr>

<td>${d.stt}</td>
<td>${d.nguoiban}</td>
<td>${d.dai1}</td>
<td>${d.dai2}</td>
<td>${d.dai3}</td>
<td>${d.tong}</td>

</tr>

`).join("")

}