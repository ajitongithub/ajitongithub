const { ipcRenderer } = require('electron');
// let {PythonShell} = require('python-shell');

let napp = angular.module("insti-app", ['ngRoute']);
napp.config(['$routeProvider','$locationProvider', function ($routeProvider,$locationProvider) {
	// $locationProvider.html5Mode(true); //activate HTML5 Mode
	// Route Provider
	
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
}
]);


// Mother Controller
napp.controller("insti-controller", function($scope,$location,$http){
	$scope.software_name = "INSTI CLOV";
	$scope.the_test = function(){
		$location.path('main_screen');
		ipcRenderer.invoke('perform-action');
	};

	// Data Weather Fetch
	let tstamp = Date.now();
	$http.get("../database/weather.csv?data="+tstamp).then(function(response){
			// console.log(response.data);
			var asd = response.data.split('\n');
			console.log(asd[0]);
			// $scope.solar_battery_stats = response.data;
	});

	// Click Listener
	// $scope.side_menu_click = function(dt){
	// 	console.log(dt);
	// 	$scope.activeMenu = 

	// };
});

// Beginging Page
napp.controller('begin_controller',function($scope){
	console.log("begin_controller ");
});

// Location Controller
napp.controller('location_controller',function($scope){
	console.log("location_controller ");
	// $scope.geo_id = {};

	$scope.newww = "THIS IS FROM THE SCOPE";
	var marker = new mapboxgl.Marker();

	// if ($scope.geo_id.latitude != "" && $scope.geo_id.latitude != ""){
    //         $scope.ele_validation = false;
	// }

	mapboxgl.accessToken = 'pk.eyJ1IjoiYWppdG9ubWFwYm94IiwiYSI6ImNrOG8zNWhtaDAxcjgzZXBsMW51enZlNGoifQ.78IjjlIVdu-Rc-IKozcy5Q';
	var map = new mapboxgl.Map({
		container: 'map', // container id
		style: 'mapbox://styles/mapbox/streets-v11',
		center: [77.1025, 28.7041], // starting position
		zoom: 6 // starting zoom
	});

	map.on('mousemove', function (e) {
			document.getElementById('current_loc').innerHTML = 
			'Lattitude: ' + JSON.stringify(e.lngLat.lat.toPrecision(4)) +
			' & Longitude: ' + JSON.stringify(e.lngLat.lng.toPrecision(4));
	});
	map.on('click', function (e) {
		marker.remove();
		marker.setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(map);
		// Loading
		document.getElementById('geo_lat').innerHTML = e.lngLat.lng;
		document.getElementById('geo_long').innerHTML = e.lngLat.lat;
		document.getElementById('geo_sat').innerHTML = "MERRA-2 and Others";
		$scope.geo_id = {'latitude':e.lngLat.lng,'longitude':e.lngLat.lat,'satellite':"MERRA-2 and Others"};
		// $scope.$apply();
	});

	$scope.geo_loader = function(){
		// $scope.geo_id.latitude = document.getElementById('geo_lat').innerHTML;
		// $scope.geo_id.longitude = document.getElementById('geo_long').innerHTML;
		// $scope.geo_id.satellite = document.getElementById('geo_sat').innerHTML;
		console.log($scope.geo_id);
		// sent data to the node unit
		ipcRenderer.invoke('location_done',$scope.geo_id);
	};	
});
// Load Profile Controller
napp.controller('load_profile_controller',function($scope){
	console.log($scope);

	$scope.database_profile = "Profile from Database";
	$scope.user_model_profile = "Model the Database";
	$scope.upload_profile = "Upload the Database";
	$scope.appliance_profile = "Auto Appliance Database";
	let nasd = "";
	$scope.subb = function(){
		console.log($scope);
		var data_update = [{'x': [1, 2, 3, 4, 5],	'y': [1, 23, 4, 8, 16]}];
		// update = {'x': [[x]], 'y': [[y]]};
		Plotly.update(new_tester,data_update, {}, [0]);

		// auto pop up
		var tee = document.getElementById("the_popup");
		var st_val = tee.style.transform;
		if (st_val == "translateY(0px)"){
			tee.style.transform = "translateY(-500%)";
		}
		else{
			tee.style.transform = "translateY(0px)";
			console.log(st_val);
		}
	};
		// plotly
	var load_profile_usermodelled = document.getElementById('load_profile_usermodelled');
		// graphing
	// var TESTER = document.getElementById('tester');
	var data = [{
		type: 'line',
		y: [2, 1, 3, 2],
		orientation: 'horizontal'
		}];
	var layout = [{margin: { t: 0 }}];
	var out = Plotly.validate(data,layout);
	console.log(out[0].msg);
	let config = {responsive: true};

	Plotly.newPlot(load_profile_usermodelled, data, layout,config);
	// Plotly.newPlot(new_tester, [{
	// x: [1, 2, 3, 4, 5],
	// y: [1, 2, 4, 8, 16]}], {
	// margin: { t: 0 }}
	// );
	// var out = Plotly.validate(new_tester.data,new_tester.layout);
	// console.log(out);
	$scope.graphchange = function(){
		console.log("GRAPHER");
		console.log(array1);
		// var out = Plotly.validate(new_tester.data,new_tester.layout);
		// console.log(out[0].msg);

		
		// // var data_update = [{'x': [1, 2, 3, 4, 5],	'y': [1, 23, 4, 8, 16]}];
		// var data_update = [{y: [1, 213, 4, 8, 16]}];
		// // update = {'x': [[x]], 'y': [[y]]};
		// var layout_update = [{margin: { t: 0 }}];
		// // Plotly.update(new_tester,data_update, {}, [0]);
		// Plotly.update(new_tester,data_update, layout_update, [0]);
		// // Plotly.deleteTraces(new_tester, 0);
		// // Plotly.addTraces(new_tester, [{y: [2,1,2]}]);
		// var update = {
    	// marker: {color: 'red'}
		// 	};
		// // Plotly.restyle(new_tester, update, [0]);
		// Plotly.restyle(new_tester, 'y', [[1, 213, 4, 8, 16]]);
	};
	var array1 = [1, 4, 4, 8, 16];

	let max_demand_wattage = 1200;

	// Slider
	var slider_0 = document.getElementById('slider_0');
	var slider_1 = document.getElementById('slider_1');
	var slider_2 = document.getElementById('slider_2');
	var slider_3 = document.getElementById('slider_3');
	var slider_4 = document.getElementById('slider_4');
	var slider_5 = document.getElementById('slider_5');
	var slider_6 = document.getElementById('slider_6');
	var slider_7 = document.getElementById('slider_7');
	var slider_8 = document.getElementById('slider_8');
	var slider_9 = document.getElementById('slider_9');
	var slider_10 = document.getElementById('slider_10');
	var slider_11 = document.getElementById('slider_11');
	var slider_12 = document.getElementById('slider_12');
	var slider_13 = document.getElementById('slider_13');
	var slider_14 = document.getElementById('slider_14');
	var slider_15 = document.getElementById('slider_15');
	var slider_16 = document.getElementById('slider_16');
	var slider_17 = document.getElementById('slider_17');
	var slider_18 = document.getElementById('slider_18');
	var slider_19 = document.getElementById('slider_19');
	var slider_20 = document.getElementById('slider_20');
	var slider_21 = document.getElementById('slider_21');
	var slider_22 = document.getElementById('slider_22');
	var slider_23 = document.getElementById('slider_23');
	
	var slider_options = {
		start: [50],
		animate: false,
		animationDuration: 500,
		
		connect: true,
		step: 1,
		direction: 'rtl',
		orientation: 'vertical', // 'horizontal' or 'vertical'
		range: {
			'min': 0,
			'max': max_demand_wattage
		},
		// margin: 300,
		tooltips: true,
		format: wNumb({
			decimals: 0
		}),
		behaviour: 'tap-drag',
		// Show a scale with the slider
		pips: {
			mode: 'positions',
			values: [0, 25, 50, 75, 100],
			density: 10
		}
	};

	noUiSlider.create(slider_0, slider_options);
	noUiSlider.create(slider_1, slider_options);
	noUiSlider.create(slider_2, slider_options);
	noUiSlider.create(slider_3, slider_options);
	noUiSlider.create(slider_4, slider_options);
	noUiSlider.create(slider_5, slider_options);
	noUiSlider.create(slider_6, slider_options);
	noUiSlider.create(slider_7, slider_options);
	noUiSlider.create(slider_8, slider_options);
	noUiSlider.create(slider_9, slider_options);
	noUiSlider.create(slider_10, slider_options);
	noUiSlider.create(slider_11, slider_options);
	noUiSlider.create(slider_12, slider_options);
	noUiSlider.create(slider_13, slider_options);
	noUiSlider.create(slider_14, slider_options);
	noUiSlider.create(slider_15, slider_options);
	noUiSlider.create(slider_16, slider_options);
	noUiSlider.create(slider_17, slider_options);
	noUiSlider.create(slider_18, slider_options);
	noUiSlider.create(slider_19, slider_options);
	noUiSlider.create(slider_20, slider_options);
	noUiSlider.create(slider_21, slider_options);
	noUiSlider.create(slider_22, slider_options);
	noUiSlider.create(slider_23, slider_options);

	// fetch data
	// $scope.subb = function(){
	// 	$scope.newww1 = slider_0.noUiSlider.get();
	// };
	// console.log($scope);
	//method 2
	// slider_0.noUiSlider.on('update',function(values,handle){
	// 	nasd = values[handle];
	// 	$scope.slider_0_data = nasd;
	// 	Plotly.restyle(new_tester, 'y', [[values[handle], 4, 4, 8, 16]]);
	// });

	slider_mod_function(slider_0,0);
	slider_mod_function(slider_1,1);
	slider_mod_function(slider_2,2);
	slider_mod_function(slider_3,3);
	slider_mod_function(slider_4,4);
	slider_mod_function(slider_5,5);
	slider_mod_function(slider_6,6);
	slider_mod_function(slider_7,7);
	slider_mod_function(slider_8,8);
	slider_mod_function(slider_9,9);
	slider_mod_function(slider_10,10);
	slider_mod_function(slider_11,11);
	slider_mod_function(slider_12,12);
	slider_mod_function(slider_13,13);
	slider_mod_function(slider_14,14);
	slider_mod_function(slider_15,15);
	slider_mod_function(slider_16,16);
	slider_mod_function(slider_17,17);
	slider_mod_function(slider_18,18);
	slider_mod_function(slider_19,19);
	slider_mod_function(slider_20,20);
	slider_mod_function(slider_21,21);
	slider_mod_function(slider_22,22);
	slider_mod_function(slider_23,23);
	// function
	

	function slider_mod_function(dataq1,vall){
		dataq1.noUiSlider.on('update',function(values,handle){
		nasd = values[handle];
		array1[vall] = values[handle];
		Plotly.restyle(load_profile_usermodelled, 'y', [array1]);
	});
	}
});
// Component Controller
napp.controller('components_controller',function($scope){
	console.log("components_controller");
});
