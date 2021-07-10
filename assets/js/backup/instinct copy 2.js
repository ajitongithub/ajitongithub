const { ipcRenderer } = require('electron');

const { Series, DataFrame } = ('pandas-js');
var instinct_profile = {}; //main databaes

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
	$routeProvider.when('/simulation_data', {
		cache: false,
		templateUrl: '../pages/simulation_first.html',
		controller: 'simulation_data_controller'
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
	let tstamp = Date.now();
});

// Beginging Page
napp.controller('begin_controller',function($scope){
	console.log("begin_controller ");
});

// Location Controller
napp.controller('location_controller',function($scope,$http){
	console.log("location_controller ");
	var marker = new mapboxgl.Marker();
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
	});
	//plotly geo graph
	var geo_weather = document.getElementById('geo_insolation');
	var geo_temperature = document.getElementById('geo_temperature');
	var data = [{
		type: 'bar',
		y: [2, 1, 3, 2],
		orientation: 'horizontal'
		}];
		
	// var layout_geo_weather = [{title: 'Custom Range',
	// xaxis: {
	//   range: ['2019-01-01', '2020-01-01'],
	//   type: 'date'
	// }},{margin: { t: 0 }}];
	var layout_geo_weather = [
		{
			title: 'Weather Data',
			xaxis: {
				range: ['2019-01-01', '2020-01-01'],
				type: 'date'
			}
		}];

	let config_geo_weather = {responsive: true,displayModeBar: false};	
	Plotly.newPlot(geo_weather, data, layout_geo_weather,config_geo_weather);
	Plotly.newPlot(geo_temperature, data, layout_geo_weather,config_geo_weather);


	$scope.geo_loader = function(){
		// Data Weather Fetch
		let tstamp = Date.now();		
		var insol_array = [];
		var temp_array = [];
		var insolation_data = [];

		var modal_geo = document.getElementById("modal_geo");
		var st_val = modal_geo.style.transform;
		if (st_val == "translateY(0px)"){
			modal_geo.style.transform = "translateY(-100%)";			
		}
		else{
			modal_geo.style.transform = "translateY(0px)";
			$http.get("../database/weather.csv?data="+tstamp).then(function(response){
				var weather_data_array = response.data.split('\n');
				for (element=1;element<weather_data_array.length;element++){
					insolation_data = weather_data_array[element].split(",");
					insol_array.push(insolation_data[1]*1000);
					temp_array.push(insolation_data[2]);
				}
				
				instinct_profile["insolation"] = insol_array;
				instinct_profile["temperature"] = temp_array;
				Plotly.restyle(geo_weather, 'y', [insol_array]);
				Plotly.restyle(geo_temperature, 'y', [temp_array]);
			});
			
		}
		// $scope.geo_id.latitude = document.getElementById('geo_lat').innerHTML;
		// $scope.geo_id.longitude = document.getElementById('geo_long').innerHTML;
		// $scope.geo_id.satellite = document.getElementById('geo_sat').innerHTML;
		// swal("Hello world!");
	
		instinct_profile["location"] = $scope.geo_id;
		console.log(instinct_profile);
		// sent data to the node unit
		ipcRenderer.invoke('location_done',$scope.geo_id);
	};	
});
// Load Profile Controller
napp.controller('load_profile_controller',function($scope,$http,$location){
	// Populate the database driven load profile
	$http.get('../database/preset_load_profiles.json').then(function(response){
		$scope.preset_loads = response.data.load_profile;
		// console.log(response.data.load_profile)
	});

	// Load Profile Modelling (User)------------------------------------------
	var load_profile_array = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

	$scope.database_profile = "Profile from Database";
	$scope.user_model_profile = "Model the Load Profile";
	$scope.upload_profile = "Upload the Database";
	$scope.appliance_profile = "Auto Appliance Database";
	$scope.max_demand_data = 1200;

	$scope.load_profile_user_modelled = function(){
		// auto pop up
		var tee = document.getElementById("the_popup");
		var st_val = tee.style.transform;
		if (st_val == "translateY(0px)"){
			tee.style.transform = "translateY(-500%)";
			// load_profile_array
			Plotly.restyle(load_profile_final, 'y', [load_profile_array]);
		}
		else{
			tee.style.transform = "translateY(0px)";
			// console.log(st_val);
			// console.log(load_profile_array);


		}
	};
	// plotly
	var load_profile_usermodel_graph = document.getElementById('load_profile_usermodelled');
	var data = [{
		type: 'scatter',
		mode: 'lines+markers',
		y: [2, 1, 3, 2],
		orientation: 'horizontal'
		}];
	var layout = [{margin: { t: 0 }}];
	let config = {responsive: true,
		displayModeBar: false};

	Plotly.newPlot(load_profile_usermodel_graph, data, layout,config);
	

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
	
	$scope.set_max_demand = function(){
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
			'max': $scope.max_demand_data
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
	};
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
			'max': $scope.max_demand_data
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
	function slider_mod_function(data,value){
		data.noUiSlider.on('update',function(values,handle){
		$scope.afd = values[handle];
		// $scope.$apply();
		load_profile_array[value] = values[handle];
		Plotly.restyle(load_profile_usermodelled, 'y', [load_profile_array]);
	});
	}
	// Upload File
	document.getElementById('clickerid').addEventListener('click',function(){

	});
	$scope.load_profile_upload = function(){
		console.log("CLICKED");
		ipcRenderer.invoke('upload_load_profile','true');
		// ipcRenderer.send('load_profile_upload', "ASASD");

		// var f = document.getElementById('load_file').files[0],
        // r = new FileReader();
		// r.onloadend = function(e) {
		// 	var data = e.target.result;
		// 	//send your binary data via $http or $resource or do anything else with it
		// 	console.log(data);
		// 	// this.mainWindow.webContents.send('load_profile_upload', 'Hello');
		// 	// ipcRenderer.invoke('load_profile_upload', {}).then((result) => {
		// 	// 	console.log(result);
		// 	//   });		
		// 	}
		// r.readAsBinaryString(f);
	}
	//Final Load Profile Plot
	var load_profile_final = document.getElementById('load_profile_final');
	var data = [{
		type: 'scatter',
		mode: 'lines+markers',
		y: [2, 1, 3, 2],
		orientation: 'horizontal'
		}];
	var layout_load_final = [{margin: { t: 0 }}];
	let config_load_final = {responsive: true,
		displayModeBar: false};
	
	Plotly.newPlot(load_profile_final, data, layout_load_final,config_load_final);

	$scope.selecter_load = function(input){
		console.log(input);
	}
	$scope.load_database = function(){
		console.log($scope.selectedLoad);
		instinct_profile["load_profile"] = $scope.selectedLoad.load_profile;
		Plotly.restyle(load_profile_final, 'y', [$scope.selectedLoad.load_profile]);	
	}
	$scope.load_changer = function(){
		instinct_profile["load_profile"] = $scope.selectedLoad.load_profile;
		Plotly.restyle(load_profile_final, 'y', [$scope.selectedLoad.load_profile]);
		
	}
	// Load 
	$scope.confirm_load_profile = function(){
		// swal("Oops!", "Something went wrong!", "error");
		console.log(instinct_profile);
		$location.path("/component_selection");
	}

});
// Component Controller
napp.controller('components_controller',function($scope,$http){
	console.log("components_controller");
	$scope.component_accept = 1;


	// loads components database
	// Battery
	$http.get('../database/batteries_csv.csv').then(function(response){
		// $scope.battery_profiles = response.data.battery_profiles;
		// console.log(csv_to_array(response.data));
		// console.log();
		$scope.battery_data = csv_to_array(response.data);
	});
	// solar_panel
	$http.get('../database/solar_panel_csv.csv').then(function(response){
		// $scope.battery_profiles = response.data.battery_profiles;
		// console.log(response.data);
		$scope.solar_data = csv_to_array(response.data);
	});
	// Inverter
	$http.get('../database/inverter_csv.csv').then(function(response){
		$scope.inverter_data = csv_to_array(response.data);
		// console.log(response.data);
		// console.log(csv_to_array(response.data));
	});


	// Controller Rest
	$scope.battery_change = function(datt){
		// console.log(datt);
	}
	$scope.priceCorrection = function(input){
		if (input == "N/A"){
			console.log(input);
			return "GOH";
		}
		
	}
	$scope.component_final = function(value){
		console.log(value);
		$scope.component_accept = 0;
		// console.log($scope.selectedSolar);
		console.log($scope.solar_database_form.$dirty);
		console.log($scope.battery_database_form.$dirty);
		console.log($scope.inverter_database_form.$dirty);
	}
	//$scope.component_accept = ($scope.solar_database_form.$dirty);// && $scope.battery_database_form.$dirty && $scope.inverter_database_form.$dirty)
	$scope.inverter_change = function(){
		$scope.component_accept = 1;
	}
});
//Simulation Data
napp.controller('simulation_data_controller',function($scope,$http){
	console.log("SIM");
	$scope.simulation_data = {};
	// Set preset data
	$scope.simulation_data.grid_reliability = 70;
	// PLOTLY - DATA SIM
	// plotly
	var simulation_first_graph = document.getElementById('simulation_first_graph');
	// var data = [{
	// 	type: 'scatter',
	// 	mode: 'lines+markers',
	// 	y: instinct_profile.load_profile,
	// 	orientation: 'horizontal'
	// 	}];
	var layout = {
		grid: {
			rows: 1, 
			columns: 2, 
			pattern: 'independent'
		}
	  };

	let config = {responsive: true,
		displayModeBar: false};

		// TRACE
	const original_profile = instinct_profile.load_profile;
	var actual_profile_trace = {
		y: original_profile,
		type: 'scatter'
		};
		
	var ldc_profile_trace = {
		y: [0, 0, 0],
		xaxis: 'x2',
		yaxis: 'y2',
		type: 'scatter'
		};
	var data = [actual_profile_trace, ldc_profile_trace];
	
	// simulation_first_graph.onload('ready',function(){
	// 	console.log("ASDAGAGASFASDASFGASGASG");
	// });

	Plotly.newPlot(simulation_first_graph, data, layout,config);
	// Load Duration
	var ldc_profile = [];
	
	$scope.load_duration_profile = function(){
		console.log("LOAD DURATION CURVE");
		ldc_profile = original_profile.sort(function(a, b){return b - a});
		console.log(instinct_profile.load_profile);
		console.log(ldc_profile);
		Plotly.restyle(simulation_first_graph, 'y', [instinct_profile.load_profile,ldc_profile]);
	}

});










// Additional Functions
function csv_to_array(data_res){
	var data_values;
	var component_object =[];
	var component_partial_set = {};
	data_res = data_res.replace(/[|&;$%@"<>()+]/g, "");
	var list_lines = data_res.split("\n"); //whole data array lines
	// console.log(data_res);
	var headers = list_lines[0].split(','); //header array
	
	var header_buffer, data_buffer = "";
	for(var ele=1; ele < list_lines.length - 1; ele++){
		data_values = list_lines[ele].split(','); // each data array
		// Loop for the count
		component_partial_set = {};
		for(var data_point = 0; data_point < headers.length; data_point++){
			header_buffer = headers[data_point].trim();
			
			data_buffer = data_values[data_point].trim();
			// console.log(data_buffer);
			component_partial_set[header_buffer] = data_buffer;
		}
		component_object.push(component_partial_set);
	}
	return component_object;
}
// filters
napp.filter('priceCorrection',function(){
	return function(input)
	{
		if(input == "N/A"){
			console.log(input);
			return 0;
		}
		else{
			return input;
		}		
	}
});

