# -*- coding: utf-8 -*-
"""
Created on Fri Oct  2 13:25:55 2020

@author: AJIT PAUL ABRAHAM
"""
import sys
print('Program started')
print(sys.executable)
print('Finished the Program')
sys.stdout.flush()
# import pandas as pd
# import numpy as np
# import random, math/
# np.set_printoptions(threshold=sys.maxsize)
# random.seed(1) #change the seed if you want different randomization
#time detection concepts
# simulation_days =365
# simulation_hours = simulation_days*24
# hours_array = np.arange(simulation_hours)
# # Program Start
# print('Program started')
# print(sys.executable)
# # sys.stdout.flush()
# #detection variables
# hour_counter = 0
# count_days = 0
# count_weeks = 0
# count_months = 0
# count_years = 0

# weekend_detect_array = np.zeros(simulation_hours)
# weekend_hour_counter = 0
# hours_reset = 0
# week_days_reset = 0




# Finalisation
# print('Finished the Program')
# sys.stdout.flush()




# import matplotlib.pyplot as plt
# plt.style.use('seaborn-whitegrid')


# simulation_hours = simulation_days*24
# hours_array = np.arange(simulation_hours)

# #detection variables
# hour_counter = 0
# count_days = 0
# count_weeks = 0
# count_months = 0
# count_years = 0

# weekend_detect_array = np.zeros(simulation_hours)
# weekend_hour_counter = 0
# hours_reset = 0
# week_days_reset = 0

# for hour_counter in range(len(hours_array)):
#     hours_reset += 1
    
# #Weekend Start Detection   
#     if (week_days_reset > 4): 
#         weekend_detect_array[hour_counter] =1 #Weekend hours flag
        
# #Day counter
#     if (hours_reset % 24 == 0):
#         count_days += 1
#         week_days_reset +=1
#         hours_reset =0

# #Week Detection   
#     if (week_days_reset == 7): 
#         count_weeks += 1
#         week_days_reset = 0
# #Month Detection
#     count_months = int(count_weeks/4)

# #Start Load Profile Generation------------------------------------------------------------

# #The Variables
# power_factor = 0.8
# load_voltage = 220
# load_variability_tolerance = 3 #input as 3% tolerance
# load_inflation_per_year = 40 #in %
# weekend_load_rise = 2 #in percent
# hour_id = 0
# day_counter =0

# #data_array
# generated_load_profile = np.zeros(simulation_hours)
# load_current_demand_AC = np.zeros(simulation_hours)
# #Start
# load_data = pd.read_csv('baseline_load.csv')
# load_data_df = load_data.iloc[0:24,[1]].values

# #--------LOAD  VARAIBLES-------------
# load_inflation_percent_per_day = (load_inflation_per_year/876000) # 10% increase every year = 24*365*100

# for load_data_inst in range(simulation_hours): 
# #variability randomizer
#     load_variability = random.uniform((-1 * load_variability_tolerance),load_variability_tolerance)
#     hour_id = load_data_inst % 24
#     if (hour_id == 0 and load_data_inst !=0):
#         day_counter +=1
#     generated_load_profile[load_data_inst] = load_data_df[hour_id] #actual load
#     #Variability Addition
#     generated_load_profile[load_data_inst] += (generated_load_profile[load_data_inst] * load_variability * 0.01) #adding variability
#     #load Inflation addition    
#     generated_load_profile[load_data_inst] +=  (load_data_df[hour_id] * load_inflation_percent_per_day * day_counter) # adding load inflation
#     # energy_hourly += generated_load_profile[load_data_inst]
#     # hour_id += 1
#     #Weekend Effects
#     if (weekend_load_rise != 0 and weekend_detect_array[load_data_inst] == 1):
#         generated_load_profile[load_data_inst] += (generated_load_profile[load_data_inst] * (weekend_load_rise/100))
    
#     #Load Parameters Extraction
#     #load_current_demand_AC[load_data_inst] = generated_load_profile[load_data_inst]/ (power_factor * load_voltage)
    
# #Load Parameters Extraction    
# load_current_demand_AC = generated_load_profile / (power_factor * load_voltage)

# print("\nLOAD PROFILE -------------- RESULTS\n")
# #Inverter Passthrough Effects and Input DC 

