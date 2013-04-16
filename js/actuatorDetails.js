// actuator name in which you click
var actuator_id_selected = "";

//build GUI of actuator
function refresh_actuator_GUI(){
	var actuator = actuators[actuator_id_selected];

	var html_str = "Choose value to set: ";

	html = document.getElementById("actuator_range");
	html.innerHTML = "";

	if(actuator.range!=null){
		var min = actuator.range[0][0];
		var max = actuator.range[0][1];
		if(max-min < 10){
			html_str += "<select id='actuator_value'>";
			//html_str += '<option>-- select --</option>';
			for (var i=min; i<=max; i++) {
	 			html_str += '<option value="'+i+'">'+i+'</option>';
	 		}			 		
	 		html_str += "</select>";
		}
		else{
			html_str += "<input type='number' id='actuator_value'/>";
		}
	}
	else {
		html_str += "<input type='number' id='actuator_value'/>";
	}

	html.innerHTML = html_str;
}

//send configuration to actuator
function save_actuator_config(){
	var actuator = actuators[actuator_id_selected];
	var val = jQuery("#actuator_value").val();
	var val_array=new Array(); 
	val_array[0]=parseFloat(val);

	try{
		actuator.setValue(val_array,
			function(actuatorEvent){
				alert("Actuator set to value " + val);
			},
			function(actuatorError){
				//alert(JSON.stringify(actuatorError));
			}
		);
	}
	catch(err){
		console.log("Not a valid webinos actuator: " + err.message);
	}
}

