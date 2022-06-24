const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');
const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

document.addEventListener('keyup',e=>{
    if (e.keyCode === 112) {
        location.href = "./venta/index.html"
    }else if(e.keyCode === 113){
        const opciones = {
            path:"ventaRapida/ventaRapida.html",
            ancho:500,
            altura:600
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }else if(e.keyCode === 114){
        const opciones = {
            path:"productos/cambio.html",
            ancho:500,
            altura:500
        };
        ipcRenderer.send('abrir-ventana',opciones);
    }
})

const ventas = document.querySelector('.ventas');
ventas.addEventListener('click',e=>{
    location.href = "./venta/index.html"
})

const productos = document.querySelector('.productos');
productos.addEventListener('click',e=>{
    location.href = "./productos/productos.html";
})


const clientes = document.querySelector('.clientes');
clientes.addEventListener('click',e=>{
    location.href = "./clientes/clientes.html";
})

const caja = document.querySelector('.caja');
caja.addEventListener('click',e=>{
    location.href = "./caja/caja.html";
})

const movimiento = document.querySelector('.movimiento');
movimiento.addEventListener('click',e=>{
    location.href = "./movimiento/movimiento.html";
});

const consulta = document.querySelector('.consulta');
consulta.addEventListener('click',e=>{
    location.href = "./consultarCuenta/consultarCuenta.html";
});

const recibo = document.querySelector('.recibo');
recibo.addEventListener('click',e=>{
    location.href = "./recibo/recibo.html";
});


//ponemos un numero para la venta
ipcRenderer.on('poner-numero',async (e,args)=>{
    await sweet.fire({
        title:"Numero de Venta",
        input:"text",
        showCancelButton:true,
        confirmButtonText:"Aceptar"
    }).then(async ({isConfirmed,value})=>{
        if (isConfirmed && value !== "") {
            console.log(value)
            const venta = (await axios.get(`${URL}ventas/id/${value}/CD`)).data;
            const movimientos = (await axios.get(`${URL}movimiento/${venta.numero}`)).data;
            const cliente = (await axios.get(`${URL}clientes/id/${venta.idCliente}`)).data;
            ipcRenderer.send('imprimir',[venta,cliente,movimientos])
        }
    })
})