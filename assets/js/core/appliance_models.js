//Appliances Models
const refrigeration_full_day = (temperature, parameters) => {
    var first_part = (day_id * 0.00202 / 100);
    return original_eff * (1 - first_part);
};
// Temperature Dependency - Solar Panel
const air_conditioner = (temperature, solar_temp_coeff, solar_max_power, std_temp) => {
    return ((temperature - std_temp) * solar_temp_coeff) + solar_max_power;
};

exports.refrigeration_full_day = refrigeration_full_day;
exports.air_conditioner = air_conditioner;