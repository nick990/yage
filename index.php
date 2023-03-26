<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Grafo del libro game</title>
    <script src="https://d3js.org/d3.v6.min.js"></script>
    <style>
        /* Stili per il grafo */
        .link {
            stroke: #999;
            stroke-opacity: 0.6;
            stroke-width: 1.5px;
        }

        .node {
            stroke-width: 1.5px;
        }

        .node text {
            pointer-events: none;
            font: 10px sans-serif;
        }

        body {
            margin: 0;
            padding: 0;
        }

        #svg-container {
            overflow: auto;
            width: 100%;
            height: 100%;
        }
        svg{
            background-color: #f5f5f5;
        }
        .node-page body{
            height: 100%;
            width: 100%;
            background-color: white;
            border: 1px solid black;
            overflow: auto; 
        }
        .link-text{
            /* height: 100%;
            width: 100%; */
            background-color: white;
            border: 1px solid green;
            overflow: auto; 
        }
        .page{        
            margin: 10px 10px 10px 10px;           
        }
        .page-text{
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
        }
        .page-title{
            font-size: 16px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
        }
        .choice{        
            margin: 10px 10px 10px 10px;           
        }
        .choice-text{
            font-size: 12px;
            font-family: Arial, Helvetica, sans-serif;
        }
        </style>
</head>

<body>
<input type="file" id="file-input" />
<button onclick="loadData()">Carica dati</button>
<button onclick="downloadJSON()">Download JSON</button>


    <div id="svg-container">
        <svg width="10000" height="10000">
        </svg>
    </div>
        <script type="text/javascript" src="models/page.js"></script>
        <script type="text/javascript" src="models/choice.js"></script>
        <script type="text/javascript" src="graph.js"></script>
</body>

</html>