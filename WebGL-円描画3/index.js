var CAN_ID = 'glcanvas';    // canasid
var CAN_SIZE = 400;         // canvasサイズ
var can,gl,prg,attLocation,attStride;
var pos_x=0.0,pos_y=0.0;
// マウスイベント処理
function mouseMove(e){
    var cw = can.width;
    var ch = can.height;
    var wh = 1 / Math.sqrt(cw * cw + ch * ch);
    var x = e.clientX - can.offsetLeft - cw * 0.5;
    var y = e.clientY - can.offsetTop - ch * 0.5;
    // x,yのマウス位置を正規化(-1.0〜1.0の間)し、スケール時の動きの遅さにも対応した
    pos_x = x/(cw/2) / scale_slider.value;
    pos_y = -y/(ch/2) / scale_slider.value;
}

// サークル計算用（オーバーフロー防止用）
Math.Sin = function(w){ 
    return Math.round(Math.sin(w)*100) /100;
};
Math.Cos = function(w){ 
    return Math.round(Math.cos(w)*100) /100;
};

// 角度スライダー
var angle_slider = document.getElementById('angle_slider');
var angle_sliderval = document.getElementById('angle_sliderval');
// スケールスライダー
var scale_slider = document.getElementById('scale_slider');
var scale_sliderval = document.getElementById('scale_sliderval');


window.onload = function(){
    init();
}

// 初期化処理
function init(){
    // canvas取得
    can = document.getElementById(CAN_ID);
    can.width = can.height = CAN_SIZE;
    // webglコンテキスト取得
    gl = can.getContext('webgl') || 
             can.getContext('experimental-webgl');
    // イベント処理
    can.addEventListener('mousemove', mouseMove, true); 
    // 頂点シェーダーとフラグメントシェーダーの生成
    var v_shader = create_shader('vs');
    var f_shader = create_shader('fs');
    // プログラムオブジェクト初期化
    prg = create_program(v_shader, f_shader);
    // attributeLocation取得
    attLocation = gl.getAttribLocation(prg, 'position');
    // xyzの3要素
    attStride = 3;
    // 円の描画
    draw_circle();
}

// 描画処理（ループ）
function draw_circle(){
    // canvas初期化
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // スライダー値の更新
    angle_sliderval.innerHTML = angle_slider.value;
    var draw_angle = angle_sliderval.innerHTML / 10;
    // スライダー値の更新
    scale_sliderval.innerHTML = scale_slider.value;
    var draw_scale = scale_sliderval.innerHTML;
    
    var vertex = [];    // 頂点データ（円）
    // 頂点データ（三角形）
//    var vertex = [
//       0.0, 1.0, 0.0,
//       1.0, 0.0, 0.0,
//      -1.0, 0.0, 0.0,
//    ];
    // 頂点データ（四角形）
//    var vertex = [
//      -1.0, 1.0, 0.0,
//       1.0, 1.0, 0.0,
//       1.0,-1.0, 0.0,
//      -1.0, 1.0, 0.0,
//       1.0,-1.0, 0.0,
//      -1.0,-1.0, 0.0,
//    ];
    
    var angle = 10;     // 角度
    var countup = 0;
    // 9の倍数が3頂点目、10度ずつ作る
//    for(var i = 0; i<9*36; i+=3){
//    for(var i = 0; i<1*draw_angle; i+=3){ // デバッグ用
    for(var i = 0; i<9*draw_angle; i+=3){
        countup++;
        // 3点目ならカウントアップ
        if(countup == 3){
            angle += 10;
            countup = 0;
        }
        // 三角形の始点は(0,0,0)
        if(i == 0 || i % 9 == 0){
            vertex[i]   = (0.0 + pos_x) * draw_scale;
            vertex[i+1] = (0.0 + pos_y) * draw_scale;
            vertex[i+2] = 0.0;
        // 三角形の2点目、３点目はこっち
        }else{
            vertex[i] = (Math.Cos(Math.PI / 180 * angle) + pos_x) * draw_scale;
            vertex[i+1] = (Math.Sin(Math.PI / 180 * angle)+ pos_y) * draw_scale;
            vertex[i+2] = 0.0;
        }
    }

    // VBO生成
    var vbo = create_vbo(vertex);
    // VBOバインド
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // atribute属性を有効
    gl.enableVertexAttribArray(attLocation);
    // attribute属性を登録
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
    // 行列の生成
    var m = new matIV();
    var mMatrix = m.identity(m.create());
    var vMatrix = m.identity(m.create());
    var pMatrix = m.identity(m.create());
    var mvpMatrix = m.identity(m.create());
    // ビュー座標変換行列
    m.lookAt([0.0, 0.0, 1.0], [0, 0, 0], [0, 1, 0], vMatrix);
    // プロジェクション座標変換行列
    m.perspective(90, can.width / can.height, 0.1, 100, pMatrix);
    // 行列計算
    m.multiply(pMatrix, vMatrix, mvpMatrix);
    m.multiply(mvpMatrix, mMatrix, mvpMatrix);
    // uniformLocationの取得
    var uniLocation = gl.getUniformLocation(prg, 'mvpMatrix');
    // uniformLocationへ座標変換行列を登録
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix);
    // モデル描画
    gl.drawArrays(gl.TRIANGLES, 0, vertex.length / 3);
    // 再描画
    gl.flush();
    // 繰り返し
    requestAnimationFrame(draw_circle);
}

// シェーダー生成
function create_shader(id){
    var shader;
    var shaderEle = document.getElementById(id);
    switch(shaderEle.type){
        case 'x-shader/x-vertex':   // 頂点シェーダーの場合
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
        case 'x-shader/x-fragment': // フラグメントシェーダーの場合
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default:
            return; 
    }
    // シェーダーをソースに割り当てる
    gl.shaderSource(shader, shaderEle.text);
    // シェーダーのコンパイル
    gl.compileShader(shader);
    // コンパイルチェック
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        return shader;  // 成功
    }else{
        console.error(gl.getShaderInfoLog(shader)); // エラー
    }
}

// プログラムオブジェクト初期化
function create_program(vs, fs){
    var program = gl.createProgram();
    // シェーダーの割り当て
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    // シェーダーのリンク
    gl.linkProgram(program);
    // シェーダーリンクチェック
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
        // シェーダーを有効にする
        gl.useProgram(program);
        return program;
    }else{
        console.error(gl.getProgramInfoLog(program));   // エラー
    }
}

// VBO生成
function create_vbo(data){
    // バッファオブジェクト生成
    var vbo = gl.createBuffer();
    // バインドする
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // バッファをデータにセット
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // バインドを無効化
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}
