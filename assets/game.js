var logger = document.getElementById("game-log");
var stats = document.getElementById("stats");
var serverUrl = "wss://server.glap3d.ga";

var powertext = document.getElementById("power_state"),
    powerbar = document.getElementById("powerBar"),
    velocitytext = document.getElementById("velocity_state"),
    velocitybar = document.getElementById("velocityBar"),
    pitchtext = document.getElementById("pitch_state"),
    yawtext = document.getElementById("yaw_state"),
    rolltext = document.getElementById("roll_state");
var playerTextName = document.getElementById("playername"),
    joinButton = document.getElementById("join-button"),
    affiliateGlap = document.getElementById("glap-seo-opt"),
    loadingText = document.getElementById("loadState"),
    loadScreen = document.getElementById("splash");

joinButton.disabled = true;
var dataPool = 0;
var settingsData = {
    "gq": {
        setting: ["Low", "Medium", "High", "Ultra"],
        current: 3,
        critical: true
    },
    "sk": {
        setting: ["Low", "Medium", "High", "Ultra"],
        current: 3,
        critical: true
    },
    "shd": {
        setting: ["Low", "Medium", "High", "Ultra"],
        current: 3
    },
    "gd": {
        setting: ["Off", "On"],
        current: 1,
        critical: true
    },
    "bl": {
        setting: ["Off", "On"],
        current: 1,
        critical: true
    },
    "dof": {
        setting: ["Off", "On"],
        current: 1,
        critical: true
    },
    "aa": {
        setting: ["Off", "Low", "Medium", "High", "Ultra"],
        current: 1,
        critical: true
    },
    "ao": {
        setting: ["Off", "On"],
        current: 1
    },
    "ptd": {
        setting: ["Off", "On"],
        current: 1
    },
    "jg": {
        setting: ["Off", "On"],
        current: 1
    },
    "flt": {
        setting: ["Off", "Linear", "Realistic", "Cinematic"],
        current: 1
    }
}

var loadedsettings = JSON.parse(localStorage.getItem("settingsData")) || {
    "gq": 1,
    "sk": 1,
    "shd": 1,
    "gd": 1,
    "bl": 1,
    "dof": 1,
    "aa": 1,
    "ao": 1,
    "ptd": 1,
    "jg": 1
};

if (typeof loadedsettings["gq"] == "object") {
    var i = {};
    for (let [key, val] of Object.entries(settingsData)) {
        i[key] = val.current;
    }
    localStorage.setItem("settingsData", JSON.stringify(i));
}

for (let [key, val] of Object.entries(loadedsettings)) {
    settingsData[key].current = val;
}

document.querySelector("div.reload-alert").style.display = "none";
for (let [key, val] of Object.entries(settingsData)) {
    settingsData[key].textelem = document.getElementById(key + "_text");
    settingsData[key].textelem.innerText = settingsData[key].setting[settingsData[key].current];
    document.getElementById(key + "_left").addEventListener("click", function () {
        settingsData[key].current = Math.max(0, settingsData[key].current - 1);
        settingsData[key].textelem.innerText = settingsData[key].setting[settingsData[key].current];
    })
    document.getElementById(key + "_right").addEventListener("click", function () {
        settingsData[key].current = Math.min(settingsData[key].setting.length - 1, settingsData[key].current + 1);
        settingsData[key].textelem.innerText = settingsData[key].setting[settingsData[key].current];
    })
}
var settingsOn = false;
document.getElementById("settings-button").addEventListener("click", () => {
    settingsOn = true;
    document.querySelector(".settings").style.display = "block";
})
document.getElementById("cancel-button").addEventListener("click", () => {
    settingsOn = false;
    document.querySelector(".settings").style.display = "none";
})
document.getElementById("apply-button").addEventListener("click", () => {
    var i = {};
    for (let [key, val] of Object.entries(settingsData)) {
        i[key] = val.current;
    }
    localStorage.setItem("settingsData", JSON.stringify(i));
    settingsOn = false;
    document.querySelector(".settings").style.display = "none";
})
document.getElementById("join-button").querySelector("div").innerText = "Loading..";



