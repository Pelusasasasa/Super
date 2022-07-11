const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;

const tbody = document.querySelector('tbody');

const numero = document.querySelector('#numero');
const nombre = document.querySelector('#nombre');

numero.value = 1;

const traerRubros = async()=>{
    const rubros = (await axios.get(`${URL}rubro`)).data
    listar(rubros);
};
const listar = async(rubros)=>{
    for await(let {numero,rubro} of rubros){
        tbody.innerHTML += `
            <tr>
                <td>${numero}</td>
                <td>${rubro}</td>
            </tr>
        `;
    }
}

traerRubros()