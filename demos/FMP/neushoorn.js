const THREE = window.MINDAR.IMAGE.THREE;

document.getElementById("myARcontainer").addEventListener("mousedown", onPressScreen, false);
document.getElementById("myARcontainer").addEventListener("mouseup", onReleaseScreen, false);

function onPressScreen (){
	if (gameState == "play"){
		var coords = new THREE.Vector2();
		coords.x = (event.clientX);
		coords.y = (event.clientY);

		clickedObject = findSelectedObject(coords);
		clickedObject.material = materialHover;
	}
}
function onReleaseScreen (){
	if (gameState == "play"){
		select(clickedObject);
		clickedObject.material = materialNormal;
		console.log(clickedObject);
		gameState = "menu";
	}
}

//imagetracking template:
var gameState = "start",
	scanning = true,
	clickedObject,
	documentWidth = window.innerWidth,
	documentHeight = window.innerHeight,
	widthHalf = documentWidth/2, 
    heightHalf = documentHeight/2;

	//deltatime variables
	var lastTime = (new Date()).getTime(),
		currentTime = 0,
		delta = 0;

const selectableObjects = []; //add selectable objects to this array
/*
	//add objects like this:
	selectableObjects[0] = new THREE.Mesh(geometry, material);
	plane.add(selectableObjects[0]); //do this later where geometry, materials and plane are defined. 
*/

//html elements:
const	scanner = document.getElementById("scanning"),
		startMenu = document.getElementById("startMenu"),
		enclMenu = document.getElementById("enclMenu"),
		enclInfo = document.getElementById("enclInfo");

const infoMenus = [];
	infoMenus[0] = document.getElementById ("encl0");
	infoMenus[1] = document.getElementById ("encl1");
	infoMenus[2] = document.getElementById ("encl2");
	infoMenus[3] = document.getElementById ("encl3");
	infoMenus[4] = document.getElementById ("encl4");

var ARCamera;

//ThreeJS stuff:
const loader = new THREE.TextureLoader();
const geometry = new THREE.PlaneGeometry(0.3,0.3);
const textureNormal = loader.load("./textures/selectCircle.png");
const textureHover = loader.load("./textures/selectCircleHover.png");
const materialNormal = new THREE.MeshBasicMaterial({map: textureNormal, transparent:true, side:2,alphaTest: 0.1});
const materialHover = new THREE.MeshBasicMaterial({map: textureHover, transparent:true, side:2,alphaTest: 0.1});

const selectPlane0 = new THREE.Mesh(geometry, materialNormal);
selectPlane0.position.set(-0.4,-0.3,0.01);
selectableObjects[0]=selectPlane0;
const selectPlane1 = new THREE.Mesh(geometry, materialNormal);
selectPlane1.position.set(-0.4,-0.3,0.01);
selectableObjects[1]=selectPlane1;
const selectPlane2 = new THREE.Mesh(geometry, materialNormal);
selectPlane2.position.set(-0.2,-0.3,0.01);
selectableObjects[2]=selectPlane2;
const selectPlane3 = new THREE.Mesh(geometry, materialNormal);
selectPlane3.position.set(0,-0.3,0.01);
selectableObjects[3]=selectPlane3;
const selectPlane4 =  new THREE.Mesh(geometry, materialNormal);
selectPlane4.position.set(0.2,-0.3,0.01);
selectableObjects[4]=selectPlane4;

const backgroundGeometry = new THREE.PlaneGeometry(1,1);
const backgroundMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
const background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);

background.add(selectPlane0);
background.add(selectPlane1);
background.add(selectPlane2);
background.add(selectPlane3);
background.add(selectPlane4);



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
		anchor.group.add(background); 

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

	updateInfoMenuLocations();


	requestAnimationFrame(loop);
}

function updateInfoMenuLocations (){
	for (var i = 0; i < infoMenus.length; i++) {
		let coords = getScreenLocation(selectableObjects[i])
		infoMenus[i].style.top = coords.y+"px";
		infoMenus[i].style.left= coords.x+"px";
	}
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
		enclInfo.style.display = "block";
	}  else if (gamestate == "menu") {
		displayNone();
		enclMenu.style.display = "block";
		//add additional gamestates like this
		//make sure to set new gameStates to "block" in other gamestates. 
	} 
}

function displayNone(){
	startMenu.style.display = "none";	
	scanner.style.display = "none";
	enclMenu.style.display= "none";
	enclInfo.style.display = "none";

}

function findSelectedObject(point){
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
                shortestdistance = distance2D(ObjectPos,point);
			}  else {
				if (distance2D(ObjectPos,point) < shortestdistance){
					closestObject = selectableObjects[p];
                    shortestdistance = distance2D(ObjectPos,point);
				}  
            } 
		}	
        return(closestObject);
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

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();
}

function selectRhino(element){
	console.log(element);
}

function closeEnclosureMenu(){
	//Put rhinos in selection backinto enclosure
	gameState = "play";
	updateUI();
}