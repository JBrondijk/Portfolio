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
		enclInfo = document.getElementById("enclInfo"),
		dummyrhino = document.getElementById("iconMaster");


//MAKING ALL THE ENCLOSURES/RHINOS
const enclosures = [];
	enclosures[0] = new enclosure(
							document.getElementById("encl0"), 
							document.getElementById("encl0Menu"), 
							document.getElementById("encl0Males"), 
							document.getElementById("encl0Females"), 
							document.getElementById("encl0ProblemCount"), 
							document.getElementById("menu0Fight"), 
							document.getElementById("menu0Breed"), 
							document.getElementById("menu0Man"), 
							document.getElementById("menu0Done"), 
							document.getElementById("encl0Contents"), 
							document.getElementById("encl0Fight"), 
							document.getElementById("encl0Breed"), 
							document.getElementById("encl0Man"), 
							document.getElementById("encl0Done"),
							[new rhino (true, "#308DFF", "#308DFF"),
							new rhino (false, "#308DFF", "#308DFF"),
							new rhino (false, "# FF3030", "#FF30FF"),
							new rhino (false, "#3030FF", "#3030FF")
							]);
	enclosures[1] = new enclosure(
							document.getElementById("encl1"), 
							document.getElementById("encl1Menu"), 
							document.getElementById("encl1Males"), 
							document.getElementById("encl1Females"), 
							document.getElementById("encl1ProblemCount"), 
							document.getElementById("menu1Fight"), 
							document.getElementById("menu1Breed"), 
							document.getElementById("menu1Man"), 
							document.getElementById("menu1Done"), 
							document.getElementById("encl1Contents"), 
							document.getElementById("encl1Fight"), 
							document.getElementById("encl1Breed"), 
							document.getElementById("encl1Man"), 
							document.getElementById("encl1Done"),
							[new rhino (true, "#3030FF", "#3030FF"),
							new rhino (true, "#308DFF", "#9030FF"),
							new rhino (false, "#FF3030", "#3030FF"),
							new rhino (false, "#FF3030", "#308DFF")
							]);
	enclosures[2] = new enclosure(
							document.getElementById("encl2"), 
							document.getElementById("encl2Menu"), 
							document.getElementById("encl2Males"), 
							document.getElementById("encl2Females"), 
							document.getElementById("encl2ProblemCount"), 
							document.getElementById("menu2Fight"), 
							document.getElementById("menu0Breed"), 
							document.getElementById("menu2Man"), 
							document.getElementById("menu2Done"), 
							document.getElementById("encl2Contents"), 
							document.getElementById("encl2Fight"), 
							document.getElementById("encl2Breed"), 
							document.getElementById("encl2Man"), 
							document.getElementById("encl2Done"),
							[new rhino (true, "#FF3030", "#FF3030"),
							new rhino (false, "#FFED30", "#FFED30"),
							new rhino (false, "#9030FF", "#9030FF")
							]);
	enclosures[3] = new enclosure(
							document.getElementById("encl3"), 
							document.getElementById("encl3Menu"), 
							document.getElementById("encl3Males"), 
							document.getElementById("encl3Females"), 
							document.getElementById("encl3ProblemCount"), 
							document.getElementById("menu3Fight"), 
							document.getElementById("menu3Breed"), 
							document.getElementById("menu3Man"), 
							document.getElementById("menu3Done"), 
							document.getElementById("encl3Contents"), 
							document.getElementById("encl3Fight"), 
							document.getElementById("encl3Breed"), 
							document.getElementById("encl3Man"), 
							document.getElementById("encl3Done"), 
							[new rhino (true, "#30FF41", "#30FF41"),
							new rhino (true, "#FFED30", "#30FF41"),
							new rhino (false, "#FF9030", "#FF9030"),
							new rhino (false, "#30FFED", "#30FFED")
							]);
	enclosures[4] = new enclosure(
							document.getElementById("encl4"), 
							document.getElementById("encl4Menu"), 
							document.getElementById("encl4Males"), 
							document.getElementById("encl4Females"), 
							document.getElementById("encl4ProblemCount"), 
							document.getElementById("menu4Fight"), 
							document.getElementById("menu4Breed"), 
							document.getElementById("menu4Man"), 
							document.getElementById("menu4Done"), 
							document.getElementById("encl4Contents"), 
							document.getElementById("encl4Fight"), 
							document.getElementById("encl4Breed"), 
							document.getElementById("encl4Man"), 
							document.getElementById("encl4Done"), 
							[new rhino (true, "#FF3030", "#FF3030"),
							new rhino (true, "#FF3030", "#FF9030"),
							new rhino (false, "#FF30FF", "#FF30FF"),
							new rhino (false, "#FF9030", "#FF9030"),
							new rhino (false, "#FF9030", "#FF3030")
							]);

