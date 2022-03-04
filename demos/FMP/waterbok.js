import * as THREE from "../libs/three.js-r132/build/three.module.js";
import {DeviceOrientationControls} from "../libs/three.js-r132/examples/jsm/controls/DeviceOrientationControls.js"; 

let SIZE = {x:0,y:0,width:0,height:0};

const scene = new THREE.Scene();
	
const geometry = new THREE.BoxGeometry(1,1,1);

const material1 = new THREE.MeshBasicMaterial({color: "#FF0000"});
const material2 = new THREE.MeshBasicMaterial({color: "#00FF00"});
const material3 = new THREE.MeshBasicMaterial({color: "#0000FF"});
const material4 = new THREE.MeshBasicMaterial({color: "#FFFF00"});
const material5 = new THREE.MeshBasicMaterial({color: "#00FFFF"});
const material6 = new THREE.MeshBasicMaterial({color: "#FF00FF"});

const cube1 = new THREE.Mesh(geometry, material1);
const cube2 = new THREE.Mesh(geometry, material2);
const cube3 = new THREE.Mesh(geometry, material3);
const cube4 = new THREE.Mesh(geometry, material4);
const cube5 = new THREE.Mesh(geometry, material5);
const cube6 = new THREE.Mesh(geometry, material6);

const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({alpha:true});
const controls = new DeviceOrientationControls(camera);

/*
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
*/

//window.addEventListener("deviceorientation", handleOrientation, true);

//play camera
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

	cube1.position.set(3,0,0);
	cube2.position.set(0,3,0);
	cube3.position.set(0,0,3);
	cube4.position.set(-3,0,0);
	cube5.position.set(0,-3,0);
	cube6.position.set(0,0,-3);

	scene.add(cube1);
	scene.add(cube2);
	scene.add(cube3);
	scene.add(cube4);
	scene.add(cube5);
	scene.add(cube6);

	camera.position.set(0,0,0);
	
	renderer.render(scene,camera);

	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);

	animate();
});
/*
function handleOrientation(event) {
	  var alpha    = THREE.Math.degToRad(event.alpha+180);
	  var beta     = THREE.Math.degToRad(event.beta+180);
	  var gamma    = THREE.Math.degToRad(event.gamma+90);

	  document.getElementById("alphatext").innerHTML = "alphatext: ".concat(String(alpha));
	  document.getElementById("betatext").innerHTML = "betatext: ".concat(String(beta));
	  document.getElementById("gammatext").innerHTML = "gammatext: ".concat(String(gamma));
/*
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
	*/	
	//camera.rotation.set(beta,alpha,gamma); //these should be the correct angles

	//renderer.render(scene,camera); }

	function animate(){
	controls.update();
	requestAnimationFrame(animate);
	}