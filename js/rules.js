//function to set the rule "between"
function myChangeInputText(mySelect){
	html="";
	/*change the text boxes on the page: if we choose the range "between" this function show two text boxes;
	if we choose the ather ranges this function show only one text box */
	if (jQuery('#rules_operators_list').val()=="between-min-max"){
		html = "<input type='text' id='rules_threshold_text_min'>";	
		html += "<input type='text' id='rules_threshold_text_max'>";		
		}
	else{
		html = "<input type='text' id='rules_threshold_text'>";	
		}		
	jQuery('#rules_threshold').html(html);
}

//refresh of the GUI of rules_page. This function is used to manage the delete of a row and the pause of a row
function refreshRules(){
	//because i'm doing refresh, delete previous data with jQuery.remove
	$('#table_rules tbody tr').remove();
	//add rules in the table
	if(rules.length != 0){
		for(i in rules){

			//code to find the sensor description of inserted rule
			var sensor_description = "";
			for(var k in sensors){
				if(sensors[k].id == rules[i].sensor)
					sensor_description = sensors[k].description;
			}

			var actuator_description = "";
			for(var h in actuators){
				if(rules[i].actuator == actuators[h].id)
					actuator_description = actuators[h].description;
			}

			if(sensor_description!="" && actuator_description!=""){
				var row = "";
				row += "<tr><td>" + sensor_description + "</td>";
				row += "<td>" + rules[i].operator + "</td>";
				row += "<td>" + rules[i].threshold + "</td>";
				row += "<td>" + actuator_description + "</td>";
				row += "<td>" + rules[i].action + "</td>";
				row += "<td> <img id='"+rules[i].id+"' src='./assets/images/cancel.png'/></td>";
				
				//pause==1 means that the rule is active (the value of pause is written in the json object "rules[]")
				//pause==0 means that the rule is not active 
				if(rules[i].pause=="1")
				row += "<td> <input type='image' id='pause_"+rules[i].id+"' src='./assets/images/pause.png' onclick='pause_rule(this.id)'/></td></tr>";
				else{
				row += "<td> <input type='image' id='pause_"+rules[i].id+"' src='./assets/images/play.png' onclick='pause_rule(this.id)'/></td></tr>";
				}
				//table_rules is the id of table. With Jquery we append the rules
				$('#table_rules').append(row);

				//cancel row button
				$('#'+rules[i].id).live( 'click',function(event,data){
					delete_rule(this.id);
				});
			}

		}
	}
	else{
		var html = "<tr><td>add sensor...</td><td>add rule...</td><td>add value...</td><td>add actuator...</td><td>add rule...</td><td>delete row...</td><td>pause rule...</td></tr>";
		$('#table_rules').append(html);
	}
}

/*function called when the user click on pause button. It change the value of field "pause" on the relative json object, save the value on the file 
  rules.txt and refresh the row showed on UI*/
function pause_rule(id_rule){
	id_rule_splitted=id_rule.split("pause_");
	var index = -1;
	for(var i=0; i<rules.length; i++){
		if(rules[i].id == id_rule_splitted[1]){
			//index = i;
			if(rules[i].pause=="1"){
			rules[i].pause="0";
			jQuery('#'+id_rule).attr('src','./assets/images/play.png');
			}
			else{
				rules[i].pause="1";
			jQuery('#'+id_rule).attr('src','./assets/images/pause.png');

			}
			save__to_file(rules,rules_file);
			break;
		}
	}
}

//function called when the user click on the delete button. It delete the row on UI, on the relative json object and on the file
function delete_rule(id_rule){
	var index = -1;
	for(var i=0; i<rules.length; i++){
		if(rules[i].id == id_rule){
			index = i;
			break;
		}
	}
	if(index != -1){
		rules.splice(index,1);
		save__to_file(rules,rules_file);
		refreshRules();
	}
}



// function that fill the UI of HTML page. it add form to set rules
function initRulesUI(){
	try {
		//prepare HTML string
		var html = "";
		html += " <select id='rules_sensors_list'>";
		html += '<option>Sensor</option>';
		//for each sensor create a row
		for (var i in sensors) {
			var descr = sensors[i].api.slice(sensors[i].api.lastIndexOf(".")+1) + "-" + sensors[i].description;
		 	html += '<option value="'+i+'">'+descr+'</option>';
		}			 		
		html += "</select>";
		//set the id => #rules_sensors with the HTML prepared
		jQuery('#rules_sensors').html(html);

		html = "<select onchange='myChangeInputText(this)' id='rules_operators_list'>";
		html += "<option value='greater-than'>&gt</option>";
		html += "<option value='equals'>=</option>";
		html += "<option value='less-than'>&lt</option>";
		html += "<option value='between-min-max'>min&ltvalue&ltmax</option>";
		html += "</select>";
		jQuery('#rules_operators').html(html);			
		html = "<input type='text' id='rules_threshold_text'>";	
		jQuery('#rules_threshold').html(html);

		html = "";
		html += "<select id='rules_actuators_list'>";
		html += '<option>Actuator</option>';
		for (var i in actuators) {
			var descr = actuators[i].api.slice(actuators[i].api.lastIndexOf(".")+1) + "-" + actuators[i].description;
		 	html += '<option value="'+i+'">'+descr+'</option>';
		}			 		
		html += "</select>";
		jQuery('#rules_actuators').html(html);

		html = "<input type='text' id='rules_action_text'>";
		jQuery('#rules_action').html(html);
		//button to add rules
		html = "<button id='rules_button_save'>Add rule</button>";
		jQuery('#rules_button').html(html);

		
	} catch (e) {
		console.error(e);
	}
}

//performed when the user click on ADD RULES button
jQuery('#rules_button_save').live( 'click',function(event,data){

	var threshold_value;
	if (jQuery('#rules_operators_list').val()=="between-min-max"){
		threshold_value=jQuery('#rules_threshold_text_min').val()+"<...<"+jQuery('#rules_threshold_text_max').val(); 
	}
	else{		
		threshold_value=jQuery('#rules_threshold_text').val();
	}

	if(jQuery('#rules_sensors_list').val()!="Sensor" && jQuery('#rules_actuators_list').val()!="Actuator" && jQuery('#rules_action_text').val()!="" && threshold_value!=""){
		rules.push({id:new Date().getTime(),
					sensor:jQuery('#rules_sensors_list').val(), 
					operator:jQuery('#rules_operators_list').val(), 
					threshold:threshold_value, 
					actuator:jQuery('#rules_actuators_list').val(), 
					action:jQuery('#rules_action_text').val(),
					pause:"1"
				}
		);
		refreshRules();
		initRulesUI();
		save__to_file(rules,rules_file);
	}else{
		alert("Error! Insert all elements!");
	}
});
