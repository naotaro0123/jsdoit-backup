// forked from .naotaro's "GLSLでオーブの色替える" http://jsdo.it/.naotaro/x2Dj
// forked from .naotaro's "GLSLでタイマーで色替える" http://jsdo.it/.naotaro/wKog
onload = function(){
    start();
}

var gl;
var cw, ch;
var startTime = new Date().getTime();
var time = 0.0;
var tempTime = 0.0;
var fps = 1000 / 30;
var uniLocation = new Array();

/*
 * スタート処理
 */
function start(){
    var canvas = document.getElementById('glcanvas');
    canvas.width = 450;
    canvas.height = 450;
    cw = canvas.width;
    ch = canvas.height;
    // 初期化処理
    initGL(canvas);
    if(gl){
        // シェーダー初期化処理
        initShader();
        // 描画エリアをクリア
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        // レンダリング関数呼び出し
        render();
    }
}

/*
 * 初期化処理
 */
function initGL(canvas){
    gl = null;

    try{
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }catch(e){
    }

    if(!gl){
        alert('Unable to Initialize WebGL.');
    }
}

/*
 * シェーダー初期化処理
 */
function initShader(){
    // 頂点シェーダー
    var vshader = create_shader('vs');
    // フラグメントシェーダー
    var fshader = create_shader('fs');

    // Create shader program
    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert(gl.getProgramInfoLog(program));
        return;
    }
    gl.useProgram(program);

    // attribute
    uniLocation[0] = gl.getUniformLocation(program, 'time');
    uniLocation[1] = gl.getUniformLocation(program, 'resolution');
    // 頂点データ周りの初期化
    var positin = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    var index = [
        0, 2, 1,
        1, 2, 3
    ];
    var vPosition = create_vbo(positin);
    var vIndex = create_ibo(index);
    var vAttLocation = gl.getAttribLocation(program, 'pos');
    gl.bindBuffer(gl.ARRAY_BUFFER, vPosition);
    gl.enableVertexAttribArray(vAttLocation);
    gl.vertexAttribPointer(vAttLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

}

// シェーダを生成する関数
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

// VBOを生成する関数
function create_vbo(data){
    var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

// IBOを生成する関数
function create_ibo(data){
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
}

// レンダリングを行う関数
function render(){
    time = (new Date().getTime() - startTime) * 0.002;
    // カラーバッファをクリア
    gl.clear(gl.COLOR_BUFFER_BIT);
    // uniform関連
    gl.uniform1f(uniLocation[0], time + tempTime);
    gl.uniform2fv(uniLocation[1], [cw, ch]);

    // 描画
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    gl.flush();

    setTimeout(render, fps);
}

