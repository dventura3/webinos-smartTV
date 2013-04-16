//suffix for files name (es: data_PZPname_PZHname.txt)
var suffix = "";

//file name;
var data_file = "";
var rules_file = "";
var room_config_file = "";


/* Function associated to refresh buttons (in rules page and room_config page). It does: discovery of actuators and sensors */
function refreshDiscovery(){

	//show "load" gif in room_config page
	$('.box').fadeIn('slow');


	//discovery for sensors
	for ( var i in sensor_types) {
			var type = sensor_types[i];
			webinos.discovery.findServices(new ServiceType(type), {
				onFound: function (service) {
					console.log("Service "+service.serviceAddress+" found ("+service.api+")");

					if(service.serviceAddress.split("/")[0]==pzh_selected || pzh_selected==""){
						//flag used to avoid to change sensors state
						var flag=false;
						for(var j in sensors){
							if((service.id)==sensors[j].id){
								flag=true;
								break;
							}	 
						}

						//put it inside sensors[]
						sensors[service.id] = service;
						service.bind({
							onBind:function(){
			        			console.log("Service "+service.api+" bound");
			        			console.log(service);
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
			                            		console.log("New Event");
			                            		console.log(event);
			                            		onSensorEvent(event);
			                        		},
			                    			false
			                    		);

			                			if(flag==false){
					                		//event listener is active (value=1)						
											sensorEventListener_state.push({
											    key:   service.id,
											    value: 1
											});
										}
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

		//load rules GUI
		setTimeout(initRulesUI,1000);
		setTimeout(refreshRules,1000);

  		/** load file and GUI of room_config **/
  		load_data_from_file(room_config_file);

}

//function to save some data in a file
function save__to_file(data, file_name){
	root_directory.getFile(file_name, {create: true, exclusive: false}, 
		function (entry) {
			entry.createWriter(
				function (writer) {
					var written = false;
					writer.onerror = function (evt) {
						alert("Error writing file (#" + evt.target.error.name + ")");
					}

					writer.onwrite = function (evt) {
						if (!written) {
							written = true;
							writer.write(new Blob([JSON.stringify(data)]));
						} else
							;
					}
					writer.truncate(0);
				}, 
				function (error){
					alert("Error retrieving file writer (#" + error.name + ")");
				}
			);
		},
		function (error) {
			alert(error.message);
		}
	);
	
}


//function to load a file and save the data loaded in a json object
function load_data_from_file(file_name){
	if(!file_name)
		file_name = rules_file;

	root_directory.getFile(file_name, {create: false, exclusive: false}, 
		function (entry) {
			var reader = new window.FileReader();
			reader.onerror = function (evt) {
				alert("Error reading file (#" + evt.target.error.name + ")");
			}

			reader.onload = function (evt) {
				try{
					
					// For RULES.HTML PAGE:
					if(file_name==rules_file){
						rules = JSON.parse(evt.target.result);
						refreshRules();
					}

					// For INDEX.HTML PAGE:
					if(file_name==data_file){

						jsonOBJ = JSON.parse(evt.target.result);
						if(typeof(jsonOBJ.image)!=="undefined"){
							$('#myImgId').attr('src', '');
							var myImage = new Image();
				            myImage.src = jsonOBJ.image;  
				            myImage.onload = function(){
				                /** code to position the image loaded on the home page in central position **/
				                var screen_70 = (screen.width*70)/100;
				                var image_position = (screen_70 - myImage.width)/2;
				                var imap_new = document.getElementById("imageMAP");
				                imap_new.style.marginLeft = image_position+"px";

				                $('#myImgId').attr('src', jsonOBJ.image);
				                file_name_image = jsonOBJ.image;
				              }
				          }
				          else {
				          	var myImageDefault = new Image();
						        myImageDefault.src = "./assets/images/upload.jpg"; 
						        myImageDefault.onload = function(){
						            /** posizione centrale **/
						            var screen_70 = (screen.width*70)/100;
						            var image_position_default = (screen_70 - myImageDefault.width)/2;
						            var imap_new_default = document.getElementById("imageMAP");
						            imap_new_default.style.marginLeft = image_position_default+"px";
									$('#myImgId').attr('src', './assets/images/upload.jpg');
								}
				          }
						
						if(jsonOBJ.elements.length!=0){
							load_GUI();
						}
					}

					// For ROOM_CONFIG.HTML PAGE:
					if(file_name==room_config_file){
						if(evt.target.result!=""){
							json_room_config = JSON.parse(evt.target.result);
							//load from file
							setTimeout(load_GUI_room_config,2000);
						}else{
							setTimeout(load_GUI_all_sensors_actuators,2000);
						}
					}
				}
				catch(err){
					alert(err.message);
				}
			}

			entry.file(function (file) {
				reader.readAsText(file);
			}, function (error) {
				alert("Error retrieving file (#" + error.name + ")");
			});
		},
		function (error) {
			//if the file data.txt doesn't exist load the default upload image and center it
			if(file_name==data_file){
				var myImageDefault = new Image();
		        myImageDefault.src = "./assets/images/upload.jpg"; 
		        myImageDefault.onload = function(){
		            /** central position **/
		            var screen_70 = (screen.width*70)/100;
		            var image_position_default = (screen_70 - myImageDefault.width)/2;
		            var imap_new_default = document.getElementById("imageMAP");
		            imap_new_default.style.marginLeft = image_position_default+"px";
					$('#myImgId').attr('src', './assets/images/upload.jpg');
				}
			}
			if(file_name==room_config_file){
				setTimeout(load_GUI_all_sensors_actuators,2000);
			}
		}
	);
}

//function to show the selected page and hide others 
function selectPage(show_page,hide1,hide2,hide3,hide4){
	jQuery(show_page).show();
	jQuery(hide1).hide();
	jQuery(hide2).hide();
	jQuery(hide3).hide();
	jQuery(hide4).hide();
}