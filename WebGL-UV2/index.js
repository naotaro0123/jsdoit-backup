var IMAGE_FILE = 'http://jsrun.it/assets/7/E/C/r/7ECra.png';
var gl, texture;
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
         0.0,  1.0,  0.0,   // triangle-top
         1.0, -1.0,  0.0,   // triangle-right
        -1.0, -1.0,  0.0,   // triangle-left
        
//        -1.0,  1.0,  0.0, // top-left
//         1.0,  1.0,  0.0, // top-right
//        -1.0, -1.0,  0.0, // bottom-left
//         1.0, -1.0,  0.0  // bottom-right

//        -0.7,  0.7,  0.0, // 0:top-left
//         0.0,  1.0,  0.0, // 1:top
//         0.7,  0.7,  0.0, // 2:top-right
//        -0.7, -0.7,  0.0, // 3:bottom-left
//         0.0, -1.0,  0.0, // 4:bottom
//         0.7, -0.7,  0.0, // 5:bottom-right
    ];
    // 頂点インデックス
    var triangle_index = [
        0, 1, 2,
//        3, 2, 1,

//        0, 1, 2,    // 五角形
//        2, 0, 3,    // 五角形
//        2, 3, 5,    // 五角形
//        3, 4, 5     // 五角形
    ];
    // 頂点色
    var triangle_color = [
    ];
    for(i = 0; i<triangle_pos.length; i+=3){
        triangle_color.push(1.0);   // R
        triangle_color.push(1.0);   // G
        triangle_color.push(1.0);   // B
        triangle_color.push(1.0);   // A
    }
    // テクスチャ座標
    var texture_Coord = [
    ];
    for(i=0; i<triangle_pos.length; i+=3){
        texture_Coord.push((1.0 + triangle_pos[i]) / 2.0);
        texture_Coord.push((1.0 - triangle_pos[i+1]) / 2.0);
    }
    // VBOとIBOの生成
    var vPosition     = create_vbo(triangle_pos);
    var vColor        = create_vbo(triangle_color);
    var vTextureCoord = create_vbo(texture_Coord);
    var VBOList       = [vPosition, vColor, vTextureCoord];
    var iIndex        = create_ibo(triangle_index);
    // VBOとIBOの登録
    set_attribute(VBOList, attLocation, attStride);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);
    // uniformLocationを配列に取得
    var uniLocation = new Array();
    uniLocation[0]  = gl.getUniformLocation(prg, 'mvpMatrix');
    uniLocation[1]  = gl.getUniformLocation(prg, 'texture');
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
    // 有効にするテクスチャユニットを指定
    gl.activeTexture(gl.TEXTURE0);
    // テクスチャを生成
    create_texture(IMAGE_FILE);
    // カウンタの宣言
    var count = 0;
    render();

    function render(){
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // カウンタを元にラジアンを算出
//        count++;
        var rad = (count % 360) * Math.PI / 180;
        // テクスチャをバインドする
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // uniform変数にテクスチャを登録
        gl.uniform1i(uniLocation[1], 0);
        // モデル座標変換行列の生成
        m.identity(mMatrix);
        m.rotate(mMatrix, rad, [0, 1, 0], mMatrix);
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
