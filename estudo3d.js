// Code based on "WebGL Lessons", http://learningwebgl.com

var shaderProgram;
var tvertex;
var tcolor;

function initShaders()
{
    var fragmentShader = getShader(gl, "fshader");
    var vertexShader = getShader(gl, "vshader");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (! gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    tvertex = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(tvertex);

    tcolor = gl.getAttribLocation(shaderProgram, "aColor");
    gl.enableVertexAttribArray(tcolor);
}

function setMatrixUniforms()
{
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(pMatrix.flatten()));

    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

var currentlyPressedKey = 0;
var acceptedKeys = {};
acceptedKeys[33] = true;
acceptedKeys[34] = true;
acceptedKeys[37] = true;
acceptedKeys[38] = true;
acceptedKeys[39] = true;
acceptedKeys[40] = true;

var clearKeyTimer = null;

function handleKeyDown(event)
{
    if (acceptedKeys[event.keyCode]) {
        currentlyPressedKey = event.keyCode;
        return false;
    }
    if (clearKeyTimer) {
        clearTimeout(clearKeyTimer);
        clearKeyTimer = null;
    }
    clearKeyTimer = setTimeout(clearKeys, 1000);
}

function handleKeyPress(event)
{
    return handleKeyDown(event);
}

function handleKeyUp(event)
{
    if (acceptedKeys[event.keyCode]) {
        clearKeys();
    }
}

function clearKeys()
{
    currentlyPressedKey = 0;
    return false;
}

var pitch, pitchRate, yaw, yawRate, xPos, yPos, zPos, speed;

resetCamera();

function resetCamera()
{
    pitch = -15;
    pitchRate = 0;

    yaw = 0;
    yawRate = 0;

    xPos = 0;
    yPos = 10;
    zPos = 30;

    speed = 0;
}

function handleKeys()
{
    if (currentlyPressedKey == 33) {
        // Page Up
        pitchRate = 0.1;
    } else if (currentlyPressedKey == 34) {
        // Page Down
        pitchRate = -0.1;
    } else {
        pitchRate = 0;
    }

    if (currentlyPressedKey == 37) {
        // Left cursor key 
        yawRate = 0.1;
    } else if (currentlyPressedKey == 39) {
        // Right cursor key
        yawRate = -0.1;
    } else {
        yawRate = 0;
    }

    if (currentlyPressedKey == 38) {
        // Up cursor key 
        speed = 0.03;
    } else if (currentlyPressedKey == 40) {
        // Down cursor key
        speed = -0.03;
    } else {
        speed = 0;
    }
}

var vertices;
var chart;

var vertices_colors;
var chart_colors;

/*
var graph = [];
for (var i = 0; i < 101; ++i) {
    graph[i] = [];
    for (var j = 0; j < 99; ++j) { // must be odd
        graph[i][j] = Math.sin(j * 3.1415926 / 180 * 3 * (1 + i/10)) * 3;
    }
}
*/

var dynamic_range = [-5, 5, 0, -100];

function y_scale(graph)
{
    var min = 0;
    var max = 0;
    for (var i = 0; i < graph.length; ++i) {
        var graphZ = graph[i];
        for (var j = 0; j < graphZ.length; ++j) {
            var y = graphZ[j];
            min = Math.min(min, y);
            max = Math.max(max, y);
        }
    }

    var scale = 1;
    if (min !== 0 && max === 0) {
        scale = Math.abs(dynamic_range[0] / min);
    } else if (min === 0 && max !== 0) {
        scale = Math.abs(dynamic_range[1] / max);
    } else if (min !== 0 && max !== 0) {
        scale = Math.max(Math.abs(dynamic_range[0] / min), Math.abs(dynamic_range[1] / max));
    }
    scale = Math.min(scale, 10);

    return scale;
}

function calc_vertices(graph)
{
    vertices = [];
    var scale = y_scale(graph);
    for (var i = 0; i < graph.length - 1; ++i) {
        var tbl = graph[i];
        var tblu = graph[i+1];
        var xoff = tbl.length / 2;
        for (var j = 0; j < tbl.length - 1; ++j) {
            if (j === 0) {
                vertices.push(j+1 - xoff);
                vertices.push(tbl[j+1] * scale);
                vertices.push(-i);

                vertices.push(j+0.9 - xoff);
                vertices.push(tblu[j+1] * scale);
                vertices.push(-(i+0.9));

                vertices.push(j+1.8 - xoff);
                vertices.push(tblu[j+1+1] * scale);
                vertices.push(-(i+0.9));

            } else if (j == tbl.length - 2) {
                vertices.push(j - xoff);
                vertices.push(tbl[j] * scale);
                vertices.push(-i);
    
                vertices.push(j+0.9 - xoff);
                vertices.push(tblu[j+1] * scale);
                vertices.push(-(i+0.9));

                vertices.push(j+0.9 - xoff);
                vertices.push(tbl[j+1] * scale);
                vertices.push(-i);
            } else if (j % 2 !== 0) {
                vertices.push(j - xoff);
                vertices.push(tbl[j] * scale);
                vertices.push(-i);
    
                vertices.push(j+0.9 - xoff);
                vertices.push(tblu[j+1] * scale);
                vertices.push(-(i+0.9));
    
                vertices.push(j+1.8 - xoff);
                vertices.push(tbl[j+2] * scale);
                vertices.push(-i);
            } else {
                vertices.push(j - xoff);
                vertices.push(tblu[j] * scale);
                vertices.push(-(i+0.9));
    
                vertices.push(j+0.9 - xoff);
                vertices.push(tbl[j+1] * scale);
                vertices.push(-i);
    
                vertices.push(j+1.8 - xoff);
                vertices.push(tblu[j+2] * scale);
                vertices.push(-(i+0.9));
            }
        }
    }
}

function s2c(v, s)
{
    v -= dynamic_range[0];
    v /= dynamic_range[1] - dynamic_range[0];
    s -= dynamic_range[2];
    s /= dynamic_range[3] - dynamic_range[2];
    // s *= 0.75; // do not take all colors at far end
    s = 1 - Math.exp(-s * 3);

    var r, g, b;
    r = 1;
    g = 1;
    b = 1;

    if (v <= 0.25) {
        r = 0;
        g = v / 0.25 * 0.4;
        b = 1;
    } else if (v <= 0.5) {
        r = 0;
        g = 0.5;
        b = 1 - (v - 0.25) / 0.25;
    } else if (v <= 0.75) {
        r = (v - 0.5) / 0.25;
        b = 0;
        g = 0.5;
    } else {
        r = 1;
        g = 1 - (v - 0.75) / 0.25;
        b = 0;
    }

    var r1 = Math.min(Math.max(r, 0), 1);
    var g1 = Math.min(Math.max(g, 0), 1);
    var b1 = Math.min(Math.max(b, 0), 1);
    s = Math.min(Math.max(s, 0), 1);
    // s = "pastelization" factor
    r = (1-s) * r1 + s/3 * g1 + s/3 * b1 + s/3 * r1;
    g = (1-s) * g1 + s/3 * b1 + s/3 * r1 + s/3 * g1;
    b = (1-s) * b1 + s/3 * r1 + s/3 * g1 + s/3 * b1;

    return [r, g, b, 1];
}

function calc_colors()
{
    vertices_colors = [];
    for (var i = 0; i < (vertices.length / 3 + 2); ++i) {
        var c = s2c(vertices[i*3+1], vertices[i*3+2]);
        vertices_colors.push(c[0]);
        vertices_colors.push(c[1]);
        vertices_colors.push(c[2]);
        vertices_colors.push(c[3]);
    }
}

function bindBuffers()
{
    chart = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chart);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    chart.itemSize = 3;
    chart.numItems = Math.floor(vertices.length / 3);

    chart_colors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, chart_colors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_colors), gl.STATIC_DRAW);
    chart_colors.itemSize = 4;
    chart_colors.numItems = chart.numItems;
}

