const electron = require("electron");


const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on("ready", (_) => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on("closed", (_) => {
    console.log("closed");
    mainWindow = null;
  });
});

