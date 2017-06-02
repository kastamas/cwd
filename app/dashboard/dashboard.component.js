'use strict';

function MainCtrl($scope) {
   const ctrl = this;


    function createLabel(date, count) {
        return new Date(date.start.getFullYear(), date.start.getMonth(), date.start.getDate()+count).toLocaleDateString();
    }

    function createLabels(date) {
        var labels = [];
        var period = date.getPeriod();

        for(var i=0; i <= period; i++) {
            labels.push(createLabel(date, i));
        }

        return labels;
    }

    //init
    function DatePicker() {
        var oneDay = 24*60*60*1000;
        var today =  new Date();

        this.start = today;
        this.end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+6, today.getHours(), today.getMinutes());

        this.getPeriod = function() {
            return Math.round((this.end - this.start)/(oneDay));
        }

    }

    $scope.dates = new DatePicker();
    ctrl.labels = createLabels($scope.dates);
    ctrl.charType = "line";


    // Watchers
    $scope.$watch('dates', function (newValue, oldValue) {
        console.log("old:",oldValue);
        console.log("new:",newValue);
        var period =  $scope.dates.getPeriod();
        console.log(period);

    }, true);
    //watch datePicker
    /*$scope.$watchCollection(angular.bind(ctrl, function () {
        return ctrl.datePicker;
    }), function( ) {
            period = ctrl.datePicker.getPeriod();
        console.log("DP has changed");
        if(period < 1){
            alert("Выбран некорректный период!");
            //ctrl.datePicker = new DatePicker(); //todo: Error Re Do
        } else {
            ctrl.labels.push(createLabel(ctrl.datePicker, period+1));
        }
    });*/
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