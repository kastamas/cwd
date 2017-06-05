'use strict';

function MainCtrl($scope) {
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

    // init
    $scope.charsQuantity = [1];
    $scope.dates = new DatePicker();
    ctrl.labels = createLabels($scope.dates);


    // sensors init
    $scope.sensorsList = [
        {
            "id": 1,
            "name": "temperature_1",
            "nameRus": "температура 1"
        },
        {
            "id": 2,
            "name": "temperature_2",
            "nameRus": "температура 2"
        },
        {
            "id": 3,
            "name": "temperature_3",
            "nameRus": "температура 3"
        }];

    $scope.sensors = [[{
        "id": 1,
        "name": "temperature_1",
        "nameRus": "температура 1"
    }],[],[],[]];

    // sensors
    $scope.sensorsDropdownModel = [];
    $scope.sensorsDropdownData = $scope.sensorsList;
    $scope.sensorsDropdownSettings = {
        showEnableSearchButton: true,
        idProp: 'id',
        displayProp: 'nameRus',
        searchField: 'nameRus',
        enableSearch: true,
        selectionLimit: 4,
        selectedToTop: true
    };
    $scope.sensorsDropdownTranslation = {
        buttonDefaultText: 'Выбрать Сенсоры'
    };

    /*$scope.sensorsDropdownEvents = {
        onItemSelect: $scope.addSensor()
    };*/


    $scope.addChart = function () {
        if($scope.charsQuantity.length < 4){
            $scope.charsQuantity.push(($scope.charsQuantity.length)+1);
        }
        else throw new Error("Достигнуто максимальное количество графиков");
    };

    $scope.removeChart = function () {
        if($scope.charsQuantity.length > 1){
            $scope.charsQuantity.pop();
        }
        else throw new Error("Нельзя убрать единственный график!");
    };

    $scope.addSensor = function () {
        if($scope.sensors[0].length < 4){
            $scope.sensors[0].push($scope.sensorsList[2]); //todo:remove Magic numbers
        }
        else throw new Error("Достигнуто максимальное количество сенсоров");
    };

    $scope.removeSensor = function () {
        if($scope.sensors[0].length > 1){
            $scope.sensors[0].pop();
        }
        else throw new Error("Нельзя убрать единственный сенсор!");
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
            cdOrder: '@'
        },
        replace: false,
        link: function (scope, $element, $attrs) {//манипуляция с DOM ToDO: засунуть биндинги в контроллёр


            function watchLabels(newValue, oldValue) {
                var difference = (newValue.length - oldValue.length);
                var parts = scope.cdSensors[scope.cdOrder-1].length;

                /*if(difference > 0) {// период увеличился todo:improve!
                    if(newValue[0] == oldValue[0])// Первый элемент не тронут
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
                console.log("так, блэт");
                var sensors = [];
                var dataset = [];
                var options = {fill:false};

                scope.cdSensors[scope.cdOrder - 1].forEach(function (item, i) {
                    sensors.push(item.nameRus);
                    dataset.push(options);
                });

                scope.series = sensors;
                scope.dataset = dataset;
                console.log("Series", sensors);
                scope.recalculate();

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
            ctrl.sensorsQuantity = scope.cdSensors[scope.cdOrder-1].length;*///todo: scoping like you are a normal person, not like this

            scope.status = scope.cdSensors[scope.cdOrder-1].length;

            // chart init
            scope.type = "line";
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
                console.log("Data!",scope.data);
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
        scope: true,
        controller: MainCtrl,
        link: function (scope, $element, $attrs) {

        },
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

    .controller("MainCtrl", ['$scope', MainCtrl])

    .directive('chartDir', chartDir)
    .directive('sensorsDir', sensorsDir)
    /*.factory('Sensors')*/

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl'
    });