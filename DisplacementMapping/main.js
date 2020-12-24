onload = init

var canvas;
var gl;
var M,V,P;
var pi = 3.1415926;
var n = 5;
var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];
var index = 0;
var program;
var lE = vec4(0.7, 0.7, 0.7, 1.0);
var lightDirection = vec4(-1.0, -1.0, -1.0, 1.0);
var lightDirU, lEU, reflectiveU, eyePosU, materialU, displacement_scaleU, displacement_biasU;
var toggle = 1;
var r = 5;
var g_tex_ready = 0;
var texture0, texture1, texture2, texture3;
var currentAngle = [0.0, 0.0];
var dragging = false;         // Dragging or not
var lastX = -1, lastY = -1;   // Last position of the mouse
var qrot, qinc;
var noise_scaleU;

function render()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  if(g_tex_ready == 11)
  {
    var model_mat = translate(0.0, 0.0, 0.0);
    var up = qrot.apply(vec3(0, 1, 0));
  var rot_eye = qrot.apply(vec3(0, 0, r));
  var view_mat = lookAt(vec3(rot_eye[0], rot_eye[1], rot_eye[2]), vec3(0, 0, 0), vec3(up[0], up[1], up[2]));

/*
  var view_mat = lookAt(vec3(r*Math.sin(alpha), 1, r * Math.cos(alpha)), //eye
                        vec3(0, 1, 0), //looking at
                        vec3(0, 1, 0)); //up
*/
  var persp_mat = perspective(45, 1, 1, 100);
  gl.uniformMatrix4fv(M, false, flatten(model_mat));
  gl.uniformMatrix4fv(V, false, flatten(view_mat));
  gl.uniformMatrix4fv(P, false, flatten(persp_mat));

  gl.uniformMatrix4fv(normal_mat, false, flatten(transpose(inverse(model_mat))));
  gl.uniformMatrix4fv(texM, false, flatten(mat4()));
  gl.uniform3fv(eyePosU, flatten(vec3(rot_eye[0], rot_eye[1], rot_eye[2])));

  gl.uniform4fv(lightDirU, flatten(lightDirection));
  gl.uniform4fv(lEU, flatten(lE));

  gl.uniform1i(reflectiveU, 1);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);

  //Draw water
  gl.uniform1i(materialU, 1);
  gl.drawArrays(gl.TRIANGLE_FAN, index, 4);//(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.uniform1i(reflectiveU, 2);
  gl.uniform1i(materialU, 2);
  gl.drawArrays(gl.TRIANGLES, 0, index);//(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);

  gl.uniform1i(materialU, 0);

  gl.uniformMatrix4fv(M, false, flatten(mat4()));
  gl.uniformMatrix4fv(V, false, flatten(mat4()));
  gl.uniformMatrix4fv(P, false, flatten(mat4()));
  gl.uniformMatrix4fv(normal_mat, false, flatten(mat4()));

  var V_mat = mat3()
  for(i = 0; i < 3; i++)
  {
    for(j = 0; j  < 3; j++)
    {
      V_mat[i][j] = view_mat[i][j]
    }
  }
  var V_inv = inverse(V_mat)
  var V_final = mat4()
  for(i = 0; i < 3; i++)
  {
    for(j = 0; j < 3; j++)
    {
      V_final[i][j] = V_inv[i][j];
    }
  }
  V_final[3][3] = 0

  var tex_mat = mult(V_final, inverse(persp_mat))

  gl.uniformMatrix4fv(texM, false, flatten(tex_mat));
  gl.uniform1i(reflectiveU, 0);
  gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture0);
  gl.drawArrays(gl.TRIANGLE_FAN, index+4, 4);

}
  requestAnimFrame(render);
}



function triangle(a, b, c)
{
  normalsArray.push(a);
  normalsArray.push(b);
  normalsArray.push(c);

  pointsArray.push(a);
  pointsArray.push(b);
  pointsArray.push(c);

  texCoordsArray.push(vec2(1-Math.atan2(a[2], a[0])/(2*pi), Math.acos(a[1])/pi) );
  texCoordsArray.push(vec2(1-Math.atan2(b[2], b[0])/(2*pi), Math.acos(b[1])/pi) );
  texCoordsArray.push(vec2(1-Math.atan2(c[2], c[0])/(2*pi), Math.acos(c[1])/pi) );
/*
  edge1 = subtract(pos2, pos1);
  edge2 = subtract(pos3, pos1);
  deltaUV1 = subtract(vec2(1-Math.atan2(b[2], b[0])/(2*pi), Math.acos(b[1])/pi), vec2(1-Math.atan2(a[2], a[0])/(2*pi), Math.acos(a[1])/pi));
  deltaUV2 = subtract(vec2(1-Math.atan2(c[2], c[0])/(2*pi), Math.acos(c[1])/pi), vec2(1-Math.atan2(a[2], a[0])/(2*pi), Math.acos(a[1])/pi) );
  tangent1 = vec3();
  bitangent1 = vec3();

  f = 1.0 / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

  tangent1.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
  tangent1.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
  tangent1.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
  tangent1 = normalize(tangent1);

  bitangent1.x = f * (-deltaUV2.x * edge1.x + deltaUV1.x * edge2.x);
  bitangent1.y = f * (-deltaUV2.x * edge1.y + deltaUV1.x * edge2.y);
  bitangent1.z = f * (-deltaUV2.x * edge1.z + deltaUV1.x * edge2.z);
  bitangent1 = normalize(bitangent1);*/

  index += 3;
}

