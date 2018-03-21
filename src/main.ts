import {vec3, vec4, mat3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';

import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';

import Mesh from './geometry/Mesh';
import Flower from './geometry/Flower';
import Square from './geometry/Square';

import Particle from './particle';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { cursorTo } from 'readline';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
  meshes: ['flower'],
  'Load Scene': loadScene, // A function pointer, essentially
};

let particles: Array<Particle>;
let offsetsArray: Array<number>;
let colorsArray: Array<number>;
let camera: Camera;

let offsets: Float32Array;
let colors: Float32Array;

let square: Square;
let time: number = 0.0;
let numPar : number = 100.0;
let mass: number = 70.0; 

let mouseX : number;
let mouseY : number;
let point: vec3 = vec3.create();
let repelled: boolean;
let attracted: boolean;

//mesh
let mesh : Mesh;
let flower : Flower;

// Add controls to the gui
const gui = new DAT.GUI();
//gui.addColor(controls, 'color');
gui.add(controls, 'meshes', ['flower', 'coral', 'tree', 'dragon', 'voltron']);
gui.add(controls, 'Load Scene');

function loadScene() {
  particles = new Array<Particle>();
  square = new Square();
  flower = new Flower();
  mesh = new Mesh();

  square.create();
  SetUpScene();
}

