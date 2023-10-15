    class Page{
        constructor(id, title, text, x, y){
            this.WIDTH = 300;
            this.HEIGTH = 300;
            this.NODE_CLASS = "node-page";
            this.id = id;
            this.title = title;
            this.text = text;
            this.x = x;
            this.y = y;
        }

    static fromJson(json){
        return new Page(json.id, json.title, json.text, json.x, json.y);
    }

    toJson(){
        return {id: this.id, title: this.title, text: this.text, x: this.x, y: this.y};
    }

    getHTML(){
        return "<div class=\"page\">" +
        "<div class=\"page-title\">" + this.title + "</div>" +
        "<div class=\"page-text\">" + this.text + "</div>" +
        "<button onclick=\"editPage(" + this.id + ")\">Edit</button>"+
        "<button onclick=\"deletePage(" + this.id + ")\">Delete</button>"+
        "</div>";
    }
}