function divideTriangle(a, b, c, count)
{
  if(count > 0)
  {
    var ab = normalize(mix(a, b, 0.5), true);
    var ac = normalize(mix(a, c, 0.5), true);
    var bc = normalize(mix(b, c, 0.5), true);
    divideTriangle(a, ab, ac, count-1);
    divideTriangle(ab, b, bc, count-1);
    divideTriangle(bc, c, ac, count-1);
    divideTriangle(ab, bc, ac, count-1);
  }
  else
  {
    triangle(a, b, c);
  }
}

function tetrahedron(a, b, c, d, n)
{
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

function initSphere(gl, numSubdivs, program)
{
  index = 0;
  var va = vec4(0.0, 0.0, 1.0, 1.0);
  var vb = vec4(0.0, 0.942809, -0.333333, 1);
  var vc = vec4(-0.816497, -0.471405, -0.333333, 1);
  var vd = vec4(0.816497, -0.471405, -0.333333, 1);
  pointsArray = [];

  tetrahedron(va, vb, vc, vd, numSubdivs);

  if(gl.vBuffer != null)
  {
    gl.deleteBuffer(gl.vBuffer);
    gl.deleteBuffer(gl.nBuffer);
  }

}

function init_textures(gl)
{

  var cubemap = ['textures/brightday2_posx.png', // POSITIVE_X
  'textures/brightday2_negx.png', // NEGATIVE_X
  'textures/brightday2_posy.png', // POSITIVE_Y
  'textures/brightday2_negy.png', // NEGATIVE_Y
  'textures/brightday2_posz.png', // POSITIVE_Z
  'textures/brightday2_negz.png']; // NEGATIVE_Z

  var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture6 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE6);
  gl.bindTexture(gl.TEXTURE_2D, texture6);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "waterdiffuseMap");
  gl.uniform1i(sampler, 6);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/water_diffuse.jpg';

var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture5 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, texture5);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "waterdisplacementMap");
  gl.uniform1i(sampler, 5);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/water_displacement.jpg';

var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture4 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE4);
  gl.bindTexture(gl.TEXTURE_2D, texture4);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "displacementMap");
  gl.uniform1i(sampler, 4);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/brick_displacement.jpg';

var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture3 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE3);
  gl.bindTexture(gl.TEXTURE_2D, texture3);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "normalMap");
  gl.uniform1i(sampler, 3);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/brick_normal.jpg';

//load sphere texture
var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE2);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "sphereTex");
  gl.uniform1i(sampler, 2);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/brick.jpg';

//load bump mapping
var image = document.createElement('img');
image.crossorigin = 'anonymous';

image.onload = function (event)
{
  texture1 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texture1);
  var image = event.target;

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  sampler = gl.getUniformLocation(gl.program, "sphereMap");
  gl.uniform1i(sampler, 1);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  ++g_tex_ready;
};

image.src = 'textures/water_normal.jpg';
  texture0 = gl.createTexture();

  //gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, true);
  for(var i = 0; i < 6; ++i) {
    var image = document.createElement('img');
    image.crossorigin = 'anonymous';
    image.textarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    image.onload = function (event)
    {
      var image = event.target;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture0);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.uniform1i(gl.getUniformLocation(gl.program, "texMap"), 0);
      gl.texImage2D(image.textarget, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      ++g_tex_ready;
    };
    image.src = cubemap[i];
 }
}

function project_to_sphere(x, y) {
  var r = 2;
  var d = Math.sqrt(x * x + y * y);
  var t = r * Math.sqrt(2);
  var z;
  if (d < r) // Inside sphere
    z = Math.sqrt(r * r - d * d);
  else if (d < t)
    z = 0;
  else       // On hyperbola
    z = t * t / d;
  return z;
}


function initEventHandlers(canvas) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  canvas.onmousedown = function (ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a mouse is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function (ev) {
    qinc.setIdentity();
    dragging = false;
  }; // Mouse is released

  canvas.onmousemove = function (ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var rect = ev.target.getBoundingClientRect();
      var s_x = ((x - rect.left) / rect.width - 0.5) * 2;
      var s_y = 0;//(0.5 - (y - rect.top) / rect.height) * 2;
      var s_last_x = ((lastX - rect.left) / rect.width - 0.5) * 2;
      var s_last_y = 0;//(0.5 - (lastY - rect.top) / rect.height) * 2;
      var v1 = vec3(s_x, s_y, project_to_sphere(s_x, s_y));
      var v2 = vec3(s_last_x, s_last_y, project_to_sphere(s_last_x, s_last_y));
      qinc = qinc.make_rot_vec2vec(normalize(v1), normalize(v2));
      qrot = qrot.multiply(qinc);
    }
    lastX = x, lastY = y;
  };
}

