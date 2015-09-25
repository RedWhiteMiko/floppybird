'use strict';

/**
 * @ngdoc function
 * @name masoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the masoApp
 */
angular.module('masoApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
