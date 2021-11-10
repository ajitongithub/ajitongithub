// 'use strict'
// Preload (Isolated World)
const { contextBridge } = require('electron');

// Variables---------------------------------------------------------------------
let branded__items = document.querySelectorAll('.brand_items');
let load__items = document.querySelectorAll('.load_items'); //Select all the generic loads
let load__grid = document.querySelector('.loads_grid__div'); // load grid container
let load__track = document.querySelectorAll('.load_track__div'); //Select all the load tracks

let load__marker = document.querySelectorAll('.load_marker__div'); //Select all markers div
let load__info = document.querySelector("#info__div"); //Select info div

let add_track__div = document.querySelector("#add_track_id"); //Add Tracks DIV
let relign_markers = document.querySelector("#align_grid"); //Align Markers
    // let dragging__dataset;
// Drag - Drop Processing - Functions
let load__dragstart = e => {
    dragged__div = e.target;
    dragging__dataset = e.target.dataset;
    // console.log("DRAG START");
    // console.log(dragging__dataset);
    e.dataTransfer.setData("text", e.target.id);
    e.dataTransfer.effectAllowed = "move";
};
let load__dragover = e => {
    // console.log("Drag Over1");
    e.preventDefault();
    e.dataTransfer.effectAllowed = "move";
};
let load__drag = e => {
    // console.log(e);
};
let load__dragend = e => {
    console.log("Drag End");
    // console.log(DataTransfer)
};
let load__dragenter = e => {
    e.preventDefault();

    if (e.target.className == "load_track__div") {
        e.target.style.background = "rgba(139, 245, 250, 0.774)";
    }
};
let load__dragleave = e => {
    console.log("dragleave");
    if (e.target.className == "load_track__div") {
        e.target.style.background = "";
        // e.target.style.border = "";
    }
};
let load__drop = e => {
    e.preventDefault();
    if (e.target.className == "load_track__div") {
        // console.log(dragging__dataset.powerdata);
        let marker_timestamp = e.timeStamp.toString(16);
        let track_top_value = e.target.offsetTop;
        e.target.style.background = "";
        const drop_data = document.createElement("div");
        drop_data.dataset.appname = dragging__dataset.appname;
        drop_data.dataset.manufacturer = dragging__dataset.manufacturer;
        drop_data.dataset.modellingdata = dragging__dataset.modellingdata;
        drop_data.dataset.powerdata = dragging__dataset.powerdata;
        drop_data.dataset.powerfactor = dragging__dataset.powerfactor;
        drop_data.dataset.qtydata = dragging__dataset.qtydata;
        drop_data.dataset.scenario = dragging__dataset.scenario;
        drop_data.dataset.schedulabledata = dragging__dataset.schedulabledata;
        drop_data.dataset.syncdata = `load_${marker_timestamp}`;
        drop_data.dataset.type = dragging__dataset.type;
        drop_data.dataset.voltage = dragging__dataset.voltage;
        drop_data.dataset.misc = dragging__dataset.misc;

        drop_data.dataset.usage_frequency = JSON.stringify({
            "0": true,
            "1": true,
            "2": true,
            "3": true,
            "4": true,
            "5": true,
            "6": true
        });
        //TODO - ACTIVE WEEKDAYS
        drop_data.setAttribute("class", "load_marker__div");
        drop_data.setAttribute("draggable", "false");
        drop_data.style.left = `${e.offsetX}px`;
        drop_data.style.width = `${200}px`;
        drop_data.innerHTML = `<div class="marker_left">07:00</div><div class="marker_right">10:00</div>`;
        e.target.appendChild(drop_data);

        // Get the element
        let marker_offsetTop = e.target.parentElement.offsetParent.children[2].childNodes;
        let drop_container_row = 0;
        track_top_value += marker_offsetTop[0].offsetTop;
        for (let n = 0; n < marker_offsetTop.length; n++) {
            if (marker_offsetTop[n].className == 'load_info' && (marker_offsetTop[n].offsetTop == track_top_value)) {
                drop_container_row = n;
                //Ppopulate the INfo Bar
                const info_data__div = document.createElement('div');
                info_data__div.dataset.syncdata = `load_${marker_timestamp}`;
                info_data__div.innerHTML = `<div>${dragging__dataset.appname}</div>`;
                e.target.parentElement.offsetParent.children[2].childNodes[n].appendChild(info_data__div);
            }
        }
        
        //TODO
        // Time Stamp Correction
        let no_of_loads_per_track = e.target.childNodes;
        no_of_loads_per_track.forEach(track_el => {
            let full_width = track_el.parentElement.clientWidth; //Inner width of the track
            let pixel_ratio_sec = 86400 / full_width; // 86400 is no. of seconds in a day
            let start_time = pixel_ratio_sec * track_el.offsetLeft; //OffsetLeft from the inner border of track to outer area of the marker
            let end_time = pixel_ratio_sec * (track_el.offsetLeft + track_el.offsetWidth);
            if (start_time > 86400 || end_time > 86400) {
                console.log("Problem with exceeding limits");
            }
            else {
                track_el.childNodes[0].innerHTML = seconds_to_format(start_time.toFixed(0));
                track_el.childNodes[1].innerHTML = seconds_to_format(end_time.toFixed(0));
            }
        });
    }
    reassign_trackListeners();
};

const seconds_to_format = (seconds_data) => {
    let seconds = `${Math.floor(seconds_data % 60)}`.padStart(2, '0');
    let minutes_check = `${Math.floor((seconds_data / 60) % 60)}`.padStart(2, '0');
    let hours = `${Math.floor(seconds_data / 3600)}`.padStart(2, '0');
    return `${hours}:${minutes_check}`;
};
const format_to_seconds = (format_data) => { //format hours:minutes:seconds
    let time_parts = format_data.split(":");
    let total_seconds = (parseInt(time_parts[0]) * 3600) + (parseInt(time_parts[1]) * 60);
    return `${total_seconds}`;
};

// Auto Add new Tracks on Double Click
const new_track = e => {
    if (e.target.className == 'loads_grid__div') {
        const load_track = document.createElement("div");
        load_track.setAttribute("class", "load_track__div");
        e.target.appendChild(load_track);
        // Info Bar Additions        
        const info_track = document.createElement("div");
        info_track.setAttribute("class", "load_info");
        e.target.previousElementSibling.appendChild(info_track);
        reassign_trackListeners();
    }
};
//New Track Addition for Loads
const add_track_function = e => {
    const load_track = document.createElement("div");
    load_track.setAttribute("class", "load_track__div");
    e.target.previousElementSibling.appendChild(load_track);
    // Info Bar Additions        
    const info_track = document.createElement("div");
    info_track.setAttribute("class", "load_info");
    e.target.previousElementSibling.previousElementSibling.appendChild(info_track);
    reassign_trackListeners();
};