function init()
{
  canvas = document.getElementById("c");
  var increaseButton = document.getElementById("increase_button");
  var decreaseButton = document.getElementById("decrease_button");
  var toggleButton = document.getElementById("toggle_button");

  //setup WebGL using the setupWebGL function from Angel's Utilities
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" );}
  program = initShaders(gl, "vertex-shader", "fragment-shader");

  var disp_slider = document.getElementById("displacement_scale_slide");
  disp_slider.oninput = function() {
    gl.uniform1f(displacement_scaleU, this.value);
  }

  var disp_bias_slider = document.getElementById("displacement_bias_slide");
  disp_bias_slider.oninput = function() {
    gl.uniform1f(displacement_biasU, this.value);
  }
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);

  gl.program = program;
  init_textures(gl);

  //clear the screen with blue
  gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //setup a vBuffer attribute for gl
  gl.vBuffer = null;
  gl.nBuffer = null;
  //gl.tBuffer = null;
  //setup the vertices and colours

  initSphere(gl, n, program);
  pointsArray.push(vec4(-1000.0, -1.0, -2000.0, 1.0))
  pointsArray.push(vec4(1000.0, -1.0, -2000.0, 1.0))
  pointsArray.push(vec4(1000.0, -1.0, 2000.0, 1.0))
  pointsArray.push(vec4(-1000.0, -1.0, 2000.0, 1.0))

  normalsArray.push(vec4(-100.0, -1.0, -100.0, 1.0))
  normalsArray.push(vec4(100.0, -1.0, -100.0, 1.0))
  normalsArray.push(vec4(100.0, -1.0, 100.0, 1.0))
  normalsArray.push(vec4(-100.0, -1.0, 100.0, 1.0))

  pointsArray.push(vec4(-1.0, -1.0, 0.999, 1.0))
  pointsArray.push(vec4(1.0, -1.0, 0.999, 1.0))
  pointsArray.push(vec4(1.0, 1.0, 0.999, 1.0))
  pointsArray.push(vec4(-1.0, 1.0, 0.999, 1.0))
  normalsArray.push(vec4(-1.0, -1.0, 0.999, 1.0))
  normalsArray.push(vec4(1.0, -1.0, 0.999, 1.0))
  normalsArray.push(vec4(1.0, 1.0, 0.999, 1.0))
  normalsArray.push(vec4(-1.0, 1.0, 0.999, 1.0))

  console.log(pointsArray.length)
  texCoordsArray.push(vec2(0.0, 0.0))
  texCoordsArray.push(vec2(500.0, 0.0))
  texCoordsArray.push(vec2(500.0, 500.0))
  texCoordsArray.push(vec2(0.0, 500.0))

  texCoordsArray.push(vec2(0.0, 0.0))
  texCoordsArray.push(vec2(1.0, 0.0))
  texCoordsArray.push(vec2(1.0, 1.0))
  texCoordsArray.push(vec2(0.0, 1.0))

/*var tex_coords =
[
  vec2(0.0, 0.0),
  vec2(1.0, 0.0),
  vec2(1.0, 1.0),
  vec2(0.0, 1.0),

  vec2(0.0, 0.0),
  vec2(1.0, 0.0),
  vec2(1.0, 1.0),
  vec2(0.0, 1.0),

];*/
  var t_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, t_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.DYNAMIC_DRAW);

  var tex_coords = gl.getAttribLocation(program, "a_texCoord");
  gl.vertexAttribPointer(tex_coords, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(tex_coords);

  gl.vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "v_Position");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

  var vNormal = gl.getAttribLocation(program, "v_Normal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);
  qrot = new Quaternion();
  qinc = new Quaternion();
  initEventHandlers(canvas);


  M = gl.getUniformLocation(program, "model_mat")
  V = gl.getUniformLocation(program, "view_mat")
  P = gl.getUniformLocation(program, "persp_mat")
  texM = gl.getUniformLocation(program, "tex_mat")
  normal_mat = gl.getUniformLocation(program, "normal_mat");
  lightDirU = gl.getUniformLocation(program, "light_dir");
  lEU = gl.getUniformLocation(program, "lE");
  reflectiveU = gl.getUniformLocation(program, "reflective");
  eyePosU = gl.getUniformLocation(program, "eye_pos");
  displacement_scaleU = gl.getUniformLocation(program, "displacement_scale");
  displacement_biasU = gl.getUniformLocation(program, "displacement_bias");

  materialU = gl.getUniformLocation(program, "material");
  gl.uniform1f(displacement_scaleU, 0.1);
  gl.uniform1f(displacement_biasU, 0.0);

  render()
}
