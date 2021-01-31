class FreeBody {
    constructor(game, x, y, radius, mass = 10, density = 1) {
        Object.assign(this, { game, x, y, radius, mass, density });

        this.velocity = new Vector(0, 0);
        this.force = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.movable = false;

        this.mass = radius * density
        
    }


    update() {

        if (this.moveable) {

            this.radius = this.mass / this.density;

            this.acceleration = new Vector(this.force.x / this.mass, this.force.y / this.mass);

            this.velocity.add(this.acceleration);

            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }

        this.force.update();
    
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