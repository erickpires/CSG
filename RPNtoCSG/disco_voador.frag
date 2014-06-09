varying vec3 enterPoint;
 varying vec3 camPos;

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
		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in, minuend.color);

	return minuend;
}

CSG_Object intersection(CSG_Object left, CSG_Object right){

	if(!left.hasIntercepted || !right.hasIntercepted)
		return hasNotIntercepted;

	//----********************------------
	//----------********------------------
	//----------********------------------
	if(left.t_in < right.t_in && left.t_out > right.t_out)
		return right;

	//--------------********-------------
	//----*********************----------
	//--------------********-------------
	if(left.t_in > right.t_in && left.t_out < right.t_out)
		return left;

	//-------***************------------
	//----------------***********-------
	//----------------******------------
	if(left.t_in < right.t_in && left.t_out < right.t_out && left.t_out > right.t_in)
		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out, right.color);

	//----------******************-----
	//----***********------------------
	//----------*****------------------
	if(left.t_in > right.t_in && left.t_out > right.t_out && left.t_in < right.t_out)
		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out, left.color);

	return hasNotIntercepted;
}

CSG_Object Union(CSG_Object left, CSG_Object right){

	//-----------------------------
	//----------**************-----
	//----------**************-----
	if(!left.hasIntercepted)
		return right;

	//----************-------------
	//-----------------------------
	//----************-------------
	if(!right.hasIntercepted)
		return left;

	//----------********------------
	//------****************--------
	//------****************--------
	if(left.t_in > right.t_in && left.t_out < right.t_out)
		return right;

	//--***************-------------
	//-------*****------------------
	//--***************-------------
	if(left.t_in <= right.t_in && left.t_out >= right.t_out)
		return left;

	//----************--------------
	//----------*************-------
	//----*******************-------
	if(left.t_in < right.t_in && left.t_out < right.t_out)
		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out, left.color);

	//-------------**************--
	//------***********------------
	//------*********************--
	if(right.t_in < left.t_in && right.t_out < left.t_out)
		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out, right.color);

	//---********------------------
	//---------------******--------
	//---********------------------
	if(left.t_in < right.t_in)
		return left;

	//------------------*******----
	//-----*********---------------
	//-----*********---------------
	return right;
}

void main(){

CSG_Object finalObject;
vec3 camDir = normalize(enterPoint - camPos);	CSG_Object sphere0 = sphereIntersection(vec3(0.0, 0.0, 0.0), 1, vec3(0.0, 1.0, 0.0), camDir);

	CSG_Object sphere1 = sphereIntersection(vec3(0.75, 0.75, 0.75), 0.55, vec3(1.0, 1.0, 1.0), camDir);

	CSG_Object intersection0 = intersection(sphere0, sphere1);

	finalObject = intersection0;
	if(!finalObject.hasIntercepted)
		discard;

	// Light and Colors
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