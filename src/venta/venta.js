const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const { ipcRenderer } = require('electron/renderer');
const {cerrarVentana,apretarEnter, selecciona_value} = require('../helpers');

//Parte Cliente
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const cond_iva = document.querySelector('#cond_iva');
const dniCuit = document.querySelector('#dniCuit');
const observaciones = document.querySelector('#observaciones');

const cantidad = document.querySelector('#cantidad');
const codBarra = document.querySelector('#cod-barra')
const descripcion = document.querySelector('#descripcion');
const precioU = document.querySelector('#precio-U');
const precioT = document.querySelector('#precio-total');
const tbody = document.querySelector('.tbody');

//parte totales
const total = document.querySelector('#total');
const descuentoPor = document.querySelector('#descuentoPor');
const descuento = document.querySelector('#descuento');
const cobrado = document.querySelector('#cobrado');
const radio = document.querySelectorAll('input[name="condicion"]');
const facturar = document.querySelector('.facturar');
const borrar = document.querySelector(".borrar");


let movimientos = [];
let totalGlobal = 0;

codigo.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        if (codigo.value === "") {
            const opciones = {
                path: './clientes/clientes.html',
                botones:false,
            }
            ipcRenderer.send('abrir-ventana',opciones)
        }
    }
})

nombre.addEventListener('keypress',e=>{
    apretarEnter(e,telefono);
})

telefono.addEventListener('keypress',e=>{
    apretarEnter(e,localidad);
})

localidad.addEventListener('keypress',e=>{
    apretarEnter(e,direccion);
})

direccion.addEventListener('keypress',e=>{
    apretarEnter(e,codBarra);
})


cantidad.addEventListener('keypress',e=>{
    apretarEnter(e,codBarra)
})
let listaProductos = [];
codBarra.addEventListener('keypress',async e=>{
    if(e.key === "Enter" && codBarra.value !== ""){
        listarProducto(codBarra.value);
    }else if(e.key === "Enter" && codBarra.value === ""){
        descripcion.focus();
    }
});

descripcion.addEventListener('keypress',async e=>{
    if (e.key === "Enter" && codBarra.value === "" && descripcion.value !== "") {
        const producto = (await axios.get(`${URL}productos/buscar/porNombre/${descripcion.value}`)).data;
        if(producto !== ""){
                listarProducto(descripcion.value)
        }else{
            precioU.focus();
        }
    }else if(e.key === "Enter" && descripcion.value === ""){
        const opciones = {
            path: "./productos/productos.html",
            botones: false
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }
})


precioU.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        const producto = {
            descripcion:descripcion.value,
            precio:parseFloat(precioU.value),
        };
        listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        tbody.innerHTML += `
        <tr id=${producto._id}>
            <td>${cantidad.value}</td>
            <td>${codBarra.value}</td>
            <td>${descripcion.value}</td>
            <td>${precioU.value}</td>
            <td>${(parseFloat(precioU.value) * parseFloat(cantidad.value)).toFixed(2)}</td>
        </tr>
    `;

        total.value = (parseFloat(total.value) + parseFloat(precioU.value) * parseFloat(cantidad.value)).toFixed(2);
        totalGlobal = parseFloat(total.value);

        cantidad.value = "1.00";
        descripcion.value = "";
        codBarra.value = "";
        precioU.value = "";
        precioT.value = "";
        codBarra.focus();
    }
})

const volver = document.querySelector('.volver');
volver.addEventListener('click',()=>{
    location.href = "../menu.html";
})

ipcRenderer.on('recibir',(e,args)=>{
    const {tipo ,informacion} = JSON.parse(args);
    tipo === "cliente" && listarCliente(informacion);
    tipo === "producto" && listarProducto(informacion);
    tipo === "Ningun cliente" && nombre.focus();
});


//sacamos el descuento cuando apretamos enter en el input
descuentoPor.addEventListener('keydown',e=>{
    if(e.key === "Enter" || e.key === "Tab"){
        descuento.value = (totalGlobal * (parseFloat(e.target.value)) / 100).toFixed(2);
        total.value = (totalGlobal - parseFloat(descuento.value)).toFixed(2);
    }
})

cobrado.addEventListener('keydown',e=>{
    if (e.key === "Enter" || e.key === "Tab") {
        total.value = parseFloat(cobrado.value).toFixed(2);
        descuento.value = (totalGlobal - (parseFloat(cobrado.value))).toFixed(2);
        descuentoPor.value = (parseFloat(descuento.value)*100/totalGlobal).toFixed(2)
    }
});

//traemos el id de la nueva venta
const traerIdVenta = async()=>{
    const id = (await axios.get(`${URL}ventas`)).data;
    return id
};

//Vemos que input tipo radio esta seleccionado
const verTipoVenta = ()=>{
    let retornar;
    radio.forEach(input =>{
        if (input.checked) {
            retornar = input.value;
        }
    });
    return retornar;
}


facturar.addEventListener('click',async e=>{
    const venta = {};
    venta._id = await traerIdVenta();
    venta.cliente = nombre.value;
    venta.idCliente = codigo.value;
    venta.numero = venta._id;
    venta.precio = parseFloat(total.value);
    venta.descuento = parseFloat(descuento.value);
    venta.tipo_venta = verTipoVenta();
    venta.listaProductos = listaProductos;
    
     for (let producto of listaProductos){
         await cargarMovimiento(producto,venta._id,venta.cliente);
         producto.producto.precio = producto.producto.precio - parseFloat((parseFloat(descuentoPor.value) * producto.producto.precio / 100).toFixed(2));
     }
     await axios.post(`${URL}movimiento`,movimientos);
    //sumamos al cliente el saldo y agregamos la venta a la lista de venta
     venta.tipo_venta === "CC" && sumarSaldo(venta.idCliente,venta.precio,venta._id);
    
    //Ponemos en la cuenta conpensada si es CC
     venta.tipo_venta === "CC" && ponerEnCuentaCompensada(venta);
     venta.tipo_venta === "CC" && ponerEnCuentaHistorica(venta);

     await axios.post(`${URL}ventas`,venta);
     location.href = "../menu.html";
})

