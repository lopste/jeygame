var cnv;
var ctx;

class instance {
    constructor(name="untitled") {
        this.name = name;
        this.data = {};
        this.func = {};
    }
    get type() {
        return {
            "id": 0,
            "name": "instance"
        };
    }
}

// Classes
class sprite extends instance {
    constructor(name="untitled") {
        super(name);
        this.position = {
            "x": 0,
            "y": 0
        };
        this.data.beingDrawn = false;
        this.drawRoutine = function(cc, x, y) {
            cc.drawRect(x, y, 10, 10);
        }
        ;
        this.game = null;
    }
    get type() {
        return {
            "id": 3,
            "name": "sprite"
        };
    }
    moveTo(pos) {
        if ((pos.x != undefined) && (pos.y != undefined)) {
            this.position = pos;
        } else if (pos.x != undefined) {
            this.position.x = pos.x
        } else if (pos.y != undefined) {
            this.position.y = pos.y
        } else {
            Error("Invalid Position")
        }
    }
    moveBy(pos) {
        if ((pos.x != undefined) && (pos.y != undefined)) {
            this.position.x += pos.x;
            this.position.y += pos.y;
        } else if (pos.x != undefined) {
            this.position.x += pos.x
        } else if (pos.y != undefined) {
            this.position.y += pos.y
        } else {
            Error("Invalid Position")
        }
    }
    toggleDrawing(value=null) {
        if (value === null) {
            if (this.data.beingDrawn === false) {
                this.data.beingDrawn = true
            } else {
                this.data.beingDrawn = false
            }
        } else {
            this.data.beingDrawn = value
        }
    }
    addToGame(game) {
        game.sprites.push(this);
        this.game = game;
    }
}

class inputController extends instance {
    constructor(name="untitled") {
        super(name);
        this.bindedFunctions = [];
    }
    bindFunction(arr) {
        arr[0].addEventListener(arr[1], arr[2]);
    }
	 unbindFunction(arr) {
        arr[0].removeEventListener(arr[1], arr[2]);
    }
    get type() {
        return {
            "id": 4,
            "name": "inputController"
        }
    }
}

class canvasController extends instance {
    constructor(canvas, name="untitled") {
        super(name);
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.game = null;
    }
    setStyle(style, type=1) {
        switch (type) {
        case 1:
            this.ctx.fillStyle = style
            break;
        case 2:
            this.ctx.strokeStyle = style
            break;
        case 3:
            this.ctx.font = style;
            break;
        default:
            this.ctx.fillStyle = style;
            break;
        }
    }
	 state(save) {
	 	if (save) {this.ctx.save();} else {this.ctx.restore();}
	 }
	 setScale(x,y) {
	 	this.ctx.scale(x,y);
	 }
	 setImageSmoothing(value=true,qual="low") {
	 	this.ctx.imageSmoothingEnabled = value;
		this.ctx.imageSmoothingQuality = qual;
	 }
    drawRect(x, y, width, height, fill=1) {
        switch (fill) {
        case 1:
            this.ctx.fillRect(x, y, width, height);
            break;
        case 2:
            this.ctx.strokeRect(x, y, width, height);
            break;
        case 3:
            this.ctx.clearRect(x, y, width, height);
            break;
        default:
            Error("Invalid Fill Statement");
            break;
        }
    }
    drawImageWithSlice(url, x, y, ow, oh, ix, iy, iw, ih) {
        let imgToDraw = document.createElement("img");
        imgToDraw.src = url;
        this.ctx.drawImage(imgToDraw, x, y, ow, oh, ix, iy, iw, ih);
        imgToDraw.remove();
    }
    drawImage(url, x, y) {
        let imgToDraw = document.createElement("img");
        imgToDraw.src = url;
        ctx.drawImage(imgToDraw, x, y);
        imgToDraw.remove();
    }
    drawText(text, x, y, fill=1, mw=undefined) {
        switch (fill) {
        case 1:
            this.ctx.fillText(text, x, y, mw)
            break;
        case 2:
            this.ctx.strokeText(text, x, y, mw)
            break;
        default:
            break;
        }
    }
    clearScreen() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
	 setCanvasStyle(style) {this.canvas.style = style}
    addToGame(game) {
        game.rendering.canvasController = this;
    }
    get type() {
        return {
            "id": 2,
            "name": "canvasController"
        };
    }
}

class gameController extends instance {
    constructor(name="untitled") {
        super(name);
        this.rendering = {
            "FPS": 0,
            "canvasController": null,
            "camera": null
        }
        this.sprites = [];
    }
    get type() {
        return {
            "id": 1,
            "name": "gameController"
        };
    }
    render() {
        this.rendering.canvasController.clearScreen();
        for (let i = 0; i <= this.sprites.length; i++) {
            if (this.sprites[i]) {
                let cs = this.sprites[i]
                cs.drawRoutine(this.rendering.canvasController, cs.position.x, cs.position.y);
            }
        }
    }
    setRenderInterval(fps) {
        setInterval(()=>this.render(), 1000 / fps);
    }
}

// Controls
function handleKey(e) {
    console.log(e);
}
