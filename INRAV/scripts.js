import { dataForTable } from './dataForTable.js';
        
import { cases } from './dataForBarChart.js';

import { statePoints } from './dataForUSMap.js';


// Sort the cases by the amount of money, descending
cases.sort((a, b) => b.moneyAmount - a.moneyAmount); 

let dataForPlot = []; // Array of objects for bar chart

let totalMoneyInvolved = 0;

let statesCaseCount = { FL: 27, TX: 30, NY: 10, CT: 3, MO: 1 };

let statesMoneyCount = {};


for (let i = 0; i < cases.length; i++) {
    dataForPlot.push({
        name: cases[i].accused, // x-value
        y: cases[i].moneyAmount, // y-value
        caseID: cases[i].caseID // Tooltip info
    });

    totalMoneyInvolved += cases[i].moneyAmount;
    let state = cases[i].state;

    if (statesMoneyCount[state]) {
        statesMoneyCount[state] += cases[i].moneyAmount;
    } else {
        statesMoneyCount[state] = cases[i].moneyAmount;
    }
}

let dataForPieChart1 = [];

let dataForPieChart2 = [];

for (const state in statesCaseCount) {
    dataForPieChart1.push({
        name: state,
        y: statesCaseCount[state]
    })
}

for (const state in statesMoneyCount) {
    dataForPieChart2.push({
        name: state,
        y: statesMoneyCount[state]
    })
}

let totalMoney = "$" + totalMoneyInvolved.toLocaleString("en-US");

document.getElementById("formatted-number").textContent = totalMoney;

function adjustYAxisMax(chart) {
    const visibleData = chart.series[0].data.filter(point => !point.visible); // Get the currently visible data
    if (visibleData.length > 0) {
        const yValues = visibleData.map(point => point.y); // Extract y-values
        const maxVisibleValue = Math.max(...yValues); // Find the max value in visible data
        chart.yAxis[0].update({
            max: maxVisibleValue * 1.1 // Set max to 10% above the max value
        });
    }
}

// Function to set marginLeft dynamically based on screen width
function getMarginLeft() {
    return window.innerWidth < 600 ? 40 : 130; // Adjust this breakpoint as needed
}

const bar_chart = Highcharts.chart('bar_chart', {
    chart: {
        type: 'bar',
        backgroundColor: '#202B6E',
        marginLeft: getMarginLeft(),
        events: {
            load: function() {
                adjustYAxisMax(this); // Adjust max on initial load
            },
            redraw: function() {
                adjustYAxisMax(this); // Adjust max on redraw, e.g., after scroll
            }
        }
    },
    title: {
        text: '',
        align: 'center',
        x: 40,
        style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFFFFF'
        }
    },
    xAxis: {
        type: 'category',
        title: {
            text: null
        },
        lineColor: '#FFFFFF',
        labels: {
            style: {
                color: '#FFFFFF',
                textOverflow: 'ellipsis',
                whiteSpace: 'wrap',

            }
        },
        min: 0,
        max: 5,
        scrollbar: {
            enabled: true
        },
        tickLength: 0,
    },
    yAxis: {
        min: 0,
        title: {
            text: null
        },
        lineColor: '#FFFFFF',
        lineWidth: 1,
        labels: {
            enabled: false, // Disable y-axis labels to hide money amounts
        },
        gridLineWidth: 0.2,
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true
            },
            states: {
                hover: {
                    color: '#FF9901'
                }
            }
        }
    },
    tooltip: {
        formatter: function() {
            // Format the involved amount with commas
            const formattedAmount = this.point.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            return `<strong>Accused: </strong> ${this.point.name} <br>
                    <strong>Involved amount: USD </strong> ${formattedAmount} <br>
                    <strong>Case ID: </strong> ${this.point.caseID} <br>`;
        }
    },
    legend: {
        enabled: false
    },
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false
    },
    series: [{
        name: 'asset values',
        data: dataForPlot
    }]
});

adjustYAxisMax(bar_chart);

// Adjust the chart margin on window resize
window.addEventListener('resize', function() {
    bar_chart.update({
        chart: {
            marginLeft: getMarginLeft() // Update marginLeft on resize
        }
    });
});

Highcharts.chart('pie_chart1', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: null,
        align: 'left'
    },
    tooltip: {
        pointFormat: 'Number of Cases: <b>{point.y}</b>'
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    colors: ['#5991AD', '#004561', '#1C7685', '#4F5D2F', '#1F5D2F'],
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true, // Enable data labels
                format: '{point.percentage:.1f} %'
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Number of Cases by State',
        colorByPoint: true,
        data: dataForPieChart1
    }]
});

Highcharts.chart('pie_chart2', {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
    },
    title: {
        text: null,
        align: 'left'
    },
    tooltip: {
        formatter: function() {
            // Format the involved amount with commas
            const formattedAmount = this.point.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            return `Money Involved: <b>USD ${formattedAmount}</b>`;
        }
    },
    accessibility: {
        point: {
            valueSuffix: '%'
        }
    },
    colors: ['#5991AD', '#004561', '#1C7685', '#4F5D2F', '#1F5D2F'],
    plotOptions: {
        pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
                enabled: true, // Enable data labels
                format: '{point.percentage:.1f} %'
            },
            showInLegend: true
        }
    },
    series: [{
        name: 'Value',
        colorByPoint: true,
        data: dataForPieChart2
    }]
});

