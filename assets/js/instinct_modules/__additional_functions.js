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
	};
});

//status function display
function status_activate(status_content, content_duration, background_color = "rgb(180, 180, 180)", font_color ="rgb(139, 114, 114)"){
	//status_bar
	var status_bar = document.getElementById('info_bar');
	var status_bar_content = document.getElementById('status_info');
	status_bar_content.innerText = status_content;
	status_bar.style.transform = "translateY(calc(-30% - 15px))";
	status_bar.style.backgroundColor = background_color;
	status_bar_content.style.color = font_color;
	setTimeout(() => {
		status_bar.style.transform = "translateY(100%)";
	}, content_duration);
}

// 
let find_best_location = (sel_lat, sel_long,links_data)=>{
	//Search for the best location
	let loc_scan_array = [];
	let loc_object = {};
	let loc_min_lat_name = "";
	let loc_temp_minLat = 100;
	let loc_min_long_name = "";
	let loc_temp_minLong = 100;
// 
	let loc_file_id = "";
	links_data.location.forEach((item)=>{
		let lat_diff = Math.abs(sel_lat - item.latitude);
		let long_diff = Math.abs(sel_long - item.longitutde);
		// console.log(lat_diff);
		if (lat_diff <= loc_temp_minLat) {
			loc_temp_minLat = lat_diff;
			loc_min_lat_name = item.name;
			loc_file_id = item.file_id;
		}
		if (long_diff <= loc_temp_minLong) {
			loc_temp_minLong = long_diff;
			loc_min_long_name = item.name;
		}
	});
	// location_url = loc_min_lat_name;
	// console.log(loc_min_lat_name);
	// console.log(loc_min_long_name);

	return{
		"selected_place":loc_min_lat_name,
		"the_url":loc_file_id
	};
};

ipcRenderer.on('main_responder_channel',(e,data)=>{
	console.log(data);
});


// SImluation Control
ipcRenderer.on('simulation-response', (event, arg) => {
	var sim_prog = document.querySelector("#sim_progress_ux");	
	if (arg == "Start") {
		sim_prog.value = "0";
		document.getElementById('sim_modal_progress').innerHTML = "Simulation Started";
		document.getElementById('sim_modal_progress').style.color = "red";
	}
	// if (arg == "Data Loaded") {
	// 	sim_prog.value = "20";
	// 	document.getElementById('sim_modal_progress').innerHTML = "Data loading complete";
	// 	document.getElementById('sim_modal_progress').style.color = "blue";
	// }
	if(arg == "Over"){
		sim_prog.value = "100";
		document.getElementById('sim_modal_progress').innerHTML = "Simulation Completed Preparing Results..";
		document.getElementById('sim_modal_progress').style.color = "green";
		setTimeout(function(){
			document.getElementById('sim_modal_progress').innerHTML = "Finished. Please click the button to see the results";
			sim_modal_result_button.disabled = false;
		},5000);
				
	}
});