//Lo que hacemos es listar el cliente traido
const listarCliente = async(id)=>{
    codigo.value = id;
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    nombre.value = cliente.nombre;
    saldo.value = cliente.saldo;
    telefono.value = cliente.telefono;
    localidad.value = cliente.localidad;
    codBarra.focus();
};

const ponerEnCuentaCompensada = async(venta)=>{
    const cuenta = {};
    cuenta._id = (await axios.get(`${URL}compensada`)).data;
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.importe = venta.precio;
    cuenta.saldo = venta.precio;
    await axios.post(`${URL}compensada`,cuenta);
};

const ponerEnCuentaHistorica = async(venta)=>{
    const cuenta = {};
    cuenta._id = (await axios.get(`${URL}historica`)).data;
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.debe = venta.precio;
    const cliente = (await axios.get(`${URL}clientes/id/${cuenta.idCliente}`)).data;
    cuenta.saldo = venta.precio + cliente.saldo;
    const a = (await axios.post(`${URL}historica`,cuenta)).data;
    alert(a)

}

//Cargamos el movimiento de producto a la BD
const cargarMovimiento = async({cantidad,producto},numero,cliente)=>{
    const movimiento = {};
    movimiento.codProd = producto._id;
    movimiento.producto = producto.descripcion;
    movimiento.cliente = cliente
    movimiento.cantidad = cantidad;
    movimiento.precio = parseFloat((producto.precio - (producto.precio * parseFloat(descuentoPor.value) / 100)).toFixed(2));
    movimiento.rubro = producto.rubro;
    movimiento.nro_venta = numero;
    movimientos.push(movimiento);
}


//Lo que hacemos es listar el producto traido

const listarProducto =async(id)=>{
        const producto = (await axios.get(`${URL}productos/${id}`)).data;
        if (producto !== "") {
       const productoYaUsado = listaProductos.find(({producto: product})=>{
           if (product._id === producto._id) {
               return product
           };
        });
        if(producto !== "" && !productoYaUsado){
        listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        codBarra.value = producto._id;
        descripcion.value = producto.descripcion;
        precioU.value = (producto.precio.toFixed(2));
        precioT.value = producto.precio * parseFloat(cantidad.value);
        tbody.innerHTML += `
        <tr id=${producto._id}>
            <td>${cantidad.value}</td>
            <td>${codBarra.value}</td>
            <td>${descripcion.value.toUpperCase()}</td>
            <td>${precioU.value}</td>
            <td>${(parseFloat(precioU.value) * parseFloat(cantidad.value)).toFixed(2)}</td>
        </tr>
        
    `;
        total.value = (parseFloat(total.value) + (parseFloat(cantidad.value) * parseFloat(precioU.value))).toFixed(2);
        totalGlobal = parseFloat(total.value);
        }else if(producto !== "" && productoYaUsado){
            productoYaUsado.cantidad += parseFloat(cantidad.value)
            const tr = document.getElementById(producto._id);
            tr.children[0].innerHTML = (parseFloat(tr.children[0].innerHTML) + parseFloat(cantidad.value)).toFixed(2);
            tr.children[4].innerHTML = parseFloat(tr.children[0].innerHTML) * producto.precio;
            total.value = (parseFloat(total.value) + (parseFloat(cantidad.value) * producto.precio)).toFixed(2);
            totalGlobal = parseFloat(total.value);
        }  
    }else{
        alert("El Producto No Existe")
    }
        cantidad.value = "1.00";
        descripcion.value = "";
        codBarra.value = "";
        precioU.value = "";
        precioT.value = "";
        codBarra.focus();

}
let seleccionado;
//Hacemos para que se seleccione un tr

tbody.addEventListener('click',e=>{
    if (e.target.nodeName === "TD") {
        seleccionado && seleccionado.classList.remove('seleccionado');
        seleccionado = e.target.parentNode;
        seleccionado.classList.add('seleccionado');
    }
});

//Guardamos el saldo del cliente
const sumarSaldo = async(id,nuevoSaldo,venta)=>{
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    cliente.listaVentas.push(venta);
    cliente.saldo = cliente.saldo + nuevoSaldo;
    await axios.put(`${URL}clientes/id/${id}`,cliente);

}

borrar.addEventListener('click',e=>{
    total.value = (totalGlobal -  parseFloat(seleccionado.children[4].innerHTML)).toFixed(2);
    descuento.value = (parseFloat(descuentoPor.value) * parseFloat(total.value) / 100).toFixed(2);
    total.value = (parseFloat(total.value) - parseFloat(descuento.value)).toFixed(2);
    totalGlobal = parseFloat(total.value);
    listaProductos =  listaProductos.filter(({cantidad,producto})=>producto._id !== seleccionado.id);
    tbody.removeChild(seleccionado);
    seleccionado = "";
});

nombre.addEventListener('focus',e=>{
    selecciona_value(nombre.id);
})

localidad.addEventListener('focus',e=>{
    selecciona_value(localidad.id);
})

telefono.addEventListener('focus',e=>{
    selecciona_value(telefono.id);
})

direccion.addEventListener('focus',e=>{
    selecciona_value(direccion.id);
})

descuentoPor.addEventListener('focus',e=>{
    selecciona_value(descuentoPor.id);
})

total.addEventListener('focus',e=>{
    selecciona_value(total.id);
})

cobrado.addEventListener('focus',e=>{
    selecciona_value(cobrado.id);
});

