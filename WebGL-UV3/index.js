var IMAGE_FILE = 'http://jsrun.it/assets/7/E/C/r/7ECra.png';
var gl, texture, ftexture;
var CAN_SIZE = 512;

onload = function(){
    init();
};
    
function init(){
    // canvasエレメントを取得
    var c = document.getElementById('glcanvas');
    c.width = c.height = CAN_SIZE;
    // webglコンテキストを取得
    gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    // テクスチャを生成
    create_texture(IMAGE_FILE);
    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');
    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader);
    // attributeLocationを配列に取得
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');
    attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');
    // attributeの要素数を配列に格納
    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 4;
    attStride[2] = 2;
    // 頂点の位置
    var triangle_pos = [
         0.0,  0.8,  0.0,   // triangle-top
         0.8, -0.8,  0.0,   // triangle-right
        -0.8, -0.8,  0.0,   // triangle-left        
    ];
    var quad_pos = [
        -1.0,  1.0,  0.0, // top-left
         1.0,  1.0,  0.0, // top-right
        -1.0, -1.0,  0.0, // bottom-left
         1.0, -1.0,  0.0,  // bottom-right        
    ];
    var pentagon_pos = [
        -0.6,  0.4,  0.0, // 0:top-left
         0.0,  0.8,  0.0, // 1:top
         0.6,  0.4,  0.0, // 2:top-right
        -0.6, -0.4,  0.0, // 3:bottom-left
         0.0, -0.8,  0.0, // 4:bottom
         0.6, -0.4,  0.0, // 5:bottom-right
    ];
    // 頂点インデックス
    var triangle_index = [
        0, 1, 2,
    ];
    var quad_index = [
        0, 1, 2,
        3, 2, 1,
    ];
    var pentagon_index = [
        0, 1, 2,
        2, 0, 3,
        2, 3, 5,
        3, 4, 5,        
    ];
    // 頂点色
    var triangle_color = [];
    for(i = 0; i<triangle_pos.length; i+=3){
        triangle_color.push(1.0);   // R
        triangle_color.push(1.0);   // G
        triangle_color.push(1.0);   // B
        triangle_color.push(1.0);   // A
    }
    var quad_color = [];
    for(i = 0; i<quad_pos.length; i+=3){
        quad_color.push(1.0);   // R
        quad_color.push(1.0);   // G
        quad_color.push(1.0);   // B
        quad_color.push(1.0);   // A
    }
    var pentagon_color = [];
    for(i = 0; i<pentagon_pos.length; i+=3){
        pentagon_color.push(1.0);   // R
        pentagon_color.push(1.0);   // G
        pentagon_color.push(1.0);   // B
        pentagon_color.push(1.0);   // A
    }
    
    // テクスチャ座標
    var triangle_texCoord = [];
    for(i=0; i<triangle_pos.length; i+=3){
        triangle_texCoord.push((1.0 + triangle_pos[i]) / 2.0);
        triangle_texCoord.push((1.0 - triangle_pos[i+1]) / 2.0);
    }
    var quad_texCoord =[];
    for(i=0; i<quad_pos.length; i+=3){
        quad_texCoord.push((1.0 + quad_pos[i]) / 2.0);
        quad_texCoord.push((1.0 - quad_pos[i+1]) / 2.0);
    }
    var pentagon_texCoord =[];
    for(i=0; i<pentagon_pos.length; i+=3){
        pentagon_texCoord.push((1.0 + pentagon_pos[i]) / 2.0);
        pentagon_texCoord.push((1.0 - pentagon_pos[i+1]) / 2.0);
    }
    
    // VBOとIBOの生成
    var vPosition = [];
    var vColor = [];
    var vTextureCoord = [];
    var VBOList = [];
    var iIndex = [];
    // 以下の頂点やインデックス作成をrenderにいれると絵が出ないのでここで生成
    // VBOとIBOの生成（pentagon用）
    vPosition[0]     = create_vbo(pentagon_pos);
    vColor[0]        = create_vbo(pentagon_color);
    vTextureCoord[0] = create_vbo(pentagon_texCoord);
    VBOList[0]       = [vPosition[0], vColor[0], vTextureCoord[0]];
    iIndex[0]        = create_ibo(pentagon_index);
    // VBOとIBOの生成(triangle用)
    vPosition[1]     = create_vbo(triangle_pos);
    vColor[1]        = create_vbo(triangle_color);
    vTextureCoord[1] = create_vbo(triangle_texCoord);
    VBOList[1]       = [vPosition[1], vColor[1], vTextureCoord[1]];
    iIndex[1]        = create_ibo(triangle_index);
    
    // uniformLocationを配列に取得
    var uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1]  = gl.getUniformLocation(prg, 'texture');
    uniLocation[2]  = gl.getUniformLocation(prg, 'texflg');
    // 各種行列の生成と初期化
    var m = new matIV();
    var mMatrix   = m.identity(m.create());
    var vMatrix   = m.identity(m.create());
    var pMatrix   = m.identity(m.create());
    var tmpMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    // ビュー×プロジェクション座標変換行列
    m.lookAt([0.0, 0.0, 2.5], [0, 0, 0], [0, 1, 0], vMatrix);
    m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
    m.multiply(pMatrix, vMatrix, tmpMatrix);
    // 深度テストを有効にする
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearDepth(1.0);
    // フレームバッファを生成
    var fbuffer = create_framebuffer(CAN_SIZE, CAN_SIZE);
    // imageを上下反転
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    
    render();


    function render(){
        //------------------------------------------------------------
        // フレームバッファをバインドする
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbuffer.framebuffer);
        // canvasを初期化
        gl.clearColor(0.6, 0.2, 0.7, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // VBOとIBOの登録
        set_attribute(VBOList[0], attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex[0]);
        
//        // 書き込み先のフレームバッファの参照を外す(テクスチャを指定しない場合)
//        gl.bindTexture(gl.TEXTURE_2D, null);
//        // テクスチャありなし(0:なし 1:あり)
//        gl.uniform1i(uniLocation[2], 0);
        
        // 有効にするテクスチャユニットを指定
        gl.activeTexture(gl.TEXTURE0);
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // uniform変数にテクスチャを登録
        gl.uniform1i(uniLocation[1], 0);
        // テクスチャありなし(0:なし 1:あり)
        gl.uniform1i(uniLocation[2], 1);

        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.drawElements(gl.TRIANGLES, pentagon_index.length, gl.UNSIGNED_SHORT, 0);


        //------------------------------------------------------------
        // フレームバッファのバインドを解除
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // canvasを初期化
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // VBOとIBOの登録
        set_attribute(VBOList[1], attLocation, attStride);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex[1]);

        // 有効にするテクスチャユニットを指定
        gl.activeTexture(gl.TEXTURE0);
        // フレームバッファのテクスチャをバインド
        gl.bindTexture(gl.TEXTURE_2D, ftexture);
        // uniform変数にテクスチャを登録
        gl.uniform1i(uniLocation[1], 0);
        // テクスチャありなし(0:なし 1:あり)
        gl.uniform1i(uniLocation[2], 1);
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.multiply(tmpMatrix, mMatrix, mvpMatrix);
        // uniform変数の登録と描画
        gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
        gl.drawElements(gl.TRIANGLES, triangle_index.length, gl.UNSIGNED_SHORT, 0);

        // 繰り返し
        requestAnimationFrame(render);
    }
}

