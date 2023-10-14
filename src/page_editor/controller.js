const urlParams = new URLSearchParams(window.location.search);
const data = urlParams.get("data");
try {
  page = JSON.parse(decodeURIComponent(data));
} catch (error) {
  console.error("Error parsing JSON data:", error);
}
// Mostra l'oggetto JSON nei campi di input del form
document.getElementById("title").value = page.title;
document.getElementById("text").value = page.text;

// Definisci la funzione per salvare l'oggetto JSON aggiornato e chiudere la finestra
function save() {
  // Recupera i valori dei campi di input del form
  var title = document.getElementById("title").value;
  var text = document.getElementById("text").value;

  // Aggiorna l'oggetto JSON
  page.title = title;
  page.text = text;
  var updatePage = new Page(page.id, page.title, page.text, page.x, page.y);
  // Invia l'oggetto aggiornato al padre
  window.opener.postMessage(updatePage.toJson(), "*");

  // Chiudi la finestra
  window.close();
}
