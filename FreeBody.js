class FreeBody {
    constructor(game, x, y, mass, density = 1) {
        Object.assign(this, { game, x, y, mass, density });

        this.movable = false;
        this.velocity = new Vector(0, 0);
        this.force = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.radius = Math.sqrt(this.mass / (this.density * Math.PI));
        this.momentum = this.velocity.clone();
        this.momentum.scale(this.mass);
        
    }

    collidesWith(other) {
        return this.distanceTo(other) <= this.radius + other.radius;
    }
    distanceTo(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    angleTo(other) {
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return dx > 0 ? Math.atan(dy/ dx) : Math.atan(dy / dx) + Math.PI;
    }
    combineWith(other) {
        this.removeFromWorld = true;
        other.removeFromWorld = true;

        let biggerBody = this.radius > other.radius ? this : other;
        let newBody = new FreeBody(this.game, biggerBody.x, biggerBody.y, this.mass + other.mass, (this.density + other.density) / 2);
        newBody.moveable = true;

        //New velocity calculation
        let newVelocity = this.momentum.clone()
        newVelocity.add(other.momentum);
        newVelocity.scale(1 / (this.mass + other.mass));

        newBody.velocity = newVelocity;
        this.game.addEntity(newBody);

    }


    update() {

        if (this.moveable) {

            this.radius = Math.sqrt(this.mass / (this.density * Math.PI));

            this.acceleration = new Vector(this.force.x / this.mass, this.force.y / this.mass);

            this.velocity.add(this.acceleration);

            this.momentum = this.velocity.clone();
            this.momentum.scale(this.mass);

            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }

        var that = this;
        this.game.entities.forEach(function (entity) {
            if (entity != that && that.moveable && entity instanceof FreeBody && entity.moveable) {
                if (that.collidesWith(entity)) {
                    that.combineWith(entity);
                }
                else {
                    let forceExerted = (that.game.G * that.mass * entity.mass) / Math.pow(that.distanceTo(entity), 2)
                    let angle = that.angleTo(entity);
                    that.force.add(new Vector(forceExerted * Math.cos(angle), forceExerted * Math.sin(angle)));
                }           
            }
        });
    
    }

    draw(ctx) {
        ctx.fillStyle = rgb(140, 177, 222);
       

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = "Red";
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 20 * this.velocity.x, this.y + 20 * this.velocity.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = rgb(57,255,20);
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 5000 * this.acceleration.x, this.y + 5000 * this.acceleration.y);
        ctx.stroke();

        if (!this.moveable && this.game.mouse != null) {
            ctx.beginPath();
            ctx.strokeStyle = "Blue";
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.game.mouse.x, this.game.mouse.y);
            ctx.stroke();
        }
        
    }
}