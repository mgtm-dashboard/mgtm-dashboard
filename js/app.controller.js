/**
* (c) 2017 Tieto Finland Oy
* Licensed under the MIT license.
*/

'use strict';

angular.module('app.controllers', [ 'main.controller', 'details.controller' ])
	.controller('appController', [ '$log', '$scope', function(log, scope) {
		log.log('appController', 'construct');

		scope.$on('$destroy', function() {
			log.log('appController', 'destroy');
		});
	} ]);