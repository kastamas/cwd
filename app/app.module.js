'use strict';


angular.module('cwdApp', [
    'ui.router',
    'chart.js',
    'angularjs-dropdown-multiselect',
    'ui.bootstrap',
    'rbarilani.freeWeatherApi',

    'dashboard'
])
 .constant('locationName', 'Petrozavodsk')

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

    .service('weatherService', ['$http','freeWeatherApi', 'locationName', function ($http, freeWeatherApi, locationName) {
        this.get = async() => {
            let data = await getWeather();

            /*data = data.data[0];*///local testing only!
            return data.data.weather;
        };

        this.getLabels = async() => {
            let data = await getWeather();

           /* data = data.data[0];*///local testing only
            var sensorsAllData = Object.assign({}, data.data.weather[0]); // clon

            // deleting needless object-properties
            delete sensorsAllData.date;
            delete sensorsAllData.astronomy;
            delete sensorsAllData.hourly;
            delete sensorsAllData.uvIndex;

            return Object.keys(sensorsAllData);
        };

        let getWeather = async() => {
            return await freeWeatherApi
                .localWeather(locationName, {});

           /* return await $http.get('data/weatherData.json'); local testing only*/
        };
    }])

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
