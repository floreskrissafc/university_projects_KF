/**
 * @param   {Array}       valuesX   Array of numbers, representing birth rate of each country
 * @param   {Array}       valuesY   Array of numbers, representing mortality rate of each country
 * @param   {Array}       valuesDia Array of numbers, representing the GDP-PPP of each country
 * @param   {Array}       labels    Array of strings, representing the names of each axis in the graph
 * @param   {number}      ticksX    Maximum number of sections in which the X-axis must be divided
 * @param   {number}      ticksY    Maximum number of sections in which the X-axis must be divided
 * @param   {number}      minDia    Minimum diameter of the bubbles
 * @param   {number}      maxDia    Maximum diameter of the bubbles
 * @param   {Array}       colorsList    Array of p5 color objects
 * @param   {Array}       countries Array of strins, representing the names of each country shown in the graph
 * @param   {object}      sound     p5 sound object
 * @returns {BubbleChart object} 
 */
function BubbleChart(valuesX, valuesY, valuesDia, labels, ticksX, ticksY, minDia, maxDia, colorsList, countries, sound) {
    let previous = -1; //index of previously selected bubble in chart
    let layout = {
        padAxis: 50,
        padLabel: 10,
        padTop: 50,
        padTickX: 30,
        padTickY: 40,
        labelSize: 12,
        plotWidth: function () {
            return width - this.padAxis;
        },
        plotHeight: function () {
            return height - this.padTop - this.padAxis;
        },
        labelSize: 12,
        halfGraphX: function () {
            //X coordinate of the middle point
            //in the X-axis
            return this.padAxis + this.plotWidth() / 2;
        },
        halfGraphY: function () {
            //Y coordinate of the middle point
            //in the Y-axis
            return this.padTop + this.plotHeight() / 2;
        },
    };

    this.draw = function () {
        drawAxes();
        drawAxisNames();
        let maxValueX = max(valuesX);
        let maxValueY = max(valuesY);
        maxValueX = ceil(maxValueX + (5 * maxValueX / 100)); //add an extra 5% and make it integer
        maxValueY = ceil(maxValueY + (5 * maxValueY / 100)); //add an extra 5% and make it integer
        let minValueX = drawGrid(maxValueX, maxValueY);
        drawBubbles(minValueX, maxValueX, maxValueY, min(valuesDia), max(valuesDia));
        mouseOver(mouseX, mouseY, minValueX, maxValueX, maxValueY, min(valuesDia), max(valuesDia));


    };
    /**
     * Draw a bubble representing each of the countries in the selected zone. Diameter of bubbles in accordance with their respective GDP-PPP values
     * 
     * @param {number} minValX   Minimum birth rate
     * @param {number}   maxValX   Maximum birth rate
     * @param {number}   maxValY   Maximum mortality rate
     * @param {number}   minDiaVal Minimum GDP-PPP value
     * @param {number}   maxDiaVal Maximum GDP-PPP value
     */
    function drawBubbles(minValX, maxValX, maxValY, minDiaVal, maxDiaVal) {
        push();
        noStroke();
        for (let i = 0; i < valuesX.length; i++) {
            fill(colorsList[i]);

            let xpos = map(valuesX[i], minValX, maxValX,
                layout.padAxis, width)
            let ypos = map(valuesY[i], 0,
                maxValY, height - layout.padAxis, layout.padTop);
            let diameter = map(valuesDia[i], minDiaVal,
                maxDiaVal, minDia, maxDia);
            ellipse(xpos, ypos, diameter);
        }
        pop();
    };
    /**
     * function to highlight hovered bubble and show a descriptive tooltip showing information about the country
     * 
     * @param {number} mx        Mouse X position
     * @param {number} my        Mouse Y position
     * @param {number} minValX   Minimum birth rate
     * @param {number} maxValX   Maximum birth rate
     * @param {number} maxValY   Maximum mortality rate
     * @param {number} minDiaVal Minimum GDP-PPP value
     * @param {number} maxDiaVal Maximum GDP-PPP value
     */
    function mouseOver(mx, my, minValX, maxValX, maxValY, minDiaVal, maxDiaVal) {
        let selected = -1; //index of the bubble that is being hovered,if no
        //bubble is being hovered then selected is -1.
        for (let i = valuesX.length - 1; i >= 0; i--) {
            let xpos = map(valuesX[i], minValX, maxValX,
                layout.padAxis, width)
            let ypos = map(valuesY[i], 0,
                maxValY, height - layout.padAxis, layout.padTop);
            let diameter = map(valuesDia[i], minDiaVal,
                maxDiaVal, minDia, maxDia);
            if (dist(mx, my, xpos, ypos) < diameter / 2) {
                let cornerRadius = 5;
                let country = countries[i];
                let GDP = Number(valuesDia[i]).toFixed(2);
                let birthRate = Number(valuesX[i]).toFixed(2);
                let mortality = Number(valuesY[i]).toFixed(2);
                let labelText = "Country: " + country + "\nBirth-rate: " +
                    birthRate + "\nMortality-rate: " + mortality +
                    "\nGDP-PPP: " + GDP;
                let rectWidth = max(textWidth("Country: " + country), textWidth("GDP-PPP: " + GDP)) * 1.1;
                let toolTipX = mx + 13;
                let toolTipY = my - 70;
                if (mx > 850) {
                    //if the mouse xpos is over 850, draw the tooltip to 
                    //the left of the mouse, to keep tooltip inside graph
                    toolTipX = mx - 13 - rectWidth;
                }
                if (my < 120) {
                    //if the mouse ypos is less than 120, draw the tooltip  
                    //under the mouse to keep tooltip inside graph
                    toolTipY = my + diameter * 0.5;
                }
                let textX = toolTipX + 4;
                let textY = toolTipY + 15;
                push();
                textSize(layout.labelSize);
                //draw the bubble again but with black border
                noFill();
                stroke(0);
                ellipse(xpos, ypos, diameter);
                fill(colorsList[i]);
                ellipse(xpos, ypos, diameter);
                //draw the rectangle for the tooltip
                stroke(100);
                strokeWeight(1);
                fill(255);
                rect(toolTipX, toolTipY, rectWidth, 65, cornerRadius, cornerRadius, cornerRadius, cornerRadius);
                //draw the text of the tooltip
                noStroke();
                fill(0);
                text(labelText, textX, textY);
                pop();
                selected = i;
                break;
            }
        }
        if (selected != previous && selected != -1) {
            sound.setVolume(0.3); // set bubble sound volume
            sound.play();
        }
        previous = selected;
        changeTransparency(selected, valuesX.length);
    };
    /**
     * Function to change the transparency of all the bubbles that are not being hovered
     * 
     * @param {number} hoverIndex Index of the bubble that is hovered
     * @param {number} size       number of bubbles
     */
    function changeTransparency(hoverIndex, size) {
        for (let i = 0; i < size; i++) {
            colorsList[i].setAlpha(hoverIndex == -1 ? 180 : hoverIndex == i ? 255 : 100);
        }
    };

    function drawGrid(maxValueX, maxValueY) {
        //draw grid for X axis
        let minXValue = min(valuesX);
        let originX = floor(minXValue) - 1;
        if (originX < 0) {
            originX = 0;
        }
        let ticksx = maxValueX - originX; //this is an integer
        if (ticksx > ticksX) {
            ticksx = ticksX;
        }
        let incrementX = (maxValueX - originX) / ticksx; //not necesarilly integer
        let tickWidthX = (width - layout.padAxis) / ticksx;
        let roundedIncrementX = ceil(incrementX);
        let adjustedTickWidth = (roundedIncrementX * tickWidthX) / incrementX; //actual value in pixels to draw each tick
        push();
        textSize(layout.labelSize - 3);
        fill(0);
        let i = 1;
        let currVal = layout.padAxis + (i * adjustedTickWidth);
        while (currVal < width) {
            stroke(200);
            line(currVal,
                height - layout.padAxis - 1,
                currVal,
                layout.padTop);
            noStroke();
            let tickText = originX + (i * roundedIncrementX);
            text(tickText,
                currVal - textWidth(tickText) / 2,
                height - layout.padTickX);
            i++;
            currVal = layout.padAxis + (i * adjustedTickWidth);
        }
        //draw grid for Y axis
        let incrementY = maxValueY / ticksY; //not necesarilly integer
        let tickHeightY = layout.plotHeight() / ticksY;
        let roundedIncrementY = ceil(incrementY); //an integer
        let adjustedTickHeight = (roundedIncrementY * tickHeightY) / incrementY; //this is the actual value in pixels to draw each tick in Y axis
        fill(0);
        let j = 1;
        let currY = height - layout.padAxis - (j * adjustedTickHeight);
        textAlign(CENTER);
        while (currY > layout.padTop) {
            stroke(200);
            line(layout.padAxis + 1, currY,
                width, currY);
            noStroke();
            let tickText = j * roundedIncrementY;
            text(tickText,
                layout.padTickY,
                currY + 3);
            j++;
            currY = height - layout.padAxis - (j * adjustedTickHeight);
        }
        pop();
        return originX;
    };

    function drawAxes() {
        push();
        stroke(50);
        //Add Y-axis
        line(layout.padAxis, layout.padTop,
            layout.padAxis, height - layout.padAxis);
        line(width - 1, layout.padTop,
            width - 1, height - layout.padAxis);
        //Add X-axis
        line(layout.padAxis, height - layout.padAxis,
            width, height - layout.padAxis);
        line(layout.padAxis, layout.padTop,
            width, layout.padTop)
        pop();
    };

    function drawAxisNames() {
        push();
        textSize(layout.labelSize);
        let widthX = textWidth(labels[0]) / 2;
        let widthY = textWidth(labels[1]) / 2;
        fill(0);
        //name for x-axis, will show horizontally
        text(labels[0], layout.halfGraphX() - widthX, height - layout.padLabel);
        //name for y-axis, will show vertically
        let rotationY = layout.halfGraphY() + widthY;
        let rotationX = layout.padLabel;
        translate(rotationX, rotationY);
        rotate(-PI / 2);
        text(labels[1], 0, layout.labelSize);
        pop();
    };

}
