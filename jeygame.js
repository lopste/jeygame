const Jeygame = {};
const JeygameInternals = {};

JeygameInternals.Instances = {};
JeygameInternals.Instances.Instance = class {
    constructor(sealed = true) {
        this.name = "Instance";
        this.attributes = {};
        this.parent = undefined;
        this.children = [];
        if(sealed) {Object.seal(this);}
    }
    clearChildren() {
        for(let i = 0; i < this.children.length; i++) {
            this.children[i].destroy();
        }
    }
    getChildren() {return this.children;}
    getChildByName(name) {
        let chosenChild;
        for(let i = 0; i < this.children.length; i++) {
            if(this.children[i].name == name) {
                return this.children[i];
            }
        }
        return null;
    }
    addChild(child) {
        if(child instanceof JeygameInternals.Instances.Instance) {
            if(!(Object.isFrozen(child) || Object.isFrozen(this) && child.parent != this)) {
                this.children.push(child);
                child.parent = this;
            } else {
                console.warn("Child/Parent is frozen or destroyed!");
            }
        }
    }
    destroy(timeout = 0) {
        if(timeout) {
            setTimeout(() => {
                this.clearChildren();
                if(this.parent) {
                    let thisIndex = this.parent.children.indexOf(this);
                    this.parent.children.splice(thisIndex,1);
                }
                this.name = null;
                this.parent = null;
                Object.freeze(this);
                Object.freeze(this.attributes);
            }, timeout)
        } else {
            this.clearChildren();
            if(this.parent) {
                let thisIndex = this.parent.children.indexOf(this);
                this.parent.children.splice(thisIndex,1);
            }
            this.name = null;
            this.parent = null;
            Object.freeze(this);
            Object.freeze(this.attributes);
        }
    }
    setAttribute(attr, value) {
        this.attributes[attr] = value;
    }
    getAttribute(attr) {
        return this.attributes[attr];
    }
    removeAttribute(attr) {
        delete this.attributes[attr];
    }
}

JeygameInternals.Instances.GameController = class extends JeygameInternals.Instances.Instance {
    constructor() {
        super(false);
        this.name = "Game";
        this.children = [];
        this.renderBinds = {};
        this.renderFrame = 0;
        this.gameInfo = {"gameType": "canvas2d"};

        this.renderContext = null;
        let renderInterval = null;
        Object.defineProperty(this, "currentRenderInterval", {
            get() {
                return renderInterval;
            },
            set(value) {
                clearInterval(renderInterval);
                renderInterval = value;
            }
        })
        Object.seal(this);
    }

    bindToRender(id, func) {
        this.renderBinds[id] = {"callback": func};
    }

    unbindFromRender(id) {
        delete this.renderBinds[id];
    }

    setRenderingCanvas(canvas) {
        if(canvas instanceof HTMLCanvasElement) {
            this.renderContext = Jeygame.RenderContext(canvas);
        } else {
            throw new Error("Tried to set rendering canvas to non-canvas object");
        }
    }

    clearRenderInterval(wipe = false) {
        this.currentRenderInterval = null;
        this.renderFrame = 0;

        if(this.renderContext && wipe) {
            this.renderContext.ctx.clearRect(0,0, this.renderContext.canvas.width, this.renderContext.canvas.height);
        }
    }
[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]
    setRenderInterval(refresh) {
        this.currentRenderInterval = setInterval(() => {this.render()}, refresh);
    }

    resizeCanvas(size) {
        if(size instanceof JeygameInternals.Datatypes.Vector2 && this.renderContext) {
            this.renderContext.canvas.width = size.x;
            this.renderContext.canvas.height = size.y;
        }   
    }

    render() {
        if(this.renderContext) {
            this.renderFrame += 1;
            Object.values(this.renderBinds).forEach(call => {
                call.callback();
            });
            let ctx = this.renderContext.ctx
            ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height)
            for (let i = 0; i < this.children.length; i++) {
                let cs = this.children[i];
                if(cs instanceof JeygameInternals.Instances.Sprite) {
                    if(cs.renderer && !(cs.hidden)) {
                        cs.renderer.renderRoutine(cs, ctx, cs.position, cs.rotation);
                    }
                }
            }
        } else {
            console.warn("Jeygame: No rendering context defined!");
        }
    }
}

