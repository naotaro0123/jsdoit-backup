/*
 * constant
 */
var SCREEN_WIDTH    = 640;
var SCREEN_HEIGHT   = 640;
var SCREEN_CENTER_X = SCREEN_WIDTH/2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;
var SYURIKEN_SIZE = 60;
var SYURIKEN_ANASIZE = 10;

/*
 * メイン処理(ページ読み込み後に実行される)
 */
tm.main(function() {
    // アプリケーション作成
    var app = tm.app.CanvasApp("#world");
    // リサイズ
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // 自動フィット
    app.fitWindow();
    // ゲーム速度
    app.fps = 60;
    // シーンを切り替える
    app.replaceScene(MainScene());
    // 実行
    app.run();
});

/*
 * メインシーン
 */
tm.define("MainScene", {
    superClass: "tm.app.Scene",
    init: function() {
        // 親の初期化
        this.superInit();
    },
    update: function(app) {
        if(app.frame % 5 == 0){
            // x座標は0〜SCREEN_WIDTHまでランダム
            var x = tm.util.Random.randint(0, SCREEN_WIDTH);
            // y座標は0 or SCREEN_HEIGHT or SCREEN_CENTER_Yのどれかのみ
            var rnd = Math.floor(Math.random()*10)%3;
            var y = 0;
            switch (rnd){
                case 0:
                    y = 0;
                    break;
                case 1:
                    y = SCREEN_HEIGHT;
                    break;
                case 2:
                    y = SCREEN_CENTER_Y;
                    // 真ん中から飛ばす場合は、x軸は画面の端から
                    x = (Math.floor(Math.random()*10)%2<1)? 0:SCREEN_WIDTH;
                    break;
            }
            // 手裏剣の生成
            var syuriken = Syuriken(x,y);
            this.addChild(syuriken);
        }
    },
});

// 手裏剣の外側(十字型)
tm.define("Syuriken", {
    superClass:"tm.app.StarShape",
    init:function(x,y){
        this.superInit(SYURIKEN_SIZE,SYURIKEN_SIZE,{
            sides:4,
            fillStyle:"DimGray",
        });
        this.x = x;
        this.y = y;
        // 角度を求める
        this.deg = Math.atan2(SCREEN_CENTER_Y-y,SCREEN_CENTER_X-x);
        // 避けゲーとして成立しないのでイレギュラー要素を入れる
        this.rand = Math.random()*0.3;
        //　ベクトル
        this.vx = Math.cos(this.deg)+this.rand;
        this.vy = Math.sin(this.deg)+this.rand;
        // スピード
        this.speed = 5;
        // 手裏剣の穴を子供としてつけておく
        var ana = Ana();
        this.addChild(ana);
    },
    update:function(){
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
        // 回転
        this.rotation += 5;
        // 画面外に消えたら削除
        if(this.x < 0 || this.x > SCREEN_WIDTH || this.y < 0 || this.y > SCREEN_HEIGHT){
            this.remove();
        }
    },
});

// 手裏剣の内側(丸)
tm.define("Ana",{
    superClass:"tm.app.CircleShape",
    init:function(){
        this.superInit(SYURIKEN_ANASIZE,SYURIKEN_ANASIZE,{
            fillStyle:"white"
        });
    },
});