/*
 * シェーダを生成する関数
 */
function create_shader(id){
    // シェーダを格納する変数
    var shader;
    // HTMLからscriptタグへの参照を取得
    var scriptElement = document.getElementById(id);
    // scriptタグが存在しない場合は抜ける
    if(!scriptElement){return;}
    // scriptタグのtype属性をチェック
    switch(scriptElement.type){
        // 頂点シェーダの場合
        case 'x-shader/x-vertex':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        // フラグメントシェーダの場合
        case 'x-shader/x-fragment':
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default :
            return;
    }
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, scriptElement.text);
    // シェーダをコンパイルする
    gl.compileShader(shader);
    // シェーダが正しくコンパイルされたかチェック
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        // 成功していたらシェーダを返して終了
        return shader;
    }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getShaderInfoLog(shader));
    }
}

/*
 * プログラムオブジェクトを生成しシェーダをリンクする関数
 */
function create_program(vs, fs){
    // プログラムオブジェクトの生成
    var program = gl.createProgram();
    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // シェーダをリンク
    gl.linkProgram(program);
    // シェーダのリンクが正しく行なわれたかチェック
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        // 成功していたらプログラムオブジェクトを有効にする
        gl.useProgram(program);
        // プログラムオブジェクトを返して終了
        return program;
    }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getProgramInfoLog(program));
    }
}

