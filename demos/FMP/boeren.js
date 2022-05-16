const THREE = window.MINDAR.IMAGE.THREE;

//imagetracking template:
var gameState = "start",
	scanning = true,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	boxOffset = (((document.getElementById("myARcontainer").clientHeight)/95)*100)-documentHeight, //offset the selectionbox using this variable to make its location the same on every browser. 
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2, 
	selectionBox = new DOMRect(documentWidth*0.1, documentHeight*0.25+boxOffset, documentWidth*0.8, documentWidth*0.8-boxOffset),
    boxMiddle = new THREE.Vector2();

    boxMiddle.x = selectionBox.x+(selectionBox.width)/2;
    boxMiddle.y = selectionBox.y+(selectionBox.height)/2;

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
		selectbtn = document.getElementById("btnSelect"),
		speechBubble = document.getElementById("speechBubble"),
		speechBubbleText = document.getElementById("speechBubbleText"),
		speechBubbleArrowTop = document.getElementById("speechBubbleArrowTop");
		//speechBubbleArrowBottom = document.getElementById("speechBubbleArrowBottom");

//game elements
var mouthLocation;
var hoveredObject;
var previousHoveredObject;
var yMinSelectMenu = selectMenu.getBoundingClientRect().y;

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
mouth.position.set(-0.1,0.2,0);

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
	updateSpeechBubble();
	updateSelectionBox();

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
		displayNone();
		scanner.style.display = "block";
	} else if (gameState == "start"){
		displayNone();
		startMenu.style.display = "block";
	} else if (gameState == "play") {
		displayNone();	
		selectbtn.style.display = "block";
		selectMenu.style.display = "block";
		selectionBox = document.getElementById("selectBox").getBoundingClientRect();
		boxMiddle.x = selectionBox.x+(selectionBox.width)/2;
		boxMiddle.y = selectionBox.y+(selectionBox.height)/2; 
	} /* else if (gamestate == "menu") {
		//add additional gamestates like this
		//make sure to set new gameStates to "block" in other gamestates. 
	} */
}

function displayNone(){
	startMenu.style.display = "none";	
	scanner.style.display = "none";
	selectbtn.style.display = "none";
	selectMenu.style.display = "none";
}

function updateSpeechBubble(){
	speechBubble.style.top = mouthLocation.y +"px";
	speechBubbleArrowTop.style.marginLeft = Math.min(Math.max(mouthLocation.x - (0.1*documentWidth), 0), speechBubbleText.clientWidth-speechBubbleArrowTop.clientWidth) +"px";
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
        if (selectionBoxContains(ObjectPos.x, ObjectPos.y)){
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

function updateSelectionBox(){
	selectMenu.style.top = (mouthLocation.y+speechBubble.clientHeight*2) +"px";
	
	selectionBox = document.getElementById("selectBox").getBoundingClientRect();
	boxMiddle.x = selectionBox.x+(selectionBox.width)/2;
	boxMiddle.y = selectionBox.y+(selectionBox.height)/2; 
}
function selectionBoxContains(x,y){
	return (selectionBox.x <= x && x <= selectionBox.x+selectionBox.width && selectionBox.y <= y && y <= selectionBox.y + selectionBox.height);
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}