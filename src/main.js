const { app, dialog, Menu, BrowserWindow, ipcMain } = require("electron");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 2000,
    height: 1600,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();

  // Crea il menu
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          click: () => {
            // Apri il dialog per selezionare un file
            dialog.showOpenDialog(
              mainWindow,
              {
                properties: ["openFile"],
              },
              (filePaths) => {
                if (!filePaths || filePaths.length === 0) {
                  // Nessun file selezionato o dialog cancellato
                  return;
                }

                const selectedFilePath = filePaths[0];
                mainWindow.webContents.send("FILE_OPEN", selectedFilePath);
              }
            );
          },
        },
        {
          label: "Save File",
          click: () => {
            mainWindow.webContents.send("FILE_SAVE");
          },
        },
        { role: "quit" },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", (_) => {
    mainWindow = null;
  });
}

function openNewPageEditor() {
  win = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true });
  win.loadURL(`file://${__dirname}/new_page_editor/form.html`);
}

function openPageEditor(_, page) {
  win = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true });
  win.loadURL(`file://${__dirname}/page_editor/form.html?data=${encodeURIComponent(page)}`);
}

app.on("ready", () => {
  createWindow();

  ipcMain.on("OPEN_NEW_PAGE_EDITOR", openNewPageEditor);
  
  ipcMain.on("NEW-PAGE", (_, page) => {
    mainWindow.webContents.send("NEW-PAGE", page);
  });

  ipcMain.on("OPEN_PAGE_EDITOR",openPageEditor);

  ipcMain.on("PAGE-EDIT", (_, page) => {
    mainWindow.webContents.send("PAGE-EDIT", page);
  });


});
