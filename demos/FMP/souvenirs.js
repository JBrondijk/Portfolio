const THREE = window.MINDAR.IMAGE.THREE;

//imagetracking template:
var gameState = "start",
	scanning = true,
	widthHalf = window.innerWidth/2,
    heightHalf = window.innerHeight/2,
	selectionBox = new createSelectionBox(window.innerWidth*0.1, window.innerHeight*0.25, window.innerWidth*0.8, window.innerWidth*0.8),
    boxMiddle = new THREE.Vector2();

    boxMiddle.x = selectionBox.x+(selectionBox.w/2);
    boxMiddle.y = selectionBox.y+(selectionBox.h/2);

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

	//game variables:
	var conveyorOffset = 0.5,
		conveyorSpeed = 0.004,
		spawnTimer = 0,
		spawnTime = 1.6,
		souvenirCount = getRandomInt(3,6); //after spawning this many items a souvenir is spawned instead.
		

const selectableObjects = []; //add selectable objects to this array
/*
	//add objects like this:
	selectableOjects[0] = new THREE.Mesh(geometry, material);
	plane.add(selectableObjects[0]); //do this later where geometry, materials and plane are defined. 
*/

//html elements:
const	scanner = document.getElementById("scanning"),
		startMenu = document.getElementById("startMenu"),
		selectMenu = document.getElementById("selectMenu"),
		selectbtn = document.getElementById("btnSelect");

var ARCamera;
var ARScene;

//ThreeJS stuff:
const loader = new THREE.TextureLoader();
	//geometries
	const geometry = new THREE.PlaneGeometry(1,1);
	const suitcaseGeometry = new THREE.PlaneGeometry(0.3,0.3)
	const souvenirGeometry = new THREE.PlaneGeometry(0.1,0.1)

	//textures
	const conveyorTexture = loader.load("./textures/souvenirs/conveyor.png");
		conveyorTexture.wrapS=THREE.RepeatWrapping;
		conveyorTexture.wrapT = THREE.RepeatWrapping;
	const souvenirTextures = [];
		souvenirTextures[0] = loader.load("./textures/souvenirs/souvenir1_bracelet_xray.png");
		souvenirTextures[1] = loader.load("./textures/souvenirs/souvenir2_feather_xray.png");
		souvenirTextures[2] = loader.load("./textures/souvenirs/souvenir3_ivory_xray.png");
		souvenirTextures[3] = loader.load("./textures/souvenirs/souvenir4_turtles_xray.png");
		souvenirTextures[4] = loader.load("./textures/souvenirs/souvenir5_turtles_xray.png");
	const suitcaseOpenTextures = [];
		suitcaseOpenTextures[0] = loader.load("./textures/souvenirs/suitcase1.1_open.png");
		suitcaseOpenTextures[1] = loader.load("./textures/souvenirs/suitcase1.2_open.png");
		suitcaseOpenTextures[2] = loader.load("./textures/souvenirs/suitcase2.1_open.png");
		suitcaseOpenTextures[3] = loader.load("./textures/souvenirs/suitcase2.2_open.png");
		suitcaseOpenTextures[4] = loader.load("./textures/souvenirs/suitcase3.1_open.png");
		suitcaseOpenTextures[5] = loader.load("./textures/souvenirs/suitcase3.2_open.png");
		suitcaseOpenTextures[6] = loader.load("./textures/souvenirs/suitcase4.1_open.png");
		suitcaseOpenTextures[7] = loader.load("./textures/souvenirs/suitcase4.2_open.png");
		suitcaseOpenTextures[8] = loader.load("./textures/souvenirs/suitcase4.3_open.png");
		suitcaseOpenTextures[9] = loader.load("./textures/souvenirs/suitcase4.4_open.png");
	const suitcaseClosedTextures = [];
		suitcaseClosedTextures[0] = loader.load("./textures/souvenirs/suitcase1.1_closed.png");
		suitcaseClosedTextures[1] = loader.load("./textures/souvenirs/suitcase1.2_closed.png");
		suitcaseClosedTextures[2] = loader.load("./textures/souvenirs/suitcase2.1_closed.png");
		suitcaseClosedTextures[3] = loader.load("./textures/souvenirs/suitcase2.2_closed.png");
		suitcaseClosedTextures[4] = loader.load("./textures/souvenirs/suitcase3.1_closed.png");
		suitcaseClosedTextures[5] = loader.load("./textures/souvenirs/suitcase3.2_closed.png");
		suitcaseClosedTextures[6] = loader.load("./textures/souvenirs/suitcase4.1_closed.png");
		suitcaseClosedTextures[7] = loader.load("./textures/souvenirs/suitcase4.2_closed.png");
		suitcaseClosedTextures[8] = loader.load("./textures/souvenirs/suitcase4.3_closed.png");
		suitcaseClosedTextures[9] = loader.load("./textures/souvenirs/suitcase4.4_closed.png");
	//materials
	const conveyorMaterial = new THREE.MeshBasicMaterial({map:conveyorTexture,side:3});
	//const xrayMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent : !0, opacity : 0 } );
	const xrayMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent : !0, opacity : 0.5 } );
	const hidePlaneMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff, colorWrite: false});
	const souvenirMaterials = [];
		souvenirMaterials[0] = new THREE.MeshBasicMaterial({map: souvenirTextures[0], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[1] = new THREE.MeshBasicMaterial({map: souvenirTextures[1], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[2] = new THREE.MeshBasicMaterial({map: souvenirTextures[2], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[3] = new THREE.MeshBasicMaterial({map: souvenirTextures[3], transparent:true, side:3, alphaTest: 0.1});
		souvenirMaterials[4] = new THREE.MeshBasicMaterial({map: souvenirTextures[4], transparent:true, side:3, alphaTest: 0.1});
	const suitcaseMaterials = [];
		suitcaseMaterials[0] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[0], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[1] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[1], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[2] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[2], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[3] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[3], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[4] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[4], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[5] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[5], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[6] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[6], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[7] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[7], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[8] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[8], transparent:true, side:3, alphaTest: 0.1});
		suitcaseMaterials[9] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[9], transparent:true, side:3, alphaTest: 0.1});
	const souvenircaseMaterials = [];
		souvenircaseMaterials[0] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[0], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[1] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[1], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[2] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[2], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[3] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[3], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[4] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[4], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[5] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[5], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[6] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[6], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[7] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[7], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[8] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[8], transparent : !0, side:3, alphaTest: 0.1});
		souvenircaseMaterials[9] = new THREE.MeshBasicMaterial({map: suitcaseClosedTextures[9], transparent : !0, side:3, alphaTest: 0.1});

	const suitcases = [];
	const souvenircases = [];

