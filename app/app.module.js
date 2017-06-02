'use strict';


angular.module('cwdApp',[
    'ui.router',
    'chart.js',

    'dashboard'
])


.config(function($stateProvider) {
    var defaultState = {
        name: 'default',
        url: '',
        component: 'dashboard'
    };

    $stateProvider.state(defaultState);
});
