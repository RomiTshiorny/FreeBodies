class Vector{
	constructor(x,y) {
		Object.assign(this, {x, y})

		this.magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.direction = this.x > 0 ? Math.atan(this.y / this.x) : Math.atan(this.y / this.x) + Math.PI;
	}


	update() {
		this.magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.direction = this.x > 0 ? Math.atan(this.y / this.x) : Math.atan(this.y / this.x) + Math.PI;
	}

	add(other) {
		this.x += other.x;
		this.y += other.y;
		this.update();
	}

	set(vector) {
		this.x = vector.x;
		this.y = vector.y;
		this.update();
	}

}