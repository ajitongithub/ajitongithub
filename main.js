const { app, BrowserWindow, session, systemPreferences } = require('electron');
const { ipcMain } = require('electron');
const { webContents } = require('electron');
const { PythonShell } = require('python-shell');
const { Series, DataFrame } = require('pandas-js');

var fs = require('fs');
var rand_gen = require('random-seed');
var nj = require('./assets/js/dependencies/numjs.min.js');
const console = require('console');
const { time } = require('console');
const { resolve } = require('path');
const { rejects } = require('assert');

// const { remote }= require('electron');

//custom modules
const { batt_temp_adjustment, batt_discharge_current_compensation } = require("./assets/js/core/battery_logic");
const { batt_DOD_compensation_program, batt_arhennius_compensation_program } = require("./assets/js/core/battery_logic");
const { batt_SOH_compensation_program, batt_recharge_power_modelling } = require("./assets/js/core/battery_logic");
const { batt_recharge_factor_compen } = require("./assets/js/core/battery_logic");
const { solar_panel_aging_program, solar_panel_temperature_program } = require("./assets/js/core/solar_logic");

const { hours_to_days, linear_regression } = require("./assets/js/core/main_drivers");

// let pyshell = new PythonShell('processors/main_processor.py');
// let instinct_program = new PythonShell('processors/instinct_full_program.py');

function createWindow() {
  const mainWindow = new BrowserWindow({
    title: "INSTINCT II",
    fullscreen: false,
    // skipTaskbar:true,
    frame: true,
    transparent: false,
    opacity: 0.9,
    width: 1200,
    height: 800,
    icon: './icon/instinct2.ico',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      plugins: true,
      experimentalFeatures: true,
      scrollBounce: true
    }
  });

  mainWindow.loadFile('pages/main.html');
  mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('did-finish-load', e => {
    // mainWindow.webContents.console("Loading Complete");
    console.log("DONE");
    // console.log(remote);
  });
  mainWindow.webContents.on('did-start-loading', e => {
    // mainWindow.webContents.console("Loading Complete");
    console.log("FRAME START");
  });
  mainWindow.webContents.on('did-stop-loading', e => {
    // mainWindow.webContents.console("Loading Complete");
    console.log("FRAME STOP");
  });
  mainWindow.webContents.on('dom-ready', e => {
    // mainWindow.webContents.console("Loading Complete");
    console.log("FRAME DONE");
  });
  // mainWindow.webContents.on('did-navigate-in-page',e =>{
  //   // mainWindow.webContents.console("Loading Complete");
  //   console.log("REDIRECT");
  // });

  // let allWebContents = webContents.getAllWebContents();
  // console.log(allWebContents);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Python Data Exchanger
// pyshell.on('message', function (message) {
//   // received a message sent from the Python script (a simple "print" statement)
//     console.log(message);
//   });

// Location File Saving - 1
ipcMain.on('location_done', (event, data) => {
  var loc_txt = JSON.stringify(data);
  fs.writeFile(resolve(__dirname, 'database/temp_data.json'), loc_txt, function (err) {
    if (err) throw err;
    event.sender.send('main_responder_channel', "Location Data Saved");
    // event.sender.send('location_load_complete',"Proceed, No Error");
  });
});
// Load Profile Saving - 2
ipcMain.on('load_profile_done', (event, data) => {
  var load_txt = JSON.stringify(data);
  fs.writeFile(resolve(__dirname, 'database/temp_data.json'), load_txt, function (err) {
    if (err) throw err;
    event.sender.send('main_responder_channel', "Load Profile Saved");
  });
});
// components Saving - 3
ipcMain.on('components_done', (event, data) => {
  var component_txt = JSON.stringify(data);
  fs.writeFile(resolve(__dirname, 'database/temp_data.json'), component_txt, function (err) {
    if (err) throw err;
    event.sender.send('main_responder_channel', "Components Saved");
    // console.log('Components Saved');
  });
});

// Simulation Program saving - 4
ipcMain.on('simulation_parameters', (event, data) => {
  var sim_txt = JSON.stringify(data);
  fs.writeFile(resolve(__dirname, 'database/temp_data.json'), sim_txt, function (err) {
    if (err) throw err;
    event.sender.send('main_responder_channel', "Simulation Data Saved");
    // console.log('Simulation Data Saved');
  });
});



