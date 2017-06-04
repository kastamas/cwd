'use strict';

function MainCtrl($scope) {
   const ctrl = this;

    function watchDates(newValue, oldValue) {
        //обработка исключительной ситуации
        if(newValue.start === null || newValue.end === null)//todo: improve
            return;

        console.log("old:",oldValue);
        console.log("new:",newValue);

        var oldPeriod = oldValue.getPeriod();
        var newPeriod =  newValue.getPeriod();
        var difference = newPeriod - oldPeriod;
        var i;

        if(difference > 0){// если разница больше, период увеличился
            console.log("diff", difference);
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
            console.log("diff", difference);
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
        var oneDay = 24*60*60*1000;
        var today =  new Date();

        this.start = today;
        this.end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+6, today.getHours(), today.getMinutes());

        this.getPeriod = function() {
            return Math.round((this.end - this.start)/(oneDay));
        }

    }

    // init
    $scope.dates = new DatePicker();
    ctrl.labels = createLabels($scope.dates);
    ctrl.charType = "line";


    // Watchers
    $scope.$watch('dates', watchDates, true);
}

function chartDir() {
    return {
        restrict: 'E',
        scope: {
            cdDate: '=',
            cdLabels: '=',
            cdType: '@'
        },
        link: function (scope, $element, $attrs) {//манипуляция с DOM

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


            scope.labels = scope.cdLabels;
            scope.type = scope.cdType;
            scope.series = ['Series A'];//sensor names
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

            //watch datePicker
            /*$scope.$watchCollection(angular.bind($scope, function () {
             return $scope.cdLabels;
             }), function( ) {
             $scope.labels = $scope.cdLabels;
             $scope.data.push(createData(1)); //= createData($scope.cdLabels.length);
             console.log("chart labels has changed!");
             });*/
        },
        templateUrl: "dashboard/chart-dir.template.html",
        transclude: true
    }
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

    .directive('chartDir', chartDir)

    .component('dashboard', {
        templateUrl: "dashboard/dashboard.template.html",
        controller: 'MainCtrl'
    });