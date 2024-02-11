function DonutChart(x, y, diameter) {
    let labelSpace = 30;

    function get_radians(data) {
        let total = sum(data);
        let radians = [];
        for (let i = 0; i < data.length; i++) {
            radians.push((data[i] / total) * TWO_PI);
        }
        return radians;
    };

    this.draw = function (data, labels, colours, title) {
        // Test that data is not empty and that each input array is the
        // same length.
        if (data.length == 0) {
            alert('Data has length zero!');
        } else if (![labels, colours].every((array) => {
                return array.length == data.length;
            })) {
            alert(`Data (length: ${data.length})
                    Labels (length: ${labels.length})
                    Colours (length: ${colours.length})
                    Arrays must be the same length!`);
        }
        // https://p5js.org/examples/form-pie-chart.html
        let angles = get_radians(data);
        let lastAngle = 0;
        let colour;
        let angleSections = [0];
        for (let i = 0; i < data.length; i++) {
            if (colours) {
                colour = colours[i];
            } else {
                colour = map(i, 0, data.length, 0, 255);
            }
            fill(colour);
            push();
            stroke(255);
            strokeWeight(1);
            arc(x, y,
                diameter, diameter,
                lastAngle, lastAngle + angles[i] + 0.001); // Hack for 0!
            pop();
            stroke(0);
            if (labels) {
                makeLegendItem(labels[i], i, colour);
            }

            lastAngle += angles[i];
            angleSections.push(lastAngle);
        }
        //to make the inner circle in the donut chart
        push();
        fill(255, 255, 255);
        stroke(255);
        ellipse(x, y, diameter / 2.5);
        pop();
        //-------
        //check if mouse is over some section of donut chart
        let distance = dist(mouseX, mouseY, x, y);
        if (distance < diameter / 2 && distance > diameter / 5) {
            //to check if the mouse is over some section of the donut chart
            mouseOver(mouseX, mouseY, distance, angleSections, data, colours);
        }
        if (title) {
            noStroke();
            textAlign('center', 'center');
            textSize(24);
            text(title, x, y - diameter * 0.6);
        }
    };

    function mouseOver(mx, my, dist, angles, data, colours) {
        //if the mouse is over the donut show label and highlight section
        //example of atan2 found in https://p5js.org/examples/math-arctangent.html
        let cursorAngle = atan2(my - y, mx - x); //angle that the cursor is making with the center of the donut chart
        if (cursorAngle < 0) {
            cursorAngle = TWO_PI + cursorAngle;
        }
        for (let i = 0; i < angles.length - 1; i++) {
            if (cursorAngle >= angles[i] && cursorAngle < angles[i + 1]) {
                //Code to enlarge hovered section
                push();
                noFill();
                stroke(color(51, 255, 255));
                strokeWeight(3);
                arc(x, y,
                    diameter, diameter,
                    angles[i], angles[i + 1], PIE);
                //redraw the donut hole
                fill(255, 255, 255);
                stroke(255);
                strokeWeight(1);
                ellipse(x, y, diameter / 2.5);
                //add the inner arc in green
                noFill();
                stroke(color(51, 255, 255));
                strokeWeight(3);
                arc(x, y,
                    diameter / 2.5, diameter / 2.5,
                    angles[i], angles[i + 1]);
                pop();
                //--------
                //if the cursor angle is between any 2 consecutive values of the array "angles" then the cursor is inside the respective area between those angles in the donut chart, then draw its tooltip
                let percentage = (data[i] / sum(data)) * 100;
                let fixedlen = percentage.toFixed(2); //only show 2 decimals
                let labelText = fixedlen + "%";
                stroke(0);
                fill(255);
                rect(mx + 6, my - 20, textWidth(labelText) + 12, 25, 5, 5, 5, 5);
                noStroke();
                fill(0);
                text(labelText, mx + 12, my - 8);
            }
        }
    };

    function makeLegendItem(label, i, colour) {
        let xpos = x + 50 + diameter / 2;
        let ypos = y + (labelSpace * i) - diameter / 3;
        let boxWidth = labelSpace / 2;
        let boxHeight = labelSpace / 2;
        fill(colour);
        rect(xpos, ypos, boxWidth, boxHeight);
        fill('black');
        noStroke();
        textAlign('left', 'center');
        textSize(12);
        text(label, xpos + boxWidth + 10, ypos + boxWidth / 2);
    };
}
