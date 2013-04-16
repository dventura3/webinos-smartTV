//Point class - single point in which you click
function point(x,y){
  this.x = x;
  this.y = y;
}

//list of points take on the image
var list_of_selected_point = new Array();

//Dictionary. Key=room name; value=list_of_selected_point (of room)
function room_dictionary(key, value){
  this.key = key;
  this.value = value;
}

//array of "room_dictionary"
var list_of_rooms = new Array();

//file name of IMAGE loaded 
var file_name_image = "";



/************************************************     GET CURSOR POSITION   ***************************************/

function FindPosition(oElement)
{
  if(typeof( oElement.offsetParent ) != "undefined")
  {
    for(var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent)
    {
      posX += oElement.offsetLeft;
      posY += oElement.offsetTop;
    }
      return [ posX, posY ];
    }
    else
    {
      return [ oElement.x, oElement.y ];
    }
}

//get the coordinates of the point in which the user click
function GetCoordinates(e)
{
  var PosX = 0;
  var PosY = 0;
  var ImgPos;
  ImgPos = FindPosition(myImg);
  if (!e) var e = window.event;
  if (e.pageX || e.pageY)
  {
    PosX = e.pageX;
    PosY = e.pageY;
  }
  else if (e.clientX || e.clientY)
    {
      PosX = e.clientX + document.body.scrollLeft
        + document.documentElement.scrollLeft;
      PosY = e.clientY + document.body.scrollTop
        + document.documentElement.scrollTop;
    }
  PosX = PosX - ImgPos[0];
  PosY = PosY - ImgPos[1];

  //create green point (only if I already open an image!)
  if($("#myImgId").attr("src")!="./assets/images/upload.jpg")
  { var green_cicle_position = "<p style='margin:"+(PosY-10)+"px 0px 0px "+(PosX-10)+"px; position:absolute;'><img src='assets/images/cverde.gif' alt=''/></p>";
    var img_map = document.getElementById("circle");
    img_map.innerHTML = img_map.innerHTML + green_cicle_position;
    //add point in array
    list_of_selected_point.push(new point(PosX, PosY));
  }
}


/************************************************     LOAD NEW IMAGE   ***************************************/

//relative to the hide button
function button_show(){
  $('#upload').click();
}

//load the image from disk
function readURL(input) {
    if (input.files && input.files[0]) {
        $('#myImgId').attr('src',"");

        var reader = new FileReader();

        reader.onload = function (e) {

            var myImage = new Image();
            myImage.src = e.target.result;
            
            myImage.onload = function(){
              //to avoid to load image larger than 70% of screen
              var screen_70 = (screen.width*70)/100;
              if(myImage.width>screen_70){
                alert("Image is too large!");
              }else{
                /** to put the image in central position **/
                var image_position = (screen_70 - myImage.width)/2;
                var imap_new = document.getElementById("imageMAP");
                imap_new.style.marginLeft = image_position+"px";
                $('#myImgId').attr('src', e.target.result);
                file_name_image = e.target.result;
              }
              
            }        

        };

        reader.readAsDataURL(input.files[0]);
    }

    remove_all_elements();

    //refresh map on left side - external library
    $('.map').maphilight().parent().addClass('center-map');

}

//delete from gui e from files: 
function remove_all_elements(){
    //Delete Area and List of Rooms created with other Image
    var map_new = document.getElementById("mymap");
    map_new.innerHTML = "";
    list_of_rooms = new Array();

    var img_map = document.getElementById("circle");
    img_map.innerHTML = "";
    list_of_selected_point = new Array();

    //refresh the list of rooms in the right side of the webpage
    var right_side = document.getElementById("content_right");
    right_side.innerHTML = "<h3 style='text-align:center; font-size:25px; margin:0px 0px 10px 0px;'><strong>List of rooms added</strong></h3>";

    //REMOVE ALL ELEMENTS FROM FILE "room_config.txt", "data.txt";
    save__to_file([], data_file);
    save__to_file([], room_config_file);
}


/************************************************     REMOVE ONE AREA   ***************************************/


