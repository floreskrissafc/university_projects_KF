var spaceship;
var asteroids;
var atmosphereLoc;
var atmosphereSize;
var earthLoc;
var earthSize;
var starLocs = [];
var debris = [];
var laserSound;
var explosionSound;
var gameOverSound;
var score;

function preload() {
    soundFormats('wav');
    //all sounds found for free at https://freesound.org/
    explosionSound = loadSound('sounds/explosion_sound.wav');
    laserSound = loadSound('sounds/laser_sound.wav');
    gameOverSound = loadSound('sounds/game_over_sound.wav');
}

//////////////////////////////////////////////////
function setup() {
    createCanvas(1200, 800);
    spaceship = new Spaceship();
    asteroids = new AsteroidSystem();
    score = 0;
    //location and size of earth and its atmosphere
    atmosphereLoc = new createVector(width / 2, height * 2.9);
    atmosphereSize = new createVector(width * 3, width * 3);
    earthLoc = new createVector(width / 2, height * 3.1);
    earthSize = new createVector(width * 3, width * 3);
}

//////////////////////////////////////////////////
function draw() {
    background(0);
    sky();
    spaceship.run();
    asteroids.run();
    drawEarth();
    drawScore();
    checkCollisions(spaceship, asteroids); // function that checks collision between various elements
    updateDebris();

}

//////////////////////////////////////////////////
//draws earth and atmosphere
function drawEarth() {
    noStroke();
    //draw atmosphere
    fill(0, 0, 255, 50);
    ellipse(atmosphereLoc.x, atmosphereLoc.y, atmosphereSize.x, atmosphereSize.y);
    //draw earth
    fill(100, 255);
    ellipse(earthLoc.x, earthLoc.y, earthSize.x, earthSize.y);
}

//////////////////////////////////////////////////
//checks collisions between all types of bodies
function checkCollisions(spaceship, asteroids) {

    //spaceship-2-asteroid collisions
    for (var i = 0; i < asteroids.locations.length; i++) {
        if (isInside(spaceship.location, spaceship.size, asteroids.locations[i], asteroids.diams[i])) {
            gameOver();
        }
    }
    //asteroid-2-earth collisions
    for (var i = 0; i < asteroids.locations.length; i++) {
        if (isInside(earthLoc, earthSize.x, asteroids.locations[i], asteroids.diams[i])) {
            gameOver();
        }
    }

    //spaceship-2-earth
    //YOUR CODE HERE (1-2 lines approx)
    if (isInside(spaceship.location, spaceship.size, earthLoc, earthSize.x)) {
        gameOver();
    }

    //spaceship-2-atmosphere
    if (isInside(atmosphereLoc, atmosphereSize.x, spaceship.location, spaceship.size)) {
        spaceship.setNearEarth();
    }

    //bullet collisions
    //YOUR CODE HERE (3-4 lines approx)
    for (var i = 0; i < spaceship.bulletSys.bullets.length; i++) {
        //more lines were needed to include sound and explosion 
        for (var j = 0; j < asteroids.locations.length; j++) {
            var currBullet = spaceship.bulletSys.bullets[i];
            var currAste = asteroids.locations[j];
            if (isInside(currBullet, spaceship.bulletSys.diam, currAste, asteroids.diams[j])) {
                explosionSound.setVolume(0.4);
                explosionSound.play();
                var currLocation = asteroids.locations[j];
                createDebris(currLocation.x, currLocation.y);
                asteroids.destroy(j);
                score++;
            }
        }
    }
}
//////////////////////////////////////////////////////
//creates debris elements whjen an asteroid is hit
function createDebris(xpos, ypos) {
    //create 150 debris elements
    for (var i = 0; i < 150; i++) {
        debris.push(new Debris(xpos, ypos));
    }
}
/////////////////////////////////////////////////////
//Draw and remove debris elements
function updateDebris() {
    //to update and draw debris
    for (var i = 0; i < debris.length; i++) {
        var currDebris = debris[i];
        currDebris.update();
        currDebris.draw();
        //to remove debris
        if (currDebris.diam < currDebris.minDiam) {
            debris.splice(i, 1);
            i--;
        }
    }
}
//////////////////////////////////////////////////
//helper function checking if there's collision between object A and object B
function isInside(locA, sizeA, locB, sizeB) {
    // YOUR CODE HERE (3-5 lines approx)
    if (dist(locA.x, locA.y, locB.x, locB.y) <= ((sizeA + sizeB) / 2)) {
        return true;
    }
    return false;
}

//////////////////////////////////////////////////
function keyPressed() {
    if (keyIsPressed && keyCode === 32) { // if spacebar is pressed, fire!
        laserSound.setVolume(0.4);
        laserSound.play();
        spaceship.fire();
    }
}

//////////////////////////////////////////////////
// function that ends the game by stopping the loops and displaying "Game Over"
function gameOver() {
    fill(255);
    textSize(80);
    textAlign(CENTER);
    text("GAME OVER", width / 2, height / 2);
    gameOverSound.setVolume(0.4);
    gameOverSound.play();
    noLoop();
}

//////////////////////////////////////////////////
function drawScore() {
    //draw squares for keeping scores, only counts up to 999
    var size = 50;
    var counter = score;
    var textPosX = (width + size) / 2 + 23;
    var textPosy = height - size / 2 + 3;
    push();
    fill(255);
    rect((width - size) / 2, height - size - 10, size, size);
    rect((width + size) / 2 + 10, height - size - 10, size, size);
    rect((width - size) / 2 - 10 - size, height - size - 10, size, size);
    textSize(40);
    fill(0);
    for (var i = 0; i < 3; i++) {
        var num = counter % 10;
        text(num, textPosX, textPosy);
        counter = Math.floor(counter / 10);
        textPosX -= (10 + size);
    }
    pop();

}

//////////////////////////////////////////////////
// function that creates a star lit sky
function sky() {
    push();
    while (starLocs.length < 300) {
        starLocs.push(new createVector(random(width), random(height)));
    }
    fill(255);
    for (var i = 0; i < starLocs.length; i++) {
        rect(starLocs[i].x, starLocs[i].y, 2, 2);
    }

    if (random(1) < 0.3) starLocs.splice(int(random(starLocs.length)), 1);
    pop();
}
