/**
 * Created by Johan on 2016-04-24.
 */

var uat = angular.module('uat', ['ngRoute']);

uat.config(function ($routeProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'partials/home.html',
            controller: 'homeCtrl'
        })

        .when('/user', {
            templateUrl: 'partials/user.html',
            controller: 'userCtrl'
        })

        .when('/class', {
            templateUrl: 'partials/class.html',
            controller: 'classCtrl'
        })

        .when('/exam', {
            templateUrl: 'partials/exam.html',
            controller: 'examCtrl'
        })

        .when('/question', {
            templateUrl: 'partials/question.html',
            controller: 'questionCtrl'
        })

        .when('/submitted', {
            templateUrl: 'partials/submitted.html',
            controller: 'submittedCtrl'
        })

        .otherwise({
            redirectTo: '/home'
        });
});