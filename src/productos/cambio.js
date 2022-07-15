const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;
const sweet = require('sweetalert2');

const {apretarEnter} = require('../helpers')

const codigo = document.querySelector('#codigo');
const marca = document.querySelector('#marca');
const descripcion = document.querySelector('#descripcion');
const stockViejo = document.querySelector('#stockViejo');
const stock = document.querySelector('#stock');
const iva = document.querySelector('#iva');
const ganancia = document.querySelector('#ganancia');
const costo = document.querySelector('#costo');
const precio = document.querySelector('#precio');
const nuevoCosto = document.querySelector('#nuevoCosto');
const nuevoIva = document.querySelector('#nuevoIva')
const nuevaGanancia = document.querySelector('#nuevaGanancia')
const nuevoPrecio = document.querySelector('#nuevoPrecio');
const guardar = document.querySelector('.guardar');
const salir = document.querySelector('.salir');

let producto = {};

codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
        if (producto !== "") {
            costo.value = producto.costo.toFixed(2);
            marca.value = producto.marca;
            iva.value = producto.impuesto.toFixed(2);
            ganancia.value = producto.ganancia.toFixed(2);
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
    if (e.key === "Enter" && nuevoCosto.value !== "") {
        nuevoCosto.value = parseFloat(nuevoCosto.value).toFixed(2)
    }else if(e.key === "Enter" && nuevoCosto.value === ""){
        nuevoCosto.value = parseFloat(costo.value).toFixed(2)
    };
    apretarEnter(e,nuevoIva)
});

nuevoIva.addEventListener('keypress',e=>{
        if(e.key === "Enter"){
            nuevoIva.value = nuevoIva.value === "" ? iva.value : nuevoIva.value;
        }
        apretarEnter(e,nuevaGanancia)
});

nuevaGanancia.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        nuevaGanancia.value = nuevaGanancia.value === "" ? ganancia.value : nuevaGanancia.value;
        const impuesto = parseFloat((parseFloat(nuevoCosto.value)*parseFloat(nuevoIva.value)/100).toFixed(2)) + parseFloat(nuevoCosto.value);
        nuevoPrecio.value = (parseFloat(( impuesto*parseFloat(nuevaGanancia.value)/100).toFixed(2)) + impuesto).toFixed(2);
        nuevoCosto.value = parseFloat(nuevoCosto.value).toFixed(2);
    }
    apretarEnter(e,guardar);
})
guardar.addEventListener('click',async e=>{
    producto.costo = nuevoCosto.value !== "" ? parseFloat(nuevoCosto.value) : producto.costo;
    producto.precio = nuevoPrecio.value !== "" ? parseFloat(nuevoPrecio.value) : producto.precio;
    producto.ganancia = parseFloat(nuevaGanancia.value);
    producto.impuesto = nuevoIva.value !== "" ? parseFloat(nuevoIva.value) : producto.impuesto;
    producto.stock = stock.value !== "" ? parseFloat(stock.value) : producto.stock;
    producto.descripcion = descripcion.value !== "" ? descripcion.value : producto.descripcion;
    console.log(producto);
    asdasdads
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