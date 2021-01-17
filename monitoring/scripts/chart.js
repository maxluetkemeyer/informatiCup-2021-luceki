/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

window.chartColors = {
	red: "rgb(255, 99, 132)",
	orange: "rgb(255, 159, 64)",
	yellow: "rgb(255, 205, 86)",
	green: "rgb(75, 192, 192)",
	blue: "rgb(54, 162, 235)",
	purple: "rgb(153, 102, 255)",
	grey: "rgb(201, 203, 207)"
};


var config = {
    type: "line",
    data: {
        labels: ["lu", "ce", "ki"],
        datasets: [{
            label: "Calculation time (ms)",
            backgroundColor: "#C5C5C5",
            borderColor: "#C5C5C5",
            data: [
                0,
                0,
                0,
            ],
            fill: false,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point:{
                radius: 0
            }
        },
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        },
        legend: {
            display: false
        },
        title: {
            display: false,
        },
        tooltips: {
            mode: "index",
            intersect: false,
        },
        hover: {
            mode: "nearest",
            intersect: true
        },
        scales: {
            xAxes: [{
                display: false
            }],
            yAxes: [{
                display: false
            }]
        }
    }
};

window.onload = function() {
    var chartCtx = document.getElementById("timeLeftChart").getContext("2d");
    window.myLine = new Chart(chartCtx, config);
};
/*
document.getElementById('randomizeData').addEventListener('click', function() {
    config.data.datasets.forEach(function(dataset) {
        dataset.data = dataset.data.map(function() {
            return randomScalingFactor();
        });

    });

    window.myLine.update();
});

var colorNames = Object.keys(window.chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
    var colorName = colorNames[config.data.datasets.length % colorNames.length];
    var newColor = window.chartColors[colorName];
    var newDataset = {
        label: 'Dataset ' + config.data.datasets.length,
        backgroundColor: newColor,
        borderColor: newColor,
        data: [],
        fill: false
    };

    for (var index = 0; index < config.data.labels.length; ++index) {
        newDataset.data.push(randomScalingFactor());
    }

    config.data.datasets.push(newDataset);
    window.myLine.update();
});
*/

/**
 * Adds data to the chart
 * @param {number} value Calculation time
 */
const addTableData = (value) => {
    if (config.data.datasets.length > 0) {
        
        config.data.labels.push("Round "+round);

        config.data.datasets.forEach(function(dataset) {
            dataset.data.push(value);
        });

        window.myLine.update();
    }
    if(config.data.labels.length > 20){
        config.data.labels.splice(0, 1); // remove the label first

        config.data.datasets.forEach(function(dataset) {
            //dataset.data.pop();
            dataset.data.splice(0, 1);
        });

        window.myLine.update();
    }
};
/*
document.getElementById('removeDataset').addEventListener('click', function() {
    config.data.datasets.splice(0, 1);
    window.myLine.update();
});

document.getElementById('removeData').addEventListener('click', function() {
    config.data.labels.splice(-1, 1); // remove the label first

    config.data.datasets.forEach(function(dataset) {
        dataset.data.pop();
    });

    window.myLine.update();
});*/
