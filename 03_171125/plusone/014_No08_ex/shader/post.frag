
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

//---------------------------------------------------------------------------------
//
// map関数の中にdistance functionをひたすら書いて「モデリング」していく
// 一番難しい所。狙ったものを作成するのが難しいのでなれるしかない
// なれる -> いろんな方のmap関数を見るのが良いと思います。
// プリミティブなdistance functionは以下を参照。これの組み合わせで世界ができる
//
//
// iq氏のdistance functionのコレクション。
// http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
//
// mercuryのdistance functionのコレクション
// http://mercury.sexy/hg_sdf/
// 
//
//---------------------------------------------------------------------------------
float map(vec3 p) {
	vec3  np = mod(p, 2.0) - 1.0;
	float t = length(mod(p, 2.0) - 1.0) - 0.6;
	
	//ボックス - スフィアとのブール演算で抜く
	return max(-t, length(max(abs(np) - 0.5, 0.0)) - 0.01);
}

//distance functionから法線を取得する
//レイが大体衝突した位置の偏微分を取ってnormalize.
vec3 getNormal(vec3 p) {
	vec2 d = vec2(0.01, 0.0);
	return normalize(
		vec3(
			map(p + d.xyy) - map(p - d.xyy),
			map(p + d.yxy) - map(p - d.yxy),
			map(p + d.yyx) - map(p - d.yyx)));
			
			
}

void main( void ) {
	//画面全体を覆うテクスチャ座標を作成する(画面のピクセル位置 / 画面の解像度 -> 0.0～1.0
	vec2 uv = ( gl_FragCoord.xy / resolution.xy );
	
	//-1.0 ～ 1.0に値を調整する
	uv = uv * 2.0 - 1.0;
	
	//アスペクト比を考慮してテクスチャ座標を再計算
	//最初はこれはなくてもできるのでOK
	uv.x *= resolution.x / resolution.y;
	
	//レイマーチングは、レイの方程式f(t) = P + Vtをとあるimplict functionに適用して解析的にtについて解く
	//視点位置(P -> pos)と、レイの方向(V -> dir)を作る
	
	//単純に視点をtimeで前に進めるようにする
	vec3 pos = vec3(0, 0, time);
	
	//テクスチャ座標は-1.0～1.0のXY成分。これにZ方向を足してレイを作る。画面全体にレイが台形状に飛ぶ
	//Z成分は1.0だけど、これはレイマーチングで解くimplict functionに合わせる。
	vec3 dir = vec3(uv, 1.0);
	
	//方向成分が重要なので、、単位ベクトルにする
	dir = normalize(dir);
	
	//tについて解く(t == posからdir方向に対してdir*t分レイを進めたものがimplict functionで定義した解までの距離をもとめる
	float t = 0.0;
	for(int i = 0 ; i < 100; i++) {
		//distance functionの関数群に対して今いるposからちょっとずつ解析的に解く
		float temp = map(t * dir + pos);
		
		//単純に足してもいいし、temp <= 0.01と大体十分tが0に近づいてたら計算を打ち切ってもいい。
		//「もし」モバイルターゲットなら打ち切り必須
		//temp < 0なら、レイがdistance functionで求める図形の中にいる可能性があるので
		//必要であればtをちょっと巻き戻して(0.75とかかけて戻す)計算しなおすなど工夫が必要。
		//一番面白い所。
		t += temp;
	}
	
	//レイを進めた位置を求める
	vec3 intersect_p = pos + dir * t;
	
	//tが0～レイが飛んだ位置までの長さなのでとりあえず出力してみる
	gl_FragColor = vec4(vec3(t * 0.03), 1.0);
	
	
	//コメントアウト(★)してる場所を外してどんな変化になるか見てみましょう
	//フェイクnormal
	//出典 : http://www.pouet.net/topic.php?which=7535&page=1
	//★gl_FragColor = vec4(vec3(t * 0.03) + map(intersect_p - 0.1), 1.0);
	
	//法線を生成して表示
	vec3 N = getNormal(intersect_p);
	//★gl_FragColor.xyz = N;
	
	//ディレクショナルライト
	vec3 LightDir = normalize(vec3(1,2,3));
	
	//クラシカルなdiffuseを求める
	float D = max(0.2, dot(N, normalize(LightDir)));
	//★gl_FragColor.xyz *= D;

	//求めたtをそのままフォグの計数にしてしまう
	//★gl_FragColor.xyz += vec3(pow(t * 0.05, 2.0));
	
}


