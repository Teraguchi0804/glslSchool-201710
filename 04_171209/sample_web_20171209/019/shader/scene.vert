attribute vec3  position;  // 頂点座標
attribute vec2  texCoord;  // 頂点のテクスチャ座標
varying   vec2  vTexCoord; // フラグメントシェーダへ送るテクスチャ座標

void main(){
    vTexCoord = texCoord;
    gl_Position = vec4(position, 1.0);
}
