const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');

const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

let productos = [];
let productoSeleccionado = "";
let ventanaSecundaria = false;


const seleccion = document.querySelector('#seleccion');
const tbody = document.querySelector('tbody');
const agregar = document.querySelector('.agregar');
const modificar = document.querySelector('.modificar');
const salir = document.querySelector('.salir');
const buscador = document.querySelector('#buscarProducto');
const eliminar = document.querySelector('.eliminar');

const listar = (productos)=>{
    console.log(productos)
    productos.forEach(({_id,descripcion,marca,stock,precio})=>{
        tbody.innerHTML += `
            <tr id=${_id}>
                <td>${_id}</td>
                <td>${descripcion}</td>
                <td>${precio.toFixed(2)}</td>
                <td>${stock.toFixed(2)}</td>
                <td>${marca}</td>
            </tr>
        ` 
    })
}

const filtrar = async()=>{
    tbody.innerHTML = '';
    let condicion = seleccion.value;
    if (condicion === "codigo") {
        condicion="_id";
    };
    const descripcion = buscador.value !== "" ? buscador.value : "textoVacio";
    const producto = (await axios.get(`${URL}productos/${descripcion}/${condicion}`)).data;
    producto.length !== 0 && listar(producto);
}
filtrar();
buscador.addEventListener('keyup',filtrar)

//cuando ahcemos un click en un tr lo ponemos como que esta seleccionado
tbody.addEventListener('click',e=>{
    productoSeleccionado && productoSeleccionado.classList.toggle('productoSeleccionado');
    productoSeleccionado = e.target.parentNode;
    productoSeleccionado.classList.toggle('productoSeleccionado');
})

agregar.addEventListener('click',e=>{
    const opciones = {
        path: "./productos/agregarProducto.html",
        botones:true
    }
    ipcRenderer.send('abrir-ventana',opciones);
})

modificar.addEventListener('click',e=>{
    if (productoSeleccionado) {
        const opciones = {
            path: "./productos/modificarProducto.html",
            botones:true,
            informacion:productoSeleccionado.id
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }else{
        sweet.file({title:"Producto no seleccionado"});
    }
})

ipcRenderer.on('informacion-a-ventana',(e,args)=>{
    const producto = JSON.parse(args);
    const trModificado = document.getElementById(producto._id);
    trModificado.children[1].innerHTML = producto.descripcion;
    trModificado.children[2].innerHTML = producto.precio;
    trModificado.children[3].innerHTML = producto.stock;
    trModificado.children[4].innerHTML = producto.marca;
})

ipcRenderer.on('informacion',(e,args)=>{
    const botones = args.botones;
    if(!botones){
        const botones = document.querySelector('.botones');
        botones.classList.add('none');
        ventanaSecundaria = true;
        seleccion.value = "descripcion";
        productoSeleccionado = tbody.children[0];
        productoSeleccionado.classList.add('productoSeleccionado');

    }
})

eliminar.addEventListener('click',async e=>{
    if(productoSeleccionado){
        sweet.fire({
            title:"Seguro Borrar Producto?",
            "showCancelButton":true,
            "confirmButtonText":"Aceptar"
        }).then(async (result)=>{
            if (result.isConfirmed) {
                const mensaje = (await axios.delete(`${URL}productos/${productoSeleccionado.id}`)).data;
                    sweet.fire({title:mensaje});
                     location.reload(); 
            }
        })
    }else{
        sweet.file({title:"No se selecciono ningun producto"});
    }
})


const body = document.querySelector('body');

body.addEventListener('keypress',e=>{
    if (e.key === "Enter" && ventanaSecundaria){
        if (productoSeleccionado) {
            ipcRenderer.send('enviar',{
                        tipo:"producto",
                        informacion:productoSeleccionado.id,
            });
            window.close();
        }else{
            sweet.fire({title:"Producto no seleccionado"});
        }
    }
})

salir.addEventListener('click',e=>{
    location.href = "../menu.html";
});

document.addEventListener("keydown",e=>{
    if (e.key === "Escape" && ventanaSecundaria) {
        window.close();
    }
})