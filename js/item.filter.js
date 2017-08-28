/**
* (c) 2017 Tieto Finland Oy
* Licensed under the MIT license.
*/

'use strict';

angular.module('item.filter', [])
	.filter('itemFilter', [ '$log', function(log) {
		return function(items, alias) {
			if (!alias) {
				return items;
			}

			var result = [];
			angular.forEach(items, function(item) {
				if (item.alias === alias) {
					this.push(item);
				}
			}, result);

			return result;
		}
	} ]);