# #Inverter Variables
# inverter_loading_percentage = np.zeros(simulation_hours)
# inverter_efficiency = np.zeros(simulation_hours)
# inverter_design_rating = 800 #in watts NOT VA
# inverter_DC_IN_POWER = np.zeros(simulation_hours)
# inverter_DC_IN_CURRENT= np.zeros(simulation_hours)


# #system states
# system_voltage = 48 #[12, 24, 48, 96, 120, 240] #12V / 24V / 48V / 96V / 120V / 240V
# system_states = ["Charging","Discharging", "Float", "Grid Feed"]

# #inverter model
# inverter_loading_percentage = (generated_load_profile / inverter_design_rating) * 100
# inverter_efficiency = 90-(104.43 * math.e**(-0.524 * ((inverter_loading_percentage)**0.686)))
# inverter_DC_IN_POWER = generated_load_profile/(inverter_efficiency/100)
# #Inverter Demand
# inverter_DC_IN_CURRENT = inverter_DC_IN_POWER / system_voltage

# print("\nINVERTER -------------- RESULTS\n")

# #GENERATION ARRAYS AND DATA
# weather_data = pd.read_csv('weather.csv')
# # print(weather_data.describe())

# #data_cleaning and balancing
# hours_in_year = 24*365
# add_hours = 0

# #Temperature Data
# temperature_data_df = weather_data.iloc[0:,[2]].values
# additional_hours_needed = hours_in_year - len(temperature_data_df)
# #Insolation Data
# insolation_data_df = weather_data.iloc[:,[1]].values * 1000 #Watts

# for add_hours in range(additional_hours_needed):
#     temperature_data_df = np.append(temperature_data_df,temperature_data_df[-additional_hours_needed+add_hours])
#     insolation_data_df = np.append(insolation_data_df,insolation_data_df[len(temperature_data_df)%24])

# print('\nData Cleanup Finished ---------------------\n')
# print('\nSolar Generation Works Start---------------------\n')

# #Solar Information - Vikram Solar 365W SOLIVO GRAND - MONO PERC
# solar_Wp = 365 #watts
# solar_efficiency = 0.1907
# solar_Voc = 48.3 # Open Circuit Voltage
# solar_Isc = 9.73  #Short circuit current
# solar_Vm = 39.8  # Peak Voltage
# solar_Im = 9.17   # Peak current

# solar_fill_factor = (solar_Vm * solar_Im) / (solar_Voc * solar_Isc)
# print(solar_fill_factor)

# real_area = solar_Wp / (solar_efficiency * 1000)
# #real_area = 1.221543587 # from datasheet
# #calculated_area = solar_Wp / 1000 # m2
# #print("\nReal Area =" + str(real_area) + "Calculated area = " + str(calculated_area)+"\n")
# solar_series = 3
# solar_parallel = 3
# stc_temperature = 25 # degrees celcius
# #final_solar_generation = np.zeros(simulation_hours)
# solar_pure_output = np.zeros(simulation_hours)
# solar_derated_output = np.zeros(simulation_hours)

# # mod_eff_aging = (1-((0.00000084)* math.e**(hours_array/320))) * solar_efficiency
# mod_eff_aging = (1-((0.00000084)* hours_array)) * solar_efficiency

# if(simulation_days <= 365):
#     trimmed_insolation_data = insolation_data_df[0:simulation_days*24]
#     modified_temperature_data = temperature_data_df[0:simulation_days*24]
    
# if(simulation_days > 365):
#     trimmed_insolation_data = np.resize(insolation_data_df,[simulation_days*24])
#     modified_temperature_data = np.resize(temperature_data_df,[simulation_days*24])    
    
# #solar_pure_output = trimmed_insolation_data * real_area * mod_eff_aging  * solar_series * solar_parallel # Based on datasheet area

# solar_pure_output = trimmed_insolation_data * real_area * mod_eff_aging  * solar_series * solar_parallel # based on calculation

# solar_derated_output = ((-0.38 * solar_pure_output * (modified_temperature_data - stc_temperature))/100) + solar_pure_output


# # needs correction as charge controller efficiency is not considered

# # solar_derated_output >>>>>>>>> charge controller >>>>> inverter / battery
# #solar_final_output_power = solar_derated_output
# print('\nSolar panel output finished...---------------------\n')

# #check effectiveness of Charge Controller with settings
# solar_MAX_OUTPUT_POWER = np.amax(solar_derated_output)


