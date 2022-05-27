const {apretarEnter} = require('../helpers');

const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;

const descripcion = document.querySelector('#descripcion');
const precio = document.querySelector('#precio');
const facturar = document.querySelector('.facturar');
const salir = document.querySelector('.salir');


facturar.addEventListener('click',async e=>{
    const venta = {};
    venta.precio = precio.value;
    venta.fecha = new Date();
    venta.idCliente = 1;
    venta.cliente = "Consumidor Final";
    venta.tipo_venta = "CD";
    await axios.post(`${URL}ventas`);
})

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,precio);
});

precio.addEventListener('keypress',e=>{
    apretarEnter(e,facturar);
});


salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {
        window.close();
    }
});