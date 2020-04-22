var logger = document.getElementById("game-log");
var stats = document.getElementById("stats");
var serverUrl = "wss://server.glap3d.ga";

var powertext = document.getElementById("power_state"),
    powerbar =  document.getElementById("powerBar"),
    velocitytext = document.getElementById("velocity_state"),
    velocitybar =  document.getElementById("velocityBar"),
    pitchtext = document.getElementById("pitch_state"),
    yawtext = document.getElementById("yaw_state"),
    rolltext = document.getElementById("roll_state");
var playerTextName = document.getElementById("playername"),
    joinButton = document.getElementById("join-button");

    joinButton.disabled = true;
var dataPool = 0;
document.getElementById("join-button").querySelector("div").innerText = "Loading..";
function log(text) {
    if (logger.innerHTML.endsWith(text + "</div>")) {
        logger.lastChild.textContent = logger.lastChild.textContent + " (x2)"
    } else {
        if (logger.innerHTML.endsWith(text + " (x2)</div>")) {
            logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x2)", "") + " (x3)"
        } else {
            if (logger.innerHTML.endsWith(text + " (x3)</div>")) {
                logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x3)", "") + " (x4)"
            } else {
                if (logger.innerHTML.endsWith(text + " (x4)</div>")) {
                    logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x4)", "") + " (x5)"
                } else {
                    if (logger.innerHTML.endsWith(text + " (x5)</div>")) {
                        logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x5)", "") + " (x6)"
                    } else {
                        if (logger.innerHTML.endsWith(text + " (x6)</div>")) {
                            logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x6)", "") + " (x7)"
                        } else {
                            if (logger.innerHTML.endsWith(text + " (x7)</div>")) {
                                logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x7)", "") + " (x8)"
                            } else {
                                if (logger.innerHTML.endsWith(text + " (x8)</div>")) {
                                    logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x8)", "") + " (x9)"
                                } else {
                                    if (logger.innerHTML.endsWith(text + " (x9)</div>")) {
                                        logger.lastChild.textContent = logger.lastChild.textContent.replace(" (x9)", "") + " (x10)"
                                    } else {
                                        if (logger.children.length > 20) logger.firstChild.remove();

                                        var div = document.createElement("div");
                                        div.innerHTML = text;
                                        div.setAttribute("class", "gameLogText");
                                        logger.appendChild(div);
                                        setTimeout(() => {
                                            div.parentNode.removeChild(div);
                                        }, 10000);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

}
class player {

    constructor() {

    }
    drawtext3d(text2d, material, cssStyle) {
        var canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');
        ctx.font = cssStyle;
        var textmeasure = ctx.measureText(text2d);
        canvas.height = parseInt(ctx.font.match(/\d+/), 10);
        canvas.width = textmeasure.width;
        ctx.fillText(text2d, 0, 0);
        var texture = new THREE.Texture(canvas);
        material.map = texture;
        var geometry = new THREE.PlaneBufferGeometry(canvas.width, canvas.height);
        var mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    init() {
        log("Game.js version 76 - ASYNC")
        var canvas = document.createElement("canvas");
        if (!(canvas.getContext("webgl") && window.WebGLRenderingContext)) {
            if (window.WebGLRenderingContext) {
                log("graphics card doesn't support webgl")
            } else {
                log("web browser doesn't support webgl")
            }
            return;
        }

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400000);
        setInterval(this.everysecond, 1000);
        var renderer = new THREE.WebGLRenderer({
            logarithmicDepthBuffer: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement)

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }
        window.addEventListener('resize', onWindowResize, false);

        var qualitySetting = "medium";
        var planets = [];
        var sunG = new THREE.SphereBufferGeometry(10000, 64, 64);
        var mercG = new THREE.SphereBufferGeometry(100, 64, 64);
        var vensG = new THREE.SphereBufferGeometry(125, 64, 64);
        var erthG = new THREE.SphereBufferGeometry(150, 64, 64);
        var marsG = new THREE.SphereBufferGeometry(137.5, 64, 64);
        var juptG = new THREE.SphereBufferGeometry(2500, 64, 64);
        var strnG = new THREE.SphereBufferGeometry(750, 64, 64);
        var urnsG = new THREE.SphereBufferGeometry(1000, 64, 64);
        var neptG = new THREE.SphereBufferGeometry(600, 64, 64);

        function getURLByQuality(base, quality) {
            switch (quality) {
                case "lowest":
                    return base + "_512.jpg";
                case "low":
                    return base + "_1k.jpg";
                case "medium":
                    return base + "_2k.jpg";
                case "high":
                    return base + "_4k.jpg";
                case "ultra":
                    return base + "_8k.jpg";
            }
        }

        var txtl = new THREE.TextureLoader();

        log("Loading planet textures..")
        camera.position.z = 30000;
        window.camera = camera;

        var sunT = txtl.load(getURLByQuality("assets/sun/sun", qualitySetting));
        var mercT = txtl.load(getURLByQuality("assets/merc/merc", qualitySetting));
        var vensT = txtl.load(getURLByQuality("assets/vens/vens", qualitySetting));
        var erthT = txtl.load(getURLByQuality("assets/erth/erth", qualitySetting));
        var marsT = txtl.load(getURLByQuality("assets/mars/mars", qualitySetting));
        var juptT = txtl.load(getURLByQuality("assets/jupt/jupt", qualitySetting));
        var strnT = txtl.load(getURLByQuality("assets/strn/strn", qualitySetting));
        var urnsT = txtl.load(getURLByQuality("assets/urns/urns", qualitySetting));
        var neptT = txtl.load(getURLByQuality("assets/nept/nept", qualitySetting));
var domElement = document.body;
var isLocked = false;
        var myinstance = 0;
document.addEventListener("click", function(e){
    if (myinstance == 0) return;
    domElement.requestPointerLock();
})

var euler = new THREE.Euler(0,0,0,"YXZ");
var PI_2 = Math.PI / 2;
var lastPlayerX = 0, lastPlayerZ = 0, lastPlayerY = 0;
function onMouseMove( event ) {

    if ( isLocked === false ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
    euler.setFromQuaternion( camera.quaternion );
    euler.y -= movementX * 0.002;
    euler.x -= movementY * 0.002;

    euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );
    camera.quaternion.setFromEuler( euler );
    ws.send(JSON.stringify([4,euler.x,euler.y]));
    
}

function onPointerlockChange() {

    if ( document.pointerLockElement === domElement ) {

        isLocked = true;

    } else {

        isLocked = false;

    }

}
document.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'pointerlockchange', onPointerlockChange, false );

        var sunL = new THREE.MeshBasicMaterial({
            map: sunT,
            emissive: 0x222222
        })
        var mercL = new THREE.MeshLambertMaterial({
            map: mercT,
            emissiveMap: mercT,
            emissive: 0x111111
        })
        var vensL = new THREE.MeshLambertMaterial({
            map: vensT,
            emissiveMap: vensT,
            emissive: 0x111111
        })
        var erthTNOR = txtl.load("assets/erth/earth_nor.png");
        var erthTAO = txtl.load("assets/erth/earth_ao.png");
        var erthL = new THREE.MeshLambertMaterial({
            map: erthT,
            emissiveMap: erthT,
            norMap: erthTNOR,
            aoMap: erthTAO,
            emissive: 0x111111
        })
        var marsL = new THREE.MeshLambertMaterial({
            map: marsT,
            emissiveMap: marsT,
            emissive: 0x111111
        })
        var juptL = new THREE.MeshLambertMaterial({
            map: juptT,
            emissiveMap: juptT,
            emissive: 0x111111
        })
        var strnL = new THREE.MeshLambertMaterial({
            map: strnT,
            emissiveMap: strnT,
            emissive: 0x111111
        })
        var urnsL = new THREE.MeshLambertMaterial({
            map: urnsT,
            emissiveMap: urnsT,
            emissive: 0x111111
        })
        var neptL = new THREE.MeshLambertMaterial({
            map: neptT,
            emissiveMap: neptT,
            emissive: 0x111111
        })

        var sunM = new THREE.Mesh(sunG, sunL);
        var mercM = new THREE.Mesh(mercG, mercL);
        var vensM = new THREE.Mesh(vensG, vensL);
        var erthM = new THREE.Mesh(erthG, erthL);
        var marsM = new THREE.Mesh(marsG, marsL);
        var juptM = new THREE.Mesh(juptG, juptL);
        var strnM = new THREE.Mesh(strnG, strnL);
        var urnsM = new THREE.Mesh(urnsG, urnsL);
        var neptM = new THREE.Mesh(neptG, neptL);

        planets.push(sunM);
        planets.push(mercM);
        planets.push(vensM);
        planets.push(erthM);
        planets.push(marsM);
        planets.push(juptM);
        planets.push(strnM);
        planets.push(urnsM);
        planets.push(neptM);

        var alight = new THREE.PointLight(0xffffff, 1, 0, 1.1);

        planets.forEach(e => {
            scene.add(e);
        })
        scene.add(alight);

        var skySphereG = new THREE.SphereBufferGeometry(160000, 256, 256);
        var skySphereT = txtl.load("assets/starfield_8k.jpg");
        var skySphereL = new THREE.MeshBasicMaterial({
            map: skySphereT
        });
        skySphereL.side = THREE.BackSide;
        var skySphereM = new THREE.Mesh(skySphereG, skySphereL);
        scene.add(skySphereM);

        var liveModuleT = txtl.load("assets/modules/heart.png");
        
        var ws = new WebSocket(serverUrl);
        window.warws = ws;
        
        
        
        ws.onerror = function (err) {
            log("Connection error: " + err);
            log("Current WS state: " + ws.readyState)
        }
        ws.onclose = function (e) {
            log("Disconnected: " + e.code);
        }
        var bestvelocity = 0;
        var activekeys = [];
        document.addEventListener("keydown", function (e) {
            if (activekeys[e.keyCode] == true || !isLocked) return;
            activekeys[e.keyCode] = true;
            ws.send(JSON.stringify([0,e.key,true]))
        })
        document.addEventListener("keyup", function (e) {
            if (!isLocked) return;
            activekeys[e.keyCode] = false;
            ws.send(JSON.stringify([0,e.key,false]))
        })
        var eu = new THREE.Euler(0,0,0,"YXZ");
        ws.onmessage = function (e) {
            
            dataPool += e.data.length;
            var json = JSON.parse(e.data);
            switch (json[0]) {
                case 0:
                    myinstance = json[1];
                    break;
                case 1:
                    json[1].forEach((e, i) => {
                        if (i == 0) return;
                        try {
                            planets[e.c].position.x = e.x;
                            planets[e.c].position.z = e.z;
                        } catch {

                        }
                    })
                    json[2].forEach((e) => {
                        scene.children.forEach(f => {
                            if (f.userData.id == e.i) {
                                f.position.x = e.x,
                                    f.position.y = e.y,
                                    f.position.z = e.z,
                                    f.quaternion.x = e.qx,
                                    f.quaternion.y = e.qy,
                                    f.quaternion.z = e.qz,
                                    f.quaternion.w = e.qw;
                                if (e.t == 0) {
                                    if (e.n == myinstance) {
                                        camera.position.y = e.y + 2;
                                        
                                        
                                        
                                        pitchtext.innerText = "PITCH: " + (f.rotation.x * (180/Math.PI)).toFixed(2);
                                        yawtext.innerText = "YAW: " + (f.rotation.y * (180/Math.PI)).toFixed(2);
                                        rolltext.innerText = "ROLL: " + (f.rotation.z * (180/Math.PI)).toFixed(2);

                                        lastPlayerX = e.x, lastPlayerZ = e.z, lastPlayerY = e.y;
                                    }
                                }
                            }
                        })
                    })
                    break;
                case 2:
                    var obj = json[1];
                    var geometry;
                    var material;
                    switch (obj.t) {
                        default:
                            geometry = new THREE.BoxBufferGeometry(5, 5, 5);
                            
                            material = new THREE.MeshLambertMaterial({map:liveModuleT,emissiveMap:liveModuleT,emissive:0x222222});
                    }
                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.userData.id = obj.i;
                    if (obj.t == 0) {
                        mesh.userData.instance = obj.n;
                    }
                    mesh.rotation.order = "YXZ";
                    scene.add(mesh);
                    break;
                case 3:
                    log("<span color='gold'>" + json[1].n + " joined the game</span>");
                    break;
                case 4:
                    log("<span color='gold'>" + json[1].n + " left the game</span>");
                    scene.children.forEach((e,i)=>{
                        if (e.userData.instance == json[1].i || e.userData.owner == json[1].i) {
                            scene.remove(scene.children[i]);
                        }
                    })
                    break;
                case 5:
                    // reserved for chat
                    break;
                case 6:
                    powertext.innerText = "POWER: "+Math.floor(json[1])+"/"+json[2]
                    velocitytext.innerText = "VELOCITY: " + json[3];
                    bestvelocity = Math.max(bestvelocity, json[3]);
                    powerbar.style.width = "" + (json[1]/json[2]*100) + "%";
                    velocitybar.style.width = "" + (json[3]/bestvelocity*100) + "%";
                    break;
                case 7:
                    stats.innerText = "Players online: " + json[1] + " Time: " + startTime() + " Bandwidth: " + Math.floor(dataPool / 1024) + " KB/s";
                    break;
            }
        }

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  return h + ":" + m + ":" + s;
}
        try {
            var composer = new POSTPROCESSING.EffectComposer(renderer);
            var renderPass = new POSTPROCESSING.RenderPass(scene, camera);
            composer.addPass(renderPass);
            var blme = new POSTPROCESSING.BloomEffect();
            blme.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, blme));
            let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, sunM);
            godraysEffect.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, godraysEffect));
            // composer.addPass(new POSTPROCESSING.EffectPass(camera, new POSTPROCESSING.SSAOEffect(camera)));
            var dof1 = new POSTPROCESSING.DepthOfFieldEffect(camera);
            dof1.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, dof1));
            
        } catch (e) {
            alert(e)
        }
        ws.onopen = function (e) {
            joinButton.onclick = function(e) {
                document.getElementById("menu").style.display = "none";
                ws.send("0" + playerTextName.value.slice(0,15));
            }
            
        }

        function animate() {
            requestAnimationFrame(animate);
            camera.position.x = ((Math.sin(euler.y) - Math.abs(Math.sin(euler.x))) * 30) + lastPlayerX;
            camera.position.z = ((Math.cos(euler.y) - Math.abs(Math.sin(euler.x))) * 30) + lastPlayerZ;
            camera.position.y = Math.sin(euler.x) + lastPlayerY;
            composer.render();
            
        }
        animate();
        window.planets = planets;
        joinButton.querySelector("div").innerText = "Join";
        joinButton.disabled = false;
    }
    everysecond() {

        dataPool = 0;
    }
}
var game = new player();
window.game = game;
game.init();
