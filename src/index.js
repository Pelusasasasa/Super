const { app, BrowserWindow } = require('electron');
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
  ventanaPrincipal.maximize()

  // and load the index.html of the app.
  ventanaPrincipal.loadFile(path.join(__dirname, 'menu.html'));
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
  abrirVentana(args.path,700,1200)
  nuevaVentana.on('ready-to-show',async()=>{
    nuevaVentana.webContents.send('informacion',args)
  })
})


let nuevaVentana;
const abrirVentana = (direccion,altura,ancho)=>{
  nuevaVentana = new BrowserWindow({
    height: altura,
    width: ancho,
    parent:ventanaPrincipal,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation:false
    }
  });

  nuevaVentana.loadFile(path.join(__dirname, `${direccion}`));


  // nuevaVentana.setMenuBarVisibility(false);
}

ipcMain.on('informacion-a-ventana',(e,args)=>{
  ventanaPrincipal.webContents.send('informacion-a-ventana',JSON.stringify(args));
})
