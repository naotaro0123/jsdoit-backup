// forked from .naotaro's "まどまぎドット2 - tmlib.js 0.2.0" http://jsdo.it/.naotaro/v5Ln
// forked from .naotaro's "まどまぎドット - tmlib.js 0.2.0" http://jsdo.it/.naotaro/laOO
// forked from .naotaro's "忍者じゃじゃ○くんにしてみた - tmlib.js 0.2.0" http://jsdo.it/.naotaro/gTVk
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

var DOT_SIZE = 20;
var X_START_POS = 5;
var Y_START_POS = 5;

var dataSet = [
    "色00","色00","色00","色00","色00","色13","色04","色01","色01","色01","色01","色16","色00","色00","色00","色00",
    "色00","色00","色00","色13","色04","色01","色01","色01","色01","色01","色01","色01","色01","色00","色00","色00",
    "色00","色00","色13","色04","色04","色01","色01","色01","色01","色01","色01","色01","色01","色01","色00","色00",
    "色00","色00","色04","色01","色16","色04","色01","色01","色16","色01","色01","色01","色01","色01","色16","色00",
    "色00","色00","色01","色01","色07","色04","色01","色01","色16","色01","色01","色01","色16","色01","色01","色00",
    "色00","色01","色16","色01","色07","色07","色04","色01","色03","色16","色01","色04","色12","色01","色01","色00",
    "色00","色01","色02","色16","色10","色03","色07","色01","色16","色10","色16","色04","色01","色16","色01","色00",
    "色00","色01","色02","色03","色10","色03","色03","色03","色03","色10","色20","色01","色16","色09","色01","色00",
    "色00","色00","色02","色03","色19","色03","色03","色03","色03","色19","色20","色01","色16","色09","色01","色00",
    "色00","色00","色02","色02","色09","色03","色03","色18","色18","色03","色09","色01","色16","色00","色01","色00",
    "色00","色00","色00","色02","色00","色02","色06","色06","色06","色21","色05","色02","色00","色00","色00","色00",
    "色00","色00","色00","色00","色00","色14","色06","色12","色06","色12","色05","色05","色00","色00","色00","色00",
    "色00","色00","色00","色00","色22","色20","色05","色05","色05","色05","色21","色20","色22","色00","色00","色00",
    "色00","色00","色00","色00","色00","色08","色11","色08","色11","色08","色11","色08","色11","色00","色00","色00",
    "色00","色00","色00","色00","色00","色00","色00","色03","色00","色03","色24","色17","色00","色00","色00","色00",
    "色00","色00","色00","色00","色00","色00","色00","色17","色00","色00","色00","色00","色00","色00","色00","色00",
];

function getRgbColor( c )
{
    var colorHash = {
        "色00":"hsl(  0,  0%,   0%)",
        "色01":"hsl(193, 52%,  55%)",
        "色02":"hsl(218, 45%,  41%)",
        "色03":"hsl( 28, 26%,  80%)",
        "色04":"hsl(191, 23%,  69%)",
        "色05":"hsl( 44, 30%,  80%)",
        "色06":"hsl(359, 66%,  58%)",
        "色07":"hsl( 23, 30%,  80%)",
        "色08":"hsl( 19, 22%,  24%)",
        "色09":"hsl(  7, 26%,  80%)",
        "色10":"hsl(216, 79%,  23%)",
        "色11":"hsl( 18, 29%,  11%)",
        "色12":"hsl( 40, 57%,  68%)",
        "色13":"hsl(207, 12%,  80%)",
        "色14":"hsl( 48, 41%,  77%)",
        "色15":"hsl( 48,  0%,  80%)",
        "色16":"hsl(223, 54%,  40%)",
        "色17":"hsl( 31, 82%,  38%)",
        "色18":"hsl(  6, 43%,  78%)",
        "色19":"hsl(202, 51%,  45%)",
        "色20":"hsl( 40,  1%,  80%)",
        "色21":"hsl( 20, 15%,  49%)",
        "色22":"hsl( 10, 36%,  73%)",
        "色23":"hsl(227, 53%,  48%)",
        "色24":"hsl(208, 41%,  19%)",
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
            var x = X_START_POS + ( i % 16 ) * DOT_SIZE;
            var y = Y_START_POS + Math.floor( i / 16 ) * DOT_SIZE;
            var angle = (360/25)*i;
            var color = getRgbColor(dataSet[i]);
            if ( dataSet[i] != "色00" ) {
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
            strokeStyle: "rgb(255, 255, 255)",
            lineWidth: 0
        });

        var scale = Math.randf(1.0, 1.5);
        this.scale.x = scale;
        this.scale.y = scale;

        this.rotation = Math.rand(-25, 25);
    }
});