function draw2()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // FIXME second parameter aspect
    perspective(45, 1.3, 0.2, 1000.0);

    loadIdentity();

    mvRotate(-pitch, [1, 0, 0]);
    mvRotate(-yaw, [0, 1, 0]);
    mvTranslate([-xPos, -yPos, -zPos]);

    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, chart);
    gl.vertexAttribPointer(tvertex, chart.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, chart_colors);
    gl.vertexAttribPointer(tcolor, chart_colors.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, chart.numItems);
}


var lastTime = 0;
var piOver180 = Math.PI / 180;

function animate()
{
    var timeNow = new Date().getTime();
    if (lastTime !== 0) {
        var elapsed = timeNow - lastTime;

        if (speed !== 0) {
            xPos -= Math.sin(yaw * piOver180) * speed * elapsed;
            zPos -= Math.cos(yaw * piOver180) * speed * elapsed;
            yPos += Math.sin(pitch * piOver180) * speed * elapsed;
        }

        yaw += yawRate * elapsed;
        pitch += pitchRate * elapsed;

    }
    lastTime = timeNow;
}

function tick()
{
    handleKeys();
    draw2();
    animate();
}

function redimensionado()
{
    var w = window.innerWidth * 0.8;
    $('#arena').width(w);
    $('#arena').height(w / 16 * 10);
    calc();
}

