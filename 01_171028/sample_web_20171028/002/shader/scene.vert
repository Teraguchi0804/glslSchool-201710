// JavaScript から VBO 経由で送られてきた頂点座標
attribute vec3 position;
// JavaScript から送られてくる値を受け取る uniform 変数 @@@
uniform vec2 mouse; // (-1.0 ~ 1.0)

void main(){
    // マウスカーソルの値を反映してみる（その１） @@@
    // 肩を揃えるためにvec3にしている
//    vec3 v = vec3(mouse, 0.0);
//    gl_Position = vec4(position + v, 1.0);

    // マウスカーソルの値を反映してみる（その２） @@@
    // abs 絶対値を取る　→　全部をプラスする
    // float f = abs(mouse.x);
    // gl_Position = vec4(position * f, 1.0);

    // マウスカーソルの値を反映してみる（その３） @@@
    // ベクトルの長さ
     float f = length(mouse);
     gl_Position = vec4(position * f, 1.0);

    // 頂点の大きさは頂点シェーダで設定する
    gl_PointSize = 8.0;
}
