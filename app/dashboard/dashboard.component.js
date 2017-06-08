'use strict';

function MainCtrl($scope, locationName) {
    const ctrl = this;

    function Dates() {

        let oneDay = 24 * 60 * 60 * 1000;
        let today = new Date();

        this.today = today;
        this.start = today;
        this.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, today.getHours(), today.getMinutes());

        this.getPeriod = function () {
            return Math.round((this.end - this.start) / (oneDay));
        };
        this.margin = Math.round((this.start - this.today) / (oneDay));

    }


    // init
    $scope.charts = [1]; /// array with chars id's
    $scope.dates = new Dates();
    $scope.sensors = [[]];//todo:improve

    $scope.location = locationName;

    // work with weather data
    // create array of objects
    let weatherData = ctrl.sensorsNames.map((item) => {
        return {
            name: item,
            values: []
        }
    });

    // fill array of objects
    ctrl.weatherData.forEach(function (item, i) {// item - day's weather object
        ctrl.sensorsNames.forEach(function (sensor, j) {
            weatherData[j].values.push(item[sensor]);
        })
    });

    $scope.weatherDataValues = weatherData;


    // functions for actions with the charts
    $scope.addChart = () => {
        let length = $scope.charts.length;
        if (length < 4) {
            $scope.charts.push(($scope.charts[length - 1] + 1));
            $scope.sensors.push([]);
        }
        else throw new Error("Достигнуто максимальное количество графиков");
    };

    $scope.removeChart = (index) => {
        let length = $scope.charts.length;
        let first = 0;

        if (length > 1)
            switch (index) {
                case length - 1: {
                    $scope.charts = $scope.charts.slice(0, index);
                    $scope.sensors.pop();
                    break;
                }
                case first: {
                    $scope.charts = $scope.charts.slice(1);
                    $scope.sensors.shift();
                    break;
                }
                default: {
                    let begin = $scope.charts.slice(0, index);
                    let end = $scope.charts.slice(index + 1);
                    $scope.charts = begin.concat(end);
                    $scope.sensors.splice(index, 1);
                }
            }
        else  throw new Error("Нельзя убрать единственный график!");
    };

}

