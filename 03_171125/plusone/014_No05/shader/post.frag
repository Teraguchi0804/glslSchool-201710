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

vec4 nightScope(sampler2D tex, vec2 uv){
    // スクリーン上の座標（0.0 ~ resolution）を正規化（-1.0 ~ 1.0）する @@@
    vec2 p = uv * 2.0 - 1.0;

    // フレームバッファの描画結果をテクスチャから読み出す
    vec4 samplerColor = texture2D(tex, uv);

    // 簡単なモノクロ化 @@@
    float dest = (samplerColor.r + samplerColor.g + samplerColor.b) / 3.0;

    // ビネット（四隅が暗くなるような演出） @@@
    float vignette = 1.5 - length(p);
    dest *= vignette;

    // ホワイトノイズを生成 @@@
    float noise = rnd(gl_FragCoord.st + mod(time, 10.0));
    dest *= noise * 0.5 + 0.5;

    // ブラウン管モニタのような走査線 @@@
    float scanLine = abs(sin(p.y * 200.0 + time * 5.0)) * 0.5 + 0.5;
    dest *= scanLine;

    // 様々なポストプロセスを乗算して出力する
    return greenColor * vec4(vec3(dest), 1.0);
}

void main() {

	//ポリゴンのUV座標を取得
	vec2 uv = vTexCoord;
	
	//-1～1にする
	uv = uv * 2.0 - 1.0;
	
	//0以外ならフェイクパースづくり
	if(uv.y != 0.0) {
		uv.x /= abs(uv.y * 2.0);
	}
	
	//画面上半分とした半分で同じYの値を使いたいので、絶対値を取る
	uv.y = abs(uv.y);
	
	//フェイクフォグを作る(画面タテ中央がuv.y == 0。なので、1.0 - yで徐々にグラデーション
	float fog = 1.0 - uv.y;
	
	//X方向にスクロール
	//uv.x += time * 0.01;
	
	//出来上がったUVをテクスチャループ
	uv = mod(uv * 5.0, 1.0);
	
	//ナイトスコープにしてレンダリング(もちろん岩とか、地面とかのテクスチャでもいい)
	gl_FragColor = nightScope(texture, uv);
	
	//色収差をつけてみる(https://ja.wikipedia.org/wiki/%E8%89%B2%E5%8F%8E%E5%B7%AE)
	const vec2 offset = vec2(0.05, 0.0);
	gl_FragColor.r = nightScope(texture, uv - offset).r;
	gl_FragColor.b = nightScope(texture, uv + offset).b;
	
	//フェイクフォグを適用
	gl_FragColor.xyz += vec3(fog * fog);
}