function init2()
{
    initGL();

    if (gl) {
        initShaders();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        /*
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        */
        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
        document.onkeypress = handleKeyPress;
    }
}

function mastigar(params)
{
    var graficos = [];

    var papeis = params.papeis;
    var qtdes = params.qtdes;

    if (papeis.length <= 0) {
        return graficos;
    }

    // pega opcao com menor numero de dias para vencimento
    var t = 99999;
    for(var pi = 0; pi < papeis.length; ++pi) {
        var papel = papeis[pi];
        var opcao = mapa[papel];
        t = Math.min(t, opcao.t_dias);
    }

    if (t > 3650) {
        t = 0;
    }

    var t_inicial = t;

    Sorig = mapa[papeis[0]].Sorig;
    Smin = Sorig * 0.9;
    Smax = Sorig * 1.1;
    Vmin = 99999.0;
    Vmax = -99999.0;

    var grafico = [];

    /*
    S = Smin;
    while (S < Smax) {
        var y = stock_price_probability(0, S, Sorig,
                                        mapa[papeis[0]].r,
                                        mapa[papeis[0]].s,
                                        mapa[papeis[0]].t) * 100;
        if (mapa[papeis[0]].tipo === 1) {
            y = 100 - y;
        }
        grafico.push([Math.round(S*100)/100, y]);
        S += Step;
    }
    */

    var Step = (Smax - Smin) / 50;

    for(t = 0; t <= t_inicial; ++t) {
        grafico = [];
        graficos.push(grafico);
        S = Smin;

        while (S < Smax) {
            var premio = 0;
            for (pi = 0; pi < papeis.length; ++pi) {
                papel = papeis[pi];
                opcao = mapa[papel];
                var t_dias = 0;
                if (papel.charAt(4) != 'Z') {
                    t_dias = opcao.t_dias - t;
                }
                if (opcao.tipo === 1) {
                    premio += opremium(opcao.Sorig + (S - Sorig), opcao.K,
                                       opcao.r, to_years(t_dias), opcao.s) * qtdes[pi];
                } else {
                    premio += putzopremium(opcao.Sorig + (S - Sorig), opcao.K,
                                       opcao.r, to_years(t_dias), opcao.s) * qtdes[pi];
                }
            }

            grafico.push(premio);
            S += Step;
            Vmax = Math.max(Vmax, premio);
            Vmin = Math.min(Vmin, premio);
        }
    }

    return graficos;
}

var ticking = null;

function plota_graficos(raw_data)
{
    if (ticking) {
        clearInterval(ticking);
        ticking = null;
    }
    if (raw_data.length <= 0) {
        // FIXME clear canvas
        return;
    }
    calc_vertices(raw_data);
    calc_colors();
    bindBuffers();
    if (gl) {
        ticking = setInterval(tick, 16);
    }
}
