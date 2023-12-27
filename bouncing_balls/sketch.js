// When you click the mouse inside the given screen, ball objects
// are created, which fall to the "ground" due to gravity forces.
// Balls bounce in the floor until all their energy is spent


// Adapted from https://github.com/nature-of-code/

var balls;
////////////////////////////////////////////////////
function setup() {
    createCanvas(900, 600);
    balls = [];
    button = createButton('Clear Screen');
    button.position(width + 40, height + 70);
    button.mousePressed(buttonPressed);

}
////////////////////////////////////////////////////
function draw() {
    background(0);
    var gravity = createVector(0, 0.1);
    for (var i = 0; i < balls.length; i++) {
        var friction = balls[i].velocity.copy();
        friction.mult(-1);
        friction.normalize();
        friction.mult(0.01);
        balls[i].applyForce(friction);
        balls[i].applyForce(gravity);
        balls[i].run();
        balls[i].age = max(100, balls[i].age - 1);
    }
}

function mouseDragged() {
    balls.push(new Ball(mouseX, mouseY));
}

function buttonPressed() {
    balls = [];
}
//////////////////////////////////////////////////////
class Ball {

    constructor(x, y) {
        this.velocity = new createVector(random(-3, 3), random(-3, 3));
        this.location = new createVector(x, y);
        this.acceleration = new createVector(0, 0);
        this.size = random(15, 50);
        this.age = 255;
        this.r = random(0, 255);
        this.g = random(0, 255);
        this.b = random(0, 255);
    }

    run() {
        this.draw();
        this.move();
        this.bounce();
    }

    draw() {
        fill(this.r, this.g, this.b, this.age);
        noStroke();
        ellipse(this.location.x, this.location.y, this.size, this.size);
    }

    move() {
        this.velocity.add(this.acceleration);
        this.location.add(this.velocity);
        this.acceleration.mult(0);
    }

    bounce() {
        if (this.location.x > width - this.size / 2) {
            this.location.x = width - this.size / 2;
            this.velocity.x *= -1;
        } else if (this.location.x < this.size / 2) {
            this.velocity.x *= -1;
            this.location.x = this.size / 2;
        }
        if (this.location.y > height - this.size / 2) {
            this.velocity.y *= -1;
            this.location.y = height - this.size / 2;
        }
    }

    applyForce(force) {
        this.acceleration.add(force);
    }
}
