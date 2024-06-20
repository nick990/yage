(function(global){

    PAGE_OUT = "page_out";
    CHOICE_OUT = "choice_out";


    var LiteGraph = global.LiteGraph;
    
    //Page
    function Page(){
        this.addInput("IN", CHOICE_OUT);        
        this.addOutput("OUT", PAGE_OUT);
        this.addProperty("Header","");
        this.addProperty("Body", "");
        this.widget = this.addWidget("text","Header", "", "Header", {multiline: true});
        this.widget = this.addWidget("text","Body", "", "Body", {multiline: true});
        this.widgets_up = true;
    }
    Page.title = "Page";
    Page.desc = "A simple page";
    Page.color = "#757A2B";
    LiteGraph.registerNodeType("basic/Page", Page);

    // Choice
    function Choice(){
        this.addInput("IN", PAGE_OUT);
        this.addOutput("OUT", CHOICE_OUT);
    }
    Choice.title = "Choice";
    Choice.desc = "A simple choice";
    Choice.color = "#2249CC";
    LiteGraph.registerNodeType("basic/Choice", Choice);

    // Funnel
    function Funnel(){
        this.addInput("A", CHOICE_OUT);
        this.addInput("B", CHOICE_OUT);
        this.addOutput("OUT", CHOICE_OUT);
    }
    Funnel.title = "Funnel";
    Funnel.desc = "A simple funnel";
    LiteGraph.registerNodeType("utils/Funnel", Funnel);
})(this);