const sweet = require('sweetalert2');
const {cerrarVentana} = require('../helpers')
const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;

const fecha = document.querySelector('.fecha');
const tbody = document.querySelector('.tbody');

const listar = async()=>{
    const clientes = (await axios.get(`${URL}clientes/clientesConSaldo`)).data;

    for await(let cliente of clientes){
        const {nombre,_id,direccion,telefono,saldo} = cliente;
        tbody.innerHTML += `
            <tr>
                <td>${_id}</td>
                <td>${nombre}</td>
                <td>${direccion}</td>
                <td>${telefono}</td>
                <td class="negrita izquierda">${saldo.toFixed(2)}</td>
            </tr>
        `
    }
}

listar();
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

month = month === 13 ? 1 : month;
day = day < 10 ? `0${day}` : day;
month = month < 10 ? `0${month}` : month;

fecha.innerHTML = `${day}/${month}/${year}`;


document.addEventListener('keyup',e=>{
    cerrarVentana(e)
})