const {ipcRenderer} = require('electron')

const tipoComp = document.querySelector('.tipoComp');
const numeroComp = document.querySelector('.numeroComp');
const fecha = document.querySelector('.fecha');
const hora = document.querySelector('.hora');

//cliente
const cliente = document.querySelector('.cliente');
const direccion = document.querySelector('.direccion');

//listado
const listado = document.querySelector('.listado');

//totales
const descuento = document.querySelector('.descuento');
const total = document.querySelector('.total');
const tipoVenta = document.querySelector('.tipoVenta');

ipcRenderer.on('imprimir',(e,args)=>{
    const [venta,cliente,listado] = JSON.parse(args);
    listar(venta,cliente,listado);
});

const listar = async(venta,clienteTraido,lista)=>{
    let date = new Date(venta.fecha);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minuts = date.getMinutes();
    let seconds = date.getSeconds();

    month = month === 13 ? 1 : month;
    month = month <10 ? `0${month}` : month;
    day = day <10 ? `0${day}` : day;
    hour = hour <10 ? `0${hour}` : hour;
    minuts = minuts <10 ? `0${minuts}` : minuts;
    seconds = seconds <10 ? `0${seconds}` : seconds;
    numeroComp.innerHTML = (venta.numero.toString()).padStart(8,'0');
    tipoComp.innerHTML = venta.tipo_comp;
    fecha.innerHTML = `${day}/${month}/${year}`;
    hora.innerHTML = `${hour}:${minuts}:${seconds}`;
    cliente.innerHTML = venta.cliente;
    direccion.innerHTML = clienteTraido.direccion;

    for await(const {cantidad,producto} of lista){

        listado.innerHTML += `
            <main class = "linea">
                <p>${cantidad.toFixed(2)}/${producto.precio.toFixed(2)}</p>
                <p>(${producto.impuesto.toFixed(2)})</p>
                <p></p>
            </main>
            <main>
                <p>${producto.descripcion}</p>
                <p>${(producto.precio * cantidad).toFixed(2)}</p>
            </main>
        `
    };

    descuento.innerHTML = venta.descuento.toFixed(2);
    total.innerHTML = venta.precio.toFixed(2);
    tipoVenta.innerHTML = venta.tipo_venta === "CD" ? `Contado: $${venta.precio.toFixed(2)}` : "Cuenta Corriente"
}