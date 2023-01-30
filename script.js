
var scene;
var camera;
var renderer;

function setupMainScene()
{
  scene = new THREE.Scene();
  var width = window.innerWidth;
  var height = window.innerHeight;
  camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
  camera.position.z = 2;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
}
setupMainScene();


var bufferScene;
var textureA;
var textureB;
var bufferMaterial;
var plane;
var bufferObject;
var finalMaterial;
var quad;
var colorizeMaterial;

var dA = 1.0;
var dB = 0.5;
var feed = 0.031;
var k = 0.057;

var brushSize = 30;
var clear = 0;
var iterations = 4;
var flow = 1.00;
var scale = 1.0;

var seedRandom = 0;
var seedScale = 0.01;
var seedThreshold = 0.9;

var color1 = new THREE.Color(255, 255, 0);
var color2 = new THREE.Color(255, 0, 0);
var color3 = new THREE.Color(0, 204, 255);

var brush = new Brush();


function setupBufferScene()
{
  bufferScene = new THREE.Scene();
  
  textureA = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { 
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearMipMapLinearFilter, 
    format: THREE.RGBAFormat,
    type: THREE.FloatType});

  textureB = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { 
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearMipMapLinearFilter, 
    format: THREE.RGBAFormat,
    type: THREE.FloatType} );

  // diffusion reaction shader
  bufferMaterial = new THREE.ShaderMaterial( {
    uniforms: {
      bufferTexture: { type: "t", value: textureA },
      res : {type: 'v2',value:new THREE.Vector2(window.innerWidth ,window.innerHeight)},
      brush: {type:'v3',value:new THREE.Vector3(0,0,0)},
      time: {type:'f', value:0.0},
      dA: {type:'f', value:dA},
      dB: {type:'f', value:dB},
      feed: {type:'f', value:feed},
      k: {type:'f', value:k},
      brushSize: {type:'f', value:brushSize},
      clear: {type:'i', value:clear},
      flow: {type:'f', value:flow},
      seedRandom: {type:'i', value:seedRandom},
      seedScale: {type:'f', value:seedScale},
      seedThreshold: {type:'f', value:seedThreshold}
     },
     fragmentShader: document.getElementById( 'fragShader' ).innerHTML
   } );

  plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight);
  bufferObject = new THREE.Mesh( plane, bufferMaterial );
  bufferScene.add(bufferObject);

  // colorize shader
  colorizeMaterial = new THREE.ShaderMaterial( {
    uniforms : {
      resolution : { type : 'v2', value : new THREE.Vector2( window.innerWidth, window.innerHeight) },
      texture : { type : 't', value : textureB, minFilter : THREE.NearestFilter },
      color1 : { type : 'c', value : new THREE.Color("rgb(0,0,255)") },
      color2 : { type : 'c', value : new THREE.Color("rgb(0,0,255)") },
      color3 : { type : 'c', value : new THREE.Color("rgb(0,0,255)") },
      scale : {type:'f', value:scale}
  },
    fragmentShader : document.getElementById( 'colorize' ).textContent
  } );

  plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight);
  quad = new THREE.Mesh( plane, colorizeMaterial );
  scene.add(quad);
}
setupBufferScene();

function clearScreen() { clear = 1; }
function seedScreen() { seedRandom = 1; }
  
// seedScreen();
setTimeout(seedScreen, 300);

// gui
var gui = new dat.GUI({load: presets });
gui.remember(this);
gui.remember(brush);

gui.addColor(this, "color1");
gui.addColor(this, "color2");
gui.addColor(this, "color3");
gui.add(this, "dA", 0.0, 1.0);
gui.add(this, "dB", 0.0, 1.0);
gui.add(this, "feed", 0.0, 0.1);
gui.add(this, "k", 0.0, 0.1);
gui.add(this, "flow", 1.0, 1.01);
gui.add(this, "brushSize", 1, 100);
gui.add(brush, "autoBrush");
var scaleControl = gui.add(this, "scale", 1.0, 4.0);
gui.add(this, "iterations", 1, 10).step(1);
gui.add(this, "clearScreen");
gui.add(this, "seedScale", 0.001, 0.01);
gui.add(this, "seedThreshold", 0.0, 0.9);
gui.add(this, "seedScreen");

scaleControl.onChange(function(value){
  quad.scale.set(scale, scale, scale);
});

gui.close();


window.addEventListener('resize', function() 
{
  var SW = window.innerWidth;
  var SH = window.innerHeight;
  renderer.setSize(SW, SH);

  camera.aspect = SW / SH;
  camera.updateProjectionMatrix();

  textureA.setSize(SW, SH);
  textureB.setSize(SW, SH);

  bufferMaterial.uniforms.res.value.x = SW;
  bufferMaterial.uniforms.res.value.y = SH;

  colorizeMaterial.uniforms.resolution.value.x = SW;
  colorizeMaterial.uniforms.resolution.value.y = SH;
});


function render() 
{
  requestAnimationFrame( render );

  brush.update();
  bufferMaterial.uniforms.brush.value.x = brush.x;
  bufferMaterial.uniforms.brush.value.y = brush.y;
  bufferMaterial.uniforms.brush.value.z = brush.isDown;

  for (var i=0; i<iterations; i++)
  {
     //Draw to textureB
     renderer.render(bufferScene,camera,textureB,true);

    //Swap textureA and B
    var t = textureA;
    textureA = textureB;
    textureB = t;
    quad.material.map = textureB;
    bufferMaterial.uniforms.bufferTexture.value = textureA;
  }

  // update uniforms
  bufferMaterial.uniforms.time.value += 0.1;
  bufferMaterial.uniforms.dA.value = dA;
  bufferMaterial.uniforms.dB.value = dB;
  bufferMaterial.uniforms.feed.value = feed;
  bufferMaterial.uniforms.k.value = k;
  bufferMaterial.uniforms.brushSize.value = brushSize;
  bufferMaterial.uniforms.clear.value = clear;
  bufferMaterial.uniforms.flow.value = flow;
  bufferMaterial.uniforms.seedRandom.value = seedRandom;
  bufferMaterial.uniforms.seedScale.value = seedScale;
  bufferMaterial.uniforms.seedThreshold.value = seedThreshold;

  colorizeMaterial.uniforms.color1.value.r = color1.r/255;
  colorizeMaterial.uniforms.color1.value.g = color1.g/255;
  colorizeMaterial.uniforms.color1.value.b = color1.b/255;

  colorizeMaterial.uniforms.color2.value.r = color2.r/255;
  colorizeMaterial.uniforms.color2.value.g = color2.g/255;
  colorizeMaterial.uniforms.color2.value.b = color2.b/255;

  colorizeMaterial.uniforms.color3.value.r = color3.r/255;
  colorizeMaterial.uniforms.color3.value.g = color3.g/255;
  colorizeMaterial.uniforms.color3.value.b = color3.b/255;

  colorizeMaterial.uniforms.scale.value = scale;
  
  clear = 0;
  seedRandom = 0;

  renderer.render( scene, camera );
}
render();