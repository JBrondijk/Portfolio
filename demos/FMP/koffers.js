const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener("DOMContentLoaded",()=>{
	const start = async () => {
		const mindarThree = new window.MINDAR.IMAGE.MindARThree({
			container: document.querySelector("#myARcontainer"),
			imageTargetSrc: "./files/cheetah.mind",
			uiLoading: "no",
			uiScanning: "no"
		})
		const {renderer, scene, camera} = mindarThree;

		const geomerty = new THREE.PlaneGeometry(1,1);
		const material = new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.5});
		const plane = new THREE.Mesh(geomerty, material);

		const anchor = mindarThree.addAnchor(0);
		anchor.group.add(plane); //Build scene here.

		//on target found
		anchor.onTargetFound = () => {
			
		}
		
		//on target lost
		anchor.onTargetLost = () => {
			
		}

		await mindarThree.start();

		renderer.setAnimationLoop(()=>{
			renderer.render(scene,camera);
		});
	}
	start();
});



document.getElementById("btnStart").onclick = function(){
	startMenu.style.display = "none";
	warningMessage.style.display = "block";
