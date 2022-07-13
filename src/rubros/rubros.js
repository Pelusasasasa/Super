const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const sweet = require('sweetalert2');

const tbody = document.querySelector('tbody');

const numero = document.querySelector('#numero');
const nombre = document.querySelector('#nombre');

const agregar = document.querySelector('.agregar');
const modificar = document.querySelector('.modificar');

let seleccionado = "";

const traerRubros = async()=>{
    numero.value = (await axios.get(`${URL}rubro/id`)).data;
    const rubros = (await axios.get(`${URL}rubro`)).data;
    listar(rubros);
};
const listar = async(rubros)=>{
    for await(let {numero,rubro} of rubros){
        tbody.innerHTML += `
            <tr id="${numero}">
                <td>${numero}</td>
                <td>${rubro}</td>
            </tr>
        `;
    }
};

agregar.addEventListener('click',async e=>{
    if (nombre.value !== "") {
        const nuevoRubro = {
            rubro:nombre.value,
            numero:numero.value
        };
        await axios.post(`${URL}rubro`,nuevoRubro);
        tbody.innerHTML = "";
        traerRubros();
    }else{
        await sweet.fire({
            title:"Debe agregar un nombre al Rubro",
            returnFocus:false
        });
    }
    nombre.value = "";
    nombre.focus();
})

traerRubros();

tbody.addEventListener('click',e=>{
    seleccionado = e.path[1];
    agregar.classList.add('none');
    modificar.classList.remove('none');
    numero.value = seleccionado.children[0].innerHTML;
    nombre.value = seleccionado.children[1].innerHTML;
})

document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {
        window.close();
    }
});

nombre.addEventListener('focus',e=>{
    nombre.select();
});

modificar.addEventListener('click',e=>{
    if(nombre.value !== ""){
        const rubroModificado = {
            rubro: nombre.value,
            numero:numero.value
        }
        axios.put(`${URL}rubro/${numero.value}`,rubroModificado);
        tbody.innerHTML = "";
        traerRubros();
        nombre.value = "";
        modificar.classList.add('none');
        agregar.classList.remove('none');
    }
})