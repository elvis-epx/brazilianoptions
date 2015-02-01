#ifdef GL_ES
precision highp float;
#endif

varying vec4 vColor;
uniform sampler2D uSampler;

void main(void)
{
    gl_FragColor = vColor;
}
