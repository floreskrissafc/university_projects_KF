class AsteroidSystem {

    //creates arrays to store each asteroid's data
    constructor() {
        this.locations = [];
        this.velocities = [];
        this.accelerations = [];
        this.diams = [];
    }

    run() {
        this.spawn();
        this.move();
        this.draw();
    }

    // spawns asteroid at random intervals
    spawn() {
        if (random(1) < 0.01) {
            this.accelerations.push(new createVector(0, random(0.1, 1)));
            this.velocities.push(new createVector(0, 0));
            this.locations.push(new createVector(random(width), 0));
            this.diams.push(random(30, 50));
        }
    }

    //moves all asteroids
    move() {
        for (var i = 0; i < this.locations.length; i++) {
            this.velocities[i].add(this.accelerations[i]);
            this.locations[i].add(this.velocities[i]);
            this.accelerations[i].mult(0);
        }
    }

    applyForce(f) {
        for (var i = 0; i < this.locations.length; i++) {
            this.accelerations[i].add(f);
        }
    }

    //draws all asteroids
    draw() {
        //        noStroke();
        fill(200);
        for (var i = 0; i < this.locations.length; i++) {
            //            ellipse(this.locations[i].x, this.locations[i].y, this.diams[i], this.diams[i]);
            push();
            stroke(150);
            translate(this.locations[i].x, this.locations[i].y);
            rectMode(CENTER);
            var radius = this.diams[i] / 2;
            for (var j = 0; j < 8; j++) {
                rect(0, radius, radius / 2, radius / 5, radius / 10);
                rotate(PI / 4.0);
            }
            pop();
            noStroke();
            ellipse(this.locations[i].x, this.locations[i].y, this.diams[i], this.diams[i]);
            push();
            translate(this.locations[i].x, this.locations[i].y);
            fill(150);
            ellipse(0, 0, this.diams[i] / 4, this.diams[i] / 3);
            ellipse(-radius / 2, -radius / 2, radius / 5, radius / 4);
            ellipse(-radius / 2, radius / 2, radius / 3, radius / 4);
            ellipse(radius / 2, radius / 2, radius / 3, radius / 2);
            ellipse(radius / 2, -radius / 2, radius / 2, radius / 3);

            pop();

        }

    }

    //function that calculates effect of gravity on each asteroid and accelerates it
    calcGravity(centerOfMass) {
        for (var i = 0; i < this.locations.length; i++) {
            var gravity = p5.Vector.sub(centerOfMass, this.locations[i]);
            gravity.normalize();
            gravity.mult(.001);
            this.applyForce(gravity);
        }
    }

    //destroys all data associated with each asteroid
    destroy(index) {
        this.locations.splice(index, 1);
        this.velocities.splice(index, 1);
        this.accelerations.splice(index, 1);
        this.diams.splice(index, 1);
    }
}