/*
 * VBOを生成する関数
 */
function create_vbo(data){
    // バッファオブジェクトの生成
    var vbo = gl.createBuffer();
    // バッファをバインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // バッファにデータをセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // バッファのバインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // 生成した VBO を返して終了
    return vbo;
}

/*
 * VBOをバインドし登録する関数
 */
function set_attribute(vbo, attL, attS){
    // 引数として受け取った配列を処理する
    for(var i in vbo){
        // バッファをバインドする
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        // attributeLocationを有効にする
        gl.enableVertexAttribArray(attL[i]);
        // attributeLocationを通知し登録する
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
    }
}

/*
 * IBOを生成する関数
 */
function create_ibo(data){
    // バッファオブジェクトの生成
    var ibo = gl.createBuffer();
    // バッファをバインドする
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    // バッファにデータをセット
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    // バッファのバインドを無効化
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    // 生成したIBOを返して終了
    return ibo;
}

/*
 * テクスチャを生成する関数
 */
function create_texture(source){
    // イメージオブジェクトの生成
    var img = new Image();
    // データのオンロードをトリガーにする
    img.onload = function(){
        // テクスチャオブジェクトの生成
        var tex = gl.createTexture();
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // テクスチャへイメージを適用
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        // ミップマップを生成
        gl.generateMipmap(gl.TEXTURE_2D);
        // テクスチャのバインドを無効化
        gl.bindTexture(gl.TEXTURE_2D, null);
        // 生成したテクスチャをグローバル変数に代入
        texture = tex;
    };
    // イメージオブジェクトのソースを指定
    img.src = source;
}

/*
 * フレームバッファを生成する関数
 */
function create_framebuffer(width ,height){
    // フレームバッファオブジェクトの生成
    var framebuffer = gl.createFramebuffer();
    // フレームバッファをバインドする
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    // レンダーバッファオブジェクトの生成
    var depthrenderbuffer = gl.createRenderbuffer();
    // レンダーバッファをバインドする
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthrenderbuffer);
    // レンダーバッファのフォーマット設定
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    // フレームバッファへの震度バッファの関連付ける
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthrenderbuffer);
    // テクスチャオブジェクトの生成
    var frametexture = gl.createTexture();
    // テクスチャをバインドする
    gl.bindTexture(gl.TEXTURE_2D, frametexture);
    // テクスチャへイメージを適用
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // テクスチャパラメーター
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    // フレームバッファにテクスチャを関連付ける
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frametexture, 0);
    // テクスチャのバインドを無効化
    gl.bindTexture(gl.TEXTURE_2D, null);
    // レンダーバッファのバインドを無効化
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    // フレームバッファのバインドを無効化
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // 生成したテクスチャをグローバル変数に代入
    ftexture = frametexture;
    // 返り値
    return{
        framebuffer:framebuffer, depthrenderbuffer:depthrenderbuffer, texture:ftexture
    };
}