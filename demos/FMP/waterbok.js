import * as THREE from "../libs/three.js-r132/build/three.module.js";

let SIZE = {x:0,y:0,width:0,height:0};


const scene = new THREE.Scene();
	
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: "#FF00FF"});
const cube = new THREE.Mesh(geometry, material);
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({alpha:true});

//testing angles
const angles = ["alphaBetaGamma","alphaGammaBeta","betaAlphaGamma", "betaGammaAlhpa","gammaAlphaBeta","gammaBetaAlpha"];
var currentangle = 0;

var button = document.getElementById("toggle");
button.onclick = function(){
	console.log("ToggleButton");
	currentangle = currentangle + 1;
		if (currentangle > 5){
			currentangle = 0;
		}
	button.textContent = angles[currentangle];
}


window.addEventListener("deviceorientation", handleOrientation, true);

//play video
document.addEventListener("DOMContentLoaded",()=>{
	const VIDEO = document.getElementById("VIDEO");
	let promise = navigator.mediaDevices.getUserMedia({video: true, audio: false, video:{facingMode:"environment"}});
	promise.then(function(signal) {
		VIDEO.setAttribute('autoplay', '');
		VIDEO.setAttribute('muted', '');
		VIDEO.setAttribute('playsinline', '');
		VIDEO.srcObject=signal;
		VIDEO.play();
		
	}).catch(function(err) {
		alert("Website werkt niet zonder cameratoestemming.");
	});
//resize video
	VIDEO.addEventListener("canplay", function(e){
			let resizer= window.innerWidth/VIDEO.videoWidth;

			SIZE.width=resizer*VIDEO.videoWidth;
			SIZE.height=resizer*VIDEO.videoHeight;
			SIZE.x=VIDEO.width/2-SIZE.width/2;
			SIZE.y=VIDEO.height/2-SIZE.height/2;

			VIDEO.setAttribute("width", SIZE.width);
			VIDEO.setAttribute("height",SIZE.height);

			renderer.setSize(SIZE.width,SIZE.height);

			document.getElementById("spacer").style.height = String(SIZE.height).concat("px");
	})

	cube.position.set(1,0,0);
	cube.rotation.set(0,Math.PI/4,0);
	scene.add(cube);

	camera.position.set(0,0,5);
	
	renderer.render(scene,camera);

	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);
});

function handleOrientation(event) {
	  var alpha    = event.alpha*(Math.PI/180);
	  var beta     = event.beta*(Math.PI/180);
	  var gamma    = event.gamma*(Math.PI/180);
		
		  if (currentangle == 0){
			camera.rotation.set(alpha,beta,gamma);
		  }
		  if (currentangle == 1){
			camera.rotation.set(alpha,gamma,beta);
		  }
		  if (currentangle == 2){
			camera.rotation.set(beta,alpha,gamma);
		  }
		  if (currentangle == 3){
			camera.rotation.set(beta,gamma,alpha);
		  }
		  if (currentangle == 4){
			camera.rotation.set(gamma,alpha,beta);
		  }
		  if (currentangle == 5){
			camera.rotation.set(gamma,beta,alpha);
		  }
		
	//camera.rotation.set(beta,gamma,alpha);
	renderer.render(scene,camera);
}
