var canvas = document.getElementById("canvas1");
var ctx = canvas.getContext("2d");
var Timer;
var displayTxt;
//透明度を指定
ctx.globalAlpha=0.2;
var i=0;
Timer = setInterval("drawing(ctx)", 1000/50);	//1秒の1/50

function drawing(con){
    //バーの横幅MAXを250にしているため、表示上100%にする計算
    displayTxt="Now Loading..."+Math.floor((i/250)*100)+"%";
    //CANVAS初期化
    ctx.clearRect(0,0,300,300);
    //カウントアップ
    i+=2;
    if(i==250){
        //250まで行ったら処理を終える
        clearInterval(Timer);
        displayTxt="Completed!!";
        ctx.globalAlpha=0.8;//透明度も上げる
    }
    ctx.beginPath();
    //外線描画(位置x,位置y,長さ,高さ)
    con.strokeStyle='rgb(0,204,204)';
    con.strokeRect(10,240,10+i,40);	
    //塗りつぶし描画(位置x,位置y,長さ,高さ)
    con.fillStyle='rgb(0,204,204)';
    ctx.fillRect(10,240,10+i,40);
    //文字を表示する
    ctx.font= "bold 20px sans-serif";
    ctx.fillStyle= "black";
    ctx.textBaseline="middle";
    ctx.fillText(displayTxt,20,260);
}
