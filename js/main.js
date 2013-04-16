/**
 * main.js
 */
 
//root directory of file
var root_directory;

//list of sensors discovered from webinos
var sensors = {};

//list of actuator discovered from webinos
var actuators = {};

//JSON object for:
var jsonOBJ = []; //data.txt
var json_room_config = []; //room_config.txt
var rules = []; //rules.txt

//array whose contain the state (active-non active) of every sensor. It contain the ID of sensor and the state
var sensorEventListener_state = [];

//pzh vector
var pzh_list = [];
var pzp_list = [];

// for chart
var sensor_chart;

var sensor_types = [
		"http://webinos.org/api/sensors.temperature",
		"http://webinos.org/api/sensors.humidity",
		"http://webinos.org/api/sensors.light",
		"http://webinos.org/api/sensors.voltage",
		"http://webinos.org/api/sensors.electricity",
		"http://webinos.org/api/sensors.proximity",
		"http://webinos.org/api/sensors.heartratemonitor"
		
	];
var actuator_types = [
	"http://webinos.org/api/actuators.switch",
	"http://webinos.org/api/actuators.linearmotor"
]



//function to get the sensor data
var onSensorEvent = function(event){
	var sensor = sensors && sensors[event.sensorId];
	if (sensor) {
		if (!sensor.values) {
			sensor.values = [];
		}
		var date = new Date(event.timestamp);
		var item = {
			value: event.sensorValues[0] || 0,
			timestamp: event.timestamp,
			unit: event.unit,
			time: Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.timestamp)
		};
		sensor.values.push(item);

		//software rules logic
		performRules(sensor);

		if (sensor_id_selected == sensor.id) {
			sensor_chart.setTitle({ text: sensor.displayName});
			if (sensor_chart && sensor_chart.series[0]) {
				var series = sensor_chart.get('values');
				series.addPoint({x: item.timestamp,y: item.value},true,series.data.length>10,true);
				jQuery("#value_sensor").html("Sensor value: " + item.value);
				//jQuery("#sensor-unit").html(item.unit);
			}
		}
		jQuery("#sensor-"+sensor.id).html(item.value+" "+item.unit);
		jQuery("#time-"+sensor.id).html(item.time);
	}
};


//it read from file the rule and apply it with the function activateActuator
function performRules(sensor){

	for(var i=0; i<rules.length;i++){

		if(rules[i].sensor==sensor.id){
		var actuator = actuators && actuators[rules[i].actuator];
		if (rules[i].pause=="1")
		{
			switch (rules[i].operator){
				case "equals":
				if (sensor.values[sensor.values.length-1].value==rules[i].threshold){
					activateActuator(actuator,rules[i].action);
				}
				break;
				case "less-than":
				if (sensor.values[sensor.values.length-1].value<rules[i].threshold){
					activateActuator(actuator,rules[i].action);
				}
				break;
				case "greater-than":
				if (sensor.values[sensor.values.length-1].value>rules[i].threshold){
					activateActuator(actuator,rules[i].action);
				}
				break;
				case "between-min-max":
				var min_max=rules[i].threshold.split("<...<");
				if (sensor.values[sensor.values.length-1].value>min_max[0]&&sensor.values[sensor.values.length-1].value<min_max[1]){
				activateActuator(actuator,rules[i].action);
				}
				break;
			}
		}	

		}
	}
		
}

// send to the actuator the value to activate it
function activateActuator(actuator,myValue){
	var val_array=new Array(); 
	val_array[0]=parseFloat(myValue);
	try{
		actuator.setValue(val_array,
			function(actuatorEvent){
				//alert(JSON.stringify(actuatorEvent));
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


// ***************** MAIN - LOADED AT THE BEGINNING ********************/

jQuery(document).ready(function() {

		//show the homepage
		selectPage("#wrapper_homepage","#wrapper_settingpage","#wrapper_sensorstate","#wrapper_configuration","#wrapper_actuator");

		//event associated to stop button and start button
    	$("#stop_events").click(function() {
	        stopSensorEvents();
	    });

	    $("#start_events").click(function() {
	        startSensorEvents();
	    });

	    //event to hide "load" gif in "room_config" page
	    $('#overlay').fadeOut('fast');
		$('#box').hide();

		//show next button and hide confirm button in "home" page (when show popup)
		$('#confirm').hide();
		$('#next').show();

		//portion of code to draw the chart of sensors - it use an external library to draw
		Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
		sensor_chart = new Highcharts.Chart({
			chart: {
				renderTo: 'sensor-chart',
				type: 'area',
				marginRight: 10,
			},
			xAxis: {
				type: 'datetime',
				tickPixelInterval: 150
			},
			yAxis: {
				title: {
					text: ' '
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function() {
					return '<b>'+ this.series.name +'</b><br/>'+Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+Highcharts.numberFormat(this.y, 2);
				}
			},
			legend: {
				enabled: false
			},
			exporting: {
				enabled: false
			},
			series: [{
				id: 'values',
				name: 'values',
				data: []
			}]
		});

		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/test"), {
				onFound: function(service){
					//alert(service.serviceAddress);
					extractPZH(service.serviceAddress);
				}
		});

		setTimeout(start_discovery,2000);



/*
		//discovery sensors operation
		for ( var i in sensor_types) {
			var type = sensor_types[i];
			webinos.discovery.findServices(new ServiceType(type), {
				onFound: function (service) {
					console.log("Service "+service.serviceAddress+" found ("+service.api+")");
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
			});
		}
		
		// discovering actuators
		for ( var i in actuator_types) {
			var type = actuator_types[i];
			webinos.discovery.findServices(new ServiceType(type), {
				onFound: function (service) {
					console.log("Service "+service.serviceAddress+" found ("+service.api+")");
					//put it in actuators[]
					actuators[service.id] = service;
					service.bind({
						onBind:function(){
		        			console.log("Service "+service.api+" bound");
							var params = {aid: service.id};
		        		}
					});
				}
			});
		}

		//discovery for file API
		webinos.discovery.findServices(new ServiceType("http://webinos.org/api/file"), {
			onFound: function (service) {
				service.bindService({
					onBind: function () {
						service.requestFileSystem(1, 1024, 
							function (filesystem) {
								root_directory = filesystem.root;
								load_data_from_file("rules.txt");
								load_data_from_file("data.txt");
								load_data_from_file("room_config.txt");
							},
							function (error) {
								alert("Error requesting filesystem (#" + error.code + ")");
							}
						);					
					}
				});
			},
			onError: function (error) {
				alert("Error finding service: " + error.message + " (#" + error.code + ")");
			}
		});
		
		setTimeout(initRulesUI,1000);		
*/

});

function start_discovery(){
	//if pzh_list.length>0  ==> there is one or more PZH
	//else  ==> there isn't nothing PZH (there is only LOCAL PZP)
	if(pzh_list.length>0){
		init_popup();
		insertPZH();
	}else{
		discovery_all();
	}
}


function extractPZH(service_address){
	//es. PZP ADDRESS:  pippo@gmail.com/Macbook-pro_local.PZP
	//es. PZH ADDRESS:  pippo@gmail.com
	var expression = /\//;
	var result = expression.test(service_address);
	var expression_2 = /@/;
	var result_2 = expression_2.test(service_address);
	if(result==false && result_2==true){
		pzh_list.push(service_address);
	}else {
		pzp_list.push(service_address);
	}
}




//**** to delete **//
function loadIMAGE(){
	$('#myImgId').attr('src', jsonOBJ.image)
}

