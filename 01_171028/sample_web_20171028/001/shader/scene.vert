// JavaScript から VBO 経由で送られてきた頂点座標

// vec => ベクトル(vector) vec2 ~ vec4 (0,0,0)
attribute vec3 position; //XYZ
//↑修飾子  ↑型  ↑名前

// 頂点シェーダプログラムのエントリポイントとなる関数（名前は必ず main とする）
void main(){
    // 頂点シェーダから出力する頂点の座標

    //座標変換済みの頂点を出力する
    gl_Position = vec4(position, 1.0);
    // 頂点の大きさは頂点シェーダで設定する
    //上限があり、上限はハードウェア構成により変わる、モバイルだと255くらいまで
    gl_PointSize = 8.0;
}
