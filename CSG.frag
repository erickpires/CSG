varying vec3 enterPoint;
varying vec3 camPos;

struct CSG_Object {
	bool hasIntercepted;
	float t_in;
	float t_out;
	vec3 normal_in;
	vec3 normal_out;
};

CSG_Object hasNotIntercepted = CSG_Object(false, 0.0, 0.0, vec3(0.0), vec3(0.0));


CSG_Object sphereIntersection(vec3 sphereCenter, float sphereRadius, vec3 rayDir){

	float a = dot(rayDir, rayDir);
	float b = dot(rayDir, camPos - sphereCenter);
	float c = dot(camPos - sphereCenter, camPos - sphereCenter) - sphereRadius * sphereRadius;

	float delta = b * b - a * c;

	if(delta < 0.0)
		return hasNotIntercepted;

	float t_in = (-b - sqrt(delta)) / a;
	float t_out = (-b + sqrt(delta)) / a;

	vec3 interceptionPoint_in = camPos + (rayDir * t_in);
	vec3 normal_in = normalize(interceptionPoint_in - sphereCenter);

	vec3 interceptionPoint_out = camPos + (rayDir * t_out);
	vec3 normal_out = normalize(interceptionPoint_out - sphereCenter);

	return CSG_Object(true, t_in, t_out, normal_in, normal_out);
}

void main(){
	vec3 camDir = normalize(enterPoint - camPos);

	CSG_Object sphere1 = sphereIntersection(vec3(0.0, 0.0, 0.0), 0.5, camDir);

	if(!sphere1.hasIntercepted)
		discard;

	
	vec3 lightDir = normalize(gl_LightSource[0].position.xyz);

	float difuseComponent = max(dot(lightDir, sphere1.normal_in), 0.0);

	vec3 color = 0.2 * vec3(1.0, 0.0, 0.0) + 0.8 * difuseComponent * vec3(1.0, 0.0, 0.0);

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}