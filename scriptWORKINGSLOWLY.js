//Colorblind Corrector from http://www.daltonize.org/
//Camera Access from https://www.youtube.com/watch?v=Z6fQtNpB3hU&ab_channel=RaduMariescu-Istodor

let VIDEO=null;
let CANVAS=null;
let CONTEXT=null;
let SCALER=1;
let SIZE={x:0,y:0,width:0,height:0};
let amount=1

function main(){
	CANVAS=document.getElementById("myCanvas");
	CONTEXT=CANVAS.getContext("2d");

	let promise=navigator.mediaDevices.getUserMedia({audio:false, video:{facingMode:'environment'}});
	promise.then(function(signal){
		VIDEO=document.createElement("video");
		VIDEO.srcObject=signal;
		VIDEO.play();
		
		VIDEO.onloadeddata=function(){
			handleResize();
			window.addEventListener('resize',handleResize);
			updateCanvas();
		}
	}).catch(function(err){
		altert("Camera error: "+err);
	});
}

function handleResize(){
	CANVAS.width=window.innerWidth;
	CANVAS.height=window.innerHeight;
	
	let resizer=SCALER*
				Math.min(
					window.innerWidth/VIDEO.videoWidth,
					window.innerHeight/VIDEO.videoHeight
				);
	SIZE.width=resizer*VIDEO.videoWidth;
	SIZE.height=resizer*VIDEO.videoHeight;
	SIZE.x=window.innerWidth/2-SIZE.width/2;
	SIZE.y=window.innerHeight/2-SIZE.height/2;
}



function updateCanvas(){
	CONTEXT.drawImage(VIDEO,SIZE.x,SIZE.y,SIZE.width,SIZE.height);
	
	var imageData = CONTEXT.getImageData(0,0,CANVAS.width,CANVAS.height);
	var data = imageData.data;
	
	for(var id = 0, length = data.length; id < length; id += 4) {
		var sr = data[id], // source-pixel
			sg = data[id + 1],
			sb = data[id + 2],
			dr = sr, // destination-pixel
			dg = sg,
			db = sb;
		// Convert source color into XYZ color space
		var pow_r = Math.pow(sr, 2.2),
			pow_g = Math.pow(sg, 2.2),
			pow_b = Math.pow(sb, 2.2);
		var X = pow_r * 0.412424 + pow_g * 0.357579 + pow_b * 0.180464, // RGB->XYZ (sRGB:D65)
			Y = pow_r * 0.212656 + pow_g * 0.715158 + pow_b * 0.0721856,
			Z = pow_r * 0.0193324 + pow_g * 0.119193 + pow_b * 0.950444;
		// Convert XYZ into xyY Chromacity Coordinates (xy) and Luminance (Y)
		var chroma_x = X / (X + Y + Z);
		var chroma_y = Y / (X + Y + Z);
		// Generate the â€œConfusion Line" between the source color and the Confusion Point
		var m = (chroma_y - 0.2535) / (chroma_x - 0.7465); // slope of Confusion Line
		var yint = chroma_y - chroma_x * m; // y-intercept of confusion line (x-intercept = 0.0)
		// How far the xy coords deviate from the simulation
		var deviate_x = (-0.073894 - yint) / (m - 1.273463);
		var deviate_y = (m * deviate_x) + yint;
		// Compute the simulated colorâ€™s XYZ coords
		var X = deviate_x * Y / deviate_y;
		var Z = (1.0 - (deviate_x + deviate_y)) * Y / deviate_y;
		// Neutral grey calculated from luminance (in D65)
		var neutral_X = 0.312713 * Y / 0.329016; 
		var neutral_Z = 0.358271 * Y / 0.329016; 
		// Difference between simulated color and neutral grey
		var diff_X = neutral_X - X;
		var diff_Z = neutral_Z - Z;
		diff_r = diff_X * 3.24071 + diff_Z * -0.498571; // XYZ->RGB (sRGB:D65)
		diff_g = diff_X * -0.969258 + diff_Z * 0.0415557;
		diff_b = diff_X * 0.0556352 + diff_Z * 1.05707;
		// Convert to RGB color space
		dr = X * 3.24071 + Y * -1.53726 + Z * -0.498571; // XYZ->RGB (sRGB:D65)
		dg = X * -0.969258 + Y * 1.87599 + Z * 0.0415557;
		db = X * 0.0556352 + Y * -0.203996 + Z * 1.05707;
		// Compensate simulated color towards a neutral fit in RGB space
		var fit_r = ((dr < 0.0 ? 0.0 : 1.0) - dr) / diff_r;
		var fit_g = ((dg < 0.0 ? 0.0 : 1.0) - dg) / diff_g;
		var fit_b = ((db < 0.0 ? 0.0 : 1.0) - db) / diff_b;
		var adjust = Math.max( // highest value
			(fit_r > 1.0 || fit_r < 0.0) ? 0.0 : fit_r, 
			(fit_g > 1.0 || fit_g < 0.0) ? 0.0 : fit_g, 
			(fit_b > 1.0 || fit_b < 0.0) ? 0.0 : fit_b
		);
		// Shift proportional to the greatest shift
		dr = dr + (adjust * diff_r);
		dg = dg + (adjust * diff_g);
		db = db + (adjust * diff_b);
		// Apply gamma correction
		dr = Math.pow(dr, 1.0 / 2.2);
		dg = Math.pow(dg, 1.0 / 2.2);
		db = Math.pow(db, 1.0 / 2.2);
		// Anomylize colors
		dr = sr * (1.0 - amount) + dr * amount; 
		dg = sg * (1.0 - amount) + dg * amount;
		db = sb * (1.0 - amount) + db * amount;
		// Return values
		data[id] = dr >> 0;
		data[id + 1] = dg >> 0;
		data[id + 2] = db >> 0;
	}	
	CONTEXT.putImageData(imageData,0,0);
	
	window.requestAnimationFrame(updateCanvas);
}