// Realign The Tracks Function
let re_aligner = () => {
    // console.log("re_aligner");
    let marker_group = document.querySelectorAll('.load_marker__div');
    if (marker_group.length > 0) {
        marker_group.forEach(ele => {
            // New Pixel to duration ratio
            let full_width = ele.parentElement.clientWidth;
            let pixel_to_duration_ratio = 86400 / full_width;
            // let time_value = pixel_to_duration_ratio * ele.offsetLeft;
            let fetched_start_time = format_to_seconds(ele.childNodes[0].innerText);
            let fetched_end_time = format_to_seconds(ele.childNodes[1].innerText);
            let marker_duration = (fetched_end_time - fetched_start_time).toFixed(0);

            //Realigning the markers
            // Start Points
            let new_left_value = parseFloat(fetched_start_time) / pixel_to_duration_ratio;
            let new_width_value = parseFloat(marker_duration) / pixel_to_duration_ratio;

            ele.style.left = `${new_left_value.toFixed(0)}px`;
            //End points
            ele.style.width = `${new_width_value.toFixed(0)}px`;
        });
    }
};
//Reassign Tracks
//Reslign the newly added tracks with times and width
const reassign_trackListeners = () => {
    //Setup the queryseelctors-core_function_drag
    core_function__drag();
    //Re-Align The Markers
    relign_markers.addEventListener('click', re_aligner);
    //New Track Adders
    load__grid.addEventListener('dblclick', new_track);
    add_track__div.addEventListener('click', add_track_function);
    //Drag Listener
    load__track.forEach(track_element => {
        track_element.addEventListener("dragstart", load__dragstart, false);
        track_element.addEventListener("dragover", load__dragover, false);
        track_element.addEventListener("dragenter", load__dragenter, false);
        track_element.addEventListener("dragleave", load__dragleave, false);
        track_element.addEventListener("dragend", load__dragend, false);
        track_element.addEventListener("drop", load__drop, false);
    });

};
let core_function__drag = () => {
    // Initialise-Variables---------------------------------------------------------------------
    branded__items = document.querySelectorAll('.brand_items'); //Select all the generic loads
    load__items = document.querySelectorAll('.load_items'); //Select all the generic loads
    load__grid = document.querySelector('.loads_grid__div'); // load grid container
    load__track = document.querySelectorAll('.load_track__div'); //Select all the load tracks

    load__marker = document.querySelectorAll('.load_marker__div'); //Select all markers div
    load__info = document.querySelector("#info__div"); //Select info div

    add_track__div = document.querySelector("#add_track_id"); //Add Tracks DIV
    relign_markers = document.querySelector("#align_grid"); //Align Markers

    load__marker = document.querySelectorAll('.load_marker__div');

    //Load-markers-Listeners
    if (load__marker.length != 0) {
        load__marker.forEach(ele => {
            ele.addEventListener('contextmenu', e => {
                e.preventDefault();
                let sync_elements = document.querySelectorAll('[data-syncdata]');
                sync_elements.forEach(sync_element => {
                    if (sync_element.dataset.syncdata == ele.dataset.syncdata) {
                        sync_element.remove();
                    }
                });
                ele.remove();
            }, false);
            ele.addEventListener('click', e => {
                e.preventDefault();
                //TODO
                // console.log(ele.dataset);
                let modal_identifier = document.querySelector('.modal_marker_slide');
                // Show the modal screen
                modal_identifier.style.transform = "translateX(0)";
                marker_function_setting(ele);//marker for time setting

            }, false);
            // Marker Mouse Pointer
            ele.addEventListener('mousedown', e => {
                e.target.style.backgroundColor = "blue";
                if (e.altKey) {
                    e.target.setAttribute("draggable", "true");
                }
            }, false);
            // Marker Mouse Pointer
            ele.addEventListener('mouseup', e => {
                e.target.style.backgroundColor = "";
                e.preventDefault();
                if (e.altKey) {
                    e.target.setAttribute("draggable", "false");
                }
            }, false);
            ele.addEventListener('dragleave', e => {
                e.target.style.backgroundColor = "";
                e.preventDefault();
                console.log("Drag Leave");
                if (e.altKey) {
                    e.target.setAttribute("draggable", "false");
                }
            }, false);
            // Marker Mouse leave
            ele.addEventListener('mouseleave', e => {
                e.target.style.backgroundColor = "";
            }, false);
            //Wheeling over on marker
            ele.addEventListener('wheel', e => {
                e.preventDefault();
                let left_position = e.target.style.left.split("px");
                let right_position = e.target.style.right.split("px");
                if (e.wheelDelta > 0) {
                    if (e.shiftKey) {
                        if ((right_position[0] + 1) >= 0 && (right_position[0] + 1) < 10) {
                            e.target.style.left = `${parseInt(left_position[0]) + 1}px`;
                        }
                        if ((right_position[0] + 10) >= 0) {
                            e.target.style.left = `${parseInt(left_position[0]) + 10}px`;
                        }
                    } else if (e.ctrlKey) {
                        e.target.style.width = `${e.target.clientWidth + 5}px`;
                    }
                }
                else {
                    if (e.shiftKey) {
                        if ((left_position[0] - 10) >= 0 && (left_position[0] - 10) < 10) {
                            e.target.style.left = `${parseInt(left_position[0]) - 1}px`;
                        }
                        if ((left_position[0] - 10) >= 0) {
                            e.target.style.left = `${parseInt(left_position[0]) - 10}px`;
                        }
                    } else if (e.ctrlKey) {
                        e.target.style.width = `${e.target.clientWidth - 5}px`;
                    }
                }
                let full_width = ele.parentElement.clientWidth;
                let pixel_ratio_sec = 86400 / full_width; // 86400 is no. of seconds in a day

                let start_time = pixel_ratio_sec * ele.offsetLeft;
                let end_time = pixel_ratio_sec * (ele.offsetLeft + ele.offsetWidth);

                ele.childNodes[0].innerHTML = seconds_to_format(start_time.toFixed(0));
                ele.childNodes[1].innerHTML = seconds_to_format(end_time.toFixed(0));
            }, false);
        });
    }


    // Modal programming
    let modal_ok_btn = document.querySelector("#marker_modal__okBtn");
    let modal_cancel_btn = document.querySelector("#marker_modal__cancelBtn");
    //TODO - DATASETS
    modal_ok_btn.addEventListener('click', e => {
        e.target.parentNode.offsetParent.style.transform = "translateX(-100%)";
        let start_time_input = document.querySelector('#startTime__input');
        let end_time_input = document.querySelector('#endTime__input');
        let start_time_seconds = (start_time_input.value.split(":")[0] * 3600) + (start_time_input.value.split(":")[1] * 60);
        let end_time_seconds = (end_time_input.value.split(":")[0] * 3600) + (end_time_input.value.split(":")[1] * 60);
        if (start_time_seconds > end_time_seconds) {
            console.log("SWITCHING THE START AND END TIMES");
        }
        let sync_elements = document.querySelectorAll('[data-syncdata]');
        let transfer_data = document.querySelector('#transfer_id');
   
        sync_elements.forEach(ele => {
            if (ele.className == "load_marker__div" && ele.dataset.syncdata == transfer_data.innerText) {
                let full_width = ele.parentElement.clientWidth;
                let pixel_ratio_sec = 86400 / full_width;
                let synced_duration = Math.abs(end_time_seconds - start_time_seconds);
                ele.style.left = `${(start_time_seconds / pixel_ratio_sec).toFixed(0)}px`;
                ele.style.width = `${(synced_duration / pixel_ratio_sec).toFixed(0)}px`;
                // datasets
                let marker_appname = document.querySelector('#marker_appname');
                let marker_load_qty = document.querySelector('#marker_load_qty');
                let marker_load_power = document.querySelector('#marker_load_power');
                let marker_load_model = document.querySelector('#marker_load_model');
                let marker_load_schedulable = document.querySelector('#marker_load_schedulable');

                ele.dataset.powerdata = marker_load_power.value;
                ele.dataset.qtydata = marker_load_qty.value;
                ele.dataset.appname = marker_appname.value;
                ele.dataset.modellingdata = marker_load_model.value;
                
                //TODO
                //set the usage _frequency
                let usage_frequency = document.querySelectorAll('.usage_day__checkbox');
                let usage_frequency__objects = {};
                usage_frequency.forEach((ele, index) => {
                    usage_frequency__objects[index] = ele.checked;
                });
                ele.dataset.usage_frequency = JSON.stringify(usage_frequency__objects);                
                ele.dataset.schedulabledata = marker_load_schedulable.checked;
                ele.childNodes[0].innerHTML = seconds_to_format(start_time_seconds.toFixed(0));
                ele.childNodes[1].innerHTML = seconds_to_format(end_time_seconds.toFixed(0));
            }
        });
    });

    modal_cancel_btn.addEventListener('click', e => {
        e.target.parentNode.offsetParent.style.transform = "translateX(-100%)";
    });

   

    // // Processing the data
    // let processin_btn = document.querySelector('#process_data');
    // processin_btn.addEventListener('click', () => {
    //     //Load Matrix Generator - Probability Matrix Creation
    //     console.log(load_matrix_generator());
    // });
};

