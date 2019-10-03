//画面設定
var b = document.body;
var d = document.documentElement;
var WIDTH = Math.max(b.clientWidth , b.scrollWidth, d.scrollWidth, d.clientWidth);
var HEIGHT = Math.max(b.clientHeight , b.scrollHeight, d.scrollHeight, d.clientHeight);
//コンテナとレンダラーの配置
var container = document.getElementById('container');
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
container.appendChild(renderer.domElement);

// シーンの生成
var scene = new THREE.Scene();
// カメラ配置
var camera = new THREE.PerspectiveCamera(45, WIDTH/HEIGHT, 1, 1000);
camera.position.z = 300;
scene.add(camera);
// ライト配置
var light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.x = 0.5;
light.position.y = 0.5;
light.position.z = 1;
scene.add(light);
// 立方体のジオメトリとマテリアル設定
var geometry = new THREE.BoxGeometry(100,100,100);
// var material = new THREE.MeshLambertMaterial({color:0x336699});
var material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});
// メッシュ生成
var mesh = new THREE.Mesh(geometry, material);
// メッシュを回転
mesh.rotation.x = 30 * Math.PI / 180.0;
mesh.rotation.y = -30 * Math.PI / 180.0;
// メッシュをシーンに追加
scene.add(mesh);

// マウスの位置でメッシュを回転
renderer.domElement.addEventListener('mousemove', function(e){
    mesh.rotation.x = e.pageY / 100.0;
    mesh.rotation.y = e.pageX / 100.0;
    // シーンを描画する
    renderer.render(scene,camera);
}, false);
