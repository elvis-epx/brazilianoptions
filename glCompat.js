// Code based on "WebGL Lessons", http://learningwebgl.com


var gl;

function initGL()
{
    var canvas = document.getElementById("arena");

    try {
        gl = canvas.getContext("webkit-3d");
    } catch (e) {
        // pass
    }

    if (!gl) {
        try {
            gl = canvas.getContext("experimental-webgl");
        } catch (e) {
            // pass
        }
    }

    if (!gl) {
        try {
            gl = canvas.getContext("moz-webgl");
        } catch (e) {
            // pass
        }
    }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
        return;
    }

    // This temporary code provides support for Google Chrome, which
    // as of 30 Nov 2009 does not support the new names for the
    // functions to get shader/program parameters (among other things).
    // It should be unnecessary soon, and is only a partial fix
    // in the meantime (as, for example, there's no way to get shader
    // or program parameters that are vectors of integers).
    // See http://learningwebgl.com/blog/?p=1082 for details.
    if (!gl.getProgramParameter) {
        gl.getProgramParameter = gl.getProgrami
    }
    if (!gl.getShaderParameter) {
        gl.getShaderParameter = gl.getShaderi
    }
    // End of Chrome compatibility code
}

var mvMatrix;
var mvMatrixStack = [];

function mvPushMatrix(m)
{
    if (m) {
        mvMatrixStack.push(m.dup());
        mvMatrix = m.dup();
    } else {
        mvMatrixStack.push(mvMatrix.dup());
    }
}

function mvPopMatrix()
{
    if (mvMatrixStack.length == 0)
        throw "Invalid popMatrix!";
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
}

function loadIdentity()
{
    mvMatrix = Matrix.I(4);
}

function multMatrix(m)
{
    mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v)
{
    var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

function mvRotate(ang, v)
{
    var arad = ang * Math.PI / 180.0;
    var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
}

var pMatrix;

function perspective(fovy, aspect, znear, zfar)
{
    pMatrix = makePerspective(fovy, aspect, znear, zfar)
}

function getShader(gl, id)
{
    var str = "";

    var shader;

    if (id == "fshader") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (id == "vshader") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    var request = new XMLHttpRequest();
    request.open("GET", "estudo3d." + id, false);
    request.send();
    str = request.responseText;

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

