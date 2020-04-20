var logger = document.getElementById("game-log");
var stats = document.getElementById("stats");
var serverUrl = "ws://127.0.0.1:3000";

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
    dataPool = 0

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
        log("Game.js version 41")
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
        var erthL = new THREE.MeshLambertMaterial({
            map: erthT,
            emissiveMap: erthT,
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

        var ws = new WebSocket(serverUrl);
        window.warws = ws;

        ws.onerror = function (err) {
            log("Connection error: " + err);
            log("Current WS state: " + ws.readyState)
        }
        ws.onclose = function (e) {
            log("Disconnected: " + e.code);
        }
        var activekeys = [];
        document.addEventListener("keydown", function (e) {
            if (activekeys[e.keyCode] == true) return;
            activekeys[e.keyCode] = true;
            ws.send(JSON.stringify([0,e.key,true]))
        })
        document.addEventListener("keyup", function (e) {
            activekeys[e.keyCode] = false;
            ws.send(JSON.stringify([0,e.key,false]))
        })
        var myinstance = 0;
        ws.onmessage = function (e) {
            //glThis.dataPool += e.data.length;
            var json = JSON.parse(e.data);
            switch (json[0]) {
                case 0:
                    log("got message");
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
                                        
                                        var euler = f.rotation;
                                        camera.position.x = (Math.sin(euler.y) * 10) + e.x;
                                        console.log(Math.sin(euler.y) + " " + Math.cos(euler.y) + " " + euler.y);
                                        camera.position.z = (Math.sin(euler.y-1.57079633) * 10) + e.z;
                                        camera.lookAt(f.position);
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
                            geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5);
                            material = new THREE.MeshLambertMaterial({color: 0x00ff00});
                    }
                    var mesh = new THREE.Mesh(geometry, material);
                    mesh.userData.id = obj.i;
                    if (obj.t == 0) {
                        mesh.userData.instance = obj.n;
                    }
                    mesh.rotation.order = "YXZ";
                    scene.add(mesh);
                    break;
            }
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
            log("postprocessing data version 5")
        } catch (e) {
            alert(e)
        }
        ws.onopen = function (e) {
            ws.send("0testing1111");
        }

        function animate() {
            requestAnimationFrame(animate);
            composer.render();
        }
        animate();
        window.planets = planets;
    }
    everysecond() {

        this.dataPool = 0;
    }
}
var game = new player();
window.game = game;
game.init();
