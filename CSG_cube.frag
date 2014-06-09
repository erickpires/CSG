#define PI 3.1415926535897932384626433832795

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

vec3 findNormal(vec3 p1, vec3 p2, vec3 p3, vec3 rayDir)
{
	vec3 edge1 = normalize(p3-p2);
	vec3 edge2 = normalize(p1-p2);
	
	return cross(edge1, edge2);
}

float parallel(vec3 p1, vec3 p2, vec3 p3, vec3 rayDir)
{
	vec3 product = findNormal(p1, p2, p3, rayDir);

	float angle = acos(dot(normalize(product),normalize(rayDir)));
	if(angle == PI/2.0) return 1.0;
	else return 0.0;
}

CSG_Object cubeIntersection(vec3 center, float faceSize, vec3 color, vec3 oriPoi, vec3 rayDir)
{
	vec3 p0 = vec3(center.x + faceSize/2.0, center.y + faceSize/2.0, center.z + faceSize/2.0);
	vec3 p1 = vec3(center.x + faceSize/2.0, center.y + faceSize/2.0, center.z - faceSize/2.0);
	vec3 p2 = vec3(center.x + faceSize/2.0, center.y - faceSize/2.0, center.z + faceSize/2.0);
	vec3 p3 = vec3(center.x + faceSize/2.0, center.y - faceSize/2.0, center.z - faceSize/2.0);
	vec3 p4 = vec3(center.x - faceSize/2.0, center.y + faceSize/2.0, center.z + faceSize/2.0);
	vec3 p5 = vec3(center.x - faceSize/2.0, center.y + faceSize/2.0, center.z - faceSize/2.0);
	vec3 p6 = vec3(center.x - faceSize/2.0, center.y - faceSize/2.0, center.z + faceSize/2.0);
	vec3 p7 = vec3(center.x - faceSize/2.0, center.y - faceSize/2.0, center.z - faceSize/2.0);

	float t_near = 0.0, t_far = 0.0, tx1, tx2, ty1, ty2, tz1, tz2;
	vec3 normal_in, normal_out;

	if(parallel(p0,p1,p2,rayDir) == 0.0)
	{
		tx1 = (p4.x - oriPoi.x)/rayDir.x;
		tx2 = (p0.x - oriPoi.x)/rayDir.x;

		if(tx1 > tx2)
		{
			float temp = tx1;
			tx1 = tx2;
			tx2 = temp;
		}
		t_near = tx1;
		t_far = tx2;
		normal_in = findNormal(p0,p1,p2,rayDir);
		normal_out = findNormal(p4,p5,p6,rayDir);
	}
	if(parallel(p0,p1,p4,rayDir) == 0.0)
	{
		ty1 = (p7.y - oriPoi.y)/rayDir.y;
		ty2 = (p5.y - oriPoi.y)/rayDir.y;

		if(ty1 > ty2)
		{
			float temp = ty1;
			ty1 = ty2;
			ty2 = temp;
		}
			
		if(ty1 > t_near)
		{
			t_near = ty1;
			normal_in = findNormal(p0,p1,p4,rayDir);
		}
		if(ty2 < t_far)
		{
			t_far = ty2;
			normal_out = findNormal(p2,p3,p6,rayDir);
		}
	}
	if(parallel(p0,p2,p4,rayDir) == 0.0)
	{
		tz1 = (p7.z - oriPoi.z)/rayDir.z;
		tz2 = (p6.z - oriPoi.z)/rayDir.z;

		if(tz1 > tz2)
		{
			float temp = tz1;
			tz1 = tz2;
			tz2 = temp;
		}
			
		if(tz1 > t_near)
		{
			t_near = tz1;
			normal_in = findNormal(p0,p2,p4,rayDir);
		}
		if(tz2 < t_far)
		{
			t_far = tz2;
			normal_out = findNormal(p5,p3,p1,rayDir);
		}
	}
	if(t_near > t_far) return hasNotIntercepted;

	normal_out = -normal_out;
	if(dot(normalize(rayDir), normalize(normal_in)) > 0.0){ 
		normal_in = -normal_in;
}

	normal_in = gl_NormalMatrix * normal_in;	
	normal_out = gl_NormalMatrix * normal_out;

	return CSG_Object(true, t_near, t_far, normal_in, normal_out, color);
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
	vec3 camDir = normalize(enterPoint - camPos);

	CSG_Object cube1 = cubeIntersection(vec3(-0.25, 0.0, 0.0), 0.5, vec3(0.0, 0.0, 1.0), camPos, camDir);
	CSG_Object cube2 = cubeIntersection(vec3(0.0, 0.5, 0.0), 0.5, vec3(0.0, 1.0, 0.0), camPos, camDir);
	CSG_Object cube3 = cubeIntersection(vec3(0.25, 0.0, 0.0), 0.5, vec3(1.0, 0.0, 0.0), camPos, camDir);
	CSG_Object cube4 = cubeIntersection(vec3(0.0, 0.0, 0.0), 0.5, vec3(1.0, 0.0, 0.0), camPos, camDir);
	CSG_Object sphere1 =  sphereIntersection(vec3(0.0, -0.4, 0.0), 0.5, vec3(1.0, 0.0, 0.0), camDir);

	CSG_Object union1 = Union(cube1, cube2);
	CSG_Object union2 = Union(union1, cube3);
	
CSG_Object finalObject = union2;// difference(sphere1, union2);

	if(!finalObject.hasIntercepted)
		discard;


	float ambientContribution = 0.1;
	float difuseContribution = 0.6;
	float specularContribution = 0.3;


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
	float specularComponent = pow(specularCos, 5.0);
 	vec3 specularColor = vec3(1.0, 1.0, 1.0);



	vec3 color = ambientContribution * finalObject.color
							 + difuseContribution * difuseComponent * finalObject.color
							 + specularContribution * specularComponent * specularColor;

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}
