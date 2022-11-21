$(window).on('load', function (e) {
    
});

function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
            function(k){ return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function() {
        if (xhr.readyState>3 && xhr.status==200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}

$( "#saveBtn" ).click(function(event) {
    var canvas = document.getElementById("displayCanvas")
    dataURL= canvas.toDataURL();
    postData = {imageData: dataURL}
    postAjax('/', postData, function(){ location.reload(); })
});
$( ".savedThumb" ).click(function(event) {
    basicLightbox.create('<div class="lbox">'+$(this).html()+'</div>').show()
});

window.addEventListener("load", windowLoadHandler, false);

var Debugger = function() { };
Debugger.log = function(message) {
	try {
		console.log(message);
	}
	catch (exception) {
		return;
	}
}

function windowLoadHandler() {
	canvasApp();
    //resizeCanvas();
}

function canvasApp() {
	
	var displayCanvas = document.getElementById("displayCanvas");
	var context = displayCanvas.getContext("2d");
	var displayWidth = displayCanvas.width;
	var displayHeight = displayCanvas.height;
	
	var rowHeight;
	var stringSpacing;
	var stringThickness;
	var margin;
	var bgColor;
	var numStrings;
	var crossingProbability;
	var positiveProbability;
	var crossingAngle;
	var controlYFactor;
	var spacerGap;
	var generatorsInLastRow;
	var colors;
	var gradDX, gradDY;
	var timer;
	//var hostName = "";
    //var serverIP = "";
	init();
    
	function init() {
		rowHeight = 52;
		stringSpacing = 32;
		stringThickness = 12;
		bgColor = "#000000";
		numStrings = 1 + Math.floor((displayWidth-stringThickness)/stringSpacing);
		margin = (displayWidth - (numStrings-1)*stringSpacing)/2;
		crossingProbability = 0.67;
		positiveProbability = 0.5;
		spacerGap = 0.5;
		
		crossingAngle = 42*Math.PI/180;
		controlYFactor = (1 - stringSpacing/rowHeight*Math.tan(crossingAngle));
		
		/*
		controlYFactor = 0.5;
		crossingAngle = Math.atan(rowHeight*(1-controlYFactor)/stringSpacing);
		*/
		
		var gradDist = 2*stringThickness;
		gradDX = gradDist*Math.cos(crossingAngle);
		gradDY = gradDist*Math.sin(crossingAngle);
		
		context.fillStyle = bgColor;
		context.fillRect(0,0,displayWidth,displayHeight);		
		
		setInitialColors();
		
		//initialize generatorsInLastRow - an array which records which braid generators appeared in the previous row.
		//I want to know this in order to avoid a braid crossing followed by its inverse.
		generatorsInLastRow = [];
		for (var k = 0; k < numStrings-1; k++) {
			generatorsInLastRow.push(0);
		}
		
		//timer = setInterval(onTimer,1000/10);
		var i = Math.floor(displayHeight/rowHeight);
		while (--i > -1) {
			fillRow(i*rowHeight);	
		}
        context.lineWidth = 2;
        context.strokeStyle = "#4f72e5"
		context.strokeRect(0, 0, displayWidth, displayHeight);
		context.strokeRect(0, displayHeight-rowHeight, displayWidth, rowHeight);
        context.fillStyle = "#000";
		context.fillRect(context.lineWidth, displayHeight-rowHeight, displayWidth-(context.lineWidth*2), rowHeight-context.lineWidth);
		context.fillStyle = "#fff";
        context.font = "bold 20px Ember";
		context.fillText(hostName, 22, displayHeight-rowHeight+(rowHeight/2)-4);
        context.fillStyle = "#ff6138";
        context.font = "16px Ember";
		context.fillText(serverIP, 22, displayHeight-rowHeight+(rowHeight/2)+16);
        
		context.fillStyle = "#ccc";
        let date = new Date();
		context.fillText(date.toLocaleString(), displayWidth-180, displayHeight-rowHeight+(rowHeight/2)+16);
	}
	
	function onTimer() {
		//scroll down
		context.drawImage(displayCanvas, 0, 0, displayWidth, displayHeight-rowHeight, 0, rowHeight, displayWidth, displayHeight-rowHeight);
		//clear top row
		context.fillStyle = bgColor;
		context.fillRect(0,0,displayWidth,rowHeight);		
		//draw new top row
		fillRow(0);
	}
	
	
	function fillRow(y0) {
		var stringNumber = 0;
		var x0;
		var temp;
		var positiveSwitch;
		var doPositive;
		var prob = 0.5; //first crossing probability at 50%, rest will be set to desired crossingProbability set above.
		while (stringNumber < numStrings - 1) {
			x0 = margin + stringNumber*stringSpacing;
			if (Math.random() < prob) {
				positiveSwitch = (Math.random() < positiveProbability);
				doPositive = (positiveSwitch && (generatorsInLastRow[stringNumber] != -1)) ||
							  ((!positiveSwitch) && (generatorsInLastRow[stringNumber] == 1));
				if (doPositive) {
					drawCrossing(x0, y0, colors[stringNumber], colors[stringNumber+1], true);
					generatorsInLastRow[stringNumber] = 1;
					generatorsInLastRow[stringNumber+1] = 0;
				}
				else {
					drawCrossing(x0, y0, colors[stringNumber], colors[stringNumber+1], false);
					generatorsInLastRow[stringNumber] = -1;
					generatorsInLastRow[stringNumber+1] = 0;
				}
				//permute colors
				temp = colors[stringNumber];
				colors[stringNumber] = colors[stringNumber+1];
				colors[stringNumber+1] = temp;
				
				//advance
				stringNumber += 2;
			}
			else {
				drawString(x0, y0, colors[stringNumber]);
				stringNumber += 1;
			}
		}
		if (stringNumber == numStrings - 1) {
			drawString(margin + stringNumber*stringSpacing, y0, colors[stringNumber]);
		}
		
		//after first crossing probability of 50%, remaining crossing probabilities set to desired amount.
		prob = crossingProbability;
		
	}
	
	function setInitialColors() {
		var i;
		var r,g,b;
		var darkR, darkG, darkB;
		var lightR, lightG, lightB;
		var param;
		
		colors = [];
        colorsReinvent = [
			{r: 88,g: 127,b: 244},
			{r: 229,g: 122,b: 92},
			{r: 11,g: 15,b: 80},
			{r: 23,g: 29,b: 135},
			{r: 34,g: 44,b: 159},
			{r: 41,g: 53,b: 183},
			{r: 34,g: 81,b: 159},
			{r: 34,g: 81,b: 159},
			{r: 185,g: 90,b: 80},
			{r: 105,g: 68,b: 123},
			{r: 46,g: 23,b: 135},
			{r: 191,g: 95,b: 75},
			{r: 71,g: 29,b: 129},
			{r: 80,g: 29,b: 124},
			{r: 95,g: 37,b: 117},
			{r: 118,g: 43,b: 110},
			{r: 118,g: 43,b: 110},
			{r: 140,g: 75,b: 104},
			{r: 155,g: 72,b: 92},
			{r: 176,g: 85,b: 82},
			{r: 185,g: 90,b: 80},
			{r: 185,g: 90,b: 80},
			{r: 191,g: 95,b: 75},
			{r: 202,g: 102,b: 72}	
		];
		
		var darkFactor = 0.33;
		var lightAdd = 20;

		
		for (i = 0; i < numStrings; i++) {
			// r = 64+Math.floor(Math.random()*180);
			// g = 64+Math.floor(Math.random()*180);
			// b = 64+Math.floor(Math.random()*180);
            r = colorsReinvent[i].r;
            g = colorsReinvent[i].g;
            b = colorsReinvent[i].b;
						
			darkR = Math.floor(darkFactor*r);
			darkG = Math.floor(darkFactor*g);
			darkB = Math.floor(darkFactor*b);
			
			lightR = Math.min(Math.floor(r + lightAdd),255);
			lightG = Math.min(Math.floor(g + lightAdd),255);
			lightB = Math.min(Math.floor(b + lightAdd),255);
			
			var colorObj = {
				base: "rgb("+r+","+g+","+b+")",
				dark: "rgb("+darkR+","+darkG+","+darkB+")",
				light: "rgb("+lightR+","+lightG+","+lightB+")"
			}
			colors.push(colorObj);
		}
		
	}
	
	function drawString(x0,y0,color) {
		context.strokeStyle = color.base;
		context.lineWidth = stringThickness;
		context.lineCap = "butt";
		context.beginPath();
		context.moveTo(x0,y0);
		context.lineTo(x0,y0+rowHeight);
		context.stroke();
	}
	
	function drawCrossing(x0,y0,color1,color2,positive) {
		var grad;	
		var midX = x0 + stringSpacing/2;
		var midY = y0 + rowHeight/2;
		context.lineCap = "butt";
		if (positive) {
			grad = context.createLinearGradient(midX+gradDX, midY-gradDY, midX-gradDX, midY+gradDY);
			grad.addColorStop(0, color1.base);
			grad.addColorStop(0.5, color1.dark);
			grad.addColorStop(1, color1.base);
			context.strokeStyle = grad;
			drawLine1();
			
			//drawSpacer2();
			
			grad = context.createLinearGradient(midX+gradDX, midY+gradDY, midX-gradDX, midY-gradDY);
			grad.addColorStop(0, color2.base);
			grad.addColorStop(0.5, color2.light);
			grad.addColorStop(1, color2.base);
			context.strokeStyle = grad;
			drawLine2();
		}
		else {
			grad = context.createLinearGradient(midX+gradDX, midY+gradDY, midX-gradDX, midY-gradDY);
			grad.addColorStop(0, color2.base);
			grad.addColorStop(0.5, color2.dark);
			grad.addColorStop(1, color2.base);
			context.strokeStyle = grad;
			drawLine2();
			
			//drawSpacer1();
			
			grad = context.createLinearGradient(midX+gradDX, midY-gradDY, midX-gradDX, midY+gradDY);
			grad.addColorStop(0, color1.base);
			grad.addColorStop(0.5, color1.light);
			grad.addColorStop(1, color1.base);
			context.strokeStyle = grad;
			drawLine1();
		}
		
		function drawLine1() {
			context.lineWidth = stringThickness;
			context.beginPath();
			context.moveTo(x0+stringSpacing,y0);
			context.bezierCurveTo(x0+stringSpacing, y0+rowHeight*controlYFactor, 
									x0, y0+rowHeight*(1-controlYFactor), 
									x0, y0+rowHeight);
			context.stroke();
		}
		
		function drawSpacer1() {
			context.strokeStyle = bgColor;
			context.lineWidth = stringThickness + spacerGap*2;
			context.beginPath();
			context.moveTo(x0+stringSpacing,y0);
			context.bezierCurveTo(x0+stringSpacing, y0+rowHeight*controlYFactor, 
									x0, y0+rowHeight*(1-controlYFactor), 
									x0, y0+rowHeight);
			context.stroke();
		}
				
		function drawSpacer2() {
			context.strokeStyle = bgColor;
			context.lineWidth = stringThickness+2*spacerGap;
			context.beginPath();
			context.moveTo(x0,y0);
			context.bezierCurveTo(x0, y0+rowHeight*controlYFactor, 
									x0+stringSpacing, y0+rowHeight*(1-controlYFactor), 
									x0+stringSpacing, y0+rowHeight);
			context.stroke();
		}

		
		function drawLine2() {
			context.lineWidth = stringThickness;
			context.beginPath();
			context.moveTo(x0,y0);
			context.bezierCurveTo(x0, y0+rowHeight*controlYFactor, 
									x0+stringSpacing, y0+rowHeight*(1-controlYFactor), 
									x0+stringSpacing, y0+rowHeight);
			context.stroke();
		}
	}
}

$(window).on('resize', function(){
    resizeCanvas();
});

function resizeCanvas()
{
    var canvas = $('#displayCanvas');
    canvas.css("width", $('#canvasContainer').width());
    canvas.css("height", $('#canvasContainer').width());
}