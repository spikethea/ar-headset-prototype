import * as THREE from 'three';
import * as ThreeMeshUI from 'three-mesh-ui';
import { StereoEffect } from 'three/examples/jsm/effects/StereoEffect';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { DeviceOrientationControls } from './DeviceOrientationControls.js';
import * as ZapparThree from "@zappar/zappar-threejs";
import html2canvas from 'html2canvas';


export default () => {
    // Set up three.js in the usual way
    let scene = new THREE.Scene();
    let renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);

    let effect = new StereoEffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

    let gui = document.getElementById('gui');
    let canvasTexture: THREE.CanvasTexture;

    if (!gui) return;

    html2canvas(gui).then((canvas) => {
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


    renderer.setSize(window.innerWidth, window.innerHeight)
    // The Zappar library needs the WebGL context to process camera images
    // Use this function to set your context
    ZapparThree.glContextSet(renderer.getContext());

    // Create a camera and set the scene background to the camera's backgroundTexture
    const zapparCamera =  new ZapparThree.Camera();
    zapparCamera.backgroundTexture.encoding = THREE.sRGBEncoding;
    scene.background = zapparCamera.backgroundTexture
    // Request camera permissions and start the camera
    ZapparThree.permissionRequest().then(granted => {
        if (granted) zapparCamera.start();
        else ZapparThree.permissionDeniedUI();
    });

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

    const controls = new (DeviceOrientationControls as any) ( camera, renderer.domElement );

    //controls.update() must be called after any manual changes to the camera's transform
    controls.update();
    
    camera.position.z = 5
    // Set up a tracker, in this case an world tracker
    let instantWorldTracker = new ZapparThree.InstantWorldTracker();
    instantWorldTracker.setAnchorPoseFromCameraOffset(0, 0, 0);
    let instantWorldAnchorGroup = new ZapparThree.InstantWorldAnchorGroup(zapparCamera, instantWorldTracker);

    scene.add(instantWorldAnchorGroup);
    


    // Plane - CanvasTexture
    let planeMaterial = new THREE.MeshBasicMaterial({
        color: "purple",
    });
    let planeGeometry = new THREE.PlaneGeometry(4, 1, 4, 4);
    let plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -2, -1);
    plane.rotateX(Math.PI * -0.1);

    // Button Three MEsh UI
    const container = new ThreeMeshUI.Block({
        width: 5,
        height: 1.5,
        padding: 0.2,
        backgroundColor: new THREE.Color('white'),
        fontFamily: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.json',
		fontTexture: 'https://unpkg.com/three-mesh-ui/examples/assets/Roboto-msdf.png'
       });
    
    //
    
    const text = new ThreeMeshUI.Text({
    content: "Some text to be displayed",
    fontSize: 0.12,
    fontColor: new THREE.Color('black')
    });
    
    container.add( text );
    
    // scene is a THREE.Scene (see three.js)
    instantWorldAnchorGroup.add( container );

    // instantWorldAnchorGroup.add(cube);
    instantWorldAnchorGroup.add(plane);

    // Place any 3D content you'd like tracked from the image into the trackerGroup

    function animate() {
        // Ask the browser to call this function again next frame
        requestAnimationFrame(animate);

        // The Zappar camera should have updateFrame called every frame
        zapparCamera.updateFrame(renderer);

        effect.render(scene, camera);
        ThreeMeshUI.update();
        controls.update();
    }
    
    window.addEventListener("resize",() => {
       renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // Start things off
    animate();
}