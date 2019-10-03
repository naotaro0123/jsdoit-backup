// WebGLでテクスチャを利用する
var IMAGE_FILE = 'http://jsrun.it/assets/8/N/9/W/8N9WR.png'; // 表示する画像
var MASK_FILE = 'http://jsrun.it/assets/3/G/3/c/3G3cD.jpg'; // マスク用(透明画像)
var gl;
var texture = [];

// canvas とクォータニオンをグローバルに扱う
var c;
var q = new qtnIV();
var qt = q.identity(q.create());

// マウスムーブイベントに登録する処理
function mouseMove(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}

onload = function(){
    init();
};
    
function init(){
    // canvasエレメントを取得
    c = document.getElementById('glcanvas');
    c.width = 400;
    c.height = 400;
    // イベント処理
    c.addEventListener('mousemove', mouseMove, true);
    
    // webglコンテキストを取得
    gl = c.getContext('webgl', {stencil: true}) || c.getContext('experimental-webgl', {stencil: true});
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
    var position = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    // 頂点色
    var color = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0
    ];
    // テクスチャ座標
    var textureCoord = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0
    ];
    // 頂点インデックス
    var index = [
        0, 1, 2,
        3, 2, 1
    ];
    // VBOとIBOの生成
    var vPosition     = create_vbo(position);
    var vColor        = create_vbo(color);
    var vTextureCoord = create_vbo(textureCoord);
    var VBOList       = [vPosition, vColor, vTextureCoord];
    var iIndex        = create_ibo(index);
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

    // 深度テストを有効にする
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    // 有効にするテクスチャユニットを指定
    gl.activeTexture(gl.TEXTURE0);
    // 表示するテクスチャを生成
    create_texture(IMAGE_FILE, 0);
    // マスク用のテクスチャを生成
    create_texture(MASK_FILE , 1);
    // カウンタの宣言
    var count = 0;
    render();

    function render(){
        // ビュー×プロジェクション座標変換行列
        m.lookAt([0.0, 0.0, 2.5], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
        var qMatrix = m.identity(m.create());
        q.toMatIV(qt, qMatrix);
        m.multiply(vMatrix, qMatrix, vMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);    
        
        // canvasを初期化
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        // デプスバッファの初期化
        gl.clearDepth(1.0);
        // ステンシルバッファの初期化
        gl.clearStencil(0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        if(texture.length > 1){
            // ステンシルテストを有効にする
            gl.enable(gl.STENCIL_TEST);

            //------------ マスクする画像の描画 ------------//
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, texture[1]);
            // stencilFunc(定数, ref, mask)
            gl.stencilFunc(gl.ALWAYS, 1, ~0);
            // stencilOp(引数1:Stencil=NG
            //           引数2:Stencil=OK&depth=NG
            //           引数3:Stencil=OK&Depth=OK )
            gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE);
            drawing([ 0.0, 0.3, 0.0,
                      0.8, 0.2, 0.8]);

            //------------ 表示する画像の描画 ------------//
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, texture[0]);
            // uniform変数にテクスチャを登録
            gl.uniform1i(uniLocation[1], 0); 
            // stencilFunc(定数, ref, mask)
            gl.stencilFunc(gl.EQUAL, 1, ~0);
            // stencilOp(引数1:Stencil=NG
            //           引数2:Stencil=OK&depth=NG
            //           引数3:Stencil=OK&Depth=OK )
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            drawing([ 0.0, 0.0, 0.0,
                      0.9, 0.9, 0.9]);
                
            function drawing(tr){
                // モデル座標変換行列の生成
                m.identity(mMatrix);
                // 表示位置
                m.translate(mMatrix, [tr[0], tr[1], tr[2]], mMatrix);
                // 拡大縮小
                m.scale(mMatrix, [tr[3], tr[4], tr[5]], mMatrix);
                m.multiply(tmpMatrix, mMatrix, mvpMatrix);
                // uniform変数の登録と描画
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);        
            }

            // ステンシルテストを無効にする
            gl.disable(gl.STENCIL_TEST);            
        }
        // コンテキストの再描画
        gl.flush();            
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
function create_texture(source, t){
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
        texture[t] = tex;
    };
    // イメージオブジェクトのソースを指定
    img.src = source;
}
