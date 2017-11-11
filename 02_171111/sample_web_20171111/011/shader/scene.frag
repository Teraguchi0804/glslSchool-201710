precision mediump float;
uniform vec4      globalColor; // グローバルカラー
uniform sampler2D textureUnit; // テクスチャユニット
varying vec4      vColor;      // 頂点シェーダから送られてきた色
void main(){
    // テクスチャから色を読み出し利用する @@@
    // gl_PointCoord 点の短形の中のテクスチャ座標
    // テクスチャ座標の XY → ST
    vec4 samplerColor = texture2D(textureUnit, gl_PointCoord.st); //gl_PointCoord.st また gl_PointCoord.xy また gl_PointCoord.rgでも可
    gl_FragColor = vColor * samplerColor * globalColor;
}