function delete_area(clicked_id)
{
  var room = "";
  var index = 0;
  var room_name_to_delete ="";

  var conf=true;

  if (!confirm("Do you want delete area?"))
  {
    conf=false;
  }

  if(list_of_rooms.length!=0 && conf==true){

    for(i=0; i<list_of_rooms.length; i++){
        if (clicked_id == "delete_"+list_of_rooms[i].key) {
          room_name_to_delete = "room_name_" +list_of_rooms[i].key;
          index = i;
          //mymap
          var childnode_2 = document.getElementById(list_of_rooms[i].key);
          var removednode_2 = document.getElementById("mymap").removeChild(childnode_2);
          //save room name
          room = list_of_rooms[i].key;
        }
    }


    //upload list od dictionary "list_of_rooms"
    list_of_rooms.splice(index,1);

    //remove all elements img_map.innerHTML 
    var img_map = document.getElementById("circle");
    img_map.innerHTML = "";
    
    var childnode = document.getElementById(room_name_to_delete);
    var removednode = document.getElementById("content_right").removeChild(childnode);

    //refresh map
    $('.map').maphilight().parent().addClass('center-map');

    //saveMap() on file data.txt
    saveMap();

    //save on room_config.txt
    remove_room_config(room);

  }
}

//delete from file room_config the list of sensors-actuator associated to the room the user want to delete
function remove_room_config(room){

  load_data_from_file(room_config_file);

  //sensors
  var list_object_sensor = [];
  if(json_room_config.length!=0){
    for(t=0; t<json_room_config.sensors_in_rooms.length; t++){
      if(json_room_config.sensors_in_rooms[t].room_name!=room){
        list_object_sensor.push(json_room_config.sensors_in_rooms[t]);
      }
    }
  }

  //actuator
  var list_object_actuator = [];
  if(json_room_config.length!=0){
    for(c=0; c<json_room_config.actuators_in_rooms.length; c++){
      if(json_room_config.actuators_in_rooms[c].room_name!=room){
        list_object_actuator.push(json_room_config.actuators_in_rooms[c]);
      }
    }
  }

  var room_config = new Object();
  room_config.sensors_in_rooms = list_object_sensor;
  room_config.actuators_in_rooms = list_object_actuator;

  save__to_file(room_config,room_config_file);

}


/************************************************     ADD AREA AND POLY IN IMAGE   ***************************************/

function createPoly(){

  // number of points must be >2
   if(list_of_selected_point.length<3)
    {
     alert("Area Error. Number of point must be > 2");
     return;
    }
  //user insert room name
  var area_name = prompt("Insert name of room:","Room name");

  if(area_name!=null){

    //verify that area name is exist
    for(var h=0; h<list_of_rooms.length; h++){
      if(list_of_rooms[h].key==area_name){
        alert("Error! Area Name is exist! Repeat operation with new name please!");
        return;
      }
      //list_of_rooms
    }
    if(list_of_selected_point.length<3)
    {
     alert("Area Error. Number of point must be > 2");
     return;
    }
    //get html string of "area" to add in map
    var area = get_area_to_add_in_HTML(area_name, list_of_selected_point);
    
    //upload map
    var map_new = document.getElementById("mymap");
    map_new.innerHTML = map_new.innerHTML + area;

    //add room in list
    var room = new room_dictionary(area_name,list_of_selected_point);
    list_of_rooms.push(room);

    //remove all elements from list_of_selected_point
    list_of_selected_point = [];

    //remove all elements img_map.innerHTML 
    var img_map = document.getElementById("circle");
    img_map.innerHTML = "";

    //refresh map
    $('.map').maphilight().parent().addClass('center-map');

    //SHOW room name on right side
    var single_area_right_side = get_button_delete_to_add_in_HTML(area_name);
    var right_side = document.getElementById("content_right");
    right_side.innerHTML = right_side.innerHTML + single_area_right_side;

    //saveMap() on file data.txt
    saveMap();

  }else{
    alert("You don't have insert a room name. Repeat operation please!");
  }
}


//build the area from a graphics point of view
function get_area_to_add_in_HTML(room_name, list_point){
  var area = "<area shape='poly' coords='";
  for(i=0; i<list_point.length; i++){
    if(i!=list_point.length-1)
      area = area+ list_point[i].x + "," + list_point[i].y + ",";
    else
      area = area+ list_point[i].x + "," + list_point[i].y + "' onclick='go_to_room_config(this.id);' id='"+room_name+"'>";
  }

  room = room_name;
  return area;
}

//create the red button (for deleting room) in the right side 
function get_button_delete_to_add_in_HTML(area_name){
  var single_area_right_side = "<div id='room_name_"+area_name+"'><div id='content_room_name'><div id='text_room_name'>"+ area_name +"</div><div id='content_delete_room_selected'><input type='image' src='./assets/images/cancel.png' alt='' id='delete_"+area_name+"' onclick='delete_area(this.id)' /></div></div></div>";
  return single_area_right_side;
}


