/**
 * Global ng-app files
 *
 * scripts/controllers folder for components logic
 */
// app means camps_app for encpsulastion
app = angular.module("ngCamps", ['ngAnimate', 'ngSanitize', 'ui.select']); // eslint-disable-line
suppliers_app = angular.module("ngSuppliers", ['ngAnimate', 'ngSanitize', 'ui.select']); // eslint-disable-line
events_app = angular.module("ngEvents", ['ngAnimate', 'ngSanitize', 'ui.select']); // eslint-disable-line