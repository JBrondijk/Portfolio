import * as THREE from "../libs/three.js-r132/build/three.module.js";
import {DeviceOrientationControls} from "../libs/three.js-r132/examples/jsm/controls/DeviceOrientationControls.js"; 

let SIZE = {x:0,y:0,width:0,height:0};

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();

const wbgeometry = new THREE.PlaneGeometry(2,2,1);
const wbtexture = loader.load("./textures/waterbok.png");
const wbmaterial = new THREE.MeshBasicMaterial({map: wbtexture, transparent:true, side:2, alphaTest: 0.1});
const waterbok = new THREE.Mesh(wbgeometry, wbmaterial);

const grassgeometry = new THREE.CylinderGeometry(2,2,4,20,1,true);
const grasstexture = loader.load("./textures/grass.png");
const grassmaterial = new THREE.MeshBasicMaterial({map: grasstexture, transparent:true, side:1, depthWrite: false});
const grass = new THREE.Mesh(grassgeometry,grassmaterial);

const rotator = new THREE.Object3D();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({alpha:true});
const controls = new DeviceOrientationControls(camera);

let cameraWorldPos = new THREE.Vector3();
let cameraWorldDir = new THREE.Vector3();
//var castVector = new THREE.Vector2(0,5 , 0.5);
const raycaster = new THREE.Raycaster();

var currentRotation = 180;
var speed = 0.2;
var minSpeed = 0.2
var maxSpeed = 0.3
var score = 0;
var goingLeft = true;
var switchTime = 2;
var elapsedSwitchTime = 0;



//access camera
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

	scene.add(rotator);
	scene.add(waterbok);
	waterbok.userData.name = "waterbok";
	rotator.add(waterbok);
	waterbok.position.set(3,0,0);
	waterbok.rotation.set (0,Math.PI/2,0);
	waterbok.frustumCulled = false;
	rotator.frustumCulled = false;
	
	scene.add (grass)
	grass.position.set(0,0.2,0);
	
	camera.position.set(0,0,0);
	
	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);

	animate();
});
	
function animate(){
	//move waterbok
	if (goingLeft){
		currentRotation = currentRotation + speed;
	} else {
		currentRotation = currentRotation - speed;
	}
	rotator.rotation.set(0, currentRotation*(Math.PI/180), 0);

	//pick new direction when it's time
	elapsedSwitchTime = elapsedSwitchTime + 1/60;
	if (elapsedSwitchTime > switchTime){
		pickDirection();
		elapsedSwitchTime = 0;
		switchTime = Math.random() * (4 - 2) + 2;
	}

	//cast ray from middle of screen, increase score if looking at waterbok, increase distance to waterbok otherwise.
	
	camera.getWorldPosition(cameraWorldPos);
	camera.getWorldDirection(cameraWorldDir);
	raycaster.set(cameraWorldPos,cameraWorldDir);
	const intersects = raycaster.intersectObjects(scene.children,true);

	if (intersects.length > 0){ 
		for (let i = 0; i < intersects.length; i++){
			if(intersects[i].object = waterbok.scene){ //check if object is the waterbok
				lookAt();
				break;
			}
			if (i = intersects.length-1){
				lookAway(orange); //no waterbok found
			}
		}
	} else {
		lookAway(red);
	}

	//display score
	document.getElementById("text").innerHTML = "Score: ".concat(String(score));

	controls.update();
	renderer.render(scene,camera);
	requestAnimationFrame(animate);
	}

function pickDirection(){
	var newDirection = Math.random() >= 0.5;

	speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

	if (goingLeft != newDirection){
		waterbok.rotation.y = waterbok.rotation.y+Math.PI;
		goingLeft = newDirection
	}
}

function lookAt (){
	score = score+1;
	document.getElementById("text").style.color="green";
}
function lookAway(color){
	score = score -0.1;
	document.getElementById("text").style.color=String(color);
	if (score > 100){
		waterbok.position.x= waterbok.position.x+0.005; //implement something with the render order. waterbok.renderOrder = "something depending on it's distance between in relation to the cylinder(s)"
	}
}