# # Charge Controller Compensation
# # Smarten PRIME 30 amps, 48V model 
# CC_eff = 0.94 #95%
# CC_rating_current = 30 #Amperes
# #Required Battery Variables
# batt_voltage = 12 # Battery voltage options are 2V, 6V, 9V, 12V, 24V
# batt_in_parallel = 2
# batt_in_series = system_voltage / batt_voltage
# #maximum rated power
# CC_max_rated_power = CC_rating_current * batt_in_series * batt_voltage
# #max input current
# #CC_max_input_current = 
# CC_overload_count = 0
# solar_to_CC_loss = np.where((CC_max_rated_power - solar_derated_output) > 0, 0,-1*(CC_max_rated_power - solar_derated_output))

# CC_charging_voltage = 15.6 * batt_in_series
# #pure output
# CC_output_raw_power = solar_derated_output * CC_eff

# CC_output_power = np.where((CC_output_raw_power >= CC_max_rated_power),CC_max_rated_power,CC_output_raw_power)
# print('\nCharge Controller output finished...---------------------\n')





# #Battery Modelling
 
# #Batery initialization values
# #Start DOD/SOC,SOH, age, etc
# batt_MAX_DOD = 0.5 # 50% DOD maximum DOD limited by user

# #Time range for prelim energy calculation----------------------------
# time_super_start = 17 #simulate energy used from 5 PM to 12 AM as the actual starting point is 12 mid night but we dont know how much energy we have left, hence pre sim
# time_super_end = 24 #mid night
# #--------------------------------------------------

# #Fetch the power requirement array of the battery
# pre_sim_energy = np.sum(inverter_DC_IN_POWER[time_super_start:time_super_end]) #Amount of energy used till midnight from day (-1) ---> Previous day

# print("\nPresimulation Energy from battery " + str(pre_sim_energy) + " Wh \n")


# #Pre simulation for finding the starting DOD at MIDNIGHT of the day of simulation starts.

# batt_init_SOH = 1 # SOH 100% = 1
# batt_init_SOC = 1

# # Battery used is Exide Solar Tubular 150 AH Model
# batt_AH_individual = 150 #AH rating of each battery

# batt_effective_AH = batt_AH_individual * batt_in_parallel

# # Other relevant info
# batt_C_RATE = 10 # AH rated hours >> C10 = 10, C20 = 20
# batt_optimal_output_current_maximum = batt_effective_AH / batt_C_RATE

# batt_peukert_constant = 1.4 #can modify this value for replicating the aging effects

# batt_BMS_eff = 0.99 #BMS controller efficiency 99% default

# batt_OUT_current = (inverter_DC_IN_CURRENT / batt_BMS_eff)

# #Peukert LAW application-------------------------------------
# #batt_CORRECTED_CURRENT = pow(batt_OUT_current,batt_peukert_constant) / pow((batt_effective_AH/batt_C_RATE),(batt_peukert_constant -1))
# batt_CORRECTED_CURRENT = pow(batt_OUT_current,batt_peukert_constant) / pow((batt_effective_AH/batt_C_RATE),(batt_peukert_constant -1))

# batt_AH_OUTPUT = batt_OUT_current
# batt_POWER_OUTPUT = batt_CORRECTED_CURRENT * system_voltage

# #Temperature Dependency parameters
# batt_temp_comp_AH = np.zeros(simulation_hours)
# def batt_temp_adjustment(batt_WH_instant,temperature_in_C, max_WH_battery):
#     batt_temp_coeff = 0.006
#     batt_temp_comp_WH = batt_WH_instant * (1- (batt_temp_coeff * (stc_temperature - temperature_in_C)))
#     if (batt_temp_comp_WH >= max_WH_battery):
#         batt_temp_comp_WH = max_WH_battery
#     #print("temp_comp " + str(batt_WH_instant - batt_temp_comp_WH))
#     return batt_WH_instant

# plt.plot(load_current_demand_AC, color="blue", label="Load Current AC - Demand",alpha=0.5)
# # plt.plot(batt_OUT_current, color="red",label='Inverter Demand Current',alpha=0.5)
# # plt.plot(batt_CORRECTED_CURRENT,color="green",label='Battery Current Peukert',alpha=0.5)
# plt.xlabel('Hours')
# plt.ylabel('Current in Amperes')
# plt.legend()
# plt.show()

# batt_total_batteries = batt_in_parallel * batt_in_series

