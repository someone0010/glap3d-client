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
function animate() {
    requestAnimationFrame(animate);
    _camera.rotation.x = Math.sin(_thisPlayer.cameraRotation.y) * Math.sin(_thisPlayer.cameraRotation.x + PI_2) * _zoomOut + _thisPlayer.position.x;
    _camera.rotation.y = -Math.sin(_thisPlayer.cameraRotation.x) * _zoomOut + _thisPlayer.position.y;
    _camera.rotation.z = Math.cos(_thisPlayer.cameraRotation.y) * Math.sin(_thisPlayer.cameraRotation.x + PI_2) * _zoomOut + _thisPlayer.position.z;
    _composer.render();
    _gameData.fps++;
    let perfnow = performance.now();
    if (perfnow - _renderLastSecond >= 1000) {
        _renderLastSecond = perfnow;

        stats.innerHTML = getTime() + " <span style='color:rgb(48, 179, 30)'>draw call " + _gameData.lastRender.toFixed(1) + " ms</span> <span style='color:rgb(22, 127, 219)'>" + _gameData.fps + " fps</span> <span style='color: rgb(107, 30, 179)'>" + (_gameData.bandwidth / 1024).toFixed(1) + " kB/s</span> <span style='color:rgb(24, 240, 121)'>" + _gameData.playersOnline + " players online</span>";
        _gameData.fps = 0;
        _gameData.bandwidth = 0;
    }

    if (_renderLastTime) _gameData.lastRender = perfnow - _renderLastTime;
    _renderLastTime = perfnow;
    if (!_renderLastSecond) _renderLastSecond = perfnow;
}
    function init(gameServerUrl) {
        _uiDOMElements.menu.joinButton.disabled = true;
        document.getElementById("join-button").querySelector("div").innerText = "Loading..";
        if (!_checkWebGL()) {
            alert("Your graphics card/browser doesn't support WebGL!");
            return;
        }
        //_initializeUIElements();
        _initializeSettingsService();
        _initializeWebGL();
        _setFilter(_settingsData.flt.current);
        _makeObjects();
        _skySphereInit();
        _setupEventListeners();
        _applyTextures({
            quality: _settingsData["gq"].current,
            skyquality: _settingsData["sk"].current
        });
        _initializePostprocessing({
            aa: _settingsData.aa.current > 0,
            depthOfField: !!_settingsData.dof.current,
            aaPreset: _settingsData.aa.current-1,
            godrays: !!_settingsData.gd.current,
            bloom: !!_settingsData.bl.current
        });

        openGameButton();
        
    }
    var _settingsOn = false
    var _uiDOMElements = {
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
    var _settingsData = {
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

    var _isLocked = false

    var _renderer = null
    var _scene = null
    var _camera = null
    var _composer = null

    var _serverUrl = "wss://server.glap3d.ga"

    var _planets = []
    var _skysphere = null

    var _textureLoader = new THREE.TextureLoader()

    var _defaultMaterial_planet = new THREE.MeshStandardMaterial({
        emissive: 0x222222
    })
    var _defaultMaterial_module = new THREE.MeshStandardMaterial({
        emissive: 0x111111
    })

    var _thisPlayer = {
        instance: 0,
        position: new THREE.Vector3(0, 0, 0),
        cameraRotation: new THREE.Euler(0, 0, 0, "YXZ"),
        bestVelocity: 0
    }
    var _gameData = {
        bandwidth: 0,
        lastRender: performance.now(),
        playersOnline: 0,
        fps: 0
    }
    var PI_2 = Math.PI / 2

    function _checkWebGL() { //
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
    function _initializeWebGL() { //
        _scene = new THREE.Scene();
        _camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400000);
        _renderer = new THREE.WebGLRenderer({
            logarithmicDepthBuffer: true
        });
        _renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(_renderer.domElement);
    }

    function _initializeSettingsService() { //
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
            _settingsData[key].current = val;
        }

        document.querySelector("div.reload-alert").style.display = "none";
        for (let [key, val] of Object.entries(_settingsData)) {
            _settingsData[key].textelem = document.getElementById(key + "_text");
            _settingsData[key].textelem.innerText = _settingsData[key].setting[_settingsData[key].current];
            document.getElementById(key + "_left").addEventListener("click", function () {
                _settingsData[key].current = Math.max(0, _settingsData[key].current - 1);
                _settingsData[key].textelem.innerText = _settingsData[key].setting[_settingsData[key].current];
            })
            document.getElementById(key + "_right").addEventListener("click", function () {
                _settingsData[key].current = Math.min(_settingsData[key].setting.length - 1, _settingsData[key].current + 1);
                _settingsData[key].textelem.innerText = _settingsData[key].setting[_settingsData[key].current];
            })
        }
        _settingsOn = false;
        document.getElementById("settings-button").addEventListener("click", () => {
            _settingsOn = true;
            document.querySelector(".settings").style.display = "block";
        })
        document.getElementById("cancel-button").addEventListener("click", () => {
            _settingsOn = false;
            document.querySelector(".settings").style.display = "none";
        })
        document.getElementById("apply-button").addEventListener("click", () => {
            var i = {};
            for (let [key, val] of Object.entries(_settingsData)) {
                i[key] = val.current;
            }
            localStorage.setItem("settingsData", JSON.stringify(i));
            _settingsOn = false;
            document.querySelector(".settings").style.display = "none";
        })
    }
    function  _initializeUIElements() { //
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
    function _setFilter(filt) { //
        switch (filt) {
            case 0:
                _renderer.toneMapping = THREE.NoToneMapping;
                break;
            case 1:
                _renderer.toneMapping = THREE.LinearToneMapping;
                break;
            case 2:
                _renderer.toneMapping = THREE.ReinhardToneMapping;
                break;
            case 3:
                _renderer.toneMapping = THREE.ACESFilmicToneMapping;
                break;
        }
    }
    function _makeObjects() { //
        let alight = new THREE.PointLight(0xffffff, 1, 0, 1);
        _scene.add(alight);

        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(10000, 64, 64), _defaultMaterial_planet));
        _planets[0].material.emissive = 0xffffff;
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(100, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(125, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(150, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(137.5, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(2500, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(750, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(1000, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(600, 64, 64), _defaultMaterial_planet));
        _planets.push(new THREE.Mesh(new THREE.SphereBufferGeometry(50, 64, 64), _defaultMaterial_planet));

        _planets.forEach(e => {
            _scene.add(e);
        })



    }
    function _applyTextures(settings) { //
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
        applyTextureAsync("assets/sun/sun" + textureQualityHttpEnder, _planets[0], true, true, false, false)
        applyTextureAsync("assets/merc/merc" + textureQualityHttpEnder, _planets[1], true, true, false, false)
        applyTextureAsync("assets/vens/vens" + textureQualityHttpEnder, _planets[2], true, true, false, false)
        applyTextureAsync("assets/erth/erth" + textureQualityHttpEnder, _planets[3], true, true, false, false)
        applyTextureAsync("assets/mars/mars" + textureQualityHttpEnder, _planets[4], true, true, false, false)
        applyTextureAsync("assets/jupt/jupt" + textureQualityHttpEnder, _planets[5], true, true, false, false)
        applyTextureAsync("assets/strn/strn" + textureQualityHttpEnder, _planets[6], true, true, false, false)
        applyTextureAsync("assets/urns/urns" + textureQualityHttpEnder, _planets[7], true, true, false, false)
        applyTextureAsync("assets/nept/nept" + textureQualityHttpEnder, _planets[8], true, true, false, false)
        applyTextureAsync("assets/moon/moon" + textureQualityHttpEnder, _planets[9], true, true, false, false)

        applyTextureAsync("assets/sun/sun_ao.png", _planets[0], false, false, true, true)
        applyTextureAsync("assets/merc/merc_ao.png", _planets[1], false, false, true, true)
        applyTextureAsync("assets/vens/vens_ao.png", _planets[2], false, false, true, true)
        applyTextureAsync("assets/erth/erth_ao.png", _planets[3], false, false, true, true)
        applyTextureAsync("assets/mars/mars_ao.png", _planets[4], false, false, true, true)
        applyTextureAsync("assets/jupt/jupt_ao.png", _planets[5], false, false, true, true)
        applyTextureAsync("assets/strn/strn_ao.png", _planets[6], false, false, true, true)
        applyTextureAsync("assets/urns/urns_ao.png", _planets[7], false, false, true, true)
        applyTextureAsync("assets/nept/nept_ao.png", _planets[8], false, false, true, true)
        applyTextureAsync("assets/moon/moon_ao.png", _planets[9], false, false, true, true)

        applyTextureAsync("assets/starfield/starfield" + skysphereQuality, _skysphere, true, false, false, false);
    }
    function applyTextureAsync(url, target, isMap, isEmissive, isAO, isDisplacement) {
        let texture = _textureLoader.load(url);
            if (isMap) target.material.map = texture;
            if (isEmissive) target.material.emissiveMap = texture;
            if (isAO) target.material.aoMap = texture;
            if (isDisplacement) target.material.displacementMap = texture;
        
    }
    function _initializePostprocessing(settings = {
        aa: true,
        depthOfField: true,
        aaPreset: 3,
        godrays: true,
        bloom: true
    }) { //
        _composer = new POSTPROCESSING.EffectComposer(_renderer);
        _composer.addPass(new POSTPROCESSING.RenderPass(_scene, _camera));

        if (settings.aa) {
            let areaImage = new Image();
            areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;
            let searchImage = new Image();
            searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;
            _composer.addPass(new POSTPROCESSING.EffectPass(_camera, new POSTPROCESSING.SMAAEffect(searchImage, areaImage, settings.aaPreset, POSTPROCESSING.EdgeDetectionMode.DEPTH)));
        }

        if (settings.depthOfField) {
            let dof = new POSTPROCESSING.DepthOfFieldEffect(_camera);
            dof.renderToScreen = true;
            _composer.addPass(new POSTPROCESSING.EffectPass(_camera, dof));
        }

        if (settings.godrays) {
            let gd = new POSTPROCESSING.GodRaysEffect(_camera, _planets[0]);
            gd.renderToScreen = true;
            _composer.addPass(new POSTPROCESSING.EffectPass(gd));
        }

        if (settings.bloom) {
            let bl = new POSTPROCESSING.BloomEffect();
            bl.renderToScreen = true;
            _composer.addPass(new POSTPROCESSING.EffectPass(bl));
        }
    }

    function onWindowResize() {
        _camera.aspect = window.innerWidth / window.innerHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(window.innerWidth, window.innerHeight);
        _composer.setSize(window.innerWidth, window.innerHeight);
        
    }
    function canvasOnClickPointerlock() {
        if (_thisPlayer.instance == 0) return;
        _renderer.domElement.requestPointerLock();
    }
    function pointerLockMouseMove(ev) {
        if (!_isLocked) return;
        let movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        let movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        _thisPlayer.cameraRotation.setFromQuaternion(_camera.quaternion);
        _thisPlayer.cameraRotation.y -= movementX * 0.002;
        _thisPlayer.cameraRotation.x -= movementY * 0.002;
        _thisPlayer.cameraRotation.x = Math.max(-PI_2, Math.min(PI_2, _thisPlayer.cameraRotation.x));
        _camera.quaternion.setFromEuler(_thisPlayer.cameraRotation);
        //todo uint8 network 4, ex, ey
        let arraybuffer = new ArrayBuffer(16);
        let dv = new DataView(arraybuffer);
        let name = _uiDOMElements.menu.playerName.slice(0, 15);
    }
    function pointerLockChange() {
        if (document.pointerLockElement == _renderer.domElement) {
            _isLocked = true;
        } else {
            _isLocked = false;
        }
    }
    function _setupEventListeners() {
        document.addEventListener('mousemove', pointerLockMouseMove, false);
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('click', canvasOnClickPointerlock, false);
        window.addEventListener('resize', onWindowResize, false);
    }
    function _skySphereInit() {
        _skysphere = new THREE.Mesh(new THREE.SphereBufferGeometry(160000, 256, 256), new THREE.MeshBasicMaterial({
            side: THREE.BackSide
        }));
        _scene.add(_skysphere);
    }

    var _textures = [
        _textureLoader.load("assets/modules/heart.png")
    ]

    function _wsInit(serverUrl) {
        _ws = new WebSocket("wss://server.glap3d.ga");
        _ws.binaryType = "arraybuffer";
        _ws.onclose = wsOnClose;
        _ws.onopen = wsOnOpen;
        _ws.onerror = wsOnError;
        _ws.onmessage = wsOnMessage;
    }
    function _joinGame() {
        _uiDOMElements.other.glapIoTk.style.display = "none";
        let arraybuffer = new ArrayBuffer(16);
        let dv = new DataView(arraybuffer);
        let name = _uiDOMElements.menu.playerName.slice(0, 15);

        let encodedName = _textencoder.encode(name);
        encodedName.forEach((e, i) => {
            dv.setUint8(i + 1, e);
        })

        _ws.send(arraybuffer);
    }
    function wsOnOpen() {
        _uiDOMElements.menu.joinButton.innerHTML = "Join";
        _uiDOMElements.menu.joinButton.addEventListener("click", function () {
            _joinGame();
        })
    }
    function wsOnClose(reason) {
        log("Code: " + reason.code);
    }
    function wsOnError() {
        log("CONNECTION ERROR!")
    }

    const const_planetlength = 10
    const const_planetbytelength = 13
    const const_objectbytelength = 24

    var _textencoder = new TextEncoder("utf-8")
    var _textdecoder = new TextDecoder("utf-8")

    function wsOnMessage(message) {
        var u8 = new Uint8Array(message);
        _gameData.bandwidth += u8.byteLength;
        switch (u8[0]) {
            case 0:
                _thisPlayer.instance = u8[1] + (u8[2] << 8);
                break;
            case 1:
                for (i = 0; i < u8[1]; i++) {
                    let v = (const_planetbytelength * i) + 1;
                    let id = u8[1 + v] + (u8[2 + v] << 8);
                    if (i != id) {
                        throw new Error("Loop index and planet index are not correct. / " + id + " != " + i);
                    }

                    let x = (u8[3 + v] + (u8[4 + v] << 8) + (u8[5 + v] << 16) + (u8[6 + v] << 24) + (u8[7 + v] << 32)) / 256;
                    let z = (u8[8 + v] + (u8[9 + v] << 8) + (u8[10 + v] << 16) + (u8[11 + v] << 24) + (u8[12 + v] << 32)) / 256;
                    let sign = u8[13 + v].toString(2);
                    if (sign.slice(-1) == "1") x *= -1;
                    if (sign.slice(-2, -1) == "1") x *= -1;

                    _planets[id].position.x = x;
                    _planets[id].position.z = z;
                }
                let ofs = const_planetlength * const_planetbytelength + 2
                for (i = 0; i < u8[ofs] + (u8[ofs + 1] << 8); i++) {
                    let v = ofs + i * const_objectbytelength;
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

                    _scene.children.forEach(e => {
                        if (e.userData.id == id) {
                            e.position = pos;
                            e.quaternion = quat;
                            if (owner == _thisPlayer.instance && u8[19 + v] == 0) {
                                _thisPlayer.position = pos;

                                _uiDOMElements.gauges.rotation.pitch.innerText = "PITCH: " + (e.rotation.x * (180 / Math.PI)).toFixed(2);
                                _uiDOMElements.gauges.rotation.yaw.innerText = "YAW: " + (e.rotation.y * (180 / Math.PI)).toFixed(2);
                                _uiDOMElements.gauges.rotation.roll.innerText = "ROLL: " + (e.rotation.z * (180 / Math.PI)).toFixed(2);
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
                        material = _defaultMaterial_planet;
                }
                material.map = _textures[u8[1]];
                material.emissiveMap = _textures[u8[1]];
                let mesh = new THREE.Mesh(geometry, material);
                mesh.rotation.order = "YXZ";
                mesh.userData.id = u8[2] + (u8[3] << 8);
                if (u8[1] == 0) {
                    mesh.add(new THREE.PointLight(0xfa0000, 1, 50));
                    mesh.userData.instance = u8[4] + (u8[5] << 8);
                }
                _scene.add(mesh);
                break;

            case 3:
                log("<span style=\"color:gold\">" + _textdecoder.decode(new Uint8Array(u8.slice(3, 15))) + " joined the game</span>");
                break;
            case 4:
                log("<span style=\"color:gold\">" + _textdecoder.decode(new Uint8Array(u8.slice(1, 15))) + " left the game</span>");
                _scene.children.forEach((e, i) => {
                    if (e.userData.owner == u8[16] + (u8[17] << 8) || e.userData.instance == u8[16] + (u8[17] << 8)) scene.remove(scene.children[i]);
                })
                break;

            case 5:
                break;
            case 6:
                let power = u8[1] + (u8[2] << 8) + (u8[3] << 16) + (u8[4] << 24);
                let maxPower = u8[5] + (u8[6] << 8) + (u8[7] << 16) + (u8[8] << 24);
                let velocity = u8[9] + (u8[10] << 8) + (u8[11] << 16) + (u8[12] << 24);
                _uiDOMElements.gauges.power.state.innerHTML = "POWER: " + power + " / " + maxPower;
                _uiDOMElements.gauges.power.visual.style.width = "" + (power / maxPower * 100) + "%";
                _uiDOMElements.gauges.velocity.state.innerHTML = "VELOCITY: " + velocity;
                _thisPlayer.bestVelocity = Math.max(_thisPlayer.bestVelocity, velocity);
                var i = velocity / _thisPlayer.bestVelocity * 100;
                _uiDOMElements.gauges.velocity.visual.style.width = i + "%";
                if (i < 5) {
                    _uiDOMElements.gauges.velocity.state.style.color = "rgb(163, 14, 0)";
                } else if (i < 20) {
                    _uiDOMElements.gauges.velocity.state.style.color = "rgb(252, 186, 3)";
                } else {
                    _uiDOMElements.gauges.velocity.state.style.color = "white";
                }
                break;
            case 7:
                _gameData.playersOnline = u8[1] + (u8[2] << 8);
                break;
        }
        return false;
    }

    var currentlyActiveKeys = []

    function onKeyDown(e) {
        if (!_isLocked || currentlyActiveKeys[e.keyCode]) return;
        currentlyActiveKeys[e.keyCode] = !0;
        let ab = new ArrayBuffer(2);
        let dv = new DataView(ab);
        dv.setUint8(0, 1);
        dv.setUint8(1, e.keyCode);
        _ws.send(ab);
    }
    function onKeyUp(e) {
        if (!_isLocked) return;
        currentlyActiveKeys[e.keyCode] = !1;
        let ab = new ArrayBuffer(2);
        let dv = new DataView(ab);
        dv.setUint8(0, 2);
        dv.setUint8(1, e.keyCode);
        _ws.send(ab);
    }
    var _zoomOut = 60
    var _renderLastSecond = null
    var _renderLastTime = null
    
    function getTime() {
        let today = new Date();
        let h = today.getHours();
        let m = today.getMinutes();
        let s = today.getSeconds();
        m = checkNum(m);
        s = checkNum(s);
        return h + ":" + m + ":" + s;
    }
    function checkNum(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }
    function openGameButton() {
        _uiDOMElements.menu.joinButton.querySelector("div").innerText = "Join";
        _uiDOMElements.menu.joinButton.disabled = false;
    }

init("wss://server.glap3d.ga");
animate();
