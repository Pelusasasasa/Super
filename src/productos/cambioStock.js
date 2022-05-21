const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;

const codigo = document.querySelector('#codigo');
const stock = document.querySelector('#stock');
const nuevoStock = document.querySelector('#nuevoStock');
const guardar = document.querySelector('.guardar');
const salir = document.querySelector('.salir');

let producto = {};

codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
        console.log(producto)
        stock.value = producto.stock;
        nuevoStock.focus();
    }
});

nuevoStock.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        guardar.focus();
    }
});

guardar.addEventListener('click',async e=>{
    producto.stock = parseFloat(nuevoStock.value);
    await axios.put(`${URL}productos/${producto._id}`,producto);
    window.close();
})