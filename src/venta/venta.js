const axios = require('axios');
require("dotenv").config();
const URL = process.env.URL;
const sweal = require('sweetalert2');

const { ipcRenderer } = require('electron');
const {cerrarVentana,apretarEnter, selecciona_value} = require('../helpers');

//Parte Cliente
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const telefono = document.querySelector('#telefono');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');

const cantidad = document.querySelector('#cantidad');
const codBarra = document.querySelector('#cod-barra')
const descripcion = document.querySelector('#descripcion');
const precioU = document.querySelector('#precio-U');
const rubro = document.querySelector('#rubro');
const tbody = document.querySelector('.tbody');

//parte totales
const total = document.querySelector('#total');
const descuentoPor = document.querySelector('#descuentoPor');
const descuento = document.querySelector('#descuento');
const cobrado = document.querySelector('#cobrado');
const radio = document.querySelectorAll('input[name="condicion"]');
const cuentaCorrientediv = document.querySelector('.cuentaCorriente');
const facturar = document.querySelector('.facturar');
const borrar = document.querySelector(".borrar");

let movimientos = [];
let descuentoStock = [];
let totalGlobal = 0;

//Por defecto ponemos el A Consumidor Final
const ponerClienteDefault = async()=>{
    listarCliente(1)
};


//Buscamos un cliente, si sabemos el codigo directamente apretamos enter
codigo.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (codigo.value === "") {
            const opciones = {
                path: './clientes/clientes.html',
                botones:false,
            }
            ipcRenderer.send('abrir-ventana',opciones)
        }else{
            listarCliente(codigo.value)
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


cantidad.addEventListener('keypress',async e=>{
    apretarEnter(e,codBarra)
})

cantidad.addEventListener('keydown',e=>{
    if(e.keyCode === 39){
        codBarra.focus();
    }
});

let listaProductos = [];

codBarra.addEventListener('keydown',async e=>{
    if(e.key === "Enter" && codBarra.value !== ""){
        listarProducto(codBarra.value);
    }else if(e.key === "Enter" && codBarra.value === ""){
        const opciones = {
            path: "./productos/productos.html",
            botones: false
        }
        ipcRenderer.send('abrir-ventana',opciones);
    }
});

codBarra.addEventListener('keyup',e=>{
    if(e.keyCode === 37){
        cantidad.focus();
    }
});

precioU.addEventListener('keypress',e=>{
    rubro.focus();
});

rubro.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        const producto = {
            descripcion:codBarra.value.toUpperCase(),
            precio:parseFloat(precioU.value),
            rubro:rubro.value
        };
        console.log(producto)
        listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        tbody.innerHTML += `
        <tr id=${producto._id}>
            <td>${cantidad.value}</td>
            <td></td>
            <td>${codBarra.value.toUpperCase()}</td>
            <td>${precioU.value}</td>
            <td>${(parseFloat(precioU.value) * parseFloat(cantidad.value)).toFixed(2)}</td>
        </tr>
    `;

        total.value = (parseFloat(total.value) + parseFloat(precioU.value) * parseFloat(cantidad.value)).toFixed(2);
        totalGlobal = parseFloat(total.value);
        cantidad.value = "1.00";
        codBarra.value = "";
        precioU.value = ""
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
    return id;
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
    venta.cliente = nombre.value;
    venta.fecha = new Date();
    venta.tipo_comp = "Comprobante";
    venta.idCliente = codigo.value;
    venta.precio = parseFloat(total.value);
    venta.descuento = parseFloat(descuento.value);
    venta.tipo_venta = await verTipoVenta();
    venta.numero = venta.tipo_venta === "CC" ? (await axios.get(`${URL}numero`)).data["Cuenta Corriente"] + 1 : (await axios.get(`${URL}numero`)).data["Contado"] + 1;
    if (venta.tipo_venta === "CC") {
        await axios.put(`${URL}numero/Cuenta Corriente`,{"Cuenta Corriente":venta.numero});
    }else{
        await axios.put(`${URL}numero/Contado`,{Contado:venta.numero});
    }
    venta.listaProductos = listaProductos;
    
     for (let producto of listaProductos){
         await cargarMovimiento(producto,venta.numero,venta.cliente);
         await descontarStock(producto)
         producto.producto.precio = producto.producto.precio - parseFloat((parseFloat(descuentoPor.value) * producto.producto.precio / 100).toFixed(2));
     }
     await axios.put(`${URL}productos`,descuentoStock)
     await axios.post(`${URL}movimiento`,movimientos);
    //sumamos al cliente el saldo y agregamos la venta a la lista de venta
     venta.tipo_venta === "CC" && sumarSaldo(venta.idCliente,venta.precio,venta.numero);
    
    //Ponemos en la cuenta conpensada si es CC
     venta.tipo_venta === "CC" && ponerEnCuentaCompensada(venta);
     venta.tipo_venta === "CC" && ponerEnCuentaHistorica(venta,parseFloat(saldo.value));

     const cliente = (await axios.get(`${URL}clientes/id/${codigo.value}`)).data;

     await axios.post(`${URL}ventas`,venta);
     ipcRenderer.send('imprimir',[venta,cliente,listaProductos]);
     location.reload();
})

