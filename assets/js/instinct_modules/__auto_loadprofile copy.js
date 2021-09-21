//auto_load_loader_controller
napp.controller('auto_load_loader_controller', function ($scope, $http, $rootScope, $q) {
    console.log("YAAAAYYYY");



    $scope.loads_data = { };
    let selected_load_object = { };
    $scope.load_wattage = { };
    let temp_array_1 = [];

    // Data loading
    $http.get('../database/loads_appliances.json').then(function (response) {
        //data sorting
        let loads_data = response.data;
        // let load_types = loads_data.filter(sorter_2);
        // $scope.load_types = load_types.map((element) => element.Type).sort();
        // console.log(load_types);
        $scope.loads_data = response.data;
        console.log(response.data);

    }, function (err) {
        console.log(err);
    });

    // const sorter_2 = (value, index, self) => {
    //     if (temp_array_1.includes(String(value.Type))) {
    //         return false;
    //     }
    //     else {
    //         temp_array_1.push(value.Type);
    //         return true;
    //     }
    // };
    // Ooption change detect
    // $scope.detectIndex = (request_data) => {
    //     selected_load_object = { };

    //     $scope.RatedPower = request_data.RatedPower;
    //     $scope.RecommendedProfile = request_data.RecommendedProfile;
    //     $scope.Scenario = request_data.Scenario;
    //     $scope.PowerFactor = request_data.PowerFactor;
    //     $scope.Name = request_data.Name;
    //     $scope.Manufacturer = request_data.Manufacturer;



    //     // console.log(selected_load_object);
    // };
    // $scope.load_loading = () => {
    //     // Loading data into loads
    //     selected_load_object.rated_power = parseInt($scope.RatedPower);
    //     selected_load_object.recommended_profile = $scope.RecommendedProfile;
    //     selected_load_object.scenario = $scope.Scenario;
    //     selected_load_object.power_factor = $scope.PowerFactor;
    //     selected_load_object.load_name = $scope.Name;
    //     selected_load_object.manufacturer = $scope.Manufacturer;
    //     console.log(selected_load_object);
    // };







    // Active Button Changer 
    var side_menu_active_system = document.getElementsByClassName('left_side_menu');
    for (i = 0; i < side_menu_active_system.length; i++) {
        side_menu_active_system[i].classList.remove("active");
    }
    side_menu_active_system[6].classList.add("active");
    //load appliances

    //status_bar
    status_activate("Auto Loader Page has loaded", 2000);
    // var status_bar = document.getElementById('info_bar');
    // status_bar.style.transform = "translateY(-30%)";
    // setTimeout(() => {
    // 	status_bar.style.transform = "translateY(100%)";
    // }, 2000);



    //load usage stats
    //screen shifter
    $scope.manual_selection = function (input) {
        console.log(input);
        // input = "-40%";
        let screen_profile = document.querySelectorAll('.auto-load-loading__scroll_container');
        screen_profile[0].style.transform = `translateY(${input})`;//"translateY(-input)";

        // Loaders
    };
    $scope.auto_profile_home = function () {
        let screen_profile = document.querySelectorAll('.auto_profile_main_container');
        screen_profile[0].style.transform = "translateY(0)";
    };


    //AUTO-DRAG PROFILE -----------------------------------------
    // Slider Program
    const slider_handle = document.querySelector("#mainSlider");
    const load_container__div = document.querySelector(".aside_container");
    const slider_container__div = document.querySelector(".slider_container");

    let load__items = document.querySelectorAll('.load_items');
    let load__track = document.querySelectorAll('.load_track__div');
    let load__grid = document.querySelector('.loads_grid__div');
    let load__marker = document.querySelector('.load_marker__div');
    let load__info = document.querySelector("#info__div");

    let add_track__div = document.querySelector("#add_track_id");
    let relign_markers = document.querySelector("#align_grid");

    let dragged__div;
    let dragging__dataset;


    // Auto Add new Tracks on DOuble Clicks
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

    const add_track_function = e => {
        // console.log(e);
        const load_track = document.createElement("div");
        load_track.setAttribute("class", "load_track__div");
        e.target.previousElementSibling.appendChild(load_track);
        // Info Bar Additions        
        const info_track = document.createElement("div");
        info_track.setAttribute("class", "load_info");
        e.target.previousElementSibling.previousElementSibling.appendChild(info_track);
        reassign_trackListeners();
    };
    load__grid.addEventListener('dblclick', new_track);

    // -----------END

    let relative_pointer_position = 0;
    let abs_pointer_position = 0;
    let slider_newPos = 0;

    // Drag - Drop Processing
    const load__dragstart = e => {
        dragged__div = e.target;
        dragging__dataset = e.target.dataset;
        console.log("DRAG START");
        e.dataTransfer.setData("text", e.target.id);
        e.dataTransfer.effectAllowed = "move";
    };
    const load__drag = e => {

    };
    const load__dragover = e => {
        console.log("Drag Over");
        e.preventDefault();
        e.dataTransfer.effectAllowed = "move";
    };
    const load__dragend = e => {
        console.log("Drag End");
        // console.log(DataTransfer)
    };
    const load__dragenter = e => {
        e.preventDefault();

        if (e.target.className == "load_track__div") {
            e.target.style.background = "rgba(139, 245, 250, 0.774)";
        }
    };
    const load__dragleave = e => {
        console.log("dragleave");
        if (e.target.className == "load_track__div") {
            e.target.style.background = "";
            // e.target.style.border = "";
        }
    };
    const load__drop = e => {
        e.preventDefault();
        if (e.target.className == "load_track__div") {
            let marker_timestamp = e.timeStamp.toString(16);
            let track_top_value = e.target.offsetTop;
            e.target.style.background = "";
            const drop_data = document.createElement("div");
            drop_data.dataset.powerdata = dragging__dataset.powerData;
            drop_data.dataset.qtydata = dragging__dataset.qtydata;
            drop_data.dataset.modellingdata = dragging__dataset.modellingdata;
            drop_data.dataset.schedulabledata = dragging__dataset.schedulabledata;

            drop_data.dataset.appname = dragging__dataset.appname;
            drop_data.innerText = dragging__dataset.powerdata;
            drop_data.innerHTML = `<div class="marker_left">07:00</div><div class="marker_right">10:00</div>`;
            drop_data.setAttribute("class", "load_marker__div");
            drop_data.dataset.syncdata = `load_${marker_timestamp}`;
            drop_data.setAttribute("draggable", "false");
            drop_data.style.left = `${e.offsetX}px`;
            drop_data.style.width = `${200}px`;
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

    load__items.forEach(load_element => {
        load_element.addEventListener("dragstart", load__dragstart, false);
        load_element.addEventListener("drag", load__drag, false);
        load_element.addEventListener("dragend", load__dragend, false);
    });

    const re_aligner = () => {
        // console.log("ASD");
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

    //TODO Reslign the newly added tracks with times and width
    const reassign_trackListeners = () => {
        //Re-Align The Markers
        relign_markers.addEventListener('click', re_aligner);
        //listerners queryselectors
        add_track__div = document.querySelector("#add_track_id");// Add Track Button Addition
        load__grid = document.querySelector('.loads_grid__div');// The Grid 
        load__track = document.querySelectorAll('.load_track__div');// The Track
        load__info = document.querySelector("#info__div");// The Info


        load__grid.addEventListener('dblclick', new_track);
        add_track__div.addEventListener('click', add_track_function);

        //Drag Listener
        load__track.forEach(track_element => {
            track_element.addEventListener("dragover", load__dragover, false);
            track_element.addEventListener("dragenter", load__dragenter, false);
            track_element.addEventListener("dragleave", load__dragleave, false);
            track_element.addEventListener("drop", load__drop, false);
        });

        load__marker = document.querySelectorAll('.load_marker__div');

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
                        } else if(e.ctrlKey) {
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

        //adding the grid saver/loader/clear
        let grid_save__button = document.querySelector("#save_grid");
        let grid_load__button = document.querySelector("#load_grid");
        let grid_clear__button = document.querySelector("#clear_grid");

        grid_save__button.addEventListener('click', e => {
            let grid_model_data = document.querySelector('#slider_container');
            let grid_arrangement = grid_model_data.innerHTML.toString();
            localStorage.setItem('grid_item', grid_arrangement);

        });
        grid_load__button.addEventListener('click', e => {
            let grid_model_data = document.querySelector('#slider_container');
            grid_model_data.innerHTML = localStorage.getItem('grid_item');
            reassign_trackListeners();
        });
        grid_clear__button.addEventListener('click', e => {
            let grid_model_data = document.querySelector('.loads_grid__div');
            let grid_info_data = document.querySelector('.load_infobar__div');
            grid_model_data.innerHTML = `<div class="load_track__div"></div><div class="load_track__div"></div>`;
            grid_info_data.innerHTML = `<div class="load_info"></div><div class="load_info"></div>`;

            reassign_trackListeners();
        });

    };

    reassign_trackListeners();

    // End of Drag Drop

    // Processing the data
    let processin_btn = document.querySelector('#process_data');
    processin_btn.addEventListener('click', () => {
        //Load Matrix Generator - Probability Matrix Creation
        load_matrix_generator();
    });

    //Load Matrix Generator - Probability Matrix Creation - Function
    const load_matrix_generator = () => {
        // load_martrix_object

        let load_matrix_array = [];
        let max_array_points_per_load = 1440; //24 x 60
        // Get the Width and Find the hour equivalent
        let full_width = document.querySelector('.load_track__div');
        let pixel_ratio_sec = 86400 / full_width.clientWidth;
        //get the tracks
        let load__track = document.querySelectorAll('.load_track__div');
        // console.log(`No. of load tracks - ${load__track.length}`);
        let track_id = 0;
        load__track.forEach(e => {
            let tracks__node = e.childNodes;
            tracks__node.forEach(node_element => {
                let load_matrix_object = { };
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

        // Plotly.newPlot(load_profile_plot, [{
        //     x: time_axis_array,
        //     y: final_load_profile
        // }], {
        //     margin: { t: 0 }
        // });



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

    // 13521     >> 03:45:21
    const seconds_to_format = (seconds_data) => {
        let seconds = `${Math.floor(seconds_data % 60)}`.padStart(2, '0');
        let minutes_check = `${Math.floor((seconds_data / 60) % 60)}`.padStart(2, '0');
        let hours = `${Math.floor(seconds_data / 3600)}`.padStart(2, '0');
        // return `${hours}:${minutes_check}:${seconds}`;
        return `${hours}:${minutes_check}`;
    };
    const format_to_seconds = (format_data) => { //format hours:minutes:seconds
        let time_parts = format_data.split(":");
        // let total_seconds = (parseInt(time_parts[0]) * 3600) + (parseInt(time_parts[1]) * 60) + parseInt(time_parts[2]);
        let total_seconds = (parseInt(time_parts[0]) * 3600) + (parseInt(time_parts[1]) * 60);
        return `${total_seconds}`;
    };

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

    const marker_function_setting = (element) => {
        let start_time_input = document.querySelector('#startTime__input');
        let end_time_input = document.querySelector('#endTime__input');

        let marker_load_qty = document.querySelector('#marker_load_qty');
        let marker_load_power = document.querySelector('#marker_load_power');
        let marker_load_model = document.querySelector('#marker_load_model');
        let marker_load_schedulable = document.querySelector('#marker_load_schedulable');

        //test

        marker_load_power.value = element.dataset.powerdata;
        marker_load_qty.value = element.dataset.qtydata;
        marker_load_model.value = element.dataset.modellingdata;
        if (element.dataset.schedulabledata == "true" || element.dataset.schedulabledata == "True") {
            marker_load_schedulable.checked = true;
        }
        else {
            marker_load_schedulable.checked = false;
        }
        // marker_load_schedulable.checked = () => { (element.dataset.schedulabledata == "true");});
        // console.log(element.dataset.schedulabledata);
        // console.log(marker_load_schedulable.checked);

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
    //Template Loading Works
    let template_selection = document.querySelector("#template_selector");

    template_selection.addEventListener('change', e => {
        console.log(e.target.value);
    });
});