var points;
var font;
//var amt = 20;

function preload() {
    font = loadFont('assets/Calistoga-Regular.ttf');
}

//////////////////////////////////////////////////////////////////////
function setup() {
    createCanvas(900, 400);
    background(0);

    points = font.textToPoints('c o d e', 50, 300, 300, {
        sampleFactor: .3,
        simplifyThreshold: 0
    });
}

//////////////////////////////////////////////////////////////////////
function draw() {

    fill(0, map(mouseY, 0, height, 20, 5)); //change trail with mouseY position
    rect(0, 0, width, height);

    // **** Your code here ****
    noStroke();

    for (var i = 0; i < points.length; i++) {

        var curr = points[i];

        var scale = 100;

        var amt = map(mouseX, 0, width / 2, 0, 80);

        var nX = noise(frameCount / scale + curr.x + curr.y); //scaling of frameCount

        nX = map(nX, 0, 1, -amt, amt);

        var nY = noise(frameCount / scale + curr.x + curr.y + 100);

        nY = map(nY, 0, 1, -amt, amt);

        fill(map(curr.x + nX, 0, width, 200, 255), map(curr.x + nX, 0, width, 5, 200), 147); //variable color

        var size = map(mouseY, 0, height, 5, 8); //variable size of particles

        ellipse(curr.x + nX, curr.y + nY, size, size);
    }
}
