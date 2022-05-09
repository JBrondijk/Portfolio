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
const geomerty = new THREE.PlaneGeometry(1,1);
const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
const plane = new THREE.Mesh(geomerty, material);


document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/cheetah.mind", //change to correct imagetarget.
			uiLoading: "no",
			uiScanning: "no",
			filterMinCF:0.1,
			filterBeta: 2000
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

			selectbtn.style.display = "none";
			selectMenu.style.display = "none";
		}

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
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

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();

}