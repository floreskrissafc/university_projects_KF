////////////////////////////////////////////////////////////////
function setupGround() {
    ground = Bodies.rectangle(500, 600, 1000, 40, {
        isStatic: true,
        angle: 0
    });
    World.add(engine.world, [ground]);
}

////////////////////////////////////////////////////////////////
function drawGround() {
    push();
    fill(128);
    drawVertices(ground.vertices);
    pop();
}
//////////////////////////////////////////////////////////////// OJO AQUI HACE USO DE ANGLE, PERO ESTA DEFINIDO EN OTRO LADO
function setupPropeller() {
    // your code here
    propeller = Bodies.rectangle(150, 480, 200, 15, {
        isStatic: true,
        angle: angle
    });
    World.add(engine.world, [propeller]);
}
////////////////////////////////////////////////////////////////
//updates and draws the propeller
function drawPropeller() {
    push();
    // your code here
    Body.setAngle(propeller, angle);
    Body.setAngularVelocity(propeller, angleSpeed);
    angle += angleSpeed;
    drawVertices(propeller.vertices);
    pop();
}
////////////////////////////////////////////////////////////////
function setupBird() {
    var bird = Bodies.circle(mouseX, mouseY, 20, {
        friction: 0,
        restitution: 0.95
    });
    Matter.Body.setMass(bird, bird.mass * 10);
    World.add(engine.world, [bird]);
    birds.push(bird);
}
////////////////////////////////////////////////////////////////
function drawBirds() {
    push();
    //your code here
    var i = 0;
    while (i < birds.length) {
        var currBird = birds[i]
        if (isOffScreen(currBird)) {
            removeFromWorld(currBird);
            birds.splice(i, 1);
        } else {
            drawBird(color(255, 215, 0), 20, currBird);
            i++
        }
    }
    pop();
}
////////////////////////////////////////////////////////////////
//creates a tower of boxes
function setupTower() {
    //you code here
    var boxSize = 80;
    var xinit = 700;
    var yinit = 540.5145627529159;
    var j = 0;
    var k = 0;
    for (var i = 0; i < 18; i++) {
        if (i != 0 && i % 3 == 0) {
            j++;
            k = 0;
        }
        var box = Bodies.rectangle(xinit + k * 80, yinit - j * 80, boxSize, boxSize);
        boxes.push(box);
        colors.push(color(0, random(50, 256), 0));
        World.add(engine.world, [box]);
        k++;

    }
}
////////////////////////////////////////////////////////////////
//draws tower of boxes
function drawTower() {
    push();
    //your code here
    var i = 0;
    while (i < boxes.length) {
        var currbox = boxes[i]
        if (isOffScreen(currbox)) {
            removeFromWorld(currbox); //remove body from world
            boxes.splice(i, 1); //remove box from array
            colors.splice(i, 1); //remove color from color array, important!
        } else {
            noStroke();
            fill(colors[i]);
            drawVertices(boxes[i].vertices);
            i++
        }
    }
    pop();
}
////////////////////////////////////////////////////////////////
function setupSlingshot() {
    //your code here
    //The assignment did not specify the diameter of the birds
    slingshotBird = Bodies.circle(200, 200, 20, {
        restitution: 0.95,
        friction: 0
    });
    Matter.Body.setMass(slingshotBird, slingshotBird.mass * 10);


    World.add(engine.world, [slingshotBird]);
    slingshotConstraint = Constraint.create({
        pointA: {
            x: 200,
            y: 170
        },
        bodyB: slingshotBird,
        pointB: {
            x: 0,
            y: 0
        },
        stiffness: 0.01,
        damping: 0.0001
    });

    World.add(engine.world, [slingshotConstraint]);

}
////////////////////////////////////////////////////////////////
//draws slingshot bird and its constraint
function drawSlingshot() {
    var size = 20;
    push();
    drawBird(color(255, 182, 193), size, slingshotBird);
    drawConstraint(slingshotConstraint);
    pop();
}

function drawBird(color, radius, bird) {
    var angle = bird.angle;
    var pos = bird.position;
    noStroke();
    fill(color);
    drawVertices(bird.vertices);
    push();
    translate(pos.x, pos.y); //center of bird
    rotate(angle);
    fill(255);
    ellipse(radius / 3, 0, radius / 1.6, radius / 1.2); //eye
    ellipse(-radius / 3, 0, radius / 1.6, radius / 1.2);
    fill(0, 191, 255);
    ellipse(radius / 4, radius / 7, radius / 2.2, radius / 1.8); //iris
    ellipse(-radius / 4, radius / 7, radius / 2.2, radius / 1.8); //iris
    fill(0);
    ellipse(radius / 4, radius / 7, radius / 3.2, radius / 2.8) //pupil
    ellipse(-radius / 4, radius / 7, radius / 3.2, radius / 2.8) //pupil
    fill(255);
    ellipse(radius / 4.2, radius / 7, radius / 9, radius / 8) //pupil-white
    ellipse(-radius / 4.2, radius / 7, radius / 9, radius / 8) //pupil-white
    strokeWeight(4);
    stroke(0);
    line(radius / 7, -radius / 2.5, radius / 2.6, -radius / 2); //brow
    line(-radius / 7, -radius / 2.5, -radius / 2.6, -radius / 2); //brow
    //hair
    stroke(color);
    line(0, -radius, 0, -radius * 1.3);
    line(0, -radius, radius / 4, -radius * 1.1);
    line(0, -radius, -radius / 4, -radius * 1.1);
    strokeWeight(1);
    //beak
    stroke(255, 140, 00); //dark orange
    fill(255, 165, 0); //orange
    triangle(0, radius / 3, radius / 3.2, 2 * radius / 3, -radius / 3.2, 2 * radius / 3);
    arc(0, 2 * radius / 3, radius / 3, radius / 3, 0, PI, CHORD);
    pop();
}
/////////////////////////////////////////////////////////////////
function setupMouseInteraction() {
    var mouse = Mouse.create(canvas.elt);
    var mouseParams = {
        mouse: mouse,
        constraint: {
            stiffness: 0.05
        }
    }
    mouseConstraint = MouseConstraint.create(engine, mouseParams);
    mouseConstraint.mouse.pixelRatio = pixelDensity();
    World.add(engine.world, mouseConstraint);
}

/////////////////////////////////////////////////////////////////
function drawTimer() {
    //timer code based on https://editor.p5js.org/marynotari/sketches/S1T2ZTMp-
    push();
    textSize(20);
    fill(255);
    text(timer, 50, 50);

    if (frameCount % 60 == 0 && timer > 0) { // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
        timer--;
        if (boxes.length == 0) {
            endGame("YOU WON!");
        }
    } else if (timer == 0) {
        endGame("GAME OVER");
    }
    pop();
}

/////////////////////////////////////////////////////////////////
function endGame(endingText) {
    fill(255);
    textSize(50);
    strokeWeight(2);
    var textW = textWidth(endingText);
    text(endingText, (width - textW) / 2, height / 2);
    noLoop();
}
