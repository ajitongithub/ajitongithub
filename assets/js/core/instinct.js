const { ipcRenderer } = require('electron');
const { remote } = require('electron');
const { promises } = require('fs');
const { url } = require('inspector');
const { resolve } = require('path');
const { setTimeout } = require('timers');
const { serialize } = require('v8');
const { Series, DataFrame } = ('pandas-js');

var instinct_profile = {}; //main database


let napp = angular.module("insti-app", ['angular-loading-bar', 'ngRoute']);
napp.config(['$routeProvider', '$locationProvider','$httpProvider', function ($routeProvider, $locationProvider,$httpProvider) {
	// $locationProvider.html5Mode(true); //activate HTML5 Mode
	// Route Provider
	console.log($httpProvider);
	$routeProvider.when('/', {
		cache: false,
		templateUrl: '../pages/begining.html',
		controller: 'begin_controller'
	});
	$routeProvider.when('/location', {
		cache: false,
		templateUrl: '../pages/location_select.html',
		controller: 'location_controller'
	});
	$routeProvider.when('/load_profile', {
		cache: false,
		templateUrl: '../pages/load_profile.html',
		controller: 'load_profile_controller'
	});
	$routeProvider.when('/component_selection', {
		cache: false,
		templateUrl: '../pages/components_select.html',
		controller: 'components_controller'
	});
	$routeProvider.when('/simulation_data', {
		cache: false,
		templateUrl: '../pages/simulation_first.html',
		controller: 'simulation_data_controller'
	});
	$routeProvider.when('/simulation_first_result', {
		cache: false,
		templateUrl: '../pages/sim_first_results.html',
		controller: 'simulation_first_result_controller'
	});
	$routeProvider.when('/environment_assess', {
		cache: false,
		templateUrl: '../pages/environmental_assess.html',
		controller: 'env_assess_controller'
	});
	$routeProvider.when('/auto_load_loader', {
		cache: false,
		templateUrl: '../pages/auto_profile_selector.html',
		controller: 'auto_load_loader_controller'
	});
}
]);

// Mother Controller
napp.controller("insti-controller", function ($scope, $location, $http, $rootScope) {

	let quit_button = document.getElementById("quit_app");
	quit_button.addEventListener('click', (e) => {
		remote.app.quit()
	});

	$scope.software_name = "INSTI CLOV";
	let tstamp = Date.now();
	$rootScope.summary_location_lattitude = "Lattitude Not Set";
	$rootScope.summary_location_longitude = "Longitude Not Set";

	let side_summary = document.querySelector(".summary_opener");
	let anim_sidebar = gsap.timeline({ repeat: 30, yoyo: true, paused: true });


	side_summary.addEventListener("click", function (e) {
		// console.log(e.path[1].style.transform);
		if (e.path[1].style.transform == "translate(-100%, 0%) translate(6px, 0px)") {
			gsap.to(".main_summary", { duration: 0.15, xPercent: 0 });
			gsap.to("#sum_chevron", { duration: 0.25, rotate: 0 });
		}
		else {
			gsap.to(".main_summary", { duration: 0.25, xPercent: -100, yoyo: true });
			gsap.to("#sum_chevron", { duration: 0.25, rotate: 180 });

		}
	});

	side_summary.addEventListener('mouseover', function (e) {
		// gsap.to("#sum_chevron", {duration:0.25, rotate: 180});
		anim_sidebar.resume();
		anim_sidebar.to("#sum_chevron", { duration: 0.25, x: -3 });
	})
	side_summary.addEventListener('mouseout', function (e) {
		// gsap.to("#sum_chevron", {duration:0.25, rotate: 180});
		anim_sidebar.pause();
		anim_sidebar.to("#sum_chevron", { duration: 0.25, x: -5 });
	})
});