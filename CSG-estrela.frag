#define M_PI 3.1415926535897932384626433832795

varying vec3 enterPoint;
varying vec3 camPos;

uniform sampler2D sampler2d0;
uniform sampler2D sampler2d1;

struct CSG_Object {
	bool hasIntercepted;
	float t_in;
	float t_out;
	vec3 normal_in;
	vec3 normal_out;
	vec3 color;
};

CSG_Object hasNotIntercepted = CSG_Object(false, 0.0, 0.0, vec3(0.0), vec3(0.0), vec3(0.0));


CSG_Object sphereIntersection(vec3 sphereCenter, float sphereRadius, vec3 color, vec3 rayDir){
	vec2 textCoord;

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
	
	//http://en.wikibooks.org/wiki/GLSL_Programming/GLUT/Textured_Spheres
	textCoord.x = (atan(-normal_in.y, -normal_in.x)/M_PI + 1.0) * 0.5;
	textCoord.y = asin(-normal_in.z)/M_PI + 0.5;
	normal_in = normalize(texture2D(sampler2d1, textCoord).xyz);	
	//normal_in = gl_NormalMatrix * normal_in;

	vec3 interceptionPoint_out = camPos + (rayDir * t_out);
	vec3 normal_out = normalize(interceptionPoint_out - sphereCenter);
	normal_out = gl_NormalMatrix * normal_out;

	
	color = texture2D(sampler2d0, textCoord).rgb;
	
/*
	color.rg = textCoord;
	color.b = 0;*/

	return CSG_Object(true, t_in, t_out, normal_in, normal_out, color);
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
	if(subtrahend.t_in <= minuend.t_in && subtrahend.t_out <= minuend.t_out)
		return CSG_Object(true, subtrahend.t_out, minuend.t_out, -subtrahend.normal_out, minuend.normal_out, minuend.color);

	//------*****************-----
	//-----------------********---
	//------***********-----------
	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out > minuend.t_out)
		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in, minuend.color);

	//-----****************--------
	//----------******-------------
	//-----*****------*****--------
	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out < minuend.t_out)
		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in, minuend.color);//this is incomplete and should be solved using CSG_Objects' arrays

	return minuend;
}

void main(){
	vec3 blue = vec3(0.0, 0.0, 1.0);
	vec3 green = vec3(0.0, 1.0, 0.0);
	vec3 red = vec3(1.0, 0.0, 0.0);
	vec3 magenta = vec3(1.0, 0.0, 1.0);
	vec3 yellow = vec3(1.0, 1.0, 0.0);
	vec3 cyan = vec3(0.0, 1.0, 1.0);

	vec3 camDir = normalize(enterPoint - camPos);

	CSG_Object sphere1 = sphereIntersection(vec3(0.0, 0.0, 0.0), 1.0, blue, camDir);
	CSG_Object sphere2 = sphereIntersection(vec3(0.75, 0.75, 0.57), 0.4, green, camDir);
	


	CSG_Object difference1 = difference(sphere1, sphere2);
	
	

	CSG_Object finalObject = difference1;


	if(!finalObject.hasIntercepted)
		discard;

	
	float ambientContribution = 0.15;
	float difuseContribution = 0.35;
	float specularContribution = 0.4;


	vec4 modelIntersectionPoint;
	modelIntersectionPoint.xyz = camPos + (finalObject.t_in * camDir);
	modelIntersectionPoint.w = 1.0;
	vec4 viewCamPos = gl_ModelViewMatrix * modelIntersectionPoint;

	vec3 lightDir = normalize(gl_LightSource[0].position.xyz);
	
	//Difuse light
	float difuseComponent = max(dot(lightDir, finalObject.normal_in), 0.0);	

	//Specular light
	vec3 reflectedLight = reflect(normalize(lightDir), finalObject.normal_in);

	float specularCos = max(dot(reflectedLight, normalize(viewCamPos.xyz)), 0.0);
	float specularComponent = pow(specularCos, 16.0);
 	vec3 specularColor = vec3(1.0, 1.0, 1.0);
	

	vec3 color = ambientContribution * finalObject.color
							 + difuseContribution * difuseComponent * finalObject.color
							 + specularContribution * specularComponent * specularColor;

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}