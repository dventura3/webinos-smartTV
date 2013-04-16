//PZH selected from user
var pzh_selected = "";

//PZP selected from user
var pzp_selected = "";

//local PZP in which execute web app
var local_pzp =  "";

function init_popup(){
	//event to show pzh list to select
    $('.overlay_popup').fadeIn('fast');
    $('#box_popup').fadeIn('slow');

}

function insertPZH(){
	html="";
	for(var i=0; i<pzh_list.length; i++){
		html+="<tr><td><input type='radio' name='choose' value='"+pzh_list[i]+"' id='"+pzh_list[i]+"'/> "+pzh_list[i]+"</td></tr>";
	}
	jQuery(".testo-box tbody").append(html);
}


function chooseFileSystem (){
	
	//get radio_button selected
	pzh_selected = jQuery("input[type='radio']:checked").val();

	if(typeof(pzh_selected)!=="undefined"){
	
		//remove contents of Table's rows
		jQuery(".testo-box tbody").empty();

		//remove next button
		jQuery("#next").remove();

		//change title
		jQuery(".titolo_box").empty();
		jQuery(".titolo_box").append("Select PZP <br>in which save and load data");

		//show confirm button and hide next button in "home" page (when show popup)
		$('#confirm').show();
		$('#next').hide();

		//insert PZP list of PZH selected
		html="";
		var result; 
		for(var i=0; i<pzp_list.length; i++){
			if(pzp_list[i].split("/")[0]==pzh_selected){
				html+="<tr><td><input type='radio' name='choose' value='"+pzp_list[i]+"' id='"+pzp_list[i]+"'/> "+pzp_list[i]+"</td></tr>";
			}	
		}
		jQuery(".testo-box tbody").append(html);

	}else{
		alert("Error! Please select PZH.");
	}
}


function hidePopupAndStartDiscovery(){

	//get radio_button selected
	pzp_selected = jQuery("input[type='radio']:checked").val();

	if(typeof(pzp_selected)!=="undefined"){

		//event to hide "popup"  
	    $('.overlay_popup').fadeOut('fast');
		$('#box_popup').hide();

		discovery_all();	

	}else{
		alert("Error! Please select PZP.");
	}

}


function discovery_all(){

	//discovery sensors operation
	for ( var i in sensor_types) {
		var type = sensor_types[i];
		webinos.discovery.findServices(new ServiceType(type), {
			onFound: function (service) {
				console.log("Service "+service.serviceAddress+" found ("+service.api+")");
				if(service.serviceAddress.split("/")[0]==pzh_selected || pzh_selected==""){
					//put it inside sensors[]
					sensors[service.id] = service;
					service.bind({
						onBind:function(){
		        			console.log("Service "+service.api+" bound");
		        			console.log(service);
		        			//alert(service.api);
		        			service.configureSensor({timeout: 120, rate: 500, eventFireMode: "fixedinterval"}, 
		        				function(){
		        					var sensor = service;
		                			console.log('Sensor ' + service.api + ' configured');
		                			var params = {sid: sensor.id};
		            				var values = sensor.values;
		            				var value = (values && values[values.length-1].value)  || '&minus;';
		            				var unit = (values && values[values.length-1].unit)  || '';
		            				var time = (values && values[values.length-1].time)  || '';
		                			
		                			service.addEventListener('onEvent', 
		                    			function(event){
		                            		console.log(event);
		                            		onSensorEvent(event);
		                        		},
		                    			false
		                    		);

		                    		//event listener is active (value=1)						
									sensorEventListener_state.push({
									    key:   sensor.id,
									    value: 1
									});
								},
								function (){
									console.error('Error configuring Sensor ' + service.api);
								}
							);
		        		}
					});
				}
			}
		});
	}
	
	// discovering actuators
	for ( var i in actuator_types) {
		var type = actuator_types[i];
		webinos.discovery.findServices(new ServiceType(type), {
			onFound: function (service) {
				console.log("Service "+service.serviceAddress+" found ("+service.api+")");
				if(service.serviceAddress.split("/")[0]==pzh_selected || pzh_selected==""){
					//put it in actuators[]
					actuators[service.id] = service;
					service.bind({
						onBind:function(){
		        			console.log("Service "+service.api+" bound");
							var params = {aid: service.id};
		        		}
					});
				}
			}
		});
	}

	/*
	//get local pzp
	local_pzp = webinos.session.getPZPId();
	//alert("local_pzp: " + local_pzp);

	//create suffix for files name
	var local_pzp_tmp = local_pzp.split("/");
	if(local_pzp_tmp.length>1){
		suffix = "_" + local_pzp_tmp[1] + "_" + pzh_selected;
	}else{
		suffix = "_" + local_pzp_tmp[0];
	}
	alert(suffix);
	*/

	if(pzp_selected==""){
		//thes isn't PZH (but there is only local PZP)
		pzp_selected = webinos.session.getPZPId();
	}

	var local_pzp_tmp = pzp_selected.split("/");
	if(local_pzp_tmp.length>1){
		suffix = "_" + local_pzp_tmp[1] + "_" + pzh_selected;
	}else{
		suffix = "_" + local_pzp_tmp[0];
	}

	//create data name
	data_file = "data" + suffix + ".txt";
	rules_file = "rules" + suffix + ".txt";
	room_config_file = "room_config" + suffix + ".txt";


	//discovery for file API
	webinos.discovery.findServices(new ServiceType("http://webinos.org/api/file"), {
		onFound: function (service) {
			if(pzp_selected==service.serviceAddress){
			//if(local_pzp==service.serviceAddress){
				service.bindService({
					onBind: function () {
						service.requestFileSystem(1, 1024, 
							function (filesystem) {
								root_directory = filesystem.root;
								load_data_from_file(rules_file);
								load_data_from_file(data_file);
								load_data_from_file(room_config_file);
							},
							function (error) {
								alert("Error requesting filesystem (#" + error.code + ")");
							}
						);					
					}
				});
			}
		},
		onError: function (error) {
			alert("Error finding service: " + error.message + " (#" + error.code + ")");
		}
	});
	

	//load rules GUI
	setTimeout(initRulesUI,1000);

}


