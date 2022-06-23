const { app, BrowserWindow,Menu } = require('electron');
const { ipcMain } = require('electron/main');
const path = require('path');
var isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false;


if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}

if (require('electron-squirrel-startup')) {
  app.quit();
}
let ventanaPrincipal;
const createWindow = () => {
  // Create the browser window.
   ventanaPrincipal = new BrowserWindow({
    webPreferences:{
      nodeIntegration:true,
      contextIsolation: false,
    }
  });
  ventanaPrincipal.maximize();

  // and load the index.html of the app.
  ventanaPrincipal.loadFile(path.join(__dirname, 'menu.html'));

  hacerMenu();
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('enviar',(e,args)=>{
  ventanaPrincipal.webContents.send('recibir',JSON.stringify(args));
});


ipcMain.on('abrir-ventana',(e,args)=>{
  abrirVentana(args.path,args.altura,args.ancho)
  nuevaVentana.on('ready-to-show',async()=>{
    nuevaVentana.webContents.send('informacion',args)
  })
});

ipcMain.on('enviar-ventana-principal',(e,args)=>{
  ventanaPrincipal.webContents.send('recibir-ventana-secundaria',JSON.stringify(args));
});

ipcMain.on('imprimir',(e,args)=>{

  abrirVentana("ticket/ticket.html",800,500);
  nuevaVentana.webContents.on('did-finish-load',function() {
    nuevaVentana.webContents.send('imprimir',JSON.stringify(args));
    nuevaVentana.webContents.print({silent:true,deviceName:"SAM4S GIANT-100"},(success,errorType)=>{
      if (success) {
        ventanaPrincipal.focus();
        nuevaVentana.close();
      }else{
        ventanaPrincipal.focus();
        nuevaVentana && nuevaVentana.close();
      };
    });
  });
})


let nuevaVentana;
const abrirVentana = (direccion,altura = 700,ancho = 1200)=>{
  nuevaVentana = new BrowserWindow({
    height: altura,
    width: ancho,
    modal:true,
    parent:ventanaPrincipal,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation:false
    }
  });

  nuevaVentana.loadFile(path.join(__dirname, `${direccion}`));
  nuevaVentana.setMenuBarVisibility(false)
  nuevaVentana.on('close',async()=>{
    if (direccion === "./clientes/agregarCliente.html") {
      ventanaPrincipal.reload()
    }
  })
  // nuevaVentana.setMenuBarVisibility(false);
}

ipcMain.on('informacion-a-ventana',(e,args)=>{
  ventanaPrincipal.webContents.send('informacion-a-ventana',JSON.stringify(args));
})

const hacerMenu = () => {
  //Hacemos el menu

  const template = [

    {
      label: "Venta Rapida",
      click(){
         (abrirVentana("ventaRapida/ventaRapida.html",500,400))
        }
    },
    {
      label: "Cambio de producto",
      click(){
        abrirVentana("productos/cambio.html",500,500)
      }
    },
    {
      label: "Datos",
      submenu:[
        {
          label:"Numeros",
          click(){
            abrirVentana("numeros/numeros.html",700,400)
          }
        },
        {
          label:"Listado Saldos",
          click(){
            abrirVentana("clientes/listadoSaldo.html",1000,1200)
          }
        }
      ]
    },
    {
      label:"",
      accelerator: process.platform == "darwin" ? "Comand+D" : "Ctrl+D",
      click(item,focusedWindow){
        focusedWindow.toggleDevTools(); 
      }
    }

  ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}