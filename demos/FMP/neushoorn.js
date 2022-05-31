const THREE = window.MINDAR.IMAGE.THREE;

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

const enclosureMenus = [];
enclosureMenus[0] = document.getElementById("encl0Menu");
enclosureMenus[1] = document.getElementById("encl1Menu");
enclosureMenus[2] = document.getElementById("encl2Menu");
enclosureMenus[3] = document.getElementById("encl3Menu");
enclosureMenus[4] = document.getElementById("encl4Menu");

//MAKING ALL THE RHINOS
document.getElementById("encl0Males")

//game variables
var	openMenu;



var ARCamera;

//ThreeJS stuff:
 
const enclosureTrackers = [];
enclosureTrackers[0]= = new THREE.Object3D();
enclosureTrackers[1]= = new THREE.Object3D();
enclosureTrackers[2]= = new THREE.Object3D();
enclosureTrackers[3]= = new THREE.Object3D();
enclosureTrackers[4]= = new THREE.Object3D();

enclosureTrackers[0].position.set(-0.3,0.25,0.01);
enclosureTrackers[1].position.set(0.12,0.27,0.01);
enclosureTrackers[2].position.set(-0.17,0,0.01);
enclosureTrackers[3].position.set(-0.27,-0.3,0.01);
enclosureTrackers[4].position.set(0.13,-0.18,0.01);

const backgroundGeometry = new THREE.PlaneGeometry(1,1);
const backgroundMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
const background = new THREE.Mesh(backgroundGeometry,backgroundMaterial);

background.add(enclosureTrackers[0]);
background.add(enclosureTrackers[1]);
background.add(enclosureTrackers[2]);
background.add(enclosureTrackers[3]);
background.add(enclosureTrackers[4]);



document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/neushoorn.mind", //change to correct imagetarget.
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
		let coords = getScreenLocation(enclosureTrackers[i])
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

function rhino(div, male, gene1, gene2){
	this.div = div;
	this.male = male;
	this.gene1 = gene1;
	this.gene2 = gene2;
}

function enclosure(rhinos, males, females, inbreeding){
	this.rhinos = rhinos;
	this.males = males;
	this.females = females;
	this.inbreeding = inbreeding;
}

document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	gameState = "play";
	updateUI();
}

function selectRhino(element){
	console.log(element);
}

function openEnclosureMenu(menuToOpen){
	if (gameState == "play"){
		//set the correct menu to open
		if (openMenu!= null){
			enclosureMenus[openMenu].style.display = "none";
		}
		openMenu = menuToOpen;
		enclosureMenus[openMenu].style.display = "block";
		gameState = "menu";
		updateUI();
	}
}

function closeEnclosureMenu(){
	//Put rhinos in selection backinto enclosure
	gameState = "play";
	updateUI();
}