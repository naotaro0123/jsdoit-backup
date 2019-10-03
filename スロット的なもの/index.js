enchant();

/*
 * グローバル変数
 */
var slot_left,slot_center,slot_right;
var TXT_START = "スタート";
var TXT_STOP = "ストップ";
var IMG_WIDTH = 80;
var IMG_HEIGHT = 80;
var IMG_MOVE_SPEED = 20;	// 20pxごとに動かす
/*
 * スロットクラス
 */
var Slot = enchant.Class.create(enchant.Sprite,{
	initialize:function(x,y){
		var surface = new Surface(IMG_WIDTH,IMG_HEIGHT);
		// 回転させる画像
		var slot = core.assets['http://jsrun.it/assets/v/F/V/3/vFV3R.png'];
		surface.draw(slot,0,0,IMG_WIDTH,IMG_HEIGHT,0,0,IMG_WIDTH,IMG_HEIGHT);
		enchant.Sprite.call(this,IMG_WIDTH,IMG_HEIGHT);
		this.image = surface;
		this.x = x;
		this.y = y;
		this.status = 'stop';
		this.tick = 0;
		// イベント処理
		this.addEventListener('enterframe',function(){
			if(this.status == 'start'){
				//　徐々にスライドさせる
				this.tick += IMG_MOVE_SPEED;
				surface.draw(slot,0,this.tick,IMG_WIDTH,IMG_HEIGHT,0,0,IMG_WIDTH,IMG_HEIGHT);
				this.image = surface;
				// 最後までいったら初期に戻す
				if (this.tick > IMG_HEIGHT * 6) {
					this.tick = 0;
				}
			}else{
				// 画像が途切れて表示されないようにまわしきる
				if(this.tick % IMG_HEIGHT != 0){
					this.tick += IMG_MOVE_SPEED;
					surface.draw(slot,0,this.tick,IMG_WIDTH,IMG_HEIGHT,0,0,IMG_WIDTH,IMG_HEIGHT);
					this.image = surface;
				}
			}
		});
	}
});
/*
 * ボタン
 */
var PushButton = Class.create(Button,{
	initialize:function(x,y,id){
		enchant.ui.Button.call(this,TXT_START,"light");
		this.moveTo(x,y);
		this.id = id;
		// イベント処理
		this.addEventListener('touchstart',function(){
			if(this.text == TXT_START){
				this.text = TXT_STOP;
				switch(this.id){
					case 'left': slot_left.status = 'start';
					break;
					case 'center': slot_center.status = 'start';
					break;
					case 'right': slot_right.status = 'start';
					break;
				}
			}else{
				this.text = TXT_START;
				switch(this.id){
					case 'left': slot_left.status = 'stop';
					break;
					case 'center': slot_center.status = 'stop';
					break;
					case 'right': slot_right.status = 'stop';
					break;
				}
			}
		});
	}
});
/*
 * メイン処理
 */
window.onload = function() {
    // ゲームオブジェクトの生成
    core = new Core(320,320);
    core.fps = 30;
    core.preload('http://jsrun.it/assets/v/F/V/3/vFV3R.png');
	core.onload = function() {
		// スロットの生成
	 	slot_left = new Slot(10,10);
	 	core.rootScene.addChild(slot_left);
		slot_center = new Slot(110,10);
	 	core.rootScene.addChild(slot_center);
	 	slot_right = new Slot(210,10);
	 	core.rootScene.addChild(slot_right);
	 	// ボタンの生成
		var button_left = new PushButton(15,100,'left');
		core.rootScene.addChild(button_left);
		var button_center = new PushButton(115,100,'center');
		core.rootScene.addChild(button_center);
		var button_right = new PushButton(215,100,'right');
		core.rootScene.addChild(button_right);
	};
	// ゲーム開始
	core.start();
};
