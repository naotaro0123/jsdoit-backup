// forked from .naotaro's "カービ○にしてみた - tmlib.js 0.2.0" http://jsdo.it/.naotaro/1bW8
// forked from cx20's "ピースでドット絵を作ってみるテスト - tmlib.js 0.2.0" http://jsdo.it/cx20/AlyU
// forked from phi's "カラフルピース - tmlib.js 0.2.0" http://jsdo.it/phi/62LO
// forked from phi's "サクッとプレイヤー移動 - tmlib.js 0.2.0" http://jsdo.it/phi/UI9F
// forked from phi's "template - tmlib.js 0.1.7" http://jsdo.it/phi/m68l
/*
 * tmlib.js 0.2.0
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 465;              // スクリーン幅
var SCREEN_HEIGHT   = 465;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

var DOT_SIZE = 13;
var X_START_POS = 2;
var Y_START_POS = 2;

// x= 29列 , y= 30行
var dataSet = [
    "白","白","黒","黒","黒","黒","黒","黒1","黒2","黒1","黒2","黒1","黒2","黒1","黒2","黒1","黒2","黒1","黒2","黒1","黒2","黒1","黒","黒","黒","黒","黒","白","白","白","白",
    "白","黒","黒4","白","白","白","黒3","白","黒2","白","黒2","白","黒2","白","黒2","白","黒2","白","黒2","白","黒2","白","黒3","白","白","白","黒4","黒","白","白","白",
    "白","灯","黒4","白","白","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","白","白","黒4","灯","白","白","白",
    "灯","赤","灯","白","白","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","黒3","白","白","白","灯","赤","灯","白","白",
    "灯","赤","灯","黒4","黒4","黒4","黒4","白","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","白","黒4","黒4","黒4","黒4","灯","赤","灯","白","白",
    "灯","赤","灯","白","白","白","黒4","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","黒4","白","白","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","白","白","黒4","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","黒4","白","白","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","焔","焔","炎","炎","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","焔","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","炎","赤","炎","赤","炎","炎","焔","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","焔","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","炎","赤","炎","赤","炎","炎","炎","焔","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","焔","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","炎","赤","炎","赤","炎","炎","焔","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","炎","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","焔","炎","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","白","白","白","白","白","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","灯","赤","灯","白","白",
    "灯","赤","灯","白","白","黒4","黒4","黒4","白","白","白","白","白","白","白","白","白","白","白","白","白","黒4","黒4","黒4","白","白","灯","赤","灯","白","白",
    "灯","焰","灯","白","白","黒4","白","黒4","白","白","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","黒4","白","白","黒4","黒4","黒4","白","白","灯","焰","灯","白","白",
    "灯","炎","灯","白","白","黒4","黒4","黒4","白","白","黒4","白","黒4","白","黒4","白","黒4","白","黒4","白","白","黒4","白","黒4","白","白","灯","炎","灯","白","白",
    "灯","炎","灯","白","白","黒4","黒4","黒4","白","白","黒4","白","黒4","白","黒4","白","黒4","白","黒4","白","白","黒4","黒4","黒4","白","白","灯","炎","灯","白","白",
    "灯","炎","灯","白","白","白","白","白","白","白","黒4","赤","赤","赤","赤","赤","赤","赤","黒4","白","白","白","白","白","白","白","灯","炎","灯","白","白",
    "灯","炎","灯","白","黒4","黒4","黒4","黒4","黒4","黒4","黒4","灯","灯","灯","灯","灯","灯","灯","黒4","黒4","黒4","黒4","黒4","黒4","黒4","白","灯","炎","灯","白","白",
    "灯","黒","黒4","白","黒4","白","焔","焔","焔","白","黒3","灯","灯","灯","灯","灯","灯","灯","黒4","白","焔","焔","焔","白","黒3","白","黒3","黒","灯","白","白",
    "白","黒","黒4","白","黒4","白","赤","赤","赤","白","黒3","白","白","白","白","白","白","白","黒4","白","焔","炎","焔","白","黒3","白","黒3","黒","白","白","白",
    "白","黒","黒4","白","黒4","白","焔","焔","焔","白","黒3","白","白","白","白","白","白","白","黒4","白","焔","焔","焔","白","黒3","白","黒3","黒","白","白","白",
    "白","黒","黒4","白","黒4","白","白","白","白","白","黒3","白","白","白","白","白","白","白","黒4","白","白","白","白","白","黒3","白","黒3","黒","白","白","白",
    "白","黒","黒4","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","白","黒3","黒","白","白","白",
    "白","黒","黒4","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒3","黒","白","白","白",
    "白","黒","黒5","黒5","赤","黄","赤","黄","赤","赤","黄","赤","黄","黄","黄","赤","黄","黄","赤","黄","黄","赤","赤","赤","赤","黒5","黒5","黒","白","白","白",
    "白","黒","黒5","黒5","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","黒5","黒5","黒","白","白","白",
    "白","黒","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒5","黒","白","白","白",
    "白","黒","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","黒3","焔","焔","焔","焔","焔","黒3","黒3","黒3","黒3","黒3","黒","白","白","白",
    "白","白","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","黒","白","白","白","白",
];

function getRgbColor( c )
{
    var colorHash = {
        "無":"#000000",
        "白":"#ffffff",
        "肌":"#FF7F50",
        "茶":"#800000",
        "赤":"#ff0000",
        "黄":"#DAA520",
        "緑":"#00ff00",
        "水":"#00ffff",
        "青":"#0000ff",
        "桜":"#FF69B4",
        "灯":"#800000",
        "焔":"#902A2A",
        "炎":"#B22222",
        "焰":"#F08080",
        "黒1":"#3F3F3F",
        "黒2":"#696969",
        "黒3":"#A9A9A9",
        "黒4":"#C0C0C0",
        "黒5":"#DCDCDC",
    };
    return colorHash[ c ];
}

/*
 * main
 */
tm.main(function() {
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.background = "rgb(255, 255, 255)";
    app.fitWindow();

    app.replaceScene(MainScene());

    app.run();
});

/*
 * main scene
 */
tm.define("MainScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();

        this.pieceGroup = tm.display.CanvasElement().addChildTo(this);

        for (var i=0; i<dataSet.length; ++i) {
            var x = X_START_POS + ( i % 31 ) * DOT_SIZE;
            var y = Y_START_POS + Math.floor( i / 31 ) * DOT_SIZE;
            var angle = (360/25)*i;
            //var color = "hsl({0}, 75%, 55%)".format(angle);
            var color = getRgbColor( dataSet[i] );
            if ( dataSet[i] != "無" ) {
            var piece = Piece(color).addChildTo(this.pieceGroup);
                piece.position.set(Math.rand(-465, 465*2), Math.rand(-465, 465*2));
                piece.tweener
                    .move(x+20, y+50, 1000, "easeOutQuad")
                    .wait(250)
                    .rotate(0, 1000, "easeOutQuad")
                    .wait(250)
                    .scale(1, 1000, "easeOutQuad")
                    .call(function() {
                    }.bind(piece));
            }
        }
    },

    update: function(app) {
    }
});


tm.define("Piece", {
    superClass: "tm.display.RectangleShape",

    init: function(color) {
        this.superInit(DOT_SIZE*0.9, DOT_SIZE*0.9, {
            fillStyle: color,
            strokeStyle: "rgb(255, 255, 255)",
            lineWidth: 0
        });

        var scale = Math.randf(1.0, 1.5);
        this.scale.x = scale;
        this.scale.y = scale;

        this.rotation = Math.rand(-25, 25);
    }
});
