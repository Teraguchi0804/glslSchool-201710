# glslSchool-201710
GLSLスクールの資料とサンプル

## 第1回_10/28(土)

資料：http://school.souhonzan.org/201710/001/<br>
プラスワン講義：<br>
http://school.souhonzan.org/201710/001p/<br>
http://school.souhonzan.org/201710/001pp/<br>

【メモ】<br>
・GLSL ES 1.0はOpenGLのなかでWebで使用できるように軽量化したもの<br>
・WebGLはGLSL ES 1.0をWebで使用できるようにしたもの<br>
・パフォーマンスは頂点シェーダの量やエフェクトのどの部分に負荷がかかっているのかの検証が必要<br>
・コンピュートシェーダーは次のWebGLのバージョンにのるかも！？<br>
・OpenGLではGPU内のメモリのどの位置（ロケーション）を示しているかを指し示す必要がある(C言語等のポインタに相当)<br>

<重要な修飾子><br>
attribute：頂点に属する、頂点毎の固有の情報を格納<br>
uniform：グローバル変数、javascript(アプリケーション)とシェーダーのやり取りをするため<br>
varying：頂点シェーダからフラグメントへやり取りするため<br>
・Gl.clearColor（canvas をクリアする色の設定）は黒以外の方がいい、ハマった時にエラーを見つけやすい<br>
・canvasの大きさも変わったらGL内のviewpoertも変えてあげる必要がある<br>
・GLSL内では原点の位置がスクリーンの中心右に行くとXプラス、上に行くとYプラス、<br>
・GLSLでは幅は−１〜１<br>

## 第2回_11/11(土)
資料：http://school.souhonzan.org/201710/002/<br>
プラスワン講義：02_171111/プラスワン講義資料/GLSLSchool2017.pdf<br>
【メモ】<br>
・gl_Positionは-1.0〜1.0の間しか描画しないので、座標変換をしないと-1.0〜1.0の範囲にあるものしか描画されない<br>
・頂点の座標変換は行列を使って行う(サンプル006では mat4 mvpMatrix)<br>
・頂点シェーダの役割は大まかには「頂点の座標変換」<br>
・シェーダ内の条件分岐はif文ではなく、step関数によって2値化された値を掛け合わせることにより条件分岐している人が多い<br>
→ただし無理して使う必要はなく、普通にif文で書いても良い<br>
・図に書いてみるのが理解しやすい<br>

## 第3回_11/25(土)
資料：http://school.souhonzan.org/201710/003/<br>
プラスワン講義：/03_171125/GLSLSCHOOL_plusone03.pdf<br>
【メモ】<br>
・ランダム関数はMacOSやiOSはデバイスのスペック(GPUの性能とか)によって出力される値が左右されることがある<br>
・ビネット効果：端が暗くなるやつ<br>
・走査線エフェクト：よく見る横線のエフェクト<br>
・GLSLで一般的によく使われているのはSimplex Noise<br>
https://qiita.com/yuichiroharai/items/1eaf4ce7e542b11da9ac<br>
・人の作った秘伝のソースをパクって使って見る、数学的な理解は追い追い。<br>
・まずは目的の絵作りをするために試してみて、そこから最適化を実行してみる<br>
・ファミコン的な絵作りをしたい場合はワザと解像度を落とすためにモザイク処理をして見るとよい<br>

【プラスワン講義メモ】<br>
[UVについて]<br>
こちらが的確で参考になるかと思います。<br>
https://ja.wikipedia.org/wiki/%E3%83%86%E3%82%AF%E3%82%B9%E3%83%81%E3%83%A3%E3%83%9E%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0#.E3.83.86.E3.82.AF.E3.82.B9.E3.83.81.E3.83.A3.E5.BA.A7.E6.A8.99<br>

[佐々木がライブコーディング後にうけたmap関数について]<br>
この辺が参考になると思います。<br>

iq氏のdistance functionのコレクション。<br>
http://iquilezles.org/www/articles/distfunctions/distfunctions.htm<br><br>

mercuryのdistance functionのコレクション<br>
http://mercury.sexy/hg_sdf/<br>

また、フェイクnormalについては以下参照。<br>
2年くらいいろんなレイマーチングでこれを使ってきた感じだと本当にフェイクなので全然コントロール利きません。<br>
サイズコーディングしたい方は極めて見てもいいと思います。<br>
http://www.pouet.net/topic.php?which=7535&page=1<br>

[cdakのシェーダーコードについて]<br>
cdakとはデモ(4KByteDemo)のことです。<br>
https://www.youtube.com/watch?v=cjSJc2eCetE<br>

再掲になりますが、4096バイトのexeで、できています。<br>
このデモのすごいところはこのサイズでストーリー性があり、音楽とシンクロしていて見た目がかっこいい所です。<br>
すごいとしか言いようがありませんね。<br>

 [cdakのextractされたシェーダーコード : レイマーチング]<br>
https://pastebin.com/9PRG1PfN<br>

## 第4回_12/9(土)
資料：http://school.souhonzan.org/201710/004/<br>
おまけ資料(レイマーチング)：http://school.souhonzan.org/201710/004p/<br>

プラスワン講義：
- 資料: https://goo.gl/Wtp333<br>
- サンプルファイル: https://goo.gl/mjGXH9<br>

【メモ】<br>
・hightTexture 8bit 0〜255(256)<br>
    -0.5 ~ 0.5 の間に<br>
・うまい具合に深度テクスチャを作るのがポイント<br>
・極座標は距離と角度で計算<br>
・GPGPUで使用する「テクスチャ」とは画像ではなく単なる変数の代わりとなる格納庫（配列）<br>


【プラスワン講義メモ】<br>
レイマーチング<br>
・ray direction<br>
 レイの方向を定義(放射状に広がっていく)<br>

・origin position<br>
 レイが飛び立っていく原点<br>

## 第5回_1/20(土)
成果物発表会まとめ：
http://school.souhonzan.org/201710/presentation/
