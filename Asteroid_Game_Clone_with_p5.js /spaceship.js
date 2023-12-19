class Spaceship {

    constructor() {
        this.velocity = new createVector(0, 0);
        this.location = new createVector(width / 2, height / 2);
        this.acceleration = new createVector(0, 0);
        this.maxVelocity = 5;
        this.bulletSys = new BulletSystem();
        this.size = 50;
        this.thrust_objects = [];
    }

    run() {
        this.bulletSys.run();
        this.move();
        this.edges();
        this.draw();
        this.interaction();
        this.update_thrust();
    }

    draw() {
        fill(109, 102, 243);
        triangle(this.location.x - this.size / 2, this.location.y + this.size / 2,
            this.location.x + this.size / 2, this.location.y + this.size / 2,
            this.location.x, this.location.y - this.size / 2);
    }

    move() {
        // YOUR CODE HERE (4 lines)
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxVelocity);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
    }

    applyForce(f) {
        this.acceleration.add(f);
    }

    interaction() {
        if (keyIsDown(LEFT_ARROW)) {
            this.applyForce(createVector(-0.1, 0));
            //extra code to draw thrusters
            this.thrust_fire(this.location.x + this.size / 4, this.location.y);

        }
        if (keyIsDown(RIGHT_ARROW)) {
            // YOUR CODE HERE (1 line)
            this.applyForce(createVector(0.1, 0));
            //extra code to draw thrusters
            this.thrust_fire(this.location.x - this.size / 4, this.location.y);

        }
        if (keyIsDown(UP_ARROW)) {
            // YOUR CODE HERE (1 line)
            this.applyForce(createVector(0, -0.1));
            //extra code to draw thrusters
            this.thrust_fire(this.location.x, this.location.y + this.size / 2);
        }

        if (keyIsDown(DOWN_ARROW)) {
            // YOUR CODE HERE (1 line)
            this.applyForce(createVector(0, 0.1));
            //extra code to draw thrusters
            this.thrust_fire(this.location.x - this.size / 4, this.location.y);
            this.thrust_fire(this.location.x + this.size / 4, this.location.y);
        }
    }

    fire() {
        this.bulletSys.fire(this.location.x, this.location.y);
    }

    edges() {
        if (this.location.x < 0) this.location.x = width;
        else if (this.location.x > width) this.location.x = 0;
        else if (this.location.y < 0) this.location.y = height;
        else if (this.location.y > height) this.location.y = 0;
    }

    thrust_fire(xpos, ypos) {
        let thrust_object = {
            diameter: 10,
            coloring: color(255, 255, 102),
            x: xpos,
            y: ypos
        }
        this.thrust_objects.push(thrust_object);
    }

    drawThrusters() {
        //each time the user presses a key to move the ship
        //a thruster is drawn
        for (var i = 0; i < this.thrust_objects.length; i++) {
            var currObj = this.thrust_objects[i];
            fill(currObj.coloring);
            ellipse(currObj.x, currObj.y, currObj.diameter, currObj.diameter);
        }
    }

    update_thrust() {
        var len = this.thrust_objects.length;
        var maxDia = 25;
        var i = 0;
        while (i < len) {
            var currObj = this.thrust_objects[i];
            if (currObj.diameter < maxDia) {
                currObj.diameter++;
                var alpha = Math.floor(map(currObj.diameter, 10, maxDia, 200, 10));
                var green = Math.floor(map(currObj.diameter, 10, maxDia, 200, 50));
                currObj.coloring = color(255, green, 0, alpha);
                i++;
            } else {
                this.thrust_objects.splice(i, 1);
                len--;
            }
        }
        this.drawThrusters();
    }





    //    When the spaceship enters the earth's atmosphere it's affected by the earth's gravity. Create a "downwards-pointing" vector of strength 0.05 which pulls the spaceship towards the earth. The atmosphere also introduces friction and the spaceship can't move forever like in empty space. It will decelerate unless it fires its engines. Create a force called friction that's 30 times smaller than the velocity of the spaceship, points the opposite direction to velocity and is then applied in the the opposite direction.

    setNearEarth() {
        //YOUR CODE HERE (6 lines approx)
        var earth_grav = new createVector(0, 0.05);
        var atmosphere_fr = this.velocity.copy();
        atmosphere_fr.div(30).mult(-1);
        this.applyForce(atmosphere_fr);
        this.applyForce(earth_grav);
    }
}
