
(() => {
    let canvas;
    let canvasWidth;
    let canvasHeight;
    let gl;
    let ext;
    let run;
    let mat;
    let textures = [];
    let mouse = [0.0, 0.0];
    let isMouseDown = false;

    let scenePrg;
    let noisePrg;
    let resetPrg;
    let positionPrg;
    let velocityPrg;

    const NOISE_RESOLUTION      = 512;
    const POINT_RESOLUTION      = 256;
    const POINT_SIZE            = 2.5;
    const POINT_COLOR           = [0.9, 0.2, 0.1, 0.5];
    const NOISE_BUFFER_INDEX    = 1;
    const POSITION_BUFFER_INDEX = 2;
    const VELOCITY_BUFFER_INDEX = 4;

    window.addEventListener('load', () => {
        // canvas element を取得しサイズをウィンドウサイズに設定
        canvas = document.getElementById('canvas');
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // webgl コンテキストを初期化
        gl = canvas.getContext('webgl');
        if(gl == null){
            console.log('webgl unsupported');
            return;
        }
        mat = new matIV();

        // 拡張機能を有効化
        ext = getWebGLExtensions();

        // Esc キーで実行を止められるようにイベントを設定
        window.addEventListener('keydown', (eve) => {
            run = eve.keyCode !== 27;
        }, false);

        window.addEventListener('mousedown', () => {
            isMouseDown = true;
        }, false);
        window.addEventListener('mouseup', () => {
            isMouseDown = false;
        }, false);
        window.addEventListener('mousemove', (eve) => {
            if(isMouseDown !== true){return;};
            let x = (eve.clientX / canvasWidth) * 2.0 - 1.0;
            let y = (eve.clientY / canvasHeight) * 2.0 - 1.0;
            mouse = [x, -y];
        }, false);

        // シェーダやテクスチャなどの外部リソースを取得
        createTexture('./image/lenna.jpg', (textureObject) => {
            // テクスチャ用画像が非同期で読み込まれたあと引数経由で渡されるので配列に格納
            textures[0] = textureObject;
            // 外部ファイルのシェーダのソースを取得しプログラムオブジェクトを生成
            loadShaderSource(
                './shader/scene.vert',
                './shader/scene.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    scenePrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/noise.vert',
                './shader/noise.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    noisePrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/reset.vert',
                './shader/reset.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    resetPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/position.vert',
                './shader/position.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    positionPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
            loadShaderSource(
                './shader/velocity.vert',
                './shader/velocity.frag',
                (shader) => {
                    let vs = createShader(shader.vs, gl.VERTEX_SHADER);
                    let fs = createShader(shader.fs, gl.FRAGMENT_SHADER);
                    let prg = createProgram(vs, fs);
                    if(prg == null){return;}
                    velocityPrg = new ProgramParameter(prg);
                    loadCheck();
                }
            );
        });
        // シェーダのロードが完了したかチェックし init を呼び出す
        function loadCheck(){
            if(
                scenePrg != null &&
                noisePrg != null &&
                resetPrg != null &&
                positionPrg != null &&
                velocityPrg != null &&
                true
            ){init();}
        }
    }, false);

    function init(texture){
        scenePrg.attLocation[0] = gl.getAttribLocation(scenePrg.program, 'texCoord');
        scenePrg.attStride[0]   = 2;
        scenePrg.uniLocation[0] = gl.getUniformLocation(scenePrg.program, 'mvpMatrix');
        scenePrg.uniLocation[1] = gl.getUniformLocation(scenePrg.program, 'pointSize');
        scenePrg.uniLocation[2] = gl.getUniformLocation(scenePrg.program, 'positionTexture');
        scenePrg.uniLocation[3] = gl.getUniformLocation(scenePrg.program, 'globalColor');
        scenePrg.uniType[0]     = 'uniformMatrix4fv';
        scenePrg.uniType[1]     = 'uniform1f';
        scenePrg.uniType[2]     = 'uniform1i';
        scenePrg.uniType[3]     = 'uniform4fv';

        noisePrg.attLocation[0] = gl.getAttribLocation(noisePrg.program, 'position');
        noisePrg.attStride[0]   = 3;
        noisePrg.uniLocation[0] = gl.getUniformLocation(noisePrg.program, 'resolution');
        noisePrg.uniType[0]     = 'uniform2fv';

        resetPrg.attLocation[0] = gl.getAttribLocation(resetPrg.program, 'position');
        resetPrg.attStride[0]   = 3;
        resetPrg.uniLocation[0] = gl.getUniformLocation(resetPrg.program, 'resolution');
        resetPrg.uniType[0]     = 'uniform2fv';

        positionPrg.attLocation[0] = gl.getAttribLocation(positionPrg.program, 'position');
        positionPrg.attStride[0]   = 3;
        positionPrg.uniLocation[0] = gl.getUniformLocation(positionPrg.program, 'prevTexture');
        positionPrg.uniLocation[1] = gl.getUniformLocation(positionPrg.program, 'velocityTexture');
        positionPrg.uniLocation[2] = gl.getUniformLocation(positionPrg.program, 'resolution');
        positionPrg.uniLocation[3] = gl.getUniformLocation(positionPrg.program, 'move');
        positionPrg.uniType[0]     = 'uniform1i';
        positionPrg.uniType[1]     = 'uniform1i';
        positionPrg.uniType[2]     = 'uniform2fv';
        positionPrg.uniType[3]     = 'uniform1i';

        velocityPrg.attLocation[0] = gl.getAttribLocation(velocityPrg.program, 'position');
        velocityPrg.attStride[0]   = 3;
        velocityPrg.uniLocation[0] = gl.getUniformLocation(velocityPrg.program, 'prevTexture');
        velocityPrg.uniLocation[1] = gl.getUniformLocation(velocityPrg.program, 'positionTexture');
        velocityPrg.uniLocation[2] = gl.getUniformLocation(velocityPrg.program, 'noiseTexture');
        velocityPrg.uniLocation[3] = gl.getUniformLocation(velocityPrg.program, 'resolution');
        velocityPrg.uniLocation[4] = gl.getUniformLocation(velocityPrg.program, 'time');
        velocityPrg.uniLocation[5] = gl.getUniformLocation(velocityPrg.program, 'move');
        velocityPrg.uniLocation[6] = gl.getUniformLocation(velocityPrg.program, 'mouse');
        velocityPrg.uniType[0]     = 'uniform1i';
        velocityPrg.uniType[1]     = 'uniform1i';
        velocityPrg.uniType[2]     = 'uniform1i';
        velocityPrg.uniType[3]     = 'uniform2fv';
        velocityPrg.uniType[4]     = 'uniform1f';
        velocityPrg.uniType[5]     = 'uniform1i';
        velocityPrg.uniType[6]     = 'uniform2fv';

        let pointTexCoord = [];
        for(let i = 0; i < POINT_RESOLUTION; ++i){
            let t = i / POINT_RESOLUTION;
            for(let j = 0; j < POINT_RESOLUTION; ++j){
                let s = j / POINT_RESOLUTION;
                pointTexCoord.push(s, t);
            }
        }
        let pointVBO = [createVbo(pointTexCoord)];

        // vertices
        let planePosition = [
             1.0,  1.0,  0.0,
            -1.0,  1.0,  0.0,
             1.0, -1.0,  0.0,
            -1.0, -1.0,  0.0
        ];
        let planeTexCoord = [
            1.0, 0.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ];
        let planeIndex = [
            0, 1, 2, 2, 1, 3
        ];
        let planeVBO = [createVbo(planePosition)];
        let planeIBO = createIbo(planeIndex);
        let planeTexCoordVBO = [
            createVbo(planePosition),
            createVbo(planeTexCoord)
        ];

        // matrix
        let mMatrix      = mat.identity(mat.create());
        let vMatrix      = mat.identity(mat.create());
        let pMatrix      = mat.identity(mat.create());
        let vpMatrix     = mat.identity(mat.create());
        let mvpMatrix    = mat.identity(mat.create());
        mat.lookAt([0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);
        mat.perspective(60, canvasWidth / canvasHeight, 0.1, 20.0, pMatrix);
        mat.multiply(pMatrix, vMatrix, vpMatrix);

        // framebuffer
        let noiseFramebuffer = createFramebuffer(NOISE_RESOLUTION, NOISE_RESOLUTION);
        let positionFramebuffers = [
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION),
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION)
        ];
        let velocityFramebuffers = [
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION),
            createFramebufferFloat(ext, POINT_RESOLUTION, POINT_RESOLUTION)
        ];

        // textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);
        gl.activeTexture(gl.TEXTURE0 + NOISE_BUFFER_INDEX);
        gl.bindTexture(gl.TEXTURE_2D, noiseFramebuffer.texture);
        gl.activeTexture(gl.TEXTURE0 + POSITION_BUFFER_INDEX);
        gl.bindTexture(gl.TEXTURE_2D, positionFramebuffers[0].texture);
        gl.activeTexture(gl.TEXTURE0 + POSITION_BUFFER_INDEX + 1);
        gl.bindTexture(gl.TEXTURE_2D, positionFramebuffers[1].texture);
        gl.activeTexture(gl.TEXTURE0 + VELOCITY_BUFFER_INDEX);
        gl.bindTexture(gl.TEXTURE_2D, velocityFramebuffers[0].texture);
        gl.activeTexture(gl.TEXTURE0 + VELOCITY_BUFFER_INDEX + 1);
        gl.bindTexture(gl.TEXTURE_2D, velocityFramebuffers[1].texture);

        // noise render to framebuffer
        gl.useProgram(noisePrg.program);
        gl[noisePrg.uniType[0]](noisePrg.uniLocation[0], [NOISE_RESOLUTION, NOISE_RESOLUTION]);
        setAttribute(planeVBO, noisePrg.attLocation, noisePrg.attStride, planeIBO);
        gl.viewport(0, 0, NOISE_RESOLUTION, NOISE_RESOLUTION);
        gl.bindFramebuffer(gl.FRAMEBUFFER, noiseFramebuffer.framebuffer);
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

        // reset framebuffers
        gl.useProgram(resetPrg.program);
        gl[resetPrg.uniType[0]](resetPrg.uniLocation[0], [POINT_RESOLUTION, POINT_RESOLUTION]);
        setAttribute(planeVBO, resetPrg.attLocation, resetPrg.attStride, planeIBO);
        gl.viewport(0, 0, POINT_RESOLUTION, POINT_RESOLUTION);
        for(let i = 0; i <= 1; ++i){
            // position buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, positionFramebuffers[i].framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
            // velocity buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFramebuffers[i].framebuffer);
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
        }

        // flags
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);

        // setting
        let startTime = Date.now();
        let nowTime = 0;
        let loopCount = 0;
        run = true;
        render();

        function render(){
            nowTime = (Date.now() - startTime) / 1000;
            ++loopCount;
            let targetBufferIndex = loopCount % 2;
            let prevBufferIndex = 1 - targetBufferIndex;

            // update gpgpu buffers -------------------------------------------
            gl.disable(gl.BLEND);
            gl.viewport(0, 0, POINT_RESOLUTION, POINT_RESOLUTION);
            // velocity update
            gl.useProgram(velocityPrg.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, velocityFramebuffers[targetBufferIndex].framebuffer);
            setAttribute(planeVBO, velocityPrg.attLocation, velocityPrg.attStride, planeIBO);
            gl[velocityPrg.uniType[0]](velocityPrg.uniLocation[0], VELOCITY_BUFFER_INDEX + prevBufferIndex);
            gl[velocityPrg.uniType[1]](velocityPrg.uniLocation[1], POSITION_BUFFER_INDEX + prevBufferIndex);
            gl[velocityPrg.uniType[2]](velocityPrg.uniLocation[2], NOISE_BUFFER_INDEX);
            gl[velocityPrg.uniType[3]](velocityPrg.uniLocation[3], [POINT_RESOLUTION, POINT_RESOLUTION]);
            gl[velocityPrg.uniType[4]](velocityPrg.uniLocation[4], nowTime);
            gl[velocityPrg.uniType[5]](velocityPrg.uniLocation[5], isMouseDown);
            gl[velocityPrg.uniType[6]](velocityPrg.uniLocation[6], mouse);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);
            // position update
            gl.useProgram(positionPrg.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, positionFramebuffers[targetBufferIndex].framebuffer);
            setAttribute(planeVBO, positionPrg.attLocation, positionPrg.attStride, planeIBO);
            gl[positionPrg.uniType[0]](positionPrg.uniLocation[0], POSITION_BUFFER_INDEX + prevBufferIndex);
            gl[positionPrg.uniType[1]](positionPrg.uniLocation[1], VELOCITY_BUFFER_INDEX + targetBufferIndex);
            gl[positionPrg.uniType[2]](positionPrg.uniLocation[2], [POINT_RESOLUTION, POINT_RESOLUTION]);
            gl[positionPrg.uniType[3]](positionPrg.uniLocation[3], isMouseDown);
            gl.drawElements(gl.TRIANGLES, planeIndex.length, gl.UNSIGNED_SHORT, 0);

            // render to canvas -------------------------------------------
            gl.enable(gl.BLEND);
            gl.useProgram(scenePrg.program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            setAttribute(pointVBO, scenePrg.attLocation, scenePrg.attStride);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clearDepth(1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.viewport(0, 0, canvasWidth, canvasHeight);

            // push and render
            mat.identity(mMatrix);
            mat.multiply(vpMatrix, mMatrix, mvpMatrix);
            gl[scenePrg.uniType[0]](scenePrg.uniLocation[0], false, mvpMatrix);
            gl[scenePrg.uniType[1]](scenePrg.uniLocation[1], POINT_SIZE);
            gl[scenePrg.uniType[2]](scenePrg.uniLocation[2], POSITION_BUFFER_INDEX + targetBufferIndex);
            gl[scenePrg.uniType[3]](scenePrg.uniLocation[3], POINT_COLOR);
            gl.drawArrays(gl.POINTS, 0, POINT_RESOLUTION * POINT_RESOLUTION);

            gl.flush();

            // animation loop
            if(run){requestAnimationFrame(render);}
        }
    }

    /**
     * プログラムオブジェクトやシェーダに関するパラメータを格納するためのクラス
     * @class
     */
    class ProgramParameter {
        constructor(program){
            this.program     = program;
            this.attLocation = [];
            this.attStride   = [];
            this.uniLocation = [];
            this.uniType     = [];
        }
    }

    /**
     * XHR でシェーダのソースコードを外部ファイルから取得しコールバックを呼ぶ。
     * @param {string} vsPath - 頂点シェーダの記述されたファイルのパス
     * @param {string} fsPath - フラグメントシェーダの記述されたファイルのパス
     * @param {function} callback - コールバック関数
     */
    function loadShaderSource(vsPath, fsPath, callback){
        let vs, fs;
        xhr(vsPath, true);
        xhr(fsPath, false);
        function xhr(source, isVertex){
            let xml = new XMLHttpRequest();
            xml.open('GET', source, true);
            xml.setRequestHeader('Pragma', 'no-cache');
            xml.setRequestHeader('Cache-Control', 'no-cache');
            xml.onload = () => {
                if(isVertex){
                    vs = xml.responseText;
                }else{
                    fs = xml.responseText;
                }
                if(vs != null && fs != null){
                    console.log('loaded', vsPath, fsPath);
                    callback({vs: vs, fs: fs});
                }
            };
            xml.send();
        }
    }

    /**
     * シェーダオブジェクトを生成して返す。
     * コンパイルに失敗した場合は理由をアラートし null を返す。
     * @param {string} source - シェーダのソースコード文字列
     * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {WebGLShader} シェーダオブジェクト
     */
    function createShader(source, type){
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。
     * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
     * @param {WebGLShader} vs - 頂点シェーダオブジェクト
     * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
     * @return {WebGLProgram} プログラムオブジェクト
     */
    function createProgram(vs, fs){
        if(vs == null || fs == null){return;}
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * VBO を生成して返す。
     * @param {Array} data - 頂点属性データを格納した配列
     * @return {WebGLBuffer} VBO
     */
    function createVbo(data){
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return vbo;
    }

    /**
     * IBO を生成して返す。
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    function createIbo(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * IBO を生成して返す。(INT 拡張版)
     * @param {Array} data - インデックスデータを格納した配列
     * @return {WebGLBuffer} IBO
     */
    function createIboInt(data){
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    /**
     * VBO を IBO をバインドし有効化する。
     * @param {Array} vbo - VBO を格納した配列
     * @param {Array} attL - attribute location を格納した配列
     * @param {Array} attS - attribute stride を格納した配列
     * @param {WebGLBuffer} ibo - IBO
     */
    function setAttribute(vbo, attL, attS, ibo){
        for(let i in vbo){
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
            gl.enableVertexAttribArray(attL[i]);
            gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
        }
        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

    /**
     * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
     * @param {string} source - ソースとなる画像のパス
     * @param {function} callback - コールバック関数（第一引数にテクスチャオブジェクトが入った状態で呼ばれる）
     */
    function createTexture(source, callback){
        let img = new Image();
        img.addEventListener('load', () => {
            let tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.bindTexture(gl.TEXTURE_2D, null);
            callback(tex);
        }, false);
        img.src = source;
    }

    /**
     * フレームバッファを生成して返す。
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLRenderbuffer} renderbuffer - 深度バッファとして設定したレンダーバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    function createFramebuffer(width, height){
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture};
    }

    /**
     * フレームバッファを生成して返す。（フロートテクスチャ版）
     * @param {object} ext - getWebGLExtensions の戻り値
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    function createFramebufferFloat(ext, width, height){
        if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
            console.log('float texture not support');
            return;
        }
        let flg = (ext.textureFloat != null) ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, texture: fTexture};
    }

    /**
     * 主要な WebGL の拡張機能を取得する。
     * @return {object} 取得した拡張機能
     * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
     * @property {object} textureFloat - フロートテクスチャを利用できるようにする
     * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
     */
    function getWebGLExtensions(){
        return {
            elementIndexUint: gl.getExtension('OES_element_index_uint'),
            textureFloat:     gl.getExtension('OES_texture_float'),
            textureHalfFloat: gl.getExtension('OES_texture_half_float')
        };
    }
})();
