const funciones = {}


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
    valor_input = document.getElementById(idInput).value;
    longitud = valor_input.length;
    var selectionEnd = 0 + 1;
    if (document.getElementById(idInput).setSelectionRange) {
    document.getElementById(idInput).focus();
    document.getElementById(idInput).setSelectionRange (0, longitud);
    }
    else if (input.createTextRange) {
    var range = document.getElementById(idInput).createTextRange() ;
    range.collapse(true);
    range.moveEnd('character', 0);
    range.moveStart('character', longitud);
    range.select();
    }
}

funciones.redondear = (numero,decimales)=>{
    const signo = numero >= 0 ? 1 : -1;
    return(parseFloat(Math.round((numero * Math.pow(10,decimales)) + (signo * 0.0001)) / Math.pow(10,decimales)).toFixed(decimales));
  }

module.exports = funciones;