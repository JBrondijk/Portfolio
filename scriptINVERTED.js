let VIDEO=null;
let CANVAS=null;
let CONTEXT=null;
let SCALER=1;
let SIZE={x:0,y:0,width:0,height:0};

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
	for(var i = 0; i < data.length; i+=4) {
			data[i+0] = 255 - data[i];
			data[i+1] = 255 - data[i+1];
			data[i+2] = 255 - data[i+2];
	}		
	CONTEXT.putImageData(imageData,0,0);
	
	window.requestAnimationFrame(updateCanvas);
}