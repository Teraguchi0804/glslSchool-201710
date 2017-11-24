precision mediump float;
uniform sampler2D texture;    // フレームバッファに描画したレンダリング結果
uniform float     time;       // 時間の経過
uniform vec2      resolution; // スクリーン解像度 @@@
varying vec2      vTexCoord;  // テクスチャ座標

float map(vec3 p) {
    p.x += cos(time + 3.0 * sin(time + p.z)) * 0.5;
    p.y += sin(time +3.0 * cos(time + p.z)) * 0.74;
    
    float t = length(mod(p.xy, 2.0) - 1.0) - 0.1;
    t = min(t, length(mod(p, 2.0) - 1.0) - 0.3);
    
    return t;
}

vec2 rotate(vec2 p, float a) {
    return vec2(
        p.x * cos(a) - p.y * sin(a),
        p.x * sin(a) + p.y * cos(a));
}

void main() {
    vec2 duv = vTexCoord * 2.0 - 1.0;
    vec3 dir = normalize(vec3(duv, 1.0));
    float angle = time * 0.3;
    dir.xy = rotate(dir.xy, angle);
    //dir.zy = rotate(dir.zy, angle);
    vec3 pos = vec3(0, time, 0);
    float t = 0.0;
    for(int i = 0 ; i < 256; i++) {
        t += map(dir * t + pos) * 0.2;
    }
    vec3 ip = dir * t + pos;
    
    gl_FragColor = vec4(map(ip + 0.2));
    gl_FragColor.xyz *= dir;
    gl_FragColor.xyz += vec3(3,2,1) * t * 0.03;
    gl_FragColor.xyz = clamp(1.0 - gl_FragColor.xyz, vec3(0.0), vec3(1.0));
    gl_FragColor.a = 1.0;
}

