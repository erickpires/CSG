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
	normal_in = gl_NormalMatrix * normal_in;	

	vec3 interceptionPoint_out = camPos + (rayDir * t_out);
	vec3 normal_out = normalize(interceptionPoint_out - sphereCenter);
	normal_out = gl_NormalMatrix * normal_out;

	return CSG_Object(true, t_in, t_out, normal_in, normal_out);
}

CSG_Object difference(CSG_Object minuend, CSG_Object subtrahend){

	if(!minuend.hasIntercepted)
		return hasNotIntercepted;

	if(!subtrahend.hasIntercepted)
		return minuend;

//------*************----------
//----*****************--------
//-----------------------------
	if(subtrahend.t_in < minuend.t_in && subtrahend.t_out > minuend.t_out)
		return hasNotIntercepted;

//------***************---------
//--********--------------------
//----------***********---------
	if(subtrahend.t_in < minuend.t_in && subtrahend.t_out < minuend.t_out)
		return CSG_Object(true, subtrahend.t_out, minuend.t_out, -subtrahend.normal_out, minuend.normal_out);

//------*****************-----
//-----------------********---
//------***********-----------
	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out > minuend.t_out)
		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in);

//-----****************--------
//----------******-------------
//-----*****------*****--------
	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out < minuend.t_out)
		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in);//this is incomplete and should be solved using CSG_Objects' arrays

	return minuend;
}

void main(){
	vec3 camDir = normalize(enterPoint - camPos);

	CSG_Object sphere1 = sphereIntersection(vec3(0.0, 0.0, 0.0), 0.7, camDir);
	CSG_Object sphere2 = sphereIntersection(vec3(0.75, 0.75, 0.75), 0.85, camDir);
	CSG_Object sphere3 = sphereIntersection(vec3(-0.25, -0.25, 0.0), 0.55, camDir);

	CSG_Object difference1 = difference(sphere1, sphere2);
	
	CSG_Object difference2 = difference(difference1, sphere3);

	CSG_Object finalObject = difference2;

	if(!finalObject.hasIntercepted)
		discard;

	
	vec3 lightDir = normalize(gl_LightSource[0].position.xyz);

	float difuseComponent = max(dot(lightDir, finalObject.normal_in), 0.0);

	vec3 color = 0.2 * vec3(1.0, 0.0, 0.0) + 0.8 * difuseComponent * vec3(1.0, 0.0, 0.0);

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}