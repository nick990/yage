// Definisci la funzione per salvare l'oggetto JSON aggiornato e chiudere la finestra
function save() {
  // Recupera i valori dei campi di input del form
  var title = document.getElementById("title").value;
  var text = document.getElementById("text").value;

  var newPage = new Page(1, title, text, 200, 200);
  // Invia l'oggetto aggiornato al padre
  window.opener.postMessage(newPage.toJson(), "*");

  // Chiudi la finestra
  window.close();
}
