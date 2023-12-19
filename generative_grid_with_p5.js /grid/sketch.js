var stepSize = 20;
var scaleCoor = 650;

function setup() {
    createCanvas(500, 500);
    noiseSeed(0); //to always start in the same positions
}
///////////////////////////////////////////////////////////////////////
function draw() {
    background(125);

    colorGrid();
    compassGrid();
}
///////////////////////////////////////////////////////////////////////
function colorGrid() {
    // your code here

    var currNoise;
    var currColor;
    for (var i = 0; i < 25; i++) {
        for (var k = 0; k < 25; k++) {
            var scale = map(mouseX, 0, width, 200, 600);
            currNoise = noise(i * stepSize / scaleCoor, k * stepSize / scaleCoor, frameCount / scale);
            currColor = lerpColor(color(255, 0, 0), color(0, 255, 0), currNoise);
            noStroke();
            fill(currColor);
            rect(i * stepSize, k * stepSize, stepSize, stepSize);
        }
    }
}
///////////////////////////////////////////////////////////////////////
function compassGrid() {
    // your code here
    var currNoise;
    var currColor;
    for (var i = 0; i < 25; i++) {
        for (var k = 0; k < 25; k++) {
            push();
            var xpos = stepSize / 2 + i * stepSize;
            var ypos = stepSize / 2 + k * stepSize;
            var scale = map(mouseX, 0, width, 200, 600);
            currNoise = noise(xpos / scaleCoor, ypos / scaleCoor, frameCount / scale);
            var angle = map(currNoise, 0, 1, 0, 720);
            translate(xpos, ypos);
            angleMode(DEGREES);
            rotate(angle);
            strokeWeight(3);
            stroke(0);
            line(0, 0, 0, stepSize);
            pop();
        }
    }

}
