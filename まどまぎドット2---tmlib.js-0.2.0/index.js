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
    "色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00",
    "色00","色00","色00","色12","色09","色01","色01","色01","色01","色01","色01","色02","色17","色01","色00","色00",
    "色00","色00","色12","色01","色01","色01","色01","色01","色01","色01","色01","色01","色02","色02","色00","色00",
    "色00","色09","色01","色01","色01","色01","色09","色01","色01","色02","色01","色01","色01","色02","色00","色00",
    "色00","色01","色01","色01","色01","色01","色06","色01","色01","色02","色01","色01","色01","色02","色00","色00",
    "色00","色01","色01","色01","色09","色01","色06","色06","色01","色06","色01","色01","色01","色02","色00","色00",
    "色00","色01","色05","色05","色05","色06","色03","色03","色03","色02","色02","色02","色01","色02","色00","色00",
    "色00","色01","色05","色10","色01","色03","色03","色03","色03","色01","色10","色02","色01","色05","色00","色00",
    "色00","色00","色01","色10","色08","色03","色03","色03","色03","色08","色10","色01","色11","色02","色00","色00",
    "色00","色00","色00","色01","色03","色03","色03","色08","色08","色03","色16","色01","色02","色02","色00","色00",
    "色00","色00","色00","色05","色05","色05","色04","色11","色04","色04","色04","色05","色05","色02","色00","色00",
    "色00","色00","色00","色00","色05","色04","色04","色15","色04","色04","色14","色04","色05","色02","色00","色00",
    "色00","色00","色00","色00","色11","色02","色04","色04","色04","色04","色14","色04","色16","色02","色00","色00",
    "色00","色00","色00","色00","色02","色00","色07","色07","色07","色07","色07","色07","色00","色00","色00","色00",
    "色00","色00","色00","色00","色00","色00","色00","色11","色00","色11","色17","色17","色00","色00","色00","色00",
    "色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00","色00",
];

function getRgbColor( c )
{
    var colorHash = {
        "色00":"hsl(352, 66%,   0%)",
        "色01":"hsl(352, 66%,  63%)",
        "色02":"hsl(345, 51%,  37%)",
        "色03":"hsl( 37, 18%,  90%)",
        "色04":"hsl(156, 12%,  56%)",
        "色05":"hsl(348, 36%,  24%)",
        "色06":"hsl( 23, 30%,  90%)",
        "色07":"hsl(227, 58%,  42%)",
        "色08":"hsl(  6, 43%,  88%)",
        "色09":"hsl(355, 53%,  79%)",
        "色10":"hsl( 40,  1%,  90%)",
        "色11":"hsl( 10, 36%,  83%)",
        "色12":"hsl(353, 34%,  86%)",
        "色13":"hsl( 18, 29%,  21%)",
        "色14":"hsl(200, 21%,  41%)",
        "色15":"hsl(224, 13%,  23%)",
        "色16":"hsl(  7, 26%,  90%)",
        "色17":"hsl( 18, 35%,  12%)",
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
