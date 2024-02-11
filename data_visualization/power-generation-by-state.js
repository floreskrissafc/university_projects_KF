function PowerGenerationByState() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Total Electric Power Generation by State, USA';
    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'power-generation-by-state';

    // Property to represent whether data has been loaded.
    let loaded = false;
    let loadedStates = false; // boolean for data about States names/abbr

    // Graph private variables.
    let pad = 20;
    let state1; // string, name of the first selected State
    let state2; // string, name of the second selected State
    let lineChart; //LineChart object
    let startYear; //html select element for starting year
    let endYear; //html select element for ending year
    let color1; //colorPicker element for State1
    let color2; //colorPicker element for State2
    let sourceLink;
    let sourcesList;
    let statesList;
    let yearsList;
    let shape = 0; //integer 0,1 or 2, to draw different shapes for the plot points
    let statesAbbr;
    let startYearId = "startYear"; //id for startYear element
    let endYearId = "endYear"; //id for endYear element
    let minYear; // integer, minimum year available
    let maxYear; //integer, maximum year available
    let prevSY; //previously valid startYear value
    let prevEY; //previously valid endYear value
    let startYearSelect; //input html element
    let endYearSelect; //input html element
    let selectState1; //select html element
    let selectState2; //select html element
    let selectSource; //select html element
    let labels;
    let label1; //html label
    let label2; //html label
    let label3; //html label
    let saveButton; //html button element
    let randomButton; //html button element
    let timeout; // timeout element for user input
    let self = this;
    let data;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function () {
        statesAbbr = loadTable(
            './data/power-generation-by-state/states-abbr.csv', 'csv', 'header',
            // Callback function to set the value
            // loadedStates to true.
            function (table) {
                loadedStates = true;
            });
        data = loadTable(
            './data/power-generation-by-state/total-electric-power-industry.csv', 'csv', 'header',
            // Callback function to set the value
            // loaded to true.
            function (table) {
                loaded = true;
            });
    };

    this.setup = function () {
        push();
        createSelectors();
        prevSY = parseInt(startYearSelect.value());
        prevEY = parseInt(endYearSelect.value());
        minYear = parseInt(startYearSelect.value());
        maxYear = parseInt(endYearSelect.value());
        let firstYear = document.getElementById(startYearId);
        let endYear = document.getElementById(endYearId);
        timeout = null;
        //keyup event listener code based on https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
        firstYear.addEventListener("keyup", function (e) {
            //when user inputs a year, the program must check if what was written is valid.
            //this function will validate the user input after 500ms of their last input, 
            //to give some time to the user to be able to write a 4 character year number, 
            //so the program seems to wait until the user has finished typing before validating the input.
            clearTimeout(timeout);
            timeout = setTimeout(validateStart, 500);
        });
        endYear.addEventListener("keyup", function (e) {
            clearTimeout(timeout);
            timeout = setTimeout(validateEnd, 500);
        });
        labels = ["Year", "10^9 Watts per hour (GW/h)"];
        newPlot();
        createSouce();
    };

    this.destroy = function () {
        selectState1.remove();
        selectState2.remove();
        label1.remove();
        label2.remove();
        selectSource.remove();
        label3.remove();
        startYearSelect.remove();
        endYearSelect.remove();
        color1.remove();
        color2.remove();
        sourceLink.remove();
        saveButton.remove();
        randomButton.remove();
        pop();
    };

    this.draw = function () {
        if (!loaded || !loadedStates) {
            console.log('Data not yet loaded');
            return;
        }
        //create a new plot if any of the selector changes values
        selectState1.changed(newPlot);
        selectState2.changed(newPlot);
        selectSource.changed(newPlot);
        startYearSelect.changed(validateStart);
        endYearSelect.changed(validateEnd);
        color1.changed(newPlot);
        color2.changed(newPlot);
        //-------
        lineChart.draw();
    };

    /**
     * When a mouse click is detected by the canvas, and this is the visualization being showed, checks if the mouse was inside the drawing zone and updates the shape of the points
     */
    this.onClick = function () {
        if (mouseX >= 45 && mouseX <= 879 && mouseY >= 50 && mouseY <= 526) {
            shape = (shape + 1) % 3;
            newPlot();
        }
    };

    /**
     * Function to alert user if the year written in the endYear input element is a valid or not according to the data that was loaded, if it was not valid, then it automatically adjust the year to the last valid input.
     */
    function validateEnd() {
        let endYear = document.getElementById(endYearId);
        let minEnd = parseInt(startYearSelect.value()) + 1;
        if (!endYear.checkValidity()) {
            //if the number that was written is not valid
            alert("End year must be a number between " + minEnd +
                " and " + maxYear);
            endYearSelect.value(prevEY);
        }
        //save the previous valid endYear in prevEY
        //so you can go back to it if the next input is invalid
        prevEY = parseInt(endYearSelect.value());
        newPlot();
    };

    /**
     * Function to alert user if the year written in the startYear input element is a valid or not according to the data that was loaded, if it was not valid, then it automatically adjust the year to the last valid input.
     */
    function validateStart() {
        if (prevSY == parseInt(startYearSelect.value())) {
            //if the "change" event is triggered after the "keyup" event, then
            //it is not necessary to draw a new Plot since it has the same data
            return;
        }
        let startYear = document.getElementById(startYearId);
        if (!startYear.checkValidity()) {
            //if the number that was written is not valid
            alert("Start year must be a number between " + minYear +
                " and " + (maxYear - 1));
            startYearSelect.value(prevSY);
        }
        //save the previous valid startYear in prevSY
        //so you can go back to it if the next input is invalid
        prevSY = parseInt(startYearSelect.value());
        //update the min value for the ending Year, it must be at least 1 year bigger than startYear.
        endYearSelect.attribute("min", prevSY + 1);
        let currStart = parseInt(startYearSelect.value());
        let currEnd = parseInt(endYearSelect.value());
        if (currEnd <= currStart) {
            //always make endYear bigger than starting year, automatically update values on plot to adjust
            endYearSelect.value(currStart + 1);
            validateEnd();
        }
        newPlot();
    };

    /**
     * If any of the selectors or input elements in the graph is changed, this function updates the global variables and calls createLineChart
     */
    function newPlot() {
        state1 = selectState1.value();
        state2 = selectState2.value();
        source = selectSource.value();
        startYear = parseInt(startYearSelect.value());
        endYear = parseInt(endYearSelect.value());
        startYearSelect.attribute("value", parseInt(startYearSelect.value()));
        endYearSelect.attribute("value", parseInt(endYearSelect.value()));
        lineChart = createLineChart(source, startYear, endYear, labels);
    };

    /**
     * Create a new LineChart object
     * 
     * @param   {string}   source    name of the type of source to filter data
     * @param   {number}   startYear number on startYear input element
     * @param   {number}   endYear   number on endYear input element
     * @param   {Array}    labels    Array with 2 entries, both strings. They represent the names of the x and y axis respectively
     * @returns {LineChart} 
     */
    function createLineChart(source, startYear, endYear, labels) {
        // state1, state2 and source are strings, obtained from the selectors
        //startYear and endYear are integers, obtained from selectors
        //this method will return a new LineChart object
        let filterBySource = data.findRows(source, "ENERGY SOURCE"); //this is an array of table Row objects
        let state1Data = filterStateData(state1, filterBySource);
        let state1X = state1Data[0]; // x-axis data for state 1
        let state1Y = state1Data[1]; // y-axis data for state 1
        let state2Data = filterStateData(state2, filterBySource); // y-axis data for state 2
        let state2X = state2Data[0]; // x-axis data for state 2
        let state2Y = state2Data[1]; // y-axis data for state 2
        let lineChart = new LineChart(state1X, state1Y, state2X, state2Y, color1.color(), color2.color(), labels, state1, state2, startYear, endYear, shape);
        return lineChart;
    };
    /**
     * Function to create all selector and input elements to show in graph
     */
    function createSelectors() {
        //position variables
        let padlabel = (pad + 2);
        let label1X = 440;
        let label2X = 630;
        let label3X = 820;
        let state1X = 490;
        let state2X = 680;
        let sourceX = 910;
        let ypos = height - 20; //year selectors Y position
        let xposLeft = 360; //start year X position
        let xposRight = width + 115; //end year X position
        //----------------
        let states = statesAbbr.getColumn("State");
        states = new Set(states);
        states = Array.from(states);
        statesList = states;
        label1 = createElement("label", "State A");
        label1.attribute("for", "state1");
        label1.position(label1X, padlabel);
        selectState1 = createSelect();
        selectState1.position(state1X, pad);
        selectState1.attribute("id", "state1");
        label2 = createElement("label", "State B");
        label2.attribute("for", "state2");
        label2.position(label2X, padlabel);
        selectState2 = createSelect();
        selectState2.position(state2X, pad);
        selectState2.attribute("id", "state2");
        for (let i = 0; i < states.length; i++) {
            selectState1.option(states[i]);
            selectState2.option(states[i]);
        }
        selectState1.selected("California"); //default value
        selectState2.selected("New York"); //default value

        //create selector for type of energy and its label
        let sources = data.getColumn("ENERGY SOURCE");
        sources = new Set(sources);
        sources = Array.from(sources);
        sourcesList = sources;
        selectSource = createSelect();
        selectSource.position(sourceX, pad);
        selectState1.attribute("id", "source");
        label3 = createElement("label", "Energy Source");
        label3.attribute("for", "source");
        label3.position(label3X, padlabel);
        for (let i = 0; i < sources.length; i++) {
            selectSource.option(sources[i]);
        }
        selectSource.selected("Total"); //default value

        //create selectors for start and end years
        let years = data.getColumn("YEAR");
        years = new Set(years);
        years = Array.from(years);
        yearsList = years; //save for later use in random generator
        let minYear = parseInt(years[0]);
        let maxYear = parseInt(years[years.length - 1]);

        startYearSelect = createInput();
        startYearSelect.position(xposLeft, ypos);
        startYearSelect.size(40);
        startYearSelect.attribute("id", "startYear");
        startYearSelect.attribute("value", minYear); //default
        startYearSelect.attribute("type", "number");
        startYearSelect.attribute("min", minYear);
        startYearSelect.attribute("max", maxYear - 1);
        startYearSelect.attribute("required", true);

        endYearSelect = createInput();
        endYearSelect.size(40);
        endYearSelect.position(xposRight, ypos);
        endYearSelect.attribute("id", "endYear");
        endYearSelect.attribute("value", maxYear); //default
        endYearSelect.attribute("type", "number");
        endYearSelect.attribute("min", minYear + 1);
        endYearSelect.attribute("max", maxYear);
        endYearSelect.attribute("required", true);
        // create color pickers
        let colorX = 1200;
        let color1Y = height / 2 - 30;
        let color2Y = height / 2 + 30;
        color1 = createColorPicker('#eb3465');
        color1.position(colorX, color1Y);
        color2 = createColorPicker('#048c3f');
        color2.position(colorX, color2Y);
        //create button to save canvas
        saveButton = createButton("Save Graph");
        saveButton.position(360, 600);
        saveButton.mousePressed(saveCurrentCanvas);
        saveButton.class("btnLineChart");
        //create button to get random graph 
        randomButton = createButton("I'm feeling lucky!");
        randomButton.position(480, 600);
        randomButton.mousePressed(generateRandom);
        randomButton.class("btnLineChart");
    };
    /**
     * Generate a random selection of States and energy source and create a new graph
     */
    function generateRandom() {
        let len1 = statesList.length;
        let random1 = floor(random(len1));
        let random2 = floor(random(len1));
        while (random2 == random1) {
            random2 = floor(random(len1));
        }
        let len2 = sourcesList.length;
        let random3 = floor(random(len2));
        let len3 = yearsList.length - 1;
        let State1 = statesList[random1];
        let State2 = statesList[random2];
        let Source = sourcesList[random3];
        selectState1.selected(State1);
        selectState2.selected(State2);
        selectSource.selected(Source);
        startYearSelect.value(parseInt(yearsList[0]));
        endYearSelect.value(parseInt(yearsList[len3]));
        prevSY = parseInt(startYearSelect.value());
        prevEY = parseInt(endYearSelect.value());
        newPlot();
    };
    /**
     * Function to filter the data for a specific State given its name
     * @param   {string} stateName     Name of the State selected to filter data from Table
     * @param   {Array}  TableRowArray array of p5 Table row objects, contains all rows for a particular type of energy source
     * @returns {Array}  values for x and y axis for the specified State
     */
    function filterStateData(stateName, TableRowArray) {
        let abbr = statesAbbr.findRow(stateName, "State");
        abbr = abbr.getString('Abbreviation');
        let valuesY = [];
        let valuesX = [];
        for (let i = 0; i < TableRowArray.length; i++) {
            let currState = TableRowArray[i].getString('STATE');
            let currYear = TableRowArray[i].getNum('YEAR');
            if (abbr.localeCompare(currState) == 0 &&
                currYear >= startYear &&
                currYear <= endYear) {
                //if the current state is the one that needs to be filtered
                let value = TableRowArray[i].getNum('GENERATION (GW/h)');
                valuesY.push(value);
                valuesX.push(currYear);
            }
        }
        return [valuesX, valuesY];
    };

    function createSouce() {
        var source = "https://www.eia.gov/electricity/data/state/";
        sourceLink = createA(source, "Source", "_blank");
        sourceLink.position(width + 200, height - 10);
    };

    function saveCurrentCanvas() {
        saveCanvas('Myplot', 'png');
    };

}
