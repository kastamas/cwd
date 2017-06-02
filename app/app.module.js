'use strict';


angular.module('cwdApp',[
    'ui.router',
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
