precision mediump float;
uniform vec2      mouse;         // マウスカーソルの正規化済み座標
uniform sampler2D colorTexture;  // カラーテクスチャ
uniform sampler2D heightTexture; // ハイトテクスチャ
varying vec2      vTexCoord;     // 頂点シェーダから送られてくるテクスチャ座標
const   float     focus = 0.5;   // フォーカスする深度

void main(){
    // ハイトテクスチャから色を取得し深度として扱う @@@
    // heightTextureの色の値は0.0~1.0
    // focusを引くことでプラスとマイナスに値を振り分けている
    float height = texture2D(heightTexture, vTexCoord).r - focus;

    // マウスベクトルに応じて変化するベクトルを定義 @@@
    vec2 mouseVec = -mouse * 0.025 * height;

    // マウスベクトルの影響を与えてテクスチャを参照する @@@
    gl_FragColor = texture2D(colorTexture, vTexCoord + mouseVec);
}
