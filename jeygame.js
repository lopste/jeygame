"use strict";
// jeygame main && properties

const Jeygame = function(find) {
    let returnValue = [];
    if(typeof find == "string") {
        let findIn = find.split(" ");

        // go through the list of instances
        for(let i = 0; i < Jeygame.instances.length; i++) {
            let foundInInstance = false;
            // go through the list of the current instance's components
            for(let j = 0; j < Jeygame.instances[i].components.length; j++) {
                // see if they match any
                for(let o = 0; o < findIn.length; o++) {
                    if(Jeygame.instances[i].components[j] == findIn[o]) {
                        // if they do, continue
                        foundInInstance = true;
                        returnValue.push(Jeygame.instances[i]);
                    }
                    if(foundInInstance) break;
                }
                if(foundInInstance) break;
            }
            if(foundInInstance) continue;
        }
    } else if(typeof find == "number") {
        returnValue.push(Jeygame.instances[find])
    }
    return returnValue;
}
Jeygame.element = undefined;
Jeygame.instances = [];
Jeygame.keysHeld = {};

const __jg_errors = {
    "noRendering": "Jeygame has no rendering element! Use Jeygame.init()",
    "notRendered": "Instance is not being rendered!"
}

Jeygame.components = {
    "2d": {
        "properties": {
            "rendered": "true",
            "size": {"width": 10, "height": 10},
            "resize": function(x,y) {
                this.size.width = x, this.size.width = y;
                this.element.style.setProperty("width", `${x}px`);
                this.element.style.setProperty("height", `${y}px`);
                return this;
            },
            "moveTo": function(x,y) {this.position.x = x, this.position.y = y; return this;},
            "moveBy": function(x,y) {this.position.x += x, this.position.y += y; return this;},
            "element": document.createElement("div")
        },
        "init": function(instance) {
            let positionProperties = {};
            let x = 0, y = 0;
            instance.position = positionProperties;
            Object.defineProperties(positionProperties, {
                "x": {
                    enumerable: true,
                    get() {
                        return x;
                    },
                    set(v) {
                        x = v;
                        instance.element.style.setProperty("left", `${v}px`);
                    }
                },
                "y": {
                    enumerable: true,
                    get() {
                        return y;
                    },
                    set(v) {
                        y = v;
                        instance.element.style.setProperty("top", `${v}px`);
                    }
                }
            })
            if(Jeygame.element) {
                instance.element.style.setProperty("width", `${instance.size.width}px`);
                instance.element.style.setProperty("height", `${instance.size.height}px`);
                instance.element.style.setProperty("position", "absolute");
                instance.element.style.setProperty("left", "0px");
                instance.element.style.setProperty("top", "0px");
                Jeygame.element.append(instance.element);
            } else {
                throw new Error(__jg_errors.noRendering);
            }
        },
    },
    "color": {
        "properties": {
            "colorSet": "#008cff",
            "color": function(clr) {
                this.colorSet = clr;
                this.element.style.setProperty("background-color", clr);
                return this;
            }
        },
        "init": function(instance) {
            if(instance.components.indexOf("2d") != -1) {
                instance.element.style.setProperty("background-color", "#008cff");
            } else {
                throw new Error(__jg_errors.notRendered);
            }
        }
    },
    "rotate": {
        "properties": {
            "rotation": 0,
            "rotateTo": function(rot) {
                this.rotation = rot % 360;
                this.element.style.setProperty("transform", `rotate(${this.rotation}deg)`);
                return this;
            },
            "rotateBy": function(rot) {
                this.rotation += rot;
                this.rotation = this.rotation % 360;
                this.element.style.setProperty("transform", `rotate(${this.rotation}deg)`);
                return this;
            }
        },
        "init": function(instance) {
            if(instance.components.indexOf("2d") == -1) {
                throw new Error(__jg_errors.notRendered);
            }
        }
    },
    "border": {
        "properties": {
            "borderColorSet": "black",
            "borderWidthSet": 2,
            "borderStyleSet": "solid",
            "borderRadiusSet": 0,
            "borderColor": function(clr) {
                this.borderColorSet = clr;
                this.element.style.setProperty("border-color", clr);
                return this;
            },
            "borderWidth": function(wid) {
                this.borderWidthSet = wid;
                this.element.style.setProperty("border-width", `${wid}px`);
                return this;
            },
            "borderStyle": function(sty) {
                this.borderStyleSet = sty;
                this.element.style.setProperty("border-style", sty);
                return this;
            },
            "borderRadius": function(rad) {
                this.borderRadiusSet = rad;
                this.element.style.setProperty("border-radius", `${rad}px`);
                return this;
            }
        },
        "init": function(instance) {
            if(instance.components.indexOf("2d") != -1) {
                instance.element.style.setProperty("border-color", "black");
                instance.element.style.setProperty("border-width", "2px");
                instance.element.style.setProperty("border-style", "solid");
            } else {
                throw new Error(__jg_errors.notRendered);
            }
        }
    },
    "css": {
        "properties": {
            "setCSSProperty": function(prop, val) {
                this.element.style.setProperty(prop,val)
                return this;
            },
            "getCSSProperty": function(prop) {
                return this.element.style.getPropertyValue(prop);
            }
        },
        "init": function(instance){
            if(instance.components.indexOf("2d") == -1) {
                throw new Error(__jg_errors.notRendered);
            }
        }
    }
}
Jeygame.fire = function(event) {
    let argsWithoutEvent = [...arguments];
    argsWithoutEvent.splice(0, 1);

    for(let i = 0; i < Jeygame.instances.length; i++) {
        if(Jeygame.instances[i].events[event]) Jeygame.instances[i].events[event](...argsWithoutEvent);
    }
}