//Setting all the border colors + appending elements
for (var i = 0; i < enclosures.length; i++) {
	for (var p = 0; p < enclosures[i].rhinos.length; p++) {
		enclosures[i].rhinos[p].borderTopColor = enclosures[i].rhinos[p].gene1;
		enclosures[i].rhinos[p].borderLeftColor = enclosures[i].rhinos[p].gene1;
		enclosures[i].rhinos[p].borderRightColor = enclosures[i].rhinos[p].gene2;
		enclosures[i].rhinos[p].borderBottomColor = enclosures[i].rhinos[p].gene2;
		if (enclosures[i].rhinos[p].male){
			enclosures[i].males.appendChild(enclosures[i].rhinos[p].div);
		} else {
			enclosures[i].females.appendChild(enclosures[i].rhinos[p].div);
		}
	}
}

//game variables
var	openMenu;



var ARCamera;

//ThreeJS stuff:
 
const enclosureTrackers = [];
enclosureTrackers[0]= new THREE.Object3D();
enclosureTrackers[1]= new THREE.Object3D();
enclosureTrackers[2]= new THREE.Object3D();
enclosureTrackers[3]= new THREE.Object3D();
enclosureTrackers[4]= new THREE.Object3D();

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
	for (var i = 0; i < enclosures.length; i++) {
		let coords = getScreenLocation(enclosureTrackers[i])
		coords.y= coords.y-(enclosures[i].infoMenu.offsetWidth/2);
		coords.x=coords.x- (enclosures[i].infoMenu.offsetHeight/2);
		enclosures[i].infoMenu.style.top = coords.y+"px";
		enclosures[i].infoMenu.style.left= coords.x+"px";
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

function rhino(male, gene1, gene2){
	this.div = dummyrhino.cloneNode(true);
	this.male = male;
	this.gene1 = gene1;
	this.gene2 = gene2;
}

function enclosure(infoMenu, enclosureMenu, males, females, problemcount, menuFight, menuBreed, menuMan, menuDone, infoContents, infoFight, infoBreed, infoMan, infoDone, rhinos){
	this.infoMenu = infoMenu;
	this.enclosureMenu = enclosureMenu;
	this.males = males;
	this.females = females;
	this.problemcount = problemcount;
	this.menuFight = menuFight;
	this.menuBreed = menuBreed;
	this.menuMan = menuMan;
	this.menuDone = menuDone;
	this.infoContents = infoContents;
	this.infoFight = infoFight;
	this.infoBreed = infoBreed;
	this.infoMan = infoMan;
	this.infoDone = infoDone;
	this.rhinos = rhinos;

	this.maleCount = 0;
	this.femaleCount = 0;
	this.inbreeding = false;
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
	console.log("click");
	//set the correct menu to open
	if (openMenu!= null){
		enclosures[openMenu].enclosureMenu.style.display = "none";
	}
	openMenu = menuToOpen;
	enclosures[openMenu].enclosureMenu.style.display = "block";
	gameState = "menu";
	updateUI();
}

function closeEnclosureMenu(){
	//Put rhinos in selection backinto enclosure
	gameState = "play";
	updateUI();
}