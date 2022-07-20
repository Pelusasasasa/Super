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
    tbody.innerHTML = ""
    productos.forEach(({_id,descripcion,marca,stock,precio})=>{
        const tr = document.createElement('tr');
        const tdId = document.createElement('td');
        tdId.innerHTML = _id;
        const tdDescripcion = document.createElement('td');
        tdDescripcion.innerHTML = descripcion;
        const tdPrecio = document.createElement('td');
        tdPrecio.innerHTML = precio;
        const tdStock = document.createElement('td');
        tdStock.innerHTML = stock;
        const tdMarca = document.createElement('td');
        tdMarca.innerHTML = marca;
        tr.appendChild(tdId);
        tr.appendChild(tdDescripcion);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdStock);
        tr.appendChild(tdMarca);
        tbody.appendChild(tr);
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