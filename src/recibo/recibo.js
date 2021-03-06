const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const { ipcRenderer } = require('electron');
const {apretarEnter,selecciona_value} = require('../helpers');
const sweet = require('sweetalert2');

const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const saldo = document.querySelector('#saldo');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const fecha = document.querySelector('#fecha');
const cancelar = document.querySelector('.cancelar');
const tbody = document.querySelector('tbody');
const total = document.querySelector('#total');
const imprimir = document.querySelector('.imprimir');
const entregado = document.querySelector('#entregado');



const hoy = new Date();
let d = hoy.getDate();
let m = hoy.getMonth() + 1;
let a = hoy.getFullYear();

d = d<10 ? `0${d}` : d;
m = m<10 ? `0${m}` : m;
m = m===13 ? 1 : m;

fecha.value = `${a}-${m}-${d}`

nombre.addEventListener('keypress',e=>{
    apretarEnter(e,localidad)
});

localidad.addEventListener('keypress',e=>{
    apretarEnter(e,direccion)
});

direccion.addEventListener('keypress',e=>{
    apretarEnter(e,fecha);
});

fecha.addEventListener('keypress',e=>{
    apretarEnter(e,localidad)
});

cancelar.addEventListener('click',e=>{
    location.href = "../menu.html";
})

codigo.addEventListener('keypress', async e=>{
    if (e.key === "Enter") {
        if (codigo.value != "") {
            ponerInputs(codigo.value)
        }else{
            const options = {
                path:"./clientes/clientes.html",
                botones:false,
            }
            ipcRenderer.send('abrir-ventana',options);
        }
    }
});

ipcRenderer.on('recibir',(e,args)=>{
    const {informacion} = JSON.parse(args);
    ponerInputs(informacion);
});


const ponerInputs = async(id)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    if (cliente !== "") {
        codigo.value = cliente._id;
        nombre.value = cliente.nombre;
        saldo.value = (cliente.saldo).toFixed(2);
        localidad.value = cliente.localidad;
        direccion.value = cliente.direccion;
        const compensadas = (await axios.get(`${URL}compensada/traerCompensadas/${cliente._id}`)).data;
        compensadas.forEach(compensada => {
            ponerVenta(compensada);
        });
    }else{
        await sweet.fire("Cliente no encontrado");
        codigo.value = "";
        nombre.value = "";
        saldo.value = "";
        localidad.value = "";
        direccion.value = "";
        tbody.innerHTML = "";
    }
}


const ponerVenta = async(cuenta)=>{
    const hoy = new Date(cuenta.fecha);
    let dia = hoy.getDate();
    let mes = hoy.getMonth(); + 1;
    let anio = hoy.getFullYear();

    dia = dia<10 ? `0${dia}` : dia;
    mes = mes<10 ? `0${mes}` : mes;
    mes = mes === 13 ? 1 : mes;
    tbody.innerHTML += `
        <tr class="${cuenta.nro_venta}">
            <td>${dia}/${mes}/${anio}</td>
            <td>${cuenta.nro_venta}</td>
            <td>${cuenta.importe}</td>
            <td>${(cuenta.pagado).toFixed(2)}</td>
            <td><input id="${cuenta.nro_venta}" type="number" value="0.00" /></td>
            <td>${(cuenta.saldo).toFixed(2)}</td>
        </tr>
    `
}

//Cuando hago un click que seleccione el input
let inputSeleccionado = tbody
let trSeleccionado = "";
tbody.addEventListener('click',e=>{
    const seleccion = e.target;
    if (seleccion.nodeName === "INPUT") {
        inputSeleccionado = seleccion;
    }else if(seleccion.nodeName === "TD"){
        inputSeleccionado = seleccion.parentNode.children[4].children[0];
        inputSeleccionado.focus();
    }else if(seleccion.nodeName === "TR"){
        inputSeleccionado = seleccion.children[4].children[0];
        inputSeleccionado.focus();
    }
    trSeleccionado = inputSeleccionado.parentNode.parentNode;
    selecciona_value(inputSeleccionado.id);
});

inputSeleccionado.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        total.value = parseFloat(total.value) -  (parseFloat(trSeleccionado.children[2].innerHTML) - parseFloat(inputSeleccionado.parentNode.parentNode.children[3].innerHTML) - parseFloat(inputSeleccionado.parentNode.parentNode.children[5].innerHTML));
        trSeleccionado.children[5].innerHTML = (parseFloat(trSeleccionado.children[2].innerHTML) - parseFloat(trSeleccionado.children[3].innerHTML) - parseFloat(inputSeleccionado.value)).toFixed(2);
        total.value = parseFloat(total.value) + parseFloat(inputSeleccionado.value);
        if (trSeleccionado.nextElementSibling) {
            trSeleccionado = trSeleccionado.nextElementSibling;
            inputSeleccionado = trSeleccionado.children[4].children[0];
            inputSeleccionado.focus();                  
            selecciona_value(inputSeleccionado.id);
        };

        //para sacar el disabled del saldo a favor
        if (parseFloat(total.value) === parseFloat(saldo.value)) {
            entregado.removeAttribute('disabled');
        }

    };
});