(async () => {
    const topology = await fetch(
        'https://code.highcharts.com/mapdata/countries/us/us-all.topo.json'
    ).then(response => response.json());

    const dataPoints = statePoints;

    Highcharts.mapChart('map-container', {
        chart: { map: topology },
        title: { text: null },
        legend: { enabled: false },
        mapView: {
            projection: {
                name: 'Miller'
            }
        },
        plotOptions: {
            series: {
                states: {
                    inactive: {
                        enabled: false
                    },
                    hover: {
                        enabled: true
                    }
                }
            },
            mappoint: {
                states: {
                    inactive: {
                        enabled: false
                    },
                    hover: {
                        enabled: true
                    }
                }
            }
        },
        series: [{
            // Main world map
            name: 'Countries',
            borderColor: '#A0A0A0', // Border color for countries
            nullColor: '#202b6e', // Color for countries without data
            enableMouseTracking: false // Disable hover on countries
        }, {
            // Markers
            name: 'Number of cases',
            type: 'mappoint',
            data: dataPoints.map(point => ({
                name: point.name,
                lat: point.lat,
                lon: point.lon,
                cases: point.cases // Include number of cases in data
            })),
            color: '#FF9901', // Marker color                   
            marker: {
                lineWidth: 1,
                lineColor: '#fff',
                symbol: 'mapmarker',
                radius: 8
            },

            dataLabels: {
                enabled: false,
            },
        }],
        tooltip: {
            formatter: function() {
                // Access the cases through options
                return `<strong>${this.point.name}</strong><br>
                            Number of cases: ${this.point.cases}`;
            }
        },
    });
})();

let table; // Declare table variable

function createTable(layoutType) {
    // Destroy existing table if it exists
    if (table) {
        table.destroy();
    }

    // Reinitialize Tabulator with the specified layout
    table = new Tabulator("#tableContainer", {
        layout: layoutType, 
        responsiveLayout: "collapse", 
        rowHeight: 40,
        data: dataForTable,
        pagination:"local",
        paginationSize:10,
        movableColumns:false,
        paginationCounter:"rows",
        columns: [
            { title: "Accused", field: "accused", hozAlign: "center", responsive: 0, headerHozAlign: "center", headerSort:false},
            { title: "Money Involved", field: "moneyAmount", hozAlign: "center", vertAlign: "middle",formatter: "money", responsive: 1, headerHozAlign: "center", headerSort:true },
            { title: "Case ID", field: "caseID", hozAlign: "center", vertAlign: "middle",responsive: 2, headerHozAlign: "center", headerSort:false },
            { title: "State", field: "state", hozAlign: "center",vertAlign: "middle", responsive: 3 , headerHozAlign: "center", headerSort:false},
            { title: "Year", field: "year", hozAlign: "center",vertAlign: "middle", responsive: 4 , headerHozAlign: "center", headerSort:true},
            { title: "Status", field: "caseStatus", hozAlign: "center", vertAlign: "middle",responsive: 5 , headerHozAlign: "center", headerSort:false},
        ],
    });
}

// Add resize event listener
window.addEventListener("resize", function () {
    var containerWidth = document.querySelector("#tableContainer").offsetWidth;

    // Switch layout dynamically based on container width
    if (containerWidth < 900) {
        createTable("fitDataStretch"); // Narrow width layout
    } else {
        createTable("fitColumns"); // Wider width layout
    }
});

// Initial check on page load
var initialWidth = document.querySelector("#tableContainer").offsetWidth;
if (initialWidth < 900) {
    createTable("fitDataStretch");
} else {
    createTable("fitColumns");
}


// Filter for table code
//
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");

//Trigger setFilter function with correct parameters
function updateFilter(){
  var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
  var typeVal = typeEl.options[typeEl.selectedIndex].value;

  if(filterVal){
    table.setFilter(filterVal,typeVal, valueEl.value);
  }
}

//Update filters on value change
document.getElementById("filter-field").addEventListener("change", updateFilter);
document.getElementById("filter-type").addEventListener("change", updateFilter);
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

//Clear filters on "Clear Filters" button click
document.getElementById("filter-clear").addEventListener("click", function(){
  fieldEl.value = "accused";
  typeEl.value = "=";
  valueEl.value = "";
  table.clearFilter();
});


document.getElementById("filter-action").addEventListener("click", function () {
    let searchValue = document.getElementById("search-value").value
        .trim()
        .toLowerCase()
        .normalize("NFD") // Normalize accents/diacritics
        .replace(/[\u0300-\u036f]/g, ""); // Remove diacritic marks

    // Custom filter function
    table.setFilter(function (data, filterParams) {
        // Normalize and clean diacritics in table data for comparison
        const normalizeString = (str) => str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return (
            normalizeString(data.accused).includes(filterParams.value) ||
            normalizeString(data.caseID).includes(filterParams.value)  ||
            normalizeString(data.state).includes(filterParams.value)   ||
            normalizeString(data.caseStatus).includes(filterParams.value) 
        );
    }, { value: searchValue }); // Pass the normalized search value
});
