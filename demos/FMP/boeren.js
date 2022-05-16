const THREE = window.MINDAR.IMAGE.THREE;

//imagetracking template:
var gameState = "start",
	scanning = true,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	boxOffset = (((document.getElementById("myARcontainer").clientHeight)/95)*100)-documentHeight, //offset the selectionbox using this variable to make its location the same on every browser. 
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2, 
	selectionBox = new createSelectionBox(documentWidth*0.1, documentHeight*0.25+boxOffset, documentWidth*0.8, documentWidth*0.8-boxOffset),
    boxMiddle = new THREE.Vector2();

    boxMiddle.x = selectionBox.x+(documentWidth*0.8)/2;
    boxMiddle.y = selectionBox.y+(documentWidth*0.8-boxOffset)/2;

var newSelectionBox = document.getElementById("selectBox").getBoundingClientRect();
var newBoxMiddle = new THREE.Vector2();

	newBoxMiddle.x = newSelectionBox.x+newSelectionBox.width/2;
    newBoxMiddle.y = newSelectionBox.y+newSelectionBox.height/2;

var oldSelectionBoxLog = "oldSelectionBox: X " + selectionBox.x + " , Y " + selectionBox.y + " , W " + selectionBox.width + " , H " + selectionBox.height + " , MiddleX " + boxMiddle.x + " , MiddleY" + boxMiddle.y;
var newSelectionBoxLog = "newSelectionBox: X " + newSelectionBox.x + " , Y " + newSelectionBox.y + " , W " + newSelectionBox.width + " , H " + newSelectionBox.height + " , MiddleX " + newBoxMiddle.x + " , MiddleY" + newBoxMiddle.y;

console.log(oldSelectionBoxLog);
console.log(newSelectionBoxLog);

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

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

//game elements
var mouthLocation;
var hoveredObject;
var previousHoveredObject;

var ARCamera;

//ThreeJS stuff:
const loader = new THREE.TextureLoader();
const geometry = new THREE.PlaneGeometry(0.19,0.19);
const textureNormal = loader.load("./textures/selectCircle.png");
const textureHover = loader.load("./textures/selectCircleHover.png");
const materialNormal = new THREE.MeshBasicMaterial({map: textureNormal, transparent:true, side:2,alphaTest: 0.1});
const materialHover = new THREE.MeshBasicMaterial({map: textureHover, transparent:true, side:2,alphaTest: 0.1});

const selectPlane1 = new THREE.Mesh(geometry, materialNormal);
selectPlane1.position.set(-0.4,-0.3,0.01);
selectableObjects[0]=selectPlane1;
const selectPlane2 = new THREE.Mesh(geometry, materialNormal);
selectPlane2.position.set(-0.2,-0.3,0.01);
selectableObjects[1]=selectPlane2;
const selectPlane3 = new THREE.Mesh(geometry, materialNormal);
selectPlane3.position.set(0,-0.3,0.01);
selectableObjects[2]=selectPlane3;
const selectPlane4 =  new THREE.Mesh(geometry, materialNormal);
selectPlane4.position.set(0.2,-0.3,0.01);
selectableObjects[3]=selectPlane4;

const mouth = new THREE.Object3D();
mouth.position.set(-0.1,-0.2,0);

const backgroundGeometry = new THREE.PlaneGeometry(1,1);
const backgroundMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
const background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);

background.add(selectPlane1);
background.add(selectPlane2);
background.add(selectPlane3);
background.add(selectPlane4);
background.add(mouth);

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

		ARCamera = camera;

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(background); //Build scene here.


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

	mouthLocation = getScreenLocation(mouth);

	previousHoveredObject = hoveredObject;
	hoveredObject = findSelectedObject();
	if (hoveredObject != previousHoveredObject){
		if (previousHoveredObject != null){
			previousHoveredObject.material = materialNormal;
		}
		if (hoveredObject != null){
			hoveredObject.material = materialHover;
			selectbtn.disabled = false;
			if (hoveredObject==selectPlane1){
				selectbtn.innerHTML = "Waakhonden";
			}	else if (hoveredObject==selectPlane2){
				selectbtn.innerHTML = "Hekken & Veekralen";
			}	else if (hoveredObject==selectPlane3){
				selectbtn.innerHTML = "BijenHekken";
			}	else if (hoveredObject==selectPlane4){
				selectbtn.innerHTML = "Fakkel Lampen";
			}
		} else {
			selectbtn.disabled = true;
			selectbtn.innerHTML = "Selecteer een oplossing";
		}
	}


	requestAnimationFrame(loop);
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
		newSelectionBox = document.getElementById("selectBox").getBoundingClientRect();
		console.log(newSelectionBoxLog);
		scanner.style.display = "none";
		startMenu.style.display = "none";
	} /* else if (gamestate == "menu") {
		//add additional gamestates like this
		//make sure to set new gameStates to "block" in other gamestates. 
	} */
}

//select button
selectbtn.onclick = function(){
    if (hoveredObject != null){
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

function getScreenLocation(object){
	var ObjectPos = new THREE.Vector3();
	ObjectPos = ObjectPos.setFromMatrixPosition(object.matrixWorld);
	ObjectPos.project(ARCamera);
	ObjectPos.x = (ObjectPos.x * widthHalf) + widthHalf;
	ObjectPos.y = - (ObjectPos.y * heightHalf) + heightHalf;
	ObjectPos.z = 0;
	return (ObjectPos);
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

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}