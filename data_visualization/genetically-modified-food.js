function GeneticallyModifiedFood() {

    // Name for the visualisation to appear in the menu bar.
    this.name = "GMO Food Impacts Survey: Apr 23 -May 6, 2018";

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'genetically-modified-food';

    // Property to represent whether data has been loaded.
    let loaded = false;
    let data;
    let select; //html select element
    let donut;
    let labels;
    let colours;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        data = loadTable(
            './data/GMOs/GMOs.csv', 'csv', 'header',
            // Callback function to set the value
            // loaded to true.
            function (table) {
                loaded = true;
            });
    };

    this.setup = function () {
        if (!loaded) {
            console.log('Data not yet loaded');
            return;
        }
        push();
        // Create a select DOM element.
        select = createSelect();
        select.position(350, 550);
        // Fill the options with all questions in survey.
        let questions = data.columns;
        for (let i = 1; i < questions.length; i++) {
            select.option(questions[i]);
        }
        donut = new DonutChart(width / 2, height / 2, width * 0.4);
        labels = data.getColumn(0);
        colours = ['blue', 'red', 'green', 'purple', 'yellow'];

    };

    this.destroy = function () {
        select.remove();
        pop();
    };

    this.draw = function () {
        if (!loaded) {
            console.log('Data not yet loaded');
            return;
        }
        let questionAsked = select.value();
        // Get the column of raw data for questionAsked.
        let col = data.getColumn(questionAsked);
        col = stringsToNumbers(col); // Convert all data strings to numbers.
        let title = 'How likely is that GMO foods will ' + questionAsked;
        donut.draw(col, labels, colours, title);
    };
}
