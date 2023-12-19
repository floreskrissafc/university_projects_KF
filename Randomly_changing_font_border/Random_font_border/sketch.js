var font;

function preload() {
    font = loadFont('assets/Calistoga-Regular.ttf');
}

var points;

function setup() {
    createCanvas(900, 400);
    fill(255, 104, 204, 150);
    noStroke();

    points = font.textToPoints('c o d e', 50, 300, 300, {
        sampleFactor: .3,
        simplifyThreshold: 0
    });
}

function draw() {

    background(0);
    fill(255, 20, 147);
    for (var i = 0; i < points.length; i++) {
        var currPoint = points[i];
        ellipse(currPoint.x + random(-mouseX / 10, mouseX / 10), currPoint.y + random(-mouseX / 10, mouseX / 10), 10, 10);
    }
    noLoop();
}

function mouseMoved() {
    loop();
}
