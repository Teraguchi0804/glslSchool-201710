/* ----------------------------------------------------------------------------
 * noise shader
 * ---------------------------------------------------------------------------- */
precision mediump float;

uniform vec2 resolution;
const int   oct  = 8;
const float per  = 0.5;
const float PI   = 3.1415926;
const float cCorners = 1.0 / 16.0;
const float cSides   = 1.0 / 8.0;
const float cCenter  = 1.0 / 4.0;
float interpolate(float a, float b, float x){
    float f = (1.0 - cos(x * PI)) * 0.5;
    return a * (1.0 - f) + b * f;
}
float rnd(vec2 p){
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453);
}
float irnd(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec4 v = vec4(rnd(vec2(i.x,       i.y      )),
                  rnd(vec2(i.x + 1.0, i.y      )),
                  rnd(vec2(i.x,       i.y + 1.0)),
                  rnd(vec2(i.x + 1.0, i.y + 1.0)));
    return interpolate(interpolate(v.x, v.y, f.x), interpolate(v.z, v.w, f.x), f.y);
}
float noise(vec2 p){
    float t = 0.0;
    for(int i = 0; i < oct; i++){
        float freq = pow(2.0, float(i));
        float amp  = pow(per, float(oct - i));
        t += irnd(vec2(p.x / freq, p.y / freq)) * amp;
    }
    return t;
}
float snoise(vec2 p, vec2 q, vec2 r){
    return noise(vec2(p.x,       p.y      )) *        q.x  *        q.y  +
           noise(vec2(p.x,       p.y + r.y)) *        q.x  * (1.0 - q.y) +
           noise(vec2(p.x + r.x, p.y      )) * (1.0 - q.x) *        q.y  +
           noise(vec2(p.x + r.x, p.y + r.y)) * (1.0 - q.x) * (1.0 - q.y);
}
void main(void){
    float x = rnd(vec2(resolution.x, 0.0));
    float y = rnd(vec2(0.0, resolution.y));
    float z = rnd(resolution);
    vec2 R = gl_FragCoord.xy;
    vec2 G = gl_FragCoord.xy + resolution * x;
    vec2 B = gl_FragCoord.xy + resolution * y;
    vec2 A = gl_FragCoord.xy + resolution * z;
    float r = snoise(R, R / resolution, resolution);
    float g = snoise(G, G / resolution, resolution);
    float b = snoise(B, B / resolution, resolution);
    float a = snoise(A, A / resolution, resolution);
    gl_FragColor = vec4(r, g, b, a);
}
