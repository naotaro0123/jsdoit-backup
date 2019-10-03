var CAN_ID = 'glcanvas';    // canasid
// WebGLでテクスチャを利用する
var IMAGE_FILE = 'http://jsrun.it/assets/8/N/9/W/8N9WR.png'; // 表示する画像
var CAN_SIZE = 400;
var can,gl,attLocation,attStride;
var pos_x=0.0,pos_y=0.0;
var texture = [];

// サークル計算用（オーバーフロー防止用）
Math.Sin = function(w){ 
    return Math.round(Math.sin(w)*100) /100;
};
Math.Cos = function(w){ 
    return Math.round(Math.cos(w)*100) /100;
};

var draw_scale = 0.8;   // 円描画してるスケール
var draw_angle = 36;    // 円描画する三角形の数

// マウスムーブ処理
function mouseMove(e){
    var cw = can.width;
    var ch = can.height;
    var wh = 1 / Math.sqrt(cw * cw + ch * ch);
    var x = e.clientX - can.offsetLeft - cw * 0.5;
    var y = e.clientY - can.offsetTop - ch * 0.5;
    // x,yのマウス位置を正規化(-1.0〜1.0の間)し、スケール時の動きの遅さにも対応した
    pos_x = x/(cw/2) / draw_scale;
    pos_y = -y/(ch/2) / draw_scale;
}

// マウスホイール処理
function mouseWheel(e){
    draw_scale += e.wheelDelta * 0.001;
}

// 初期化イベント
window.onload = function(){
    init();
};
    
function init(){
    // canvasエレメントを取得
    can = document.getElementById(CAN_ID);
    can.width = can.height = CAN_SIZE;
    
    // webglコンテキストを取得
    gl = can.getContext('webgl', {stencil: true}) ||
         can.getContext('experimental-webgl', {stencil: true});
    // イベント処理
    can.addEventListener('mousemove', mouseMove, true); 
    can.addEventListener('mousewheel', mouseWheel, true);
    // 頂点シェーダとフラグメントシェーダの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');
    var circle_v_shader = create_shader('circle_vs');
    var circle_f_shader = create_shader('circle_fs');
    // プログラムオブジェクトの生成とリンク
    var prg = create_program(v_shader, f_shader, true);
    var circle_prg = create_program(circle_v_shader, circle_f_shader, false);
    // attributeLocationを配列に取得
    var attLocation = new Array();
    attLocation[0] = gl.getAttribLocation(prg, 'position');
    attLocation[1] = gl.getAttribLocation(prg, 'color');
    attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');
    var circle_attLoc = gl.getAttribLocation(circle_prg, 'position');
    // attributeの要素数を配列に格納
    var attStride = new Array();
    attStride[0] = 3;
    attStride[1] = 4;
    attStride[2] = 2;
    // xyzの3要素
    var circle_attSt = 3;
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
    var circle_pos = [];    // 頂点データ（円）
    
    // VBOとIBOの生成
    var vPosition     = create_vbo(position);
    var vColor        = create_vbo(color);
    var vTextureCoord = create_vbo(textureCoord);
    var VBOList       = [vPosition, vColor, vTextureCoord];
    var iIndex        = create_ibo(index);
    // IBOの登録
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

    render();

    function render(){
        // ビュー×プロジェクション座標変換行列
        m.lookAt([0.0, 0.0, 2.5], [0, 0, 0], [0, 1, 0], vMatrix);
        m.perspective(45, can.width / can.height, 0.1, 100, pMatrix);
        m.multiply(pMatrix, vMatrix, tmpMatrix);    
        
        // canvasを初期化
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // デプスバッファの初期化
        gl.clearDepth(1.0);
        // ステンシルバッファの初期化
        gl.clearStencil(0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);        
        
        if(texture.length >= 1){
            // ステンシルテストを有効にする
            gl.enable(gl.STENCIL_TEST);

            //------------ マスクする画像の描画 ------------//
            // stencilFunc(定数, ref, mask)
            gl.stencilFunc(gl.ALWAYS, 1, ~0);
            // stencilOp(引数1:Stencil=NG
            //           引数2:Stencil=OK&depth=NG
            //           引数3:Stencil=OK&Depth=OK )
            gl.stencilOp(gl.KEEP, gl.REPLACE, gl.REPLACE);
            // シェーダー切り替え
            gl.useProgram(circle_prg);
            // 円の描画
            draw_circle();
            // シェーダー切り替え
            gl.useProgram(prg);

            //------------ 表示する画像の描画 ------------//
            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, texture[0]);
            // VBOとIBOの登録
            set_attribute(VBOList, attLocation, attStride);
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
            // ステンシルテストを無効にする
            gl.disable(gl.STENCIL_TEST);            
                
            function draw_circle(){
                var angle = 10;     // 角度
                var countup = 0;
                // 9の倍数が3頂点目、10度ずつ作る
                for(var i = 0; i<9*draw_angle; i+=3){
                    countup++;
                    // 3点目ならカウントアップ
                    if(countup == 3){
                        angle += 10;
                        countup = 0;
                    }
                    // 三角形の始点は(0,0,0)
                    if(i == 0 || i % 9 == 0){
                        circle_pos[i]   = (0.0 + pos_x) * draw_scale;
                        circle_pos[i+1] = (0.0 + pos_y) * draw_scale;
                        circle_pos[i+2] = 0.0;
                    // 三角形の2点目、3点目はこっち
                    }else{
                        circle_pos[i] = (Math.Cos(Math.PI / 180 * angle) + pos_x) * draw_scale;
                        circle_pos[i+1] = (Math.Sin(Math.PI / 180 * angle)+ pos_y) * draw_scale;
                        circle_pos[i+2] = 0.0;
                    }
                }                
                // VBO生成
                var vbo = create_vbo(circle_pos);
                // VBOバインド
                gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
                // atribute属性を有効
                gl.enableVertexAttribArray(circle_attLoc);
                // attribute属性を登録
                gl.vertexAttribPointer(circle_attLoc, circle_attSt, gl.FLOAT, false, 0, 0);
                // uniformLocationの取得
                var circle_uniLoc = gl.getUniformLocation(circle_prg, 'mvpMatrix');
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(circle_uniLoc, false, tmpMatrix);
                // モデル描画
                gl.drawArrays(gl.TRIANGLES, 0, circle_pos.length / 3);
            }

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
function create_program(vs, fs, used){
    // プログラムオブジェクトの生成
    var program = gl.createProgram();
    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // シェーダをリンク
    gl.linkProgram(program);
    // シェーダのリンクが正しく行なわれたかチェック
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        if(used == true){
            // 成功していたらプログラムオブジェクトを有効にする
            gl.useProgram(program);            
        }
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
        // バッファのバインドを無効化
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