/************************************************ CLICK ON AREA ****************************************************/

function go_to_room_config(clicked_id){

  room = clicked_id;

  var list_sensor = document.getElementById('sensor_selected');
  list_sensor.innerHTML = "";
  sensors_of_room=new Array();
  sensors_to_hide=new Array();

  var list_actuator = document.getElementById('actuator_selected');
  list_actuator.innerHTML = "";
 
  actuators_of_room=new Array();
  actuators_to_hide=new Array();

  var title = document.getElementById("header_room_config");
  title.innerHTML = "";
  title.innerHTML = "<input type='image'  style='margin-top:18px;margin-left:30px;float:left;' src='./assets/images/home.png' alt='home' onclick='selectPage(\"#wrapper_homepage\",\"#wrapper_settingpage\",\"#wrapper_sensorstate\",\"#wrapper_configuration\",\"#wrapper_actuator\");' />";
  title.innerHTML = title.innerHTML + "<h1 style='text-align:center; margin-top:25px;font-size:25px'><strong>"+room.toUpperCase()+" CONFIGURATION</strong></h1>";
  title.innerHTML = title.innerHTML + "<input type='image'  style='margin-top:-33px;margin-right:30px;float:right;' src='./assets/images/refresh.png' alt='refresh' onclick='refreshDiscovery();' />";
  load_data_from_file(room_config_file);
  selectPage("#wrapper_configuration","#wrapper_settingpage","#wrapper_homepage","#wrapper_sensorstate","#wrapper_actuator");

}




/************************************************ DELETE POLY ****************************************************/
function deletePoly(){
if(list_of_selected_point.length!=0) {

  //remove all elements from list_of_selected_point
    list_of_selected_point = [];

    //remove all elements img_map.innerHTML 
    var img_map = document.getElementById("circle");
    img_map.innerHTML = "";

    //refresh map
    $('.map').maphilight().parent().addClass('center-map');
}  
else 
  alert("Area is already cleared!");

}


/************************************************     SAVE data.txt FILE   ***************************************/

function parseJSON_room(list_of_point_for_single_room){
  var points = [];

  for(j=0; j<list_of_point_for_single_room.length; j++){
        var single_point = list_of_point_for_single_room[j];
        var ob_tmp = new Object();
        ob_tmp.x = single_point.x;
        ob_tmp.y = single_point.y;
        points.push(ob_tmp);
  }

  return points;
}

function saveMap(){

  var element_array_tmp = [];

  for(i=0; i<list_of_rooms.length; i++){
      
      var points = parseJSON_room(list_of_rooms[i].value);
      
      var single_element = new Object();
      single_element.name = list_of_rooms[i].key;
      single_element.points = points;

      //insert new "single_element"
      element_array_tmp.push(single_element);
  }

  var input_img = document.getElementById("myImgId");
  
  var elements = new Object();
  elements.elements = element_array_tmp;
  elements.image = input_img.src;

  //save in local storage
  save__to_file(elements, data_file);

}

/************************************************     LOAD GUI (After read data.txt file)   ***************************************/

function load_GUI(){

  for(k=0; k<jsonOBJ.elements.length; k++){
    // jsonOBJ.elements.length = numero di "aree"
    var area_name = jsonOBJ.elements[k].name;

    for(j=0; j<jsonOBJ.elements[k].points.length; j++){
      var point_tmp = new point(jsonOBJ.elements[k].points[j].x,jsonOBJ.elements[k].points[j].y);
      list_of_selected_point.push(point_tmp);
    }

    //get html string of "area" to add in map
    var area = get_area_to_add_in_HTML(area_name, list_of_selected_point);

    //upload map
    var map_new = document.getElementById("mymap");
    map_new.innerHTML = map_new.innerHTML + area;

    //add room in list
    var room = new room_dictionary(area_name,list_of_selected_point);
    list_of_rooms.push(room);

    //remove all elements from list_of_selected_point
    list_of_selected_point = [];

    //SHOW room name on right side
    var single_area_right_side = get_button_delete_to_add_in_HTML(area_name);
    var right_side = document.getElementById("content_right");
    right_side.innerHTML = right_side.innerHTML + single_area_right_side;
  }

  //refresh map on left side
  $('.map').maphilight().parent().addClass('center-map');
}


