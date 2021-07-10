//Aging- Solar Panel
const solar_panel_aging_program = (original_eff, day_id)=>{
    var first_part = (day_id * 0.00202 /100);
    return original_eff * (1-first_part);
  }
  // Temperature Dependency - Solar Panel
  const solar_panel_temperature_program = (temperature, solar_temp_coeff,solar_max_power,std_temp)=>{
      return ((temperature - std_temp) * solar_temp_coeff) + solar_max_power;
  }

exports.solar_panel_aging_program = solar_panel_aging_program;
exports.solar_panel_temperature_program = solar_panel_temperature_program;