//Lo que hacemos es listar el cliente traido
const listarCliente = async(id)=>{
    codigo.value = id;
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    if (cliente !== "") {
        nombre.value = cliente.nombre;
        saldo.value = cliente.saldo;
        telefono.value = cliente.telefono;
        localidad.value = cliente.localidad;
        codBarra.focus();
        cliente.condicionFacturacion === 1 ? cuentaCorrientediv.classList.remove('none') : cuentaCorrientediv.classList.add('none')
    }else{
    

        codigo.value = "";
        codigo.focus();
    }
};
ponerClienteDefault();

const ponerEnCuentaCompensada = async(venta)=>{
    const cuenta = {};
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.importe = venta.precio;
    cuenta.saldo = venta.precio;
    await axios.post(`${URL}compensada`,cuenta);
};

const ponerEnCuentaHistorica = async(venta,saldo)=>{
    const cuenta = {};
    cuenta.cliente = venta.cliente;
    cuenta.idCliente = venta.idCliente;
    cuenta.nro_venta = venta.numero;
    cuenta.debe = venta.precio;
    cuenta.saldo = venta.precio + saldo;
    (await axios.post(`${URL}historica`,cuenta)).data;
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
};

//Descontamos el stock
const descontarStock = async({cantidad,producto})=>{
    producto.stock -= cantidad;
    descuentoStock.push(producto)
}


//Lo que hacemos es listar el producto traido
const listarProducto =async(id)=>{
        let producto = (await axios.get(`${URL}productos/${id}`)).data;
        producto = producto === "" ? (await axios.get(`${URL}productos/buscar/porNombre/${id}`)).data : producto;
        if (producto !== "") {
       const productoYaUsado = listaProductos.find(({producto: product})=>{
           if (product._id === producto._id) {
               return product
           };
        });
        if(producto !== "" && !productoYaUsado){
        listaProductos.push({cantidad:parseFloat(cantidad.value),producto});
        codBarra.value = producto._id;
        precioU.value = (producto.precio.toFixed(2));
        tbody.innerHTML += `
        <tr id=${producto._id}>
            <td>${cantidad.value}</td>
            <td>${codBarra.value}</td>
            <td>${producto.descripcion.toUpperCase()}</td>
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
            tr.children[4].innerHTML = (parseFloat(tr.children[0].innerHTML) * producto.precio).toFixed(2);
            total.value = (parseFloat(total.value) + (parseFloat(cantidad.value) * producto.precio)).toFixed(2);
            totalGlobal = parseFloat(total.value);
        }
        cantidad.value = "1.00";
        codBarra.value = "";
        precioU.value = "";
        codBarra.focus();  
    }else{
        precioU.focus();
    }
        

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

codigo.addEventListener('focus',e=>{
    codigo.select();
});

nombre.addEventListener('focus',e=>{
    nombre.select()
});

localidad.addEventListener('focus',e=>{
    localidad.select();
});

telefono.addEventListener('focus',e=>{
    telefono.select();
});

direccion.addEventListener('focus',e=>{
    direccion.select();
});

descuentoPor.addEventListener('focus',e=>{
    descuentoPor.select();
});

total.addEventListener('focus',e=>{
    total.select();
});

cantidad.addEventListener('focus',e=>{
    cantidad.select();
})

cobrado.addEventListener('focus',e=>{
    cobrado.select();
});

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        
        sweal.fire({
            title: "Cancelar Venta?",
            "showCancelButton": true,
            "confirmButtonText" : "Aceptar",
            "cancelButtonText" : "Cancelar"
        }).then((result)=>{
            if (result.isConfirmed) {
                location.href = "../menu.html" ;
            }
        });
    };
})