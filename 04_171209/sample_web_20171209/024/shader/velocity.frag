/* ----------------------------------------------------------------------------
 * velocity update shader
 * ---------------------------------------------------------------------------- */
precision mediump float;
uniform sampler2D prevTexture;
uniform sampler2D positionTexture;
uniform sampler2D noiseTexture;
uniform vec2      resolution;
uniform float     time;
uniform bool      move;
uniform vec2      mouse;
void main(){
    vec2 coord = gl_FragCoord.st / resolution;
    vec4 prevVelocity = texture2D(prevTexture, coord);
    vec4 position = texture2D(positionTexture, coord);
    vec4 noiseValue = texture2D(noiseTexture, coord + vec2(time * 0.1));
    vec3 noise = (noiseValue.xyz * 2.0 - 1.0) * 0.25;
    vec3 velocity = prevVelocity.xyz;
    if(move){
        float c = cos(time * 0.25) * 0.25;
        vec3 p = normalize(vec3(mouse * 2.0, c) - position.xyz);
        velocity += p * 0.2 + noise;
    }
    gl_FragColor = vec4(normalize(velocity), 0.0);
}
