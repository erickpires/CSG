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

CSG_Object cubeIntersection(vec3 center, float faceSize, vec3 originPoint, vec3 rayDir){

	vec3 p0 = vec3(center.x + faceSize/2.0, center.y + faceSize/2.0, center.z + faceSize/2.0);
	vec3 p1 = vec3(center.x + faceSize/2.0, center.y + faceSize/2.0, center.z - faceSize/2.0);
	vec3 p2 = vec3(center.x + faceSize/2.0, center.y - faceSize/2.0, center.z + faceSize/2.0);
	vec3 p3 = vec3(center.x + faceSize/2.0, center.y - faceSize/2.0, center.z - faceSize/2.0);
	vec3 p4 = vec3(center.x - faceSize/2.0, center.y + faceSize/2.0, center.z + faceSize/2.0);
	vec3 p5 = vec3(center.x - faceSize/2.0, center.y + faceSize/2.0, center.z - faceSize/2.0);
	vec3 p6 = vec3(center.x - faceSize/2.0, center.y - faceSize/2.0, center.z + faceSize/2.0);
	vec3 p7 = vec3(center.x - faceSize/2.0, center.y - faceSize/2.0, center.z - faceSize/2.0);

	/*float a = dot(rayDir, rayDir);
	float b = dot(rayDir, camPos - center);
	float c = dot(camPos - center, camPos - center) - (faceSize/2.0) * (faceSize/2.0);

	float delta = b * b - a * c;

	if(delta < 0.0)
		return hasNotIntercepted;

	float t_in = (-b - sqrt(delta)) / a;
	float t_out = (-b + sqrt(delta)) / a;*/

	float t_in = 0.5;
	float t_out = 0.5;

	vec3 interceptionPoint_in = vec3(0.0,0.0,0.0);
	vec3 interceptionPoint_out = vec3(0.0,0.0,0.0);
	vec3 normal_in = vec3(0.0,0.0,0.0);
	vec3 normal_out = vec3(0.0,0.0,0.0);


	//faces:
	//0 1 3 2 X 1 direito
	//4 5 1 0 Y 1 frente
	//6 4 5 7 X 2 esquerdo
	//2 6 7 3 Y 2 tras
	//6 4 0 2 Z 1 cima
	//5 7 3 1 Z 2 baixo

	float multX1, multX2, multY1, multY2, multZ1, multZ2;

	if (rayDir.x != 0.0) multX1 = p0.x/rayDir.x;
	else multX1 = 0.0;
	if (rayDir.x != 0.0) multX2 = p4.x/rayDir.x;
	else multX2 = 0.0;
	if (rayDir.y != 0.0) multY1 = p0.y/rayDir.y;
	else multY1 = 0.0;
	if (rayDir.y != 0.0) multY2 = p6.y/rayDir.y;
	else multY2 = 0.0;
	if (rayDir.z != 0.0) multZ1 = p0.z/rayDir.z;
	else multZ1 = 0.0;
	if (rayDir.z != 0.0) multZ2 = p1.z/rayDir.z;
	else multZ2 = 0.0;
	
	if(rayDir.y * multX1 > p5.y && rayDir.y * multX1 < p7.y && rayDir.z * multX1 > p7.z && rayDir.z * multX1 < p6.z) //Se passa pela face 0 1 3 2 X 1 direito
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(p0.x, rayDir.y*multX1, rayDir.z*multX1);
			normal_in = normalize(vec3(faceSize/2.0, 0.0, 0.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}
		else
		{
			interceptionPoint_out = vec3(p0.x, rayDir.y*multX1, rayDir.z*multX1);
			normal_out = normalize(vec3(faceSize/2.0, 0.0, 0.0));
			normal_out = gl_NormalMatrix * normal_out;	
		}
	}
	if(rayDir.y * multX2 > p5.y && rayDir.y * multX2 < p7.y && rayDir.z * multX2 > p7.z && rayDir.z * multX2 < p6.z) //Se passa pela face 6 4 5 7 X 2 esquerdo
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(p0.x, rayDir.y*multX2, rayDir.z*multX2);
			normal_in = normalize(vec3(-faceSize/2.0, 0.0, 0.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}

		else
		{
			interceptionPoint_out = vec3(p0.x, rayDir.y*multX2, rayDir.z*multX2);
			normal_out = normalize(vec3(-faceSize/2.0, 0.0, 0.0));
			normal_out = gl_NormalMatrix * normal_out;	
		}

	}
	if(rayDir.x * multY1 < p3.x && rayDir.x * multY1 > p7.x && rayDir.z * multY1 > p7.z && rayDir.z * multY1 < p6.z) //Se passa pela face 4 5 1 0 Y 1 frente
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(rayDir.x*multY1, p0.y, rayDir.z*multY1);
			normal_in = normalize(vec3(0.0, faceSize/2.0, 0.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}
		else
		{
			interceptionPoint_out = vec3(rayDir.x*multY1, p0.y, rayDir.z*multY1);
			normal_out = normalize(vec3(0.0, faceSize/2.0, 0.0));
			normal_out = gl_NormalMatrix * normal_out;	
		}
	}
	if(rayDir.x * multY2 < p3.x && rayDir.x * multY2 > p7.x && rayDir.z * multY2 > p7.z && rayDir.z * multY2 < p6.z) //Se passa pela face 2 6 7 3 Y 2 tras
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(rayDir.x*multY1, p0.y, rayDir.z*multY1);
			normal_in = normalize(vec3(0.0, -faceSize/2.0, 0.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}
		else
		{
			interceptionPoint_out = vec3(rayDir.x*multY1, p0.y, rayDir.z*multY1);
			normal_out = normalize(vec3(0.0, -faceSize/2.0, 0.0));
			normal_out = gl_NormalMatrix * normal_out;	
		}
	}
	if(rayDir.x * multZ1 > p7.x && rayDir.x * multZ1 < p3.x && rayDir.y * multZ1 > p7.y && rayDir.y * multZ1 < p5.y) //Se passa pela face 6 4 0 2 Z 1 cima
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(rayDir.x*multZ1, rayDir.y*multZ1, p0.z);
			normal_in = normalize(vec3(0.0, 0.0, faceSize/2.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}
		else
		{
			interceptionPoint_out = vec3(rayDir.x*multZ1, rayDir.y*multZ1, p0.z);
			normal_out = normalize(vec3(0.0, 0.0, faceSize/2.0));
			normal_out = gl_NormalMatrix * normal_out;
		}
	}
	if(rayDir.x * multZ2 > p7.x && rayDir.x * multZ2 < p3.x && rayDir.y * multZ2 > p7.y && rayDir.y * multZ2 < p5.y) //Se passa pela face 6 4 0 2 Z 1 cima
	{
		if(interceptionPoint_in == vec3(0.0,0.0,0.0))
		{
			interceptionPoint_in = vec3(rayDir.x*multZ2, rayDir.y*multZ2, p0.z);
			normal_in = normalize(vec3(0.0, 0.0, -faceSize/2.0));
			normal_in = gl_NormalMatrix * normal_in;	
		}
		else
		{
			interceptionPoint_out = vec3(rayDir.x*multZ2, rayDir.y*multZ2, p0.z);
			normal_out = normalize(vec3(0.0, 0.0, -faceSize/2.0));
			normal_out = gl_NormalMatrix * normal_out;	
		}
	}

	if (interceptionPoint_in != vec3(0.0,0.0,0.0) && interceptionPoint_out == vec3(0.0,0.0,0.0)) //Passa so por 1 ponto
	{
		interceptionPoint_out = interceptionPoint_in;
		normal_out = normal_in;
	}
	else if (interceptionPoint_in == vec3(0.0,0.0,0.0) && interceptionPoint_out == vec3(0.0,0.0,0.0)) return hasNotIntercepted;
	
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

	//CSG_Object finalObject = union4;
	CSG_Object finalObject = cubeIntersection(vec3(0.1, 0.2, 0.1), 1.0, vec3(0.0,0.0,0.0), camDir);

	if(!finalObject.hasIntercepted)
		discard;


	float ambientContribution = 0.1;
	float difuseContribution = 0.6;
	float specularContribution = 0.7;


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



	vec3 color = ambientContribution * vec3(1.0, 0.0, 0.0)
							 + difuseContribution * difuseComponent * vec3(1.0, 0.0, 0.0)
							 + specularContribution * specularComponent * specularColor;

	gl_FragColor.rgb  = color;
	gl_FragColor.a = 1.0;
}
