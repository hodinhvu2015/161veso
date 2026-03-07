async function loadDSNV(){

const res = await fetch("/api/dsnv")

const data = await res.json()

document.getElementById("dsnvList").innerHTML =

data.map(d=>`

<tr>

<td>${d.stt}</td>
<td>${d.ten}</td>
<td>${d.ngay}</td>
<td>${d.vecap1}</td>
<td>${d.tra}</td>
<td>${d.ban}</td>

</tr>

`).join("")

}