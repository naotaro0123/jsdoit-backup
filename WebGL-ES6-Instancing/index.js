'use strict';

const CANVAS_SIZE = 500;
const CANVAS_ID = 'canvas';

window.onload = () => {
    let drawWebGL = new Triangles(CANVAS_SIZE, CANVAS_ID);
};


class Triangles{
    /*
     * コンストラクタ
     * @param {number} canSize
     * @param {string} canId
     */
    constructor(canSize, canId){
        // canvasエレメントを取得
        this.canvas = document.getElementById(canId);
        this.canvas.width = this.canvas.height = canSize;
        // webglコンテキストを取得
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        // 拡張機能を有効化
        this.ext = this.gl.getExtension('ANGLE_instanced_arrays');
        if(this.ext == null){
            alert('ANGLE_instanced_arrays not supported');
            return;
        }
        // 初期化処理
        this.init();
    }

    /*
     * 初期化処理
     */
    init(){
        // 頂点シェーダとフラグメントシェーダの生成
        let v_shader = this.create_shader('vs');
        let f_shader = this.create_shader('fs');
        // プログラムオブジェクトの生成とリンク
        let prg = this.create_program(v_shader, f_shader);
        
        // attributeLocationを配列に取得
        let attLocation = new Array();
        attLocation[0] = this.gl.getAttribLocation(prg, 'position');
        attLocation[1] = this.gl.getAttribLocation(prg, 'color');
        attLocation[2] = this.gl.getAttribLocation(prg, 'instancePosition');
        // attributeの要素数を配列に格納
        let attStride = new Array();
        attStride[0] = 3;
        attStride[1] = 4;
        attStride[2] = 3;

        // 頂点ポジション
        const position = [
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
           -1.0, 0.0, 0.0
        ];
        // 頂点カラー
        const color = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];
	// 配列からVBOを生成
	let pos_vbo = this.create_vbo(position);
	let col_vbo = this.create_vbo(color);
        // VBO を登録する
        this.set_attribute([pos_vbo, col_vbo], attLocation, attStride);

        
        // インスタンスの数
	this.instanceCount = 10;	
	// インスタンス用配列
	let instancePositions = new Array();
	// 配列用のストライド
	const offsetPosition = 3;
 	// ループしながらインスタンス用データを配列に格納
	for(let i = 0; i < this.instanceCount; i++){
            // ランダムで0.0〜2.0の値取得
            let ranX = Math.floor(Math.random() * 2 * 10)/ 10;
            let ranY = Math.floor(Math.random() * 2 * 10)/ 10;
            // ランダムで+か-にする
            let posX = Math.floor(Math.random() * 2)? -ranX: ranX;
            let posY = Math.floor(Math.random() * 2)? -ranY: ranY;
            // 算出した座標をセットする
            instancePositions[i * offsetPosition]     = posX;
            instancePositions[i * offsetPosition + 1] = posY;
            instancePositions[i * offsetPosition + 2] = 0.0;
	}
	// 配列からVBOを生成
	let inpos_vbo = this.create_vbo(instancePositions);
	// インスタンス用の座標位置VBOを有効にする
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, inpos_vbo);
	this.gl.enableVertexAttribArray(attLocation[2]);
	this.gl.vertexAttribPointer(attLocation[2], attStride[2], this.gl.FLOAT, false, 0, 0);	
	// インスタンスを有効化し除数を指定する
	this.ext.vertexAttribDivisorANGLE(attLocation[2], 1);
        
        
        // 頂点のインデックスを格納する配列
        this.index = [
            0, 1, 2
        ];
        // IBOの生成
        let ibo = this.create_ibo(this.index);
        // IBOをバインドして登録する
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);    
        // uniformLocationの取得
        this.uniLocation = this.gl.getUniformLocation(prg, 'mvpMatrix');                
        // matIVオブジェクトを生成
        this.m = new matIV();
        // 各種行列の生成と初期化
        this.mMatrix = this.m.identity(this.m.create());
        this.vMatrix = this.m.identity(this.m.create());
        this.pMatrix = this.m.identity(this.m.create());
        this.tmpMatrix = this.m.identity(this.m.create());
        this.mvpMatrix = this.m.identity(this.m.create());
        // 描画処理
        this.render();
    }

    /**
     * 描画処理
     */
    render(){
        // canvasを初期化する色を設定する
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // canvasを初期化する際の深度を設定する
        this.gl.clearDepth(1.0);

        // canvasを初期化
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        // ビュー×プロジェクション座標変換行列
        this.m.lookAt([0.0, 0.0, 3.0], [0, 0, 0], [0, 1, 0], this.vMatrix);
        this.m.perspective(90, this.canvas.width / this.canvas.height, 0.1, 100, this.pMatrix);
        this.m.multiply(this.pMatrix, this.vMatrix, this.tmpMatrix);

        // モデルを移動するためのモデル座標変換行列
        this.m.identity(this.mMatrix);
        this.m.translate(this.mMatrix, [0.0, 0.0, 0.0], this.mMatrix);
        // モデル×ビュー×プロジェクション
        this.m.multiply(this.tmpMatrix, this.mMatrix, this.mvpMatrix);
        // uniformLocationへ座標変換行列を登録し描画する
        this.gl.uniformMatrix4fv(this.uniLocation, false, this.mvpMatrix);
        // インスタンスをレンダリングするドローコール
        this.ext.drawElementsInstancedANGLE(this.gl.TRIANGLES, this.index.length, this.gl.UNSIGNED_SHORT, 0, this.instanceCount);

        // コンテキストの再描画
        this.gl.flush();
        // 繰り返し
        requestAnimationFrame(this.render.bind(this));
    }

    /**
     * シェーダを生成する関数
     * @param {string} id
     */
    create_shader(id){
        // シェーダを格納する変数
        let shader;
        // HTMLからscriptタグへの参照を取得
        let scriptElement = document.getElementById(id);
        // scriptタグが存在しない場合は抜ける
        if(!scriptElement){return;}
        // scriptタグのtype属性をチェック
        switch(scriptElement.type){
            // 頂点シェーダの場合
            case 'x-shader/x-vertex':
                shader = this.gl.createShader(this.gl.VERTEX_SHADER);
                break;
            // フラグメントシェーダの場合
            case 'x-shader/x-fragment':
                shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                break;
            default :
                return;
        }
        // 生成されたシェーダにソースを割り当てる
        this.gl.shaderSource(shader, scriptElement.text);
        // シェーダをコンパイルする
        this.gl.compileShader(shader);
        // シェーダが正しくコンパイルされたかチェック
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            // 成功していたらシェーダを返して終了
            return shader;
        }else{
            // 失敗していたらエラーログをアラートする
            alert(this.gl.getShaderInfoLog(shader));
        }
    }

    /**
     * プログラムオブジェクトを生成しシェーダをリンクする関数
     * @param {Shader} vs
     * @param {Shader} fs
     */
    create_program(vs, fs){
        // プログラムオブジェクトの生成
        let program = this.gl.createProgram();
        // プログラムオブジェクトにシェーダを割り当てる
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        // シェーダをリンク
        this.gl.linkProgram(program);
        // シェーダのリンクが正しく行なわれたかチェック
        if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
            // 成功していたらプログラムオブジェクトを有効にする
            this.gl.useProgram(program);
            // プログラムオブジェクトを返して終了
            return program;
        }else{
            // 失敗していたらエラーログをアラートする
            alert(this.gl.getProgramInfoLog(program));
        }
    }

    /**
     * VBOを生成する関数
     * @param {Array} data
     * @returns {Array} vbo
     */
    create_vbo(data){
        // バッファオブジェクトの生成
        let vbo = this.gl.createBuffer();
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        // 生成した VBO を返して終了
        return vbo;
    }

    /***
     * VBOをバインドし登録する関数
     * @param {Array} vbo
     * @param {Array} attL
     * @param {Array} attS
     */
    set_attribute(vbo, attL, attS){
        // 引数として受け取った配列を処理する
        for(var i in vbo){
            // バッファをバインドする
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
            // attributeLocationを有効にする
            this.gl.enableVertexAttribArray(attL[i]);
            // attributeLocationを通知し登録する
            this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
        }
    }
    
    /***
     * IBOを生成する関数
     * @param {Array} data
     * @returns {Array} ibo
     */
    create_ibo(data){
        // バッファオブジェクトの生成
        let ibo = this.gl.createBuffer();        
        // バッファをバインドする
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);        
        // バッファにデータをセット
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);        
        // バッファのバインドを無効化
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);        
        // 生成したIBOを返して終了
        return ibo;
    }
}