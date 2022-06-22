const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;
const sweet = require('sweetalert2');

const {apretarEnter} = require('../helpers')

const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const stockViejo = document.querySelector('#stockViejo');
const stock = document.querySelector('#stock');
const costo = document.querySelector('#costo');
const precio = document.querySelector('#precio');
const nuevoCosto = document.querySelector('#nuevoCosto');
const nuevoPrecio = document.querySelector('#nuevoPrecio');
const guardar = document.querySelector('.guardar');
const salir = document.querySelector('.salir');

let producto = {};

codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
        if (producto !== "") {
            costo.value = producto.costo.toFixed(2);
            descripcion.value = producto.descripcion;
            stockViejo.value = producto.stock.toFixed(2);
            precio.value = producto.precio.toFixed(2);
            descripcion.focus();
        }else{
            await sweet.fire({
                title:"No Existe producto con ese codigo"
            });
            codigo.value = "";
        }
    }
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    if (e.key === "Enter" && stock.value !== "") {
        stock.value = parseFloat(stock.value).toFixed(2);
    }
    apretarEnter(e,nuevoCosto);
});


nuevoCosto.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        const impuesto = parseFloat((parseFloat(nuevoCosto.value)*producto.impuesto/100).toFixed(2)) + parseFloat(nuevoCosto.value);
        nuevoPrecio.value = (parseFloat(( impuesto*producto.ganancia/100).toFixed(2)) + impuesto).toFixed(2);
        guardar.focus();
        nuevoCosto.value = parseFloat(nuevoCosto.value).toFixed(2);
    }

});

guardar.addEventListener('click',async e=>{
    producto.costo = nuevoCosto.value !== "" ? parseFloat(nuevoCosto.value) : producto.costo;
    producto.precio = nuevoPrecio.value !== "" ? parseFloat(nuevoPrecio.value) : producto.precio;
    producto.stock = stock.value !== "" ? parseFloat(stock.value) : producto.stock;
    producto.descripcion = descripcion.value !== "" ? descripcion.value : producto.descripcion;
    const {mensaje,estado} =(await axios.put(`${URL}productos/${producto._id}`,producto)).data;
    await sweet.fire({
        title:mensaje
    })
    if (estado) {
        window.close();
    }
});

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keyup',e=>{
    if (e.keyCode === 27) {
        window.close();
    }
});