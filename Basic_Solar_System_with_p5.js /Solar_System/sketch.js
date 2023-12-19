var speed;

function setup() {
    createCanvas(900, 700);
}

function draw() {
    background(0);
    speed = frameCount;

    push();
        translate(width / 2, height / 2);
        push();
            rotate(radians(speed / 3)); //Sun rotating around its axis
            celestialObj(color(255, 150, 0), 200); // SUN
        pop();

        push()
            rotate(radians(speed)); //Earth rotating around Sun
            translate(300, 0);
    
            push();
                rotate(radians(speed)); //Earth rotating around its axis
                celestialObj(color(0, 0, 255), 80); // EARTH
            pop();
    
            push();
                rotate(radians(-speed * 2)); //Moon rotating around Earth
                translate(100, 0);
                celestialObj(color(255), 30);
            pop();
    
        pop();

    pop();
}

function celestialObj(c, size) {
    strokeWeight(5);
    fill(c);
    stroke(0);
    ellipse(0, 0, size, size);
    line(0, 0, size / 2, 0);
}
