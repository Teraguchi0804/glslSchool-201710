precision mediump float;
uniform sampler2D texture;   // フレームバッファに描画したレンダリング結果
uniform float     time;      // 時間の経過
varying vec2      vTexCoord; // テクスチャ座標

// ホワイトノイズを生成する乱数生成関数
float rnd(vec2 n){
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main(){
    // ホワイトノイズを生成
    float n = rnd(gl_FragCoord.st + mod(time, 10.0));

    // フレームバッファの描画結果をテクスチャから読み出す
    gl_FragColor = texture2D(texture, vTexCoord);
    bool is_odd = mod(gl_FragCoord.x - 0.5, 2.0) == 1.0; //奇数ならtrue, それ以外ならfalse
    if(is_odd) {
        gl_FragColor = vec4(1.0); 
    }
}
