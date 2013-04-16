var icons = {
			"http://webinos.org/api/sensors.temperature": "temperature-icon.png",
			"http://webinos.org/api/sensors.humidity": "humidity-icon.png",
			"http://webinos.org/api/sensors.light": "light-icon.png",
			"http://webinos.org/api/sensors.voltage": "voltage-icon.png",
			"http://webinos.org/api/sensors.electricity":"electricity-icon.png",
			"http://webinos.org/api/actuators.switch": "switch-icon.png",
			"http://webinos.org/api/sensors.proximity": "no-image-copy.png",
			"http://webinos.org/api/actuators.linearmotor": "no-image-copy.png",
			"http://webinos.org/api/sensors.heartratemonitor": "no-image-copy.png"
	};

//sensors added to room 
var sensors_of_room = new Array();
//sensors associated to other rooms that we don't show in the current room config page
var sensors_to_hide = new Array();
 //actuators added to room 
var actuators_of_room = new Array();
//actuators associated to other rooms that we don't show in the current room config page
var actuators_to_hide = new Array();

//room name in which you click
var room = "";


/************************************************     LOAD CONFIGURATION   ***************************************/

//get list of sensors that aren't in any rooms
function load_GUI_room_config(){

	/*** remove gui elements and support array ***/
	//remove all elements from sensor selected (room_config page)
	var list_sensor = document.getElementById('sensor_selected');
	list_sensor.innerHTML = "";
	sensors_of_room=new Array();
	sensors_to_hide=new Array();

	//remove all elements from list of actuator selected (room_config page)
	var list_actuator = document.getElementById('actuator_selected');
	list_actuator.innerHTML = "";
	actuators_of_room=new Array();
	actuators_to_hide=new Array();


	//sensors
	if(json_room_config.length!=0){
		for(t=0; t<json_room_config.sensors_in_rooms.length; t++){
			var id_sensors = json_room_config.sensors_in_rooms[t].list_of_sensor_ID;
			for (m=0; m<id_sensors.length; m++){
				if(json_room_config.sensors_in_rooms[t].room_name==room){
					sensors_to_hide.push(id_sensors[m]);
					if(typeof(sensors[id_sensors[m]])!=="undefined")
						refresh_HTML_add_sensor(sensors[id_sensors[m]]);
				}
				else{
					sensors_to_hide.push(id_sensors[m]);
				}
			}
		}
	}
	
	//actuators
	if(json_room_config.length!=0){
		for(g=0; g<json_room_config.actuators_in_rooms.length; g++){
			var id_actuators = json_room_config.actuators_in_rooms[g].list_of_actuator_ID;
			for (m=0; m<id_actuators.length; m++){
				if(json_room_config.actuators_in_rooms[g].room_name==room){
					//insert ID of Actuator assigned to a one room.
					actuators_to_hide.push(id_actuators[m]);
					//refresh
					if(typeof(actuators[id_actuators[m]])!=="undefined")
						refresh_HTML_add_actuator(actuators[id_actuators[m]]);
				}
				else{
					//insert ID of Actuator assigned to a one room.
					actuators_to_hide.push(id_actuators[m]);
				}
			}
		}
	}

	show_options();
}

//build the option value of select
function show_options(){

	lista = document.getElementById("sensor_list");
	lista.innerHTML = "";
	//sensors in option - select
	for (var f in sensors){
		var is_to_hide = false;
		for(w=0; w<sensors_to_hide.length; w++){
			if(sensors_to_hide[w]==f){
				is_to_hide = true;
			}
		}
		if(is_to_hide==false){
			lista.innerHTML = lista.innerHTML + "<option value='"+sensors[f].id+"'>"+sensors[f].description+"</option>";
		}
	}

	list = document.getElementById("actuator_list");
	list.innerHTML = "";
	//actuators in option - select
	for (var f in actuators){
		var is_to_hide = false;
		for(w=0; w<actuators_to_hide.length; w++){
			if(actuators_to_hide[w]==f){
				is_to_hide = true;
			}
		}
		if(is_to_hide==false){
		    list.innerHTML = list.innerHTML + "<option value='"+actuators[f].id+"'>"+actuators[f].description+"</option>";
		}
	}

	//hide "loader" gif in room_config page
	$('.box').hide();

}

