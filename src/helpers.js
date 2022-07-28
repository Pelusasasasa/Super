const funciones = {}
const Afip = require('@afipsdk/afip.js');
const afip = new Afip({CUIT:20416104655});

//cerramos la ventana al apretrar escape
funciones.cerrarVentana = (e)=>{
        if (e.key === "Escape") {
            window.close();
        }
}

funciones.apretarEnter = async (e,input)=>{
    if(e.key === "Enter"){
        input.focus();
    }
}

funciones.selecciona_value = (idInput)=>{
    const seleccionado = document.getElementById(idInput);
    seleccionado.select();
}

funciones.redondear = (numero,decimales)=>{
    const signo = numero >= 0 ? 1 : -1;
    return(parseFloat(Math.round((numero * Math.pow(10,decimales)) + (signo * 0.0001)) / Math.pow(10,decimales)).toFixed(decimales));
}

funciones.cargarFactura = async (venta)=>{
    const fecha = new Date(Date.now()-((new Date()).getTimezoneOffset()*60000)).toISOString().split('T')[0];
    const serverStatus = await afip.ElectronicBilling.getServerStatus();
    console.log(serverStatus)
    let ultimaElectronica = await afip.ElectronicBilling.getLastVoucher('3',venta.cod_comp);
    console.log(ultimaElectronica);
    let data = {
        'cantReg':1,
        'CbteTipo':venta.cod_comp,
        'Concepto':1,
        'DocTipo':venta.cod_doc,
        'DocNro':venta.num_doc,
        'CbteDesde':ultimaElectronica + 1,
        'CbteHasta':ultimaElectronica + 1,
        'CbteFch': parseInt(fecha.replace(/-/g, '')),
        'ImpTotal':venta.precio,
        'ImpTotConc':0,
        'ImpNeto': parseFloat((venta.gravado21+venta.gravado0).toFixed(2)),
        'ImpOpEx': 0,
        'ImpIVA': parseFloat((venta.iva21+venta.iva0 ).toFixed(2)), //Importe total de IVA
        'ImpTrib': 0,
        'MonId': 'PES',
        'PtoVta': 3,//ver
        'MonCotiz' 	: 1,
    };
    console.log(data)
    const res = await afip.ElectronicBilling.createVoucher(data); //creamos la factura electronica
    console.log(res)
};

module.exports = funciones;