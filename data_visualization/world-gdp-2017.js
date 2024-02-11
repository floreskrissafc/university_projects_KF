function WorldGDP() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'World GDPs 2017';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'world-gdp-2017';
    // Property to represent whether data has been loaded.
    let loadedData = false;
    //Graph data
    let data;
    let defaultChart; //chart to be shown when the visualization is loaded, shows regions, not countries
    let regions; // array of strings
    let treeChartObj; // specific chart for a region
    let graphTitle;
    let defaultTitle = "World GDP by regions";
    let backButton;
    let self = this;
    let colorsHighEnd = [[244, 71, 127], [168, 88, 211], [244, 162, 29],
                          [0, 189, 98], [0, 155, 216], [170, 54, 114], [255, 93, 53]];
    let colorsLowEnd = [[224, 208, 214], [205, 194, 211], [244, 232, 212],
                          [166, 216, 192], [175, 205, 216], [234, 199, 217], [255, 214, 204]];

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        //        var self = this;
        data = loadTable(
            './data/world-gdp-2017/world-gdp-2017.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                loadedData = true;
            });
    };

    this.setup = function () {
        push();
        let regionsData = data.getColumn("Region"); //this will contain the same regions several times
        regionsData = new Set(regionsData); // remove the repeating regions
        regionsData = Array.from(regionsData); //create array to traverse the regions
        regions = regionsData;
        graphTitle = defaultTitle; //changes when a specific region is clicked.
        defaultChart = createDefault();
        treeChartObj = defaultChart;
        backButton = createButton('❮ BACK');
        backButton.class("back-button");
        backButton.style('display', "none");
        backButton.position(380, 30);
        backButton.mousePressed(goBack);
    };

    this.destroy = function () {
        backButton.remove();
        pop();
    };

    this.draw = function () {
        if (!loadedData) {
            console.log('Data not yet loaded');
            return;
        }
        let str1 = defaultTitle;
        let str2 = graphTitle;
        treeChartObj.draw();
        if (mouseX > 70 && mouseX < width && mouseY > 70 && mouseY < height && str1.localeCompare(str2) == 0) {
            //if the mouse is inside the drawing zone and the 
            //plot being shown is the default, then show cursor hand because these zones are clickable
            cursor(HAND);
        } else {
            //when plotting something besides the default chart, show cursor arrow because there is no more to show if you click the areas
            cursor(ARROW);
        }
    };

    /**
     * private function, used when user clicks the back button, then the default chart must be used
     * 
     */
    function goBack() {
        backButton.style('display', "none");
        treeChartObj = defaultChart;
        graphTitle = defaultTitle;
    };

    /**
     * When a mouse click is detected by the canvas and the visualization being drawn is WorldGDP, this function checks if the mouse was inside the drawing zone and should update the pointer's shape and display the back button
     */
    this.onClick = function () {
        let str1 = defaultTitle;
        let str2 = graphTitle;
        if (mouseX > 70 && mouseX < width && mouseY > 70 && mouseY < height && str1.localeCompare(str2) == 0) {
            let clickedRegion = checkClickedRegion(mouseX, mouseY);
            let newChart = createTreeChart(clickedRegion);
            treeChartObj = newChart;
            graphTitle = newChart.title;
            backButton.style('display', "inline");
        }
    };
    /**
     * Private function to return the name of the region that was clicked 
     * 
     * @param   {number} mx Mouse X position
     * @param   {number} my Mouse Y position
     * @returns {string} Name of the zone that was clicked
     */
    function checkClickedRegion(mx, my) {
        let currentZones = defaultChart.zoneLimits;
        for (let i = 0; i < currentZones.length; i++) {
            let zone = currentZones[i]; //an object
            let xmin = zone.xmin;
            let xmax = zone.xmax;
            let ymin = zone.ymin;
            let ymax = zone.ymax;
            if (mx > xmin && mx < xmax && my > ymin && my < ymax) {
                return zone.name;
            }
        }
    };
    /**
     * Private function to create a new TreeChart object when a region in the DefaultChart is clicked
     * 
     * @param   {string}    region Name of the region to be shown
     * @returns {TreeChart} new TreeChart object for the selected region
     */
    function createTreeChart(region) {
        let colorIndex = defaultChart.zoneNames.indexOf(region);
        let colorHigh = colorsHighEnd[colorIndex];
        let colorLow = colorsLowEnd[colorIndex];
        let dataForRegion = data.findRows(region, "Region");
        let countries = getColumnFiltered("country", dataForRegion);
        let countryCodes = getColumnFiltered("country-code", dataForRegion);
        let gdpCountries = getColumnFiltered("GDP-PC-PPP", dataForRegion);
        for (let i = 0; i < gdpCountries.length; i++) {
            //loop to make the values for GDP a number
            gdpCountries[i] = Number(gdpCountries[i]);
        }
        let colors = mapColor(colorHigh, colorLow, gdpCountries);
        let title = region + " GDPs";
        let newChart = new TreeChart(gdpCountries, countries, 1, title, colors, countryCodes);
        return newChart;
    };
    /**
     * private function to get all the elements of the column "columnName" from an array of p5 Table rows
     * 
     * @param   {string} columnName name of the column to filter from each of the p5 row elements
     * @param   {Array}  rowArray   array of p5 row objects
     * @returns {Array}  array containing the values stored in a specific column of each p5 row element.
     */
    function getColumnFiltered(columnName, rowArray) {
        let filteredColumn = [];
        for (let i = 0; i < rowArray.length; i++) {
            filteredColumn.push(rowArray[i].get(columnName));
        }
        return filteredColumn;
    };

    /**
     * private function to get an array of p5 color elements for each country in the TreeChart object. It must map the GDP of each country to obtain the appropriate color for the visualization.
     * 
     * @param   {Array} darkColor  Array containing 3 values [R ,G, B]. Represents the dark version of the color
     * @param   {Array} lightColor Array containing 3 values [R ,G, B]. Represents the light version of the color
     * @param   {Array} gdpValues  Array of numbers
     * @returns {Array} Array of p5 color objects.
     */
    function mapColor(darkColor, lightColor, gdpValues) {
        //function to map a country GDP to a specific region color
        let minGDP = min(gdpValues); //a number
        let maxGDP = max(gdpValues); //a number
        let colors = new Array(gdpValues.length);
        for (let i = 0; i < gdpValues.length; i++) {
            let currGDP = gdpValues[i]; //a number
            let R = map(currGDP, minGDP, maxGDP, lightColor[0], darkColor[0]);
            let G = map(currGDP, minGDP, maxGDP, lightColor[1], darkColor[1]);
            let B = map(currGDP, minGDP, maxGDP, lightColor[2], darkColor[2]);
            colors[i] = color(R, G, B);
        }
        return colors;
    };

    /**
     * private function to create a TreeChart object for the default visualization, the first one that is loaded, it shows regions, not countries. This object uses the average GDP for each region to calculate the area that they should cover.
     * 
     * @returns {TreeChart} 
     */
    function createDefault() {
        let avgGDPs = new Array(regions.length);
        for (let i = 0; i < avgGDPs.length; i++) {
            let currRegion = regions[i];
            let rowsByRegion = data.findRows(currRegion, "Region");
            let gdpsByRegion = getColumnFiltered("GDP-PC-PPP", rowsByRegion); //only filter the values for GDPs
            let sum = 0;
            let len = gdpsByRegion.length;
            for (let j = 0; j < len; j++) {
                sum += Number(gdpsByRegion[j]);
            }
            let avg = sum / len;
            avgGDPs[i] = avg;
        }
        let reg = regions.slice(0);
        let sorted = sortDefaultValues(avgGDPs, reg); //sort the avg GDPs because the data might be unsorted after calculating the average for each region, and the algorithm for the treeChart needs data sorted for highest to lowest.
        let colors = new Array(colorsHighEnd.length);
        for (let i = 0; i < colorsHighEnd.length; i++) {
            let colorArr = colorsHighEnd[i];
            let currColor = color(colorArr[0], colorArr[1], colorArr[2]);
            colors[i] = currColor;
        }
        let chart = new TreeChart(sorted[0], sorted[1], 0, defaultTitle, colors, []);
        return chart;
    };
    /**
     * private function to sort the GDPs and the corresponding region's name 
     * @param   {Array} gdp        Array of numbers, each one the average GPD of a region
     * @param   {Array} regionsArr array of strings, stores the name of each region 
     * @returns {Array} sorted version of the arguments
     */
    function sortDefaultValues(gdp, regionsArr) {
        for (let i = 0; i < gdp.length; i++) {
            let currGDP = gdp[i];
            let currReg = regionsArr[i];
            let j = i - 1;
            while (currGDP > gdp[j] && j >= 0) {
                let tempGDP = gdp[j];
                let tempReg = regionsArr[j];
                gdp[j] = currGDP;
                regionsArr[j] = currReg;
                gdp[j + 1] = tempGDP;
                regionsArr[j + 1] = tempReg;
                j--;
            }
        }
        return [gdp, regionsArr];
    };
}