const conveyor = new THREE.Mesh(geometry, conveyorMaterial);
const xrayPlane = new THREE.Mesh(geometry, xrayMaterial);
    xrayPlane.renderOrder = -1;
const hidePlaneTop = new THREE.Mesh(geometry, hidePlaneMaterial);
	hidePlaneTop.position.set(0,1,0.02);
	conveyor.add(hidePlaneTop);
const hidePlaneBottom = new THREE.Mesh(geometry, hidePlaneMaterial);
	hidePlaneBottom.position.set(0,-1,0.02);
	conveyor.add(hidePlaneBottom);

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/cheetah.mind", //change to correct imagetarget.
			uiLoading: "no",
			uiScanning: "no"//,
			//filterMinCF: 0.001,
			//filterBeta: 4000
		})
		const {renderer, scene, camera} = mindarThree;
		camera.add(xrayPlane);
		xrayPlane.position.set(0,0,-2);
		ARCamera = camera;

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(conveyor); //Build scene here.

		//on target found
		anchor.onTargetFound = () => {
			scanning = false;
			updateUI();
		}
		
		//on target lost
		anchor.onTargetLost = () => {
			scanning = true;
			updateUI();
		}

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
		
		loop();
	}
	start();

});

function loop (){
	//calculate deltatime
	currentTime = (new Date()).getTime();
	delta = (currentTime - lastTime) / 1000;
	lastTime = currentTime;

	//animate the conveyor belt
	conveyorOffset = conveyorOffset+conveyorSpeed;
    if (conveyorOffset > 1){
    	conveyorOffset = 0;
    }
    conveyor.material.map.offset.set(0,conveyorOffset);

	moveObjects(suitcases);
	moveObjects(souvenircases);

	//check if need to spawn new suitcase
	spawnTimer = spawnTimer+delta;
    if (spawnTimer > spawnTime){
    	spawn();
      spawnTimer = 0;
    }

	requestAnimationFrame(loop);
}

function moveObjects(arrayToMove){
	if (arrayToMove.length > 0) {
		for(var i = arrayToMove.length-1; i >= 0; i--){
			arrayToMove[i].position.y=arrayToMove[i].position.y-conveyorSpeed;
			if (arrayToMove[i].position.y < -0.65){
        			conveyor.remove(arrayToMove[i]);
				arrayToMove.splice(i,1);
			}
		}
	}
}

