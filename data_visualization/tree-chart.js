/**
 * This constructor returns a TreeChart object. Each rectangle drawn in the canvas is an object 
 * 
 * @param   {Array}  dataGDP    this is an array of numbers, contains the GDP of the regions/countries to be drawn
 * @param   {Array}  dataRegion this is an array of strings, contains the names of the regions/countries to be drawn
 * @param   {number} level      can be either 0 or 1. If it is 0 then the default TreeChart is being drawn (showing only regions of the world), if it is 1 then countries GDPs are being drawn
 *                              
 * @param   {string} title      The current title of the graph, changes depending on the region selected
 * @param   {Array}  colorArr   This is an array of p5 color objects. Each country/region has its own color. If countries are being drawn then these colors are gradients of the base color for the region they belong.
 *                              
 * @param   {Array}  codesArr   array of strings. Contains the code for each country to be drawn. This will be used if the name of the country is too long to fit in its area
 * @returns {Array}  [[Description]]
 */
function TreeChart(dataGDP, dataRegion, level, title, colorArr, codesArr) {
    let self = this;
    this.zoneNames = dataRegion;
    this.zoneLimits = [];
    let layout = {
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
    let remainingWidth = layout.plotWidth();
    let remainingHeight = layout.plotHeight();
    /**
     * Total area of the canvas where you can actually draw the graph
     * @returns {number} Area
     */
    function calculateTotalArea() {
        //returns number, total area of the canvas where you can draw the graph
        return (width - layout.margin_left) * (height - layout.margin_top);
    };
    /**
     * Summation of all the GDP values contained in the argument dataGDP
     * @returns {number} 
     */
    function calculateTotalGDP() {
        //returns number, summation of all GDP values given as argument to this constructor
        let sum = 0;
        for (let i = 0; i < dataGDP.length; i++) {
            sum += Number(dataGDP[i]);
        }
        return sum;
    };
    let totalGDP = calculateTotalGDP();
    let totalArea = calculateTotalArea();

    /**
     * Function to decide if a horizontal or vertical split should be done in the current zone. Depends on whether the remaining width in the graph is bigger or smaller than its remaining height.
     * 
     * @returns {Array} "h" or "v" will be used later to define the type of split and which parameter should be kept constant in the zone.
     */
    function decideSplit() {
        if (remainingWidth >= remainingHeight) {
            //if there is more width than height remaining, then do a horizontal split, you must take all the height of the zone
            return ["h", remainingHeight];
        } else {
            return ["v", remainingWidth];
        }
    };

    /**
     * This function maps the values of the GDPs of each region/country to the area of the graph they should cover 
     * 
     * @returns {Array}  array of numbers 
     */
    function getAllAreas() {
        //returns array of numbers. This functions maps the GDP of each region to the area they should cover in the graph
        let data = new Array(dataGDP.length);
        for (let i = 0; i < dataGDP.length; i++) {
            let currArea = (dataGDP[i] * totalArea) / totalGDP;
            data[i] = currArea;
        }
        return data;
    };

    let areasList = getAllAreas();

    /**
     * This function creates a new zone to hold 1 or several country areas. New areas will be included in the current zone if by including them you achieve a smaller ratio ( width/height or height/width). If not, then a new zone will be created to hold the last item you could not include in the current zone. Recursive function              
     * 
     * @param {number} x_origin  top-left corner x-position of the new zone
     * @param {number} y_origin  top-left corner y-position of the new zone
     * @param {number} index     Its a number to represent the current position in the traversing of this.areasList array 
     */
    function createNewZone(x_origin, y_origin, index) {
        let area1 = areasList[index];
        let split = decideSplit();
        let newX_origin = x_origin;
        let newY_origin = y_origin;
        let lastIndex = null;

        if (split[0].localeCompare("h") == 0) {
            //if you must do a horizontal split
            let height1 = split[1];
            let width1 = area1 / height1;
            let ratio1 = max(height1 / width1, width1 / height1);
            let currElements = [[height1, width1, area1]];
            let extended = addHorizontal(index + 1, height1, currElements, ratio1, area1);
            lastIndex = extended[0]; //from this index on, you need to create another zone because it was not possible to include it in the current zone
            let addedElements = extended[1]; //array containing all elements that were added to the current zone
            addZoneLimitsH(index, lastIndex, addedElements, x_origin, y_origin);
            remainingWidth -= addedElements[0][1]; //update value of the remaining width when you are done including areas
            newX_origin += addedElements[0][1];
        } else {
            //if you must do a vertical split
            let width1 = split[1];
            let height1 = area1 / width1;
            let ratio1 = max(height1 / width1, width1 / height1);
            let currElements = [[height1, width1, area1]];
            let extended = addVertical(index + 1, width1, currElements, ratio1, area1);
            lastIndex = extended[0]; //from this index on, you need to create another zone because it was not possible to include it in this zone
            let addedElements = extended[1]; //array containing all elements that were added to the current zone
            addZoneLimitsV(index, lastIndex, addedElements, x_origin, y_origin);
            remainingHeight -= addedElements[0][0];
            newY_origin += addedElements[0][0];
        }

        if (self.zoneLimits.length < areasList.length) {
            //if you haven't finished adding all the rectangle objects to the list, keep adding
            createNewZone(newX_origin, newY_origin, lastIndex);
        }

    };

    /**
     * Private function to recursively add new area elements to a zone. A new area is added if the ratio (width/height or height/width) is improved with respect to the previous ratio obtained. When a vertical split is chosen, the width of the zone must be shared between all the elements, therefore, they must have the same height.
     * 
     * @param   {number} index           number to represent the current position in the traversing of this.areasList array
     * @param   {number} Width           the width of the area that the elements in the zone must share
     * @param   {Array}  prevElementList Array of arrays. Each inner array contains 3 elements: "height", "width" and "area" of the current item
     * @param   {number} prevMaxRatio    largest ratio obtained before adding any more elements to the zone
     * @param   {number} prevTotalArea   total area of elements already included in the zone
     * @returns {Array}  the first number is the index of the element in this.areasList array that could not be included in the current zone, the second element is an array of arrays containing all the areas that were included in the zone. 
     */
    function addVertical(index, Width, prevElementList, prevMaxRatio, prevTotalArea) {
        if (index >= areasList.length) {
            return [index, prevElementList];
        }
        let currArea = areasList[index];
        let newTotalArea = prevTotalArea + currArea;
        let height4All = newTotalArea / Width;
        let newElementList = copyArray(prevElementList);
        for (let i = 0; i < newElementList.length; i++) {
            let currElement = newElementList[i];
            currElement[0] = height4All; //update height of each element, all must have the same height
            currElement[1] = currElement[2] / height4All; //update width of each element
            newElementList[i] = currElement;
        }
        newElementList.push([height4All, height4All / currArea, currArea]);
        let newMaxRatio = maxRatio(newElementList);
        if (newMaxRatio < prevMaxRatio) {
            //if adding a new element to this sections makes it look better, then try to add another one
            return addVertical(index + 1, Width, newElementList, newMaxRatio, newTotalArea);
        } else {
            return [index, prevElementList];
        }
    };

    /**
     * Private function to recursively add new area elements to a zone. A new area is added if the ratio (width/height or height/width) is improved with respect to the previous ratio obtained. When a horizontal split is chosen, the height of the zone must be shared between all the elements, therefore, they must have the same width.
     * 
     * @param   {number} index           number to represent the current position in the traversing of this.areasList array
     * @param   {number} Height          the height of the area that the elements in the zone must share
     * @param   {Array}  prevElementList Array of arrays. Each inner array contains 3 elements: "height", "width" and "area" of the current item
     * @param   {number} prevMaxRatio    largest ratio obtained before adding any more elements to the zone
     * @param   {number} prevTotalArea   total area of elements already included in the zone
     * @returns {Array}  the first number is the index of the element in this.areasList array that could not be included in the current zone, the second element is an array of arrays containing all the areas that were included in the zone. 
     */

    function addHorizontal(index, Height, prevElementList, prevMaxRatio, prevTotalArea) {
        if (index >= areasList.length) {
            return [index, prevElementList];
        }
        let currArea = areasList[index];
        let newTotalArea = prevTotalArea + currArea;
        let width4All = newTotalArea / Height;
        let newElementList = copyArray(prevElementList);
        for (let i = 0; i < newElementList.length; i++) {
            let currElement = newElementList[i];
            currElement[0] = currElement[2] / width4All; //update height of each element
            currElement[1] = width4All; //update width for all elements
            newElementList[i] = currElement;
        }
        newElementList.push([currArea / width4All, width4All, currArea]);
        let newMaxRatio = maxRatio(newElementList);

        if (newMaxRatio < prevMaxRatio) {
            //if adding a new element to this sections makes it look better, then try to add another one
            return addHorizontal(index + 1, Height, newElementList, newMaxRatio, newTotalArea);
        } else {
            return [index, prevElementList];
        }
    };


    /**
     * Once you have a list with all the elements to be included in a zone, you must create an object for each of them and add it to this.zoneLimits array, which will be used later to actually draw the graph. With vertical splits, each subsequent element will be placed to the right of the previous element (side by side).
     * 
     * @param {number} startIndex  initial index for traversing this.areasList array
     * @param {number} endIndex    last index for traversing this.areasList array
     * @param {Array}  elementList array of arrays. Each inner array contains 3 values: "height","width" and "area" of the element.
     * @param {number} x           initial value of x coordinate for elements in the current zone
     * @param {number} y           initial value of y coordinate for elements in the current zone
     */
    function addZoneLimitsV(startIndex, endIndex, elementList, x, y) {
        let y_min = y;
        let height_V = elementList[0][0];
        let y_max = y_min + height_V;
        let x_origin = x;
        let i = startIndex;
        let j = 0;
        while (i < endIndex) {
            let element = elementList[j];
            let currWidth = element[1];
            let currRect = {};
            currRect.gdp = dataGDP[i];
            currRect.name = dataRegion[i];
            currRect.code = codesArr[i];
            currRect.xmin = x_origin;
            currRect.xmax = x_origin + currWidth;
            currRect.ymin = y_min;
            currRect.ymax = y_max;
            x_origin = currRect.xmax;
            currRect.width = currWidth;
            currRect.color = colorArr[i];
            currRect.height = height_V;
            self.zoneLimits.push(currRect);
            i++;
            j++;
        }
    };

    /**
     * Once you have a list with all the elements to be included in a zone, you must create an object for each of them and add it to this.zoneLimits array, which will be used later to actually draw the graph. With horizontal splits, each subsequent element will be placed under the previous element.
     * 
     * @param {number} startIndex  initial index for traversing this.areasList array
     * @param {number} endIndex    last index for traversing this.areasList array
     * @param {Array}  elementList array of arrays. Each inner array contains 3 values: "height","width" and "area" of the element.
     * @param {number} x           initial value of x coordinate for elements in the current zone
     * @param {number} y           initial value of y coordinate for elements in the current zone
     */
    function addZoneLimitsH(startIndex, endIndex, elementList, x, y) {
        let x_min = x;
        let width_H = elementList[0][1];
        let x_max = x_min + width_H;
        let y_origin = y;
        let i = startIndex;
        let j = 0;
        while (i < endIndex) {
            let element = elementList[j];
            let currHeight = element[0];
            let currRect = {};
            currRect.gdp = dataGDP[i];
            currRect.name = dataRegion[i];
            currRect.code = codesArr[i];
            currRect.xmin = x_min;
            currRect.xmax = x_max;
            currRect.ymin = y_origin;
            currRect.ymax = y_origin + currHeight;
            y_origin = currRect.ymax;
            currRect.width = width_H;
            currRect.color = colorArr[i];
            currRect.height = currHeight;
            self.zoneLimits.push(currRect);
            i++;
            j++;
        }
    };

    /**
     * Returns maximum ratio for a zone. Always a number > 1
     * 
     * @param   {Array}  elementsList array of arrays. Each inner array contains 3 values: "height","width" and "area" of the element.
     * @returns {number} 
     */
    function maxRatio(elementsList) {
        let maxRatio = 0;
        for (let i = 0; i < elementsList.length; i++) {
            let curr = elementsList[i];
            let currRatio = max(curr[0] / curr[1], curr[1] / curr[0]);
            if (currRatio > maxRatio) {
                maxRatio = currRatio;
            }
        }
        return maxRatio;
    };
    /**
     * Function to deep copy and array of arrays
     * @param   {Array} arrayToCopy
     * @returns {Array} array of arrays
     */
    function copyArray(arrayToCopy) {
        //create deep copy of array of arrays
        let copyOfArray = new Array(arrayToCopy.length);
        for (let i = 0; i < arrayToCopy.length; i++) {
            let element = arrayToCopy[i].slice();
            copyOfArray[i] = element;
        }
        return copyOfArray;
    };

    let calculateLayouts = createNewZone(layout.margin_left, layout.margin_top, 0);

    /**
     * When a mouse is over one of the rectangles drawn in the canvas, draw a black border around it, and show tooltip for the country being hovered if the paramenter level == 1.
     * 
     * @param {number} mx X position of the mouse
     * @param {number} my Y position of the mouse
     */
    function mouseOver(mx, my) {
        for (let i = 0; i < self.zoneLimits.length; i++) {
            let currObj = self.zoneLimits[i];
            if (mx > currObj.xmin && mx < currObj.xmax &&
                my > currObj.ymin && my < currObj.ymax) {
                push();
                stroke(0);
                noFill();
                rect(currObj.xmin, currObj.ymin, currObj.width, currObj.height);
                fill(0);
                textSize(layout.nameSize);
                let nameSize = textWidth(currObj.name);
                let id = currObj.name;
                if (level == 1 && nameSize >= 0.8 * currObj.width) {
                    id = currObj.code;
                }
                let textW = textWidth(id);
                if (level == 1 && textW >= 0.8 * currObj.width) {
                    //if the name is still too large even with the country code, then write vertically
                    let newX0 = (currObj.xmax + currObj.xmin) / 2;
                    let newY0 = (currObj.ymax + currObj.ymin) / 2;
                    translate(newX0, newY0);
                    rotate(-PI / 2);
                    text(id, -textW / 2, layout.nameSize / 2);
                } else {
                    text(id, (currObj.xmax + currObj.xmin - textW) / 2, (currObj.ymax + currObj.ymin + layout.nameSize) / 2);
                }
                pop();
                if (level == 1) {
                    drawTooltip(currObj, mx, my);
                }
                return;
            }
        }
    };

    /**
     * Function to draw the tooltip with information of the country
     * 
     * @param {object} element object stored in this.zoneLimits
     * @param {number} mx      X position of the mouse
     * @param {number} my      Y position of the mouse
     */
    function drawTooltip(element, mx, my) {
        let country = "Country: " + element.name;
        let gdp = "GDP-PPP: " + element.gdp.toFixed(4);
        let maxWidth = max(textWidth(country), textWidth(gdp)) * 1.2;
        let theight = layout.tooltipSize * 5;
        let tooltip = country + "\n" + gdp + "\nYear: 2017";
        let rxpos = mx + 10; //rectangle position x
        let rypos = my - 60; //rectangle position y
        if (mx > 850) {
            //if the mouse x pos is over 850, draw the tooltip to 
            //the left of the mouse, to keep tooltip inside graph
            rxpos = mx - 10 - maxWidth;
        }
        if (my < 140) {
            //if the mouse y pos is less than 140, draw the tooltip  
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
    };

    /**
     * Function to draw the title of the current graph depending on the selected region
     */
    function drawTitle() {
        push();
        textSize(layout.titleSize);
        let textW = textWidth(title);
        let xpos = (width + layout.margin_left - textW) / 2;

        text(title, xpos, layout.marginTitle);
        pop();
    };


    /**
     * Function to draw all the rectangle elements stored in this.zoneLimits inside the canvas
     */
    this.draw = function () {
        for (let i = 0; i < self.zoneLimits.length; i++) {
            push();
            let currObj = self.zoneLimits[i];
            fill(currObj.color);
            noStroke();
            if (level == 1) {
                stroke(255);
            }
            rect(currObj.xmin, currObj.ymin, currObj.width, currObj.height);
            fill(0);
            noStroke();
            textSize(layout.nameSize);
            let nameSize = textWidth(currObj.name);
            let id = currObj.name;
            if (level == 1 && nameSize >= 0.8 * currObj.width) {
                id = currObj.code;
            }
            let textW = textWidth(id);
            if (level == 1 && textW >= 0.8 * currObj.width) {
                //if the name is still too large even using the country code, write text vertically
                let newX0 = (currObj.xmax + currObj.xmin) / 2;
                let newY0 = (currObj.ymax + currObj.ymin) / 2;
                translate(newX0, newY0);
                rotate(-PI / 2);
                text(id, -textW / 2, layout.nameSize / 2);
            } else {
                text(id, (currObj.xmax + currObj.xmin - textW) / 2, (currObj.ymax + currObj.ymin + layout.nameSize) / 2);
            }
            pop();
        }
        drawTitle();
        mouseOver(mouseX, mouseY);
    };
}
