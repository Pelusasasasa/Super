const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const { ipcRenderer } = require('electron');
const {apretarEnter,selecciona_value} = require('../helpers');

const contado = document.querySelector('#contado');
const cuentaCorriente = document.querySelector('#cuentaCorriente');
const recibo = document.querySelector('#recibo');
const cargar = document.querySelector('.cargar');

const listar = async()=>{
    const numeros =(await axios.get(`${URL}numero`)).data;
    contado.value = numeros.Contado.toString().padStart(8,'0')
    recibo.value = numeros.Recibo.toString().padStart(8,'0')
    cuentaCorriente.value = numeros["Cuenta Corriente"].toString().padStart(8,'0')
}

cargar.addEventListener('click',async e=>{
    const numero = {
        "Cuenta Corriente": "00000000",
        "Contado": "00000000",
        "Recibo": "00000000"
    }
    await axios.post(`${URL}numero`)
})
listar();