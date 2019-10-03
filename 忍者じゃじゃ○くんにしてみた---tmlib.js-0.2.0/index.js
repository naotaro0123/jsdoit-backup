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

var DOT_SIZE = 16;
var X_START_POS = 10;
var Y_START_POS = 10;

var dataSet = [
    "無","無","無","無","無","無","無","無","無","無","無","無","無","無","無","無",
    "無","無","無","無","無","赤","赤","赤","赤","赤","無","無","無","無","無","無",
    "無","無","無","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","無","無",
    "無","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","無",
    "無","無","赤","赤","赤","赤","赤","白","白","白","白","白","赤","無","無","無",
    "無","無","無","赤","赤","赤","白","白","白","白","白","白","白","無","無","無",
    "無","無","無","赤","赤","赤","白","白","黒","黒","白","黒","黒","無","無","無",
    "無","白","白","赤","赤","赤","白","白","黒","黒","白","黒","黒","白","白","無",
    "無","白","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","白","無",
    "無","無","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","無",
    "無","無","無","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","無","無",
    "無","無","無","無","赤","赤","赤","赤","赤","赤","赤","無","無","無","無","無",
    "無","白","無","赤","白","白","白","白","白","白","赤","赤","赤","赤","無","白",
    "無","白","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","無","白",
    "無","白","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","白","無",
    "無","無","赤","無","無","無","無","無","無","無","無","赤","無","白","無","無",
];

function getRgbColor( c )
{
    var colorHash = {
        "無":"#000000",
        "白":"#ffffff",
        "肌":"#ffcccc",
        "茶":"#800000",
        "赤":"#ff0000",
        "黄":"#ffff00",
        "緑":"#00ff00",
        "水":"#00ffff",
        "青":"#0000ff",
        "紫":"#800080"
    };
    return colorHash[ c ];
}

/*
 * main
 */
tm.main(function() {
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.background = "rgb(0, 0, 0)";
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
            var x = X_START_POS + ( i % 16 ) * DOT_SIZE;
            var y = Y_START_POS + Math.floor( i / 16 ) * DOT_SIZE;
            var angle = (360/25)*i;
            //var color = "hsl({0}, 75%, 55%)".format(angle);
            var color = getRgbColor( dataSet[i] );
            if ( dataSet[i] != "無" ) {
            var piece = Piece(color).addChildTo(this.pieceGroup);
                piece.position.set(Math.rand(-465, 465*2), Math.rand(-465, 465*2));
                piece.tweener
                    .move(x+90, y+90, 1000, "easeOutQuad")
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
            strokeStyle: "rgb(0, 0, 0)",
            lineWidth: 0
        });

        var scale = Math.randf(1.0, 1.5);
        this.scale.x = scale;
        this.scale.y = scale;

        this.rotation = Math.rand(-25, 25);
    }
});