const load_design_loader = (load_design_object) => {
    console.log(load_design_object);
    let grid_info_data = document.querySelector('.load_infobar__div');
    let grid_marker_data = document.querySelector('.loads_grid__div');

    grid_info_data.innerHTML = "";
    grid_marker_data.innerHTML = "";


    //TODO Parsing Design Data


    //load the tracks and bars
    let design_data = load_design_object;//JSON.parse(localStorage.getItem('design_object_test'));
    console.log(JSON.parse(localStorage.getItem('design_object_test')));
    console.log(design_data);
    console.log(design_data.info_data[0].load_id);

    let no_of_tracks = parseInt(design_data.tracks_count);
    console.log(no_of_tracks);
    //First - Generate Tracks and Info Bars..
    for (let t_count = 0; t_count < no_of_tracks; t_count++) {
        //info Bar
        let new_info_element = document.createElement('div');
        new_info_element.classList.add('load_info');
        grid_info_data.appendChild(new_info_element);
        //load_tracks
        let new_load_track = document.createElement('div');
        new_load_track.classList.add('load_track__div');
        grid_marker_data.appendChild(new_load_track);
    }
    //populate the data
    let no_of_loads = design_data.info_data.length;
    for (let l_count = 0; l_count < no_of_loads; l_count++) {
        //load the data- info
        let info_data__div = document.createElement('div');
        info_data__div.dataset.syncdata = design_data.info_data[l_count].load_id;
        info_data__div.innerHTML = `<div>${design_data.info_data[l_count].load_name}</div>`;
        grid_info_data.childNodes[parseInt(design_data.info_data[l_count].track_id)].appendChild(info_data__div);

        //load the marker data
        let full_width = grid_marker_data.childNodes[parseInt(design_data.loading_data[l_count].track_id)].clientWidth;
        let pixel_ratio_sec = 86400 / full_width;

        // left and width data
        let marker_start = (format_to_seconds(design_data.loading_data[l_count].starttime) / pixel_ratio_sec).toFixed(0);
        let marker_end = (format_to_seconds(design_data.loading_data[l_count].endtime) / pixel_ratio_sec).toFixed(0);
        let marker_data__div = document.createElement('div');
        marker_data__div.dataset.appname = design_data.loading_data[l_count].dataset.appname;
        marker_data__div.dataset.manufacturer = design_data.loading_data[l_count].dataset.manufacturer;
        marker_data__div.dataset.modellingdata = design_data.loading_data[l_count].dataset.modellingdata;
        marker_data__div.dataset.powerdata = design_data.loading_data[l_count].dataset.powerdata;
        marker_data__div.dataset.powerfactor = design_data.loading_data[l_count].dataset.powerfactor;
        marker_data__div.dataset.qtydata = design_data.loading_data[l_count].dataset.qtydata;
        marker_data__div.dataset.scenario = design_data.loading_data[l_count].dataset.scenario;
        marker_data__div.dataset.schedulabledata = design_data.loading_data[l_count].dataset.schedulabledata;
        marker_data__div.dataset.syncdata = design_data.loading_data[l_count].dataset.syncdata;
        marker_data__div.dataset.type = design_data.loading_data[l_count].dataset.type;
        marker_data__div.dataset.voltage = design_data.loading_data[l_count].dataset.voltage;
        
        marker_data__div.dataset.usage_frequency = design_data.loading_data[l_count].dataset.usage_frequency;
        marker_data__div.dataset.misc = design_data.loading_data[l_count].dataset.misc;
        
        marker_data__div.setAttribute("draggable", "false");
        marker_data__div.innerHTML = `<div class="marker_left">${design_data.loading_data[l_count].starttime}</div><div class="marker_right">${design_data.loading_data[l_count].endtime}</div>`;
        marker_data__div.setAttribute("class", "load_marker__div");
        marker_data__div.style.left = `${marker_start}px`;
        marker_data__div.style.width = `${marker_end - marker_start}px`;
        grid_marker_data.childNodes[parseInt(design_data.loading_data[l_count].track_id)].appendChild(marker_data__div);
    }
    reassign_trackListeners();
};

const marker_function_setting = (element) => {
    let start_time_input = document.querySelector('#startTime__input');
    let end_time_input = document.querySelector('#endTime__input');

    let marker_appname = document.querySelector('#marker_appname');
    let marker_load_qty = document.querySelector('#marker_load_qty');
    let marker_load_power = document.querySelector('#marker_load_power');
    let marker_load_model = document.querySelector('#marker_load_model');
    let marker_load_schedulable = document.querySelector('#marker_load_schedulable');

    // let usage_frequency = document.querySelector('#usage_frequency__form');
    let usage_frequency = document.querySelectorAll('.usage_day__checkbox');
    //test
    // console.log(element.dataset);
    marker_load_power.value = element.dataset.powerdata;
    marker_load_qty.value = element.dataset.qtydata;
    marker_appname.value = element.dataset.appname;
    //Usage Frequency Settings    
    let usage_frequency__objects = JSON.parse(element.dataset.usage_frequency);    
    usage_frequency.forEach((ele,index)=>{
        ele.checked = usage_frequency__objects[index];
    });

    
    marker_load_model.value = element.dataset.modellingdata;
    if (element.dataset.schedulabledata == "true" || element.dataset.schedulabledata == "True") {
        marker_load_schedulable.checked = true;
    }
    else {
        marker_load_schedulable.checked = false;
    }

    let full_width = element.parentElement.clientWidth;
    let pixel_ratio_sec = 86400 / full_width;
    let start_time = pixel_ratio_sec * element.offsetLeft;
    let end_time = pixel_ratio_sec * (element.offsetLeft + element.offsetWidth);
    let formatted_start_time = seconds_to_format(start_time.toFixed(0));
    let formatted_end_time = seconds_to_format(end_time.toFixed(0));

    start_time_input.value = formatted_start_time;
    end_time_input.value = formatted_end_time;
    let transfer_id_data = document.querySelector("#transfer_id");
    transfer_id_data.innerText = element.dataset.syncdata;
};

