/**
 * LineChart object, draws 2 different plots, one for each country selected. Plotting electric power generation in giga watts per hour in yearly basis
 * @param   {Array}    state1X    array of numbers, holds the values for the X- axis in the plot, these represent years
 * @param   {Array}    state1Y    array of numbers, holds the values for the Y-axis in the plot, these represent the electric power generated
 * @param   {Array}    state2X    array of numbers, holds the values for the X- axis in the plot, these represent years
 * @param   {Array}    state2Y    array of numbers, holds the values for the Y-axis in the plot, these represent the electric 
 * @param   {p5 color} color1     color object
 * @param   {p5 color} color2     color object
 * @param   {Array}    labels     Array with 2 entries, both strings. They represent the names of the x and y axis respectively
 * @param   {string}   state1Name name of the first State selected
 * @param   {string}   state2Name name of the second State selected
 * @param   {number}   startYear  Starting year in the x-axis
 * @param   {number}   endYear    End year in the x-axis
 * @param   {number}   shape      Either 0, 1 or 2. If 0, the dots in the graph are plotted as ellipses, if 1 then they are rectangles, if 2 they are triangles.
 * @returns {LineChart object} 
 */
function LineChart(state1X, state1Y, state2X, state2Y, color1, color2, labels, state1Name, state2Name, startYear, endYear, shape) {
    let diameter = 8; //"diameter" of the points on the plot
    let minDist = 10; // minimum distance to be used to highlight a point on the graph
    let lineWeight = 2; // line weight of the plot when one of its points is hovered
    let isData1Empty = (state1X.length == 0); //boolean, true if the array is empty
    let isData2Empty = (state2X.length == 0); //boolean, true if the array is empty
    let tickX = 7; //maximum number of divisions to show in x-axis
    let tickY = 8; //maximum number of divisions to show in y-axis

    /**
     * private function to find the minimum value between two arrays of numbers
     * 
     * @param   {Array}  array1 array of numbers
     * @param   {Array}  array2 array of numbers
     * @returns {number} min number found
     */
    function findMin(array1, array2) {
        if (array1.length != 0 && array2.length != 0) {
            return min(min(array1), min(array2));
        } else if (array1.length == 0 && array2.length != 0) {
            return min(array2);
        } else if (array1.length != 0 && array2.length == 0) {
            return min(array1);
        } else {
            //if both arrays are empty
            return undefined;
        }
    };

    /**
     * private function to find the maximum value between two arrays of numbers
     * 
     * @param   {Array}  array1 array of numbers
     * @param   {Array}  array2 array of numbers
     * @returns {number} maximum number found
     */
    function findMax(array1, array2) {
        if (array1.length != 0 && array2.length != 0) {
            return max(max(array1), max(array2));
        } else if (array1.length == 0 && array2.length != 0) {
            return max(array2);
        } else if (array1.length != 0 && array2.length == 0) {
            return max(array1);
        } else {
            return undefined;
        }
    };
    let maxValueY = findMax(state1Y, state2Y) * 1.1; //max value to be shown on Y-axis
    let minValueY = findMin(state1Y, state2Y) * 0.9; //min value to be shown on Y-axis
    let minValueX = startYear; //min value to be shown on X-axis
    let maxValueX = endYear; //max value to be shown on X-axis
    let layout = {
        padAxis: 50,
        padAxisY: 50,
        padLabel: 5,
        padTop: 50,
        padTickX: 30,
        padTickY: function () {
            return this.padAxisY - 10;
        },
        labelSize: 12,
        plotWidth: function () {
            return (width - this.padAxisY - 150);
        },
        plotHeight: function () {
            return height - this.padTop - this.padAxis;
        },
        halfGraphX: function () {
            //X coordinate of the middle point
            //in the X-axis
            return this.padAxisY + this.plotWidth() / 2;
        },
        halfGraphY: function () {
            //Y coordinate of the middle point
            //in the Y-axis
            return this.padTop + this.plotHeight() / 2;
        },
    };

    this.draw = function () {
        drawAxisNames();
        if (state1X.length != 0 || state2X.length != 0) {
            //if one or both of the given data arrays are non empty
            drawGrid();
        }
        drawAxes();
        if (state1X.length > 0) {
            //if the array of values to plot is not empty
            //then draw the line and points
            drawLine(state1X, state1Y, color1, 1);
            drawPoints(state1X, state1Y, color1);
        }
        if (state2X.length > 0) {
            //if the array of values to plot is not empty
            //then you draw the line and points
            drawLine(state2X, state2Y, color2, 1);
            drawPoints(state2X, state2Y, color2);
        }
        mouseOver(mouseX, mouseY);
    };
    /**
     * Private function to draw the line corresponding to the State data
     * @param {Array}  dataX    Array of numbers, values for x-axis
     * @param {Array}  dataY    Array of numbers, values for y-axis
     * @param {object} color    p5 color object
     * @param {number} lineW    weight of line
     */
    function drawLine(dataX, dataY, color, lineW) {
        push();
        let xprev = map(dataX[0], minValueX, maxValueX,
            layout.padAxisY,
            layout.padAxisY + layout.plotWidth());
        let yprev = map(dataY[0], minValueY, maxValueY,
            height - layout.padAxis,
            layout.padTop);
        for (let i = 1; i < dataX.length; i++) {
            let currX = map(dataX[i], minValueX, maxValueX,
                layout.padAxisY,
                layout.padAxisY + layout.plotWidth());
            let currY = map(dataY[i], minValueY, maxValueY,
                height - layout.padAxis,
                layout.padTop);
            stroke(color);
            strokeWeight(lineW);
            line(xprev, yprev, currX, currY);
            xprev = currX;
            yprev = currY;
        }
        pop();
    };
    /**
     * private function to draw the points in the canvas, draws ellipses, triangles or rectangles depending on the value of "shape" argument
     * 
     * @param {Array}  dataX Array of numbers, values for x-axis
     * @param {Array}  dataY Array of numbers, values for y-axis
     * @param {object} color p5 color object
     */
    function drawPoints(dataX, dataY, color) {
        //draws a point for each x and y values given
        push();
        noStroke();
        fill(color);
        for (let i = 0; i < dataX.length; i++) {
            let xpos = map(dataX[i],
                minValueX,
                maxValueX,
                layout.padAxisY,
                layout.padAxisY + layout.plotWidth());
            let ypos = map(dataY[i], minValueY,
                maxValueY,
                height - layout.padAxis,
                layout.padTop);
            if (shape == 0) {
                ellipse(xpos, ypos, diameter);
            } else if (shape == 1) {
                let xrect = xpos - diameter / 2;
                let yrect = ypos - diameter / 2;
                rect(xrect, yrect, diameter, diameter);
            } else {
                let x1 = xpos;
                let y1 = ypos - diameter / 2;
                let x2 = xpos - diameter / 2;
                let y2 = ypos + diameter / 2;
                let x3 = xpos + diameter / 2;
                let y3 = ypos + diameter / 2;
                triangle(x1, y1, x2, y2, x3, y3);
            }
        }
        pop();
    };

    /**
     * Function to highlight a point being hovered and the line it belongs to
     * 
     * @param {number} xpos  position in x-axis of point being hovered
     * @param {number} ypos  position in y-axis of point being hovered
     * @param {Array}  xAxis Array of numbers, x-values to plot in graph
     * @param {Array}  yAxis Array of numbers, y-values to plot in graph
     * @param {object} color p5 color object
     */
    function highlightPointAndLine(xpos, ypos, xAxis, yAxis, color) {
        push();
        drawLine(xAxis, yAxis, color, lineWeight);
        noStroke();
        fill(color);
        ellipse(xpos, ypos, diameter * 1.6);
        stroke(0);
        noFill();
        ellipse(xpos, ypos, diameter * 4);
        pop();
    };

    /**
     * function to check if the mouse is over any point in the graph
     * 
     * @param {number}   mx   X-position of mouse
     * @param {number}   my   Y-position of mouse
     */
    function mouseOver(mx, my) {
        //check if mouse is over any point of graph for State 1
        let overGraph1 = checkGraphHover(mx, my, state1X, state1Y, color1, state1Name);
        if (!overGraph1) {
            //check if mouse is over any point of  graph for State 2
            checkGraphHover(mx, my, state2X, state2Y, color2, state2Name);
        }
    };
    /**
     * Function to check if the mouse is sufficiently close to any of the points in the graph. In that case, the point must be highlighted
     * 
     * @param   {number}  mx        X-position of mouse
     * @param   {number}  my        Y-position of mouse
     * @param   {Array}   valuesX   Array of numbers, x-values plotted in graph
     * @param   {Array}   valuesY   Array of numbers, y-values plotted in graph
     * @param   {object}  color     p5 color object
     * @param   {string}  stateName 
     * @returns {boolean} 
     */
    function checkGraphHover(mx, my, valuesX, valuesY, color, stateName) {
        //returns true if mouse is sufficiently close to any point (x,y)
        //in the given arrays of values, also calls drawTooltip() for that particular point
        for (let i = 0; i < valuesX.length; i++) {
            let xpos = map(valuesX[i],
                minValueX,
                maxValueX,
                layout.padAxisY,
                layout.padAxisY + layout.plotWidth());
            let ypos = map(valuesY[i], minValueY,
                maxValueY,
                height - layout.padAxis,
                layout.padTop);
            if (dist(mx, my, xpos, ypos) < minDist) {
                highlightPointAndLine(xpos, ypos, valuesX, valuesY, color);
                drawTooltip(valuesX[i], valuesY[i], xpos, ypos, stateName);
                return true;
            }
        }
        return false;
    };
    /**
     * Function to draw the tooltip for point in the graph that is being hovered
     * 
     * @param {number} valX   value for x-axis (year)
     * @param {number} valY   value for y-axis ( electricity generated)
     * @param {number} posX   position of point in x-axis
     * @param {number} posY   position of point in x-axis
     * @param {string} name   Name of the State 
     */
    function drawTooltip(valX, valY, posX, posY, name) {
        let font = 10;
        let value = "" + valY.toFixed(2);
        let stateText = "State: " + name;
        let yearText = "Year: " + valX;
        let valueText = "Value: " + value + " GW/h";
        let rectWidth = max(textWidth(valueText), textWidth(stateText)) - 3;
        let rectHeight = font * 4.5;
        let rectYpos = posY - 53;
        let rectXpos = posX + 9;
        if (posX > 750) {
            //if the mouse x pos is over 750, draw the tooltip to 
            //the left of the mouse, to keep tooltip inside graph
            rectXpos = posX - 9 - rectWidth;
        }
        if (posY < 105) {
            //if the mouse y pos is less than 100, draw the tooltip  
            //under the mouse to keep tooltip inside graph
            rectYpos = posY + 10;
        }
        let textX = rectXpos + 5;
        let textY = rectYpos + 15;
        push();
        textSize(font);
        fill(255);
        stroke(0);
        rect(rectXpos, rectYpos, rectWidth, rectHeight); //draw white rectangle for text
        noStroke();
        fill(0);
        text(stateText, textX, textY); //state name
        text(yearText, textX, textY + 1.2 * font); //year
        text(valueText, textX, textY + 2.4 * font); //generated electricity
        pop();
    };

    /**
     * function to draw the grid of the graph, it must change depending of the starting and ending years that the user selects
     */
    function drawGrid() {
        //draw grid for X axis
        let minX = minValueX;
        let maxX = maxValueX;
        let maxY = maxValueY;
        let minY = minValueY;
        let ticksX = maxX - minX;
        if (ticksX > tickX) {
            //if there are more values to be drawn that the ones we want to draw
            ticksX = tickX;
        }
        let incrementX = (maxX - minX) / ticksX; //not necesarilly integer
        let tickWidthX = layout.plotWidth() / ticksX;
        let roundedIncrementX = ceil(incrementX);
        let adjustedTickWidth = (roundedIncrementX * tickWidthX) / incrementX; //actual value in pixels to draw each tick
        push();
        textSize(layout.labelSize - 3);
        fill(0);
        let i = 0;
        let currVal = layout.padAxisY + (i * adjustedTickWidth);
        while (currVal <= (layout.padAxis + layout.plotWidth())) {
            stroke(220);
            line(currVal, height - layout.padAxis - 1, currVal, layout.padTop);
            noStroke();
            let tickText = minX + (i * roundedIncrementX);
            if (tickText != minX && tickText != maxX) {
                text(tickText,
                    currVal - textWidth(tickText) / 2,
                    height - layout.padTickX);
            }
            i++;
            currVal = layout.padAxisY + (i * adjustedTickWidth);
        }
        //draw grid for Y axis
        let ticksY = ceil(maxY - minY);
        if (ticksY > tickY || ticksY <= 1) {
            //if there are more values to be drawn that the ones we want to draw
            ticksY = tickY;
        }
        let incrementY = (maxY - minY) / ticksY;
        let tickHeightY = layout.plotHeight() / ticksY;
        let roundedIncrementY = ceil(incrementY);
        let adjustedTickHeight = (roundedIncrementY * tickHeightY) / incrementY; //actual value in pixels to draw each tick in Y axis
        fill(0);
        let j = 0;
        let currY = height - layout.padAxis - (j * adjustedTickHeight);
        textAlign(CENTER);
        while (currY >= layout.padTop) {
            stroke(220);
            line(layout.padAxisY + 1, currY, layout.padAxisY + layout.plotWidth(), currY);
            noStroke();
            let tickText = (minY + j * roundedIncrementY).toFixed(1);
            text(tickText,
                layout.padTickY() - 3,
                currY + 3);
            j++;
            currY = height - layout.padAxis - (j * adjustedTickHeight);
        }
        pop();
    };

    function drawAxes() {
        let graphEndX = layout.padAxisY + layout.plotWidth();
        push();
        stroke(50);
        //Add Y-axis
        line(layout.padAxisY, layout.padTop,
            layout.padAxisY, height - layout.padAxis);
        line(graphEndX, layout.padTop,
            graphEndX, height - layout.padAxis);
        //Add X-axis
        line(layout.padAxisY,
            height - layout.padAxis,
            layout.padAxisY + layout.plotWidth(),
            height - layout.padAxis);
        line(layout.padAxisY,
            layout.padTop,
            layout.padAxisY + layout.plotWidth(),
            layout.padTop);
        pop();
    };

    /**
     * function to draw the names of each axis. Also includes "legend" elements used when saving graph. Inform user if there is no data available for that specific State or Power source
     */
    function drawAxisNames() {
        //function to draw the names of each axis
        push();
        textSize(layout.labelSize);
        let widthX = textWidth(labels[0]) / 2;
        let widthY = textWidth(labels[1]) / 2;
        fill(0);
        //name for x-axis, will show horizontally
        text(labels[0], layout.halfGraphX() - widthX, height - layout.padLabel);

        //Draw squares with the colors picked, they are needed if the user wants to save the drawing, since the colorSelector elements are not part of the canvas
        let colorX = 892;
        let color1Y = height / 2 - 37;
        let color2Y = height / 2 + 23;
        noStroke();
        fill(color1);
        rect(colorX, color1Y, 20, 20);
        fill(color2);
        rect(colorX, color2Y, 20, 20);

        // Add names to graph legend
        fill(0);
        let legend1Y = (height / 2) - 24;
        let legend2Y = (height / 2) + 36;
        let legendX = 920;
        text(state1Name, legendX, legend1Y);
        text(state2Name, legendX, legend2Y);
        textStyle(BOLDITALIC);
        if (isData1Empty) {
            //if there is no data to be plotted for 
            //State1 then show info in legend
            fill(color1);
            text("No data available", legendX, legend1Y + layout.labelSize + 2);
        }
        if (isData2Empty) {
            //if there is no data to be plotted for 
            //State2 then show info in legend
            fill(color2);
            text("No data available", legendX, legend2Y + layout.labelSize + 2);
        }
        textStyle(NORMAL);
        //name for y-axis, will show vertically
        fill(0);
        let rotationY = layout.halfGraphY() + widthY;
        let rotationX = layout.padLabel;
        translate(rotationX, rotationY);
        rotate(-PI / 2);
        text(labels[1], 0, layout.labelSize);
        pop();
    };
}
