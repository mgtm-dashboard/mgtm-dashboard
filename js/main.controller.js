/**
* (c) 2017 Tieto Finland Oy
* Licensed under the MIT license.
*/

'use strict';

angular.module('main.controller', [ 'app.service' ])
	.controller('mainController', [ '$log', '$scope', '$rootScope', '$timeout', '$filter', 'AppService', function(log, scope, rootScope, timeout, filter, AppService) {
		log.log('mainController', 'construct');

		var self = this;

		self.focused = null;
		self.scrolling = null;
		self.decisionButton = AppService.getFromStorage('decisionButton');
		self.solutionButton = AppService.getFromStorage('solutionButton');
		self.selectedAlias = AppService.getFromStorage('selectedAlias');
		self.uiSelectedAlias = self.selectedAlias ? self.selectedAlias : 'Kaikki';
		self.allCategories = {
			'loading' : false,
			'type' : null,
			'items' : null
		};
		self.visibleItems = {
			get : function() {
				return angular.isArray(this._items) ? this._items : (this._items = []);
			},
			set : function(items) {
				this._items = items;
			}
		};
		self.uiCategories = {
			get : function() {
				return angular.isArray(this._categories) ? this._categories : (this._categories = []);
			},
			set : function(categories) {
				this._categories = categories;
			},
			add : function(category) {
				this._categories = angular.isArray(this._categories) ? this._categories : [];
				this._categories.push(category);
			},
			filterByAlias : function(alias) {
				if (!alias) {
					return this.get();
				}
				return _.filter(this.get(), {
					'alias' : alias
				});
			}
		};

		self.uiCategories.add({
			'alias' : 'Kanslia',
			'items' : null
		});

		self.uiCategories.add({
			'alias' : 'Kasvatus ja koulutus',
			'items' : null
		});

		self.uiCategories.add({
			'alias' : 'Kaupunkiympäristö',
			'items' : null
		});

		self.uiCategories.add({
			'alias' : 'Kulttuuri',
			'items' : null
		});

		self.uiCategories.add({
			'alias' : 'Sosiaali',
			'items' : null
		});

		// PRIVATE FUNCTIONS		
		function setVisibleItems() {
			var categories = self.uiCategories.filterByAlias(self.selectedAlias);
			var items = _.without(_.uniq(_.flattenDeep(_.map(categories, 'items'))), null);
			self.uiSelectedAlias = self.selectedAlias ? self.selectedAlias : 'Kaikki';
			items = filter('orderBy')(items, 'date');
			self.visibleItems.set(items);
			var visible = self.visibleItems.get().length;
			var total = (angular.isObject(self.allCategories) && angular.isArray(self.allCategories.items)) ? self.allCategories.items.length : 0;
			log.log('Visible', visible, ', Total', total);
		}

		function getAgendaItems(category) {
			if (category.loading) {
				return;
			}
			var newItems = null;
			var offset = angular.isArray(self.allCategories.items) ? self.allCategories.items.length : 0;
			AppService.getAgendaItems({
				'limit' : 100,
				'offset' : offset
			}).then(function(response) {
				self.allCategories.items = angular.isArray(self.allCategories.items) ? self.allCategories.items : [];
				newItems = angular.isArray(response.objects) ? response.objects : [];
				self.allCategories.items = self.allCategories.items.concat(newItems);
			}, function(error) {}, function(notification) {
				category.loading = true;
			}).finally(function() {
				angular.forEach(newItems, function(item) {
					angular.forEach(self.uiCategories.get(), function(cat) {
						if (item.alias.indexOf(cat.alias) >= 0) {
							cat.items = angular.isArray(cat.items) ? cat.items : [];
							cat.items.push(item);
						}
						cat.items = filter('uniq')(cat.items, 'id');
					});

					var random = Math.floor(Math.random() * 10)
					if (random < 4) {
						item.cls = 'hel-circle-green';
					} else if (random > 4) {
						item.cls = 'hel-circle-yellow';
					} else {
						item.cls = 'hel-circle-red';
					}
				});

				setVisibleItems();
				category.loading = false;
			//        	rootScope.showInfo('Haettu ' + newItems.length + ', Yhteensä ' + self.allCategories.items.length);
			});
		}

		// PUBLIC FUNCTIONS
		self.doSearch = function(searchText) {
			log.warn('mainController', 'doSearch', searchText);
		};

		self.categorySelected = function(category) {
			// spare some time for UI animations (buttons ect.)
			timeout(function() {
				self.selectedAlias = (category.alias === self.selectedAlias) ? null : category.alias;
				setVisibleItems();
				AppService.setToStorage('selectedAlias', self.selectedAlias);
			}, rootScope.buttonDelay);
		};

		self.doLoad = function(category) {
			// spare some time for UI animations (buttons ect.)
			timeout(function() {
				getAgendaItems(category);
			}, rootScope.buttonDelay);
		}

		self.openItem = function(item) {
			rootScope.goState('main.details', {
				'selectedItem' : item,
				'selectedAlias' : self.selectedAlias
			});
		};

		self.openInfo = function() {
			log.info(Modernizr);
			rootScope.showInfo('OS: ' + rootScope.OS + ', Selain: ' + rootScope.browser + ', Touch events: ' + Modernizr.touchevents, 3000);
		};

		self.focusChange = function(focused) {
			self.focused = focused;
		};

		self.keydown = function(event, searchText) {
			if (event.keyCode === 13) {
				self.doSearch(searchText);
			}
		};

		// LISTENERS	
		scope.$watch(function() {
			return self.decisionButton;
		}, function(newValue, oldValue, scope) {
			if (!angular.equals(newValue, oldValue)) {
				AppService.setToStorage('decisionButton', self.decisionButton);
			}
		});

		scope.$watch(function() {
			return self.solutionButton;
		}, function(newValue, oldValue, scope) {
			if (!angular.equals(newValue, oldValue)) {
				AppService.setToStorage('solutionButton', self.solutionButton);
			}
		});

		var scroller = document.getElementsByClassName("md-virtual-repeat-scroller")[0];
		scroller.addEventListener("scroll", function(event) {
			if ((scroller.scrollTop + scroller.offsetHeight) >= scroller.scrollHeight) {
				log.log('scroll end');
				scope.$apply(self.scrolling = false);
			} else if (!self.scrolling) {
				scope.$apply(self.scrolling = true);
			}
		}, false);

		scope.$on('$destroy', function() {
			log.log('mainController', 'destroy');
		});

	} ]);