const agregar = document.querySelector('.agregar');
const nombre = document.querySelector('#nombre');
const botones = document.querySelector('.botones');
const modificar = document.querySelector('.modificar');
const eliminar = document.querySelector('.eliminar');
const salir = document.querySelector('.salir');
const tbody = document.querySelector('tbody');


const axios = require('axios');
const { ipcRenderer } = require('electron/renderer');
require('dotenv').config()
const URL = process.env.URL;
let ventanaSecundaria = false
let seleccionado

ipcRenderer.on('informacion',(e,args)=>{
    if (!args.botones) {
        botones.classList.add('none');
        ventanaSecundaria = true;
        seleccionado = tbody.children[0];
        seleccionado.classList.add('seleccionado');
    } 
})



agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana',{path:"./clientes/agregarCliente.html"});
})
modificar.addEventListener('click',e=>{
    seleccionado ? ipcRenderer.send('abrir-ventana',{path:"clientes/modificarCliente.html",informacion:seleccionado.id}) : alert("Cliente no seleccionado");

})
eliminar.addEventListener('click',async e=>{
    if (seleccionado) {
        const mensaje = (await axios.delete(`${URL}clientes/id/${seleccionado.id}`)).data;
        alert(mensaje);
        location.reload();
    }else{
        alert("Cliente no seleccionado");
    }
})

salir.addEventListener('click',e=>{
    location.href = "../menu.html";
});


const filtrar = async()=>{
    tbody.innerHTML = "";
    let clientes;
    if (nombre.value !== "") {
        clientes = (await axios.get(`${URL}clientes/buscar/${nombre.value}`)).data; 
    }else{
        clientes = (await axios.get(`${URL}clientes/buscar/NADA`)).data; 
    }
    listarClientes(clientes);
}
filtrar();

nombre.addEventListener('keyup',filtrar);

const listarClientes = async(clientes)=>{

    clientes.forEach(({_id,nombre,telefono,direccion,saldo}) => {
        
        tbody.innerHTML +=`
        <tr id="${_id}">
            <td>${_id}</td>
            <td>${nombre}</td>
            <td>${direccion}</td>
            <td>${telefono}</td>
            <td>${saldo.toFixed(2)}</td>
        </tr>
    `
    });
}


tbody.addEventListener('click',e=>{
    if(e.target.nodeName === "TD"){
        seleccionado && seleccionado.classList.remove('seleccionado');
        seleccionado = e.target.parentNode;
        seleccionado.classList.add('seleccionado');
    }
});

const body = document.querySelector('body')
body.addEventListener('keypress',e=>{
    if(e.key === "Enter" && seleccionado){
       ipcRenderer.send('enviar',{
           tipo:"cliente",
           informacion:seleccionado.id
       });
       window.close();
    }
});

document.addEventListener('keydown',e=>{
    if(e.key === "Escape" && ventanaSecundaria){
        ipcRenderer.send('enviar',{
            tipo:"Ningun cliente",
            informacion:""
        })
        window.close();
    }
})