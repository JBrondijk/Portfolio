/*
Progress bar code from https://codepen.io/theprogrammingexpert/pen/jOqGBLL
*/

import * as THREE from "../libs/three.js-r132/build/three.module.js";
import {DeviceOrientationControls} from "../libs/three.js-r132/examples/jsm/controls/DeviceOrientationControls.js"; 

let SIZE = {x:0,y:0,width:0,height:0};
//3D stuff. 
	const scene = new THREE.Scene();
	const loader = new THREE.TextureLoader();
	const wbgeometry = new THREE.PlaneGeometry(2,2,1);
	const wbtexture = loader.load("./textures/waterbok.png");
	const wbmaterial = new THREE.MeshBasicMaterial({map: wbtexture, transparent:true, side:2, alphaTest: 0.1});
	const waterbok = new THREE.Mesh(wbgeometry, wbmaterial);

	const grasstexture = loader.load("./textures/grass.png");
	const grassmaterial = new THREE.MeshBasicMaterial({map: grasstexture, transparent:true, side:1, depthWrite: false});
	var grassgeometry = new THREE.CylinderGeometry(2,2,1.5,20,1,true);
	const grass1 = new THREE.Mesh(grassgeometry,grassmaterial);
		grassgeometry = new THREE.CylinderGeometry(4,4,1.5,20,1,true);
	const grass2 = new THREE.Mesh(grassgeometry,grassmaterial);
		grassgeometry = new THREE.CylinderGeometry(6,6,1.5,20,1,true);
	const grass3 = new THREE.Mesh(grassgeometry,grassmaterial);
		grassgeometry = new THREE.CylinderGeometry(8,8,1.5,20,1,true);
	const grass4 = new THREE.Mesh(grassgeometry,grassmaterial);

	const rotator = new THREE.Object3D();
	const camera = new THREE.PerspectiveCamera();
	const renderer = new THREE.WebGLRenderer({alpha:true});
	const controls = new DeviceOrientationControls(camera);

	let cameraWorldPos = new THREE.Vector3();
	let cameraWorldDir = new THREE.Vector3();
	const raycaster = new THREE.Raycaster();

//Game logic
var PlayerProgress = 0,
	LionProgress = -10,
	playerDistance = 0,
	lionDistance = -6,
	currentRotation = 180,
	speed = 12,
	score = 0,
	highScore1 = 0,
	highScore2 = 0,
	streak = 0,
	goingLeft = true,
	switchTime = 2,
	elapsedSwitchTime = 0,
	lastTime = (new Date()).getTime(),
	currentTime = 0,
	delta = 0;

const	totalDistance = 40,
		streakGainTime = 5,
		streakLoseTime = 2.5,
		scoreModifier = 1,
		playerSpeed = 1,
		lionSpeed = 0.8,
		minSpeed = 18,
		maxSpeed = 24;

//html elements
const	playerProgressBar = document.querySelector(".progress"),
		lionProgressBar = document.querySelector(".progressLion"),
		playerIcon = document.querySelector(".playerIcon"),
		lionIcon = document.querySelector(".lionIcon"),
		score0 = document.getElementById("score0"),
		score1 = document.getElementById("score1"),
		score2 = document.getElementById("score2"),
		startMenu = document.getElementById("startMenu");

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

	//add Three.JS elements
	scene.add(rotator);
	scene.add(waterbok);
	waterbok.userData.iswaterbok = true;
	rotator.add(waterbok);
	waterbok.position.set(2.5,0,0);
	waterbok.rotation.set (0,Math.PI/2,0);
	waterbok.frustumCulled = false;
	waterbok.renderOrder = 6;
	rotator.frustumCulled = false;
	addGrass();

	camera.position.set(0,0,0);
	
	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);

	animate();
});
	
