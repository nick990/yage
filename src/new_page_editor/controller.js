const electron = require("electron");
const ipcRender = electron.ipcRenderer;
const remote = electron.remote;
// const {ipcRender, remote} = require('electron');

// Definisci la funzione per salvare l'oggetto JSON aggiornato e chiudere la finestra
function save() {
  // Recupera i valori dei campi di input del form
  var title = document.getElementById("title").value;
  var text = document.getElementById("text").value;
  var newPage = new Page(1, title, text, 200, 200);

  ipcRender.send('NEW-PAGE', newPage.toJson());

  // Chiudi la finestra
  var window = remote.getCurrentWindow();
  window.close();
}