//called when room_config.txt is empty. It show directly all the sensors and actuators 
function load_GUI_all_sensors_actuators(){
	lista = document.getElementById("sensor_list");
	lista.innerHTML = "";	
	for(var z in sensors){
		lista.innerHTML = lista.innerHTML + "<option value='"+sensors[z].id+"'>"+sensors[z].description+"</option>";
	}

	list = document.getElementById("actuator_list");
	list.innerHTML = "";
	for(var z in actuators){
		list.innerHTML = list.innerHTML + "<option value='"+actuators[z].id+"'>"+actuators[z].description+"</option>";
	}

	//hide "loader" gif in room_config page
	$('.box').hide();
}


/************************************************     SAVE CONFIGURATION   ***************************************/

function save_config_for_room(){
	//Json OBJECT description
	//sensors_in_rooms: [object1, object2,...]
		//room_name: "cucina"
		//list_of_sensor_ID: ["001","002","003",...]

	//actuators_in_rooms: [object1, object2,...]
		//room_name: "cucina"
		//list_of_actuator_ID: ["001","002","003",...]


	//for sensors
	var dictionary_room = new Object();
	dictionary_room.room_name = room;
	dictionary_room.list_of_sensor_ID = sensors_of_room;


	var list_object_sensor = [];
	if(json_room_config.length!=0){
		for(k=0; k<json_room_config.sensors_in_rooms.length; k++){
			if(json_room_config.sensors_in_rooms[k].room_name!=room){
				list_object_sensor.push(json_room_config.sensors_in_rooms[k]);
			}
		}
	}
	list_object_sensor.push(dictionary_room);


	//for actuators
	var dictionary_room_act = new Object();
	dictionary_room_act.room_name = room;
	dictionary_room_act.list_of_actuator_ID = actuators_of_room;

	var list_object_actuator = [];
	if(json_room_config.length!=0){
		for(c=0; c<json_room_config.actuators_in_rooms.length; c++){
			if(json_room_config.actuators_in_rooms[c].room_name!=room){
				list_object_actuator.push(json_room_config.actuators_in_rooms[c]);
			}
		}
	}
	list_object_actuator.push(dictionary_room_act);

	var room_config = new Object();
	room_config.sensors_in_rooms = list_object_sensor;
	room_config.actuators_in_rooms = list_object_actuator;
	

	save__to_file(room_config,room_config_file);
}



/************************************************     SENSOR MANAGEMENT   ***************************************/

//function called when the user click on the "add sensor" button
function button_add_sensor(){
	var selected_value = document.getElementById('sensor_list').value;
	//refresh_GUI
	refresh_HTML_add_sensor(sensors[selected_value]);

	//save on "room_config.txt" file
	save_config_for_room();

}

//function that build the graphics part of sensor added (the violet background)
function refresh_HTML_add_sensor(sensor){

		//add sensor in list
		sensors_of_room.push(sensor.id);

		var html="";
		html="<div id='div_"+sensor.id+"'>";
		html+="<div id='content_one_row'>";
		html+="<div id='content_delete_id'>";
		html+="<input type='image' src='assets/images/cancel.png' alt='' id='delete_"+sensor.id+"' onclick='delete_sensor(this.id)' />";
		html+="</div>";
		html+="<div id='link_"+sensor.id+"' onClick='sensor_call_page(this.id)' >";
		html+="<div id='config_single_raw'>";
		html+="<img src='assets/images/sensors_actuators/"+icons[sensor.api]+"' id='image_act_sens' />";
		html+="<div id='text_title'><b>"+ sensor.displayName +"</b></div><br><div id='text_description'>"+sensor.description +"</div>";
		html+="</div>";
		html+="</div>";
		html+="</div>";
		html+="</div>";


		var list_sensor = document.getElementById('sensor_selected');
		list_sensor.innerHTML = list_sensor.innerHTML + html;

		//remove from options in "select" (HTML)
		var is_in_sensors_to_hide = false;
		for(q=0; q<sensors_to_hide.length; q++){
			if (sensor.id==sensors_to_hide[q]) {
		    	is_in_sensors_to_hide = true;
		    }
		}
		if(is_in_sensors_to_hide==false){
			sensors_to_hide.push(sensor.id);
			show_options();
		}
	
}

