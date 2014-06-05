varying vec3 enterPoint;
varying vec3 camPos;

void main ()
{

  enterPoint.xyz =gl_Vertex.xyz;

	camPos = ((gl_ModelViewMatrixInverse * vec4(0.0,0.0,0.0,1.0))).xyz;


	vec4 vertice;
  vertice.xyz = enterPoint;

	gl_Position = ftransform();
}