// Simulation Program
ipcMain.on('simulation_run', (event, data) => {
  // event.reply('simulation-response', 'Start');
  event.sender.send('simulation-response', 'Start');

  //loading configurations
  let instinct_config = fs.readFileSync(resolve(__dirname, 'database/temp_data copy.json'));
  event.sender.send('simulation-response', 'Data Loaded');

  instinct_config = JSON.parse(instinct_config);
  // seed
  var seed = 1;
  rand1 = rand_gen.create(seed);
  console.log('Program is Started running... \n');


  //climatic
  let climatic_rise_per_year = 1.28; //degrees celcius temperature rise per year..  


  // Start
  // //time detection concepts
  let simulation_days = parseInt(instinct_config.simulation_data.simulation_days);
  let simulation_hours = simulation_days * 24;
  let hours_array = Array.from({ length: simulation_hours }, (x, i) => i);
  console.log(hours_array);
  console.log('Hours Array is loaded... \n');
  //ENTIRE VARIABLES

  //detection variables
  let count_hours = 0;
  let count_days = 0;
  let count_weeks = 0;
  let count_months = 0;
  let count_years = 0;

  let weekend_detect_array = Array(simulation_hours).fill(0);

  let weekend_count_hours = 0;
  let reset_hours = 0;
  let reset_weekDays = 0;

  //Battery Model variables
  let batt_DOD_hourly = [];
  let batt_DOD_day_max_array = [];
  let batt_DOD_window_average = 0.0;
  let batt_DOD_averagingWindow = 6;
  let batt_DOD_accumulatedDays = 0;

  //temperature averager
  let batt_TEMP_hourly = [];
  let batt_TEMP_day_average = [];
  let batt_TEMP_window_average = [];
  let batt_BATT_arhenius = [];

  //SOH Battery
  let batt_DOD_SOH_buffer;
  let batt_SOH_final = [];
  let batt_energy_buffer = 0;
  //The Variables
  let power_factor = 0.8;
  let load_voltage = 220;
  let load_variability_tolerance = 3; //input as 3% tolerance
  let load_inflation_per_year = 10; //in %
  let weekend_load_rise = 2; //in percent
  let hour_id = 0;
  let main_loop_count_days = 0;
  //data_array
  let generated_load_profile = Array(simulation_hours).fill(0);
  // let load_current_demand_AC = Array(simulation_hours).fill(0);
  let load_current_demand_AC = [];

  // let load_data = instinct_config.load_profile;
  // let load_data = new Series(instinct_config.load_profile, {name: 'Load Profile'});
  let load_data = instinct_config.load_profile;//new Series(instinct_config.load_profile, {name: 'Load Profile'});

  // --------LOAD  VARAIBLES-------------
  let load_inflation_percent_per_year = (load_inflation_per_year / 100); //10% increase every year = 24*365*100
  //Inverter Passthrough Effects and Input DC 

  //Inverter Variables
  let inverter_loading_percentage = Array(simulation_hours).fill(0);
  let inverter_efficiency = Array(simulation_hours).fill(0);
  let inverter_design_rating = 1000; //in watts NOT VA
  let inverter_DC_IN_POWER = Array(simulation_hours).fill(0);
  let inverter_DC_IN_CURRENT = Array(simulation_hours).fill(0);
  let inverter_overload_array = Array(simulation_hours).fill(0);
  let inverter_standby_power = 10; //10watts
  //system states
  let system_voltage = 48; //[12, 24, 48, 96, 120, 240] //12V / 24V / 48V / 96V / 120V / 240V
  let system_states = ["Charging", "Discharging", "Float", "Grid Feed"];

  //load Variables
  //data_cleaning and balancing
  // let hours_in_year = 24* parseInt(instinct_config.simulation_data.simulation_days);
  let hours_in_year = 24 * 365;
  let add_hours = 0;
  // Weather Profile
  let temperature_data = new Series(instinct_config.temperature, { name: 'Temperature Profile' });
  let insolation_data = new Series(instinct_config.insolation, { name: 'Insolation Profile' });
  //Temperature Data
  temperature_data_df = Array.from(temperature_data.values);
  //Insolation Data
  insolation_data_df = Array.from(insolation_data.values); //Watts
  let additional_hours_needed = hours_in_year - temperature_data.length;
  let temperature_final = temperature_data_df;
  let insolation_final = insolation_data_df;
  //Solar Panel WAAREE ID - 114
  let solar_Wp = 400; //watts
  let solar_efficiency = 0.1986;
  let solar_Voc = 49.39; //Open Circuit Voltage
  let solar_Isc = 10.42;  //Short circuit current
  let solar_Vm = 40.07;  //Peak Voltage
  let solar_Im = 10.02;  //Peak current

  let solar_fill_factor = (solar_Vm * solar_Im) / (solar_Voc * solar_Isc);

  let real_area = solar_Wp / (solar_efficiency * 1000);
  //real_area = 1.221543587 // from datasheet
  //calculated_area = solar_Wp / 1000 // m2
  //print("\nReal Area =" + str(real_area) + "Calculated area = " + str(calculated_area)+"\n")
  let solar_series = 3;
  let solar_parallel = 3;
  let stc_temperature = 25; // degrees celcius
  let solar_pure_output = Array(simulation_hours).fill(0);
  let solar_derated_output = Array(simulation_hours).fill(0);

  let mod_eff_aging = [];
  let modified_insolation_data = [];
  let modified_temperature_data = [];




  // Charge Controller Compensation
  let CC_eff = 0.94; //95%
  let CC_rating_current = 30; //Amperes
  //Required Battery Variables
  let batt_voltage = 12; // Battery voltage options are 2V, 6V, 9V, 12V, 24V
  let batt_in_parallel = 1;
  let batt_in_series = system_voltage / batt_voltage;
  //maximum rated power
  let CC_max_charging_power = CC_rating_current * batt_in_series * batt_voltage;
  //max input current
  let CC_overload_array = Array(simulation_hours).fill(0);
  let solar_to_CC_loss = Array(simulation_hours).fill(0); //Solar Generation but limited to CC power output losses

  //charging-voltage-15.6 is during charging, but during float charing the voltage is different. could be 13.6V
  let CC_charging_voltage = 15.6 * batt_in_series;
  //pure output
  // let CC_output_raw_power = nj.zeros(simulation_days);
  let CC_output_raw_power = Array(simulation_hours).fill(0);

  let CC_output_power = Array(simulation_hours).fill(0);
  //Batery initialization values
  //Start DOD/SOC,SOH, age, etc
  let batt_limited_DOD = parseFloat(instinct_config.simulation_data.depth_of_discharge / 100);//0.5; // 50% DOD maximum DOD limited by user
  // console.log(batt_MAX_DOD);
  //Time range for prelim energy calculation----------------------------
  let time_super_start = 17; //simulate energy used from 5 PM to 12 AM as the actual starting point is 12 mid night but we dont know how much energy we have left, hence pre sim
  let time_super_end = 24; //mid night

  let pre_sim_energy = 0.0;
  //Pre simulation for finding the starting DOD at MIDNIGHT of the day of simulation starts.
  let batt_init_SOH = 1; // SOH 100% = 1
  let batt_init_SOC = 1;
  // Battery used is Luminous 200AH - ID-20
  let batt_AH_individual = 200; //AH rating of each battery
  let batt_effective_AH = (batt_AH_individual * batt_in_parallel);
  // Other relevant info
  let batt_C_RATE = 10; // AH rated hours >> C10 = 10, C20 = 20
  let batt_optimal_output_current_maximum = (batt_effective_AH / batt_C_RATE);

  let batt_peukert_constant = 1.4; //can modify this value for replicating the aging effects

  let batt_BMS_eff = 0.99; //BMS controller efficiency 99% default
  let batt_OUT_current = Array(simulation_hours).fill(0);
  let batt_CORRECTED_CURRENT = Array(simulation_hours).fill(0);
  let batt_AH_OUTPUT = Array(simulation_hours).fill(0);
  let batt_POWER_OUTPUT = Array(simulation_hours).fill(0);
  //Temperature Dependency parameters
  let batt_total_batteries = batt_in_parallel * batt_in_series;
  let batt_total_AH = batt_total_batteries * batt_AH_individual;
  let batt_design_WH = batt_voltage * batt_total_AH;
  let batt_discharge_current_flag = true;
  //--------------------------------------------------

  let batt_DOD = 0;
  let batt_recharge_power = Array(simulation_hours).fill(0);
  let batt_charging_flag_array = Array(simulation_hours).fill(0);
  let batt_inst_energy = 0; // Energy Available at any instant in the battery
  let batt_inst_SOH = batt_init_SOH;
  let batt_inst_WH_array = Array(simulation_hours).fill(0);

  //DOD Array
  let batt_DOD_array = Array(simulation_hours).fill(0);
  let batt_SOH_array = [];
  let batt_DOD_interim = nj.zeros(24);
  let batt_DOD_daily_full = nj.zeros(simulation_days);
  let days_counter = 0;
  // Surplus energy generated from solar
  //excess evergy generated by the solarpanel
  let energy_surplus = Array(simulation_hours).fill(0);

  //unmet energy for the load
  let energy_unmet = Array(simulation_hours).fill(0);
  //Battery Energy Limit Reached - system off
  let batt_fail_count = 0;

  //charging current
  let batt_current_flow = nj.zeros(simulation_hours);
  let batt_recharge_current = 0;
  let batt_test_DOD = 0;
  let batt_recharge_losses = 0.01; //% loss from the recharge power
  let batt_real_WH = 0; // Real WH after usage of the battery - loss of capacity effect
  let batt_recharge_factor = 0.9; // 110% of the discharge 
  //For Enhanced Branching
  let batt_chargable = true;
  let batt_dischargable = true;
  let batt_discharge_current_relation = true;

  //energy Array
  let batt_energy_pure =  Array(simulation_hours).fill(0);
  let batt_temp_compensated_energy;
  let excess_energy;
  // Weekend Detection
  for (count_hours; count_hours < hours_array.length; count_hours++) {
    reset_hours += 1;
    // Weekend Start Detection-----
    if (reset_weekDays > 4) {
      weekend_detect_array[count_hours] = 1; //Weekend hours flag
    }
    //Day counter
    if (reset_hours % 24 == 0) {
      count_days += 1;
      reset_weekDays += 1;
      reset_hours = 0;
    }
    //Week Detection   
    if (reset_weekDays == 7) {
      count_weeks += 1;
      reset_weekDays = 0;
    }
    //Month Detection
    count_months = (count_weeks / 4);
  }


  // console.log(weekend_detect_array);
  console.log('Hours Array is loaded... \n');
  let load_variability = 0;

  //Start Load Profile Generation------------------------------------------------------------
  // console.log(load_data.length);
  //check if not auto load profile

  //-------------------------------------------

  for (load_data_inst = 0; load_data_inst < simulation_hours; load_data_inst++) {
    //variability randomizer
    load_variability = rand1.floatBetween((-1 * load_variability_tolerance), load_variability_tolerance) * 0.01;

    hour_id = load_data_inst % 24;
    if ((hour_id == 0) && (load_data_inst != 0)) { count_days += 1; }
    generated_load_profile[load_data_inst] = load_data[hour_id]; //actual load

    //Variability Addition 
    //variability - flag check
    if (true) {
      generated_load_profile[load_data_inst] += (generated_load_profile[load_data_inst] * load_variability); //adding variability
    }
    //load_inflation - flag check ( yearly increment - )
    if (true && (Math.round(load_data_inst / 8760) > 0)) {
      //load Inflation addition    
      generated_load_profile[load_data_inst] += (load_data[hour_id] * load_inflation_percent_per_year * Math.round(load_data_inst / 8760)); //adding load inflation
    }
    //Weekend Effects - flag
    if (true) {
      if ((weekend_load_rise != 0) && (weekend_detect_array[load_data_inst] == 1)) {
        generated_load_profile[load_data_inst] += (generated_load_profile[load_data_inst] * (weekend_load_rise / 100));
      }
    }
  }

  //Load Parameters Extraction
  for (i = 0; i < simulation_hours; i++) {
    load_current_demand_AC.push(generated_load_profile[i] / (power_factor * load_voltage));
  }
  // console.log(generated_load_profile);
  console.log("\nLOAD PROFILE -------------- RESULTS\n");


  //Modelling Components
  for (i = 0; i < simulation_hours; i++) {

    //inverter modelling Starts ----------------------------------------------------------------------
    if (generated_load_profile[i] < inverter_design_rating) {
      let inv_variable_1 = (generated_load_profile[i] / inverter_design_rating) * 100;
      inverter_loading_percentage[i] = inv_variable_1;

      let inv_variable_2 = 90 - (104.43 * Math.exp(-0.524 * Math.pow(inv_variable_1, 0.686)));
      inverter_efficiency[i] = inv_variable_2;

      let inv_variable_3 = generated_load_profile[i] / (inv_variable_2 / 100);
      inverter_DC_IN_POWER[i] = inv_variable_3;
      //Inverter Demand
      inverter_DC_IN_CURRENT[i] = (inv_variable_3 / system_voltage);
    }
    else {
      console.log("SYSTEM FAILED - INVERTER OVERLOAD - CONSIDER UPRATING INVERTER");
      inverter_overload_array[i] = 1; //we can use error codes also
    }

    //inverter modelling Ends ----------------------------------------------------------------------

    //Solar Module Efficiency Array -----------------------------------------------------------------
    mod_eff_aging.push((1 - ((0.00000084) * hours_array[i])) * solar_efficiency);
    //Solar M Model  Ends ------------------------------------------------------------------------
  }
  console.log("\nINVERTER -------------- RESULTS\n");

  //GENERATION ARRAYS AND DATA
  if (additional_hours_needed > 0) {
    for (add_hours = 0; add_hours < additional_hours_needed; add_hours++) {
      temperature_final.push(temperature_data.iloc(add_hours - additional_hours_needed));
      insolation_final.push(insolation_data.iloc(temperature_final.length % 24));
    }
  }
  else if (additional_hours_needed < 0) {
    // limit array of temperature to 8760 datapoints
    temperature_final = temperature_final.slice(0, hours_in_year);
    insolation_final = insolation_final.slice(0, hours_in_year);
  }
  //climate data variation and data cleaning
  if (simulation_days <= 365) {
    modified_insolation_data = insolation_final.slice(0, (simulation_days * 24));//insolation_data_df[0:simulation_days*24]
    modified_temperature_data = temperature_final.slice(0, (simulation_days * 24)); //temperature_data_df[0:simulation_days*24]
  }

  if (simulation_days > 365) {
    modified_insolation_data = insolation_final.slice(0, (simulation_days * 24));//insolation_data_df[0:simulation_days*24]
    modified_temperature_data = temperature_final.slice(0, (simulation_days * 24)); //temperature_data_df[0:simulation_days*24]

    for (i = hours_in_year; i <= simulation_hours; i++) {
      let hour_measure = (i % hours_in_year);
      modified_insolation_data.push(insolation_final[hour_measure]);
      modified_temperature_data.push((temperature_final[hour_measure]) + climatic_rise_per_year); // nj.resize(temperature_data_df,[simulation_days*24])  
    }
  }

  console.log('\nData Cleanup Finished ---------------------\n');
  console.log('\nSolar Generation Works Start---------------------\n');

  //Solar Panel Aging Flagging
  if (instinct_config.simulation_data.solar_panel_aging_flag) {
    let solar_total_panels = solar_series * solar_parallel;
    for (i = 0; i < simulation_hours; i++) {
      solar_pure_output[i] = modified_insolation_data[i] * real_area * mod_eff_aging[i] * solar_total_panels;// Aging Effects
      //solar derated Flagging
      if (instinct_config.simulation_data.solar_panel_temperature_flag) {
        solar_derated_output[i] = ((-0.38 * solar_pure_output[i] * (modified_temperature_data[i] - stc_temperature)) / 100) + solar_pure_output[i];
      }
      else { solar_derated_output = solar_pure_output; } //non-derated option      
    }

  }
  else {
    for (i = 0; i < simulation_hours; i++) {
      solar_pure_output[i] = modified_insolation_data[i] * real_area * solar_efficiency * solar_total_panels;// based on calculation
      //solar derated Flagging
      if (instinct_config.simulation_data.solar_panel_temperature_flag) {
        solar_derated_output[i] = ((-0.38 * solar_pure_output[i] * (modified_temperature_data[i] - stc_temperature)) / 100) + solar_pure_output[i];
      }
      else { solar_derated_output = solar_pure_output; } //non-derated option  
    }
  }

  console.log('\nSolar panel output finished...---------------------\n');

  //check effectiveness of Charge Controller with settings
  // solar_derated_output = nj.array(solar_derated_output);



  // Charge Controller Modelling
  for (i = 0; i < simulation_hours; i++) {
    if ((CC_max_charging_power - solar_derated_output[i]) > 0) {
      solar_to_CC_loss[i] = 0;
    }
    else {
      solar_to_CC_loss[i] = (solar_derated_output[i] - CC_max_charging_power);
    }

    //2nd phase Charge Controller Models
    CC_output_raw_power[i] = solar_derated_output[i] * CC_eff;

    //Charge Controller Failure Detect
    if ((CC_output_raw_power[i] >= CC_max_charging_power) > 0) {
      CC_output_power[i] = CC_max_charging_power;
    }
    else {
      CC_output_power[i] = CC_output_raw_power[i];
      CC_overload_array[i] = 1; //detects overload
    }
  }
  console.log('\nCharge Controller output finished...---------------------\n');

  //Battery Modelling

  // Energy until the first hours till 12 AM of the data - Pre-Simulation Energy
  for (i = time_super_start; i < time_super_end; i++) {
    pre_sim_energy += inverter_DC_IN_POWER[i];
  }

  // Battery DOD at 12 AM (possible)
  batt_DOD = pre_sim_energy / batt_design_WH;//(((pre_sim_energy / 7) * 15) / batt_design_WH);

  for (i = 0; i < simulation_hours; i++) {
    //BMS Efficiency Corrections
    batt_OUT_current[i] = (inverter_DC_IN_CURRENT[i] / batt_BMS_eff);
    //Discharge Current Compensation Flagging //Peukert LAW application-------------------------------------
    if (instinct_config.simulation_data.batt_discharge_current_flag) {
      batt_CORRECTED_CURRENT[i] = batt_discharge_current_compensation(batt_OUT_current[i], batt_peukert_constant, batt_effective_AH, batt_C_RATE);
      //Battery Power Output
      batt_POWER_OUTPUT[i] = batt_CORRECTED_CURRENT[i] * system_voltage;
    }
    else {
      batt_CORRECTED_CURRENT[i] = batt_OUT_current[i];
      //Battery Power Output
      batt_POWER_OUTPUT[i] = batt_CORRECTED_CURRENT[i] * system_voltage;
    }
  }

  // Available Recharge Power from CC after providing to Load
  for (i = 0; i < simulation_hours; i++) {
    //Find the Avaialble Recharge Power
    if ((CC_output_power[i] - inverter_DC_IN_POWER[i]) < 0) {
      batt_recharge_power[i] = 0;
    }
    else {
      batt_recharge_power[i] = (CC_output_power[i] - inverter_DC_IN_POWER[i]);
    }
    //Battery Recharge Power Availability Flagging
    batt_charging_flag_array[i] = (CC_output_power[i] > 0) && (batt_recharge_power[i] > 0);
  }

//Battery Aging Effects - Initial SOH
batt_inst_energy = (batt_design_WH * batt_init_SOH); //Effective of initial Aging

//Energy of Battery at 12 AM. Compensation of pre-simulated energy
batt_inst_energy = batt_inst_energy - pre_sim_energy; // Energy of the battery at that instant

//reverfy charge/discharge possibilities
if(batt_design_WH > batt_inst_energy){batt_chargable = true;} else {batt_chargable = false;}
if(batt_inst_energy != 0){batt_dischargable = true;} else {batt_dischargable = false;}

//Pre-fill DOD Averaging Window
for (i = 0; i < batt_DOD_averagingWindow; i++) {
  batt_DOD_day_max_array.push(batt_DOD);
}
//create the varying capacity model - Capacity degradation effect
batt_real_WH = batt_design_WH;
// Battery Charging / Discharging Loop
for (i = 0; i < simulation_hours; i++) {
  //Charging the Battery Loop --------------------------------------------------------------
  if (batt_charging_flag_array[i]) {


    //SOH adjustment - flag test
    if(true){
      // batt_real_WH = 
    }

    //Recharge Factor Compensation



    //check if next step shoots above SOC
    if (batt_chargable) {
      let batt_effective_recharge_power = batt_recharge_factor_compen(batt_recharge_power[i], batt_recharge_factor);
      let batt_energy_final = (batt_inst_energy + batt_effective_recharge_power -(batt_recharge_losses * batt_recharge_power[i]));

      if (batt_energy_final < batt_real_WH) { // Battery Can be Charged



        // check --- LOGIC
        //Recharge Power Variable - Absortive, Trickle, Float
        // batt_recharge_power[i] = batt_recharge_power_modelling(batt_recharge_power[i],batt_SOC,system_voltage,no_of_batteries);


        batt_inst_energy += batt_effective_recharge_power - (batt_recharge_losses * batt_recharge_power[i]);
        batt_chargable = true; //Possible to recharge in the next cycle too
        batt_dischargable = true;
        energy_surplus[i] = 0; //Extra Energy Wasted or which can be given back to grid


      }
      else if (batt_energy_final == batt_real_WH) {  //Battery in Float State
        batt_inst_energy += batt_effective_recharge_power - (batt_recharge_losses * batt_recharge_power[i]);
        batt_chargable = false; //No Need to charge- Fully Charged
        batt_dischargable = true;
        energy_surplus[i] = 0;//Extra Energy Wasted or which can be given back to grid
        // console.log("Battery Floating ..1 " + batt_inst_energy);
      }
      else if (batt_energy_final > batt_real_WH) {
        excess_energy = ((batt_inst_energy + batt_recharge_power[i]) - batt_real_WH);
        batt_inst_energy = batt_real_WH;
        batt_chargable = false;//Excess Energy
        batt_dischargable = true;
        energy_surplus[i] = excess_energy;//Extra Energy Wasted or which can be given back to grid
        // console.log("Battery Floating .. 2 " + excess_energy);
      }
      else {
        console.log("NO BLOCKS ACTIVATED- CHECK CHARGING LOOP");
      }
    }
    else if (!batt_chargable) {
      batt_inst_energy = batt_real_WH;
      batt_chargable = false;//Excess Energy
      batt_dischargable = true;
      energy_surplus[i ]= batt_recharge_power[i];//Extra Energy Wasted or which can be given back to grid
      console.log("Battery Floating .. 3 " + batt_recharge_power[i]);
    }

    //do program for limiting current for c10
    batt_DOD = 1 - (batt_inst_energy / batt_real_WH);
    // batt_DOD = 1 - (batt_inst_energy / (1 * batt_total_WH));
    // console.log("DOD DATA" + batt_DOD); 
    batt_DOD_array[i] = batt_DOD;
    //Battery AH Loading  
    batt_inst_WH_array[i] = batt_inst_energy;
    energy_unmet[i] = 0;//for equuilizing the days

  //End of Charging the Battery Loop --------------------------------------------------------------
  }


  //Discharge - discharge limit (DOD = user input)----------------------------------------------
  else if (!batt_charging_flag_array[i]) {

    //SOH - SOC caliberations
    batt_real_WH = (batt_inst_SOH * batt_design_WH);
    //Test Conditions Check -------------------------------------

    //discharge current effects - Caliberated Energy - already done in the previous loop
    batt_energy_buffer = batt_POWER_OUTPUT[i]; //power output for 1 hour >> is Wh => Energy
    //Battery Temperature Compenstaion Flagging
    if(instinct_config.simulation_data.batt_temperature_flag){
      batt_energy_buffer = batt_temp_adjustment(batt_POWER_OUTPUT[i], modified_temperature_data[i], batt_real_WH);
    }    
    // Pre-sim - DOD check for loop variant analysis
    batt_test_DOD = 1 - ((batt_inst_energy - batt_energy_buffer) / batt_real_WH);
    //Test Conditions Check ----------END  ------------------

    //Check if next step shoots above SOC
    if (batt_dischargable) {      
      if (batt_test_DOD < batt_limited_DOD) { // Passed the DOD limit set by the user
        //Remaining energy in the battery after this hour's loading power
        batt_inst_energy = batt_inst_energy - batt_energy_buffer;
        batt_energy_pure[i] = batt_inst_energy;
        //Loop Variables  
        batt_chargable = true;//Possible to recharge in the next cycle
        batt_dischargable = true;
        energy_unmet[i] = 0;
      }
      else if (batt_test_DOD == batt_limited_DOD) {
        batt_inst_energy = batt_inst_energy - batt_energy_buffer; 
        batt_energy_pure[i] = batt_inst_energy;
        
        //Loop Variables    
        batt_chargable = true; //Possible to recharge in the next cycle
        batt_dischargable = false;
        energy_unmet[i] = 0;
      }
      else if (batt_test_DOD > batt_limited_DOD) {
        batt_inst_energy = (1 - batt_limited_DOD) * batt_real_WH;// energy remaining in the battery
        batt_energy_pure[i] = batt_inst_energy;
        batt_chargable = true;  //Possible to recharge in the next cycle
        batt_dischargable = false;
        energy_unmet[i] = batt_real_WH * (batt_test_DOD - batt_limited_DOD);// energy provided till DOD limit, rest is unmet. Find the rest
        batt_fail_count += 1; //hours
      }
    }
    else if (!batt_dischargable) {
      batt_inst_energy = ((1 - batt_limited_DOD) * batt_real_WH) + inverter_standby_power;
      //include the inverter standby power consumption ~ 10W or more
      batt_energy_pure[i] = batt_inst_energy ;
      batt_chargable = true;//Possible to recharge in the next cycle
      batt_dischargable = false;
      energy_unmet[i] = batt_OUT_current[i] * system_voltage;//Unmet Energy or which requires grid suppport
      batt_fail_count += 1;
      // console.log("Battery Discharge Limit Reached.. 4 " + batt_inst_energy); 
    }
    //Post Processing of the loop
    //do program for limiting current for c10
    batt_DOD = 1 - (batt_inst_energy / batt_real_WH);
    batt_DOD_array[i] = batt_DOD;

    energy_surplus[i] = 0;//for equuilizing the days
    //Battery AH Loading  
    batt_inst_WH_array[i] = batt_inst_energy;



    //COMPLEX 1 --------------------- PERMANENT EFFECTS PROGRAM
    // Day finder and DOD extraction for SOH
    batt_DOD_hourly.push(batt_DOD);
    batt_TEMP_hourly.push(modified_temperature_data[i]);

    // Day finder and DOD extraction for SOH
    if (i % 24 == 0) { //all daily program
      main_loop_count_days++;
      if (i != 0) {
        var largest = 0;
        for (n = 0; n < batt_DOD_hourly.length; n++) {
          if (largest < batt_DOD_hourly[n]) {
            largest = batt_DOD_hourly[n];
          }
        }
        //shift data to left and then load the new data
        batt_DOD_day_max_array.shift();
        batt_DOD_day_max_array.push(largest); //everyday maximum DOD record
        batt_DOD_hourly = []; //reset the hourly data of the day for the next day
        //find the total DOD 
        batt_DOD_accumulatedDays += batt_DOD_day_max_array[batt_DOD_day_max_array.length - 1];
        if ((main_loop_count_days % batt_DOD_averagingWindow) == 0 && (main_loop_count_days != 0)) {
          //find the average of the data  
          batt_DOD_window_average = (batt_DOD_day_max_array.reduce((x, y) => x + y)) / batt_DOD_day_max_array.length;// array.average(batt_DOD_day_max_array);
        }
        //temperature modification
        batt_TEMP_day_average.push((batt_TEMP_hourly.reduce((x, y) => x + y)) / batt_TEMP_hourly.length);
        batt_TEMP_hourly = [];
        batt_DOD_SOH_buffer = batt_DOD_compensation_program(batt_DOD_window_average * 100);
        batt_BATT_arhenius.push(batt_arhennius_compensation_program(batt_DOD_SOH_buffer, batt_TEMP_day_average[batt_TEMP_day_average.length - 1], 25));
        
        //aging effects of battery
        if(instinct_config.simulation_data.batt_aging_flag){
          batt_inst_SOH = (batt_SOH_compensation_program(80, batt_BATT_arhenius[batt_BATT_arhenius.length - 1], batt_DOD_accumulatedDays) / 100);
          batt_SOH_final.push(batt_inst_SOH * 100);
        }
        else{
          batt_inst_SOH = 1;
        }       
      }
    }
    //COMPLEX 1 -----END --------- PERMANENT EFFECTS PROGRAM
  }
} //End of the simulation loop



  // Demand Energy and Energy Saved
  // load - unmet energy
  let energy_utilized = [];
  for (i = 0; i < simulation_hours; i++) {
    energy_utilized.push(generated_load_profile[i] - energy_unmet[i]);
  }


  // convert to normal array
  // solar_derated_output = solar_derated_output.tolist();
  let simulation_outputs = {};

  //output variables
  let out_DOD_month_min = [];
  let out_DOD_month_max = [];
  let out_solar_energy_per_month = [];
  let out_solar_energy_per_day = [];
  let out_temp_month_min = [];
  let out_temp_month_max = [];
  let out_unmet_energy_month = [];
  let out_surplus_energy_month = [];

  //comparator
  let out_DOD_inst_max = 0;
  let out_DOD_inst_min = 100;

  let out_unmet_energy_sum_day = 0;
  let out_surplus_energy_sum_day = 0;
  let out_unmet_energy_sum_month = 0;
  let out_surplus_energy_sum_month = 0;

  let out_unmet_energy_per_day = [];
  let out_surplus_energy_per_day = [];


  // 
  let out_solar_day_sum = 0;
  let out_solar_month_sum = 0;

  //
  let energy_saved_per_day = [];
  let energy_saved_per_month = [];
  let energy_saved_per_day_sum = 0;
  let energy_saved_per_month_sum = 0;
// Energy Calculation Counter

  for (counter = 0; counter <= simulation_hours; counter++) {
    // Energy Saved 
    energy_saved_per_day_sum += energy_utilized[counter];
    energy_saved_per_month_sum += energy_utilized[counter];

    //findmax
    if (out_DOD_inst_max < batt_DOD_array[counter]) {
      out_DOD_inst_max = batt_DOD_array[counter];
    }
    //findmin
    if (out_DOD_inst_min > batt_DOD_array[counter]) {
      out_DOD_inst_min = batt_DOD_array[counter];
    }

    //unmet_energy
    out_unmet_energy_sum_day += energy_unmet[counter];
    out_unmet_energy_sum_month += energy_unmet[counter];

    //surplus_energy
    out_surplus_energy_sum_day += energy_surplus[counter];
    out_surplus_energy_sum_month += energy_surplus[counter];

    //solar Power Generated
    out_solar_day_sum += solar_derated_output[counter];
    out_solar_month_sum += solar_derated_output[counter];


    //per day energy needs
    if ((counter % 23) == 0 && (counter != 0)) { // Day Segg

      // UNMET
      out_unmet_energy_per_day.push(out_unmet_energy_sum_day);
      out_unmet_energy_sum_day = 0;

      // SURPLUS
      out_surplus_energy_per_day.push(out_surplus_energy_sum_day);
      out_surplus_energy_sum_day = 0;

      // SUM OF SOLAR POWER PER DAY
      out_solar_energy_per_day.push(out_solar_day_sum);
      out_solar_day_sum = 0;

      // Energy Saved
      energy_saved_per_day.push(energy_saved_per_day_sum);
      energy_saved_per_day_sum = 0;
    }
    //per month energy and demands and amount
    if ((counter % 719) == 0 && (counter != 0)) { // Month Segg
      // console.log("permonth" + out_DOD_inst);
      out_DOD_month_max.push(out_DOD_inst_max);
      out_DOD_month_min.push(out_DOD_inst_min);
      out_DOD_inst_max = 0;
      out_DOD_inst_min = 100;

      // SUM OF SOLAR POWER PER MONTH
      out_solar_energy_per_month.push(out_solar_month_sum);
      out_solar_month_sum = 0;
      // UNMET and SURPLUS
      out_unmet_energy_month.push(out_unmet_energy_sum_month);
      out_unmet_energy_sum_month = 0;
      out_surplus_energy_month.push(out_surplus_energy_sum_month);
      out_surplus_energy_sum_month = 0;

      // Energy Saved
      energy_saved_per_month.push(energy_saved_per_month_sum);
      energy_saved_per_month_sum = 0;
    }
  }
  //loading data into the object
  // SOlar Power 
  simulation_outputs.solar_power_output_perday = out_solar_energy_per_day;
  simulation_outputs.solar_power_output_permonth = out_solar_energy_per_month;
  // Unmet Energies
  simulation_outputs.unmet_energy_perday = out_unmet_energy_per_day;
  simulation_outputs.unmet_energy_permonth = out_unmet_energy_month;
  // Surplus Energies
  simulation_outputs.surplus_energy_perday = out_surplus_energy_per_day;
  simulation_outputs.surplus_energy_permonth = out_surplus_energy_month;
  simulation_outputs.months_array = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  simulation_outputs.days_number = nj.arange(simulation_days);



  let SOH_nj = nj.array(batt_SOH_final);
  let nj_X_data = nj.arange(simulation_days - 1);
  // console.log(SOH_nj);
  // console.log(SOH_nj.std());
  // console.log(SOH_nj.mean());
  // console.log(SOH_nj.shape);
  // console.log(nj_X_data);
  // console.log(nj_Y_data.std());
  // console.log(nj_Y_data.mean());
  // console.log(nj_X_data.shape);




  // function linear_regression(x_data, y_data){
  //   // var slope,intercept = 0;
  //   var x_sum =0;
  //   var y_sum =0;
  //   var x_sum_2 =0;
  //   var x_y_sum =0;
  //   var output = {};

  //   var sample_size = x_data.tolist().length;

  //   for(i=0;i<sample_size;i++){
  //     x_sum += x_data.get(i);
  //     x_sum_2 += x_data.get(i) * x_data.get(i);
  //     y_sum += y_data.get(i);
  //     x_y_sum +=  x_data.get(i) * y_data.get(i);
  //   }
  //   console.log("x_sum  " + x_sum);
  //   console.log("x_sum_2  " + x_sum_2);
  //   console.log("y_sum  " + y_sum); 
  //   console.log("x_y_sum  " + x_y_sum);
  //   output.intercept = ((y_sum*x_sum_2) - (x_sum * x_y_sum))/((sample_size*x_sum_2)- (x_sum * x_sum));
  //   output.slope = ((sample_size*x_y_sum)-(x_sum*y_sum))/((sample_size*x_sum_2)-(x_sum*x_sum));

  //   return output;
  // }

  // console.log(linear_regression(nj.array([4, 5, 6, 7, 10]),nj.array([3, 8, 20, 30, 12])));
  // console.log(linear_regression(nj.array([0,1,2,3,4,5]),nj.array([98.9,12,6,9,5,2])));

  var regressive_data = linear_regression(nj_X_data, SOH_nj);

  simulation_outputs.batt_SOH_line_equation = regressive_data;

  var fitted_curve = [];
  for (i = 0; i < simulation_days; i++) {
    fitted_curve.push((regressive_data.slope * i) + regressive_data.intercept);
  }

  simulation_outputs.batt_SOH_fitted_curve = fitted_curve;

  let batt_life_predicted = (80 - 100) / regressive_data.slope;

  simulation_outputs.predicted_life_of_battery = batt_life_predicted;

  let energy_unmet_acccumulated = nj.array(energy_unmet);
  let energy_surplus_acccumulated = nj.array(energy_surplus);

  console.log("UNMET " + energy_unmet_acccumulated.sum());
  console.log("SURplus " + energy_surplus_acccumulated.sum());
  simulation_outputs.energy_unmet_total = energy_unmet_acccumulated.sum();
  simulation_outputs.energy_surplus_total = energy_surplus_acccumulated.sum();
  simulation_outputs.simulated_days = simulation_days;
  simulation_outputs.energy_saved_daily = energy_saved_per_day;
  simulation_outputs.energy_saved_monthly = energy_saved_per_month;

  let energy_saved_acccumulated = nj.array(energy_utilized);
  simulation_outputs.energy_saved_overall = energy_saved_acccumulated.sum();

  // simulation_outputs.energy_utilized = energy_utilized;

  // console.log(fitted_curve);
  //final outputs to file

  // console.log(out_DOD_month_max);
  // console.log(out_DOD_month_min);


  //ENERGY SURPLUS AND UNMET
  // surplus monthly - daily average - yearly
  //unmet monthly - daily - yearly
  // //fail counts
  // //only if the simulation is for more that 1 year
  // console.log("\nBattery Design - DOD Failure " + batt_fail_count + " hours\n");
  //Surplus Energy

  // console.log("\nSurplus Energy " + nj.sum(energy_surplus) + " Wh of Energy\n");
  // //Unmet Energy
  // console.log("\nUnmet Energy " + nj.sum(energy_unmet) + " Wh of Energy\n");

  // console.log("\nTotal Demand Energy " + nj.sum(generated_load_profile) + " Wh of Energy\n");

  // //unmet Energy Percentage
  // console.log("\nUnmet Energy Percentage " + nj.sum(energy_unmet)/nj.sum(generated_load_profile) + " %\n");

  // //Surplus Energy Percentage
  // console.log("\nSurplus Energy Percentage " + nj.sum(energy_surplus)/nj.sum(generated_load_profile) + " %\n");
  // //tariff Charges
  // tariff_buy_till_100 = 3.30 //rs/unit
  // tariff_buy_till_300 = 7.30//rs/unit
  // tariff_buy_till_500 = 9.90 //rs/unit
  // tariff_buy_from_501 = 11.5 //rs/unit
  // tariff_sell = 5 //rs/unit

  // //Total Amount Saved
  // //units of energy effectively used
  // let energy_effective_saved_avg_per_month = (nj.sum(generated_load_profile) - nj.sum(energy_unmet)) / (12 * 1000) // kWh or units
  // //print(energy_effective_saved_avg_per_month)
  // //Units of energy exportable for Grid-Tied Net Metering System
  // let energy_exportable = nj.sum(energy_surplus) / 1000 // kWh or units

  // //Total Amount saved yearly
  // if(energy_effective_saved_avg_per_month <=100){
  //   amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_100 * 12;
  // }

  // else if(energy_effective_saved_avg_per_month > 100 && energy_effective_saved_avg_per_month <=300){
  //   amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_300 * 12;
  // }

  // else if(energy_effective_saved_avg_per_month > 300 && energy_effective_saved_avg_per_month <=500){
  //   amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_500 * 12;
  // }

  // else if(energy_effective_saved_avg_per_month > 500){
  //   amount_saved = energy_effective_saved_avg_per_month * tariff_buy_from_501 * 12;
  // }

  // //Amount Saved
  // console.log("\nAmount Saved Rs. " + amount_saved + " /- per year\n");

  // //Net Metering - if grid-tied
  // let amount_generated = energy_exportable * tariff_sell;
  // console.log("\nAmount Generated by exporting - (Only for Net Metering Grid Tied system) Rs. " + amount_generated + " /- per year\n");

  // //investment Amount
  // let solar_panel_price_individual = 10440; //rs. per piece
  // let charge_controller_price_individual = 8900;
  // let inverter_price_individual = 10000;
  // let battery_price_individual = 11900;

  // let invest_solar_panels = solar_panel_price_individual * solar_series *  solar_parallel;
  // let invest_battery = battery_price_individual * batt_in_parallel * batt_in_series;
  // let invest_charge_controller = charge_controller_price_individual;
  // let invest_inverter = inverter_price_individual;

  // let component_investment = invest_solar_panels + invest_battery + invest_charge_controller + invest_inverter;

  // let total_investment = component_investment + (component_investment * 0.02);
  // console.log("\nTotal Investment Rs. " + total_investment + " /- \n");
  // console.log('\n------------------------ NOT ACCOUNTING FOR RECURRING AMOUNT -----------------------\n');

  // let payback_period = total_investment / amount_saved;
  // let payback_period_netmetered = total_investment / (amount_saved + amount_generated);
  // console.log("\nPayback Period " + payback_period + " years\n");
  // console.log("\nPayback Period with Net Metering " + payback_period_netmetered + " years\n");



  // console.log(main_loop_count_days);
  // console.log("\nDOD Hourly array \n" + batt_DOD_hourly);
  // console.log("\nDOD Max daily array \n" + batt_DOD_day_max_array);
  // console.log("\nDOD MAX Windows average \n" + batt_DOD_window_average);
  // console.log("\nbatt_SOH_array \n" + batt_SOH_array);
  // console.log("\nTemp Hourly \n" + batt_TEMP_hourly);
  // console.log("\n Temp daily Average \n" + batt_TEMP_day_average);
  // console.log("\n Cycles after arhenuis \n" + batt_BATT_arhenius);
  // console.log("\n SOH Final \n" + JSON.stringify(batt_SOH_final));
  console.log("------------------------END OF THE PROGRAM--------------------");
  // console.log(event);
  // console.log(event.sendReply('simulation_end_cue', 'sim_ended'));
  // event.reply('simulation_end_cue', 'sim_ended');

  //File Saving/creating for all the data

  // let base_output_folder = "outputs/";
  let base_output_folder = resolve(__dirname, 'outputs');
  //ENERGY UNMET
  // fs.writeFile(base_output_folder + 'output_energy_unmet.json', JSON.stringify(energy_unmet), function (err) {
  fs.writeFile(resolve(base_output_folder,'output_energy_unmet.json'), JSON.stringify(energy_unmet), function (err) {
    if (err) throw err;
    console.log('ENERGY_UNMET-SAVED');
  });
  //BATT_ENERGY_SURPLUS ARRAY
  fs.writeFile(resolve(base_output_folder,'output_energy_surplus.json'), JSON.stringify(energy_surplus), function (err) {
    if (err) throw err;
    console.log('ENERGY_SURPLUS-SAVED');
  });
  //BATT_SOH ARRAY
  fs.writeFile(resolve(base_output_folder,'output_batt_SOH.json'), JSON.stringify(batt_SOH_final), function (err) {
    if (err) throw err;
    console.log('BATT_SOH-SAVED');
  });
  //BATT_DOD ARRAY
  fs.writeFile(resolve(base_output_folder,'output_batt_DOD.json'), JSON.stringify(batt_DOD_array), function (err) {
    if (err) throw err;
    console.log('BATT-DOD-SAVED');
  });

  //OUTPUTS
  fs.writeFile(resolve(base_output_folder,'simulation_outputs.json'), JSON.stringify(simulation_outputs), function (err) {
    if (err) throw err;
    console.log('SIMLUATION OUTPUT SAVED');
  });

  event.reply('simulation-response', 'Over');
});



// ipcMain.on('promisesTest', (event, data) => {
//   console.log("Started");

//   const newP = new Promise((resolve, reject) => {
//     let file1 = fs.readFileSync(resolve(__dirname, 'database/temp_data.json'));
//     if (file1) {
//       event.reply('simulation-response', '1');
//       resolve(file1);
//     } else {
//       reject("Not Loaded");
//     }
//   });
//   newP
//     .then((tre) => {
//       event.reply('simulation-response', '3');
//       console.log(tre);
//     })
//     .catch((mess) => {
//       console.log(mess);
//     });

//   event.reply('simulation-response', '2');
//   // let file1 = fs.readFileSync('database/temp_data.json');
//   // event.reply('simulation-response', file1);

//   console.log("Finished");
// });


// Main Functions

//----------------------------------NEW
// Simulation Program
// ipcMain.handle('simulation_run1', (event, data) => {
//   let instinct_config;
//   fs.readFile(resolve(__dirname, 'database/temp_data.json'), function (err, data) {
//     instinct_config = JSON.parse(data);
//     // seed
//     var seed = 1;
//     rand1 = rand_gen.create(seed);
//     console.log('Program is Started running... \n');
//     // console.log(instinct_config);
//   });
// });