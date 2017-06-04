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

    // Watchers
    $scope.$watch('dates', watchDates, true);
}

function    chartDir() {
    return {
        restrict: 'E',
        scope: {
            cdLabels: '=',
            cdOrder: '@'
        },
        link: function (scope, $element, $attrs) {//манипуляция с DOM


            function watchLabels(newValue, oldValue) {
                var difference = (newValue.length - oldValue.length);
                console.log("new",newValue.length);
                console.log("old",oldValue.length);
                console.log("difference", difference);

                if(difference > 0) {// период увеличился
                    if(newValue[0] == oldValue[0])// Первый элемент не тронут
                        scope.data[0] = scope.data[0].concat(createData(difference));
                    else
                        scope.data[0] = createData(difference).concat(scope.data[0]); //todo: fix up
                } else { // уменьшился, diff - отрицательная или 0
                    if(newValue[0] == oldValue[0])// Первый элемент не тронут
                        for(; difference < 0; difference++)
                            scope.data[0].pop();
                    else
                        for(; difference < 0; difference++)
                            scope.data[0].shift();
                }
                scope.labels = scope.cdLabels;// binding works fine
                //scope.data = [createData(scope.cdLabels.length)];
            }

            function createData(count) {
                var randomScalingFactor = function() {
                    return Math.round(Math.random() * 100);
                };

                if (count == 1) return randomScalingFactor();//todo:improve

                var data=[];
                for(var i=0; i < count; i++) {
                    data.push(randomScalingFactor());
                }

                return data;
            }



            // chart init
            scope.labels = scope.cdLabels;// binding works fine
            scope.type = "line";
            scope.series = ['Series A'];//sensors names

            scope.data = [createData(scope.cdLabels.length)]; //ToDo: заменить на цикл по series

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

            scope.recalculate = function () {
                scope.data = [createData(scope.data[0].length)];
            };


            // Watchers
            scope.$watchCollection('cdLabels', watchLabels);

        },
        templateUrl: "dashboard/chart-dir.template.html"
    }
}

angular.module('dashboard')

    // Optional configuration for All Charts
    .config(['ChartJsProvider', function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            responsive: true
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
    }])

    .controller("MainCtrl", ['$scope', MainCtrl])

    .directive('chartDir', chartDir)

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl'
    });