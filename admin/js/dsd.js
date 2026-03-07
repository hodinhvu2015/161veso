async function loadDSD(){

const res = await fetch("/api/dsd")

const data = await res.json()

document.getElementById("dsdList").innerHTML =

data.map(d=>`

<tr>

<td>${d.stt}</td>
<td>${d.ten}</td>
<td>${d.nhom}</td>
<td>${d.vecap1}</td>
<td>${d.vecap2}</td>
<td>${d.vetong}</td>
<td>${d.nguon}</td>
<td>${d.ngay}</td>

</tr>

`).join("")

}