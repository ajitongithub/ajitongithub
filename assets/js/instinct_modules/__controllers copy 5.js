
let autoloading_config = {};
autoloading_config.room_width = 12; //Feet
autoloading_config.room_breadth = 10;//Feet
autoloading_config.room_height = 10;//Feet
autoloading_config.room_volume = autoloading_config.room_width * autoloading_config.room_breadth * autoloading_config.room_height;
autoloading_config.occupants = 2; // No. of people present
autoloading_config.occupants_heat = 600; // BTU/hr
autoloading_config.set_temperature = 24;
autoloading_config.window_area = 16; // Sq. Feet
autoloading_config.aircon_heat_efficiency = 0.8;
autoloading_config.heat_influx_walls = 200; //BTU/hr
autoloading_config.specific_heat_air = 1.012; //kg/kg.celcius
autoloading_config.air_density = 1.225; // kg / m ^ 3

// Begin Page Controller
napp.controller('begin_controller', function ($scope, $http) {
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[0].classList.add("active");

});

// Location Controller
napp.controller('location_controller', function ($scope, $http, $location, $rootScope) {
	//test code
	let tstamp = Date.now();
	let location_links_data = {};
	// // selected location
	// let location_object = {};
	$http.get("../database/location_link.json?data=" + tstamp).then(function (response) {
		// console.log(response.data);
		location_links_data = response.data;
	});
	//TODO: Needs checking for location neighbouring
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[1].classList.add("active");

	//buttons disabled
	let btn_location_graph = document.getElementById("btn_location_graph");
	let btn_location_final = document.getElementById("btn_location_final");

	btn_location_graph.disabled = true;
	btn_location_final.disabled = true;

	// Data Weather Fetch
	tstamp = Date.now();
	var insol_array = []; //insolation
	var insol_aggregate_monthly = []; //insolation averaged over a month
	var temp_avg_monthly = []; //insolation averaged over a month
	var temp_array = [];	// temperautre 
	var insolation_array = []; //weather data franme
	var insolation_data = 0; //insolation single datapoint
	var temperature_data = 0; //temperature single datapoint

	console.log("location_controller ");
	// Location Object File
	instinct_profile.insolation = {};
	instinct_profile.temperature = {};
	instinct_profile.location_data = {};

	let loc_mod_button = document.getElementById("curtain_buttton");


	loc_mod_button.addEventListener('click', function () {
		document.getElementById("model_blanket").style.display = "none";
		document.getElementById("modal_geo").style.transform = "translateY(-100%)";
	});

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
		btn_location_graph.disabled = false;
		btn_location_final.disabled = false;
		// 
		insol_array = []; //insoliation
		insol_aggregate_monthly = [];
		temp_avg_monthly = [];
		temp_array = [];	// temperautre 
		var geo_weather = document.getElementById('geo_insolation');
		var geo_temperature = document.getElementById('geo_temperature');
		var data = [{
			type: 'bar',
			y: [2, 1, 3, 2],
			x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			orientation: 'horizontal'
		}];
		var layout_geo_insol =
		{
			title: 'Monthy Aggregate of Insolation Data',
			xaxis: {
				range: ['2019-01-01', '2020-01-01'],
				type: 'date'
			}
		};
		var layout_geo_temp =
		{
			title: 'Average Temperature Data',
			xaxis: {
				range: ['2019-01-01', '2020-01-01'],
				type: 'date'
			}
		};
		let config_geo_weather = { responsive: true, displayModeBar: false };

		Plotly.newPlot(geo_weather, data, layout_geo_insol, config_geo_weather);
		Plotly.newPlot(geo_temperature, data, layout_geo_temp, config_geo_weather);
		// 
		marker.remove();
		marker.setLngLat([e.lngLat.lng, e.lngLat.lat]).addTo(map);
		// Loading
		document.getElementById('geo_lat').innerHTML = e.lngLat.lat;
		document.getElementById('geo_long').innerHTML = e.lngLat.lng;
		// document.getElementById('geo_sat').innerHTML = "MERRA-2 and Others";
		$scope.geo_id = { 'latitude': e.lngLat.lat, 'longitude': e.lngLat.lng, 'satellite': "MERRA-2 and Others" };
		// find_best_location(e.lngLat.lat,e.lngLat.lng,location_links_data);
		location_object = find_best_location(e.lngLat.lat, e.lngLat.lng, location_links_data);
		// Load the map data
		// console.log(location_object);
		let url_data = `../database/weather_data/${location_object.the_url}?data=${tstamp}`;
		// console.log(url_data);
		// var nearest_location = document.getElementById('geo_location');
		document.getElementById('geo_location').innerHTML = location_object.selected_place;
		$http.get(url_data).then(function (response) {
			var weather_data_array = response.data.split('\n');
			var insol_adder = 0;
			var temp_adder = 0;
			for (element = 1; element < weather_data_array.length - 1; element++) {
				insolation_array = weather_data_array[element].split(",");
				insolation_data = parseFloat(insolation_array[1]);
				temperature_data = (parseFloat(insolation_array[2].trim()));
				// console.log(insolation_array[2]);
				insol_adder += parseFloat(insolation_data);
				temp_adder += parseFloat(temperature_data);
				if ((element % 720) == 0) {
					// console.log(element);
					insol_aggregate_monthly.push(insol_adder);
					temp_avg_monthly.push(temp_adder / 720); //Per Day Average
					insol_adder = 0;
					temp_adder = 0;
				}

				insol_array.push(insolation_data);
				temp_array.push(temperature_data);

			}

			//cleanup-normalization
			//Normalize data to 365 days data  = 365*24 hours = 8760 datapoints
			//Normalize Insolation
			if (insol_array.length < 8760) {
				let no_of_hours_missing = 8760 - insol_array.length;
				let no_of_days_missing = Math.ceil(no_of_hours_missing / 24);
				let lastHour_missing = insol_array.length % 24;
				let identifier_day_index = ((365 - no_of_days_missing - 1) * 24) + lastHour_missing;

				while (insol_array.length < 8760) {
					insol_array.push(insol_array[identifier_day_index]);
					identifier_day_index += 1;
				}
			}
			//Normalize Temperature
			if (temp_array.length < 8760) {
				let no_of_hours_missing = 8760 - temp_array.length;
				let no_of_days_missing = Math.ceil(no_of_hours_missing / 24);
				let lastHour_missing = temp_array.length % 24;
				let identifier_day_index = ((365 - no_of_days_missing - 1) * 24) + lastHour_missing;

				while (temp_array.length < 8760) {
					temp_array.push(temp_array[identifier_day_index]);
					identifier_day_index += 1;
				}
			}
			// Plotly.restyle(geo_weather, 'y', [insol_array]);
			Plotly.restyle(geo_weather, 'y', [insol_aggregate_monthly]);
			Plotly.restyle(geo_temperature, 'y', [temp_avg_monthly]);
			// Plotly.restyle(geo_temperature, 'y', [temp_array]);
			instinct_profile.insolation = insol_array;
			instinct_profile.temperature = temp_array;

			let environmetal_parameter_store = {};
			environmetal_parameter_store.insolation = insol_array;
			environmetal_parameter_store.temperature = temp_array;
			localStorage.setItem('weather_data', JSON.stringify(environmetal_parameter_store));

		});

	});

	$scope.geo_loader = function () {
		var modal_geo = document.getElementById("modal_geo");
		var modal_curtain = document.getElementById("model_blanket");
		modal_curtain.style.display = "block";
		var st_val = modal_geo.style.transform;
		if (st_val == "translateY(0px)") {
			modal_geo.style.transform = "translateY(-100%)";
		}
		else {
			modal_geo.style.transform = "translateY(0px)";
		}
	};

	// Location Loader
	$scope.location_final = function () {
		instinct_profile.location_data = $scope.geo_id;
		//String
		let summary_location_lattitude = "Lattitude - " + Math.round($scope.geo_id.latitude * 10) / 10;
		let summary_location_longitude = " Longitude - " + Math.round($scope.geo_id.longitude * 10) / 10;

		$rootScope.summary_location_lattitude = summary_location_lattitude;
		$rootScope.summary_location_longitude = summary_location_longitude;
		//summary - coloring
		document.getElementById("sum_loc").style.color = "green";
		console.log(instinct_profile);
		// sent data to the node unit
		ipcRenderer.send('location_done', instinct_profile);
		$location.path("/load_profile");
	};

});
// Load Profile Controller
napp.controller('load_profile_controller', function ($scope, $http, $location) {

	$scope.max_demand_display = "Not Defined Yet";
	$scope.energy_demand_display = "Not Defined Yet";
	$scope.min_demand_display = "Not Defined Yet";

	//Software Config Array
	let software_configurations;
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[2].classList.add("active");

	if (document.readyState === 'complete') {
		//status_bar
		status_activate("Load Profile Page has loaded", 2000);
	}
	//disable button
	let btn_load_profile_final = document.getElementById('btn_load_profile_final');
	let btn_load_profile_database = document.getElementById('btn_load_profile_database');
	let btn_load_profile_modelled = document.getElementById('btn_load_profile_modelled');
	btn_load_profile_final.disabled = true;
	btn_load_profile_database.disabled = true;

	instinct_profile.load_profile = {};
	// RESET
	$scope.reset_load_selection = function () {
		btn_load_profile_final.disabled = true;
		btn_load_profile_database.disabled = true;
		$scope.selectedLoad = "";
		var x = document.getElementsByClassName("load_cards_auto_curtain");
		var i;
		for (i = 0; i < x.length; i++) {
			x[i].style.transform = "translateY(-100%)";
		}
	};
	// Populate the database driven load profile
	$http.get('../database/preset_load_profiles.json').then(function (response) {
		$scope.preset_loads = response.data.load_profile;
		// console.log(response.data.load_profile)
	});
	//Preset Configuration
	$http.get('../database/config_data.json').then(function (response) {
		$scope.software_configurations = response.data;
		software_configurations = response.data;
		console.log(response.data);
	});
	//First Method - Load from Database
	$scope.load_database = function () {
		console.log($scope.selectedLoad);
		btn_load_profile_final.disabled = false;
		// Other Files
		var x = document.getElementsByClassName("load_cards_auto_curtain");
		x[1].style.transform = "translateY(0)";
		x[2].style.transform = "translateY(0)";
		x[3].style.transform = "translateY(0)";
		x[4].style.transform = "translateY(0)";
		instinct_profile.load_profile = $scope.selectedLoad.load_profile;
		Plotly.restyle(load_profile_final, 'y', [$scope.selectedLoad.load_profile]);
	};

	//Third Method - Load from File
	//load profile File Uploaded
	$scope.load_profile_file_upload = function () {
		console.log("Upload THe File");
		var x = document.getElementsByClassName("load_cards_auto_curtain");
		x[0].style.transform = "translateY(0)";
		x[1].style.transform = "translateY(0)";
		// x[2].style.transform = "translateY(0)";
		x[3].style.transform = "translateY(0)";
		x[4].style.transform = "translateY(0)";
	};
	//Method Load Profile Modelling (User)------------------------------------------
	// var load_profile_array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var load_profile_array = Array(24).fill(0);
	$scope.database_profile = "Profile from Database";
	$scope.user_model_profile = "Model the Load Profile";
	$scope.upload_profile = "Upload the Database";
	$scope.appliance_profile = "Auto Appliance Database";
	$scope.electricity_bill = "Use Electricity Bill";
	$scope.max_demand_data = 1500;

	//TODO template loading
	//Fourth Method - Load from Template Program
	$scope.load_from_template = () => {
		$location.path("/auto_load_loader");

	};
	//Second Method - Load from modelling
	$scope.load_profile_user_modelled = function () {
		// auto pop up		
		var load_curtain = document.getElementById("load_profile_curtain");
		var load_farm_popup = document.getElementById("the_popup");
		var st_val = load_farm_popup.style.transform;
		if (st_val == "translateY(0px)") {
			load_farm_popup.style.transform = "translateY(-500%)";
			load_curtain.style.transform = "translateY(-100%)";
			// load_profile_array
			Plotly.restyle(load_profile_final, 'y', [load_profile_array]);
			instinct_profile.load_profile = load_profile_array;
			instinct_profile.load_profile_datapoints = load_profile_array.length;
		}
		else {
			load_farm_popup.style.transform = "translateY(0px)";
			load_curtain.style.transform = "translateY(0px)";
		}

		// Other Files
		var x = document.getElementsByClassName("load_cards_auto_curtain");
		x[0].style.transform = "translateY(0)";
		x[2].style.transform = "translateY(0)";
		x[3].style.transform = "translateY(0)";
		x[4].style.transform = "translateY(0)";
		// var i;
		// for (i = 0; i < x.length; i++) {
		// 	x[i].style.transform = "translateY(-100%)";
		// }
		btn_load_profile_final.disabled = false;
	};
	// plotly
	var load_profile_usermodel_graph = document.getElementById('load_profile_usermodelled');
	var data = [{
		type: 'scatter',
		mode: 'lines+markers',
		y: [2, 1, 3, 2],
		orientation: 'horizontal',
		name: 'Load Profile',
	}];
	var layout = {
		title: 'Energy Demand for the Selected Load',
		xaxis: {
			title: 'Hour of Day',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		yaxis: {
			title: 'Energy Demand in Wh',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		showlegend: true,
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1
		},
		margin: { t: 50, b: 80, l: 80, r: 50 },
	};
	let config = {
		responsive: true,
		displayModeBar: false
	};

	Plotly.newPlot(load_profile_usermodel_graph, data, layout, config);


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

	$scope.set_max_demand = function () {
		let sliderOptions_update = {
			start: [0],
			range: {
				'min': 0,
				'max': $scope.max_demand_data
			}
		};
		slider_0.noUiSlider.updateOptions(sliderOptions_update);
		slider_1.noUiSlider.updateOptions(sliderOptions_update);
		slider_2.noUiSlider.updateOptions(sliderOptions_update);
		slider_3.noUiSlider.updateOptions(sliderOptions_update);
		slider_4.noUiSlider.updateOptions(sliderOptions_update);
		slider_5.noUiSlider.updateOptions(sliderOptions_update);
		slider_6.noUiSlider.updateOptions(sliderOptions_update);
		slider_7.noUiSlider.updateOptions(sliderOptions_update);
		slider_8.noUiSlider.updateOptions(sliderOptions_update);
		slider_9.noUiSlider.updateOptions(sliderOptions_update);
		slider_10.noUiSlider.updateOptions(sliderOptions_update);
		slider_11.noUiSlider.updateOptions(sliderOptions_update);
		slider_12.noUiSlider.updateOptions(sliderOptions_update);
		slider_13.noUiSlider.updateOptions(sliderOptions_update);
		slider_14.noUiSlider.updateOptions(sliderOptions_update);
		slider_15.noUiSlider.updateOptions(sliderOptions_update);
		slider_16.noUiSlider.updateOptions(sliderOptions_update);
		slider_17.noUiSlider.updateOptions(sliderOptions_update);
		slider_18.noUiSlider.updateOptions(sliderOptions_update);
		slider_19.noUiSlider.updateOptions(sliderOptions_update);
		slider_20.noUiSlider.updateOptions(sliderOptions_update);
		slider_21.noUiSlider.updateOptions(sliderOptions_update);
		slider_22.noUiSlider.updateOptions(sliderOptions_update);
		slider_23.noUiSlider.updateOptions(sliderOptions_update);
	};

	var slider_options = {
		start: [50],
		animate: false,
		animationDuration: 200,

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

	slider_mod_function(slider_0, 0);
	slider_mod_function(slider_1, 1);
	slider_mod_function(slider_2, 2);
	slider_mod_function(slider_3, 3);
	slider_mod_function(slider_4, 4);
	slider_mod_function(slider_5, 5);
	slider_mod_function(slider_6, 6);
	slider_mod_function(slider_7, 7);
	slider_mod_function(slider_8, 8);
	slider_mod_function(slider_9, 9);
	slider_mod_function(slider_10, 10);
	slider_mod_function(slider_11, 11);
	slider_mod_function(slider_12, 12);
	slider_mod_function(slider_13, 13);
	slider_mod_function(slider_14, 14);
	slider_mod_function(slider_15, 15);
	slider_mod_function(slider_16, 16);
	slider_mod_function(slider_17, 17);
	slider_mod_function(slider_18, 18);
	slider_mod_function(slider_19, 19);
	slider_mod_function(slider_20, 20);
	slider_mod_function(slider_21, 21);
	slider_mod_function(slider_22, 22);
	slider_mod_function(slider_23, 23);

	// function
	function slider_mod_function(data, value) {
		// let test = document.getElementsByClassName('test1');
		data.noUiSlider.on('update', function (values, handle) {
			// test[0].innerHTML = values[handle];
			// $scope.afd = values[handle];
			load_profile_array[value] = values[handle];
			Plotly.restyle(load_profile_usermodelled, 'y', [load_profile_array]);
		});
	}

	//Final Load Profile Plot
	var load_profile_final = document.getElementById('load_profile_final');
	data = [{
		type: 'scatter',
		name: 'Load Profile',
		mode: 'lines+markers',
		y: [2, 1, 3, 2],
		orientation: 'horizontal'
	}];
	var layout_load_final = {
		title: 'Energy Demand for the Selected Load',
		xaxis: {
			title: 'Hour of Day',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		yaxis: {
			title: 'Energy Demand in Wh',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		showlegend: true,
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1
		},
		margin: { t: 50, b: 80, l: 80, r: 50 },
	};
	let config_load_final = {
		responsive: true,
		displayModeBar: false
	};

	Plotly.newPlot(load_profile_final, data, layout_load_final, config_load_final);

	// $scope.selecter_load = function (input) {
	// 	console.log(input);
	// };



	//load profile SET - Final Load Set and Proceed to Components
	$scope.load_profile_set = function () {
		console.log("Load Profile Loading");
		console.log(instinct_profile);
		// instinct_profile["load_profile"] = load_profile_array;
		ipcRenderer.send('load_profile_done', instinct_profile);
		$location.path("/component_selection");
	};

	let load_profile_info_extraction = (sel_load)=>{
		var max_demand_load = sel_load.reduce((a, b) => Math.max(a, b));
		var min_demand_load = sel_load.reduce((a, b) => Math.min(a, b));
		var energy_demand_load = sel_load.reduce((a, b) => a + b);

		let return_object = {};
		return_object.max_demand_display = {};
		return_object.min_demand_display = {};
		return_object.energy_demand_display = {};
		return_object.max_demand = max_demand_load;// in Watts
		return_object.min_demand = min_demand_load;
		return_object.energy_demand = energy_demand_load; //in Wh
		return_object.datapoints = sel_load.length;

		if (max_demand_load > 1000) {
			return_object.max_demand_display = `${Math.round(max_demand_load / 1000)} kW`;
		}
		else { return_object.max_demand_display = `${max_demand_load} W`; }

		return_object.energy_demand_display = `${Math.round(energy_demand_load / 1000)} kWh`;
		// $scope.min_demand_display = "Not Defined Yet";
		if (min_demand_load > 1000) {
			return_object.min_demand_display = `${Math.round(min_demand_load / 1000)} kW`;
		}
		else { return_object.min_demand_display = `${min_demand_load} W`; }

		return return_object;
	};

	$scope.load_changer = function () {
		if ($scope.selectedLoad.load_profile) {
			btn_load_profile_database.disabled = false;
		}
		else { btn_load_profile_database.disabled = true; }
		instinct_profile.load_profile = $scope.selectedLoad.load_profile;
		Plotly.restyle(load_profile_final, 'y', [$scope.selectedLoad.load_profile]);
		//information display
		var loadProfile_output = load_profile_info_extraction($scope.selectedLoad.load_profile); //Extract Information about the load
		$scope.max_demand_display = loadProfile_output.max_demand_display;
		$scope.min_demand_display = loadProfile_output.min_demand_display;
		$scope.energy_demand_display = loadProfile_output.energy_demand_display;
		console.log(loadProfile_output);
		//Generate the transfer object
		// generate full year profile
		let fullYear_loadProfile = document.querySelector("#processLoadProfile");

		//TODO Battery Configurations 
		//Recommendation Ranges
		instinct_profile.system_voltage = software_configurations.config_system_voltages;//[12, 24, 36, 48, 96, 120, 240];
		instinct_profile.batt_voltages = software_configurations.config_battery_parameters[0].batt_voltages;//[2, 6, 12];
		instinct_profile.batt_AH_ranges = software_configurations.config_battery_parameters[0].batt_AH_ranges;// [50, 500, 10]; //start,end,step
		instinct_profile.batt_series_qty = software_configurations.config_battery_parameters[0].batt_series_qty;//[1, 120];
		instinct_profile.batt_parallel_qty = software_configurations.config_battery_parameters[0].batt_parallel_qty;//[1, 4];
		instinct_profile.batt_recom_DOD = software_configurations.config_battery_parameters[0].batt_DOD;
		instinct_profile.batt_recom_min_DOA = software_configurations.config_battery_parameters[0].batt_autonomy; //Days of autonomy
		instinct_profile.batt_recom_eff = software_configurations.config_battery_parameters[0].batt_coloumbic_efficiency; //couloumbic eff.
		
		instinct_profile.max_demand = loadProfile_output.max_demand;
		instinct_profile.min_demand = loadProfile_output.min_demand;		
		instinct_profile.energy_demand = loadProfile_output.energy_demand;
		instinct_profile.load_datapoints = loadProfile_output.datapoints;

		//Solar Data
		instinct_profile.panelEffi = software_configurations.config_panel_parameters[0].solar_efficiency; // Different for poly and mono
		instinct_profile.insolationLowlightThreshold = software_configurations.config_panel_parameters[0].solar_lowlight_threshold;
		
		//TODO Recommender Button
		console.log(instinct_profile);


		$scope.recomm_btn = ()=>{
			console.time();
			//Generate yearly load profile
			let LoadRecomm_result = ipcRenderer.sendSync("load_profile_yearly", instinct_profile);
			

			instinct_profile.loadRecomm = LoadRecomm_result;

			console.timeEnd();
			console.log("loadRecomm_result", LoadRecomm_result);
			// Battery Recommendations Model
			let BattRecomm_result = ipcRenderer.sendSync("battery_recomm_sims", instinct_profile);
			console.log("BattRecomm_result", BattRecomm_result);
			instinct_profile.battRecomm = BattRecomm_result;
			console.log(instinct_profile);



			//Solar Recom Model
			let solarRecomm_result = ipcRenderer.sendSync('solarRecom', instinct_profile);
			console.log("solarRecomm_result", solarRecomm_result);
			//Temperature Data
			let tempData = solarRecomm_result.temperature;
			let dailyInsolData = [];
			let insolAggregator = 0;
			solarRecomm_result.insolation.forEach((currentInsolation, index) => {
				//Insolation Aggregator for one day
				if (parseFloat(currentInsolation) > 0) {
					insolAggregator += parseFloat(currentInsolation);
				}
				//Day complete detection 
				if ((index + 1) % 24 == 0) {
					dailyInsolData.push(insolAggregator);
					insolAggregator = 0;
				}
			});

			// //Solar Recom Model
			// let solarRecomm_result = ipcRenderer.sendSync('solarRecom', instinct_profile);
			// //work the program for recommedation
			// let tempData = solarRecomm_result.temperature;
			// let dailyInsolData = [];
			// let insolAggregator = 0;
			// solarRecomm_result.insolation.forEach((currentInsolation, index) => {
			// 	//Insolation Aggregator for one day
			// 	if (parseFloat(currentInsolation) > 0) {
			// 		insolAggregator += parseFloat(currentInsolation);
			// 	}
			// 	//Day complete detection 
			// 	if ((index + 1) % 24 == 0) {
			// 		dailyInsolData.push(insolAggregator);
			// 		insolAggregator = 0;
			// 	}
			// });




			// //Max Panel Power per area W/m2
			// //Change the efficiency HERE for MONO and POLY
			// let panelPowerOutput_8740hours = solarRecomm_result.insolation.map((insol_perHour, index) => {
			// 	let result = (insol_perHour * solarRecomm_result.panelEffi) / (((-0.38 * (parseInt(tempData[index]) - 25) / 100)) + 1);
			// 	return result;
			// });
			// solarRecomm_result.panelPowerOutput_8740hours = panelPowerOutput_8740hours;
			// //Max Panel Power per area W/m2...aggregated per day
			// let panelPowerOutput_365days = [];
			// let panelPowerAggregator = 0;
			// panelPowerOutput_8740hours.forEach((currentInsolation, index) => {
			// 	//Insolation Aggregator for one day
			// 	if (parseFloat(currentInsolation) > 0) {
			// 		panelPowerAggregator += parseFloat(currentInsolation);
			// 	}
			// 	//Day complete detection 
			// 	if ((index + 1) % 24 == 0) {
			// 		panelPowerOutput_365days.push(panelPowerAggregator);
			// 		panelPowerAggregator = 0;
			// 	}
			// });
			// solarRecomm_result.panelPowerOutput_365days = panelPowerOutput_365days;


			// //START OF BEST/WORST/AVG DAYS in YEAR
			// //Best Day for Solar and Worst Day for Solar
			// let splSolarDays = {};
			// splSol  arDays.best = {};
			// splSolarDays.best.energyOfTheDay = 0;
			// splSolarDays.worst = {};
			// splSolarDays.worst.energyOfTheDay = 10000;
			// splSolarDays.avg = {};
			// splSolarDays.avg.energyOfTheDay = 0;

			// let meanEnergy_year = panelPowerOutput_365days.reduce((a, b) => (a + b));
			// let solarData_length = panelPowerOutput_365days.length;
			// meanEnergy_year = meanEnergy_year / solarData_length;
			// let min_meanEnergy = Math.abs(meanEnergy_year - panelPowerOutput_365days[0]);
			// panelPowerOutput_365days.forEach((insol_daily, index) => {
			// 	//Best Day
			// 	if (splSolarDays.best.energyOfTheDay < insol_daily) {
			// 		splSolarDays.best.energyOfTheDay = insol_daily;
			// 		splSolarDays.best.dayOfYear = index;
			// 	}
			// 	//worstDay_obj
			// 	if (splSolarDays.worst.energyOfTheDay > insol_daily) {
			// 		splSolarDays.worst.energyOfTheDay = insol_daily;
			// 		splSolarDays.worst.dayOfYear = index;
			// 	}
			// 	//Aversge Day Detection
			// 	if (min_meanEnergy > Math.abs(meanEnergy_year - insol_daily)) {
			// 		min_meanEnergy = Math.abs(meanEnergy_year - insol_daily);
			// 		splSolarDays.avg.energyOfTheDay = insol_daily;
			// 		splSolarDays.avg.dayOfYear = index;
			// 	}
			// });






			
			// //Probability of Failure Concept
			// let best_days = 0;
			// let worst_days = 0;
			// let average_days = 0; //days counted for all days below the average limit
			// panelPowerOutput_365days.forEach((insol_daily) => {
			// 	//Best Day Probability
			// 	if (splSolarDays.best.energyOfTheDay <= insol_daily) {
			// 		best_days += 1;
			// 	}
			// 	//Worst Day Probability
			// 	if (splSolarDays.worst.energyOfTheDay <= insol_daily) {
			// 		worst_days += 1;
			// 	}
			// 	//Average Day Probability
			// 	if (splSolarDays.avg.energyOfTheDay <= insol_daily) {
			// 		average_days += 1;
			// 	}
			// });




			// solarRecomm_result.probabilityOfSuccess = {};
			// solarRecomm_result.probabilityOfSuccess.bestDay = best_days / solarData_length;
			// solarRecomm_result.probabilityOfSuccess.worstDay = worst_days / solarData_length;
			// solarRecomm_result.probabilityOfSuccess.avgDay = average_days / solarData_length;

			// //24hours of the 3 types of days
			// //best_day_insolProfile
			// let best_day_insolProfile = [];
			// panelPowerOutput_8740hours.forEach((data, index) => {
			// 	if (index >= ((splSolarDays.best.dayOfYear) * 24) && (index < ((splSolarDays.best.dayOfYear + 1) * 24))) {
			// 		best_day_insolProfile.push(data);
			// 	}
			// });

			// //worst_day_insolProfile
			// let worst_day_insolProfile = [];
			// panelPowerOutput_8740hours.forEach((data, index) => {
			// 	if (index >= ((splSolarDays.worst.dayOfYear) * 24) && (index < ((splSolarDays.worst.dayOfYear + 1) * 24))) {
			// 		// console.log(splSolarDays.worst.dayOfYear);
			// 		worst_day_insolProfile.push(data);
			// 	}
			// });
			// //avg_day_insolProfile
			// let avg_day_insolProfile = [];
			// panelPowerOutput_8740hours.forEach((data, index) => {
			// 	if (index >= ((splSolarDays.avg.dayOfYear) * 24) && (index < ((splSolarDays.avg.dayOfYear + 1) * 24))) {
			// 		avg_day_insolProfile.push(data);
			// 	}
			// });
			// splSolarDays.avg.panelProfile = avg_day_insolProfile;
			// splSolarDays.best.panelProfile = best_day_insolProfile;
			// splSolarDays.worst.panelProfile = worst_day_insolProfile;
			// //END OF BEST/WORST/AVG DAYS in YEAR
			// solarRecomm_result.splSolarDays = splSolarDays;
			// console.log(solarRecomm_result);
			// //Solar panel Rotoscopic Program
			// let recommendationArray = [];
			// let batt_recom_array = solarRecomm_result.battLoad_Recom.battery_recomns;
			// batt_recom_array.forEach((batt_recom, index, the_array) => {
			// 	recommendationArray.push(solorRotoscoper(batt_recom, solarRecomm_result, index, the_array.length));
			// });
			// console.log(recommendationArray);

			// //array cleanup
			// let recomm_finalArray_bestArray =[];
			// let recomm_finalArray_worstArray =[];
			// let recomm_finalArray_avgArray =[];
			// for (let i = 0; i < recommendationArray.length;i++){
			// 	recomm_finalArray_bestArray.push(recommendationArray[i][0]);
			// 	recomm_finalArray_worstArray.push(recommendationArray[i][1]);
			// 	recomm_finalArray_avgArray.push(recommendationArray[i][2]);
			// }
			// $scope.recomm_array_bestDay = recomm_finalArray_bestArray;	

			// console.log(recomm_finalArray_bestArray);

			// //Finding Array Config 
			// //TODO correct Array Power
			// $scope.solarArrayPower_bestDay = recomm_finalArray_bestArray[0].solar_recomm.solarArrayPower_bestDay;
			// $scope.solarArrayPower_worstDay = recomm_finalArray_worstArray[0].solar_recomm.solarArrayPower_worstDay;
			// $scope.solarArrayPower_avgDay = recomm_finalArray_avgArray[0].solar_recomm.solarArrayPower_avgDay ;
			
			// $scope.areaConstant_bestDay = recomm_finalArray_bestArray[0].solar_recomm.areaConstant_bestDay;
			// $scope.areaConstant_worstDay = recomm_finalArray_worstArray[0].solar_recomm.areaConstant_worstDay;
			// $scope.areaConstant_avgDay = recomm_finalArray_avgArray[0].solar_recomm.areaConstant_avgDay ;
			
			
			// $scope.energyOfTheDay_best = recomm_finalArray_bestArray[0].solar_recomm.splSolarDays.best.energyOfTheDay;
			// $scope.energyOfTheDay_worst = recomm_finalArray_worstArray[0].solar_recomm.splSolarDays.worst.energyOfTheDay;
			// $scope.energyOfTheDay_avg = recomm_finalArray_avgArray[0].solar_recomm.splSolarDays.avg.energyOfTheDay;
			
			
			// $scope.probabilityOfSuccess_bestDay = (1 - recomm_finalArray_bestArray[0].solar_recomm.probabilityOfSuccess.bestDay)*100;
			// $scope.probabilityOfSuccess_worstDay = (1 - recomm_finalArray_worstArray[0].solar_recomm.probabilityOfSuccess.worstDay)*100;
			// $scope.probabilityOfSuccess_avgDay = (1 - recomm_finalArray_avgArray[0].solar_recomm.probabilityOfSuccess.avgDay) * 100; 
			
			// $scope.costMono_bestDay = recomm_finalArray_bestArray[0].solar_recomm.costMONO; 
			// $scope.costPoly_bestDay = recomm_finalArray_bestArray[0].solar_recomm.costPOLY; 

			// $scope.costMono_worstDay = recomm_finalArray_worstArray[0].solar_recomm.costMONO; 
			// $scope.costPoly_worstDay = recomm_finalArray_worstArray[0].solar_recomm.costPOLY; 

			// $scope.costMono_avgDay = recomm_finalArray_avgArray[0].solar_recomm.costMONO; 
			// $scope.costPoly_avgDay = recomm_finalArray_avgArray[0].solar_recomm.costPOLY; 
		};	
	};

});

// Solar Recommender System
const solorRotoscoper = (batt_recom, solarRecomm_result,current_index,size) => {
	// console.log(solarRecomm_result);
	var recomm_progress = document.querySelector("#recomm_progress_ux");
	recomm_progress.value = ((current_index / (size-1))*100).toFixed(0);
	let recommObj = {};
	recommObj.system = {};
	recommObj.load = {};
	recommObj.battery_recomm = {};
	recommObj.solar_recomm = {};
	recommObj.system.systemVoltage = batt_recom.systemVoltage;
	recommObj.load.normalizedEnergyDemand = Math.round(batt_recom.normalizedEnergyDemand);
	recommObj.load.loadProfile_day = solarRecomm_result.load_profile;
	recommObj.load.loadProfile_year = solarRecomm_result.battLoad_Recom.load_profile_yearly;

	recommObj.battery_recomm.energyCapacity = batt_recom.energyCapacity;
	recommObj.battery_recomm.sizingDeviation = parseFloat((100 * (batt_recom.energyCapacity - batt_recom.normalizedEnergyDemand) / batt_recom.normalizedEnergyDemand).toFixed(2));
	recommObj.battery_recomm.noOfParallel = batt_recom.noOfParallel;
	recommObj.battery_recomm.noOfSeries = batt_recom.noOfSeries;
	recommObj.battery_recomm.battVoltage = batt_recom.battVoltage;
	recommObj.battery_recomm.batt_AH = batt_recom.batt_AH;
	recommObj.battery_recomm.totalCost = batt_recom.totalCost;

	//Best Day for Solar
	//Battery Energy Test - Beta
	let battEnergy_underTest = batt_recom.energyCapacity;
	let energy_till12 = solarRecomm_result.energyBatt_till_12;
	let battEnergy_instant = battEnergy_underTest - energy_till12;
	let battEnergy_array = Array(24).fill(0);
	let solarRecharge_array = [];
	//While loop Start	- Best Day
	let areaConst_bestDay = 0;
	let areaStepRise = 0.1;
	let conditionFulfilled_bestDay = false;



			recommObj.solar_recomm = {};
		recommObj.solar_recomm.solarArrayPower_bestDay = 0;
		recommObj.solar_recomm.insolationLowlightThreshold = solarRecomm_result.insolationLowlightThreshold;
		recommObj.solar_recomm.panelPowerOutput_365days = solarRecomm_result.panelPowerOutput_365days;
		recommObj.solar_recomm.panelPowerOutput_8740hours = solarRecomm_result.panelPowerOutput_8740hours;
		recommObj.solar_recomm.panelEfficiency_POLY = solarRecomm_result.panelEffi;
		recommObj.solar_recomm.panelEfficiency_MONO = solarRecomm_result.panelEffi;
		recommObj.solar_recomm.probabilityOfSuccess = solarRecomm_result.probabilityOfSuccess;
		recommObj.solar_recomm.splSolarDays = solarRecomm_result.splSolarDays;



	while (!conditionFulfilled_bestDay) {


		battEnergy_array = Array(24).fill(0);
		battEnergy_instant = battEnergy_underTest - energy_till12;
		//For Best Day in an year
		let bestSolarDay_profile = solarRecomm_result.splSolarDays.best.panelProfile;

		let battEnergy_state = bestSolarDay_profile.map((panel_PowerData, index) => {
			if ((recommObj.solar_recomm.solarArrayPower_bestDay < (panel_PowerData * areaConst_bestDay))) {
				recommObj.solar_recomm.solarArrayPower_bestDay = panel_PowerData * areaConst_bestDay;
			}
			battEnergy_array[index] = battEnergy_instant + (panel_PowerData * areaConst_bestDay) - solarRecomm_result.load_profile[index];
			battEnergy_instant = battEnergy_array[index];

			if (battEnergy_instant <= battEnergy_underTest) {
				return battEnergy_instant;
			}
			else { return battEnergy_underTest; }
		});
		// console.log(battEnergy_state);
		//check feasibility return the best possible measure
		if (battEnergy_state[23] > battEnergy_state[0]) {
			recommObj.solar_recomm.areaConstant_bestDay = areaConst_bestDay; //Area constant
			recommObj.solar_recomm.costMONO = (47.339 * (recommObj.solar_recomm.solarArrayPower_bestDay)).toFixed(0);
			recommObj.solar_recomm.costPOLY = (5194.3 * Math.log((recommObj.solar_recomm.solarArrayPower_bestDay)) - 16736).toFixed(0);
			recommObj.solar_recomm.feasible = "YES"; //Area constant
			recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_bestDay = true;
			solarRecharge_array.push(recommObj);
		}
		else {
			recommObj.solar_recomm.areaConstant_bestDay = areaConst_bestDay; //Area constant
			recommObj.solar_recomm.feasible = "NO"; //Area constant
			recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_bestDay = false;
			// solarRecharge_array.push(0);
		}
		areaConst_bestDay += areaStepRise;
				
	} //while loop ender for Best Day




	//Worst Day for Solar

	recommObj = {};
	recommObj.system = {};
	recommObj.load = {};
	recommObj.battery_recomm = {};
	recommObj.solar_recomm = {};
	recommObj.system.systemVoltage = batt_recom.systemVoltage;
	recommObj.load.normalizedEnergyDemand = Math.round(batt_recom.normalizedEnergyDemand);
	recommObj.load.loadProfile_day = solarRecomm_result.load_profile;
	recommObj.load.loadProfile_year = solarRecomm_result.battLoad_Recom.load_profile_yearly;

	recommObj.battery_recomm.energyCapacity = batt_recom.energyCapacity;
	recommObj.battery_recomm.sizingDeviation = parseFloat((100 * (batt_recom.energyCapacity - batt_recom.normalizedEnergyDemand) / batt_recom.normalizedEnergyDemand).toFixed(2));
	recommObj.battery_recomm.noOfParallel = batt_recom.noOfParallel;
	recommObj.battery_recomm.noOfSeries = batt_recom.noOfSeries;
	recommObj.battery_recomm.battVoltage = batt_recom.battVoltage;
	recommObj.battery_recomm.batt_AH = batt_recom.batt_AH;
	recommObj.battery_recomm.totalCost = batt_recom.totalCost;

	//Battery Energy Test - Beta
	battEnergy_underTest = batt_recom.energyCapacity;
	energy_till12 = solarRecomm_result.energyBatt_till_12;
	battEnergy_instant = battEnergy_underTest - energy_till12;
	battEnergy_array = Array(24).fill(0);
	// let solarRecharge_array = [];
	//While loop Start	- Best Day
	let areaConst_worstDay = 0;
	// let areaStepRise = 0.1;
	let conditionFulfilled_worstDay= false;

	recommObj.solar_recomm = {};
	recommObj.solar_recomm.solarArrayPower_worstDay = 0;
	recommObj.solar_recomm.insolationLowlightThreshold = solarRecomm_result.insolationLowlightThreshold;
	recommObj.solar_recomm.panelPowerOutput_365days = solarRecomm_result.panelPowerOutput_365days;
	recommObj.solar_recomm.panelPowerOutput_8740hours = solarRecomm_result.panelPowerOutput_8740hours;
	recommObj.solar_recomm.panelEfficiency_POLY = solarRecomm_result.panelEffi;
	recommObj.solar_recomm.panelEfficiency_MONO = solarRecomm_result.panelEffi;
	recommObj.solar_recomm.probabilityOfSuccess = solarRecomm_result.probabilityOfSuccess;
	recommObj.solar_recomm.splSolarDays = solarRecomm_result.splSolarDays;

	let worstSolarDay_profile = solarRecomm_result.splSolarDays.worst.panelProfile;
	let testm1111 = 0;
	while (!conditionFulfilled_worstDay) {

		battEnergy_array = Array(24).fill(0);
		battEnergy_instant = battEnergy_underTest - energy_till12;
		//For Best Day in an year
		

		let battEnergy_state = worstSolarDay_profile.map((panel_PowerData, index) => {
			if ((recommObj.solar_recomm.solarArrayPower_worstDay < (panel_PowerData * areaConst_worstDay))) {
				// console.log(panel_PowerData * areaConst_worstDay);
				recommObj.solar_recomm.solarArrayPower_worstDay = panel_PowerData * areaConst_worstDay;
				// testm1111 = panel_PowerData * areaConst_worstDay;
			}
			battEnergy_array[index] = battEnergy_instant + (panel_PowerData * areaConst_worstDay) - solarRecomm_result.load_profile[index];
			battEnergy_instant = battEnergy_array[index];

			if (battEnergy_instant <= battEnergy_underTest) {
				return battEnergy_instant;
			}
			else { return battEnergy_underTest; }
		});
		// console.log(battEnergy_state);
		//check feasibility return the best possible measure
		if (battEnergy_state[23] > battEnergy_state[0]) {
			recommObj.solar_recomm.areaConstant_worstDay = areaConst_worstDay; //Area constant

			testm1111 = worstSolarDay_profile.reduce((a,b)=>Math.max(a,b));

			recommObj.solar_recomm.costMONO = (47.339 * (recommObj.solar_recomm.solarArrayPower_worstDay)).toFixed(0);
			recommObj.solar_recomm.costPOLY = (5194.3 * Math.log((recommObj.solar_recomm.solarArrayPower_worstDay)) - 16736).toFixed(0);
			recommObj.solar_recomm.feasible = "YES"; //Area constant
			recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_worstDay = true;
			solarRecharge_array.push(recommObj);
		}
		else {
			recommObj.solar_recomm.areaConstant_worstDay = areaConst_worstDay; //Area constant
			recommObj.solar_recomm.feasible = "NO"; //Area constant
			// recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_worstDay = false;
			// solarRecharge_array.push(0);
		}
		areaConst_worstDay += areaStepRise;
				
	} //while loop ender for Worst Day

	console.log(testm1111);

	//Average Day for Solar
	recommObj = {};
	recommObj.system = {};
	recommObj.load = {};
	recommObj.battery_recomm = {};
	recommObj.solar_recomm = {};
	recommObj.system.systemVoltage = batt_recom.systemVoltage;
	recommObj.load.normalizedEnergyDemand = Math.round(batt_recom.normalizedEnergyDemand);
	recommObj.load.loadProfile_day = solarRecomm_result.load_profile;
	recommObj.load.loadProfile_year = solarRecomm_result.battLoad_Recom.load_profile_yearly;

	recommObj.battery_recomm.energyCapacity = batt_recom.energyCapacity;
	recommObj.battery_recomm.sizingDeviation = parseFloat((100 * (batt_recom.energyCapacity - batt_recom.normalizedEnergyDemand) / batt_recom.normalizedEnergyDemand).toFixed(2));
	recommObj.battery_recomm.noOfParallel = batt_recom.noOfParallel;
	recommObj.battery_recomm.noOfSeries = batt_recom.noOfSeries;
	recommObj.battery_recomm.battVoltage = batt_recom.battVoltage;
	recommObj.battery_recomm.batt_AH = batt_recom.batt_AH;
	recommObj.battery_recomm.totalCost = batt_recom.totalCost;


	//Battery Energy Test - Beta
	battEnergy_underTest = batt_recom.energyCapacity;
	energy_till12 = solarRecomm_result.energyBatt_till_12;
	battEnergy_instant = battEnergy_underTest - energy_till12;
	battEnergy_array = Array(24).fill(0);
	// lsolarRecharge_array = [];
	//While loop Start	- avgDay
	let areaConst_avgDay = 0;
	areaStepRise = 0.1;
	let conditionFulfilled_avgDay = false;
	while (!conditionFulfilled_avgDay) {
		recommObj.solar_recomm = {};
		recommObj.solar_recomm.solarArrayPower_avgDay = 0;
		recommObj.solar_recomm.insolationLowlightThreshold = solarRecomm_result.insolationLowlightThreshold;
		recommObj.solar_recomm.panelPowerOutput_365days = solarRecomm_result.panelPowerOutput_365days;
		recommObj.solar_recomm.panelPowerOutput_8740hours = solarRecomm_result.panelPowerOutput_8740hours;
		recommObj.solar_recomm.panelEfficiency_POLY = solarRecomm_result.panelEffi;
		recommObj.solar_recomm.panelEfficiency_MONO = solarRecomm_result.panelEffi;
		recommObj.solar_recomm.probabilityOfSuccess = solarRecomm_result.probabilityOfSuccess;
		recommObj.solar_recomm.splSolarDays = solarRecomm_result.splSolarDays;

		battEnergy_array = Array(24).fill(0);
		battEnergy_instant = battEnergy_underTest - energy_till12;
		//For Best Day in an year
		let bestSolarDay_profile = solarRecomm_result.splSolarDays.avg.panelProfile;

		let battEnergy_state = bestSolarDay_profile.map((panel_PowerData, index) => {
			if ((recommObj.solar_recomm.solarArrayPower_avgDay < (panel_PowerData * areaConst_avgDay))) {
				recommObj.solar_recomm.solarArrayPower_avgDay = panel_PowerData * areaConst_avgDay;
			}
			battEnergy_array[index] = battEnergy_instant + (panel_PowerData * areaConst_avgDay) - solarRecomm_result.load_profile[index];
			battEnergy_instant = battEnergy_array[index];

			if (battEnergy_instant <= battEnergy_underTest) {
				return battEnergy_instant;
			}
			else { return battEnergy_underTest; }
		});
		// console.log(battEnergy_state);
		//check feasibility return the best possible measure
		if (battEnergy_state[23] > battEnergy_state[0]) {
			recommObj.solar_recomm.areaConstant_avgDay = areaConst_avgDay; //Area constant
			recommObj.solar_recomm.costMONO = (47.339 * (recommObj.solar_recomm.solarArrayPower_avgDay)).toFixed(0);
			recommObj.solar_recomm.costPOLY = (5194.3 * Math.log((recommObj.solar_recomm.solarArrayPower_avgDay)) - 16736).toFixed(0);
			recommObj.solar_recomm.feasible = "YES"; //Area constant
			recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_avgDay = true;
			solarRecharge_array.push(recommObj);
		}
		else {
			recommObj.solar_recomm.areaConstant_avgDay = areaConst_avgDay; //Area constant
			recommObj.solar_recomm.feasible = "NO"; //Area constant
			recommObj.solar_recomm.rechargeEnergyArray = battEnergy_state; //Area constant
			conditionFulfilled_avgDay = false;
			// solarRecharge_array.push(0);
		}
		areaConst_avgDay += areaStepRise;
				
	} //while loop ender for avgDay

	return solarRecharge_array;
};



// Component Controller
napp.controller('components_controller', function ($scope, $http, $location) {
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[3].classList.add("active");


	let comp_counter = {};
	comp_counter.inverter = 0;
	comp_counter.battery = 0;
	comp_counter.solar = 0;
	let btn_component_final = document.getElementById("btn_component_final");
	btn_component_final.disabled = true;
	$scope.lbl_component_info = "Please select the components to proceed further";


	instinct_profile.components = {};
	$scope.component_accept = 1;

	// loads components database
	// Battery
	$http.get('../database/batteries_csv.csv').then(function (response) {
		$scope.battery_data = csv_to_array(response.data);
	});
	// solar_panel
	$http.get('../database/solar_panel_csv.csv').then(function (response) {
		$scope.solar_data = csv_to_array(response.data);
	});
	// Inverter
	$http.get('../database/inverter_csv.csv').then(function (response) {
		$scope.inverter_data = csv_to_array(response.data);
	});

	$scope.priceCorrection = function (input) {
		if (input == "N/A") {
			console.log(input);
			return "GOH";
		}

	};

	//$scope.component_accept = ($scope.solar_database_form.$dirty);// && $scope.battery_database_form.$dirty && $scope.inverter_database_form.$dirty)
	$scope.inverter_change = function (val) {
		if (val) {
			$scope.lbl_component_info = "Inverter is selected";
			comp_counter.inverter = 1;
		}
		else {
			comp_counter.inverter = 0;
		}
		console.log(comp_counter);
		if (comp_counter.inverter && comp_counter.battery && comp_counter.solar) {
			btn_component_final.disabled = false;
			$scope.lbl_component_info = "All components loaded, ready to proceed. Please click the button to proceed";
		}
	};
	$scope.battery_change = function (val) {
		if (val) {
			$scope.lbl_component_info = "Battery is selected";
			comp_counter.battery = 1;
		}
		else {
			comp_counter.battery = 0;
		}
		console.log(comp_counter);
	};
	$scope.solar_change = function (val) {
		if (val) {
			$scope.lbl_component_info = "Solar Panel is selected";
			comp_counter.solar = 1;
		}
		else {
			comp_counter.solar = 0;
		}
		console.log(comp_counter);
	};

	// Final Program - Components
	$scope.component_final = function () {
		console.log(instinct_profile);
		// check for selection
		instinct_profile.components.battery = $scope.selectedBattery;
		instinct_profile.components.solar_panel = $scope.selectedSolar;
		instinct_profile.components.inverter = $scope.selectedInverter;
		ipcRenderer.send('components_done', instinct_profile);
		$location.path('/simulation_data');
	};
});

//Simulation Data
napp.controller('simulation_data_controller', function ($scope, $http, $q, $location, $rootScope) {
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[4].classList.add("active");


	document.getElementById('sim_modal_progress').innerHTML = "Simulation Not Started";
	document.getElementById('sim_modal_progress').style.color = "red";
	document.getElementById("simu_runner_btn").disabled = true;

	// modal
	let sim_modal_result_button = document.getElementById("sim_modal_result_button");
	sim_modal_result_button.disabled = true;
	$scope.simulation_data = {};
	// Set preset data
	$scope.simulation_data.grid_reliability = 0;
	$scope.simulation_data.grid_dependency = true;
	$scope.simulation_data.autonomy_period = 1;
	$scope.simulation_data.simulation_days = 365;
	$scope.simulation_data.microgrid_focus = "economic";
	$scope.simulation_data.depth_of_discharge = 50;
	$scope.simulation_data.batt_aging_flag = true;
	$scope.simulation_data.solar_panel_aging_flag = true;
	$scope.simulation_data.inv_cc_aging_flag = true;
	$scope.simulation_data.batt_temperature_flag = true;
	$scope.simulation_data.solar_panel_temperature_flag = true;
	$scope.simulation_data.batt_discharge_current_flag = true;
	$scope.simulation_data.inverter_discharge_current_flag = true;
	$scope.simulation_data.lower_threshold_temperature = 15;
	$scope.simulation_data.upper_threshold_temperature = 35;

	$scope.grid_dependency_func = function () {
		if ($scope.simulation_data.grid_dependency) {
			$scope.simulation_data.grid_reliability = 0;
		}
		else {
			$scope.simulation_data.grid_reliability = 70;
		}
	};
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
		title: 'Load Profile',
		grid: {
			rows: 1,
			columns: 2,
			pattern: 'independent'
		}
	};

	let config = {
		responsive: true,
		displayModeBar: false
	};
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
	Plotly.newPlot(simulation_first_graph, data, layout, config);
	// Load Duration
	var ldc_profile = [];

	$scope.load_duration_profile = function () {
		console.log("LOAD DURATION CURVE");
		ldc_profile = original_profile.sort(function (a, b) { return (b - a); });
		console.log(instinct_profile.load_profile);
		console.log(ldc_profile);
		Plotly.restyle(simulation_first_graph, 'y', [instinct_profile.load_profile, ldc_profile]);
	};
	// FInal data
	$scope.simulation_final = async function () {
		console.log("This is a test message");
		document.getElementById("simu_prepare_btn").innerText = "Preparing..";
		instinct_profile.simulation_data = $scope.simulation_data;
		console.log(instinct_profile);
		let preparation_setting = ipcRenderer.sendSync('simulation_parameters', instinct_profile);

		if (preparation_setting == "Success") {
			document.getElementById("simu_runner_btn").disabled = false;
			document.getElementById("simu_prepare_btn").innerText = "Prepared";
			document.getElementById("simu_prepare_btn").style.backgroundColor = "rgba(0, 255, 55, 0.664)";
			document.getElementById("simu_prepare_btn").style.color = "white";
			status_activate("Successfully Prepared");
			//Simulation Run Command Function
			let sim_stat = await sim_run_cmd();
			console.log(sim_stat);
		}
		else {
			document.getElementById("simu_runner_btn").disabled = false;
			document.getElementById("simu_prepare_btn").innerText = "Error";
			document.getElementById("simu_prepare_btn").style.backgroundColor = "rgba(0, 255, 55, 0.664)";
			document.getElementById("simu_prepare_btn").style.color = "white";
			status_activate("Error");
		}
	};

	ipcRenderer.on('state_of_sim', (event, data) => {
		console.log(data);
	});
	ipcRenderer.on('progress_of_sim', (event, data) => {
		var sim_prog = document.querySelector("#sim_progress_ux");
		sim_prog.value = data;
		console.log("HIT");
	});
	//Simulation Run Command Function
	const sim_run_cmd = async () => {
		let simulation_modal_curtain = document.getElementById('simulation_modal_curtain');
		simulation_modal_curtain.style.transform = "translateY(0px)";

		var sim_modal = document.getElementById("simulation_result_modal");
		var sim_modal_val = sim_modal.style.transform;
		if (sim_modal_val == "translateY(0px)") {
			sim_modal.style.transform = "translateY(-500%)";
		}
		else {
			sim_modal.style.transform = "translateY(0px)";
		}

		//TODO Simulation UX Enhancement
		console.log("SIMULATION START");
		document.getElementById('sim_modal_progress').innerHTML = "Simulation in progress";
		document.getElementById('sim_modal_progress').style.color = "yellow	 ";
		ipcRenderer.send('simulation_run');
		// let simluation_state = await ipcRenderer.send('simulation_run');
		return "Simulation Transfer Complete";
	};

	// Run
	$scope.simulation_run = function () {
		// let simulation_modal_curtain = document.getElementById('simulation_modal_curtain');
		// simulation_modal_curtain.style.transform = "translateY(0px)";

		// var sim_modal = document.getElementById("simulation_result_modal");
		// var sim_modal_val = sim_modal.style.transform;
		// if (sim_modal_val == "translateY(0px)") {
		// 	sim_modal.style.transform = "translateY(-500%)";
		// }
		// else {
		// 	sim_modal.style.transform = "translateY(0px)";
		// 	//TODO Simulation UX Enhancement
		// 		// console.log("SIMULATION START");
		// 		// document.getElementById('sim_modal_progress').innerHTML = "Simulation in progress";
		// 		// document.getElementById('sim_modal_progress').style.color = "yellow	 ";
		// 		// ipcRenderer.send('simulation_run');

		// 	setTimeout(() => {
		// 		console.log("SIMULATION START");
		// 		document.getElementById('sim_modal_progress').innerHTML = "Simulation in progress";
		// 		document.getElementById('sim_modal_progress').style.color = "yellow	 ";
		// 		ipcRenderer.send('simulation_run');
		// 	}, 3000);
		// }
	};


	// Results Page
	$scope.sim_first_result_btn = function () {
		document.getElementById("simulation_result_modal").style.transform = "translateY(-500%)";

		$http.get('../outputs/output_batt_SOH.json').then(function (response) {
			$rootScope.result_BATT_SOH = (response.data);
			// console.log($rootScope.result_BATT_SOH);
		});
		$http.get('../outputs/output_batt_DOD.json').then(function (response) {
			$rootScope.result_output_batt_DOD = (response.data);
			// console.log($rootScope.result_BATT_SOH);
		});
		$http.get('../outputs/output_energy_unmet.json').then(function (response) {
			$rootScope.result_output_energy_unmet = (response.data);
			// console.log($rootScope.result_BATT_SOH);
		});
		$http.get('../outputs/output_energy_surplus.json').then(function (response) {
			$rootScope.result_output_energy_surplus = (response.data);
			// console.log($rootScope.result_BATT_SOH);
		});
		$http.get('../database/tariff_data.json').then(function (response) {
			$rootScope.tariff_data = response.data.tariff_data;
			// console.log($scope.tariff_data[0].tariff_amount);
			//load data into the model
			$rootScope.tariff_till_100 = $rootScope.tariff_data[0].tariff_amount;
			$rootScope.tariff_till_300 = $rootScope.tariff_data[1].tariff_amount;
			$rootScope.tariff_till_500 = $rootScope.tariff_data[2].tariff_amount;
			$rootScope.tariff_till_501 = $rootScope.tariff_data[3].tariff_amount;
			// tariff_amount = $rootScope.tariff_till_501;
			$rootScope.tariff_till_export = $rootScope.tariff_data[4].tariff_amount;
			// tariff_amount_export = $rootScope.tariff_till_export;
		});
		$http.get('../outputs/simulation_outputs.json').then(function (response) {
			$rootScope.simulation_outputs = (response.data);
			$location.path("/simulation_first_result");
		});
	};
});


//Sim-first-results
napp.controller('simulation_first_result_controller', function ($scope, $http, $rootScope) {

	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[0].classList.add("active");


	$rootScope.batt_lifetime_prediction = parseFloat($rootScope.simulation_outputs.predicted_life_of_battery) / 365; //in years
	$rootScope.energy_exportable_avg = parseFloat($rootScope.simulation_outputs.energy_surplus_total) / ($rootScope.simulation_outputs.simulated_days * 1000);
	$rootScope.energy_required_from_grid_avg = parseFloat($rootScope.simulation_outputs.energy_unmet_total / ($rootScope.simulation_outputs.simulated_days * 1000));
	$rootScope.energy_exportable = parseFloat($rootScope.simulation_outputs.energy_surplus_total / 1000);
	$rootScope.energy_required_from_grid = parseFloat($rootScope.simulation_outputs.energy_unmet_total / 1000);
	$rootScope.energy_saved = parseFloat($rootScope.simulation_outputs.energy_saved_overall / 1000);

	// Economics
	$scope.solar_panel_cost_each = 12800;
	$scope.solar_panel_count = 9;
	$scope.total_cost_solar_panel = $scope.solar_panel_cost_each * $scope.solar_panel_count;
	$scope.total_weight_solar_panel = 30 * $scope.solar_panel_count;

	$scope.batt_cost_each = 12900;
	$scope.batt_count = 4;
	$scope.total_cost_batt = $scope.batt_cost_each * $scope.batt_count;
	$scope.total_weight_batt = 60 * $scope.total_cost_batt;

	$scope.total_inveter_cost = 10100; //ID-2 UTL solar 1kVA

	$scope.total_investment_needed = $scope.total_cost_solar_panel + $scope.total_cost_batt + $scope.total_inveter_cost;


	//savings
	$scope.amount_saved_no_exports = $rootScope.tariff_till_501 * $rootScope.energy_saved;
	$scope.amount_saved_with_exports = ($rootScope.tariff_till_501 * $rootScope.energy_saved) + ($rootScope.tariff_till_export * $scope.energy_exportable);

	console.log("$rootScope.tariff_till_501" + $rootScope.tariff_till_501);
	console.log("$rootScope.energy_saved" + $rootScope.energy_saved);
	console.log("$rootScope.energy_exportable" + $rootScope.energy_exportable);
	console.log("$rootScope.tariff_amount_export" + $rootScope.tariff_till_export);


	//Payback
	let energy_saved_in_an_year = ($scope.energy_saved / $rootScope.simulation_outputs.simulated_days) * 365; //energy per year
	let amount_saved_without_exports_in_an_year = ($scope.amount_saved_no_exports / $rootScope.simulation_outputs.simulated_days) * 365; //energy per year
	let amount_saved_with_exports_in_an_year = ($scope.amount_saved_with_exports / $rootScope.simulation_outputs.simulated_days) * 365; //energy per year

	let payback_period_without_export = $scope.total_investment_needed / amount_saved_without_exports_in_an_year;
	let payback_period_with_export = $scope.total_investment_needed / amount_saved_with_exports_in_an_year;
	$scope.payback_wo_export = payback_period_without_export;
	$scope.payback_with_export = payback_period_with_export;

	// $scope.batt_count = 4;
	// $scope.total_cost_batt = $scope.batt_cost_each * $scope.batt_count;

	//max in month for solar power output
	let max_month_solar = 0;

	for (i = 0; i < $rootScope.simulation_outputs.solar_power_output_permonth.length; i++) {

		if (max_month_solar < $rootScope.simulation_outputs.solar_power_output_permonth[i]) {
			max_month_solar = $rootScope.simulation_outputs.solar_power_output_permonth[i];
		}
	}



	let simulation_output_data = {};
	//sim_results_graph_1 - BATT- SOH
	let sim_results_graph_1 = document.getElementById('sim_results_graph_1');
	let sim_results_graph_2 = document.getElementById('sim_results_graph_2');
	let sim_results_graph_3 = document.getElementById('sim_results_graph_3');
	let sim_results_graph_4 = document.getElementById('sim_results_graph_4');
	let sim_results_graph_5 = document.getElementById('sim_results_graph_5');
	let sim_results_graph_6 = document.getElementById('sim_results_graph_6');

	let data_sim_results_1 = [{
		type: 'scatter',
		mode: 'lines+markers',
		marker: {
			size: 2
		},
		y: $rootScope.result_BATT_SOH,
		name: 'BATTERY SOH SIMULATED CURVE',
		orientation: 'horizontal',

	},
	{
		type: 'scatter',
		mode: 'lines+markers',
		marker: {
			size: 1
		},
		y: $rootScope.simulation_outputs.batt_SOH_fitted_curve,
		name: 'LINEAR CURVE FITTED (SOH)',
		orientation: 'horizontal'
	}];

	let layout_sim_results_1 = {
		title: 'State of Health vs Time',
		xaxis: {
			title: 'Day of Year',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		yaxis: {
			title: 'State of Health in %',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		showlegend: true,
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1
		},
		margin: { t: 50, b: 80, l: 80, r: 50 },
	};
	let config_sim_results_1 = {
		responsive: true,
		displayModeBar: false
	};
	// graph 2 config - BATT DOD
	var surplus_energy = {
		x: $rootScope.simulation_outputs.months_array,
		y: $rootScope.simulation_outputs.surplus_energy_permonth,
		type: 'bar',
		name: 'Surplus Energy',
		marker: {
			color: 'rgb(96, 212, 0)',
			opacity: 0.7,
		}
	};
	var unmet_energy = {
		x: $rootScope.simulation_outputs.months_array,
		y: $rootScope.simulation_outputs.unmet_energy_permonth,
		type: 'bar',
		name: 'Unmet Energy',
		marker: {
			color: 'rgb(221, 22, 22)',
			opacity: 0.5
		}
	};
	var solar_power_output = {
		x: $rootScope.simulation_outputs.months_array,
		y: $rootScope.simulation_outputs.solar_power_output_permonth,
		type: 'bar',
		name: 'Solar Power Generated',
		marker: {
			color: 'rgb(42, 32, 182)',
			opacity: 0.5
		}
	};
	var data_sim_results_2 = [surplus_energy, unmet_energy, solar_power_output];

	var layout_sim_results_2 = {
		title: 'Various Energies',
		xaxis: {
			title: 'Month of Year',
			tickangle: -45,
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		yaxis: {
			title: 'Energy in Wh',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		barmode: 'group',
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1
		}
	};

	// graph 3 Economics Pie-Chart
	var data_sim_results_3 = [{
		type: "pie",
		values: [$scope.total_cost_batt, $scope.total_cost_solar_panel, $scope.total_inveter_cost],
		labels: ["Battery", "Solar Panel", "Inverter"],
		textinfo: "label+percent",
		textposition: "outside",
		automargin: true
	}];

	let layout_sim_results_3 = {
		title: 'Initial Investment Distribution',
		showlegend: true,
		margin: { t: 50, b: 80, l: 80, r: 50 },
	};

	let config_sim_results_3 = {
		responsive: true,
		displayModeBar: false
	};

	// graph 4 config - Radar Plot
	let data_sim_results_4 = [{
		type: 'scatterpolar',
		name: 'Solar Power Generated',
		r: $rootScope.simulation_outputs.solar_power_output_permonth,
		theta: $rootScope.simulation_outputs.months_array,
		fill: 'toself'
	}, {
		type: 'scatterpolar',
		name: 'Energy Unmet',
		r: $rootScope.simulation_outputs.unmet_energy_permonth,
		theta: $rootScope.simulation_outputs.months_array,
		fill: 'toself'
	}, {
		type: 'scatterpolar',
		name: 'Energy Surplus',
		r: $rootScope.simulation_outputs.surplus_energy_permonth,
		theta: $rootScope.simulation_outputs.months_array,
		fill: 'toself'
	}];
	let layout_sim_results_4 = {
		polar: {
			radialaxis: {
				visible: true,
				range: [0, max_month_solar]
			}
		},
		showlegend: true
	};
	let config_sim_results_4 = {
		responsive: true,
		displayModeBar: false
	};

	// graph 5 
	let data_sim_results_5 = [{
		type: 'bar',
		name: 'Energy Utilized',
		x: $rootScope.simulation_outputs.months_array,
		y: $rootScope.simulation_outputs.energy_saved_monthly,
		// orientation: 'horizontal'
	}];
	let layout_sim_results_5 = {
		title: 'Energy Utilized for the Demand',
		xaxis: {
			title: 'Month of Year',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		yaxis: {
			title: 'Energy Utilized in Wh',
			titlefont: {
				family: 'Arial, sans-serif',
				size: 18,
				color: 'black'
			}
		},
		showlegend: true,
		margin: { t: 50, b: 80, l: 80, r: 50 },
	};
	let config_sim_results_5 = {
		responsive: true,
		displayModeBar: false
	};

	// sankey system

	var data = {
		type: "sankey",
		arrangement: "snap",
		domain: {
			x: [0, 1],
			y: [0, 1]
		},
		orientation: "h",
		valueformat: ".0f",
		valuesuffix: "Wh",
		node: {
			pad: 15,
			thickness: 5,
			line: {
				color: "black",
				width: 0.5
			},
			//    label: ["Solar Insolation","Solar Panel Losses","CC","CC_losses","Battery","Surplus Energy","Inverter","Inverter Losses","Load","Grid"],
			//    color: ["rgba(31, 119, 180, 0.8)","rgba(255, 127, 14, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)","rgba(44, 160, 44, 0.8)"]
			label: ["Solar Insolation", "Solar Panel", "CC", "Battery", "Inverter", "Load", "Solar Panel Losses", "CC Losses", "Battery Losses", "Inverter Losses", "Overall Losses"],
			//    color: ["rgba(31, 119, 180, 0.8)","rgba(255, 127, 14, 0.8)",]
		},

		link: {
			source: [0, 1, 2, 3, 4, 1, 2, 3, 4, 6, 7, 8, 9],
			target: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10],
			value: [1000, (1000 * 0.19), (1000 * 0.19 * 0.97), (1000 * 0.19 * 0.97 * 0.98), (1000 * 0.19 * 0.97 * 0.98 * 0.95), (1000 * 0.81), (1000 * 0.19 * 0.03), (1000 * 0.19 * 0.97 * 0.02), (1000 * 0.19 * 0.97 * 0.98 * 0.05)],
			label: ["Insolation to Solar Panel", "Panel to Charge Controller", "Charge Controller to Battery", "Battery to Inverter", "Inverter to Load", "", ""]
		}
	};

	var data_sim_results_6 = [data];

	var layout_sim_results_6 = {
		title: "Energy Flow",
		//   width: 1118,
		//   height: 772,
		font: {
			size: 10
		}
	};

	let config_sim_results_6 = {
		responsive: true,
		displayModeBar: false
	};

	Plotly.newPlot(sim_results_graph_6, data_sim_results_6, layout_sim_results_6, config_sim_results_6);



	Plotly.newPlot(sim_results_graph_1, data_sim_results_1, layout_sim_results_1, config_sim_results_1);
	Plotly.newPlot(sim_results_graph_2, data_sim_results_2, layout_sim_results_2, config_sim_results_1);
	Plotly.newPlot(sim_results_graph_3, data_sim_results_3, layout_sim_results_3, config_sim_results_3);
	Plotly.newPlot(sim_results_graph_4, data_sim_results_4, layout_sim_results_4, config_sim_results_4);
	Plotly.newPlot(sim_results_graph_5, data_sim_results_5, layout_sim_results_5, config_sim_results_5);
	// Plotly.newPlot(sim_results_graph_6, data_sim_results_6, layout_sim_results_6,config_sim_results_6);

});
// Environmenatal Assessment
napp.controller('env_assess_controller', function ($scope, $http, $rootScope) {
	// Active Button Changer 
	var side_menu_active_system = document.getElementsByClassName('left_side_menu');
	for (i = 0; i < side_menu_active_system.length; i++) {
		side_menu_active_system[i].classList.remove("active");
	}
	side_menu_active_system[5].classList.add("active");
	//load appliances

	if (document.readyState === 'complete') {
		//status_bar
		status_activate("Environmental Page has loaded", 2000);
	}
	//load usage stats

});