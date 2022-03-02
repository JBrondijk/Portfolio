import * as THREE from "../libs/three.js-r132/build/three.module.js";

const scene = new THREE.Scene();
	
const geometry = new THREE.BoxGeometry(1,1,1);
const material = new THREE.MeshBasicMaterial({color: "#0000FF"});
const cube = new THREE.Mesh(geometry, material);
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({alpha:true});

const angles = ["alphaBetaGamma","alphaGammaBeta","betaAlphaGamma", "betaGammaAlhpa","gammaAlphaBeta","gammaBetaAlpha"];
const currentangle = 0;


window.addEventListener("deviceorientation", handleOrientation, true);
document.addEventListener("DOMContentLoaded",()=>{
	
	cube.position.set(0,0,-2);
	cube.rotation.set(0,Math.PI/4,0);
	scene.add(cube);

	camera.position.set(1,1,5);
	
	renderer.setSize(500,500);
	renderer.render(scene,camera);
	
	const video = document.createElement("video");
	navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
		video.srcObject = stream;
		video.play();
	});
	
	video.style.position = "absolute";
	video.style.width = renderer.domElement.width;
	video.style.height = renderer.domElement.height;
	renderer.domElement.style.position="absolute"
	
	document.body.appendChild(video);
	document.body.appendChild(renderer.domElement);
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

  renderer.render(scene,camera);
}

function toggle() {
	console.log("ToggleButton");
	const element = document.getElementByID(button1);
	currentangle = currentangle + 1;
		if (currentangle > 5){
			currentangle = 0;
		}
	button.textContent = angles[currentangle];
}