//function called when the user click on the delete button of the sensor
function delete_sensor(clicked_id){

	var id_sensor = "";
	var index = 0;
	var div_sensor = "";
	var conf=true;

	for(q=0; q<sensors_of_room.length; q++){
		if (clicked_id == "delete_"+sensors_of_room[q]) {
	    	div_sensor = "div_" +sensors_of_room[q];
	    	index = q;
	    	id_sensor = sensors_of_room[q];
	    }
	}

	//remove from array
	sensors_of_room.splice(index,1);

	//update DOM
	var childnode = document.getElementById(div_sensor);
    var removednode = document.getElementById("sensor_selected").removeChild(childnode);

    //add elements in select - options
   for(q=0; q<sensors_to_hide.length; q++){
		if (clicked_id == "delete_"+sensors_to_hide[q]) {
	    	index = q;
	    }
	}
	sensors_to_hide.splice(index,1);
	show_options();

	//save on "room_config.txt" file
	save_config_for_room();
}


function sensor_call_page(sensor_id){
	//sensor_id.substring(5) is used to remove "link_"
	sensor_id_selected = sensor_id.substring(5);
	selectPage("#wrapper_sensorstate","#wrapper_actuator","#wrapper_homepage","#wrapper_settingpage","#wrapper_configuration");	
}


/************************************************     ACTUATOR MANAGEMENT   ***************************************/

//function called when the user click on the "add actuator" button
function button_add_actuator(){
	var selected_value = document.getElementById('actuator_list').value;

	//refresh_GUI
	refresh_HTML_add_actuator(actuators[selected_value]);

	//save on "room_config.txt" file
	save_config_for_room();

}

//function that build the graphics part of actuator added (the violet background)
function refresh_HTML_add_actuator(actuator){


		//add sensor in list
		actuators_of_room.push(actuator.id);

		var html="";
		html="<div id='div_act_"+actuator.id+"'>";
		html+="<div id='content_one_row'>";
		html+="<div id='content_delete_id'>";
		html+="<input type='image' src='assets/images/cancel.png' alt='' id='delete_"+actuator.id+"' onclick='delete_actuator(this.id)' />";
		html+="</div>";
		html+="<div id='link_"+actuator.id+"' onClick='actuator_call_page(this.id)' >";
		html+="<div id='config_single_raw'>";
		html+="<img src='assets/images/sensors_actuators/"+icons[actuator.api]+"' id='image_act_sens' />";
		html+="<div id='text_title'><b>"+ actuator.displayName +"</b></div><br><div id='text_description'>"+actuator.description +"</div>";
		html+="</div>";
		html+="</div>";
		html+="</div>";
		html+="</div>";

		var list_actuator = document.getElementById('actuator_selected');

		list_actuator.innerHTML = list_actuator.innerHTML + html;

		//remove from options in "select" (HTML)
		var is_in_actuators_to_hide = false;
		for(q=0; q<actuators_to_hide.length; q++){
			if (actuator.id==actuators_to_hide[q]) {
		    	is_in_actuators_to_hide = true;
		    }
		}
		if(is_in_actuators_to_hide==false){
			actuators_to_hide.push(actuator.id);
			show_options();
		}
	

}

//function called when the user click on the delete button of the actuator
function delete_actuator(clicked_id){

	var index = 0;
	var div_actuator = "";
	var conf=true;

	for(u=0; u<actuators_of_room.length; u++){
		if (clicked_id == "delete_"+actuators_of_room[u]) {
	    	div_actuator = "div_act_" +actuators_of_room[u];
	    	index = u;
	    }
	}

	//remove from array
	actuators_of_room.splice(index,1);

	//update DOM
	var childnode = document.getElementById(div_actuator);
    var removednode = document.getElementById("actuator_selected").removeChild(childnode);

    //add elements in select - options
   	for(q=0; q<actuators_to_hide.length; q++){
		if (clicked_id == "delete_"+actuators_to_hide[q]) {
	    	index = q;
	    }
	}
	actuators_to_hide.splice(index,1);
	show_options();

	//save on "room_config.txt" file
	save_config_for_room();

}

function actuator_call_page(actuator_id){
	//actuator_id.substring(5) is used to remove "link_"
	actuator_id_selected = actuator_id.substring(5);
	refresh_actuator_GUI();
	selectPage("#wrapper_actuator","#wrapper_homepage","#wrapper_settingpage","#wrapper_sensorstate","#wrapper_configuration");	
}
