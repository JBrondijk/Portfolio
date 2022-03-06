import * as THREE from "../libs/three.js-r132/build/three.module.js";
import {DeviceOrientationControls} from "../libs/three.js-r132/examples/jsm/controls/DeviceOrientationControls.js"; 

let SIZE = {x:0,y:0,width:0,height:0};

const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();

const wbgeometry = new THREE.BoxGeometry(1,1,1);
const wbtexture = loader.load("./textures/waterbok.png");
//const wbmaterial = new THREE.MeshBasicMaterial({map: wbtexture, transparent:true});
const wbmaterial = new THREE.MeshBasicMaterial({color: "FF0000"});
const waterbok = new THREE.Mesh(wbgeometry, wbmaterial);

const grassgeometry = new THREE.CylinderGeometry(2,2,4,20,1,true);
const grasstexture = loader.load("./textures/grass.png");
const grassmaterial = new THREE.MeshBasicMaterial({map: grasstexture, transparent:true, side:1});
const grass = new THREE.Mesh(grassgeometry,grassmaterial);

const rotator = new THREE.Object3D();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({alpha:true});
const controls = new DeviceOrientationControls(camera);

var currentRotation = 0;

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
	rotator.add(waterbok);
	waterbok.position.set(3,0,0);
	waterbok.rotation.set (0,Math.PI/2,0);
	scene.add (grass)
	camera.position.set(0,0,0);
	
	renderer.render(scene,camera);

	VIDEO.style.position = "absolute";
	renderer.domElement.style.position="absolute"

	document.getElementById("videoContainer").appendChild(renderer.domElement);

	animate();
});
	
function animate(){
	controls.update();

	//rotate waterbok (game logic will come here?)
	currentRotation = currentRotation +0.01;


	rotator.rotation.set(0, currentRotation*(Math.PI/180), 0);


	renderer.render(scene,camera);
	requestAnimationFrame(animate);
	}