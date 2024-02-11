function BirthMortalityGDP() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Birth rate, Mortality rate and GDP 2017';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'birth-mortality-gpd';

    // Property to represent whether data has been loaded.
    this.loadedData = false;
    this.loadedColors = false;
    // Graph properties.
    let selectedRegion;
    let dotSizeMin = 30;
    let dotSizeMax = 75;
    let bubbleSound;
    let dotColors;
    let data;
    let selectElement;
    let bubbleChart;
    let colorList;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        let self = this;
        soundFormats('wav');
        bubbleSound = loadSound('./data/extras/bubble-sound.wav');
        // Default visualisation colours.
        dotColors = loadTable(
            './data/extras/color-palette.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                loadedColors = true;
            });
        data = loadTable(
            './data/birth-mortality-gdp/birth-mortality-gdp.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                loadedData = true;
            });
    };

    this.setup = function () {
        push();
        colorList = StrToColor();
        createSelector();
        bubbleChart = createBubbleChart(selectedRegion);
    };

    this.destroy = function () {
        selectElement.remove();
        pop();
    };

    this.draw = function () {
        if (!loadedData || !loadedColors) {
            console.log('Data not yet loaded');
            return;
        }
        let region = selectElement.value();

        if (region.localeCompare(selectedRegion) != 0) {
            //if the user selects a different region than the one already showing
            bubbleChart = createBubbleChart(region);
            selectedRegion = region;
        }
        bubbleChart.draw();
    };

    function createSelector() {
        let regions = data.getColumn("Region");
        regions = new Set(regions);
        regions = Array.from(regions);
        selectElement = createSelect();
        selectElement.position(360, 20);
        for (let i = 0; i < regions.length; i++) {
            selectElement.option(regions[i]);
        }
        selectElement.selected("America (Continent)"); //default chart
        selectedRegion = selectElement.value();
    };

    function createBubbleChart(region) {
        let filteredRows = data.findRows(region, "Region");
        let xAxisData = getColumnFiltered("birth-rate", filteredRows);
        let yAxisData = getColumnFiltered("mortality-rate-infants", filteredRows);
        let diamData = getColumnFiltered("GDP-PC-PPP", filteredRows);
        let countries = getColumnFiltered("country", filteredRows);
        let labels = ["Birth Rate (Live births per 1,000 people)", "Mortality Rate of Infants less than 1 year old per 1000 live birth"];
        let chart = new BubbleChart(xAxisData, yAxisData, diamData, labels, 8, 8, dotSizeMin, dotSizeMax, colorList, countries, bubbleSound);
        return chart;
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
     * Return array of p5 color elements 
     */

    function StrToColor() {
        let colors = [];
        for (let i = 0; i < dotColors.getRowCount(); i++) {
            colors.push(color("rgb(" + dotColors.get(i, 1) + ")"));
        }
        return colors;
    };
}
