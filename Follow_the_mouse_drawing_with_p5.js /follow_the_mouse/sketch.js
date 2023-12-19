
// Adapted from https://github.com/nature-of-code/

var balls;
///////////////////////////////////////////////
function setup() {
    createCanvas(900, 600);
    balls = [];
    for (var i = 0; i < 100; i++) {
        balls.push(new Ball());
    }
    background(0);
}
////////////////////////////////////////////////
function draw() {
    for (var i = 0; i < 100; i++) {
        balls[i].run();
    }
}
///////////////////////////////////////////////
class Ball {

    constructor() {
        this.velocity = new createVector(0, 0);
        this.acceleration = new createVector(0, 0);
        this.maxVelocity = 5;
        var randomX = width / 2 + random(-100, 100);
        var randomY = height / 2 + random(-100, 100);
        this.prevLocation = new createVector(randomX, randomY);
        this.location = new createVector(randomX, randomY);
    }

    run() {
        this.draw();
        this.move();
//        this.edges(); // this line makes the line to return to the visible screen
    }

    draw() {
        //    fill(125);
        //    ellipse(this.location.x, this.location.y, 40, 40);
        stroke(255, 255, 255);
        line(this.prevLocation.x, this.prevLocation.y, this.location.x, this.location.y);
        this.prevLocation = this.location.copy();
    }

    move() {
        var mouse = createVector(mouseX, mouseY);
        var dir = p5.Vector.sub(mouse, this.location);
        dir.normalize();
        dir.mult(0.3);
        this.acceleration = dir;
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxVelocity);
        this.location.add(this.velocity);
    }

//      edges(){
         // Use this code if you want the lines to stop abruptly
//        if (this.location.x<0) this.location.x=width;
//        else if (this.location.x>width) this.location.x = 0;
//        else if (this.location.y<0) this.location.y = height;
//        else if (this.location.y>height) this.location.y = 0;
//      }
}
