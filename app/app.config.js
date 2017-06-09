'use strict';

angular.module('cwdApp')
    .constant('locationName', 'Petrozavodsk')
    .constant('weatherApiKey', 'your_api_key_here') // PASTE YOUR API KEY HERE!



    .config(function (freeWeatherApiProvider, weatherApiKey) {
        freeWeatherApiProvider
            .setApiKey(weatherApiKey)
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
            component: 'dashboard',
            resolve: {
                weatherData: async (weatherService ) => {
                    return await weatherService.get();
                },
                sensorsNames: async (weatherService) => {
                    return await weatherService.getLabels();
                }
            }
        };

        $stateProvider.state(defaultState);
    });
