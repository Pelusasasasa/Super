const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

const {apretarEnter,selecciona_value, cerrarVentana} = require('../helpers');

const contado = document.querySelector('#contado');
const cuentaCorriente = document.querySelector('#cuentaCorriente');
const recibo = document.querySelector('#recibo');
const modificar = document.querySelector('.modificar');
const guardar = document.querySelector('.guardar');
const cargar = document.querySelector('.cargar');
const salir = document.querySelector('.salir');

let id;

const listar = async()=>{
    const numeros =(await axios.get(`${URL}numero`)).data;
    (numeros.Contado !== 0 || numeros["Cuenta Corriente"] !== 0 || numeros.Recibo !== 0) && cargar.classList.add('none')
    id = numeros._id;
    contado.value = numeros.Contado.toString().padStart(8,'0')
    recibo.value = numeros.Recibo.toString().padStart(8,'0')
    cuentaCorriente.value = numeros["Cuenta Corriente"].toString().padStart(8,'0')
}

cargar.addEventListener('click',async e=>{
    const numero = {
        "Cuenta Corriente": 0,
        "Contado": 0,
        "Recibo": 0
    }
    await axios.post(`${URL}numero`)
});

modificar.addEventListener('click',e=>{
    modificar.classList.add('none');
    guardar.classList.remove('none');
    contado.removeAttribute('disabled');
    cuentaCorriente.removeAttribute('disabled');
    recibo.removeAttribute('disabled');
})

guardar.addEventListener('click',async e=>{
    const numero = {};
    numero._id = id;
    numero.Contado = parseInt(contado.value);
    numero.Recibo = parseInt(recibo.value);
    numero["Cuenta Corriente"] = parseInt(cuentaCorriente.value);
    console.log(numero)
    await axios.put(`${URL}numero`,numero)
})
listar();


salir.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keyup',e=>{
    cerrarVentana(e)
})