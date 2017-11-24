precision mediump float;
varying vec4 vColor;

void main(){
    gl_FragColor = vColor;
    if(gl_FrontFacing) {
        gl_FragColor = vec4(1.0);
    }
}