# batt_total_AH = batt_total_batteries * batt_AH_individual
# batt_total_WH = batt_voltage * batt_total_AH

# # Battery DOD at 12 AM (possible)
# batt_DOD = (pre_sim_energy / batt_total_WH) #* 100

# batt_recharge_power = np.where((CC_output_power - inverter_DC_IN_POWER) < 0, 0, CC_output_power - inverter_DC_IN_POWER)

# batt_charging_flag_array = (CC_output_power > 0) & (batt_recharge_power > 0)

# plt.plot(solar_pure_output,color='blue',label='Solar Power Apparent')
# plt.plot(solar_derated_output,color='green',label='Solar Derated Power')
# plt.plot(batt_recharge_power, color="red",label='Recharge Power')
# plt.xlabel('Hours')
# plt.ylabel('Power in Watts')
# plt.legend()
# plt.show()

# #final charging and discharging points
# batt_inst_energy = 0 # Energy Available at any instant in the battery
# batt_inst_energy = (batt_total_WH * batt_init_SOH) #effective of initial aging

# #SOH array form
# batt_inst_SOH = batt_init_SOH

# # print("Battery inst. energy " + str(batt_inst_energy))

# #after prelim-energy compensations
# batt_inst_energy = batt_inst_energy - pre_sim_energy # Energy of the battery at that instant

# #Batt_inst_AH - AH of the battery remaining at any instant
# batt_inst_AH = (batt_inst_energy / batt_voltage)

# batt_inst_AH_array = np.zeros(simulation_hours)
# batt_inst_WH_array = np.zeros(simulation_hours)
# #DOD Array
# batt_DOD_array = np.zeros(simulation_hours)
# batt_SOH_array = np.zeros(simulation_hours)
# batt_DOD_interim = np.zeros(24)

# batt_DOD_daily_full = np.zeros(simulation_days)

# batt_DOD_daily_max = np.zeros(6) # averaging window of 6
# batt_DOD_daily_max.fill(batt_DOD)
# days_counter = 0
# # Surplus energy generated from solar
# energy_surplus = np.zeros(simulation_hours)
# #unmet energy for the load
# energy_unmet = np.zeros(simulation_hours)

# #Battery Energy Limit Reached - system off
# batt_fail_count = 0
# #charging current
# batt_current_flow = np.zeros(simulation_hours)
# batt_recharge_current = 0
# batt_discharge_value = 0
# #For Enhanced Branching
# batt_chargable = True
# batt_dischargable = True

# #energy Array
# batt_energy_no_temp = np.zeros(simulation_hours)
# for i in range(simulation_hours):
# #Charging Code    
#     if (batt_charging_flag_array[i]):
#         #batt_recharge_current = (batt_recharge_power[i] / CC_charging_voltage)
#         #check if next step shoots above SOC
#         if (batt_chargable and ((batt_inst_energy + batt_recharge_power[i]) < batt_total_WH)):            
#             batt_inst_energy += batt_recharge_power[i]
#             batt_chargable = True#Possible to recharge in the next cycle too
#             batt_dischargable = True
#             energy_surplus[i]= 0 #Extra Energy Wasted or which can be given back to grid
#             print("Charging in progress .. " + str(batt_inst_energy))
            
#         if (batt_chargable and ((batt_inst_energy + batt_recharge_power[i]) == batt_total_WH)):            
#             batt_inst_energy += batt_recharge_power[i]
#             batt_chargable = False#No Need to charge- Fully Charged
#             batt_dischargable = True
#             energy_surplus[i] = 0 #Extra Energy Wasted or which can be given back to grid
#             print("Battery Floating ..1 " + str(batt_inst_energy))            
            
#         if (batt_chargable and ((batt_inst_energy + batt_recharge_power[i]) > batt_total_WH)):            
#             batt_inst_energy = batt_total_WH
#             batt_chargable = False#Excess Energy
#             batt_dischargable = True
#             energy_surplus[i] = (batt_recharge_power[i] - batt_total_WH) #Extra Energy Wasted or which can be given back to grid
#             print("Battery Floating .. 2 " + str(batt_inst_energy))
            
#         if (not batt_chargable):            
#             batt_inst_energy = batt_total_WH
#             batt_chargable = False#Excess Energy
#             batt_dischargable = True
#             energy_surplus[i] = batt_recharge_power[i] #Extra Energy Wasted or which can be given back to grid
#             print("Battery Floating .. 3 " + str(batt_inst_energy))            
                    
