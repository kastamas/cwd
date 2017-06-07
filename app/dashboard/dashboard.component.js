'use strict';

function MainCtrl($scope) {
    const ctrl = this;

    function Dates() {

        let oneDay = 24 * 60 * 60 * 1000;
        let today = new Date();


        this.start = today;
        this.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, today.getHours(), today.getMinutes());

        this.getPeriod = function () {
            return Math.round((this.end - this.start) / (oneDay));
        }

    }


    /*

     $scope.dynamicPopover = {
     content: 'Hello, World!',
     templateUrl: 'myPopoverTemplate.html',
     title: 'Title'
     };

     $scope.placement = {
     options: [
     'top',
     'top-left',
     'top-right',
     'bottom',
     'bottom-left',
     'bottom-right',
     'left',
     'left-top',
     'left-bottom',
     'right',
     'right-top',
     'right-bottom'
     ],
     selected: 'top'
     };

     $scope.htmlPopover = $sce.trustAsHtml('<b style="color: red">I can</b> have <div class="label label-success">HTML</div> content');
     */

    // init
    $scope.charts = [1]; /// array with chars id's
    $scope.dates = new Dates();
    $scope.sensors = [[]];//todo:improve


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
            dashboardDates: '=',//too: @ scoping
            dashboardDataValues: '=',
            chartId: '@',
            chartOrder: '@',
            chartRemove: '=', //todo: & scoping
            cdSensors: '=',
            cdSensorsAllData: '='
        },
        replace: false,
        controller: function () {//todo data must be binded here

        },
        link: function ($scope, $element, $attrs) {//манипуляция с DOM ToDO: засунуть биндинги в контроллёр

            function watchDates(newValue, oldValue) {
                //обработка исключительной ситуации
                if (newValue.start === null || newValue.end === null) {
                    throw new Error('Нужно выбрать даты, чтобы начать построение графиков!');
                }//todo: improve errors displaying

                if (oldValue.start === null || oldValue.end === null) {
                    $scope.labels = createLabels(newValue);
                    return;
                }

                var oldPeriod = oldValue.getPeriod();
                var newPeriod = newValue.getPeriod();
                var difference = newPeriod - oldPeriod;
                var i;

                if (newPeriod < 1) // Todo: B<A situation
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
                        for (; difference < 0; difference++)
                            $scope.labels.shift();
                    } else {
                        //конец cдвинулся  влево
                        for (; difference < 0; difference++)
                            $scope.labels.pop();
                    }
                }

            }

            /*  function watchLabels(newValue, oldValue) {
             var difference = (newValue.length - oldValue.length);
             var parts =$scope.cdSensors[scope.chartOrder - 1].length;

             /!*if(difference > 0) {// период увеличился todo:improve!
             Order}                 if(newValue[0] == oldValue[0])// Первый элемент не тронут
             $scope.data[0] =$scope.data[0].concat(createData(difference, parts));
             else
             $scope.data[0] = createData(difference, parts).concat(scope.data[0]); //todo: fix up
             } else { // уменьшился, diff - отрицательная или 0
             if(newValue[0] == oldValue[0])// Первый элемент не тронут
             for(; difference < 0; difference++)
             $scope.data[0].pop();
             else
             for(; difference < 0; difference++)
             $scope.data[0].shift();
             }*!/
             $scope.data = createData(scope.labels.length,$scope.cdSensors[scope.chartOrder - 1].length);

             $scope.labels =$scope.labels;// binding works fine
             }
             *///todo: it may be useful

            function watchSensors() {
                var sensors = [];
                var dataset = [];
                var data = [];
                var options = {fill: false};


                /*console.log($scope.dashboardDataValues);
*/
                $scope.cdSensors[$scope.chartOrder - 1].forEach(function (item, i) {
                    sensors.push(item.name);
                    dataset.push(options);
                    $scope.dashboardDataValues.forEach(function (sensor, j) {
                       if(sensor.name == item.name){

                           data.push(sensor.values);
                       }
                    });
                });

                $scope.series = sensors; //array of sensor's names

                dataset.length == 0 ? $scope.dataset = [] : $scope.dataset = dataset; //todo: isn't works like i want it, fix it

                $scope.data = data;
                console.log(data);
                //$scope.recalculate();

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


            // old function for creating randomized values
            /*function createData(elements, parts, option) {
                var randomScalingFactor = function () {
                    return Math.round(Math.random() * 100);
                };

                var data = [];
                var i, j;

                if (parts === undefined) {
                    parts = 1;
                }

                //if (parts == 1 && elements == 1) return randomScalingFactor();//todo:improve

                for (i = 0; i < parts; i++) {
                    data.push([]);
                    for (j = 0; j < elements; j++) {
                        data[i].push(randomScalingFactor());
                    }
                }

                return data;
            }
            */

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
                            labelString: 'День'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Значение сенсора'
                        }
                    }]
                }
            };

            // action-functions for chart
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

            $scope.changeColour = function (index) {
                $scope.colors.splice(index, 1, '#000000');
            };

            // actions
            $scope.recalculate = function () {
                $scope.data = createData($scope.labels.length, $scope.cdSensors[$scope.chartOrder - 1].length);//todo: not obvious that$scope.status is sensorsQuantity
            };



            // Watchers
            /*scope.$watchCollection('labels', watchLabels);*/
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
                buttonDefaultText: 'Выбрать Сенсоры',
                uncheckAll: 'Убрать все',
                selectionCount: 'Выбрано',
                dynamicButtonTextSuffix: 'Выбрано'
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
            legend: {display: true},
            tooltips: {
                mode: 'index',
                intersect: true
            }
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
    }])

    .controller("MainCtrl", ['$scope', MainCtrl])

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