enchant();
//--------------- クラス定義 ---------------//
// スマホクラス
var SmartPhone = enchant.Class.create(enchant.Sprite,{
	initialize: function(x,y,img,height,width){
		enchant.Sprite.call(this,height,width);
		this.image = game.assets[img];
		this.x = x;
		this.y = y;
		this.scale(1.1,1.1);
		game.rootScene.addChild(this);
	},
	remove: function(){
		game.rootScene.removeChild(this);
	}
});
// エフェクトクラス
var Effect = enchant.Class.create(enchant.Sprite,{
	initialize: function(x,y){
		enchant.Sprite.call(this,80,60);
		this.image = game.assets['http://jsrun.it/assets/p/W/J/T/pWJTg.png'];
		this.x = x;
		this.y = y;
		this.frame = rand(4);
		game.rootScene.addChild(this);
	},
	remove: function(){
		game.rootScene.removeChild(this);
	}
});
// パンチクラス
var Punch = enchant.Class.create(enchant.Sprite,{
	initialize:function(x,y){
		enchant.Sprite.call(this,120,120);
		this.image = game.assets['http://jsrun.it/assets/5/W/B/7/5WB7S.png'];
		this.x = x;
		this.y = y;
		this.wait = 0;	//消えるまでの時間用
		this.addEventListener("enterframe", function(){
			this.wait++;
			if(this.wait>=10){
				this.wait=0;
				this.remove();
			}
		});
		game.rootScene.addChild(this);
	},
	remove: function(){
		game.rootScene.removeChild(this);
	}
});
// rand関数
rand = function(n){
	return Math.floor(Math.random()*n);
}

//--------------- メインメソッド ---------------//
window.onload = function(){
	game = new Game(320, 320);
	game.fps = 30;
	game.preload('http://jsrun.it/assets/p/X/j/L/pXjLz.png','http://jsrun.it/assets/3/E/o/B/3EoBj.png','http://jsrun.it/assets/b/A/z/o/bAzok.png','http://jsrun.it/assets/p/W/J/T/pWJTg.png','http://jsrun.it/assets/5/W/B/7/5WB7S.png','http://jsrun.it/assets/j/T/3/t/jT3t0.mp3','http://jsrun.it/assets/f/P/z/i/fPzip.mp3');
	game.sound1 = Sound.load('http://jsrun.it/assets/j/T/3/t/jT3t0.mp3');
	game.sound2 = Sound.load('http://jsrun.it/assets/f/P/z/i/fPzip.mp3');

	game.onload = function(){
		// ScoreLabel生成
		var scoreLabel = new ScoreLabel(20, 10);
		scoreLabel.score = 0;
		scoreLabel.text = "SCORE:" + scoreLabel.score;
		game.rootScene.addChild(scoreLabel);
		// TimeLabel生成
		var timeLabel = new TimeLabel(20, 30, 'countdown');
		timeLabel.time = 30;
		timeLabel.text = "TIME:" + timeLabel.time;
		game.rootScene.addChild(timeLabel);
		// 台数
		var cnt = 1;
		// SmartPhone生成
		// android = new SmartPhone(100, 60, 'images/android' + cnt + '.png', 119, 240);
		android = new SmartPhone(100, 60, 'http://jsrun.it/assets/p/X/j/L/pXjLz.png', 119, 240);
		// Touch Event
		game.rootScene.addEventListener('touchstart', function(event){
			var pointX = event.localX-35;	// 35=ずれ補正
			var pointY = event.localY-35;	// 35=ずれ補正
			// スマホのディスプレイ部分のみタッチイベントに反応
			if(pointX > 77 && pointX < 162 && pointY > 57 && pointY < 210){
				// パンチ生成 20=ずれ補正
				punch = new Punch(pointX-20,pointY+20);
				// エフェクト生成
				effect = new Effect(pointX, pointY);
				// 点数判定
				if(scoreLabel.score == 200){
					effect.remove();
					android.remove();
					game.sound2.play();
					cnt++;
					// SmartPhone生成
					android = new SmartPhone(100, 60, 'http://jsrun.it/assets/3/E/o/B/3EoBj.png', 119, 240);
				}else if(scoreLabel.score == 400){
					effect.remove();
					android.remove();
					game.sound2.play();
					cnt++;
					// SmartPhone生成
					android = new SmartPhone(100, 60, 'http://jsrun.it/assets/b/A/z/o/bAzok.png', 119, 240);
				}else if(scoreLabel.score == 600){
					game.sound2.play();
                    game.end(scoreLabel.score,scoreLabel.score+"スコア獲得しました!");
                    alert("おめでとう。android1.x〜2.x系を破壊できました！");
//					game.clear(scoreLabel.score, "おめでとう。android1.x〜2.x系を破壊できました！");
				}else{
					// クリア条件を満たしていない場合
					game.sound1.play();
				}
				// スコアカウントアップ
				scoreLabel.score += 5;
			}
		});

		// Gameタイムライン
		game.rootScene.addEventListener('enterframe', function(e){
			// 終了判定
			if(timeLabel.time < 0){
				timeLabel.text ="TIME:0";
				game.end(scoreLabel.score,scoreLabel.score+"スコア獲得しました!");
			}
		});
	}
	game.start();
}