#         #do program for limiting current for c10
#         batt_DOD = 1 - (batt_inst_energy / (batt_inst_SOH * batt_total_WH))
#         batt_DOD_array[i] = batt_DOD
#         #Battery AH Loading  
#         batt_inst_WH_array[i] = batt_inst_energy
        
#         #Discharge - discharge limit (DOD = user input)     
#     if (not batt_charging_flag_array[i]):
#         batt_discharge_value = 1 - ((batt_inst_energy - batt_temp_adjustment(batt_POWER_OUTPUT[i],modified_temperature_data[i],batt_total_WH)) / (batt_inst_SOH * batt_total_WH))
        
#         #check if next step shoots above SOC
#         if (batt_dischargable and (batt_discharge_value < batt_MAX_DOD)):            
#             batt_inst_energy -= batt_POWER_OUTPUT[i]  # instantaneus AH - peukert-AH
#             batt_energy_no_temp[i] = batt_inst_energy
#             #temperature Compensation
#             batt_inst_energy = batt_temp_adjustment(batt_inst_energy,modified_temperature_data[i],batt_total_WH)
            
#             batt_chargable = True#Possible to recharge in the next cycle
#             batt_dischargable = True
#             energy_unmet[i] = 0 #Extra Energy Wasted or which can be given back to grid
#             print("Discharging in progress .. " + str(batt_inst_energy))
            
#         if (batt_dischargable and (batt_discharge_value == batt_MAX_DOD)):            
#             batt_inst_energy -= batt_POWER_OUTPUT[i]  # instantaneus AH - peukert-AH
#             batt_energy_no_temp[i] = batt_inst_energy
#             #temperature Compensation
#             batt_inst_energy = batt_temp_adjustment(batt_inst_energy,modified_temperature_data[i],batt_total_WH)
#             batt_chargable = True #Possible to recharge in the next cycle
#             batt_dischargable = False
#             energy_unmet[i] = 0 #Extra Energy Wasted or which can be given back to grid
#             print("Battery Discharge Limit Reached.. " + str(batt_inst_energy))
            
#         if (batt_dischargable and (batt_discharge_value > batt_MAX_DOD)):            
#             batt_inst_energy = (1- batt_MAX_DOD) * batt_total_WH
#             batt_energy_no_temp[i] = batt_inst_energy
#             batt_chargable = True  #Possible to recharge in the next cycle
#             batt_dischargable = False
#             energy_unmet[i] = ((batt_discharge_value - batt_MAX_DOD) * batt_total_WH) #Extra Energy Wasted or which can be given back to grid
#             batt_fail_count += 1
#             print("Battery Discharge Limit Reached.. " + str(batt_inst_energy))
            
#         if (not batt_dischargable):            
#             batt_inst_energy = (1- batt_MAX_DOD) * batt_total_WH
#             batt_energy_no_temp[i] = batt_inst_energy
#             batt_chargable = True #Possible to recharge in the next cycle
#             batt_dischargable = False
#             energy_unmet[i] = (inverter_DC_IN_CURRENT[i] * system_voltage) #Extra Energy Wasted or which can be given back to grid
#             batt_fail_count += 1
#             print("Battery Discharge Limit Reached.. " + str(batt_inst_energy))            
                    
#         #do program for limiting current for c10
#         batt_DOD = 1 - (batt_inst_energy / (batt_inst_SOH * batt_total_WH))
#         batt_DOD_array[i] = batt_DOD
#         #Battery AH Loading  
#         batt_inst_WH_array[i] = batt_inst_energy

# #DOD Profile
# plt.plot(batt_DOD_array, color="red",label='DOD battery',linewidth=0.5)
# plt.plot(batt_charging_flag_array, color="blue",label='Charge Flag',alpha=0.2)
# plt.xlabel('Hours')
# plt.ylabel('DOD of Battery')
# plt.legend()
# plt.show()


# # #Energy Profile
# # plt.plot(batt_energy_no_temp, color="red",label='No temperature Compensation',linewidth=0.5)
# # plt.plot(batt_inst_WH_array, color="blue",label='Compensated Energy',alpha=0.2)
# # plt.xlabel('Hours')
# # plt.ylabel('Power')
# # plt.legend()
# # plt.show()