function SetUpScene() {
  offsetsArray = [];
  colorsArray = [];

  // Set up particles here. Hard-coded example data for now
  for(let i = 0; i < numPar; i++) {
    for(let j = 0; j < numPar; j++) {
      var rand1 = Math.random() * 40;
      var rand2 = Math.random() * 40;
      var rand3 = Math.random() * 40;

      var position = vec3.fromValues(rand1, rand2, rand3);
      var velocity = vec3.fromValues(0,0,0);
      var acceleration = vec3.fromValues(0,0,0);
      var offset = vec3.fromValues(rand1, rand1, rand1);
      var color = vec4.fromValues(255/255, 255/255, 255/255, 1.0); //white
      let particle = new Particle(position, velocity, offset, color, acceleration, mass);

      //add particle to array of particles
      particles.push(particle);

      offsetsArray.push(i);
      offsetsArray.push(j);
      offsetsArray.push(0);

      colorsArray.push(color[0]);
      colorsArray.push(color[1]);
      colorsArray.push(color[2]);
      colorsArray.push(1.0); // Alpha channel
    }
  }
  //console.log(offsetsArray.length);

  let offsets: Float32Array = new Float32Array(offsetsArray);
 // console.log(offsets.length);
  let colors: Float32Array = new Float32Array(colorsArray);
  square.setInstanceVBOs(offsets, colors);
  square.setNumInstances(numPar * numPar); // 10x10 grid of "particles"
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  //set up particles
  loadScene();

  camera = new Camera(vec3.fromValues(0, 0, 150), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.1, 0.1, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const particularShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/particle-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/particle-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {      
    camera.update();

    stats.begin(); //fps
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, particularShader, [square]);
    stats.end();

    //time update
    var oldTime = time;
    time++;
    particularShader.setTime(time);
    var dT = oldTime - time; 
    //update 
    //console.log(point); 

    //update particles
    for(var i = 1; i < particles.length; ++i) {
      let particle : Particle = particles[i];
      //console.log(particle.curr_pos);

      //if force of attraction happens
      if(attracted === true) {
        var dist = vec3.distance(point, particle.curr_pos);
        if(dist < 50) {
          console.log("attracted is true");
          let ray : vec3 = vec3.create();                    
          //get directional ray from current position 
          vec3.subtract(ray, particle.curr_pos, point);
          vec3.scale(ray, ray, -1); //negate
          vec3.normalize(ray, ray);
          //particle.curr_vel = (ray);
          vec3.scale(ray, ray, 10);
          vec3.scale(particle.curr_vel, particle.curr_vel, 0.2);
          particle.applyForce(ray);
        }
        //particle.curr_vel = vec3.fromValues(0.2,0.2,0);
      }

      //if repelling attraction happens
      if(repelled === true) {
        var dist = vec3.distance(point, particle.curr_pos);
        if(length < 20) {
            console.log("repel is true");
            let ray : vec3 = vec3.create();                    
            vec3.subtract(ray, particle.curr_pos, point);
            vec3.scale(ray, ray, 1); //negate
            vec3.normalize(ray, ray);
            //particle.curr_vel = (ray);
            vec3.scale(ray, ray, 10);
            vec3.scale(particle.curr_vel, particle.curr_vel, 2.2);
            particle.applyForce(ray);
          }
        // console.log("newAcc:" + particle.acceleration);
        }

        //particle.curr_vel = vec3.fromValues(0.2,0.2,0);
      
      particle.update(dT);

      offsetsArray[i * 3] = particle.curr_pos[0];
      offsetsArray[i * 3 + 1] = particle.curr_pos[1];
      offsetsArray[i * 3 + 2] = particle.curr_pos[2];
   
      colorsArray[i * 4] = particle.color[0];
      colorsArray[i * 4 + 1] = particle.color[1];
      colorsArray[i * 4 + 2] = particle.color[2];
      colorsArray[i * 4 + 3] = particle.color[3];
    }

    //update Square 
    offsets = new Float32Array(offsetsArray);
    colors = new Float32Array(colorsArray);
    square.setInstanceVBOs(offsets, colors);
    square.setNumInstances(numPar * numPar);

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  window.addEventListener("mousedown", rayMouse, false);
  window.addEventListener("mouseup", removeMouse, false);
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  //Start the render loop
  tick();
}

//check for mesh type
function meshLoad() {
  if(controls.meshes[0] === 'flower') {
      mesh.addFlower(flower);
  }
}

//calculate the point in screen from pixel
function screenToWorld() : vec3 {
  //2d Viewport Coordinates
  var x = (mouseX / window.innerWidth) * 2 - 1;
  var y = 1 - (mouseY / window.innerHeight) * 2;
  var z = 1;
  var angle = Math.tan(camera.fovy / 2.0);

  var ref = vec3.create();
  vec3.scale(ref, camera.forward, 150);
  vec3.add(ref, ref, camera.position);
  var lengthV = vec3.create();
  vec3.subtract(lengthV, ref, camera.position);
  var length = vec3.length(lengthV);

  var V = vec3.create();
  vec3.scale(V, camera.up, length * angle);

  var H = vec3.create();
  vec3.scale(H, camera.right, length * angle * camera.aspectRatio);

  var finalPos = vec3.create();
  
  var sXH = vec3.create();
  vec3.scale(sXH, H, x);
  
  var sYV = vec3.create();
  vec3.scale(sYV, V, y);

  vec3.add(finalPos, vec3.add(finalPos, ref, sXH), sYV);
  finalPos[2] = camera.target[2];
  console.log(finalPos);

  //3d NDC
  var ray_ndc = vec3.fromValues(x, y, z);

  //4d homogeneous clip coord
  var ray_clip = vec4.fromValues(ray_ndc[0], ray_ndc[1], -1, 1);

  //4d Eye Camera coord
  var invProj_Mat = mat4.create();
  mat4.invert(invProj_Mat, camera.projectionMatrix);
  vec4.transformMat4(ray_clip, ray_clip, invProj_Mat);

  var ray_eye = vec4.create();
  ray_eye = ray_clip;

  ray_eye = vec4.fromValues(ray_eye[0], ray_eye[1], -1, 1);

  //4d world coordinates
  //inverse view matrix
  var inverseView_Mat = mat4.create();
  mat4.invert(inverseView_Mat, camera.viewMatrix);

  var ray_wor4 = vec4.create();
  vec4.transformMat4(ray_wor4, ray_eye, inverseView_Mat);
  var ray_wor3 = vec3.fromValues(ray_wor4[0], ray_wor4[1], ray_wor4[2]);
  vec3.normalize(ray_wor3, ray_wor3);
  vec3.scale(ray_wor3, ray_wor3, vec3.length(camera.position));

  //ray_wor3[2] = camera.target[2];
  //console.log(ray_wor3);
 // console.log(ray_wor3);
  //vec3.scale(ray_wor3, ray_wor3, -1);

  return finalPos;

}

function removeMouse(event: MouseEvent) {
  console.log("removed mouse");
  repelled = false;
  attracted = false;
}

function rayMouse(event: MouseEvent) {  
  //mouse position
  mouseX = event.x;
  mouseY = event.y;
  point = screenToWorld();
  //vec3.scale(point, point, );
  
  if(event.button === 0) {
    console.log("attract mouse");
     attracted = true;
  } else {
    console.log("repel mouse");

      repelled = true;
  }
}

main();
