'use strict';

function MainCtrl($scope, $sce, $log,  freeWeatherApi) {
    const ctrl = this;

    function watchDates(newValue, oldValue) {
        //обработка исключительной ситуации
        if(newValue.start === null || newValue.end === null){
            throw new Error('Нужно выбрать даты, чтобы начать построение графиков!');
        }//todo: improve errors displaying

        if(oldValue.start === null || oldValue.end === null){
            ctrl.labels = createLabels(newValue);
            return;
        }

        var oldPeriod = oldValue.getPeriod();
        var newPeriod =  newValue.getPeriod();
        var difference = newPeriod - oldPeriod;
        var i;

        if(newPeriod < 1) // Todo: B<A situation
            throw new Error('Для рассчётов, нужно чтобы был выбран период хотя бы из 2-х дней!');

        if(difference > 0){// если разница больше, период увеличился
            if(oldValue.start > newValue.start){
                //старт сдвинулся  влево
                for(i = 1; i <= difference; i++)
                    ctrl.labels.unshift(createLabel(oldValue, -i));
            } else {
                //конец cдвинулся  вправо
                for(i = 1; i <= difference; i++)
                    ctrl.labels.push(createLabel(newValue, oldPeriod + i));
            }
        } else {
            if(oldValue.start < newValue.start){
                //старт сдвинулся  вправо
                for(; difference < 0; difference++)
                    ctrl.labels.shift();
            } else {
                //конец cдвинулся  влево
                for(; difference < 0; difference++)
                    ctrl.labels.pop();
            }
        }

    }

    function createLabel(date, days) {
        return new Date(date.start.getFullYear(), date.start.getMonth(), date.start.getDate()+days).toLocaleDateString();
    }

    function createLabels(date) {
        var labels = [];
        var period = date.getPeriod();

        for(var i=0; i <= period; i++) {
            labels.push(createLabel(date, i));
        }

        return labels;
    }

    function DatePicker() {
        var oneDay = 24 * 60 * 60 * 1000;
        var today = new Date();


        this.start = today;
        this.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, today.getHours(), today.getMinutes());

        this.getPeriod = function () {
            return Math.round((this.end - this.start) / (oneDay));
        }

    }



    /*Weatherman*/






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
    $scope.chars = [1]; /// array with chars id's
    $scope.dates = new DatePicker();
    ctrl.labels = createLabels($scope.dates);

    $scope.sensors = [ [] ];//todo:improve

    $scope.addChart = function () {
        var length = $scope.chars.length;
        if(length < 4){
            $scope.chars.push(($scope.chars[length-1] + 1));
            $scope.sensors.push([]);
        }
        else throw new Error("Достигнуто максимальное количество графиков");
    };

    $scope.removeChart = function (index) {
        var length = $scope.chars.length;
        var first = 0;

        if (length > 1)
        switch (index){
            case length - 1: {
                $scope.chars = $scope.chars.slice(0,index);
                $scope.sensors.pop();
                break;
            }
            case first: {
                $scope.chars = $scope.chars.slice(1);
                $scope.sensors.shift();
                break;
            }
            default: {
                var begin = $scope.chars.slice(0,index);
                var end = $scope.chars.slice(index+1);
                $scope.chars = begin.concat(end);
                $scope.sensors.splice(index, 1);
            }
        }
        else  throw new Error("Должен остаться хотя-бы один график!");

        console.log("Length: " + length + " index: " + index);

        if(length > 1) {//если есть хотя бы один элемент(график)

            //$scope.charsQuantity = [$scope.charsQuantity.slice(0,index)].push($scope.charsQuantity.slice(index+1));//создаю новый массив = старому - index;
        }
        else throw new Error("Нельзя убрать единственный график!");
    };



    // Watchers
    $scope.$watch('dates', watchDates, true);
}


