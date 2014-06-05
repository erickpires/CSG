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
	if(subtrahend.t_in <= minuend.t_in && subtrahend.t_out <= minuend.t_out)
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
		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out);

	//----------******************-----
	//----***********------------------
	//----------*****------------------
	if(left.t_in > right.t_in && left.t_out > right.t_out && left.t_in < right.t_out)
		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out);

	return hasNotIntercepted;
}

CSG_Object Union(CSG_Object left, CSG_Object right){

	if(!left.hasIntercepted)
		return right;

	if(!right.hasIntercepted)
		return left;

	if(left.t_in > right.t_in && left.t_out < right.t_out)
		return right;

	if(left.t_in <= right.t_in && left.t_out >= right.t_out)
		return left;

	if(left.t_in < right.t_in && left.t_out < right.t_out)
		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out);

	if(right.t_in < left.t_in && right.t_out < left.t_out)
		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out);

	if(left.t_in < right.t_in)
		return left;

	return right;
}

void main(){
	vec3 camDir = normalize(enterPoint - camPos);

	CSG_Object sphere1 = sphereIntersection(vec3(0.0, 0.0, 0.0), 1.0, camDir);
	CSG_Object sphere2 = sphereIntersection(vec3(0.75, 0.75, 0.75), 0.55, camDir);
	CSG_Object sphere3 = sphereIntersection(vec3(-0.25, -0.25, 0.0), 0.55, camDir);
	CSG_Object sphere4 = sphereIntersection(vec3(0.0, 0.0, 0.0), 0.5, camDir);
	CSG_Object sphere5 = sphereIntersection(vec3(-0.5, 0.0, 0.0), 0.5, camDir);
	CSG_Object sphere6 = sphereIntersection(vec3(0.5, 0.0, 0.0), 0.5, camDir);
	CSG_Object sphere7 = sphereIntersection(vec3(0.0, 0.0, 0.5), 0.5, camDir);
	CSG_Object sphere8 = sphereIntersection(vec3(0.0, 0.0, -0.5), 0.5, camDir);
	CSG_Object sphere9 = sphereIntersection(vec3(-0.5, 0.0, 0.0), 0.7, camDir);
	CSG_Object sphere10 = sphereIntersection(vec3(0.5, 0.0, 0.0), 0.7, camDir);


	CSG_Object difference1 = difference(sphere1, sphere2);
	
	CSG_Object difference2 = difference(difference1, sphere3);

	

	CSG_Object intersection1 = intersection(sphere10, sphere9);

	CSG_Object union1 = Union(sphere6, sphere5);
	CSG_Object union2 = Union(union1, sphere7);
	CSG_Object union3 = Union(union2, sphere8);

	CSG_Object difference3 = difference(union3, sphere4);

	CSG_Object union4 = Union(difference3, intersection1);

	CSG_Object finalObject = union4;


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
	
	

	vec3 color = ambientContribution * vec3(1.0, 0.0, 0.0)
							 + difuseContribution * difuseComponent * vec3(1.0, 0.0, 0.0)
							 + specularContribution * specularComponent * specularColor;

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}