entregado.addEventListener('focus',e=>{
    entregado.select();
})

entregado.addEventListener('keypress',async e=>{
    const trs = document.querySelectorAll('tbody tr');
    if (e.key === "Enter" && (entregado.value !== "" && parseFloat(entregado.value) !== 0)) {
        let saldo = parseFloat(entregado.value);
        for await(let tr of trs){
            const hijo = tr.children;
            if (saldo !== 0) {
                if (saldo >= parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML)) {
                    hijo[4].children[0].value = (parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML)).toFixed(2);
                    hijo[5].innerHTML = (parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].children[0].value)).toFixed(2);
                    saldo = parseFloat((saldo - parseFloat(hijo[4].children[0].value)).toFixed(2));
                }else{
                    hijo[4].children[0].value = saldo;
                    hijo[5].innerHTML = (parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].children[0].value)).toFixed(2);
                    saldo = 0;
                }
            }else{
                hijo[4].children[0].value = saldo;
                hijo[5].innerHTML = (parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML) - parseFloat(hijo[4].children[0].value)).toFixed(2);
            };
        }
        if (saldo>0) {
            crearCompensadaAFavor(saldo)
        }
        total.value = entregado.value;
    }else if(e.key === "Enter" && (parseFloat(entregado.value) === 0 || entregado.value === "")){
        for await(let tr of trs){
            const hijo = tr.children;
            hijo[4].children[0].value = 0;
            hijo[5].innerHTML = (parseFloat(hijo[2].innerHTML) - parseFloat(hijo[3].innerHTML)).toFixed(2);
        };
        total.value = entregado.value;
    }
})

imprimir.addEventListener('click',async e=>{
    const recibo = {};
    recibo.fecha = new Date();
    recibo.cliente = nombre.value;
    recibo.idCliente = codigo.value;
    const cliente = (await axios.get(`${URL}clientes/id/${codigo.value}`)).data;
    recibo.numero = (await axios.get(`${URL}numero`)).data["Recibo"] + 1;
    recibo.tipo_comp = "Recibo";
    recibo.descuento = 0;   
    recibo.precio = parseFloat(total.value);
    console.log(recibo)
    asdasdasdasd
    await modificarCuentaCompensadas();
    await ponerEnCuentaHistorica(recibo);
    await descontarSaldoCliente(recibo.idCliente,recibo.precio);
    await axios.post(`${URL}recibo`,recibo);
    const lista = [];
    const trs = document.querySelectorAll('tbody tr');
    for await(let tr of trs){
        if (parseFloat(tr.children[4].children[0].value) !== 0 && tr.children[4].children[0].value !== "") {
            const venta = {};
            venta.fecha = tr.children[0].innerHTML;
            venta.comprobante = tr.children[1].innerHTML;
            venta.pagado = parseFloat(tr.children[3].innerHTML) + parseFloat(tr.children[4].children[0].value)
            lista.push(venta);   
        }
    };
    await axios.put(`${URL}numero/Recibo`,{Recibo:recibo.numero})
    // ipcRenderer.send('imprimir',[recibo,cliente,lista])
    location.href = "../menu.html";
});


const descontarSaldoCliente =async(idCliente,precio)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${idCliente}`)).data;
    cliente.saldo = (cliente.saldo - precio).toFixed(2);
    await axios.put(`${URL}clientes/id/${idCliente}`,cliente);
};

const modificarCuentaCompensadas = async()=>{
    const trs = document.querySelectorAll('tbody tr');
    for await(let tr of trs){
        const numero = parseFloat(tr.children[4].children[0].value) !== 0 ? tr.children[1].innerHTML : "";
        const compensada =  numero !== "" ? (await axios.get(`${URL}compensada/traerCompensada/id/${numero}`)).data : "";
        if (compensada !== "") {
            compensada.pagado = parseFloat((compensada.pagado + parseFloat(tr.children[4].children[0].value)).toFixed(2));
            compensada.saldo = parseFloat(tr.children[5].innerHTML).toFixed(2);
            await axios.put(`${URL}compensada/traerCompensada/id/${compensada.nro_venta}`,compensada);
        }
    }
};

const ponerEnCuentaHistorica = async(recibo)=>{
    const cuenta = {};
    cuenta.idCliente = recibo.idCliente;
    cuenta.cliente = recibo.cliente;
    cuenta.nro_venta = recibo.numero;
    cuenta.haber = recibo.precio;
    const cliente = (await axios.get(`${URL}clientes/id/${recibo.idCliente}`)).data;
    cuenta.saldo = (cliente.saldo - recibo.precio).toFixed(2);
    await axios.post(`${URL}historica`,cuenta);
};