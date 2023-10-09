class Choice{
    constructor(id,source,target,text,subtext,x,y){
        this.WIDTH = 300;
        this.HEIGTH = 150;
        this.NODE_CLASS = "node-choice";
        this.id=id;
        this.source = source;
        this.target = target;
        this.text = text;
        this.subtext = subtext;
        this.x = x;
        this.y = y;
    }

    static fromJson(json){
        return new Choice(json.id,json.source, json.target, json.text,json.subtext, json.x, json.y);
    }

    toJson(){
        return {id:this.id,source: this.source, target: this.target, text: this.text,subtext: this.subtext, x: this.x, y: this.y};
    }

    getHTML(){
        return "<div class=\"choice\">" +
        "<div class=\"choice-text\">" + this.text + "</div>" +
        "<div class=\"choice-subtext\">" + this.subtext + "</div>" +
        "</div>";
    }
}