function animate(){
	//calculate deltatime
	currentTime = (new Date()).getTime();
	delta = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	moveWaterbok();
	
	//cast ray from middle of screen, increase score if looking at waterbok, increase distance to waterbok otherwise.
	camera.getWorldPosition(cameraWorldPos);
	camera.getWorldDirection(cameraWorldDir);
	raycaster.set(cameraWorldPos,cameraWorldDir);
	const intersects = raycaster.intersectObjects(scene.children,true);

	if (intersects.length > 0){ 
		for (let i = 0; i < intersects.length; i++){
			if(intersects[i].object.userData.iswaterbok){ //check if object is the waterbok
				lookAt();
				break;
			}
			if (i == intersects.length-1){
				lookAway(); //no waterbok found
			}
		}
	} else {
		lookAway();
	}

	//update lion distance
	lionDistance = lionDistance+0.7*delta;

	//display score
	
	updateProgress();

	controls.update();
	renderer.render(scene,camera);
	requestAnimationFrame(animate);
}
//end of animate function

function moveWaterbok(){
	//move waterbok
	if (goingLeft){
		currentRotation = currentRotation + speed*delta;
	} else {
		currentRotation = currentRotation - speed*delta;
	}
	rotator.rotation.set(0, currentRotation*(Math.PI/180), 0);

	setWaterbokDistance(2.5+5*(PlayerProgress/100));

	//pick new direction when it's time
	elapsedSwitchTime = elapsedSwitchTime + delta;
	if (elapsedSwitchTime > switchTime){
		pickDirection();
		elapsedSwitchTime = 0;
		switchTime = Math.random() * (4 - 2) + 2;
	}
}

function pickDirection(){
	var newDirection = Math.random() >= 0.3+(PlayerProgress/200);

	speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

	if (newDirection){
		waterbok.rotation.y = waterbok.rotation.y+Math.PI;
		goingLeft = !goingLeft;
	}
}

function updateProgress (){
	PlayerProgress = (playerDistance/totalDistance)*100;
	LionProgress = (lionDistance/totalDistance)*100;

	playerProgressBar.style.width = `${PlayerProgress}%`;
	playerIcon.style.left = `${getIconPosition(PlayerProgress)}vw`;
	lionProgressBar.style.width = `${LionProgress}%`;
	lionIcon.style.left = `${getIconPosition(LionProgress)}vw`;

	score0.innerHTML = Math.round(score).toString()

	if (score > highScore1){
		score1.innerHTML = Math.round(score).toString();
	}
}

function getIconPosition (iconPosition){
	return ((iconPosition/100)*95-5);
}
function lookAt (){
	if (streak<1){
		streak = streak + delta/streakGainTime;
	} else {
		streak = 1;
	}
	score = score+(scoreModifier+streak)*delta;
	playerDistance = playerDistance + playerSpeed*delta;
}
function lookAway(){
	streak = streak - delta/streakLoseTime;
}

function setWaterbokDistance(distance){
	waterbok.position.x = distance; 
		if (waterbok.position.x > 4 && waterbok.renderOrder > 4 ){
			waterbok.renderOrder = 4;
		}
		if (waterbok.position.x > 6 && waterbok.renderOrder > 2 ){
			waterbok.renderOrder = 2;
		}
		if (waterbok.position.x > 8 && waterbok.renderOrder > 0 ){
				waterbok.renderOrder = 0;
		}
}

function addGrass(){
	scene.add (grass1)
	grass1.userData.iswaterbok = false;
	grass1.position.set(0,-0.25,0);
	grass1.renderOrder = 7;
	scene.add (grass2)
	grass2.userData.iswaterbok = false;
	grass2.position.set(0,-0.24,0);
	grass2.rotation.set(0,Math.PI*0.5,0);
	grass2.renderOrder = 5;
	scene.add (grass3)
	grass3.userData.iswaterbok = false;
	grass3.position.set(0,-0.23,0);
	grass3.rotation.set(0,Math.PI,0);
	grass3.renderOrder = 3;
	scene.add (grass4)
	grass4.userData.iswaterbok = false;
	grass4.position.set(0,-0.22,0);
	grass4.rotation.set(0,Math.PI*1.5,0);
	grass4.renderOrder = 1;
}

document.getElementById("btnStart") = function(){
	startMenu.style.display = "none";
}