function chartDir() {
    return {
        restrict: 'E',
        scope: {
            dashboardDates: '=',
            dashboardDataValues: '=',
            chartId: '@',
            chartOrder: '@',
            chartRemove: '=',
            cdSensors: '=',
            cdSensorsAllData: '='
        },
        replace: false,
        controller: function ($scope) {

            function watchDates(newValue, oldValue) {
                //обработка исключительных ситуации greate if's wall todo: improve it
                if (newValue.start === null || newValue.end === null) {
                    throw new Error('Нужно выбрать даты, чтобы начать построение графиков!');
                }//todo: improve errors displaying

                if (oldValue.start === null || oldValue.end === null) {
                    $scope.labels = createLabels(newValue);
                    return;
                }

                if (newValue.start < newValue.today){
                    throw new Error('Нельзя выбрать дату из прошлого!');
                }

                if (newValue.getPeriod($scope.dashboardDates.today, $scope.dashboardDates.end) > 13){
                    throw new Error('Нет данных, дальше чем за 2 недели!')
                }



                var oldPeriod = oldValue.getPeriod();
                var newPeriod = newValue.getPeriod();
                var difference = newPeriod - oldPeriod;
                var i;

                if (newPeriod < 1)
                    throw new Error('Для рассчётов, нужно чтобы был выбран период хотя бы из 2-х дней!');



                if (difference > 0) {// если разница больше, период увеличился
                    if (oldValue.start > newValue.start) {
                        //старт сдвинулся  влево
                        for (i = 1; i <= difference; i++)
                            $scope.labels.unshift(createLabel(oldValue, -i));
                    } else {
                        //конец cдвинулся  вправо
                        for (i = 1; i <= difference; i++)
                            $scope.labels.push(createLabel(newValue, oldPeriod + i));
                    }
                } else {
                    if (oldValue.start < newValue.start) {
                        //старт сдвинулся  вправо
                        for (; difference < 0; difference++){
                            $scope.labels.shift();

                        }

                    } else {
                        //конец cдвинулся  влево
                        for (; difference < 0; difference++)
                            $scope.labels.pop();
                    }
                }

            }

            function watchSensors() {
                var sensorsNames = [];
                var dataset = [];
                var data = [];
                var options = {fill: false};
                var sensors = $scope.cdSensors[$scope.chartOrder - 1];



                if(sensors.length < 1){ // crutch
                    $scope.data = [0];
                    $scope.options.legend.display = false;
                    return;
                }


                sensors.forEach(function (item, i) {
                    sensorsNames.push(item.name);
                    dataset.push(options);
                    $scope.dashboardDataValues.forEach(function (sensor, j) {
                        if(sensor.name == item.name){
                            data.push(sensor.values);
                        }
                    });
                });

                $scope.series = sensorsNames; //array of sensor's names

                dataset.length == 0
                    ? $scope.dataset = undefined
                    : $scope.dataset = dataset; //todo: it isn't works

                /*($scope.dashboardDates.start, $scope.dashboardDates.end)*/
                $scope.data = data;
                $scope.options.legend.display = true;
                $scope.status = $scope.cdSensors[$scope.chartOrder - 1].length;
            }


            function createLabel(date, days) {
                return new Date(date.start.getFullYear(), date.start.getMonth(), date.start.getDate() + days).toLocaleDateString();
            }

            function createLabels(date) {
                var labels = [];
                var period = date.getPeriod();

                for (var i = 0; i <= period; i++) {
                    labels.push(createLabel(date, i));
                }

                return labels;
            }

            // init
            $scope.labels = createLabels($scope.dashboardDates);

            // chart init
            $scope.type = 'line';
            $scope.colors = [
                '#97BBCD', // blue
                '#DCDCDC', // light grey
                '#F7464A', // red
                '#46BFBD', // green
                '#FDB45C', // yellow
                '#949FB1', // grey
                '#4D5360'  // dark grey
            ]; // default colors

            $scope.options = {
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Day'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                },
                legend: {display: true}
            };

            // action-functions for chart
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

            $scope.changeColour = function (index) {
                $scope.colors.splice(index, 1, '#000000');
            };



            // Watchers
            $scope.$watch('dashboardDates', watchDates, true);
            $scope.$watchCollection('cdSensors[chartOrder-1]', watchSensors);
        },
        templateUrl: "dashboard/chart-dir.template.html"
    }
}

function sensorsDir() {
    return {
        restrict: 'E',
        scope: {
            sensorsAll: '=',
            sensorsAllData: '=',
            sensorsOrigin: '@'
        },
        controller: ['$scope', function ($scope) {
            var sensorsList = $scope.sensorsAllData.map((item, i) => {
                return {
                    name: item,
                    id: i
                }
            });

            // sensors
            var reachedSensorsMax = function (item) {
                throw new Error("Достигнуто максимальное количество сенсоров");// todo: improve handling
            };

            var selectSensor = function (option) {
                sensorsList.forEach(function (item, i) {
                    if (option.id == item.id)
                        option.name = item.name;
                });
            };

            // configure sensors
            $scope.sensorsDropdownModel = $scope.sensorsAll[$scope.sensorsOrigin - 1];
            $scope.sensorsDropdownData = sensorsList;
            $scope.sensorsDropdownSettings = {
                /*showEnableSearchButton: true,*/
                idProp: 'id',
                displayProp: 'name',
                searchField: 'name',
                enableSearch: true,
                selectionLimit: 4,
                selectedToTop: true,
                showCheckAll: false
            };
            $scope.sensorsDropdownTranslation = {
                buttonDefaultText: 'Select sensors'
            };
            $scope.sensorsDropdownEvents = {
                onMaxSelectionReached: reachedSensorsMax,
                onItemSelect: selectSensor
            };
        }],
        templateUrl: "dashboard/sensors-dir.template.html"
    }
}

angular.module('dashboard')

// Optional configuration for All Charts
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true
            },
            animation: {
                duration: 500
            }
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
    }])

    .controller("MainCtrl", ['$scope','locationName', MainCtrl])

    .directive('chartDir', chartDir)
    .directive('sensorsDir', sensorsDir)

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl',
        bindings: {
            weatherData: '<',
            sensorsNames: '<'
        }
    });