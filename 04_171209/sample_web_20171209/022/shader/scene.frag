precision mediump float;
uniform sampler2D texture;   // テクスチャ
varying vec2      vTexCoord; // テクスチャ座標

void main(){
    gl_FragColor = texture2D(texture, vTexCoord);
}