let _jg_process_last
function _jg_update_frame(t) {
    let dt;
    if(!_jg_process_last) {
        _jg_process_last = t;
        dt = 0;
    } else {
        dt = t - _jg_process_last;
        _jg_process_last = t;
    }
    Jeygame.fire("process", dt)
    window.requestAnimationFrame(_jg_update_frame);
}
window.requestAnimationFrame(_jg_update_frame);

Object.defineProperties(Jeygame, {
    "currentID": {
        "enumerable": false,
        "writable": true,
        "value": 0
    }
});

// classes

class JeygameInstance {
    constructor(id) {
        Jeygame.instances[id] = this;
        Object.defineProperty(this, "ID", {
            "value": id,
            "enumerable": true,
            "writable": false
        })
        this.components = [];
        this.attributes = {};
        this.events = {};
    }

    addComponents(cmp) {
        let components = cmp.split(" ");
        for(let i = 0; i < components.length; i++) {
            if(this.components.indexOf(components[i]) == -1) {
                Object.assign(this, Jeygame.components[components[i]].properties);
                if(Jeygame.components[components[i]].init) {
                    Jeygame.components[components[i]].init(this)
                }
                this.components.push(components[i])
            }
        }
        return this;
    }

    bind(event, callback) {
        if(callback instanceof Function) {
            this.events[event] = callback;
        }
        if(!callback) {
            delete this.events[event];
        }
        return this;
    }

    fire(event) {
        let argsWithoutEvent = [...arguments];
        argsWithoutEvent.splice(0, 1);

        if(this.events[event]) this.events[event](...argsWithoutEvent);
        return this;
    }

    destroy() {
        this.fire("destroy");
        this.events = {};
        this.rendered = false;
        Object.freeze(this);
        Object.freeze(this.events)

        return this;
    }
}

// jeygame functions

