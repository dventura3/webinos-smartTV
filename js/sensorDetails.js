// sensor name in which you click
var sensor_id_selected = "";


//function activated when the user click on stop button in sensor detail page. It stop the event listener
function stopSensorEvents(){
	for(var t in sensors){
		if(sensor_id_selected == t){
			for(k=0; k<sensorEventListener_state.length; k++){
				if(sensorEventListener_state[k].key==sensors[t].id){
					var state = sensorEventListener_state[k].value;
					//if event listener isn't active (state=0) --> active it
					if(state==1){
						sensors[t].removeEventListener('onEvent', 
							function(event){
					    		onSensorEvent(event);
							},
							false
						);
						sensorEventListener_state[k].value = 0;
					}
				}
			}
		}
	}
}



//function activated when the user click on start button in sensor detail page. It start the event listener
function startSensorEvents(){
	for(var t in sensors){
		if(sensor_id_selected == t){
			for(k=0; k<sensorEventListener_state.length; k++){
				if(sensorEventListener_state[k].key==sensors[t].id){
					var state = sensorEventListener_state[k].value;
					//if event listener isn't active (state=0) --> active it
					if(state==0){
						sensors[t].addEventListener('onEvent', 
							function(event){
					    		onSensorEvent(event);
							},
							false
						);
						sensorEventListener_state[k].value = 1;
					}
				}
			}
		}
	}
}