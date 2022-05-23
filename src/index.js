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
      label: "Cambio de Stock",
      click(){
        abrirVentana("productos/cambioStock.html",500,400)
      }
    },
    {
      label: "Cambio de Precio",
      click(){
        abrirVentana("productos/cambioPrecio.html",500,400)
      }
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