function    chartDir() {
    return {
        restrict: 'E',
        scope: {
            cdLabels: '=',
            cdSensors: '=',
            cdSensorsAllData: '=',
            cdOrder: '@',
            cdRemove: '=',
            cdId: '@'
        },
        replace: false,
        link: function (scope, $element, $attrs) {//манипуляция с DOM ToDO: засунуть биндинги в контроллёр


            function watchLabels(newValue, oldValue) {
                var difference = (newValue.length - oldValue.length);
                var parts = scope.cdSensors[scope.cdOrder-1].length;

                /*if(difference > 0) {// период увеличился todo:improve!
   Order}                 if(newValue[0] == oldValue[0])// Первый элемент не тронут
                        scope.data[0] = scope.data[0].concat(createData(difference, parts));
                    else
                        scope.data[0] = createData(difference, parts).concat(scope.data[0]); //todo: fix up
                } else { // уменьшился, diff - отрицательная или 0
                    if(newValue[0] == oldValue[0])// Первый элемент не тронут
                        for(; difference < 0; difference++)
                            scope.data[0].pop();
                    else
                        for(; difference < 0; difference++)
                            scope.data[0].shift();
                }*/
                scope.data = createData(scope.cdLabels.length, scope.cdSensors[scope.cdOrder-1].length);

                scope.labels = scope.cdLabels;// binding works fine
            }

            function watchSensors() {
                var sensors = [];
                var dataset = [];
                var options = {fill:false};




                scope.cdSensors[scope.cdOrder - 1].forEach(function (item, i) {
                    sensors.push(item.nameRus);
                    dataset.push(options);
                });

                scope.series = sensors;

                dataset.length == 0 ? scope.dataset = [] :  scope.dataset = dataset; //todo: isn't works like i want it, fix it

                scope.recalculate();

                scope.status = scope.cdSensors[scope.cdOrder-1].length;
            }

            function createData(elements, parts) {
                var randomScalingFactor = function() {
                    return Math.round(Math.random() * 100);
                };

                if(parts === undefined){
                    parts = 1;
                }
                //if (parts == 1 && elements == 1) return randomScalingFactor();//todo:improve

                var data=[];
                var i,j;

                for (i=0; i < parts; i++) {
                    data.push([]);
                    for( j=0; j < elements; j++) {
                        data[i].push(randomScalingFactor());
                    }
                }

                return data;
            }


            // dir init
            /*const ctrl = this;
            ctrl.sensorsQuantity = $scope.cdSensors[scope.cdOrder-1].length;*///todo: scoping like you are a normal person, not like this


            scope.changeColour = function (index) {
                scope.colors.splice(index,1,'#000000');
            };


            // chart init
            scope.type = 'line';
            scope.colors = [
                '#97BBCD', // blue
                '#DCDCDC', // light grey
                '#F7464A', // red
                '#46BFBD', // green
                '#FDB45C', // yellow
                '#949FB1', // grey
                '#4D5360'  // dark grey
            ]; // default colors

            scope.options = {
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


            scope.onClick = function (points, evt) {
                console.log(points, evt);
            };

            // actions
            scope.recalculate = function () {
                scope.data = createData(scope.cdLabels.length, scope.cdSensors[scope.cdOrder-1].length);//todo: not obvious that scope.status is sensorsQuantity
            };


            // Watchers
            scope.$watchCollection('cdLabels', watchLabels);
            scope.$watchCollection('cdSensors[cdOrder-1]', watchSensors);
        },
        templateUrl: "dashboard/chart-dir.template.html"
    }
}


function  sensorsDir() {
    return {
        restrict: 'E',
        scope: {
            sensorsAll: '=',
            testAttr: '=',
            sensorsOrigin: '@'
        },
        controller:['$scope' ,function ($scope) {

            var sensorsList = [
                {
                    "id": 13,
                    "name": "temperature_1",
                    "nameRus": "температура 1"
                },
                {
                    "id": 22,
                    "name": "temperature_2",
                    "nameRus": "температура 2"
                },
                {
                    "id": 43,
                    "name": "temperature_3",
                    "nameRus": "свет 1"
                },
                {
                    "id": 44,
                    "name": "temperature_3",
                    "nameRus": "свет 2"
                },
                {
                    "id": 45,
                    "name": "temperature_3",
                    "nameRus": "влажность 1"
                },
                {
                    "id": 47,
                    "name": "temperature_3",
                    "nameRus": "влажность 2"
                }];



            // sensors
            var reachedSensorsMax = function (item) {
                throw new Error("Достигнуто максимальное количество сенсоров");// todo: improve handling
            };

            var selectSensor = function (option) {
                sensorsList.forEach(function (item, i) {
                   if(option.id == item.id)
                       option.nameRus = item.nameRus;
                });
            };


            $scope.sensorsDropdownModel = $scope.sensorsAll[$scope.sensorsOrigin-1];
            $scope.sensorsDropdownData = sensorsList;
            $scope.sensorsDropdownSettings = {
                /*showEnableSearchButton: true,*/
                idProp: 'id',
                displayProp: 'nameRus',
                searchField: 'nameRus',
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
            legend: {display:true},
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

    .controller("MainCtrl", ['$scope', '$sce', '$log', 'freeWeatherApi', MainCtrl])

    .directive('chartDir', chartDir)
    .directive('sensorsDir', sensorsDir)

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl'
    });