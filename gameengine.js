// This game shell was happily modified from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

class GameEngine {


    constructor() {
        this.entities = [];
        this.showOutlines = false;
        this.ctx = null;
        this.click = null;
        this.mouse = null;
        this.wheel = null;
        this.surfaceWidth = null;
        this.surfaceHeight = null;
        this.lastMouse = { x: 0, y: 0 };
        this.G = 0.0667 / 2;

        this.W = false;
        this.A = false;
        this.S = false;
        this.D = false;

        this.camera = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };

        
    };
    init(ctx) {
        this.drawingRadius = 10;
        this.ctx = ctx;
        this.surfaceWidth = this.ctx.canvas.width;
        this.surfaceHeight = this.ctx.canvas.height;
        this.startInput();
        this.timer = new Timer();
    };

    start() {
        
        var that = this;
        document.getElementById("clearButton").onclick = function () { that.clear() };
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();

    };

    clear() {
        this.entities = [];
    }

    startInput() {
        var that = this;

        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;
            if (x == 0 || y == 0 || x == that.ctx.canvas.getBoundingClientRect().right- that.ctx.canvas.getBoundingClientRect().left-1) {
                //console.log("BREAK");
                //if (that.newestEntity) {
                //    that.newestEntity.moveable = true;
                //}
                
            }
            //console.log(that.ctx.canvas.getBoundingClientRect().right);
            //console.log("x: " + x + " y: " + y);

            return { x: x, y: y };
        }
        this.ctx.canvas.addEventListener("keydown", function (e) {
            //console.log(e.code + " Pressed");
            switch (e.code) {
                case "KeyW":
                    that.W = true;
                    break;
                case "KeyA":
                    that.A = true;
                    break;
                case "KeyS":
                    that.S = true;
                    break;
                case "KeyD":
                    that.D = true;
                    break;
                case "KeyC":
                    that.clear();
                    break;
                case "KeyZ":
                    that.newestEntity.removeFromWorld = true;
                    break;
            }
            if (e.code == "ShiftLeft") {
                that.allowZoom = true;
            }
            if (e.code == "AltLeft") {
                that.allowResize = true;
            }
        }, false);

        this.ctx.canvas.addEventListener("keyup", function (e) {
            //console.log(e.code + " Pressed");
            switch (e.code) {
                case "KeyW":
                    that.W = false;
                    break;
                case "KeyA":
                    that.A = false;
                    break;
                case "KeyS":
                    that.S = false;
                    break;
                case "KeyD":
                    that.D = false;
                    break;
            }

            if (e.code == "ShiftLeft") {
                that.allowZoom = false;
            }
            if (e.code == "AltLeft") {
                that.allowResize = false;
            }
        }, false);

        this.ctx.canvas.addEventListener("mousemove", function (e) {
            document.getElementById('gameWorld').focus();
            that.mouse = getXandY(e);
            
        }, false);

        this.ctx.canvas.addEventListener("mousedown", function (e) {
            //console.log(getXandY(e));

            //Left Click
            if (e.which == 1) {
                that.click = getXandY(e);
                let mass = Math.pow(that.drawingRadius, 2) * 1 * Math.PI
                that.newestEntity = new FreeBody(that, (that.click.x - that.offset.x)/that.zoom+that.camera.x, (that.click.y - that.offset.y)/that.zoom +that.camera.y, mass);
                that.addEntity(that.newestEntity);
            }
        }, false);

        this.ctx.canvas.addEventListener("mouseup", function (e) {
            //console.log(getXandY(e));
            if (e.which == 1 && !that.newestEntity.moveable) {
                that.click = getXandY(e);
                that.newestEntity.moveable = true;
                var dx = (that.click.x - that.offset.x)/that.zoom  + that.camera.x -that.newestEntity.x;
                var dy = (that.click.y - that.offset.y)/that.zoom  + that.camera.y -that.newestEntity.y;
                that.newestEntity.velocity = new Vector(dx / 100, dy / 100);
            }
        }, false);
        this.ctx.canvas.addEventListener("mouseout", function (e) {
            //console.log(getXandY(e));
            that.out = true;
            if (!that.newestEntity.moveable) {
                that.newestEntity.moveable = true;
            }
        }, false);
        this.ctx.canvas.addEventListener("mouseenter", function (e) {
            //console.log(getXandY(e));
            that.out = false;
        }, false);

        this.ctx.canvas.addEventListener("wheel", function (e) {
            //that.wheel = e;
            //console.log((e.wheelDelta / Math.abs(e.wheelDelta)));
            if (!that.allowZoom && that.allowResize) {
                document.getElementById("radius").value -= document.getElementById("radius").step * (e.wheelDelta / Math.abs(e.wheelDelta))/that.zoom;
            }
            else if (that.allowZoom) {
                document.getElementById("zoom").value -= -1*document.getElementById("zoom").step * (e.wheelDelta / Math.abs(e.wheelDelta));
 
            }
            
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.zoom = document.getElementById("zoom").value;
        this.ctx.save()
        this.offset = { x: this.ctx.canvas.width / 2, y: this.ctx.canvas.height / 2 };
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.zoom, this.zoom);

        if (this.mouse != null && !this.out) {
            this.ctx.fillStyle = rgb(70, 88, 111);
            this.ctx.beginPath();
            this.ctx.arc((this.mouse.x - this.offset.x)/this.zoom, (this.mouse.y - this.offset.y)/this.zoom, this.drawingRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }   

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
        

        this.ctx.fillStyle = "Red"

        this.ctx.beginPath();
        this.ctx.arc(this.centerOfMass.x - this.camera.x, this.centerOfMass.y - this.camera.y, 2, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.strokeStyle = "Black";
     
        //DIAGONAL
        this.ctx.moveTo(0 - this.ctx.canvas.width / 64 - this.camera.x, 0 - this.ctx.canvas.height / 64 - this.camera.y);
        this.ctx.lineTo(this.ctx.canvas.width / 64 - this.camera.x, this.ctx.canvas.height / 64 - this.camera.y);
        this.ctx.moveTo(0 - this.ctx.canvas.width / 64 - this.camera.x, this.ctx.canvas.height / 64 - this.camera.y);
        this.ctx.lineTo(this.ctx.canvas.width / 64 - this.camera.x, 0 - this.ctx.canvas.height / 64 - this.camera.y);

        this.ctx.stroke();

        this.ctx.restore();
    };

    update() {
        
        let constv = 2 / this.zoom;
        if (this.W && !this.S) {
            this.velocity = { x: this.velocity.x, y: -constv };
        }
        else if (!this.W && this.S) {
            this.velocity = { x: this.velocity.x, y: constv };
        }
        else {
            this.velocity = { x: this.velocity.x, y: 0 };
        }

        if (this.A && !this.D) {
            this.velocity = { x: -constv, y: this.velocity.y };
        }
        else if (!this.A && this.D) {
            this.velocity = { x: constv, y: this.velocity.y };
        }
        else {
            this.velocity = { x: 0, y: this.velocity.y };
        }


        this.G = document.getElementById("gravity").value;
        this.drawingRadius = document.getElementById("radius").value;


        this.camera.x += this.velocity.x;
        this.camera.y += this.velocity.y;

        var entitiesCount = this.entities.length;

        let totalMass = 0;
        let mPos = { x: 0, y: 0 };

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (entity.moveable && !entity.removeFromWorld) {
                mPos.x += entity.mass * entity.x;
                mPos.y += entity.mass * entity.y;
                totalMass += entity.mass;
                entity.force.set(new Vector(0, 0));
                entity.update();
                
            }
 
        }

        this.centerOfMass = { x: mPos.x / totalMass, y: mPos.y / totalMass }

        for (var i = 0; i < entitiesCount; i++) {
            if (!this.entities[i].removeFromWorld) {
                this.entities[i].update();
            }
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
            }
        }

        if (this.queuedEntity != null) {
            this.queuedEntity.moveable = true;
            this.addEntity(this.queuedEntity);
            this.queuedEntity = null;
        }

        if (document.activeElement != document.getElementById("gameWorld")) {
            if (this.newestEntity) {
                this.newestEntity.moveable = true;
            }
            
        }

        document.getElementById("gravityLabel").innerHTML = "G (" + this.G + ")";

    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };
};