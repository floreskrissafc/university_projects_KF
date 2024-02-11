// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
    // Create a canvas to fill the content div from index.html.
    canvasContainer = select('#app');
    var c = createCanvas(1024, 576);
    c.parent('app');

    // Create a new gallery object.
    gallery = new Gallery();

    // Add the visualisation objects here.
    gallery.addVisual(new TechDiversityRace());
    gallery.addVisual(new TechDiversityGender());
    gallery.addVisual(new PayGapByJob2017());
    gallery.addVisual(new PayGapTimeSeries());
    gallery.addVisual(new ClimateChange());
    gallery.addVisual(new GeneticallyModifiedFood());
    gallery.addVisual(new ElectricPowerGeneration());
    gallery.addVisual(new BirthMortalityGDP());
    gallery.addVisual(new PowerGenerationByState());
    gallery.addVisual(new WorldGDP());

}

function draw() {
    background(255);
    if (gallery.selectedVisual != null) {
        gallery.selectedVisual.draw();
    }
}

function mousePressed() {
    if (gallery.selectedVisual != null) {
        let id = gallery.selectedVisual.id; //a string
        let PGBYid = 'power-generation-by-state';
        let WGDPid = 'world-gdp-2017';
        if (id.localeCompare(PGBYid) == 0 || id.localeCompare(WGDPid) == 0) {
            gallery.selectedVisual.onClick();

        }
    }
}
