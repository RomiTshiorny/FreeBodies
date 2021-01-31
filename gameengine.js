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
        (function gameLoop() {
            that.loop();
            requestAnimFrame(gameLoop, that.ctx.canvas);
        })();

    };

    startInput() {
        var that = this;

        var getXandY = function (e) {
            var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
            var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

            return { x: x, y: y };
        }

        this.ctx.canvas.addEventListener("mousemove", function (e) {
            that.mouse = getXandY(e);
        }, false);

        this.ctx.canvas.addEventListener("mousedown", function (e) {
            //console.log(getXandY(e));

            //Left Click
            if (e.which == 1) {
                that.click = getXandY(e);
                that.newestEntity = new FreeBody(that, that.click.x, that.click.y, that.drawingRadius);
                that.addEntity(that.newestEntity);
            }
        }, false);

        this.ctx.canvas.addEventListener("mouseup", function (e) {
            //console.log(getXandY(e));
            if (e.which == 1) {
                that.click = getXandY(e);
                that.newestEntity.moveable = true;
                var dx = that.click.x - that.newestEntity.x;
                var dy = that.click.y - that.newestEntity.y;
                that.newestEntity.velocity = new Vector(dx / 100, dy / 100);
            }
        }, false);

        this.ctx.canvas.addEventListener("wheel", function (e) {
            //that.wheel = e;
            //console.log((e.wheelDelta / Math.abs(e.wheelDelta)));
            if (that.drawingRadius >= 5) {
                that.drawingRadius = that.drawingRadius - (e.wheelDelta / Math.abs(e.wheelDelta));
            }
            else {
                that.drawingRadius = 5
            }
            e.preventDefault();
        }, false);
    };

    addEntity(entity) {
        this.entities.push(entity);
    };

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        if (this.mouse != null) {
            this.ctx.fillStyle = rgb(70, 88, 111);
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, this.drawingRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }

        this.ctx.fillStyle = "Red"

        this.ctx.beginPath();
        this.ctx.arc(this.centerOfMass.x, this.centerOfMass.y, 2, 0, 2 * Math.PI);
        this.ctx.fill();
    };

    update() {

        const G = 6.67
        var entitiesCount = this.entities.length;

        let totalMass = 0;
        let mPos = { x: 0, y: 0 };

        for (var i = 0; i < entitiesCount; i++) {
            var entity = this.entities[i];

            if (entity.moveable && !entity.removeFromWorld) {
                mPos.x += entity.mass * entity.x;
                mPos.y += entity.mass * entity.y;
                totalMass += entity.mass;
                entity.update();
                entity.force.set(new Vector(0, 0));
            }
 
        }

        this.centerOfMass = { x: mPos.x / totalMass, y: mPos.y / totalMass }

        for (var i = 0; i < entitiesCount; i++) {
            var entity_i = this.entities[i];

            for (var j = 0; j < entitiesCount; j++) {
                if (j != i) {
                    var entity_j = this.entities[j]

                    var dx = (entity_j.x - entity_i.x)
                    var dy = (entity_j.y - entity_i.y)
                    var d = Math.sqrt(dx * dx + dy * dy);

                    if (entity_j.moveable) {


                       

                        var magnitude = G * entity_i.mass * entity_j.mass / (d * d);
                        var angle = dx > 0 ? Math.atan(dy / dx) : Math.atan(dy / dx) + Math.PI;



                        entity_i.force.add(new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle)));
                    }

                    if (Math.abs(dx) <= Math.abs(entity_i.radius + entity_j.radius) && Math.abs(dy) <= Math.abs(entity_i.radius + entity_j.radius)) {
                        //console.log((entity_i.x - entity_j.x) / 2, (entity_i.y - entity_j.y) / 2);
                        entity_i.removeFromWorld = true;
                        entity_j.removeFromWorld = true;

                        let newX = (entity_i.x + entity_j.x) / 2;
                        let newY = (entity_i.y + entity_j.y) / 2;
                        let newR = entity_i.radius + entity_j.radius
                        let newM = entity_i.mass + entity_j.mass;
                        entity_i.velocity.add(entity_j.velocity)
                        let newV = entity_i.velocity;

                        let newBody = new FreeBody(this, newX, newY, newR, newM);
                        console.log(entity_i.velocity);
                        console.log(entity_j.velocity)
                        newBody.velocity = newV;

                        this.queuedEntity = newBody;

                    }
                }  
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

        

    };

    loop() {
        this.clockTick = this.timer.tick();
        this.update();
        this.draw();
    };
};