import * as THREE from 'three';
import * as ThreeMeshUI from 'three-mesh-ui';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as ZapparThree from "@zappar/zappar-threejs";
import html2canvas from 'html2canvas';


export default () => {
    // Set up three.js in the usual way
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer({
        antialias: true,
    });
    document.body.appendChild(renderer.domElement);

    let effect = new StereoEffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

    // Main UI Element
    let mainUIElement = document.getElementById('main');
    if (!mainUIElement) return;

    html2canvas(mainUIElement).then((canvas) => {
        let canvasTexture: THREE.CanvasTexture;
        const originalCanvas = document.getElementById('canvas-texture') as HTMLCanvasElement;
        const imgData = canvas.toDataURL('image/png');
        
        var img = new Image();

        const ctx = originalCanvas.getContext('2d');

        if(!ctx) return;

        img.onload = function() {
        ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        };
        img.src = imgData;
        ctx.canvas.width = 400;
        ctx.canvas.height = 100;
        canvasTexture = new THREE.CanvasTexture(canvas);

        if (UI) {
            UI.material.map = canvasTexture;
            UI.material.needsUpdate = true;
            UI.material.color = new THREE.Color('white');
        }
    });

    // Looking Down HTML ELement
    let lookDown = document.getElementById('gui');
    if (!lookDown) return;

    html2canvas(lookDown).then((canvas) => {
        let canvasTexture: THREE.CanvasTexture;
        const originalCanvas = document.getElementById('canvas-texture') as HTMLCanvasElement;
        const imgData = canvas.toDataURL('image/png');
        
        var img = new Image();

        const ctx = originalCanvas.getContext('2d');

        if(!ctx) return;

        img.onload = function() {
          ctx.drawImage(img, 0, 0); // Or at whatever offset you like
        };
        img.src = imgData;
        ctx.canvas.width = 400;
        ctx.canvas.height = 100;
        canvasTexture = new THREE.CanvasTexture(canvas);

        if (plane) {
            plane.material.map = canvasTexture;
            plane.material.needsUpdate = true;
            plane.material.color = new THREE.Color('white');
        }
    });

    // const canvasTexture = () => {

    // };

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight)
    // The Zappar library needs the WebGL context to process camera images
    // Use this function to set your context
    ZapparThree.glContextSet(renderer.getContext());

    // Create a camera and set the scene background to the camera's backgroundTexture
    const zapparCamera =  new ZapparThree.Camera();
    zapparCamera.backgroundTexture.encoding = THREE.sRGBEncoding;
    scene.background = zapparCamera.backgroundTexture
    // Request camera permissions and start the camera
    ZapparThree.permissionRequestUI().then(granted => {
        console.log('permissions')
        if (granted) zapparCamera.start();
        else ZapparThree.permissionDeniedUI();
    });

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

    const controls = new OrbitControls( camera, renderer.domElement );

    //controls.update() must be called after any manual changes to the camera's transform
    controls.update();
    
    camera.position.z = 5
    // Set up a tracker, in this case an world tracker
    let instantWorldTracker = new ZapparThree.InstantWorldTracker();
    instantWorldTracker.setAnchorPoseFromCameraOffset(0, 0, 0);
    let instantWorldAnchorGroup = new ZapparThree.InstantWorldAnchorGroup(zapparCamera, instantWorldTracker);

    scene.add(instantWorldAnchorGroup);

    //Raycaster

    const raycaster = new THREE.Raycaster();
    const centrePoint = new THREE.Vector2(window.innerWidth/2, window.innerHeight/2);
    


    // Plane - CanvasTexture
    let planeMaterial = new THREE.MeshBasicMaterial({
        color: "purple",
    });
    let planeGeometry = new THREE.PlaneGeometry(4, 1, 4, 4);
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = 'lookDown';
    plane.position.set(0, -2, -1);
    plane.rotateX(Math.PI * -0.1);

    // Plane - CanvasTexture
    let UIMaterial = new THREE.MeshBasicMaterial({
        color: "purple",
    });
    let UIGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
    let UI = new THREE.Mesh(UIGeometry, UIMaterial);
    UI.name = 'userInterface';
    UI.position.set(0, 1, -2);
    //UI.rotateX(Math.PI * 0.5);
    
    // scene is a THREE.Scene (see three.js)
    instantWorldAnchorGroup.add(UI);
    instantWorldAnchorGroup.add(plane);

    // Place any 3D content you'd like tracked from the image into the trackerGroup

    function animate() {
        // Ask the browser to call this function again next frame
        requestAnimationFrame(animate);

        // The Zappar camera should have updateFrame called every frame
        zapparCamera.updateFrame(renderer);

        // update the picking ray with the camera and pointer position
	    raycaster.setFromCamera( new THREE.Vector2(), camera );

        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects( scene.children );

        console.log(intersects);

        for ( let i = 0; i < intersects.length; i ++ ) {
            if (intersects[i].object.name === 'lookDown') {
                console.log('look')
                intersects[i].object.material.color = new THREE.Color('red');
            }
        }

        effect.render(scene, camera);
        ThreeMeshUI.update();
        controls.update();
    }
    
    window.addEventListener("resize",() => {
       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.setPixelRatio( window.devicePixelRatio );
    })

    // Start things off
    animate();
}