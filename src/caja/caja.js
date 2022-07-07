const axios  = require("axios");
const { cerrarVentana } = require("../helpers");
require("dotenv").config();
const URL = process.env.URL;

const tarjeta = document.querySelector('.tarjeta');
const contado = document.querySelector('.contado');
const botonDia = document.querySelector('.botonDia');
const botonMes = document.querySelector('.botonMes');
const botonAnio = document.querySelector('.botonAnio');
const dia = document.querySelector('.dia');
const mes = document.querySelector('.mes');
const anio = document.querySelector('.anio');
let seleccionado = document.querySelector('.seleccionado');
const fecha = document.querySelector('#fecha');
const selectMes = document.querySelector('#mes');
const inputAnio = document.querySelector('#anio');
const tbody = document.querySelector('tbody');
const volver = document.querySelector('.volver');
const total = document.querySelector('#total');

let ventas = [];
let tipoVenta = "CD";
const fechaHoy = new Date();
let d = fechaHoy.getDate();
let m = fechaHoy.getMonth() + 1;
let a = fechaHoy.getFullYear();

m = m<10 ? `0${m}`: m;
d = d<10 ? `0${d}`: d;

selectMes.value = m;
inputAnio.value = a;

fecha.value = `${a}-${m}-${d}`;

tarjeta.addEventListener('click',e=>{
    if(!tarjeta.classList.contains('buttonSeleccionado')){
        contado.classList.remove('buttonSeleccionado');
        tarjeta.classList.add('buttonSeleccionado');
        tipoVenta = "T";
        listarVentas(ventas)
    };
});

contado.addEventListener('click',e=>{
    if(!contado.classList.contains('buttonSeleccionado')){
        tarjeta.classList.remove('buttonSeleccionado');
        contado.classList.add('buttonSeleccionado');
        tipoVenta = "CD";
        listarVentas(ventas)
    };
});

botonMes.addEventListener('click',async e=>{
    seleccionado.classList.remove('seleccionado');
    seleccionado = botonMes;
    mes.classList.remove('none');
    dia.classList.add('none');
    anio.classList.add('none');
    seleccionado.classList.add('seleccionado');
    ventas = (await axios.get(`${URL}ventas/mes/${selectMes.value}`)).data;
    listarVentas(ventas)
});

botonDia.addEventListener('click',async e=>{
    seleccionado.classList.remove('seleccionado');
    seleccionado = botonDia;
    dia.classList.remove('none');
    mes.classList.add('none');
    anio.classList.add('none');
    seleccionado.classList.add('seleccionado');
    ventas = (await axios.get(`${URL}ventas/dia/${fecha.value}`)).data;
    const recibos = (await axios.get(`${URL}ventas/dia/${fecha.value}`)).data;
    listarVentas(ventas);
});

botonAnio.addEventListener('click',async e=>{
    seleccionado.classList.remove('seleccionado');
    seleccionado = botonAnio;
    anio.classList.remove('none');
    dia.classList.add('none');
    mes.classList.add('none');
    seleccionado.classList.add('seleccionado');
    ventas = (await axios.get(`${URL}ventas/anio/${inputAnio.value}`)).data;
    listarVentas(ventas);
});
const inicia = async()=>{
    ventas = (await axios.get(`${URL}ventas/dia/${fecha.value}`)).data;
    const recibos = (await axios.get(`${URL}recibo/dia/${fecha.value}`)).data;
    listarVentas([...ventas,...recibos])
}
inicia( )


listarVentas = (ventas)=>{
    if (tipoVenta === "CD") {
        ventas = ventas.filter(venta=>venta.tipo_venta === "CD");
    }else{
        ventas = ventas.filter(venta=>venta.tipo_venta === "T");
    }
    tbody.innerHTML = ``;
    let totalVenta = 0;
    ventas.forEach(venta => {
        const fecha = new Date(venta.fecha);
        const hora = fecha.getHours();
        const minutos = fecha.getMinutes();
        let segundos = fecha.getSeconds(); 
        segundos=segundos<10 ? `0${segundos}` : segundos;
        tbody.innerHTML += `
        <tr id="${venta.numero}" class="bold">
            <td>${venta.numero}</td><td>${hora}:${minutos}:${segundos}</td><td>${venta.cliente}</td><td>${venta.tipo_venta}</td><td>${venta.tipo_comp !== "Recibo" ? venta.descripcion : "Recibo"}</td><td></td><td></td><td class="total">${venta.precio.toFixed(2)}</td>
        </tr>
        `;
        if (venta.listaProductos) {
            venta.listaProductos.forEach(({cantidad,producto})=>{
                tbody.innerHTML += `
                <tr class="none venta${venta.numero}">
                    <td>${venta.numero}</td>
                    <td>${hora}:${minutos}:${segundos}</td>
                    <td>${venta.cliente ? venta.cliente : "CONSUMIDOR FINAL"}</td>
                    <td>${producto._id ? producto._id : ""}</td>
                    <td>${producto.descripcion}</td>
                    <td>${cantidad.toFixed(2)}</td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>${(cantidad*producto.precio).toFixed(2)}</td>
                </tr>
            `
            })
        }
        

        totalVenta+=venta.precio;
    });
    total.value = totalVenta.toFixed(2);
}


volver.addEventListener('click',e=>{
    location.href = "../menu.html"
})

selectMes.addEventListener('click',async e=>{
    ventas = (await axios.get(`${URL}ventas/mes/${selectMes.value}`)).data;
    listarVentas(ventas);
});

inputAnio.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        ventas = (await axios.get(`${URL}ventas/anio/${inputAnio.value}`)).data;
        listarVentas(ventas);
    }
});

fecha.addEventListener('keypress',async e=>{
    if ((e.key === "Enter")) {
        ventas = (await axios.get(`${URL}ventas/dia/${fecha.value}`)).data;
        listarVentas(ventas);
    }
});

tbody.addEventListener('click',async e=>{
    const id = e.target.nodeName === "TD" ? e.target.parentNode.id : e.target.id;
    const trs = document.querySelectorAll("tbody .venta" + id)
    for await(let tr of trs){
        tr.classList.toggle('none');
    }
});

document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {
        location.href = '../menu.html';
    }
})