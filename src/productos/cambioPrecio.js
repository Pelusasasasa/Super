const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;

const codigo = document.querySelector('#codigo');
const costo = document.querySelector('#costo');
const nuevoCosto = document.querySelector('#nuevoCosto');
const nuevoPrecio = document.querySelector('#nuevoPrecio');
const guardar = document.querySelector('.guardar');
const salir = document.querySelector('.salir');


let producto = {};

codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
        costo.value = producto.costo;
        nuevoCosto.focus();
    }
});

nuevoCosto.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        const impuesto = parseFloat((parseFloat(nuevoCosto.value)*producto.impuesto/100).toFixed(2)) + parseFloat(nuevoCosto.value);
        nuevoPrecio.value = (parseFloat(( impuesto*producto.ganancia/100).toFixed(2)) + impuesto).toFixed(2);
        guardar.focus();
    }
});

guardar.addEventListener('click',async e=>{
    producto.costo = parseFloat(nuevoCosto.value);
    producto.precio = parseFloat(nuevoPrecio.value);
    await axios.put(`${URL}productos/${producto._id}`,producto);
    window.close();
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});