const downscale = 256;
const detail = 192;




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

    async init() {
        var canvas = document.createElement('canvas');
        var gl;
        var debugInfo;
        var vendor;
        var rendererinf;

        try {
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        } catch (e) {}

        if (gl) {
            debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            rendererinf = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        } else {
            loadingText.innerHTML = "Could not start. Your graphics card or your browser does not support WebGL.";
            return;
        }

        var gameBegan = false;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 400000);
        setInterval(this.everysecond, 1000);
        var canvas = document.createElement("canvas");
        var gl = canvas.getContext("webgl2", {
            alpha: false
        });
        var renderer = new THREE.WebGLRenderer({
            logarithmicDepthBuffer: true,
            powerPreference: "high-performance",
            context: gl,
            canvas: canvas
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(canvas)
        switch (settingsData["flt"].current) {
            case 0:
                renderer.toneMapping = THREE.NoToneMapping;
                break;
            case 1:
                renderer.toneMapping = THREE.LinearToneMapping;
                break;
            case 2:
                renderer.toneMapping = THREE.ReinhardToneMapping;
                break;
            case 3:
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                break;
        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;


            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
            camera.updateProjectionMatrix();


        }
        window.addEventListener('resize', onWindowResize, false);

        var qualitySetting = "medium";

        //
        loadingText.innerHTML = "Creaing world (2/12)"
        //

        var planets = [];
        var sunG = new THREE.SphereBufferGeometry(10000 / downscale, detail, detail);
        var mercG = new THREE.SphereBufferGeometry(100 / downscale, detail, detail);
        var vensG = new THREE.SphereBufferGeometry(125 / downscale, detail, detail);
        var erthG = new THREE.SphereBufferGeometry(150 / downscale, detail, detail);
        var marsG = new THREE.SphereBufferGeometry(137.5 / downscale, detail, detail);
        var juptG = new THREE.SphereBufferGeometry(2500 / downscale, detail, detail);
        var strnG = new THREE.SphereBufferGeometry(750 / downscale, detail, detail);
        var urnsG = new THREE.SphereBufferGeometry(1000 / downscale, detail, detail);
        var neptG = new THREE.SphereBufferGeometry(600 / downscale, detail, detail);
        var moonG = new THREE.SphereBufferGeometry(50 / downscale, detail, detail);

        function getURLByQuality(base, quality) {
            switch (quality) {
                case 0:
                    return base + "_low.png";
                case 1:
                    return base + "_medium.png";
                case 2:
                    return base + "_high.png";
                case 3:
                    return base + "_ultra.png";
            }
        }

        //
        loadingText.innerHTML = "Loading assets (this can take a while) (3/12) <div id=\"loadingpercent\"></div>"
        //

        function getURLByQuality(base, quality) {
            switch (quality) {
                case 0:
                    return base + "_low.png";
                case 1:
                    return base + "_medium.png";
                case 2:
                    return base + "_high.png";
                case 3:
                    return base + "_ultra.png";
            }
        }
        var LoadingMgr = new THREE.LoadingManager();
        var TLoader = new THREE.TextureLoader(LoadingMgr);
        LoadingMgr.onProgress = function(item, loaded, total) {
            try{document.getElementById("loadingpercent").innerText = ((loaded / total * 100).toFixed(1)) + "%"}catch{}
        }
        var allPromises = [];
        var dataTextureArray = [
            getURLByQuality("assets/sun/sun", settingsData["gq"].current),
            getURLByQuality("assets/merc/merc", settingsData["gq"].current),
            getURLByQuality("assets/vens/vens", settingsData["gq"].current),
            getURLByQuality("assets/erth/erth", settingsData["gq"].current),
            getURLByQuality("assets/mars/mars", settingsData["gq"].current),
            getURLByQuality("assets/jupt/jupt", settingsData["gq"].current),
            getURLByQuality("assets/strn/strn", settingsData["gq"].current),
            getURLByQuality("assets/urns/urns", settingsData["gq"].current),
            getURLByQuality("assets/nept/nept", settingsData["gq"].current),
            getURLByQuality("assets/moon/moon", settingsData["gq"].current),
            "assets/sun/sun_ao.png",
            "assets/merc/merc_ao.png",
            "assets/vens/vens_ao.png",
            "assets/erth/erth_ao.png",
            "assets/mars/mars_ao.png",
            "assets/jupt/jupt_ao.png",
            "assets/strn/strn_ao.png",
            "assets/urns/urns_ao.png",
            "assets/nept/nept_ao.png",
            "assets/moon/moon_ao.png",
            getURLByQuality("/assets/starfield/starfield", settingsData["sk"].current),
            "assets/sun/sun_ds.png",
            "assets/merc/merc_ds.png",
            "assets/vens/vens_ds.png",
            "assets/erth/erth_ds.png",
            "assets/mars/mars_ds.png",
            "assets/jupt/jupt_ds.png",
            "assets/strn/strn_ds.png",
            "assets/urns/urns_ds.png",
            "assets/nept/nept_ds.png",
            "assets/moon/moon_ds.png",
        ]
        var textureArray = [];
        dataTextureArray.forEach(function (jsonMat) {

            allPromises.push(new Promise(function (resolve, reject) {

                TLoader.load(
                    jsonMat,

                    function (texture) {
                        // We're done, so tell the promise it is complete
                        texture.anisotropy = 16;
                        resolve(texture);
                    },

                    function (xhr) {
                        // Progress callback of TextureLoader
                        // ...
                    },

                    function (xhr) {
                        // Failure callback of TextureLoader
                        // Reject the promise with the failure
                        reject(new Error('Could not load ' + jsonMat));
                    }
                );

            }));

        });
        
        

        await Promise.all(allPromises)
            .then(function (arrayOfMaterials) {
                textureArray = arrayOfMaterials;
                console.log("done!");
            }, function (error) {
                console.error("Could not load all textures:", error);
            });

        var domElement = renderer.domElement;
        var isLocked = false;
        var myinstance = 0;
        document.addEventListener("click", function (e) {
            if (myinstance == 0) return;
            if (settingsOn) return;
            domElement.requestPointerLock();
        })

        var euler = new THREE.Euler(0, 0, 0, "YXZ");
        var PI_2 = Math.PI / 2;
        var lastPlayerX = 0,
            lastPlayerZ = 0,
            lastPlayerY = 0;

        function onMouseMove(event) {

            if (isLocked === false) return;

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= movementX * 0.002;
            euler.x -= movementY * 0.002;

            euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
            camera.quaternion.setFromEuler(euler);
            ws.send(JSON.stringify([4, euler.x, euler.y]));

        }

        function onPointerlockChange() {

            if (document.pointerLockElement === domElement) {

                isLocked = true;

            } else {

                isLocked = false;

            }

        }
        //
        loadingText.innerHTML = "Loading assets (this can take a while) (4/12)"
        //
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('pointerlockchange', onPointerlockChange, false);
        const displacementsc = -0.05;
        var sunL = new THREE.MeshStandardMaterial({
            map: textureArray[0],
            emissiveMap: textureArray[0],
            emissive: 0xffffff,
            aoMap: ((settingsData["ao"].current) ? textureArray[10] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[21] : null),
            displacementScale: displacementsc
        })
        var mercL = new THREE.MeshStandardMaterial({
            map: textureArray[1],
            emissiveMap: textureArray[1],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[11] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[22] : null),
            displacementScale: displacementsc
        })
        var vensL = new THREE.MeshStandardMaterial({
            map: textureArray[2],
            emissiveMap: textureArray[2],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[12] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[23] : null),
            displacementScale: displacementsc
        })
        var erthL = new THREE.MeshStandardMaterial({
            map: textureArray[3],
            emissiveMap: textureArray[3],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[13] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[24] : null),
            displacementScale: displacementsc
        })
        var marsL = new THREE.MeshStandardMaterial({
            map: textureArray[4],
            emissiveMap: textureArray[4],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[14] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[25] : null),
            displacementScale: displacementsc
        })
        var juptL = new THREE.MeshStandardMaterial({
            map: textureArray[5],
            emissiveMap: textureArray[5],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[15] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[26] : null),
            displacementScale: displacementsc
        })
        var strnL = new THREE.MeshStandardMaterial({
            map: textureArray[6],
            emissiveMap: textureArray[6],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[16] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[27] : null),
            displacementScale: displacementsc
        })
        var urnsL = new THREE.MeshStandardMaterial({
            map: textureArray[7],
            emissiveMap: textureArray[7],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[17] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[28] : null),
            displacementScale: displacementsc
        })
        var neptL = new THREE.MeshStandardMaterial({
            map: textureArray[8],
            emissiveMap: textureArray[8],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[18] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[29] : null),
            displacementScale: displacementsc
        })
        var moonL = new THREE.MeshStandardMaterial({
            map: textureArray[9],
            emissiveMap: textureArray[9],
            emissive: 0x111111,
            aoMap: ((settingsData["ao"].current) ? textureArray[19] : null),
            displacementMap: ((settingsData["ptd"].current) ? textureArray[30] : null),
            displacementScale: displacementsc
        })
        //
        loadingText.innerHTML = "Applying (5/12)"
        //
        var sunM = new THREE.Mesh(sunG, sunL);
        var mercM = new THREE.Mesh(mercG, mercL);
        var vensM = new THREE.Mesh(vensG, vensL);
        var erthM = new THREE.Mesh(erthG, erthL);
        var marsM = new THREE.Mesh(marsG, marsL);
        var juptM = new THREE.Mesh(juptG, juptL);
        var strnM = new THREE.Mesh(strnG, strnL);
        var urnsM = new THREE.Mesh(urnsG, urnsL);
        var neptM = new THREE.Mesh(neptG, neptL);
        var moonM = new THREE.Mesh(moonG, moonL);

        planets.push(sunM);
        planets.push(mercM);
        planets.push(vensM);
        planets.push(erthM);
        planets.push(marsM);
        planets.push(juptM);
        planets.push(strnM);
        planets.push(urnsM);
        planets.push(neptM);
        planets.push(moonM);
        //
        loadingText.innerHTML = "Finishing up world (6/12)"
        //
        var alight = new THREE.PointLight(0xffffff, 1, 0, 0);
        planets.forEach((e, i) => {
            scene.add(e);
        })
        scene.add(alight);

        var skySphereG = new THREE.SphereBufferGeometry(160000 / downscale, 256, 256);
        var skySphereL = new THREE.MeshBasicMaterial({
            map: textureArray[20]
        });
        skySphereL.side = THREE.BackSide;
        var skySphereM = new THREE.Mesh(skySphereG, skySphereL);
        scene.add(skySphereM);

        var liveModuleT = TLoader.load("assets/modules/heart.png");
        //
        loadingText.innerHTML = "Estabilishing connection (7/12)"
        //
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
        //
        loadingText.innerHTML = "Keyboard events (8/12)"
        //
        
        document.addEventListener("keydown", function (e) {
            if (activekeys[e.keyCode] == true || !isLocked) return;
            activekeys[e.keyCode] = true;
            ws.send(JSON.stringify([0, e.key, true]))
        })
        document.addEventListener("keyup", function (e) {
            if (!isLocked) return;
            activekeys[e.keyCode] = false;
            ws.send(JSON.stringify([0, e.key, false]))
        })
        var chosenZoomPlanet = Math.floor(Math.random() * 7) + 1;
        var eu = new THREE.Euler(0, 0, 0, "YXZ");
        var kbs = 0;
        var playercount = 0;
        ws.onmessage = function (e) {

            dataPool += e.data.length;
            var json = JSON.parse(e.data);
            switch (json[0]) {
                case 0:
                    myinstance = json[1];
                    gameBegan = true;
                    break;
                case 1:
                    json[1].forEach((e, i) => {
                        if (i == 0) return;
                        try {

                            planets[e.c].position.x = e.x / downscale;
                            planets[e.c].position.z = e.z / downscale;
                            if (!gameBegan && e.c == chosenZoomPlanet) {
                                camera.position.x = e.x / downscale;
                                camera.position.z = e.z / downscale;
                                camera.lookAt(planets[0].position);
                            }
                        } catch {

                        }
                    })
                    json[2].forEach((e) => {
                        scene.children.forEach(f => {
                            if (f.userData.id == e.i) {
                                f.position.x = e.x / downscale,
                                    f.position.y = e.y / downscale,
                                    f.position.z = e.z / downscale,
                                    f.quaternion.x = e.qx,
                                    f.quaternion.y = e.qy,
                                    f.quaternion.z = e.qz,
                                    f.quaternion.w = e.qw;
                                if (e.t == 0 && gameBegan) {
                                    if (e.n == myinstance) {



                                        pitchtext.innerText = "PITCH: " + (f.rotation.x * (180 / Math.PI)).toFixed(2);
                                        yawtext.innerText = "YAW: " + (f.rotation.y * (180 / Math.PI)).toFixed(2);
                                        rolltext.innerText = "ROLL: " + (f.rotation.z * (180 / Math.PI)).toFixed(2);

                                        lastPlayerX = e.x / downscale, lastPlayerZ = e.z / downscale, lastPlayerY = e.y / downscale;
                                        
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
                            geometry = new THREE.BoxBufferGeometry(10 / downscale, 10 / downscale, 10 / downscale);

                            material = new THREE.MeshStandardMaterial({
                                map: liveModuleT,
                                emissiveMap: liveModuleT,
                                emissive: 0x222222
                            });
                    }
                    var mesh = new THREE.Mesh(geometry, material);
                    var pl = new THREE.PointLight(0xfa0000, 1, 50/downscale);
                    mesh.add(pl);


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
                    scene.children.forEach((e, i) => {
                        if (e.userData.instance == json[1].i || e.userData.owner == json[1].i) {
                            scene.remove(scene.children[i]);
                        }
                    })
                    break;
                case 5:
                    // reserved for chat
                    break;
                case 6:
                    powertext.innerText = "POWER: " + Math.floor(json[1]) + "/" + json[2]
                    velocitytext.innerText = "VELOCITY: " + json[3];
                    bestvelocity = Math.max(bestvelocity, json[3]);
                    powerbar.style.width = "" + (json[1] / json[2] * 100) + "%";
                    velocitybar.style.width = "" + (json[3] / bestvelocity * 100) + "%";
                    break;
                case 7:
                    playercount = json[1];
                    kbs = Math.floor(dataPool / 1024)

                    break;
            }
            return false;
        }
        //
        loadingText.innerHTML = "Postprocessing (9/12)"
        //
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
        var composer = new POSTPROCESSING.EffectComposer(renderer);
        var renderPass = new POSTPROCESSING.RenderPass(scene, camera);
        composer.addPass(renderPass);
        var normal = new POSTPROCESSING.NormalPass(scene, camera);
        composer.addPass(normal);

        if (settingsData["bl"].current) {
            var blme = new POSTPROCESSING.BloomEffect({
                texture: sunL,
                intensity: 0.6
            });
            blme.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, blme));
        }
        if (settingsData["gd"].current) {
            let godraysEffect = new POSTPROCESSING.GodRaysEffect(camera, sunM, {samples: 32, density: 0.5, weight: 0.3});
            godraysEffect.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, godraysEffect));
        }
        // composer.addPass(new POSTPROCESSING.EffectPass(camera, new POSTPROCESSING.SSAOEffect(camera)));
        
        
        if ( /*settingsData["ssao"].current*/ true) {
            const ssaoEffect = new POSTPROCESSING.SSAOEffect(camera, normal.renderTarget.texture, {
                blendFunction: POSTPROCESSING.BlendFunction.MULTIPLY,
                samples: 11,
                rings: 4,
                distanceFalloff: 0.0025, // with an additional ~2.5 units of falloff.
                rangeThreshold: 0.0003, // Occlusion proximity of ~0.3 world units
                rangeFalloff: 0.0001, // with ~0.1 units of falloff.
                luminanceInfluence: 0.7,
                radius: 30,
                scale: 1.0,
                bias: 0.05
            });
            composer.addPass(new POSTPROCESSING.EffectPass(camera, ssaoEffect));
        }
        if (settingsData["dof"].current) {
            var dof1 = new POSTPROCESSING.DepthOfFieldEffect(camera);
            dof1.renderToScreen = true;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, dof1));
        }
        if (settingsData["aa"].current != 0) {
            let areaImage = new Image();
            areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
            let searchImage = new Image();
            searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
            composer.addPass(new POSTPROCESSING.EffectPass(camera, new POSTPROCESSING.SMAAEffect(searchImage, areaImage, settingsData["aa"].current - 1, POSTPROCESSING.EdgeDetectionMode.DEPTH)));
        }
        ws.onopen = function (e) {
            joinButton.onclick = function (e) {
                document.getElementById("menu").style.display = "none";
                ws.send("0" + playerTextName.value.slice(0, 15));
                affiliateGlap.style.display = "none";
            }

        }
        //
        loadingText.innerHTML = "Finishing up (10/12)"
        //
        var zoomValue = 75;
        var lastTime;
        var lastSecond;
        var fps = 0;
        var ms = 0;
        //
        loadingText.innerHTML = "Init Scene (11/12)"
        //
        function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
        document.addEventListener("wheel", event => {
            zoomValue = clamp(zoomValue + (event.deltaY / 100), 50, 1000);
        })
        function animate() {


            if (gameBegan) {
                camera.position.x = Math.sin(euler.y) * (Math.sin(euler.x + PI_2)) * (zoomValue / downscale) + lastPlayerX;
                camera.position.z = Math.cos(euler.y) * (Math.sin(euler.x + PI_2)) * (zoomValue / downscale) + lastPlayerZ;
                camera.position.y = -Math.sin(euler.x) * (zoomValue / downscale) + lastPlayerY;
            }
            composer.render();
            fps++;
            if (performance.now() - lastSecond >= 1000) {
                lastSecond = performance.now();

                stats.innerHTML = startTime() + " // " + rendererinf + " // <span style='color:rgb(48, 179, 30)'>draw call " + ms.toFixed(1) + " ms</span> <span style='color:rgb(22, 127, 219)'>" + fps + " fps</span> <span style='color: rgb(107, 30, 179)'>" + kbs + " kB/s</span> <span style='color:rgb(24, 240, 121)'>" + playercount + " players online</span>";
                fps = 0;
            }
            if (lastTime) ms = performance.now() - lastTime;
            lastTime = performance.now();
            if (!lastSecond) lastSecond = performance.now();
            requestAnimationFrame(animate);
        }
        //
        loadingText.innerHTML = "Done"
        //
        setTimeout(() => {
            animate();
            window.planets = planets;
            joinButton.querySelector("div").innerText = "Join";
            joinButton.disabled = false;
            loadScreen.style.opacity = 0;
            loadScreen.addEventListener('transitionend', () => loadScreen.remove());
        }, 500);
    }
    everysecond() {

        dataPool = 0;
    }
}
var game = new player();
window.game = game;
game.init();
