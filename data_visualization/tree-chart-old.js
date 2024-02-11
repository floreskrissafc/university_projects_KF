/**
 * This function creates a simplified version of a Tree Chart, where the decision of drawing a rectangle horizontally or vertically is chosen by keeping a ratio that is the closest to 1. This file is not currently used in the project. If you want to see how the Tree-chart will look using this algorithm you just need to change lines 140 and 208 of the world-gdp-2017.js file, here instead of using TreeChart use TreeChart2. 
 */

function TreeChart2(dataGDP, dataRegion, level, title, colorArr, codesArr) {
    //

    let self = this;
    this.zoneNames = dataRegion;
    this.title = title;
    this.layout = {
        margin_top: 70,
        margin_left: 70,
        marginTitle: 40,
        plotWidth: function () {
            return width - this.margin_left;
        },
        plotHeight: function () {
            return height - this.margin_top;
        },
        titleSize: 20,
        tooltipSize: 10,
        nameSize: 12
    };
    //initial values for plot origin
    this.currX = this.layout.margin_left;
    this.currY = this.layout.margin_top;
    this.remainingWidth = this.layout.plotWidth();
    this.remainingHeight = this.layout.plotHeight();
    //---------
    this.calculateTotalArea = function () {
        return (width - this.layout.margin_left) * (height - this.layout.margin_top);
    };
    this.calculateTotalGDP = function () {
        let sum = 0;
        for (let i = 0; i < dataGDP.length; i++) {
            sum += Number(dataGDP[i]);
        }
        return sum;
    };
    this.totalGDP = this.calculateTotalGDP();
    this.totalArea = this.calculateTotalArea();
    this.decideSplit = function (currentArea) {
        //if vertical split
        let vHeight = self.remainingHeight;
        let vWidth = currentArea / vHeight;
        let ratio1 = max(vHeight / vWidth, vWidth / vHeight); //number always bigger than 1
        //if horizontal split
        let hWidth = self.remainingWidth;
        let hHeight = currentArea / hWidth;
        let ratio2 = max(hHeight / hWidth, hWidth / hHeight); //number always bigger than 1
        //pick the ratio closer to 1
        let ratio = min(ratio1, ratio2);
        let xmax;
        let ymax;
        if (ratio == ratio1) {
            xmax = self.currX + vWidth;
            ymax = self.currY + vHeight;
            //update the global values for the next element
            self.remainingWidth -= vWidth;
            self.currX = xmax;
        } else {
            xmax = self.currX + hWidth;
            ymax = self.currY + hHeight;
            //update the global values for the next element
            self.remainingHeight -= hHeight;
            self.currY = ymax;
        }
        return [xmax, ymax];
    };

    //create array to hold all the properties of the different rectangles to be drawn
    this.calculateLayouts = function () {
        let len = dataGDP.length - 1;
        let data = new Array(len + 1);
        for (let i = 0; i < dataGDP.length; i++) {
            let currRect = {};
            currRect.gdp = dataGDP[i];
            currRect.name = dataRegion[i];
            currRect.code = codesArr[i];
            let currArea = (currRect.gdp * this.totalArea) / this.totalGDP;
            currRect.xmin = this.currX;
            currRect.ymin = this.currY;
            currRect.color = colorArr[i];
            if (i != len) {
                let split = this.decideSplit(currArea);
                currRect.xmax = split[0];
                currRect.ymax = split[1];
            } else {
                currRect.xmax = width;
                currRect.ymax = height;
            }
            currRect.width = currRect.xmax - currRect.xmin;
            currRect.height = currRect.ymax - currRect.ymin;
            data[i] = currRect;
        }
        return data;
    };
    this.zoneLimits = this.calculateLayouts();
    this.draw = function () {

        for (let i = 0; i < this.zoneLimits.length; i++) {
            push();
            let currObj = this.zoneLimits[i];
            fill(currObj.color);
            noStroke();
            if (level == 1) {
                stroke(255);
            }
            rect(currObj.xmin, currObj.ymin, currObj.width, currObj.height);
            fill(0);
            noStroke();
            textSize(this.layout.nameSize);
            let nameSize = textWidth(currObj.name);
            let id = currObj.name;
            if (level == 1 && nameSize >= 0.8 * currObj.width) {
                id = currObj.code;
            }
            let textW = textWidth(id);
            if (level == 1 && textW >= 0.8 * currObj.width) {
                //if the name is still to large even with the country code
                let newX0 = (currObj.xmax + currObj.xmin) / 2;
                let newY0 = (currObj.ymax + currObj.ymin) / 2;
                translate(newX0, newY0);
                rotate(-PI / 2);
                text(id, -textW / 2, this.layout.nameSize / 2);
            } else {
                text(id, (currObj.xmax + currObj.xmin - textW) / 2, (currObj.ymax + currObj.ymin + this.layout.nameSize) / 2);
            }
            pop();
        }
        this.drawTitle();
        this.mouseOver(mouseX, mouseY);
    };

    this.mouseOver = function (mx, my) {
        //on mouse over, draw a black border around the element that is
        //being hovered, and make the text bolder. Also, if the level is 1, which means that particular countries are being drawn then show a tooltip for the country.
        for (let i = 0; i < this.zoneLimits.length; i++) {
            let currObj = this.zoneLimits[i];
            if (mx > currObj.xmin && mx < currObj.xmax &&
                my > currObj.ymin && my < currObj.ymax) {
                push();
                stroke(0);
                noFill();
                rect(currObj.xmin, currObj.ymin, currObj.width, currObj.height);
                fill(0);
                textSize(this.layout.nameSize);
                let nameSize = textWidth(currObj.name);
                let id = currObj.name;
                if (level == 1 && nameSize >= 0.8 * currObj.width) {
                    id = currObj.code;
                }
                let textW = textWidth(id);
                if (level == 1 && textW >= 0.8 * currObj.width) {
                    //if the name is still to large even with the country code
                    let newX0 = (currObj.xmax + currObj.xmin) / 2;
                    let newY0 = (currObj.ymax + currObj.ymin) / 2;
                    translate(newX0, newY0);
                    rotate(-PI / 2);
                    text(id, -textW / 2, this.layout.nameSize / 2);
                } else {
                    text(id, (currObj.xmax + currObj.xmin - textW) / 2, (currObj.ymax + currObj.ymin + this.layout.nameSize) / 2);
                }
                pop();
                if (level == 1) {
                    this.drawTooltip(currObj, mx, my);
                }
                return;
            }
        }
    };

    this.drawTooltip = function (element, mx, my) {
        let country = "Country: " + element.name;
        let gdp = "GDP-PPP: " + element.gdp.toFixed(4);
        let maxWidth = max(textWidth(country), textWidth(gdp)) * 1.2;
        let theight = this.layout.tooltipSize * 5;
        let tooltip = country + "\n" + gdp + "\nYear: 2017";
        let rxpos = mx + 10; //rectange position x
        let rypos = my - 60; //rectange position y
        if (mx > 850) {
            //if the mouse x pos is over 850, draw the tooltip to 
            //the left of the mouse, to keep tooltip inside graph
            rxpos = mx - 10 - maxWidth;
        }
        if (my < 140) {
            //if the mouse y pos is less than 120, draw the tooltip  
            //under the mouse to keep tooltip inside graph
            rypos = my + 5;
        }
        let txpos = rxpos + 10;
        let typos = rypos + 15;
        push();
        stroke(0);
        fill(255);
        rect(rxpos, rypos, maxWidth, theight);
        noStroke();
        fill(0);
        text(tooltip, txpos, typos);
        pop();
    }
    this.drawTitle = function () {
        push();
        textSize(this.layout.titleSize);
        let textW = textWidth(title);
        let xpos = (width + this.layout.margin_left - textW) / 2;

        text(title, xpos, this.layout.marginTitle);
        pop();
    };
}
