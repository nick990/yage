class Choice{
    constructor(source,target,text){
        this.source = source;
        this.target = target;
        this.text = text;
    }

    static fromJson(json){
        return new Choice(json.source, json.target, json.text);
    }

    toJson(){
        return {source: this.source, target: this.target, text: this.text};
    }

    getHTML(){
        return "<div class=\"choice\">" +
        "<div class=\"choice-text\">" + this.text + "</div>" +
        "<div >saidjasiodjsad adaspdkopaskdjas dlkasmdkasd asdkladklamsd</div>" +
        "</div>";
    }
}