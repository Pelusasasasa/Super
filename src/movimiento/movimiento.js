const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const select = document.querySelector('#rubro');
const tbody = document.querySelector('tbody');
const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const esteMes = document.querySelector('.mes');
const total = document.querySelector('#total');

const hoy = new Date();
let dia = hoy.getDate();
let mes = hoy.getMonth() + 1;
let anio = hoy.getFullYear();

dia = dia<10 ? `0${dia}` : dia;
mes = mes<10 ? `0${mes}` : mes;
mes = mes === 13 ? 1 : mes;

desde.value = `${anio}-${mes}-${dia}`;
hasta.value = `${anio}-${mes}-${dia}`;

const inicia = async()=>{
    const rubros = (await axios.get(`${URL}productos/rubro`)).data;
    const rubrosSinRepetido = rubros.filter(function(rubro,p){
        return rubros.indexOf(rubro)===p;
    });
    rubrosSinRepetido.forEach(rubro => {
        const option = document.createElement('option');
        option.innerHTML = rubro;
        option.value = rubro;
        select.appendChild(option);
    });
    traerProductos(select.value);
};

inicia();

const volver = document.querySelector('.volver');

const traerProductos = async(rubro,mes)=>{
    tbody.innerHTML = "";
    let totalMovimientos = 0;
    let [a,m,d] = hasta.value.split('-');
    d=parseFloat(d)+1;
    d = d<10 ? `0${d}` : d;
    let movimiento;
    if (mes) {
        const mMasUno = parseInt(m)<10 ? `0${parseInt(m)}` : parseInt(m);
        const mMasDos = parseInt(mMasUno)<10 ? `0${parseInt(mMasUno) + 1}` :parseInt(mMasUno) + 1;
        const fechaDesde = `${a}-${mMasUno}-01`;
        const fechaHasta = `${a}-${mMasDos}-01`;
        movimiento = (await axios.get(`${URL}movimiento/rubro/${rubro}/${fechaDesde}/${fechaHasta}`)).data;
    }else{
        movimiento = (await axios.get(`${URL}movimiento/rubro/${rubro}/${desde.value}/${a}-${m}-${d}`)).data;
    } 
    movimiento.forEach(mov=>{
        const fecha = new Date(mov.fecha);
        let dia = fecha.getDate();
        dia = dia<10 ? `0${dia}` : dia;
        let mes = fecha.getMonth() + 1;
        mes = mes<10 ? `0${mes}` : mes;
        mes = mes === 13 ? 1 : mes;
        let anio = fecha.getFullYear();
        let hora = fecha.getHours();
        hora = hora<10 ? `0${hora}` : hora;
        let min = fecha.getMinutes();
        min = min<10 ? `0${min}` : min;
        let seg =  fecha.getSeconds();
        seg = seg<10 ? `0${seg}` : seg;
        tbody.innerHTML += `
        <tr>
            <td>${mov.nro_venta}</td>
            <td>${dia}/${mes}/${anio}</td>
            <td>${mov.cliente}</td>
            <td>${mov.codProd}</td>
            <td>${mov.producto}</td>
            <td>${(mov.cantidad).toFixed(2)}</td>
            <td class="end">${(mov.precio).toFixed(2)}</td>
            <td class="end">${(mov.precio * mov.cantidad).toFixed(2)}</td>
            <td>${mov.marca}</td>
        </tr>
    `;

    totalMovimientos += mov.cantidad * mov.precio;
    })

    total.value = totalMovimientos.toFixed(2);
};

hasta.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        traerProductos(select.value);
    };
});

desde.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        traerProductos(select.value);
    };
})

esteMes.addEventListener('click',e=>{
    traerProductos(select.value,"Mes")
})

select.addEventListener('click',e=>{
    traerProductos(select.value)
})


volver.addEventListener('click',e=>{
    location.href = "../menu.html";
});


