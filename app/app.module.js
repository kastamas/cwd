'use strict';


angular.module('cwdApp', [
    'ui.router',
    'chart.js',
    'angularjs-dropdown-multiselect',
    'ui.bootstrap',
    'rbarilani.freeWeatherApi',

    'dashboard'
])

    .config(function (freeWeatherApiProvider) {
        freeWeatherApiProvider
            .setApiKey('ffa5d34a812844e6b99195536170606')
            .setParameters({
                version: 'v1',
                premium: true,
                url: 'http://api.worldweatheronline.com',
                endPoints: {
                    localWeather: '/weather.ashx',
                    skyAndMountainWeather: '/sky.ashx',
                    marineWeather: '/marine.ashx',
                    timezone: '/tz.ashx',
                    search: '/seach.ashx',
                    pastWeather: '/past-weather.ashx'
                },
                params: {
                    format: 'json',
                    includelocation: 'yes'
                }
            });

    })


    .config(function ($stateProvider) {
        var defaultState = {
            name: 'default',
            url: '',
            component: 'dashboard'
        };

        $stateProvider.state(defaultState);
    });
