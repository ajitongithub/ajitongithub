// // 
//auto_load_loader_controller
napp.controller('auto_load_loader_controller', function ($scope, $http, $rootScope, $q, $window) {
    console.log("ASD");
    // Data loading
    $http.get('../database/loads_appliances.json').then(function (response) {
        //data sorting
        let loads_data = response.data;
        $scope.loads_data = response.data;
        // console.log(response.data);
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
    let load__items = document.querySelectorAll('.load_items'); //Select all the generic loads
    let load__grid = document.querySelector('.loads_grid__div'); // load grid container
    let load__track = document.querySelectorAll('.load_track__div'); //Select all the load tracks

    let load__marker = document.querySelectorAll('.load_marker__div'); //Select all markers div
    let load__info = document.querySelector("#info__div"); //Select info div

    let add_track__div = document.querySelector("#add_track_id"); //Add Tracks DIV
    let relign_markers = document.querySelector("#align_grid"); //Align Markers
    let dragging__dataset;


    // Drag - Drop Processing - Functions
    let load__dragstart = e => {
        console.log('asdaaaaaa');
        dragged__div = e.target;
        dragging__dataset = e.target.dataset;
        console.log("DRAG START");
        console.log(dragging__dataset);
        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.effectAllowed = "move";
    };
    let load__dragover = e => {
        console.log("Drag Over1");
        e.preventDefault();
        e.dataTransfer.effectAllowed = "move";
    };
    let load__drag = e => {
        console.log(e);
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
            console.log(dragging__dataset.powerdata);
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

            drop_data.setAttribute("class", "load_marker__div");

            drop_data.setAttribute("draggable", "false");
            drop_data.style.left = `${e.offsetX}px`;
            drop_data.style.width = `${200}px`;
            drop_data.innerHTML = `<div class="marker_left">07:00</div><div class="marker_right">10:00</div>`;
            // drop_data.innerHTML = `<div class="marker_left">${}</div><div class="marker_right">${}</div>`;
            e.target.appendChild(drop_data);

            // Get the element
            let marker_offsetTop = e.target.parentElement.offsetParent.children[2].childNodes;
            let drop_container_row;
            track_top_value += marker_offsetTop[1].offsetTop;
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

    //----------------------------STARTED-----------------------------------
    //Misc Function
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
    // Realign
    let re_aligner = () => {
        console.log("re_aligner");
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
    //TODO Reslign the newly added tracks with times and width
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
    // CORE - DRAG Functions
    let core_function__drag = () => {
        console.log("DRAG-DROP");
        // Initialise-Variables---------------------------------------------------------------------
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
                    //TODO
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
            //TODO
            sync_elements.forEach(ele => {
                if (ele.className == "load_marker__div" && ele.dataset.syncdata == transfer_data.innerText) {
                    let full_width = ele.parentElement.clientWidth;
                    let pixel_ratio_sec = 86400 / full_width;
                    let synced_duration = Math.abs(end_time_seconds - start_time_seconds);
                    ele.style.left = `${(start_time_seconds / pixel_ratio_sec).toFixed(0)}px`;
                    ele.style.width = `${(synced_duration / pixel_ratio_sec).toFixed(0)}px`;
                    // datasets
                    let marker_load_qty = document.querySelector('#marker_load_qty');
                    let marker_load_power = document.querySelector('#marker_load_power');
                    let marker_load_model = document.querySelector('#marker_load_model');
                    let marker_load_schedulable = document.querySelector('#marker_load_schedulable');

                    ele.dataset.powerdata = marker_load_power.value;
                    ele.dataset.qtydata = marker_load_qty.value;
                    ele.dataset.modellingdata = marker_load_model.value;
                    ele.dataset.schedulabledata = marker_load_schedulable.checked;

                    ele.childNodes[0].innerHTML = seconds_to_format(start_time_seconds.toFixed(0));
                    ele.childNodes[1].innerHTML = seconds_to_format(end_time_seconds.toFixed(0));
                }
            });
        });

        modal_cancel_btn.addEventListener('click', e => {
            e.target.parentNode.offsetParent.style.transform = "translateX(-100%)";
        });

        //Template Loading Works
        let template_selection = document.querySelector("#template_selector");
        template_selection.addEventListener('change', e => {
            console.log(e.target.value);
        });

        // Processing the data
        let processin_btn = document.querySelector('#process_data');
        processin_btn.addEventListener('click', () => {
            //Load Matrix Generator - Probability Matrix Creation
            load_matrix_generator();
        });
    };

    const marker_function_setting = (element) => {
        let start_time_input = document.querySelector('#startTime__input');
        let end_time_input = document.querySelector('#endTime__input');

        let marker_load_qty = document.querySelector('#marker_load_qty');
        let marker_load_power = document.querySelector('#marker_load_power');
        let marker_load_model = document.querySelector('#marker_load_model');
        let marker_load_schedulable = document.querySelector('#marker_load_schedulable');

        //test
        // console.log(element.dataset);
        marker_load_power.value = element.dataset.powerdata;
        marker_load_qty.value = element.dataset.qtydata;
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

        console.log(load__track);
        let track_id = 0;
        load__track.forEach(e => {
            let tracks__node = e.childNodes;
            tracks__node.forEach(node_element => {
                let load_matrix_object = {};
                load_matrix_object.name = node_element.dataset.appname;
                load_matrix_object.load_channel = track_id;
                load_matrix_object.powerdata = node_element.dataset.powerdata;
                load_matrix_object.modellingdata = node_element.dataset.modellingdata;
                load_matrix_object.qtydata = node_element.dataset.qtydata;
                load_matrix_object.schedulabledata = node_element.dataset.schedulabledata;
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
            console.log(load_matrix_array);
        });
        let no_of_loads = load_matrix_array.length;
        let time_axis_array = Array(max_array_points_per_load).fill(0);
        //Load Profile Metadata Array
        let final_load_profile = Array(max_array_points_per_load).fill(0);
        load_matrix_array.forEach(load_meta => {
            for (let time_id = 0; time_id < max_array_points_per_load; time_id++) {
                final_load_profile[time_id] += parseFloat(load_meta.power_profile[time_id]);
            }
        });
        console.log(final_load_profile);
        for (let i = 0; i < max_array_points_per_load; i++) {
            time_axis_array[i] = i;
        }

        //Classification of load profile - based of max demand of the day
        let max_demand = final_load_profile.reduce(function (a, b) {
            return Math.max(a, b);
        }, 0);
        console.log(max_demand);
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
        console.log(classification_max_demand);
        // Plotly
        let load_profile_plot = document.querySelector('.plotter_1');
        let load_distribution_plot = document.querySelector('.plotter_2');


        let load_profile_sketch = {
            x: time_axis_array,
            y: final_load_profile
        };
        let load_distribution_sketch = {
            x: ['75 - 100', '50 - 75', '25 - 50', '0 - 25'],
            y: classification_max_demand,
            type: 'bar'
        };

        let load_data = [load_profile_sketch];
        let load_distribution_data = [load_distribution_sketch];

        let layout = {
            title: 'Load Profile',
            xaxis: {
                title: 'x-axis title'
            },
            yaxis: {
                title: 'y-axis title'
            }
        };
        let layout_2 = {
            title: 'Load Distribution',
            xaxis: {
                title: 'x-axis title'
            },
            yaxis: {
                title: 'y-axis title'
            }
        };
        Plotly.newPlot(load_profile_plot, load_data, layout);
        Plotly.newPlot(load_distribution_plot, load_distribution_data, layout_2);

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

    angular.element(document).ready(() => {
        //-------------------FUNCTIONS
        re_aligner();
        core_function__drag();
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
                        console.log(format_to_seconds(node.childNodes[0].innerText));
                        load_containers.endtime = node.childNodes[1].innerText;
                        load_temp_array.push(load_containers);
                    });
                    no_of_tracks += 1;
                }
            });
            // console.log(load_temp_array);
            // console.log(no_of_tracks);
            var name_of_design = "Blah Blah";
            designer_info_object.arrange_name = name_of_design;
            designer_info_object.loading_data = load_temp_array;
            designer_info_object.tracks_count = no_of_tracks;
            console.log(designer_info_object);
            // Store in Local Storage
            localStorage.setItem('design_object_test', JSON.stringify(designer_info_object));
           
            ipcRenderer.send('save_load_design', "gd");
            console.log("DATA SAVED");        

        });
        grid_load__button.addEventListener('click', e => {
            // let grid_model_data = document.querySelector('#slider_container');
            // grid_model_data.innerHTML = localStorage.getItem('grid_item');
            // reassign_trackListeners();

            let grid_info_data = document.querySelector('.load_infobar__div');
            let grid_marker_data = document.querySelector('.loads_grid__div');

            grid_info_data.innerHTML = "";
            grid_marker_data.innerHTML = "";

            //load the tracks and bars
            let design_data = JSON.parse(localStorage.getItem('design_object_test'));
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
                marker_data__div.setAttribute("draggable", "false");
                marker_data__div.innerHTML = `<div class="marker_left">${design_data.loading_data[l_count].starttime}</div><div class="marker_right">${design_data.loading_data[l_count].endtime}</div>`;
                marker_data__div.setAttribute("class", "load_marker__div");
                marker_data__div.style.left = `${marker_start}px`;
                marker_data__div.style.width = `${marker_end - marker_start}px`;
                grid_marker_data.childNodes[parseInt(design_data.loading_data[l_count].track_id)].appendChild(marker_data__div);
            }
            reassign_trackListeners();
        });
        grid_clear__button.addEventListener('click', e => {
            let grid_model_data = document.querySelector('.loads_grid__div');
            let grid_info_data = document.querySelector('.load_infobar__div');
            grid_model_data.innerHTML = `<div class="load_track__div"></div><div class="load_track__div"></div>`;
            grid_info_data.innerHTML = `<div class="load_info"></div><div class="load_info"></div>`;
            reassign_trackListeners();
        });
        console.log('page is fully Load at the end');
    });
    // -----------END
});// End Of COntroller