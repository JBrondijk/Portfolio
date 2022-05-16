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
		selectbtn = document.getElementById("btnSelect");

var ARCamera;

//ThreeJS stuff:
const geometry = new THREE.PlaneGeometry(1,1);
const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
const plane = new THREE.Mesh(geometry, material);


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
		anchor.group.add(plane); //Build scene here.

		selectableObjects[0]=plane; //for testing purpose, be sure to remove in other apps. 

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

function distance2D(pointA, pointB){
	var distanceX = pointA.x-pointB.x;
	var distanceY = pointA.y-pointB.y;

	return(Math.sqrt(distanceX*distanceX + distanceY*distanceY));
}

function selectionBoxContains(x,y){
	return (selectionBox.x <= x && x <= selectionBox.x+selectionBox.width && selectionBox.y <= y && y <= selectionBox.y + selectionBox.height);
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}