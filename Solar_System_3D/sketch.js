function setup() {
    createCanvas(900, 600, WEBGL);
    angleMode(DEGREES);

}

function draw() {
    background(100);
    noStroke();
    camera(0, -600, 700, 0, 0, 0, 0, 1, 0);

    fill(255);
    sphere(100, 24, 24);
    pointLight(color(255, 255, 255), 0, 0, 0);
    pointLight(color(255, 255, 255), 0, 0, 0);
    rotateY(-frameCount / 2);
    push();
    ambientMaterial(color(255, 255, 255));
    translate(300, 0, 0);
    rotateY(frameCount);
    sphere(50, 24, 24);
    pop();
}
