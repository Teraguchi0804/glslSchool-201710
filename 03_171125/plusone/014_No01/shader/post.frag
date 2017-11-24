precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度 @@@
varying vec2      vTexCoord;  // テクスチャ座標

const   vec4      greenColor = vec4(0.2, 1.0, 0.5, 1.0);

// ホワイトノイズを生成する乱数生成関数
float rnd(vec2 n){
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

//p = x,y -> -1.0～1.0が返却されること
float createMask(vec2 p, vec2 offset) {
	//アスペクト比を意識してUVを新円にする
	p.y /= resolution.x / resolution.y;

	//右
	float vignette0 = clamp(1.0 - length(p + offset), 0.0, 1.0);

	//右
	float vignette1 = clamp(1.0 - length(p - offset), 0.0, 1.0);
	//smoothstepでの0～1に変化させる開始と終了
	float startD = 0.50;
	float endD = 0.55;

	//マスクを作成
	float value = 0.0;
	value += smoothstep(startD, endD, vignette0);
	value += smoothstep(startD, endD, vignette1);
	
	//値域を制限して返却
	return clamp(value, 0.0, 1.0);
}

void main(){
    // スクリーン上の座標（0.0 ~ resolution）を正規化（-1.0 ~ 1.0）する @@@
    vec2 p = (gl_FragCoord.st / resolution) * 2.0 - 1.0;

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(texture, vTexCoord);

    // 簡単なモノクロ化 @@@
    float dest = (samplerColor.r + samplerColor.g + samplerColor.b) / 3.0;

    // ホワイトノイズを生成 @@@
    float noise = rnd(gl_FragCoord.st + mod(time, 10.0));
    dest *= noise * 0.5 + 0.5;

    // ブラウン管モニタのような走査線 @@@
    float scanLine = abs(sin(p.y * 200.0 + time * 5.0)) * 0.5 + 0.5;
    dest *= scanLine;
    
    //双眼鏡マスクを適用する
    dest *= createMask(p, vec2(0.3, 0.0));

    // 様々なポストプロセスを乗算して出力する
    gl_FragColor = greenColor * vec4(vec3(dest), 1.0);
}
