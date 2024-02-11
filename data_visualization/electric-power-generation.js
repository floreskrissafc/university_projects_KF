/**
 * This visualization shows the electric power generated in the State of Nevada, USA from 1990 to 2018. A bar is drawn for every five years since 1990. The lenght of the bars for each year is relative to the maximum power generated for all years. Likewise, each bar is made of smaller bars, each representing a different type of energy source, and the lenght of each of these inner bars is relative to the total power generated that year. 
 * 
 */
function ElectricPowerGeneration() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Power Generation Nevada(USA): 1990-2018';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'electric-power-generation';
    //Private variables
    let title = "Total Electric Power Generated in MW/h, Nevada (USA)";
    let data;
    let self = this;
    let widthsPerYear;
    let years;
    let energySources;
    let barObjects;
    // Property to represent whether data has been loaded.
    let loaded = false;
    // Layout object to store all common plot layout parameters and methods.
    let layout = {
        leftMargin: 130,
        rightMargin: width,
        topMargin: 30,
        bottomMargin: height,
        pad: 10,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        lineHeight: function () {
            return (height - this.topMargin) / data.getRowCount();
        }
    };
    // Default visualisation colours.
    let barColors = [color(230, 25, 75), color(60, 180, 75), color(255, 225, 25), color(0, 130, 200), color(245, 130, 48), color(70, 240, 240), color(240, 50, 230), color(128, 0, 0), color(170, 255, 195), color(0, 0, 128)];

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        data = loadTable(
            './data/electric-power-generation/electric-power-nevada.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                loaded = true;
            });
    };

    this.setup = function () {
        push();
        // Font defaults.
        textSize(16);
        years = data.columns;
        energySources = data.getColumn('Energy Source');
        widthsPerYear = widthPerYear();
        barObjects = createBars();
    };

    this.destroy = function () {
        pop();
    };

    this.draw = function () {
        if (!loaded) {
            console.log('Data not yet loaded');
            return;
        }
        drawTitle();
        let lastBar = barObjects[barObjects.length - 1];
        let lastYpos = lastBar.height + lastBar.ypos;
        drawYaxis();
        drawLeyend(lastYpos);
        for (let i = 0; i < barObjects.length; i++) {
            let currObj = barObjects[i];
            fill(currObj.color);
            rect(currObj.xpos, currObj.ypos, currObj.width, currObj.height);
        }
        for (let i = 0; i < barObjects.length; i++) {
            //this loop checks if any bar object is being hovered
            mouseOver(mouseX, mouseY, barObjects[i]);
        }
    };

    function drawTitle() {
        push();
        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(24);
        text(title, width / 2 + 50, layout.topMargin - 5);
        pop();
    };
    /**
     * Draw the years shown in the Y-axis
     */
    function drawYaxis() {
        let lineHeight = layout.lineHeight();
        for (let i = 1; i < data.getColumnCount(); i++) {
            let lineY = (lineHeight * (i - 1)) + layout.topMargin + lineHeight / 2;
            fill(0);
            noStroke();
            textAlign('right', 'top');
            text(years[i],
                layout.leftMargin - layout.pad,
                lineY + (lineHeight - layout.pad) / 2.7);
        }
    };
    /**
     * Create an array of bar objects to be drawn on canvas
     * 
     * @returns {Array} array of bar objects
     */
    function createBars() {
        let barList = [];
        let lineHeight = layout.lineHeight();
        //Loop through the years to be shown in chart
        for (let i = 1; i < data.getColumnCount(); i++) {
            let lineY = (lineHeight * (i - 1)) + layout.topMargin + lineHeight / 2;
            let yearData = data.getColumn(years[i]);
            yearData = yearData.map(Number); //to make every entry of yearData a number, it's not by default
            let totalSum = sum(yearData);
            let maxValue = max(yearData);
            let prevWidth = 0; //value that changes the position where the next rectangle will be drawn
            //Loop through the energy sources
            for (let j = 0; j < yearData.length; j++) {
                let currwidth = map(yearData[j], 0, totalSum, 0, widthsPerYear[i - 1]);
                //create a new bar object
                let newBar = barObject(
                    currwidth,
                    lineHeight - layout.pad,
                    layout.leftMargin + prevWidth,
                    lineY,
                    yearData[j],
                    totalSum,
                    barColors[j]
                );
                barList.push(newBar);
                //update the position in which the next bar is going to be drawn
                prevWidth += currwidth;
            }
        }
        return barList;
    };

    function barObject(w, h, x, y, value, total, colour) {
        let obj = {};
        obj.width = w;
        obj.height = h;
        obj.xpos = x;
        obj.ypos = y;
        obj.value = value;
        obj.percentage = ((value / total) * 100).toFixed(2);
        obj.tooltip = "Value: " + value + "MW/h \nPercentage: " + obj.percentage + "%";
        obj.color = colour
        return obj;
    };
    /**
     * Function to calculate the total energy produced in a specific year
     * 
     * @returns {Array} Array of numbers
     */
    function totalPerYear() {
        //function to get the total energy produced in a specific year, as an array
        let totalEnergy = new Array();
        for (let i = 1; i < data.getColumnCount(); i++) {
            let yearData = data.getColumn(years[i]);
            yearData = yearData.map(Number); //to make every entry of yearData a number, it's not by default
            let totalSum = sum(yearData);
            totalEnergy.push(totalSum);
        }
        return totalEnergy;
    };

    /**
     * Function to calculate the relative width of the bars for each year in the plot
     * 
     * @returns {Array} Array of numbers
     */
    function widthPerYear() {
        let energyPerYear = totalPerYear();
        let maxEnergy = max(energyPerYear);
        let widths = [];
        for (let i = 0; i < energyPerYear.length; i++) {
            let currWidth = map(energyPerYear[i], 0, maxEnergy, 0, layout.plotWidth());
            widths.push(currWidth);
        }
        return widths;
    };
    /**
     * Check if the mouse is over any of the bar objects stored in barObjects array and draw a tooltip for the bar in that case.
     * @param {number} mx        X position of mouse
     * @param {number} my        Y position of mouse
     * @param {object} barObject bar object element
     */
    function mouseOver(mx, my, barObject) {
        if (my > barObject.ypos &&
            my < (barObject.ypos + barObject.height - layout.pad) &&
            mx > barObject.xpos &&
            mx < (barObject.xpos + barObject.width)) {
            //if the mouse is over this particular bar
            //draw a ligth blue line around the bar
            push();
            strokeWeight(2);
            noFill();
            stroke(50);
            rect(barObject.xpos,
                barObject.ypos,
                barObject.width,
                barObject.height);
            pop();
            //also show it's correspondent tooltip
            push();
            textSize(12);
            let labelWidth = textWidth(barObject.tooltip);
            fill(255);
            stroke(0);
            let posXrect;
            let posYrect;
            if (mx < 880) {
                posXrect = mx + 5;
            } else {
                posXrect = mx - labelWidth / 2 - 17;
            }
            if (my < 100) {
                posYrect = my + 10;
            } else {
                posYrect = my - 30;
            }
            rect(posXrect, posYrect, labelWidth / 2 + 17, 35, 5, 5, 5, 5);
            noStroke();
            fill(0);
            textAlign('left', 'center');
            text(barObject.tooltip, posXrect + 5, posYrect + 17);
            pop();
        }
    };

    function drawLeyend(pos) {
        let boxWidth = 20;
        let ypos = pos + 50;
        let j = 0;
        for (let i = 0; i < energySources.length; i++) {
            let xpos = layout.leftMargin + j * 200;
            if (i > 4) {
                ypos = pos + 80;
            }
            if (i == 5) {
                xpos = layout.leftMargin;
                j = 0; //to only draw 5 things in one row
            }
            push();
            let source = energySources[i];
            fill(barColors[i]);
            rect(xpos, ypos, boxWidth, boxWidth);
            fill(0);
            textSize(12);
            let textX = xpos + boxWidth + 4;
            textAlign('left', 'center');
            text(source, xpos + boxWidth + 4, ypos + boxWidth / 2);
            pop();
            j++;
        }
    };
}
