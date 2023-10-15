const electron = require("electron");
const ipc = electron.ipcRenderer;
const fs = require("fs");

// Creazione del grafo
const svg = d3.select("svg");
const width = 10000;
const height = 10000;

let pageEditorPopup;

function drag(simulation) {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
    if (d.fx < 10) d.fx = 10;
    if (d.fy < 10) d.fy = 10;
    if (d.fx > width - 200) d.fx = width - 200;
    if (d.fy > height - 100) d.fy = height - 100;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = d.x;
    d.fy = d.y;

    // Aggiornamento x e y nel dataset 'nodes'
    const draggedNode = d3.select(this).datum();
    const nodeIndex = nodes.findIndex((node) => node.id === draggedNode.id);
    nodes[nodeIndex].x = draggedNode.x;
    nodes[nodeIndex].y = draggedNode.y;
  }
  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

function init() {
  document.getElementById("svg").innerHTML = "";
  simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance(100)
        .strength(0) // Impostiamo la forza di attrazione tra i nodi a 0
    )
    .force(
      "x",
      d3.forceX().x((d) => d.x)
    )
    .force(
      "y",
      d3.forceY().y((d) => d.y)
    )
    .force("charge", d3.forceManyBody().strength(-200))
    .force(
      "collision", // Aggiungiamo una forza di collisione
      d3
        .forceCollide()
        .radius((d) => d.r + 10)
        .strength(1)
    )
    .alpha(0.3) // Abbassiamo il valore di alpha per rallentare la simulazione e rendere il movimento più fluido
    .alphaDecay(0.02); // Aggiungiamo una alpha decay per far rallentare gradualmente la simulazione

  const node = svg
    .selectAll(".node")
    .data(nodes)
    .join("g")
    .attr("class", "node");

  node
    .append("foreignObject")
    .attr("width", function (d) {
      return d.WIDTH;
    })
    .attr("height", function (d) {
      return d.HEIGTH;
    })
    .attr("style", "overflow: visible;")
    .attr("class", function (d) {
      return d.NODE_CLASS;
    })
    .attr("rx", 16)
    .attr("ry", 16)
    .append("xhtml:body")
    .html((d) => d.getHTML());

  // Aggiungiamo le frecce ai link
  const defs = svg.append("defs");
  defs
    .append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 8)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("class", "arrowhead");
  const link = svg
    .selectAll(".link")
    .data(links)
    .join("line")
    .attr("class", "link")
    .attr("stroke", "black")
    .attr("marker-end", "url(#arrow)");

  node.call(drag(simulation));

  simulation.on("tick", () => {
    link
      .attr("x1", (d) => d.source.x + d.source.WIDTH)
      .attr("y1", (d) => d.source.y + d.source.HEIGTH / 2)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + d.target.HEIGTH / 2);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  });
}

/**
 * Update graph data from json data
 * data : {
 *   pages: [Page],
 *   choices: [Choice]
 * }
 */
function buildDataFromJson(data) {
  pages = data.pages.map((page) => Page.fromJson(page));
  choices = data.choices.map((choice) => Choice.fromJson(choice));
  nodes = [];
  nodes = nodes.concat(pages);
  nodes = nodes.concat(choices);
  links = [];
  data.choices.forEach((choice) => {
    links.push({ source: choice.source, target: choice.id });
    links.push({ source: choice.id, target: choice.target });
  });
  init();
}

/**
 * Donwload the current graph as json file
 */
function downloadJSON() {
  var choices_json = choices.map((choice) => choice.toJson());
  var pages_json = pages.map((page) => page.toJson());
  const data_to_save = { pages: pages_json, choices: choices_json };

  const jsonString = JSON.stringify(data_to_save, null, 2);
  var blob = new Blob([jsonString], { type: "application/json" });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  window.URL.revokeObjectURL(url);
}

// Click sul bottone di edit di una pagina
function editPage(id) {
  var page = pages.find((page) => page.id === id);
  var pageJSON = JSON.stringify(page);
  ipc.send("OPEN_PAGE_EDITOR", pageJSON);
}

// Click sul bottone di crezione pagina
function newPage() {
  ipc.send("OPEN_NEW_PAGE_EDITOR");
}

// Click sul bottone di elinamazione pagina
function deletePage(id){
  var pageIndex = pages.findIndex((page) => page.id === id);
  pages.splice(pageIndex, 1);
  var choicesToDelete = choices.filter((choice) => choice.source === id || choice.target === id);
  choicesToDelete.forEach((choice) => {
    var choiceIndex = choices.findIndex((c) => c.id === choice.id);
    choices.splice(choiceIndex, 1);
  });
  var choices_json = choices.map((choice) => choice.toJson());
  var pages_json = pages.map((page) => page.toJson());
  var data = { pages: pages_json, choices: choices_json };
  buildDataFromJson(data);
}



// Gestione degli eventi
// Menu 'File->Open file'
ipc.on("FILE_OPEN", (_, file_path) => {
  const data = JSON.parse(fs.readFileSync(file_path));
  console.log(data);
  buildDataFromJson(data);
});
// Menu 'File->Save file'
ipc.on("FILE_SAVE", (_) => {
  downloadJSON();
});

/**
 * New page created from popup
 */
ipc.on("NEW-PAGE", (_, new_page) => {
  var choices_json = choices.map((choice) => choice.toJson());
  var pages_json = pages.map((page) => page.toJson());
  var newPage = Page.fromJson(new_page);
  newPage.id = findNextId();
  pages_json.push(newPage);
  var data = { pages: pages_json, choices: choices_json };
  buildDataFromJson(data);
});

/**
 * Page edited from popup
 */
ipc.on("PAGE-EDIT", (_, data) => {
  var updatedPage = Page.fromJson(data);
  // Aggiorna l'oggetto page nell'array nodes
  var nodeIndex = nodes.findIndex((node) => node.id === updatedPage.id);
  nodes[nodeIndex] = updatedPage;
  var pageIndex = pages.findIndex((page) => page.id === updatedPage.id);
  pages[pageIndex] = updatedPage;
  init();
});

function findNextId() {
  var maxId = 0;
  nodes.forEach((node) => {
    if (node.id > maxId) maxId = node.id;
  });
  return maxId + 1;
}

/**
 * Array of nodes for D3 graph
 */
nodes = [];
/**
 * Array of links for D3 graph
 */
links = [];
pages = [];
choices = [];

