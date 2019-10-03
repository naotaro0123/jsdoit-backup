//とりあえずの初期値(左から1位〜5位として扱う配列)
var ranking = [10,8,5,3,0];

window.onload = function(){
	//ローカルストレージ取得
	var myData = JSON.parse(localStorage.getItem('rankings'));
	if(myData != null){
		ranking = myData;
	}
	//初期値をランキングにセット
	for(var q = 0; q < 5; q++){
		document.getElementById("res" + q).innerHTML = ranking[q];
	}
}

/*** ランキングに入力値セット ***/
function setRanking(){
	//入力された値
	var score = parseInt(document.getElementById("inp").value);
	//ランキングチェック
	var i;
	for(i = 0; i <= 4; i++){
		if(ranking[i] < score){
			if(i <= 4){
				//格付けの入れ替え(5位から順にチェック)
				for(var n = 4; ranking[n] < score; n--){
					ranking[(n+1)] = ranking[n];
				}
			}
			//今回のスコアを入れる
			ranking[i] = score;
			break;
		}
	}

	for(var r = 0; r < 5; r++){
		//ランキングセット
		document.getElementById("res"+r).innerHTML = ranking[r];
		if(r == i){
			//対象のスコアを強調表示オンにする
			document.getElementById("li" + r).className="strong_text";				
		}else{
			//対象のスコアを強調表示オフにする
			document.getElementById("li" + r).className="";
		}
	}

	//ローカルストレージに配列を保存
	localStorage.setItem('rankings',JSON.stringify(ranking));
}

/*** ランキングをクリア ***/
function myClear(){
	//ローカルストレージ消去
	localStorage.clear();
	var v = 0;
	while(v < 5){
		ranking[v]=0;
		document.getElementById("res"+v).innerHTML = "";
        document.getElementById("li" + v).className="";
		v++;
	}
}
