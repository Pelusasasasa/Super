const {cerrarVentana,apretarEnter} = require('../helpers');
const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

const buscar = document.querySelector('#buscar');
const volver = document.querySelector('.volver');
const tbodyVenta = document.querySelector(".listaVentas tbody");
const tbodyProducto = document.querySelector(".listaProductos tbody");




buscar.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (buscar.value !== "") {
            const cliente = (await axios.get(`${URL}clientes/id/${buscar.value}`)).data;
            if (cliente === "") {
                alert("Cliente no encontrado");
                buscar.value = "";
                buscar.focus();
            }else{
                listarVentas(cliente.listaVentas);
            }
        }
    }
});

const listarVentas = async(lista)=>{
    let ventas = [];
    for await (let num of lista){
        const venta = (await axios.get(`${URL}ventas/id/${num}`)).data;
        ventas.push(venta);
    };

    ventas.forEach(venta=>{
        const date = new Date(venta.fecha);
        let day = date.getDate();
        let month = date.getMonth()+1;
        let year = date.getFullYear();

        day = day < 10 ? `0${day}` : day;
        month = month < 10 ? `0${month}` : month;
        month = month === 13 ? 1 : month;

        tbodyVenta.innerHTML += `
            <tr id="${venta._id}">
                <td>${day}/${month}/${year}</td>
                <td>${venta._id}</td>
                <td>${venta.idCliente}</td>
                <td>${venta.cliente}</td>
                <td>${venta.precio}</td>
                <td>${venta.descuento.toFixed(2)}</td>
            </tr>
        `
    })
};


tbodyVenta.addEventListener('click',async e=>{
    if ((e.target.nodeName === "TD")) {
        const id = e.target.parentNode.id;
        const movimientos = (await axios.get(`${URL}movimiento/${id}`)).data;
        tbodyProducto.innerHTML = "";
        listarProductos(movimientos)
    }
});

const listarProductos = async(movimientos)=>{
    movimientos.forEach(movimiento=>{
        const date = new Date(movimiento.fecha);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        day = day < 10 ? `0${day}` : day;
        month = month < 10 ? `0${month}` : month;
        month = month === 13 ? 1 : month;

        tbodyProducto.innerHTML += `
            <tr id=${movimiento.id}>
                <td>${day}/${month}/${year}</td>
                <td>${movimiento.codProd}</td>
                <td>${movimiento.producto}</td>
                <td>${movimiento.cantidad.toFixed(2)}</td>
                <td>${movimiento.precio.toFixed(2)}</td>
                <td>${(movimiento.cantidad * movimiento.precio).toFixed(2)}</td>
            </tr>
        `

    })
}


volver.addEventListener('click',e=>{
    location.href = "../menu.html";
})