Object.defineProperties(Jeygame, {
    "init": {
        "enumerable": true,
        "writable": false,
        "value": function(sizeX, sizeY, element=null) {
            let jgElement = element;
            if(!element) {
                jgElement = document.createElement("div");
                document.body.append(jgElement);
            }
            jgElement.style.setProperty("width", `${sizeX}px`);
            jgElement.style.setProperty("height", `${sizeY}px`);
            jgElement.style.setProperty("position", "relative");
            jgElement.style.setProperty("background-color", "#fff");
            jgElement.style.setProperty("overflow", "hidden");
            jgElement.style.setProperty("outline", "none");
            jgElement.setAttribute("tabindex", "0")
            Jeygame.element = jgElement;
            jgElement.addEventListener("keydown", ({key}) => {
                let keyHeld = key.toLowerCase()
                if(keyHeld == " ") {
                    keyHeld = "space";
                }
                Jeygame.keysHeld[keyHeld] = true;
                Jeygame.fire("keydown", keyHeld);
            })
            jgElement.addEventListener("keyup", ({key}) => {
                let keyHeld = key.toLowerCase()
                if(keyHeld == " ") {
                    keyHeld = "space";
                }
                Jeygame.keysHeld[keyHeld] = false;
                Jeygame.fire("keyup", keyHeld);
            })
            jgElement.addEventListener("blur", () => {
                Jeygame.keysHeld = {};
                Jeygame.fire("unfocus");
            })
            jgElement.addEventListener("focus", () => {
                Jeygame.keysHeld = {};
                Jeygame.fire("focus");
            })
            window.addEventListener("resize", () => {
                Jeygame.fire("resizeWindow", window.innerWidth, window.innerHeight);
            })
            return jgElement;
        }
    },
    "make": {
        // make a component
        "enumerable": true,
        "writable": false,
        "value": function(cp) {
            let returnInstance = new JeygameInstance(Jeygame.currentID++);
            let componentList = cp.split(" ");
            componentList = componentList.filter(cp => cp);
            
            for(let i = 0; i < componentList.length; i++) {
                if(Jeygame.components[componentList[i]]) {
                    Object.assign(returnInstance, Jeygame.components[componentList[i]].properties);
                    if(Jeygame.components[componentList[i]].init) {
                        Jeygame.components[componentList[i]].init(returnInstance)
                    }
                }
                returnInstance.components.push(componentList[i])
            }
            returnInstance.components = componentList;
            return returnInstance;
        }
    },
    "keyDown": {
        "enumerable": true,
        "writable": false,
        "value": function(key) {
            return Jeygame.keysHeld[key];
        }
    },
    "fullscreen": {
        "enumerable": true,
        "writable": false,
        "value": function() {
            if(Jeygame.element) {
                return Jeygame.element.requestFullscreen();
                Jeygame.dimensions.x = window.innerWidth;
                Jeygame.dimensions.y = window.innerHeight;
            } else {
                throw new Error(__jg_errors.noRendering);
            }
        }
    },
    "minimize": {
        "enumerable": true,
        "writable": false,
        "value": function() {
            if(Jeygame.element) {
                return document.exitFullscreen();
            } else {
                throw new Error(__jg_errors.noRendering);
            }
        }
    },
    "resizeToFit": {
        "enumerable": true,
        "writable": false,
        "value": function() {
            if(Jeygame.element) {
                document.body.style.setProperty("margin", "0px");
                Jeygame.element.style.setProperty("width", `${window.innerWidth}px`);
                Jeygame.element.style.setProperty("height", `${window.innerHeight}px`);
                Jeygame.dimensions.x = window.innerWidth;
                Jeygame.dimensions.y = window.innerHeight;
            } else {
                throw new Error(__jg_errors.noRendering);
            }
        }
    },
    "resizeTo": {
        "enumerable": true,
        "writable": false,
        "value": function(x,y) {
            if(Jeygame.element) {
                Jeygame.element.style.setProperty("width", `${x}px`);
                Jeygame.element.style.setProperty("height", `${y}px`);
                Jeygame.dimensions.x = x;
                Jeygame.dimensions.y = y;
            } else {
                throw new Error(__jg_errors.noRendering);
            }
            Jeygame.fire("jeygameResize")
        }
    }
});

Jeygame.dimensions = {};

let __jg_x, __jg_y
Object.defineProperties(Jeygame.dimensions, {
    "x": {
        "enumerable": true,
        get() {
            return __jg_x
        },
        set(v) {
            __jg_x = v;
            Jeygame.fire("jeygameResize", __jg_x, __jg_y);
        }
    },
    "y": {
        "enumerable": true,
        get() {
            return __jg_y
        },
        set(v) {
            __jg_y = v;
            Jeygame.fire("jeygameResize", __jg_x, __jg_y);
        }
    }
})