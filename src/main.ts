import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import Particle from './particle';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { cursorTo } from 'readline';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 5,
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
let numPar : number = 30.0;
let mass: number = 50.0; 

function loadScene() {
  particles = new Array<Particle>();
  square = new Square();
  square.create();
  SetUpScene();
}

function SetUpScene() {
  offsetsArray = [];
  colorsArray = [];

  // Set up particles here. Hard-coded example data for now
  for(let i = 0; i < numPar; i++) {
    for(let j = 0; j < numPar; j++) {
      var rand1 = Math.random() * 5;
      var rand2 = Math.random() * 10;
      var rand3 = Math.random() * 5;

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

  camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
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
    //console.log(offsetsArray.length); 

    //update particles
    for(var i = 1; i < particles.length; ++i) {
      let particle : Particle = particles[i];
      particle.update(dT);
      //console.log(particle.curr_pos);

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

function rayMouse(event: MouseEvent) {
  console.log(event.button);
  
  //mouse position
  var mouseX = event.x;
  var mouseY = event.y;

  //user position
  var viewerPos = vec3.fromValues(mouseX, mouseY, camera.position[2]);
  console.log("camera" + viewerPos);

  //ray position on 0,0,0 plane
  var rayPos = vec3.fromValues(mouseX, mouseY, 0);
  console.log("point" + rayPos);

  //cast ray from this point to plane
  var rayCast = vec3.create();
  vec3.subtract(rayCast, viewerPos, rayPos);

  //left mouse click
  //attract
  if(event.button === 0) {

  } else {
    
  }

}

function removeMouse(event:MouseEvent) {

}

main();
