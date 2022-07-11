const salir = document.querySelector('.salir');
const codigo = document.querySelector('#codigo');
const descripcion = document.querySelector('#descripcion');
const marca = document.querySelector('#marca');
const select = document.querySelector('#rubro');
const stock = document.querySelector('#stock');
const costo = document.querySelector('#costo');
const impuesto = document.querySelector('#impuesto');
const costoIva = document.querySelector('#costoIva');
const ganancia = document.querySelector('#ganancia');
const total = document.querySelector('#total');
const guardar = document.querySelector('.guardar');

const sweet  = require('sweetalert2');

const axios = require('axios');
require('dotenv').config()
const URL = process.env.URL;

const traerRubros = async()=>{
    const rubros =  (await axios.get(`${URL}rubro`)).data;
    for await(let {numero,rubro} of rubros){
        const option = document.createElement('option');
        option.text = numero + " - " + rubro,
        option.value = rubro;
        select.appendChild(option)
    }
}

traerRubros();
const {cerrarVentana,apretarEnter} = require('../helpers');

impuesto.addEventListener('blur',e=>{
    costoIva.value = ((parseFloat(impuesto.value) * parseFloat(costo.value)/100) + parseFloat(costo.value)).toFixed(2);
})
total.addEventListener('focus',e=>{
    total.value = (parseFloat(costoIva.value) + (parseFloat(costoIva.value) * parseFloat(ganancia.value) / 100)).toFixed(2);
});

guardar.addEventListener('click',async ()=>{
    const producto = {}
    producto._id = codigo.value;
    producto.descripcion = descripcion.value;
    producto.marca = marca.value;
    producto.rubro = rubro.value;
    producto.stock = stock.value;
    producto.costo = costo.value;
    producto.impuesto = impuesto.value;
    producto.ganancia = ganancia.value;
    producto.precio = total.value;
    console.log(producto);
    const {estado,mensaje} = (await axios.post(`${URL}productos`,producto)).data
    sweet.fire({
        title:mensaje
    })
    if (estado) {
        window.close();
    }
    
})

codigo.addEventListener('keypress',e=>{
    apretarEnter(e,descripcion);
})

descripcion.addEventListener('keypress',e=>{
    apretarEnter(e,marca);
})
marca.addEventListener('keypress',e=>{
    apretarEnter(e,rubro);
})
rubro.addEventListener('keypress',e=>{
    apretarEnter(e,stock);
})
stock.addEventListener('keypress',e=>{
    apretarEnter(e,costo);
})
costo.addEventListener('keypress',e=>{
    apretarEnter(e,impuesto);
});
impuesto.addEventListener('keypress',e=>{
    apretarEnter(e,costoIva);
})

costoIva.addEventListener('keypress',e=>{
    apretarEnter(e,ganancia);
})

ganancia.addEventListener('keypress',e=>{
    apretarEnter(e,total);
})

total.addEventListener('keypress',e=>{
    apretarEnter(e,guardar);
})

salir.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keydown',e=>{
    cerrarVentana(e)
});

codigo.addEventListener('focus',e=>{
    codigo.select();
});

descripcion.addEventListener('focus',e=>{
    descripcion.select();
});

marca.addEventListener('focus',e=>{
    marca.select();
});

rubro.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        e.preventDefault();
        stock.focus();
    }
});

stock.addEventListener('focus',e=>{
    stock.select();
});

costo.addEventListener('focus',e=>{
    costo.select();
});

impuesto.addEventListener('focus',e=>{
    impuesto.select();
});

costoIva.addEventListener('focus',e=>{
    costoIva.select();
});

ganancia.addEventListener('focus',e=>{
    ganancia.select();
});

total.addEventListener('focus',e=>{
    total.select();
});