JeygameInternals.Instances.Sprite = class extends JeygameInternals.Instances.Instance {
    constructor() {
        super(false);
        this.name = "Sprite"
        this.position = Jeygame.Vector2(0,0);
        this.size = Jeygame.Vector2(10,10)
        this.rotation = 0;
        this.renderer = undefined;
        this.hidden = false;
        Object.seal(this)
        this.setRenderer(Jeygame.make("SpriteRenderer"));
    }

    setRenderer(renderer) {
        if(renderer instanceof JeygameInternals.Instances.SpriteRenderer) {
            this.renderer && !(this.renderer == renderer) && this.renderer.destroy();
            this.renderer = renderer;
            this.addChild(renderer);
        } else {
            console.warn("Invalid renderer!");
            this.renderer && this.renderer.destroy();
            this.renderer = null;
        }
    }

    removeRenderer() {
        if(this.renderer) {
            !(Object.isFrozen(this.renderer)) && this.renderer.destroy();
            this.renderer = null;
        }
    }
}

JeygameInternals.Instances.SpriteRenderer = class extends JeygameInternals.Instances.Instance {
    constructor(sealed = true) {
        super(false);
        this.name = "SpriteRenderer";
        this.renderRoutine = (spr, ctx, pos, rot) => {
            ctx.save();
            ctx.fillStyle = "black";

            ctx.translate(pos.x + spr.size.x / 2, pos.y + spr.size.y / 2);
            ctx.rotate(rot * Math.PI / 180);
            ctx.translate(-(pos.x + spr.size.x / 2), -(pos.y + spr.size.y / 2));

            ctx.fillRect(pos.x,pos.y,spr.size.x,spr.size.y);
            ctx.restore();
        };

        if(sealed) {
            Object.seal(this);
        }
    }
}

JeygameInternals.Instances.SpriteRendererImage = class extends JeygameInternals.Instances.SpriteRenderer {
    constructor() {
        super(false);
        this.name = "SpriteRendererImage";

        let defaultImage = new Image();
        this.imageSettings = {
            "image": defaultImage,
            "cropPos": Jeygame.Vector2(0,0),
            "cropSize": Jeygame.Vector2(255,255)
        }

        this.renderRoutine = (spr, ctx, pos, rot) => {
            let ren = spr.renderer;
            let renSettings = ren.imageSettings
            ctx.save();
            ctx.fillStyle = "black";

            ctx.translate(pos.x + spr.size.x / 2, pos.y + spr.size.y / 2);
            ctx.rotate(rot * Math.PI / 180);
            ctx.translate(-(pos.x + spr.size.x / 2), -(pos.y + spr.size.y / 2));
            
            ctx.drawImage(renSettings.image, renSettings.cropPos.x, renSettings.cropPos.y, renSettings.cropSize.x,renSettings.cropSize.y, pos.x, pos.y, spr.size.x, spr.size.y);
            ctx.restore();
        }

        Object.seal(this);
    }

    setImage(url) {
        let newImage = new Image();
        newImage.src = url;

        this.imageSettings.image = newImage;
    }
}

JeygameInternals.Datatypes = {}
JeygameInternals.Datatypes.Vector2 = class {
    constructor(x,y,mag) {
        this.type = "Vector2";
        this.x = x;
        this.y = y;
        this.magnitude = 0;
        Object.seal(this);
    }

    valueOf() {
        return [this.x,this.y];
    }
    toString() {
        return `${this.x}, ${this.y}`;
    }
}
JeygameInternals.Datatypes.RenderContext = class {
    constructor(canvas) {
        this.type = "RenderContext";
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        Object.seal(this);
    }
}

Jeygame.make = function(type, properties) {
    if(JeygameInternals.Instances[type]) {
        let newInstance = new JeygameInternals.Instances[type](true);
        if(properties) {
            for (const [property, value] of Object.entries(properties)) {
                if(property && value) {
                    newInstance[property] = value;
                }
            }
        }
        return newInstance;
    } else {
        throw new Error("Invalid instance");
    }
}

Jeygame.Vector2 = function(x,y,mag = 0) {
    let returnVector = new JeygameInternals.Datatypes.Vector2(x,y,mag);
    return returnVector;
}
Jeygame.RenderContext = function(canvas) {
    let context = new JeygameInternals.Datatypes.RenderContext(canvas);
    return context;
}