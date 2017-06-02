'use strict';

function MainCtrl($scope) {
    const ctrl = this;
    // Initialize a date picker on the specified input element
    var dp_params = {
            // There are two modes: dp-modal (the default) and dp-below
            // dp-modal makes the date picker show up as a modal.
            // dp-below makes it show up beneath its input element.
            mode: 'dp-below',
            // Whether to use Monday as start of the week
            weekStartsMonday: true
        };
    TinyDatePicker(document.querySelector('#date-picking-start'), dp_params);
    TinyDatePicker(document.querySelector('#date-picking-end'), dp_params);

    ctrl.date = {};
}

function LineCtrl($scope, $timeout) {

    $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
    $scope.series = ['Series A', 'Series B'];//sensor's name
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];
    $scope.options = {
        tooltips: {
            mode: 'index',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Month'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                }
            }]
        }
    };

    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };

    /*   // Simulate async data update
     $timeout(function () {
     $scope.data = [
     [28, 48, 40, 19, 86, 27, 90],
     [65, 59, 80, 81, 56, 55, 40]
     ];
     }, 3000);*/
}


function chartDir() {
    return {
        restrict: 'EA',
        replace: true,
        scope: false,
        controllerAs: 'chart',
        link: function ($scope, $element, $attrs) {//манипуляция с DOM

        },
        templateUrl: "dashboard/chart-dir.template.html",
        controller: 'LineCtrl'
    };
}

angular.module('dashboard')

    // Optional configuration for All Charts
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            responsive: false
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
    }])

    .controller("MainCtrl", ['$scope', MainCtrl])
    .controller("LineCtrl", ['$scope', '$timeout', LineCtrl])

    .directive('chartDir', chartDir)

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl'
    });