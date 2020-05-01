var logger = document.getElementById("game-log");
var stats = document.getElementById("stats");
var serverUrl = "wss://server.glap3d.ga";




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
    constructor(gameServerUrl) {
        this._uiDOMElements.menu.joinButton.disabled = true;
        document.getElementById("join-button").querySelector("div").innerText = "Loading..";
        if (!this._checkWebGL()) {
            alert("Your graphics card/browser doesn't support WebGL!");
            return;
        }
        //this._initializeUIElements();
        this._initializeSettingsService();
        this._initializeWebGL();
        this._setFilter(this._settingsData.flt.current);
        this._makeObjects();
        this._skySphereInit();
        this._setupEventListeners();
        this._applyTextures({
            quality: this._settingsData["gq"].current,
            skyquality: this._settingsData["sk"].current
        });
        this._initializePostprocessing({
            aa: this._settingsData.aa.current > 0,
            depthOfField: !!this._settingsData.dof.current,
            aaPreset: this._settingsData.aa.current-1,
            godrays: !!this._settingsData.gd.current,
            bloom: !!this._settingsData.bl.current
        });

        this.animate();
        this.openGameButton();
        if (gameServerUrl) this._serverUrl = gameServerUrl;
    }
    _settingsOn = false
    _uiDOMElements = {
        gauges: {
            power: {
                state: document.getElementById("power_state"),
                visual: document.getElementById("powerBar")
            },
            velocity: {
                state: document.getElementById("velocity_state"),
                visual: document.getElementById("velocityBar")
            },
            rotation: {
                pitch: document.getElementById("pitch_state"),
                yaw: document.getElementById("yaw_state"),
                roll: document.getElementById("roll_state")
            }
        },
        menu: {
            playerName: document.getElementById("playername"),
            joinButton: document.getElementById("join-button")

        },
        settings: {
            settings: document.getElementById("settings"),
            settingsButton: document.getElementById("settings-button"),
            settingsCancelButton: document.getElementById("settings-cancel-button"),
            settingsApplyButton: document.getElementById("settings-apply-button")
        },
        other: {
            glapIoTk: document.getElementById("glap-seo-opt")
        }
    }
    _settingsData = {
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

    _isLocked = false

    _renderer = null
    _scene = null
    _camera = null
    _composer = null

    _serverUrl = "wss://server.glap3d.ga"

    _planets = []
    _skysphere = null

    _textureLoader = new THREE.TextureLoader()

    _defaultMaterial_planet = new THREE.MeshStandardMaterial({
        emissive: 0x222222
    })
    _defaultMaterial_module = new THREE.MeshStandardMaterial({
        emissive: 0x111111
    })

    _thisPlayer = {
        instance: 0,
        position: new THREE.Vector3(0, 0, 0),
        cameraRotation: new THREE.Euler(0, 0, 0, "YXZ"),
        bestVelocity: 0
    }
    _gameData = {
        bandwidth: 0,
        lastRender: performance.now(),
        playersOnline: 0,
        fps: 0
    }
    PI_2 = Math.PI / 2

    _checkWebGL() { //
        var canvas = document.createElement("canvas");
        if (!(canvas.getContext("webgl") && window.WebGLRenderingContext)) {
            if (window.WebGLRenderingContext) {
                log("ERROR! Your graphics card doesn't support WebGL.");
            } else {
                log("ERROR! Your browser doesn't support WebGL.");
            }
            return false;
        }
        return true;
    }
    _initializeWebGL() { //
        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400000);
        this._renderer = new THREE.WebGLRenderer({
            logarithmicDepthBuffer: true
        });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _initializeSettingsService() { //
        let loadedsettings = JSON.parse(localStorage.getItem("settingsData")) || {
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
            this._settingsData[key].current = val;
        }

        document.querySelector("div.reload-alert").style.display = "none";
        for (let [key, val] of Object.entries(this._settingsData)) {
            this._settingsData[key].textelem = document.getElementById(key + "_text");
            this._settingsData[key].textelem.innerText = this._settingsData[key].setting[this._settingsData[key].current];
            document.getElementById(key + "_left").addEventListener("click", function () {
                this._settingsData[key].current = Math.max(0, this._settingsData[key].current - 1);
                this._settingsData[key].textelem.innerText = this._settingsData[key].setting[this._settingsData[key].current];
            })
            document.getElementById(key + "_right").addEventListener("click", function () {
                this._settingsData[key].current = Math.min(this._settingsData[key].setting.length - 1, this._settingsData[key].current + 1);
                this._settingsData[key].textelem.innerText = this._settingsData[key].setting[this._settingsData[key].current];
            })
        }
        this._settingsOn = false;
        document.getElementById("settings-button").addEventListener("click", () => {
            this._settingsOn = true;
            document.querySelector(".settings").style.display = "block";
        })
        document.getElementById("cancel-button").addEventListener("click", () => {
            this._settingsOn = false;
            document.querySelector(".settings").style.display = "none";
        })
        document.getElementById("apply-button").addEventListener("click", () => {
            var i = {};
            for (let [key, val] of Object.entries(this._settingsData)) {
                i[key] = val.current;
            }
            localStorage.setItem("settingsData", JSON.stringify(i));
            this._settingsOn = false;
            document.querySelector(".settings").style.display = "none";
        })
    }
    _initializeUIElements() { //
        /*_uiDOMElements = {
            gauges: {
                power: {
                    state: document.getElementById("power_state"),
                    visual: document.getElementById("powerBar")
                },
                velocity: {
                    state: document.getElementById("velocity_state"),
                    visual: document.getElementById("velocityBar")
                },
                rotation: {
                    pitch: document.getElementById("pitch_state"),
                    yaw: document.getElementById("yaw_state"),
                    roll: document.getElementById("roll_state")
                }
            },
            menu: {
                playerName: document.getElementById("playername"),
                joinButton: document.getElementById("join-button")

            },
            settings: {
                settings: document.getElementById("settings"),
                settingsButton: document.getElementById("settings-button"),
                settingsCancelButton: document.getElementById("settings-cancel-button"),
                settingsApplyButton: document.getElementById("settings-apply-button")
            },
            other: {
                glapIoTk: document.getElementById("glap-seo-opt")
            }
        }*/
    }
    _setFilter(filt) { //
        switch (filt) {
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
    }
    _makeObjects() { //
        let alight = new THREE.PointLight(0xffffff, 1, 0, 1);
        this._scene.add(alight);

        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(10000, 64, 64)), this._defaultMaterial_planet);
        this._planets[0].material.emissive = 0xffffff;
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(100, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(125, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(150, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(137.5, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(2500, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(750, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(1000, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(600, 64, 64)), this._defaultMaterial_planet);
        this._planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(50, 64, 64)), this._defaultMaterial_planet);

        this._planets.forEach(e => {
            this._scene.add(e);
        })



    }
    _applyTextures(settings) { //
        let textureQualityHttpEnder;
        switch (settings.quality) {
            case 0:
                textureQualityHttpEnder = "_low.png";
                break;
            case 1:
                textureQualityHttpEnder = "_medium.png";
                break;
            case 2:
                textureQualityHttpEnder = "_high.png";
                break;
            case 3:
                textureQualityHttpEnder = "_ultra.png";
                break;
        }
        let skysphereQuality;
        switch (settings.skyquality) {
            case 0:
                skysphereQuality = "_low.png";
                break;
            case 1:
                skysphereQuality = "_medium.png";
                break;
            case 2:
                skysphereQuality = "_high.png";
                break;
            case 3:
                skysphereQuality = "_ultra.png";
                break;
        }
        this.applyTextureAsync("assets/sun/sun" + textureQualityHttpEnder, this._planets[0], true, true, false, false)
        this.applyTextureAsync("assets/merc/merc" + textureQualityHttpEnder, this._planets[1], true, true, false, false)
        this.applyTextureAsync("assets/vens/vens" + textureQualityHttpEnder, this._planets[2], true, true, false, false)
        this.applyTextureAsync("assets/erth/erth" + textureQualityHttpEnder, this._planets[3], true, true, false, false)
        this.applyTextureAsync("assets/mars/mars" + textureQualityHttpEnder, this._planets[4], true, true, false, false)
        this.applyTextureAsync("assets/jupt/jupt" + textureQualityHttpEnder, this._planets[5], true, true, false, false)
        this.applyTextureAsync("assets/strn/strn" + textureQualityHttpEnder, this._planets[6], true, true, false, false)
        this.applyTextureAsync("assets/urns/urns" + textureQualityHttpEnder, this._planets[7], true, true, false, false)
        this.applyTextureAsync("assets/nept/nept" + textureQualityHttpEnder, this._planets[8], true, true, false, false)
        this.applyTextureAsync("assets/moon/moon" + textureQualityHttpEnder, this._planets[9], true, true, false, false)

        this.applyTextureAsync("assets/sun/sun_ao.png", this._planets[0], false, false, true, true)
        this.applyTextureAsync("assets/merc/merc_ao.png", this._planets[1], false, false, true, true)
        this.applyTextureAsync("assets/vens/vens_ao.png", this._planets[2], false, false, true, true)
        this.applyTextureAsync("assets/erth/erth_ao.png", this._planets[3], false, false, true, true)
        this.applyTextureAsync("assets/mars/mars_ao.png", this._planets[4], false, false, true, true)
        this.applyTextureAsync("assets/jupt/jupt_ao.png", this._planets[5], false, false, true, true)
        this.applyTextureAsync("assets/strn/strn_ao.png", this._planets[6], false, false, true, true)
        this.applyTextureAsync("assets/urns/urns_ao.png", this._planets[7], false, false, true, true)
        this.applyTextureAsync("assets/nept/nept_ao.png", this._planets[8], false, false, true, true)
        this.applyTextureAsync("assets/moon/moon_ao.png", this._planets[9], false, false, true, true)

        this.applyTextureAsync("assets/starfield/starfield" + skysphereQuality, this._skysphere, true, false, false, false);
    }
    applyTextureAsync(url, target, isMap, isEmissive, isAO, isDisplacement) {
        this._textureLoader.load(url, function (texture) {
            if (isMap) target.material.map = texture;
            if (isEmissive) target.material.emissiveMap = texture;
            if (isAO) target.material.aoMap = texture;
            if (isDisplacement) target.material.displacementMap = texture;
        })
    }
    _initializePostprocessing(settings = {
        aa: true,
        depthOfField: true,
        aaPreset: 3,
        godrays: true,
        bloom: true
    }) { //
        this._composer = new POSTPROCESSING.EffectComposer(this._renderer);
        this._composer.addPass(new POSTPROCESSING.RenderPass(this._scene, this._renderer));

        if (settings.aa) {
            let areaImage = new Image();
            areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
            let searchImage = new Image();
            searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
            this._composer.addPass(new POSTPROCESSING.EffectPass(this._camera, new POSTPROCESSING.SMAAEffect(searchImage, areaImage, settings.aaPreset, POSTPROCESSING.EdgeDetectionMode.DEPTH)));
        }

        if (settings.depthOfField) {
            let dof = new POSTPROCESSING.DepthOfFieldEffect(this._camera);
            dof.renderToScreen = true;
            this._composer.addPass(new POSTPROCESSING.EffectPass(this._camera, dof));
        }

        if (settings.godrays) {
            let gd = new POSTPROCESSING.GodRaysEffect(this._camera, this._planetsData["sun"].mesh);
            gd.renderToScreen = true;
            this._composer.addPass(new POSTPROCESSING.EffectPass(gd));
        }

        if (settings.bloom) {
            let bl = new POSTPROCESSING.BloomEffect();
            bl.renderToScreen = true;
            this._composer.addPass(new POSTPROCESSING.EffectPass(bl));
        }
    }

    onWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._composer.setSize(window.innerWidth, window.innerHeight);
        this._camera.updateProjectionMatrix();
    }
    canvasOnClickPointerlock() {
        if (this._thisPlayer.instance == 0) return;
        this._renderer.domElement.requestPointerLock();
    }
    pointerLockMouseMove(ev) {
        if (!this._isLocked) return;
        let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        this._thisPlayer.cameraRotation.setFromQuaternion(this._camera.quaternion);
        this._thisPlayer.cameraRotation.y -= movementX * 0.002;
        this._thisPlayer.cameraRotation.x -= movementY * 0.002;
        this._thisPlayer.cameraRotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this._thisPlayer.cameraRotation.x));
        this._camera.quaternion.setFromEuler(this._thisPlayer.cameraRotation);
        //todo uint8 network 4, ex, ey
        let arraybuffer = new ArrayBuffer(16);
        let dv = new DataView(arraybuffer);
        let name = this._uiDOMElements.menu.playerName.slice(0, 15);
    }
    pointerLockChange() {
        if (document.pointerLockElement == this._renderer.domElement) {
            this._isLocked = true;
        } else {
            this._isLocked = false;
        }
    }
    _setupEventListeners() {
        document.addEventListener('mousemove', this.pointerLockMouseMove, false);
        document.addEventListener('pointerlockchange', this.pointerLockChange, false);
        document.addEventListener('click', this.canvasOnClickPointerlock, false);
        document.addEventListener('resize', this.onWindowResize, false);
    }
    _skySphereInit() {
        this._skysphere = new THREE.Mesh(new THREE.SphereBufferGeometry(160000, 256, 256), new THREE.MeshBasicMaterial({
            side: THREE.BackSide
        }));
        scene.add(this._skysphere);
    }

    _textures = [
        this._textureLoader.load("assets/modules/heart.png")
    ]

    _wsInit(serverUrl) {
        this._ws = new WebSocket("wss://server.glap3d.ga");
        this._ws.binaryType = "arraybuffer";
        this._ws.onclose = this.wsOnClose;
        this._ws.onopen = this.wsOnOpen;
        this._ws.onerror = this.wsOnError;
        this._ws.onmessage = this.wsOnMessage;
    }
    _joinGame() {
        this._uiDOMElements.other.glapIoTk.style.display = "none";
        let arraybuffer = new ArrayBuffer(16);
        let dv = new DataView(arraybuffer);
        let name = this._uiDOMElements.menu.playerName.slice(0, 15);

        let encodedName = this._textencoder.encode(name);
        encodedName.forEach((e, i) => {
            dv.setUint8(i + 1, e);
        })

        this._ws.send(arraybuffer);
    }
    wsOnOpen() {
        this._uiDOMElements.menu.joinButton.innerHTML = "Join";
        let self = this;
        this._uiDOMElements.menu.joinButton.addEventListener("click", function () {
            self._joinGame();
        })
    }
    wsOnClose(reason) {
        log("Code: " + reason.code);
    }
    wsOnError() {
        log("CONNECTION ERROR!")
    }

    const_planetlength = 10
    const_planetbytelength = 13
    const_objectbytelength = 24

    _textencoder = new TextEncoder("utf-8")
    _textdecoder = new TextDecoder("utf-8")

    wsOnMessage(message) {
        var u8 = new Uint8Array(message);
        this._gameData.bandwidth += u8.byteLength;
        switch (u8[0]) {
            case 0:
                this._thisPlayer.instance = u8[1] + (u8[2] << 8);
                break;
            case 1:
                for (i = 0; i < u8[1]; i++) {
                    let v = (this.const_planetbytelength * i) + 1;
                    let id = u8[1 + v] + (u8[2 + v] << 8);
                    if (i != id) {
                        throw new Error("Loop index and planet index are not correct. / " + id + " != " + i);
                    }

                    let x = (u8[3 + v] + (u8[4 + v] << 8) + (u8[5 + v] << 16) + (u8[6 + v] << 24) + (u8[7 + v] << 32)) / 256;
                    let z = (u8[8 + v] + (u8[9 + v] << 8) + (u8[10 + v] << 16) + (u8[11 + v] << 24) + (u8[12 + v] << 32)) / 256;
                    let sign = u8[13 + v].toString(2);
                    if (sign.slice(-1) == "1") x *= -1;
                    if (sign.slice(-2, -1) == "1") x *= -1;

                    planets[id].position.x = x;
                    planets[id].position.z = z;
                }
                let ofs = this.const_planetlength * this.const_planetbytelength + 2
                for (i = 0; i < u8[ofs] + (u8[ofs + 1] << 8); i++) {
                    let v = ofs + i * this.const_objectbytelength;
                    let id = u8[22 + v] + (u8[23 + v] << 8);
                    if (u8[id] != i) {
                        throw new Error("Loop index and object index are not correct. / " + id + " != " + i);
                    }
                    let sign = u8[24 + v];
                    let x = (u8[1 + v] + (u8[2 + v] << 8) + (u8[3 + v] << 16) + (u8[4 + v] << 24) + (u8[5 + v] << 32)) / 256;
                    let y = (u8[6 + v] + (u8[7 + v] << 8) + (u8[8 + v] << 16) + (u8[9 + v] << 24) + (u8[10 + v] << 32)) / 256;
                    let z = (u8[11 + v] + (u8[12 + v] << 8) + (u8[13 + v] << 16) + (u8[14 + v] << 24) + (u8[15 + v] << 32)) / 256;

                    let qx = u8[16 + v] / 128;
                    let qy = u8[17 + v] / 128;
                    let qz = u8[18 + v] / 128;

                    if (!!(sign & 1)) x *= -1;
                    if (!!(sign & 2)) y *= -1;
                    if (!!(sign & 4)) z *= -1;
                    if (!!(sign & 8)) qx *= -1;
                    if (!!(sign & 16)) qy *= -1;
                    if (!!(sign & 32)) qz *= -1;

                    let qw = 1 - (qx + qy + qz);

                    let pos = new THREE.Vector3(x, y, z);
                    let quat = new THREE.Quaternion(qx, qy, qz, qw).normalize();

                    let owner = u8[20 + v] + (u8[21 + v] << 8);

                    this._scene.children.forEach(e => {
                        if (e.userData.id == id) {
                            e.position = pos;
                            e.quaternion = quat;
                            if (owner == this._thisPlayer.instance && u8[19 + v] == 0) {
                                this._thisPlayer.position = pos;

                                this._uiDOMElements.gauges.rotation.pitch.innerText = "PITCH: " + (e.rotation.x * (180 / Math.PI)).toFixed(2);
                                this._uiDOMElements.gauges.rotation.yaw.innerText = "YAW: " + (e.rotation.y * (180 / Math.PI)).toFixed(2);
                                this._uiDOMElements.gauges.rotation.roll.innerText = "ROLL: " + (e.rotation.z * (180 / Math.PI)).toFixed(2);
                            }

                        }
                    })
                }
                break;
            case 2:
                let geometry, material;
                switch (u8[1]) {
                    case 0:
                        geometry = new THREE.BoxBufferGeometry(10, 10, 10);
                        material = this._defaultMaterial_planet;
                }
                material.map = this._textures[u8[1]];
                material.emissiveMap = this._textures[u8[1]];
                let mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.order = "YXZ";
                mesh.userData.id = u8[2] + (u8[3] << 8);
                if (u8[1] == 0) {
                    mesh.add(new THREE.PointLight(0xfa0000, 1, 50));
                    mesh.userData.instance = u8[4] + (u8[5] << 8);
                }
                this._scene.add(mesh);
                break;

            case 3:
                log("<span style=\"color:gold\">" + this._textdecoder.decode(new Uint8Array(u8.slice(3, 15))) + " joined the game</span>");
                break;
            case 4:
                log("<span style=\"color:gold\">" + this._textdecoder.decode(new Uint8Array(u8.slice(1, 15))) + " left the game</span>");
                this._scene.children.forEach((e, i) => {
                    if (e.userData.owner == u8[16] + (u8[17] << 8) || e.userData.instance == u8[16] + (u8[17] << 8)) scene.remove(scene.children[i]);
                })
                break;

            case 5:
                break;
            case 6:
                let power = u8[1] + (u8[2] << 8) + (u8[3] << 16) + (u8[4] << 24);
                let maxPower = u8[5] + (u8[6] << 8) + (u8[7] << 16) + (u8[8] << 24);
                let velocity = u8[9] + (u8[10] << 8) + (u8[11] << 16) + (u8[12] << 24);
                this._uiDOMElements.gauges.power.state.innerHTML = "POWER: " + power + " / " + maxPower;
                this._uiDOMElements.gauges.power.visual.style.width = "" + (power / maxPower * 100) + "%";
                this._uiDOMElements.gauges.velocity.state.innerHTML = "VELOCITY: " + velocity;
                this._thisPlayer.bestVelocity = Math.max(this._thisPlayer.bestVelocity, velocity);
                var i = velocity / this._thisPlayer.bestVelocity * 100;
                this._uiDOMElements.gauges.velocity.visual.style.width = i + "%";
                if (i < 5) {
                    this._uiDOMElements.gauges.velocity.state.style.color = "rgb(163, 14, 0)";
                } else if (i < 20) {
                    this._uiDOMElements.gauges.velocity.state.style.color = "rgb(252, 186, 3)";
                } else {
                    this._uiDOMElements.gauges.velocity.state.style.color = "white";
                }
                break;
            case 7:
                this._gameData.playersOnline = u8[1] + (u8[2] << 8);
                break;
        }
        return false;
    }

    currentlyActiveKeys = []

    onKeyDown(e) {
        if (!this._isLocked || this.currentlyActiveKeys[e.keyCode]) return;
        this.currentlyActiveKeys[e.keyCode] = !0;
        let ab = new ArrayBuffer(2);
        let dv = new DataView(ab);
        dv.setUint8(0, 1);
        dv.setUint8(1, e.keyCode);
        this._ws.send(ab);
    }
    onKeyUp(e) {
        if (!this._isLocked) return;
        this.currentlyActiveKeys[e.keyCode] = !1;
        let ab = new ArrayBuffer(2);
        let dv = new DataView(ab);
        dv.setUint8(0, 2);
        dv.setUint8(1, e.keyCode);
        this._ws.send(ab);
    }
    _zoomOut = 60
    _renderLastSecond = null
    _renderLastTime = null
    animate() {
        requestAnimationFrame(this.animate);
        this._camera.rotation.x = Math.sin(this._thisPlayer.cameraRotation.y) * Math.sin(this._thisPlayer.cameraRotation.x + this.PI_2) * this._zoomOut + this._thisPlayer.position.x;
        this._camera.rotation.y = -Math.sin(this._thisPlayer.cameraRotation.x) * this._zoomOut + this._thisPlayer.position.y;
        this._camera.rotation.z = Math.cos(this._thisPlayer.cameraRotation.y) * Math.sin(this._thisPlayer.cameraRotation.x + this.PI_2) * this._zoomOut + this._thisPlayer.position.z;
        this._composer.render();
        this._gameData.fps++;
        let perfnow = performance.now();
        if (perfnow - this._renderLastSecond >= 1000) {
            this._renderLastSecond = perfnow;

            stats.innerHTML = this.getTime() + " <span style='color:rgb(48, 179, 30)'>draw call " + this._gameData.lastRender.toFixed(1) + " ms</span> <span style='color:rgb(22, 127, 219)'>" + this._gameData.fps + " fps</span> <span style='color: rgb(107, 30, 179)'>" + (this._gameData.bandwidth / 1024).toFixed(1) + " kB/s</span> <span style='color:rgb(24, 240, 121)'>" + this._gameData.playersOnline + " players online</span>";
            this._gameData.fps = 0;
            this._gameData.bandwidth = 0;
        }

        if (this._renderLastTime) this._gameData.lastRender = perfnow - this._renderLastTime;
        this._renderLastTime = perfnow;
        if (!this._renderLastSecond) this._renderLastSecond = perfnow;
    }
    getTime() {
        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();
        m = this.checkNum(m);
        s = this.checkNum(s);
        return h + ":" + m + ":" + s;
    }
    checkNum(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    openGameButton() {
        this._uiDOMElements.menu.joinButton.querySelector("div").innerText = "Join";
        this._uiDOMElements.menu.joinButton.disabled = false;
    }
}
var game = new player("wss://server.glap3d.ga");
