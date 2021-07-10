const batt_temp_adjustment = (batt_WH,temperature,max_WH_batt)=>{
    let batt_temp_coeff = 0.006;
    let stc_temperature = 25;
    let batt_temp_comp_WH = batt_WH * (1- (batt_temp_coeff * (stc_temperature - temperature)));
    if (batt_temp_comp_WH >= max_WH_batt){
      batt_temp_comp_WH = max_WH_batt;
    }
    return batt_temp_comp_WH
  }


// Aging-Battery
const batt_discharge_current_compensation = (battery_current,peukert_constant,effective_AH, C_rate)=>{
    return (Math.pow(battery_current,peukert_constant))/(Math.pow((effective_AH/C_rate),(peukert_constant -1)))
}
// console.log(batt_discharge_current_compensation(12,0.4,200,10))
//DOD effects on Battery overtime
const batt_DOD_compensation_program = (avg_DOD)=>{
    //returns cycles remaining
    return (-58.333 * avg_DOD + 6083.3);
}
//Arhennius Equation
const batt_arhennius_compensation_program = (batt_cycles_stc, avg_daily_temperature,std_temp)=>{
    //returns cycles remaining after temperature Compensation
    var phase_one = (avg_daily_temperature - std_temp) / 50;  
    return (batt_cycles_stc * Math.pow(0.5,phase_one));
}
const batt_SOH_compensation_program = (end_of_batterylife,cycles_remaining, present_cycle_battery)=>{
    //Final SOH after all compensations
    return ((-(end_of_batterylife)/cycles_remaining) * present_cycle_battery) + 100;
}

//Recharge Power variation per recharge cycle
const batt_recharge_power_modelling = (recharge_power, state_of_charge, system_voltage, no_of_batteries)=>{
   
    let bulk_voltage = 15.6 * no_of_batteries;
    let absorption_voltage = 14.8 * no_of_batteries;
    let float_voltage = 13.8 * no_of_batteries;

    if(state_of_charge > 0 && state_of_charge < 0.8){ //Bulk Charging
        return ( (recharge_power * bulk_voltage) / system_voltage )
    }
    else if(state_of_charge >= 0.8 && state_of_charge < 0.8){ //Absorption Charging
        return ( (recharge_power * absorption_voltage) / system_voltage )
    }
    else{ // Float Charging
        return ( (recharge_power * float_voltage) / system_voltage )
    }
}

const batt_recharge_factor_compen = (recharge_power, batt_recharge_factor)=>{
//
return (recharge_power * batt_recharge_factor)
}

// exports
exports.batt_temp_adjustment = batt_temp_adjustment;
exports.batt_discharge_current_compensation = batt_discharge_current_compensation;
exports.batt_DOD_compensation_program = batt_DOD_compensation_program;
exports.batt_arhennius_compensation_program = batt_arhennius_compensation_program;
exports.batt_SOH_compensation_program = batt_SOH_compensation_program;
exports.batt_recharge_power_modelling = batt_recharge_power_modelling;
exports.batt_recharge_factor_compen = batt_recharge_factor_compen;