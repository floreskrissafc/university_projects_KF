class Debris {
    //when an asteroid is destroyed, these particles are created
    constructor(x, y) {
        this.location = new createVector(x, y);
        this.velocity = new createVector(random(-5, 5), random(-5, 5));
        this.acceleration = new createVector(random(-1, 1), random(-1, 1));
        this.diam = 10;
        this.color = color(255, 255, 0);
        this.minDiam = 1;
    }

    update() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.diam -= 1;
        var greenRGB = Math.floor(map(this.diam, 10, this.minDiam, 255, 50)); //Map the green color with respect to the diameter of the debris and 
        this.color = color(255, greenRGB, 0);
    }

    draw() {
        push();
        fill(this.color);
        ellipse(this.location.x, this.location.y, this.diam, this.diam);
        pop();
    }
}