# # print(batt_DOD_interim)
# # print(np.amax(batt_DOD_interim))
# # print(batt_DOD_daily_max)
# # print("------------DOD ARRAY------------------")
# # print(batt_DOD_array)

# #SOC of the battery at 12 AM STARTING POINT


# #Assume battery is fully charged and SOH = 100%


# #ENERGY SURPLUS AND UNMET
# plt.plot(energy_surplus, color="blue",label='Surplus Energy',alpha=0.5)
# plt.plot(energy_unmet, color="red",label='Energy Unmet',alpha=0.5)
# plt.xlabel('Hours')
# plt.ylabel('Energy')
# plt.legend()
# plt.show()

# #fail counts
# print("\nBattery Design - DOD Failure " + str(batt_fail_count) + " hours\n")
# #Surplus Energy
# print("\nSurplus Energy " + str(np.sum(energy_surplus)) + " Wh of Energy\n")
# #Unmet Energy
# print("\nUnmet Energy " + str(np.sum(energy_unmet)) + " Wh of Energy\n")

# print("\nTotal Demand Energy " + str(np.sum(generated_load_profile)) + " Wh of Energy\n")

# #unmet Energy Percentage
# print("\nUnmet Energy Percentage " + str(np.sum(energy_unmet)/np.sum(generated_load_profile)) + " %\n")

# #Surplus Energy Percentage
# print("\nSurplus Energy Percentage " + str(np.sum(energy_surplus)/np.sum(generated_load_profile)) + " %\n")

# #tariff Charges
# tariff_buy_till_100 = 3.30 #rs/unit
# tariff_buy_till_300 = 7.30 #rs/unit
# tariff_buy_till_500 = 9.90 #rs/unit
# tariff_buy_from_501 = 11.5 #rs/unit
# tariff_sell = 5 #rs/unit


# #Total Amount Saved
# #units of energy effectively used
# energy_effective_saved_avg_per_month = (np.sum(generated_load_profile) - np.sum(energy_unmet)) / (12 * 1000) # kWh or units
# #print(energy_effective_saved_avg_per_month)
# #Units of energy exportable for Grid-Tied Net Metering System
# energy_exportable = np.sum(energy_surplus) / 1000 # kWh or units

# #Total Amount saved yearly
# if(energy_effective_saved_avg_per_month <=100):
#     amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_100 * 12
# elif(energy_effective_saved_avg_per_month > 100 and energy_effective_saved_avg_per_month <=300):
#     amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_300 * 12
# elif(energy_effective_saved_avg_per_month > 300 and energy_effective_saved_avg_per_month <=500):
#     amount_saved = energy_effective_saved_avg_per_month * tariff_buy_till_500 * 12
# elif(energy_effective_saved_avg_per_month > 500):
#     amount_saved = energy_effective_saved_avg_per_month * tariff_buy_from_501 * 12
    
# #Amount Saved
# print("\nAmount Saved Rs. " + str(amount_saved) + " /- per year\n")

# #Net Metering - if grid-tied
# amount_generated = energy_exportable * tariff_sell
# print("\nAmount Generated by exporting - (Only for Net Metering Grid Tied system) Rs. " + str(amount_generated) + " /- per year\n")


# #investment Amount
# solar_panel_price_individual = 10440 # rs. per piece
# charge_controller_price_individual = 8900 
# inverter_price_individual = 10000
# battery_price_individual = 11900

# invest_solar_panels = solar_panel_price_individual * solar_series *  solar_parallel
# invest_battery = battery_price_individual * batt_in_parallel * batt_in_series
# invest_charge_controller = charge_controller_price_individual
# invest_inverter = inverter_price_individual

# component_investment = invest_solar_panels + invest_battery + invest_charge_controller + invest_inverter

# total_investment = component_investment + (component_investment * 0.02)
# print("\nTotal Investment Rs. " + str(total_investment) + " /- \n")
# print('\n------------------------ NOT ACCOUNTING FOR RECURRING AMOUNT -----------------------\n')

# payback_period = total_investment / amount_saved
# payback_period_netmetered = total_investment / (amount_saved + amount_generated)
# print("\nPayback Period " + str(payback_period) + " years\n")
# print("\nPayback Period with Net Metering " + str(payback_period_netmetered) + " years\n")



print("------------------------END OF THE PROGRAM--------------------")