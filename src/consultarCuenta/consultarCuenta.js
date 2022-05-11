const {cerrarVentana,apretarEnter} = require('../helpers');
const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

const buscar = document.querySelector('#buscar');
const volver = document.querySelector('.volver');
const tbodyVenta = document.querySelector(".listaVentas tbody");
const tbodyProducto = document.querySelector(".listaProductos tbody");
const actualizar = document.querySelector('.actualizar');
const saldo = document.querySelector('#saldo');

let trSeleccionado = "";


buscar.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (buscar.value !== "") {
            const cliente = (await axios.get(`${URL}clientes/id/${buscar.value}`)).data;
            saldo.value = (cliente.saldo).toFixed(2);
            if (cliente === "") {
                alert("Cliente no encontrado");
                buscar.value = "";
                buscar.focus();
            }else{
                const ventas = (await axios.get(`${URL}compensada/traerCompensadas/${cliente._id}`)).data;
                listarVentas(ventas);
            }
        }
    }
});

const listarVentas = async(lista)=>{
    lista.forEach(venta=>{
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
                <td>${venta.importe}</td>
                <td>${venta.pagado}</td>
                <td>${venta.saldo}</td>
            </tr>
        `
    })
};


tbodyVenta.addEventListener('click',async e=>{
    if ((e.target.nodeName === "TD")) {
        const id = e.target.parentNode.id;
        trSeleccionado && trSeleccionado.classList.remove('seleccionado')
        trSeleccionado = e.target.parentNode;
        trSeleccionado.classList.add('seleccionado')
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
};

//cuando tocamos actualizar una venta, actualizamos con los precios de hoy en dia
actualizar.addEventListener('click',async e=>{
    if(trSeleccionado){

        const cuentaCompensada = (await axios.get(`${URL}compensada/traerCompensada/id/${trSeleccionado.id}`)).data;
        const cuentaHistorica = (await axios.get(`${URL}historica/PorId/id/${trSeleccionado.id}`)).data;
        const movimientos = (await axios.get(`${URL}movimiento/${trSeleccionado.id}`)).data;
        const  cliente = (await axios.get(`${URL}clientes/id/${cuentaCompensada.idCliente}`)).data;
        let total = 0;
        for await(let movimiento of movimientos){
            const precio = (await axios.get(`${URL}productos/traerPrecio/${movimiento.codProd}`)).data;
            movimiento.precio = precio;
            total += (precio*movimiento.cantidad);
        }

        if (confirm("Grabar Importe")) {
            total = parseFloat(total.toFixed(2));
            let cuentasHistoricasRestantes = (await axios.get(`${URL}historica/traerPorCliente/${cuentaHistorica.idCliente}`)).data;
            cuentasHistoricasRestantes = cuentasHistoricasRestantes.filter(cuenta=>(cuenta._id>cuentaHistorica._id && cuenta.fecha >= cuentaHistorica.fecha));
            cliente.saldo -= cuentaCompensada.importe;

            cuentaCompensada.importe = total;
            cuentaCompensada.saldo = parseFloat((total - cuentaCompensada.pagado).toFixed(2));
            cuentaHistorica.saldo = parseFloat((cuentaHistorica.saldo - cuentaHistorica.debe+total).toFixed(2));
            cuentaHistorica.debe = parseFloat(total.toFixed(2));
            let saldoAnterior = cuentaHistorica.saldo;

            for await(let cuenta of cuentasHistoricasRestantes){
                cuenta.saldo = cuenta.tipo_comp === "Recibo" ? parseFloat((saldoAnterior - cuenta.haber).toFixed(2)) : parseFloat((saldoAnterior + cuenta.debe).toFixed(2));
                saldoAnterior = cuenta.saldo;
                await axios.put(`${URL}historica/PorId/id/${cuenta._id}`,cuenta);
            };
            cliente.saldo += cuentaCompensada.importe;
            await axios.put(`${URL}clientes/id/${cliente._id}`,cliente);
            await axios.put(`${URL}compensada/traerCompensada/id/${cuentaCompensada._id}`,cuentaCompensada);
            await axios.put(`${URL}historica/PorId/id/${cuentaHistorica._id}`,cuentaHistorica);
        }
    }
})


volver.addEventListener('click',e=>{
    location.href = "../menu.html";
})