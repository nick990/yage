(function(global){

    PAGE_OUT = "page_out";
    CHOICE_OUT = "choice_out";

    var LiteGraph = global.LiteGraph;
    
    //Page
    function Page(){
        this.addInput("IN", CHOICE_OUT);        
        this.addOutput("OUT", PAGE_OUT);
    }
    Page.title = "Page";
    Page.desc = "A simple page";
    LiteGraph.registerNodeType("basic/Page", Page);

    // Choice
    function Choice(){
        this.addInput("IN", PAGE_OUT);
        this.addOutput("OUT", CHOICE_OUT);
    }
    Choice.title = "Choice";
    Choice.desc = "A simple choice";
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