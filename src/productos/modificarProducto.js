const { ipcRenderer } = require('electron');
const {cerrarVentana,apretarEnter,selecciona_value} = require('../helpers');


const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const marca = document.querySelector('#marca');
const rubro = document.querySelector('#rubro');
const stock = document.querySelector('#stock');
const costo = document.querySelector('#costo');
const impuesto = document.querySelector('#impuesto');
const costoIva = document.querySelector('#costoIva');
const ganancia = document.querySelector('#ganancia');
const total = document.querySelector('#total');
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');

const productos = []

impuesto.addEventListener('blur',e=>{
    costoIva.value = (parseFloat(costo.value) + (parseFloat(costo.value) * parseFloat(impuesto.value) / 100 )).toFixed(2);
});

ganancia.addEventListener('blur',e=>{
    total.value = ((parseFloat(costoIva.value) * parseFloat(ganancia.value) / 100) + parseFloat(costoIva.value)).toFixed(2);
})

salir.addEventListener('click',e=>{
    window.close();
});

document.addEventListener('keydown',e=>{
    cerrarVentana(e);
})


ipcRenderer.on('informacion',(e,args)=>{
    const {informacion}= args;
    llenarInputs(informacion)
})

const llenarInputs = async(codigoProducto)=>{
    codigo.value = codigoProducto;
    const producto = (await axios.get(`${URL}productos/${codigo.value}`)).data;
    descripcion.value = producto.descripcion;
    marca.value = producto.marca;
    stock.value = producto.stock;
    rubro.value = producto.rubro;
    costo.value = producto.costo;
    impuesto.value = producto.impuesto;
    costoIva.value = (producto.costo + (producto.costo * producto.impuesto / 100)).toFixed(2);
    ganancia.value = producto.ganancia;
    total.value = producto.precio;    
}

modificar.addEventListener('click',async e=>{
    const producto = {};
    producto._id = codigo.value;
    producto.descripcion = descripcion.value;
    producto.marca = marca.value;
    producto.rubro = rubro.value;
    producto.stock = parseFloat(stock.value).toFixed(2);
    producto.costo = parseFloat(costo.value).toFixed(2);
    producto.impuesto = parseFloat(impuesto.value).toFixed(2);
    producto.ganancia = parseFloat(ganancia.value).toFixed(2);
    producto.precio = parseFloat(total.value).toFixed(2);
    (await axios.put(`${URL}productos/${producto._id}`,producto)).data;
    ipcRenderer.send('informacion-a-ventana',producto._id);
    window.close();
})

codigo.addEventListener('keypress',e=>{
    apretarEnter(e,descripcion);
});

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,marca);
});


marca.addEventListener('keypress',e=>{
    apretarEnter(e,rubro);
});

rubro.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
});

stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
});


costo.addEventListener('keypress',e=>{
    apretarEnter(e,impuesto);
});

impuesto.addEventListener('keypress',e=>{
    apretarEnter(e,costoIva);
});

costoIva.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
});

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,total);
});

total.addEventListener('keypress',e=>{
    apretarEnter(e,modificar);
});



descripcion.addEventListener('focus',e=>{
    selecciona_value(descripcion.id);
});


marca.addEventListener('focus',e=>{
    selecciona_value(marca.id);
});

rubro.addEventListener('focus',e=>{
    selecciona_value(rubro.id);
});

stock.addEventListener('focus',e=>{
    selecciona_value(stock.id);
});


costo.addEventListener('focus',e=>{
    selecciona_value(costo.id);
});

impuesto.addEventListener('focus',e=>{
    selecciona_value(impuesto.id);
});

costoIva.addEventListener('focus',e=>{
    selecciona_value(costoIva.id);
});

ganancia.addEventListener('focus',e=>{
    selecciona_value(ganancia.id);
});

total.addEventListener('focus',e=>{
    selecciona_value(total.id);
});