//TODO - Model Functions
// The Modelling FUnctions
const model_functions = (load_parameters, weather_parameters=null) => {
    // progress bars
    progress_data(0);
    console.log(load_parameters);
    // Convert hour data into minutse
    let no_of_days = 7;
    let no_of_minutes = 24 * 60 * no_of_days;//*365;
    let weekly_min_array = [...Array(no_of_minutes).keys()];
    let insol_min__data = [];
    let temp_min__data = [];
    let hour_count__modelling = 0;
    let day_count__modelling = 0;
    // usage and frequency - identification        
    let plotting_load_set = []; 
    let new_load_parameters = [];
    let temp_load_param_object = {};
    //TODO Weekly variation record
    load_parameters.forEach(load_data=>{
        temp_load_param_object = {};
        temp_load_param_object = load_data;
        // load arrangement
        console.log(load_data);
        // console.log(temp_load_param_object);
        let full_week_switching = new Array(no_of_minutes).fill(0);
        let usage_day_count = -1;


        //TODO Issue with JSON when clearing the tracks
        let usage_frequency = (JSON.parse(load_data.usage_frequency));
        for(let m=0;m<=no_of_minutes-1;m++){
            if(m % 1440 == 0){
                usage_day_count++;
            }
            if(usage_day_count % 7 == 0){
                if (usage_frequency[0]){
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }                
            }
            else if(usage_day_count % 7 == 1){
                if (usage_frequency[1]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
            else if(usage_day_count % 7 == 2){
                if (usage_frequency[2]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
            else if(usage_day_count % 7 == 3){
                if (usage_frequency[3]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
            else if(usage_day_count % 7 == 4){
                if (usage_frequency[4]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
            else if(usage_day_count % 7 == 5){
                if (usage_frequency[5]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
            else if(usage_day_count % 7 == 6){
                if (usage_frequency[6]) {
                    full_week_switching[m] = 1 * parseInt(load_data.switching_profile[m % 1440]);
                }
            }
        }
        //Data Pushing
        plotting_load_set.push(full_week_switching);
        temp_load_param_object.full_week_usage = full_week_switching;
        new_load_parameters.push(temp_load_param_object);
        // console.log(full_week_switching);
    });
    // console.log(new_load_parameters);
    //TODO - Check the load parameter variable
    load_parameters = new_load_parameters;

    let load_switching_plot = document.querySelector('#plotter_switching');
    let load_switching_data = [];
    progress_data(10);
    plotting_load_set.forEach((array_data,index)=>{
        // console.log(load_parameters);
        let intermitt_plot__data = {};
        intermitt_plot__data.y = array_data;
        intermitt_plot__data.name = load_parameters[index].name;
        // intermitt_plot__data.mode = 'markers';
        // intermitt_plot__data.type = 'line';
        load_switching_data.push(intermitt_plot__data);
    });
    // console.log(load_switching_data);
    let layout_switching = {
        title: 'Switching Frequencies - Week',
        xaxis: {
            title: 'Minutes of the Week'
        },
        yaxis: {
            title: 'State of Appliance'
        }
    };
    Plotly.newPlot(load_switching_plot, load_switching_data, layout_switching, { displayModeBar: false });

    // Weather Param loading
    let mins_in_year = 365*24*60;
    for (let weat_d = 0; weat_d < mins_in_year; weat_d++) {
        //Hour Counter
        if ((weat_d % 60 == 0)) {
            hour_count__modelling++;
        }
        //TODO Progress Bar
        progress_data(((weat_d / no_of_minutes) * 100).toFixed(0));
        //Loading Weather-params
        insol_min__data[weat_d] = weather_parameters.insolation[hour_count__modelling];
        temp_min__data[weat_d] = weather_parameters.temperature[hour_count__modelling];
        
    }
    progress_data(60);
    for (let param = 0; param < load_parameters.length;param++){     //no of loads
        let transfer_data = {};
        //Refrigerator 
        if (load_parameters[param].modellingdata == "residential-kitchen_refrigeration") {
            console.log(load_parameters[param].name);
        }
        //TODO
        //Air Conditioning
        else if (load_parameters[param].modellingdata == "residential-cooling"){
            load_parameters[param].full_year_profile = {};
            transfer_data = {};
            transfer_data.load_parameters = load_parameters;
            transfer_data.insol_min__data = insol_min__data;
            transfer_data.temp_min__data = temp_min__data;
            transfer_data.no_of_minutes = no_of_minutes;
            transfer_data.param = param;
        }
        //Washing Machine
        else if (load_parameters[param].modellingdata == "residential-washing"){
            transfer_data = {};
            transfer_data.load_parameters = load_parameters;
            transfer_data.insol_min__data = insol_min__data;
            transfer_data.temp_min__data = temp_min__data;
            transfer_data.no_of_minutes = no_of_minutes;
            transfer_data.param = param;
            // residential_washing(load_parameters, insol_min__data, temp_min__data, no_of_minutes, param);
            residential_washing__model(transfer_data);
        }
        //Exterior Lights
        else if (load_parameters[param].modellingdata == "residential-exterior-lighting"){
            // console.log(load_parameters[param].modellingdata);
            // console.log(load_parameters[param].power_profile);
            load_parameters[param].full_year_profile = {};  
        }
        //Office Timings
        else if (load_parameters[param].modellingdata == "commercial-interior-lighting"){
            // console.log(load_parameters[param].modellingdata);
            // console.log(load_parameters[param].power_profile);
            load_parameters[param].full_year_profile = {};
        }
    }
    let power_array__weekly = [];
    let weekly_powerProfile = new Array(no_of_minutes).fill(0);//Power profile of the loads in a week

    load_parameters.forEach((load_data,index,array)=>{
        let powerData_weekly = load_data.full_week_usage.map((data)=>{
            return data  * load_data.powerdata;
        });
        power_array__weekly.push(powerData_weekly);
        //populate-load_params into main object
        array[index].weekly_powerProfile = powerData_weekly;

        weekly_powerProfile = powerData_weekly.map((p_data,p_index)=>{
            return p_data + weekly_powerProfile[p_index];
        });      
    });
    console.log(load_parameters); //Load Data with FUll Week Power Data
    progress_data(80);
        //load profile-WEEK-Display model
    let weekly_profile__plot = document.querySelector('#plotter_weekly_loading');
    
    let weekly_powerPlot = {};
    weekly_powerPlot.x = weekly_min_array;
    weekly_powerPlot.y = weekly_powerProfile;
    weekly_powerPlot.mode = 'lines';
    // weekly_powerPlot.line = { shape: 'spline' };
    weekly_powerPlot.type = 'scatter';
    weekly_powerPlot.name = "Load Profile - Weekly";
    let weekly_profile__layout = {
        title: 'Load Profile - Week',
        xaxis: {
            title: 'Minutes of the Week'
        },
        yaxis: {
            title: 'Power Rating'
        }
    };
    Plotly.newPlot(weekly_profile__plot, [weekly_powerPlot], weekly_profile__layout, { displayModeBar: false });

    progress_data(100);
    return load_parameters;
};

//Load Matrix Generator - Probability Matrix Creation - Function
const load_matrix_generator = () => {
    // load_martrix_object
    let load_matrix_array = [];
    let max_array_points_per_load = 1440; //24 x 60
    // Get the Width and Find the hour equivalent
    let full_width = document.querySelector('.load_track__div');
    let pixel_ratio_sec = 86400 / full_width.clientWidth;
    //get the tracks
    load__track = document.querySelectorAll('.load_track__div');

    // console.log(load__track.length);

    let track_id = 0;
    load__track.forEach(e => {
        let tracks__node = e.childNodes;
        tracks__node.forEach(node_element => {
            let load_matrix_object = {};
            //TODO
            console.log(node_element.dataset);
            load_matrix_object.name = node_element.dataset.appname;
            load_matrix_object.load_channel = track_id;
            load_matrix_object.misc = node_element.dataset.misc;
            load_matrix_object.powerdata = node_element.dataset.powerdata;
            load_matrix_object.modellingdata = node_element.dataset.modellingdata;
            load_matrix_object.qtydata = node_element.dataset.qtydata;
            load_matrix_object.schedulabledata = node_element.dataset.schedulabledata;
            load_matrix_object.usage_frequency = node_element.dataset.usage_frequency;
            load_matrix_object.startTime = ((node_element.offsetLeft * pixel_ratio_sec) / 60).toFixed(0);
            load_matrix_object.endTime = (((node_element.clientWidth + node_element.offsetLeft) * pixel_ratio_sec) / 60).toFixed(0);

            if (load_matrix_object.startTime > max_array_points_per_load) {
                load_matrix_object.startTime = max_array_points_per_load;
            }
            if (load_matrix_object.endTime > max_array_points_per_load) {
                load_matrix_object.endTime = max_array_points_per_load;
            }
            if (load_matrix_object.startTime != load_matrix_object.endTime) {
                let load_array = new Array(max_array_points_per_load).fill(0);
                let power_array = new Array(max_array_points_per_load).fill(0);
                //Create the Array for usage stats
                for (let l_data = 0; l_data < max_array_points_per_load; l_data++) {
                    // check start time
                    if (l_data > load_matrix_object.startTime && l_data < load_matrix_object.endTime) {
                        load_array[l_data] = 1;
                        power_array[l_data] = parseFloat(load_matrix_object.powerdata) * parseInt(load_matrix_object.qtydata);
                    }
                }
                load_matrix_object.switching_profile = load_array;
                load_matrix_object.power_profile = power_array;
                load_matrix_array.push(load_matrix_object);
            }
        });
        track_id += 1;
        
    });
    console.log(load_matrix_array);
    // let no_of_loads = load_matrix_array.length;
    let time_axis_array = Array(max_array_points_per_load).fill(0);
    //Load Profile Metadata Array
    let final_load_profile = Array(max_array_points_per_load).fill(0);
    load_matrix_array.forEach(load_meta => {
        for (let time_id = 0; time_id < max_array_points_per_load; time_id++) {
            final_load_profile[time_id] += parseFloat(load_meta.power_profile[time_id]);
        }
    });

    for (let i = 0; i < max_array_points_per_load; i++) {
        time_axis_array[i] = i;
    }

    //Classification of load profile - based of max demand of the day
    let max_demand = final_load_profile.reduce(function (a, b) {
        return Math.max(a, b);
    }, 0);

    let classification_max_demand = [0, 0, 0, 0]; //100,75,50,25]
    for (let i = 0; i < max_array_points_per_load; i++) {
        let percentage_loading = final_load_profile[i] / max_demand;
        //75% - 100%
        if (percentage_loading >= 0.75 && percentage_loading <= 1) {
            classification_max_demand[0] += 1;
        }
        //50% - 75% 
        if (percentage_loading >= 0.50 && percentage_loading < 0.75) {
            classification_max_demand[1] += 1;
        }
        // 25% - 50%
        if (percentage_loading >= 0.25 && percentage_loading < 0.50) {
            classification_max_demand[2] += 1;
        }
        // 0% - 25%
        if (percentage_loading >= 0 && percentage_loading < 0.25) {
            classification_max_demand[3] += 1;
        }
    }
    // console.log(max_demand);
    // console.log(final_load_profile);
    // console.log(classification_max_demand);


    //TODO
    //Model Incorporatons
    load_matrix_array = model_functions(load_matrix_array, JSON.parse(localStorage.getItem('weather_data')));
    // model_functions(load_matrix_array, JSON.parse(localStorage.getItem('weather_data'))).then(()=>{
    //     console.log("ITS DONE");
    // });
    // console.log(load_matrix_array);


    // Plotly
    let load_profile_plot = document.querySelector('.plotter_1');
    // let load_distribution_plot = document.querySelector('.plotter_3');
    


    let load_profile_sketch = {
        x: time_axis_array,
        y: final_load_profile
        // line: { shape: 'spline' }
    };
    let load_distribution_inset = {
        x: ['> 75', '> 50', '> 25', '> 0'],
        y: classification_max_demand,
        xaxis: 'x2',
        yaxis: 'y2',
        type: 'bar'
    };

    let load_data = [load_profile_sketch, load_distribution_inset];

    let layout = {
        title: 'Load Profile',
        showlegend: false,
        xaxis: {
            title: 'Time in minutes'
        },
        yaxis: {
            title: 'Power (Watts)'
        },
        yaxis2: {
            title: 'Frequency',
            domain: [0.7, 1],
            anchor: 'x2'
        },
        xaxis2: {
            title: 'Power Range',
            domain: [0.9, 1],
            anchor: 'y2'
        }
    };
    // let layout_2 = {
    //     title: 'Load Distribution',
    //     xaxis: {
    //         title: 'Power Range'
    //     },
    //     yaxis: {
    //         title: 'Frequency'
    //     }
    // };
    Plotly.newPlot(load_profile_plot, load_data, layout, { displayModeBar: false });
    // Plotly.newPlot(load_distribution_plot, load_distribution_data, layout_2);
    // Plotly.newPlot(load_distribution_plot, load_distribution_data, layout_2, { displayModeBar: false });

    // Status Bar Program
    let status_bar = document.querySelector("#status__div");
    status_bar.style.transform = "translateY(0)";
    status_bar.innerHTML = `<div>Hello Bro !!!</div>`;
    //Redo all the listeners
    setTimeout(() => {
        status_bar.style.transform = "translateY(100%)";
        status_bar.innerHTML = `<div>Hello Bye!!!</div>`;
    }, 2000);
};
napp.directive("callbackOnEnd", function () {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            if (scope.$last) {
                scope.$eval(attrs.callbackOnEnd);
                branded__items = document.querySelectorAll('.brand_items');
                branded__items.forEach(brand_element => {
                    brand_element.addEventListener("dragstart", load__dragstart, false);
                });
            }
        }
    };
});
//auto_load_loader_controller
napp.controller('auto_load_loader_controller', function ($scope, $http, $rootScope, $q, $window) {
    document.querySelector("#template_DELETE").disabled = true;
    
    
    
    
    $scope.template_save_enabled = true;
    $scope.template_name__change = ()=>{
        if ($scope.template_name__modal != null){
            if ($scope.template_name__modal.length > 3) {
                $scope.template_save_enabled = false;
            }
            else {
                $scope.template_save_enabled = true;
            }       
        }
       
    };    
    // $scope.template_refresh__btn = ()=>{
    //     // $scope.template_save_enabled = false;
    // };
    let template_refresh__btn = document.querySelector("#template_REFRESH");
    template_refresh__btn.addEventListener('click', () => {
        // console.log("CLICKED");
        $http.get('../database/load_design_templates.json').then(function (response) {
            //data sorting        
            template_data = response.data;
            $scope.template_data = response.data;
            status_activate("Templates are refreshed", 2000, "#668D3C", "#FAF0E6");
        }, function (err) {
            console.log(err);
        });

    });


    $scope.usage_allday = true;
    $scope.usage_frequency = {
        "sunday": true,
        "monday": true,
        "tuesday": true,
        "wednesday": true,
        "thursday": true,
        "friday": true,
        "saturday": true
    };

    let usage_all_day = document.querySelector('.usage_allday__checkbox');
    usage_all_day.addEventListener('change',()=>{
        if (usage_all_day.checked){
            $scope.usage_frequency = {
                "sunday": true,
                "monday": true,
                "tuesday": true,
                "wednesday": true,
                "thursday": true,
                "friday": true,
                "saturday": true
            };
          }  
          else{
            $scope.usage_frequency = {
                "sunday": false,
                "monday": false,
                "tuesday": false,
                "wednesday": false,
                "thursday": false,
                "friday": false,
                "saturday": false
            };
          }
    });
    //Template Loading
    //TODO Template
    let template_data = {};
    $http.get('../database/load_design_templates.json').then(function (response) {
        //data sorting        
        template_data = response.data;
        $scope.template_data = response.data;
    }, function (err) {
        console.log(err);
    });

    //TODO Template Loading Works
    let template_selection = document.querySelector("#template_selector");
    template_selection.addEventListener('change', e => {
        let template_delete__btn = document.querySelector("#template_DELETE");
        if (e.target.value != "Select a Template") {
            template_delete__btn.disabled = false;
            // console.log(design_data);
            $scope.template_data.forEach(load_node => {
                // console.log(load_node.arrange_name);
                if (e.target.value == load_node.arrange_name) {
                    load_design_loader(load_node);
                }
            });
        }
        else{
            template_delete__btn.disabled = true;
        }
    });
    let grid_model_data = document.querySelector('.loads_grid__div');
    let grid_info_data = document.querySelector('.load_infobar__div');
    grid_model_data.innerHTML = "";
    grid_info_data.innerHTML = "";
    grid_model_data.innerHTML = `<div class="load_track__div"></div><div class="load_track__div"></div>`;
    grid_info_data.innerHTML = `<div class="load_info"></div><div class="load_info"></div>`;

    
    
    
    
    
    
    
    
    
    
    
    
    // Data loading
    $http.get('../database/loads_appliances.json').then(function (response) {
        //data sorting
        $scope.loads_data = response.data;
    }, function (err) {
        console.log(err);
    });


    // Indian Market Appliance Loading
    $http.get('../database/appliance_listing/AC_fixed.json').then(function (response) {
        //data sorting
        // let load__ac_fixed = response.data;
        $scope.load__ac_fixed = response.data;
        // console.log(load__ac_fixed);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/ceiling_fan.json').then(function (response) {
        //data sorting
        // let load__ceiling_fan = response.data;
        $scope.load__ceiling_fan = response.data;
        // console.log(load__ceiling_fan);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/inverter_ac.json').then(function (response) {
        //data sorting
        // let load__inverter_ac = response.data;
        $scope.load__inverter_ac = response.data;
        // console.log(load__inverter_ac);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/computer_monitors.json').then(function (response) {
        //data sorting
        // let load__computer_monitors = response.data;
        $scope.load__computer_monitors = response.data;
        // console.log(load__computer_monitors);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/deep_freezer.json').then(function (response) {
        //data sorting
        // let load__deep_freezer = response.data;
        $scope.load__deep_freezer = response.data;
        // console.log(load__deep_freezer);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/frost_free_refrigerator.json').then(function (response) {
        //data sorting
        // let load__frost_free_refrigerator = response.data;
        $scope.load__frost_free_refrigerator = response.data;
        // console.log(load__frost_free_refrigerator);
    }, function (err) {
        console.log(err);
    }); 
    $http.get('../database/appliance_listing/LED_lamps.json').then(function (response) {
        //data sorting
        // let load__LED_lamps = response.data;
        $scope.load__LED_lamps = response.data;
        // console.log(load__LED_lamps);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/TFL.json').then(function (response) {
        //data sorting
        // let load__TFL = response.data;
        $scope.load__TFL = response.data;
        // console.log(load__TFL);
    }, function (err) {
        console.log(err);
    }); 
    $http.get('../database/appliance_listing/submersible_pump.json').then(function (response) {
        //data sorting
        // let load__submersible_pump = response.data;
        $scope.load__submersible_pump = response.data;
        // console.log(load__submersible_pump);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/microwave.json').then(function (response) {
        //data sorting
        // let load__microwave = response.data;
        $scope.load__microwave = response.data;
        // console.log(load__microwave);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/water_heater.json').then(function (response) {
        //data sorting
        // let load__water_heater = response.data;
        $scope.load__water_heater = response.data;
        // console.log(load__water_heater);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/chillers.json').then(function (response) {
        //data sorting
        // let load__chillers = response.data;
        $scope.load__chillers = response.data;
        // console.log(load__chillers);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/washing_machine.json').then(function (response) {
        //data sorting
        // let load__washing_machine = response.data;
        $scope.load__washing_machine = response.data;
        // console.log(load__washing_machine);
    }, function (err) {
        console.log(err);
    }); 
    $http.get('../database/appliance_listing/openwell_submersible_pump.json').then(function (response) {
        //data sorting
        // let load__openwell_sub_pump = response.data;
        $scope.load__openwell_sub_pump = response.data;
        // console.log(load__openwell_sub_pump);
    }, function (err) {
        console.log(err);
    });
    $http.get('../database/appliance_listing/monoset_pump.json').then(function (response) {
        //data sorting
        // let load__monoset_pump = response.data;
        $scope.load__monoset_pump = response.data;
        // console.log(load__monoset_pump);
    }, function (err) {
        console.log(err);
    }); 
    $http.get('../database/appliance_listing/direct_cool_refrigerators.json').then(function (response) {
        //data sorting
        // let load__direct_cool_refrigerator = response.data;
        $scope.load__direct_cool_refrigerator = response.data;
        // console.log(load__direct_cool_refrigerator);
    }, function (err) {
        console.log(err);
    });


    $scope.loads_data = {};
    $scope.load_wattage = {};

    // Active Button Changer 
    let side_menu_active_system = document.getElementsByClassName('left_side_menu');
    for (i = 0; i < side_menu_active_system.length; i++) {
        side_menu_active_system[i].classList.remove("active");
    }
    side_menu_active_system[6].classList.add("active");

    //status_bar
    status_activate("Auto Loader Page has loaded", 2000);

    //screen shifter
    $scope.manual_selection = function (input) {
        let screen_profile = document.querySelectorAll('.auto-load-loading__scroll_container');
        screen_profile[0].style.transform = `translateY(${input})`;//"translateY(-input)";
    };
    $scope.auto_profile_home = function () {
        let screen_profile = document.querySelectorAll('.auto_profile_main_container');
        screen_profile[0].style.transform = "translateY(0)";
    };

    // Variables---------------------------------------------------------------------
    branded__items = document.querySelectorAll('.brand_items');
    load__items = document.querySelectorAll('.load_items'); //Select all the generic loads
    load__grid = document.querySelector('.loads_grid__div'); // load grid container
    load__track = document.querySelectorAll('.load_track__div'); //Select all the load tracks

    load__marker = document.querySelectorAll('.load_marker__div'); //Select all markers div
    load__info = document.querySelector("#info__div"); //Select info div

    add_track__div = document.querySelector("#add_track_id"); //Add Tracks DIV
    relign_markers = document.querySelector("#align_grid"); //Align Markers
    
    angular.element(document).ready(() => {
        //-------------------FUNCTIONS
        re_aligner();
        core_function__drag();
//TODO  

        //Template load controls
        template_controls();

        // Attach Drag Drop - Load Items
        load__items.forEach(load_element => {
            // console.log(load_element.dataset);
            load_element.addEventListener("dragstart", load__dragstart, false);
        });
        // Drag Listener
        load__track.forEach(track_element => {
            // track_element.addEventListener("dragstart", load__dragstart, false);
            track_element.addEventListener("drag", load__drag, false);
            track_element.addEventListener("dragover", load__dragover, false);
            track_element.addEventListener("dragenter", load__dragenter, false);
            track_element.addEventListener("dragleave", load__dragleave, false);
            track_element.addEventListener("dragend", load__dragend, false);
            track_element.addEventListener("drop", load__drop, false);
        });
        // reassign_trackListeners();
        //listerners queryselectors
        add_track__div = document.querySelector("#add_track_id");// Add Track Button Addition
        load__grid = document.querySelector('.loads_grid__div');// The Grid 
        load__track = document.querySelectorAll('.load_track__div');// The Track
        load__info = document.querySelector("#info__div");// The Info

        //adding the grid saver/loader/clear
        let grid_save__button = document.querySelector("#save_grid");
        let grid_load__button = document.querySelector("#load_grid");
        let grid_clear__button = document.querySelector("#clear_grid");

        let processin_btn = document.querySelector('#process_data');

        grid_save__button.addEventListener('click', e => {
            //     let grid_model_data = document.querySelector('#slider_container');
            let grid_info_data = document.querySelector('.load_infobar__div');
            let grid_marker_data = document.querySelector('.loads_grid__div');
            // let grid_arrangement = grid_model_data.innerHTML.toString();
            // localStorage.setItem('grid_item', grid_arrangement);

            // No of info Tracks and Data---------------------
            let designer_info_object = {}; //the ultimate design object
            let no_of_tracks = 0;
            let info_containers = {};
            let info_temp_array = [];
            grid_info_data.childNodes.forEach(info_element => {
                if (info_element.className == "load_info") {
                    info_containers = {};
                    info_element.childNodes.forEach(node => {
                        info_containers.track_id = no_of_tracks;
                        info_containers.load_name = node.childNodes[0].innerText;
                        info_containers.load_id = node.dataset.syncdata;
                        info_temp_array.push(info_containers);
                    });
                    no_of_tracks += 1;
                }
            });
            designer_info_object.info_data = info_temp_array;
            //---MARKERS data_loading
            no_of_tracks = 0;
            let load_containers = {};
            let load_temp_array = [];
            grid_marker_data.childNodes.forEach(load_element => {
                if (load_element.className == "load_track__div") {
                    load_element.childNodes.forEach(node => {
                        load_containers = {};
                        load_containers.track_id = no_of_tracks;
                        // load_containers.load_name = node.childNodes[0].innerText;
                        load_containers.load_id = node.dataset.syncdata;
                        load_containers.dataset = node.dataset;
                        load_containers.starttime = node.childNodes[0].innerText;
                        // console.log(format_to_seconds(node.childNodes[0].innerText));
                        load_containers.endtime = node.childNodes[1].innerText;
                        load_temp_array.push(load_containers);
                    });
                    no_of_tracks += 1;
                }
            });
            // console.log(load_temp_array);
            // console.log(no_of_tracks);
            var name_of_design = "Current Design";
            designer_info_object.arrange_name = name_of_design;
            designer_info_object.loading_data = load_temp_array;
            designer_info_object.tracks_count = no_of_tracks;

            // console.log(designer_info_object);
            // Store in Local Storage
            // let load_design_data = JSON.stringify(designer_info_object);
            save_current_template(JSON.stringify(designer_info_object)); 
            // localStorage.setItem('design_object_test', load_design_data);           
            // ipcRenderer.send('save_load_design', load_design_data);
            // console.log("DATA SAVED");  
            // console.log(ipcRenderer);

        });
        grid_load__button.addEventListener('click', e => {

            let grid_info_data = document.querySelector('.load_infobar__div');
            let grid_marker_data = document.querySelector('.loads_grid__div');

            grid_info_data.innerHTML = "";
            grid_marker_data.innerHTML = "";
            
            //load the recent tracks and valuess
            let design_data = {};
            $http.get('../database/load_design_recent.json').then(function (response) {
                //data sorting
                design_data = response.data;             
                recent_design_loader();
            }, function (err) {
                console.log(err);
            });

           const recent_design_loader = ()=>{
               
            let no_of_tracks = parseInt(design_data.tracks_count);
            // First - Generate Tracks and Info Bars..
            for (let t_count = 0; t_count < no_of_tracks; t_count++) {
                //info Bar
                let new_info_element = document.createElement('div');
                new_info_element.classList.add('load_info');
                grid_info_data.appendChild(new_info_element);
                //load_tracks
                let new_load_track = document.createElement('div');
                new_load_track.classList.add('load_track__div');
                grid_marker_data.appendChild(new_load_track);
            }

            //populate the data
            let no_of_loads = design_data.info_data.length;
            for (let l_count = 0; l_count < no_of_loads; l_count++) {
                //load the data- info
                let info_data__div = document.createElement('div');
                info_data__div.dataset.syncdata = design_data.info_data[l_count].load_id;
                info_data__div.innerHTML = `<div>${design_data.info_data[l_count].load_name}</div>`;
                grid_info_data.childNodes[parseInt(design_data.info_data[l_count].track_id)].appendChild(info_data__div);

                //load the marker data
                let full_width = grid_marker_data.childNodes[parseInt(design_data.loading_data[l_count].track_id)].clientWidth;
                let pixel_ratio_sec = 86400 / full_width;
                // left and width data
                let marker_start = (format_to_seconds(design_data.loading_data[l_count].starttime) / pixel_ratio_sec).toFixed(0);
                let marker_end = (format_to_seconds(design_data.loading_data[l_count].endtime) / pixel_ratio_sec).toFixed(0);
                let marker_data__div = document.createElement('div');
                marker_data__div.dataset.appname = design_data.loading_data[l_count].dataset.appname;
                marker_data__div.dataset.manufacturer = design_data.loading_data[l_count].dataset.manufacturer;
                marker_data__div.dataset.modellingdata = design_data.loading_data[l_count].dataset.modellingdata;
                marker_data__div.dataset.powerdata = design_data.loading_data[l_count].dataset.powerdata;
                marker_data__div.dataset.powerfactor = design_data.loading_data[l_count].dataset.powerfactor;
                marker_data__div.dataset.qtydata = design_data.loading_data[l_count].dataset.qtydata;
                marker_data__div.dataset.scenario = design_data.loading_data[l_count].dataset.scenario;
                marker_data__div.dataset.schedulabledata = design_data.loading_data[l_count].dataset.schedulabledata;
                marker_data__div.dataset.syncdata = design_data.loading_data[l_count].dataset.syncdata;
                marker_data__div.dataset.type = design_data.loading_data[l_count].dataset.type;
                marker_data__div.dataset.voltage = design_data.loading_data[l_count].dataset.voltage;
                marker_data__div.dataset.usage_frequency = design_data.loading_data[l_count].dataset.usage_frequency;
                marker_data__div.dataset.misc = design_data.loading_data[l_count].dataset.misc;
                marker_data__div.setAttribute("draggable", "false");
                marker_data__div.innerHTML = `<div class="marker_left">${design_data.loading_data[l_count].starttime}</div><div class="marker_right">${design_data.loading_data[l_count].endtime}</div>`;
                marker_data__div.setAttribute("class", "load_marker__div");
                marker_data__div.style.left = `${marker_start}px`;
                marker_data__div.style.width = `${marker_end - marker_start}px`;
                grid_marker_data.childNodes[parseInt(design_data.loading_data[l_count].track_id)].appendChild(marker_data__div);
            }
            reassign_trackListeners();
           };
        });
        grid_clear__button.addEventListener('click', e => {
            let grid_model_data = document.querySelector('.loads_grid__div');
            let grid_info_data = document.querySelector('.load_infobar__div');
            grid_model_data.innerHTML = `<div class="load_track__div"></div><div class="load_track__div"></div>`;
            grid_info_data.innerHTML = `<div class="load_info"></div><div class="load_info"></div>`;
            reassign_trackListeners();
        });

        // Processing the data
    
        processin_btn.addEventListener('click', e=> {
            //Load Matrix Generator - Probability Matrix Creation
            // console.log(load_matrix_generator());
            // console.log(e);
            load_matrix_generator();
        });
        // console.log('page is fully Load at the end');
    });
    // -----------END
});// End Of COntroller

const residential_washing__model = (transfer_data)=>{
    // console.log(transfer_data);
    // let progress_data = document.querySelector('#model_progress');
    // progress_data.value = 0;   
    // load_parameters[param].full_year_profile = {};
    // let hour_count__modelling = 0;
    // let day_count__modelling = 0;
    // //iterate the entire profile loadings
    // for (let weat_d = 0; weat_d < no_of_minutes; weat_d++) {

    //     if (parseInt(insol_min__data[weat_d]) >= 100){
    //         console.log(`its so bright here at ${weat_d}`);
    //     }
    //     // progress_data.value = Number(weat_d / no_of_minutes);
    //     if ((weat_d % 60 == 0)) {
    //         // console.log("ITS AN HOUR");
    //         hour_count__modelling++;
    //     }
    //     if ((weat_d % 1440 == 0)) {
    //         // console.log("ITS A DAY");
    //         day_count__modelling++;
    //     }
    //     console.log("Washing");
    //     progress_data.value = ((weat_d / no_of_minutes)*100).toFixed(0);
    //     console.log(progress_data.value);
    // }
    
};

const residential_cooling__model = (transfer_data)=>{
    // console.log(transfer_data);
    let app_name = transfer_data.load_parameters[transfer_data.param].name;
    let adjusted_switching_profile = [];

    //For Residential cooling - Air Con
    if (app_name == 'Air Conditioner'){
        transfer_data.temp_min__data.forEach((tempr, index) => {
            let app_state = transfer_data.load_parameters[transfer_data.param].switching_profile[index];

            if ((parseFloat(tempr) >= 24) && app_state) {
                console.log("AC is Active");
                adjusted_switching_profile.push(1);
            }
            else {
                adjusted_switching_profile.push(0);
            }
        });
        transfer_data.load_parameters[transfer_data.param].full_year_profile = adjusted_switching_profile;
        return transfer_data;
    }
    //TODOInverter Air Con
    else if (app_name == 'Air Conditioners (Inverter)'){
        let ac_parameters_misc = JSON.parse(transfer_data.load_parameters[transfer_data.param].misc);
        // console.log(ac_parameters_misc);
        progress_data(0);
        transfer_data.temp_min__data.forEach((tempr, index) => {
            let app_state = transfer_data.load_parameters[transfer_data.param].switching_profile[index];
            
            let temp_indoor = parseFloat(tempr);
            let temp_outdoor = parseFloat(tempr);
            // console.log(app_state);
            // progress_data();
            progress_data((index/1440).toFixed(0));
            if ((temp_outdoor >= 24) && app_state) {
                console.log("AC Inv is Active");
                adjusted_switching_profile.push(1);
            }
            else {
                adjusted_switching_profile.push(0);
            }
        });
        transfer_data.load_parameters[transfer_data.param].full_year_profile = adjusted_switching_profile;
        return transfer_data;
    }
    else if (app_name == 'Fan'){
        console.log("Its a Fan");
        return transfer_data;
    }
    else{
        return transfer_data;
    }


};

const progress_data = (meter_data)=>{
    // console.log(meter_data);
    let p_bar = document.querySelector("#model_progress");
    // p_bar.value = 100;
    setTimeout(() => {
        p_bar.value = meter_data;
    }, 1);
};

const save_current_template = (load_design_data)=>{
    localStorage.setItem('design_object_test', load_design_data);
    ipcRenderer.send('save_recent_design', load_design_data);
    console.log("DATA SAVED");  
};
const save_the_template = (load_design_data)=>{
    // localStorage.setItem('design_object_test', load_design_data);
    ipcRenderer.send('save_template_design', load_design_data);
    console.log("DATA SAVED");  
};

// let template_save__btn = document.querySelector("#template_SAVE");
// let template_refresh__btn = document.querySelector("#template_REFRESH");
// console.log(template_save__btn);

const template_controls = () => {
    let template_save__btn = document.querySelector("#template_SAVE");
    let template_delete__btn = document.querySelector("#template_DELETE");
    // let template_refresh__btn = document.querySelector("#template_REFRESH");
    // // console.log(template_save__btn);
    // template_refresh__btn.addEventListener('click',()=>{

    // });

    template_save__btn.addEventListener('click', () => {
        let grid_info_data = document.querySelector('.load_infobar__div');
        let grid_marker_data = document.querySelector('.loads_grid__div');
        // No of info Tracks and Data---------------------
        let designer_info_object = {}; //the ultimate design object
        let no_of_tracks = 0;
        let info_containers = {};
        let info_temp_array = [];
        // console.log(grid_info_data);
        grid_info_data.childNodes.forEach(info_element => {
            if (info_element.className == "load_info") {
                info_containers = {};
                info_element.childNodes.forEach(node => {
                    info_containers.track_id = no_of_tracks;
                    info_containers.load_name = node.childNodes[0].innerText;
                    info_containers.load_id = node.dataset.syncdata;
                    info_temp_array.push(info_containers);
                });
                no_of_tracks += 1;
            }
        });
        designer_info_object.info_data = info_temp_array;
        //---MARKERS data_loading
        no_of_tracks = 0;
        let load_containers = {};
        let load_temp_array = [];
        grid_marker_data.childNodes.forEach(load_element => {
            if (load_element.className == "load_track__div") {
                load_element.childNodes.forEach(node => {
                    load_containers = {};
                    load_containers.track_id = no_of_tracks;
                    // load_containers.load_name = node.childNodes[0].innerText;
                    load_containers.load_id = node.dataset.syncdata;
                    load_containers.dataset = node.dataset;
                    load_containers.starttime = node.childNodes[0].innerText;
                    // console.log(format_to_seconds(node.childNodes[0].innerText));
                    load_containers.endtime = node.childNodes[1].innerText;
                    load_temp_array.push(load_containers);
                });
                no_of_tracks += 1;
            }
        });

        let arrangement_name = document.querySelector("#template_name__textbox");

        var name_of_design = arrangement_name.value;
        designer_info_object.arrange_name = name_of_design;
        designer_info_object.loading_data = load_temp_array;
        designer_info_object.tracks_count = no_of_tracks;

        // Check for load count
        // console.log(designer_info_object);
        if (designer_info_object.info_data.length > 0) {
            save_the_template(JSON.stringify(designer_info_object));
            status_activate("Saved your arrangement successfully", 5000, "#668D3C","#FAF0E6");
        }
        else{
            status_activate("Cannot Save, please add load and try again", 5000, "#8F3B1B", "#FAF0E6");
        }
        // 
        // console.log(JSON.stringify(designer_info_object));
        // console.log(designer_info_object);
    });
    template_delete__btn.addEventListener('click',()=>{
        let template_selection = document.querySelector("#template_selector");
        delete_the_template(template_selection);
    });
};

const delete_the_template = (template_selection)=>{
    // ipcRenderer.invoke('some-name', template_selection).then((result) => {
    //     console.log(result); 
    // });
    // // console.log(template_selection.value);
    ipcRenderer.send('delete_template_design', template_selection.value);
    
    ipcRenderer.on('delete_status',(event,data)=>{
        console.log(data);
        if (data == "DELETED"){
            console.log("DATA DELETED");  
            status_activate("Selected Template Deleted Successfully.", 5000, "#668D3C", "#FAF0E6");
            // auto refresh
            setTimeout(() => {
                document.querySelector("#template_REFRESH").click(); 
            }, 2000);
        }
        else{
            status_activate("Data Not Deleted. You data is safe.", 5000, "#668D3C", "#FAF0E6");
        }
    });

    
    
    

};



// contextBridge.exposeInMainWorld(
//     'electron',
//     {
//         doThing: () => ipcRenderer.send('do-a-thing')
//     }
// )