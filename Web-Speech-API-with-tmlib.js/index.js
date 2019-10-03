/*
 * 定数
 */
var SCREEN_WIDTH        = 960;
var SCREEN_HEIGHT       = 640;
var CENTER_X            = SCREEN_WIDTH /2;
var CENTER_Y            = SCREEN_HEIGHT/2;
var POINT_RADIUS        = 80;
var TEXT                = "Speech";
var TEXT_MAX_HEIGHT     = 200;
var PARTICLE_WIDTH      = 10;
var PARTICLE_HEIGHT     = 10;
var PARTICLE_SPACE      = 15;
var PARTICLE_IMAGE      = null;
var particle,tempCanvas;
var particleList = null;
/*
 * プリロード処理
 */
tm.preload(function() {
    // 画像を作成
    var c = PARTICLE_IMAGE = tm.graphics.Canvas();
    c.resize(360*15, PARTICLE_HEIGHT);
    for (var i=0; i<360; ++i) {
        c.fillStyle = "hsl(" + (360/360)*i + ", 60%, 50%)";
        c.fillRect(i*10, 0, 10, 10);
    }
});

/*
 * メイン処理
 */
tm.main(function() {
    app = tm.app.CanvasApp("#world");
    app.fps = 30;
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.background = "rgba(0, 0, 0, 0.25)";

    particleList = [];
    //----------　Web Speech APIで遊ぶ ----------//
    var recognition = new webkitSpeechRecognition();
    //　ディクテーションし続ける
    recognition.continuous = true;
    recognition.onresult = function(event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            var result = event.results[event.resultIndex][0];
            console.log(result.transcript);
            //音声入力をセット
            TEXT = result.transcript;
            //描画する
            drawing();
        }
    }
    //---------- 音声入力ボタン ----------//
    var button = tm.dom.Element("#speakBtn");
    button.absolute();
    button.width  = 150;
    button.height = 50;
    button.style
    .set("borderRadius", "6%")
    .set("background", "blue")
    .set("boxShadow", "inset 3px 3px 10px #fff,  -3px -3px 10px #222, 3px 3px 10px #222")
    .set("fontSize", "22px")
    .set("fontWeight", "bold")
    .set("textAlign", "center")
    .set("lineHeight", "50px")
    .set("cursor", "pointer")
    .set("color", "white");
    //ボタンイベント
    button.event.click(function() {
        recognition.start();
    });

    //描画する
    drawing();

    // 更新
    app.currentScene.update = function() {
        var p = app.pointing;
        var k = app.keyboard;
    };
    app.currentScene.draw = function(c) {
        var p = app.pointing;        
        c.save();
        c.fillStyle = "rgba(255, 255, 255, 0.1)";
        c.fillCircle(p.x, p.y, POINT_RADIUS);
        c.restore();
    }    
    app.run();
});


/**
 * パーティクルクラス
 */
var Particle = tm.createClass({
    superClass: tm.app.Sprite,
    
    init: function(x, y, angle) {
        this.superInit(PARTICLE_WIDTH, PARTICLE_HEIGHT);
        this.image = PARTICLE_IMAGE;
        this.srcRect.x      = angle*10;
        this.srcRect.width  = 10;        
        this.position.set(100, 100);
        this.flag = false;

        this.animation.addTween({
            prop: "x",
            begin: tm.util.Random.randint(0, SCREEN_WIDTH),
            finish: x,
            duration: 1000,
            func: "easeOutCirc",
        });
        this.animation.addTween({
            prop: "y",
            begin: tm.util.Random.randint(0, SCREEN_HEIGHT),
            finish: y,
            duration: 1000,
            func: "easeOutCirc",
        });
        this.rotation = 45;
        this.blendMode = "lighter";
    },
    
    update: function(app) {
        var p = app.pointing;        
        // 拡大
        var length = tm.geom.Vector2.distance(this.position, p.position);
        if (length < POINT_RADIUS) {
            this.scaleX = this.scaleY = 2;
        }
        else {
            this.scaleX = this.scaleY = 1;
        }        
        // 回転
        if (p.getPointing()) {
            this.rotation += 20;
        }
        else {
            this.rotation = 45;
        }
        if(this.flag == true){
            this.remove();
            particleList.erase(this);
        }
    }
});
/**
  *  ドロー
  */ 
var drawing = function(){
    //生成したパーティクル削除
    for (var j = 0,p_len = particleList.length; j < p_len;++j){
        var circle = particleList[j];
        circle.flag = true;
    }
    // レンダリング用キャンバス
    tempCanvas = tm.graphics.Canvas();
    tempCanvas.width = app.width;
    tempCanvas.height= app.height;
    tempCanvas.font = TEXT_MAX_HEIGHT + "px 'Jockey One'";
    tempCanvas.textAlign    = "center";
    tempCanvas.textBaseline = "middle";
    tempCanvas.fillText(
        TEXT,
        tempCanvas.width/2,
        TEXT_MAX_HEIGHT/2
    );
    var heightOffset = 100;
    var heightOffset = app.canvas.height/2 - TEXT_MAX_HEIGHT/2;
    var bitmap = tempCanvas.getBitmap();
    
    for (var height=0; height<tempCanvas.height; height+=PARTICLE_SPACE) {
        for (var width=0; width<tempCanvas.width; width+=PARTICLE_SPACE) {
            var p = bitmap.getPixel(width, height);
            if (p[3] == 255) {
                var x = width;
                var y = height+heightOffset;
                var angle = Math.floor(width/tempCanvas.width*360);
                particle = Particle(x, y, angle);
                app.currentScene.addChild(particle);
                particleList.push(particle);
            }
        }
    }    
};