function spawn(){
	souvenirCount = souvenirCount -1;
    if (souvenirCount <= 0){
		souvenirCount = getRandomInt(3,6)
		spawnSouvenir();
    } else {
		suitcases.push(new THREE.Mesh(suitcaseGeometry,suitcaseMaterials[getRandomInt(0,suitcaseMaterials.length-1)]));
		suitcases[suitcases.length-1].position.set(0.35-(0.7*Math.random()),0.65,0.01);
		conveyor.add(suitcases[suitcases.length-1]);
    }
}

function spawnSouvenir(){
	var suitcaseNumber = getRandomInt(0,suitcaseMaterials.length-1);
	var souvenirNumber = getRandomInt(0,souvenirMaterials.length-1);

	souvenircases.push(new THREE.Mesh(suitcaseGeometry,suitcaseMaterials[suitcaseNumber]));
    souvenircases[souvenircases.length-1].position.set(0.35-(0.7*Math.random()),0.65,0.01);
	souvenircases[souvenircases.length-1].add(new THREE.Mesh(suitcaseGeometry,souvenircaseMaterials[suitcaseNumber]));
	souvenircases[souvenircases.length-1].children[0].position.z=0.002;
	souvenircases[souvenircases.length-1].add(new THREE.Mesh(souvenirGeometry,souvenirMaterials[souvenirNumber]));
	souvenircases[souvenircases.length-1].children[1].position.z=0.001;

    conveyor.add(souvenircases[souvenircases.length-1]);
    //console.log("spawn souvenir");
}

//select button
selectbtn.onclick = function(){
	let selectedObject = findSelectedObject();
    if (selectedObject != null){
    	console.log("object selected");
    } else {
    	console.log("no object selected");
    }	
}

function findSelectedObject(){
	var closestObject;
    var ObjectPos = new THREE.Vector3();
    var shortestdistance;         
	if (selectableObjects.length > 0){ //check which object is closest to the center.
		for (var p = 0; p < selectableObjects.length; p++) {
			ObjectPos = ObjectPos.setFromMatrixPosition(selectableObjects[p].matrixWorld);
            ObjectPos.project(ARCamera);
            ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
            ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
			ObjectPos.z = 0;
            if (p==0){
				closestObject = selectableObjects[p];
                shortestdistance = distance2D(ObjectPos,boxMiddle);
			}  else {
				if (distance2D(ObjectPos,boxMiddle) < shortestdistance){
					closestObject = selectableObjects[p];
                    shortestdistance = distance2D(ObjectPos,boxMiddle);
				}  
            } 
		}	
        ObjectPos = ObjectPos.setFromMatrixPosition(closestObject.matrixWorld);
        ObjectPos.project(ARCamera);
        ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
        ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
		ObjectPos.z = 0;
        if (selectionBox.contains(ObjectPos.x, ObjectPos.y)){
			//object is in box and is selected
			return(closestObject);
        } else {
			return (null); //no object in box, nothing selected. 
	    }
  	} else {
		return (null); //no objects to select, nothing selected.
	}
}

function distance2D(pointA, pointB){
	var distanceX = pointA.x-pointB.x;
	var distanceY = pointA.y-pointB.y;

	return(Math.sqrt(distanceX*distanceX + distanceY*distanceY));
}

//create the selectionbox. 
function createSelectionBox(x,y,w,h){
	this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;

    this.contains = function (x, y) {
        return this.x <= x && x <= this.x + this.width &&
               this.y <= y && y <= this.y + this.height;
    }
}

//generate random integer (for array selections)
function getRandomInt(min, max) {
	var output = Math.floor(Math.random() * (max - min + 1) + min)
	return Math.floor(output);
}

function updateUI(){
	if (gameState == "play" && scanning){
		scanner.style.display = "block";
		startMenu.style.display = "none";	
		selectbtn.style.display = "none";
		selectMenu.style.display = "none";
	} else if (gameState == "start"){
		startMenu.style.display = "block";	
		scanner.style.display = "none";
		selectbtn.style.display = "none";
		selectMenu.style.display = "none";
	} else if (gameState == "play") {
		selectbtn.style.display = "block";
		selectMenu.style.display = "block";
		scanner.style.display = "none";
		startMenu.style.display = "none";
	} /* else if (gamestate == "menu") {
		//add additional gamestates like this
		//make sure to set new gameStates to "block" in other gamestates. 
	} */
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}