const hours_to_days = (hour) =>{
    var day_counter =0;
    for(i=1;i<=hour;i++){
      if(i % 24 == 0){
        day_counter++;
      }  
    }
  return day_counter;
}
const linear_regression = (x_data, y_data) =>{
    var x_sum =0;
    var y_sum =0;
    var x_sum_2 =0;
    var x_y_sum =0;
    var output = {};    
    var sample_size = x_data.tolist().length;    
    for(i=0;i<sample_size;i++){
      x_sum += x_data.get(i);
      x_sum_2 += x_data.get(i) * x_data.get(i);
      y_sum += y_data.get(i);
      x_y_sum +=  x_data.get(i) * y_data.get(i);
    }
    console.log("x_sum  " + x_sum);
    console.log("x_sum_2  " + x_sum_2);
    console.log("y_sum  " + y_sum); 
    console.log("x_y_sum  " + x_y_sum);
    output.intercept = ((y_sum*x_sum_2) - (x_sum * x_y_sum))/((sample_size*x_sum_2)- (x_sum * x_sum));
    output.slope = ((sample_size*x_y_sum)-(x_sum*y_sum))/((sample_size*x_sum_2)-(x_sum*x_sum));
    return output;
}

// All Exports
exports.hours_to_days = hours_to_days;
exports.linear_regression = linear_regression;

