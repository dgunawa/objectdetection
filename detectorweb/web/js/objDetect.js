/**
 * Created by chad hart on 11/30/17.
 * Client side of Tensor Flow Object Detection Web API
 * Written for webrtcHacks - https://webrtchacks.com
 */

//Parameters
const s = document.getElementById('objDetect');
const sourceVideo = s.getAttribute("data-source");  //the source video to use
const uploadWidth = s.getAttribute("data-uploadWidth") || 640; //the width of the upload file
const mirror = s.hasAttribute("data-mirror") || false; //mirror the boundary boxes (add attribute data-mirror if you need this)
const scoreThreshold = s.getAttribute("data-scoreThreshold") || 0.5;
const apiServer = s.getAttribute("data-apiServer") || window.location.origin + '/image'; //the full TensorFlow Object Detection API server url

const myColors = {
    "badge-oliver":'#FBB13C',
    "badge-cone":'#56CBF9',
    "badge-ball":'#6BFFB8',
    "badge-zone":'#C3F73A',
    "badge-snow":'#F47E52',
    "badge-rome":'#FF729F',
    "badge-oscar":'#D5F2E3'
}
//Array('#F24318','#D5F2E3','#FBB13C','#FE6847','#6BFFB8','#C3F73A');

//Video element selector
v = document.getElementById(sourceVideo);

//for starting events
let isPlaying = false,
    gotMetadata = false;

//Canvas setup

//create a canvas to grab an image for upload
let imageCanvas = document.createElement('canvas');
let imageCtx = imageCanvas.getContext("2d");

let nameColors = {};
let counter = 0;

let elementWidth = 640;
let elementHeight = 480;

//create a canvas for drawing object boundaries
var drawCanvas = document.createElement('canvas');
document.body.appendChild(drawCanvas);
var drawCtx;

//draw boxes and labels on each detected object
function drawBoxes(objects) {

    //clear the previous drawings
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    let names = {};
    //let objectList = document.getElementById('objects').innerHTML = "";
    //filter out objects that contain a class_name and then draw boxes and labels on each

    objects.filter(object => object.name && object.name!="person").forEach(object => {
        let x = object.xmin ;//* drawCanvas.width;
        let y = object.ymin ;//* drawCanvas.height;
        let width = (object.xmax) - x;
        let height = (object.ymax) - y;

        //flip the x axis if local video is mirrored
        if (!mirror) {
            x = drawCanvas.width - (x + width);
        }

        if (!(object.name in nameColors)){
            nameColors[object.name] = Object.keys(myColors)[counter%6];        
            counter++;
        }

        if (!(object.name in names)){
            names[object.name] = Object.keys(myColors)[counter%6];
        }

        drawCtx.strokeStyle = myColors[nameColors[object.name]];
        drawCtx.fillStyle = myColors[nameColors[object.name]];
        drawCtx.fillText(object.name + " - " + Math.round(object.confidence * 100) + "%", x + 5, y + 20);
        drawCtx.strokeRect(x, y, width, height);
    });
    let htm = '';
    Object.keys(names).forEach(key => {
        htm+='<span class="badge badge-pill '+ nameColors[key] +'">'+key+'</span>&nbsp;&nbsp;';
    });
    document.getElementById('objects').innerHTML = htm;
}

//Add file blob to a form and post
function postFile(file) {

    //Set options as form data
    let formdata = new FormData();
    formdata.append("image", file);
    formdata.append("threshold", scoreThreshold);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', apiServer, true);
    xhr.onload = function () {
        if (this.status === 200) {
            let objects = JSON.parse(this.response);

            //draw the boxes
            drawBoxes(objects);

            //Save and send the next image
            imageCtx.drawImage(v, 0, 0, elementWidth, elementHeight, 0, 0, uploadWidth, uploadWidth * (elementHeight / elementWidth));
            imageCanvas.toBlob(postFile, 'image/jpeg');
        }
        else {
            console.error(xhr);
        }
    };
    xhr.send(formdata);
}

//Start object detection
function startObjectDetection() {

    console.log("starting object detection");

    //Set canvas sizes base don input video
    drawCanvas.width = elementWidth;
    drawCanvas.height = elementHeight;

    imageCanvas.width = uploadWidth;
    imageCanvas.height = uploadWidth * (elementHeight / elementWidth);

    //Some styles for the drawcanvas
    drawCtx.lineWidth = 4;
    drawCtx.font = "20px Verdana";

    //Save and send the first image
    imageCtx.drawImage(v, 0, 0, elementWidth, elementHeight, 0, 0, uploadWidth, uploadWidth * (elementHeight / elementWidth));
    imageCanvas.toBlob(postFile, 'image/jpeg');
}


function reportWindowSize() {
    let rect = v.getBoundingClientRect();
    
    drawCanvas.style.top = rect.top+"px";
    drawCanvas.style.left = rect.left+"px";
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawCtx = drawCanvas.getContext("2d");
    elementWidth = v.width;
    elementHeight = v.height;
}

//Starting events//
window.onresize = reportWindowSize;

//see if the video has started playing
//check if metadata is ready - we need the video size
if (v.nodeName == "VIDEO"){
    v.onloadedmetadata = () => {
        console.log("video metadata ready");
        gotMetadata = true;
        if (isPlaying)
            startObjectDetection();
    };

    //see if the video has started playing
    v.onplaying = () => {
        elementWidth = v.videoWidth;
        elementHeight = v.videoHeight;
        console.log("video playing");
        isPlaying = true;
        if (gotMetadata) {
            startObjectDetection();
        }
    };
}
else{
    v.onload = () => {
        console.log("img video loaded");
    
        let rect = v.getBoundingClientRect();
    
        drawCanvas.style.top = rect.top+"px";
        drawCanvas.style.left = rect.left+"px";
        drawCtx = drawCanvas.getContext("2d");
        elementWidth = v.width;
        elementHeight = v.height;
        
        isPlaying = true;
        //if (gotMetadata) {
            startObjectDetection();
       // }
    };
}




