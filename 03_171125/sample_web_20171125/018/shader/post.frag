precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度

const float size = 50.0;           // モザイク模様ひとつあたりのサイズ
const float halfSize = size * 0.5; // モザイク模様のサイズの半分

void main(){
    // スクリーン座標を均等に分割し範囲を size の領域に限定する（-size / 2 ～ size / 2） @@@
    // mod == 割った余り（除算の剰余）
    // 0.0 ~ 49.9999.... - 25.0
    // -25 ~ 25
    vec2 p = mod(gl_FragCoord.st, size) - halfSize;

    // ベクトルの長さを測り二値化する @@@
    // step XXより小さい時に、1.0を返す
    float len = step(length(p), halfSize - 1.0);
    // アンチエイリアスする場合の例
    // smoothstep(最小値、最大値、計測値);
    // 計測値が、最小値と最大値に対して相対的な位置を返す
    // smoothstep(0.0, 10.0, 5.0) === 0.5
    // エルミート補間
     float edge = 1.0 - smoothstep(halfSize - 2.5, halfSize, length(p));
     len *= edge;
//     if(p.x > 0.0){
//        len *= edge;
//     }

    // スクリーン座標をサイズで割ってからサイズを掛ける
    vec2 texCoord = floor(gl_FragCoord.st / size) * size;

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, texCoord / resolution);

    // テクスチャの色にノイズの値を掛ける
    gl_FragColor = samplerColor * vec4(vec3(len), 1.0);
}
