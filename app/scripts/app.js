import angular from 'angular';

angular.module('weather', [])

	.directive('towns', function () {
		return {
			restrict: 'A',
			controller: ['$http', function ($http) {
				const self = this;
				let current = 0;
				const updateDays = () => {
					self.days = self.list[current].weather;
					if (self.newDay) {
						self.hasDay(self.newDay.date);
					}
				};
				self.list = [];
				self.days = [];
				self.newDay = {};
				self.isEdit = false;
				self.template = 'days-list.html';

				$http.get('/assets/data/towns.json').success(function (data) {
					self.list = data;
					updateDays();
				});

				self.selectTown = function (setTown) {
					current = setTown;
					updateDays();
				};

				self.isSelected = function (checkTown) {
					return current === checkTown;
				};

				self.hasDay = function (date) {
					self.isEdit = self.days.some(day => day.date === date);
					return self.isEdit;
				};

				self.addDay = function () {
					const date = self.newDay.date;
					self.deleteDay(date);
					self.list[current].weather.push(self.newDay);
					self.newDay = {};
					updateDays();
				};

				self.editDay = function (date) {
					const editDay = self.days.find(day => day.date === date);
					self.newDay = {
						date: editDay.date,
						temperature: editDay.temperature,
						precipitation: editDay.precipitation
					};
					self.isEdit = true;
				};

				self.deleteDay = function (date) {
					self.list[current].weather = self.list[current].weather.filter(day => day.date !== date);
					updateDays();
				};
			}],
			controllerAs: 'towns'
		};
	})

	.directive('validateDate', ['$filter', function ($filter) {
		return {
			require: ['^^towns', 'ngModel'],
			restrict: 'A',
			link: function (scope, element, attrs, controllers) {
				const TownsController = controllers[0];
				const ngModelController = controllers[1];

				ngModelController.$parsers.push(function (data) {
					if (data) {
						let date = data.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
						if (date) {
							date = new Date(date[3], date[2] - 1, date[1]);
							date = date.getTime();
							TownsController.hasDay(date);
							return date;
						}
					}
				});

				ngModelController.$formatters.push(function (data) {
					if (data) {
						return $filter('date')(data, 'dd.MM.yyyy');
					}
				});
			}
		};
	}]);
