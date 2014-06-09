
public class CodeStorage {
	public static final String begin = "varying vec3 enterPoint;\n " +
	"varying vec3 camPos;\n" +
	"\n" +
	"struct CSG_Object {\n" +
	"	bool hasIntercepted;\n" +
	"	float t_in;\n" +
	"	float t_out;\n" +
	"	vec3 normal_in;\n" +
	"	vec3 normal_out;\n" +
	"	vec3 color;\n" +
	"};\n" +
	"\n" +
	"CSG_Object hasNotIntercepted = CSG_Object(false, 0.0, 0.0, vec3(0.0), vec3(0.0), vec3(0.0));\n" +
	"\n" +
	"CSG_Object sphereIntersection(vec3 sphereCenter, float sphereRadius, vec3 color, vec3 rayDir){\n" +
	"\n" +
	"	float a = dot(rayDir, rayDir);\n" +
	"	float b = dot(rayDir, camPos - sphereCenter);\n" +
	"	float c = dot(camPos - sphereCenter, camPos - sphereCenter) - sphereRadius * sphereRadius;\n" +
	"\n" +
	"	float delta = b * b - a * c;\n" +
	"\n" +
	"	if(delta < 0.0)\n" +
	"		return hasNotIntercepted;\n" +
	"\n" +
	"	float t_in = (-b - sqrt(delta)) / a;\n" +
	"	float t_out = (-b + sqrt(delta)) / a;\n" +
	"\n" +
	"	vec3 interceptionPoint_in = camPos + (rayDir * t_in);\n" +
	"	vec3 normal_in = normalize(interceptionPoint_in - sphereCenter);\n" +
	"	normal_in = gl_NormalMatrix * normal_in;\n" +
	"\n" +
	"	vec3 interceptionPoint_out = camPos + (rayDir * t_out);\n" +
	"	vec3 normal_out = normalize(interceptionPoint_out - sphereCenter);\n" +
	"	normal_out = gl_NormalMatrix * normal_out;\n" +
	"\n" +
	"	return CSG_Object(true, t_in, t_out, normal_in, normal_out, color);\n" +
	"}\n" +
	"\n" +
	"CSG_Object difference(CSG_Object minuend, CSG_Object subtrahend){\n" +
	"\n" +
	"	if(!minuend.hasIntercepted)\n" +
	"		return hasNotIntercepted;\n" +
	"\n" +
	"	if(!subtrahend.hasIntercepted)\n" +
	"		return minuend;\n" +
	"\n" +
	"	//------*************----------\n" +
	"	//----*****************--------\n" +
	"	//-----------------------------\n" +
	"	if(subtrahend.t_in < minuend.t_in && subtrahend.t_out > minuend.t_out)\n" +
	"		return hasNotIntercepted;\n" +
	"\n" +
	"	//------***************---------\n" +
	"	//--********--------------------\n" +
	"	//----------***********---------\n" +
	"	if(subtrahend.t_in <= minuend.t_in && subtrahend.t_out <= minuend.t_out)\n" +
	"		return CSG_Object(true, subtrahend.t_out, minuend.t_out, -subtrahend.normal_out, minuend.normal_out, minuend.color);\n" +
	"\n" +
	"	//------*****************-----\n" +
	"	//-----------------********---\n" +
	"	//------***********-----------\n" +
	"	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out > minuend.t_out)\n" +
	"		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in, minuend.color);\n" +
	"\n" +
	"	//-----****************--------\n" +
	"	//----------******-------------\n" +
	"	//-----*****------*****--------\n" +
	"	if(subtrahend.t_in > minuend.t_in && subtrahend.t_out < minuend.t_out)\n" +
	"		return CSG_Object(true, minuend.t_in, subtrahend.t_in, minuend.normal_in, -subtrahend.normal_in, minuend.color);\n" +
	"\n" +
	"	return minuend;\n" +
	"}\n" +
	"\n" +
	"CSG_Object intersection(CSG_Object left, CSG_Object right){\n" +
	"\n" +		
	"	if(!left.hasIntercepted || !right.hasIntercepted)\n" +
	"		return hasNotIntercepted;\n" +
	"\n" +
	"	//----********************------------\n" +
	"	//----------********------------------\n" +
	"	//----------********------------------\n" +
	"	if(left.t_in < right.t_in && left.t_out > right.t_out)\n" +
	"		return right;\n" +
	"\n" +
	"	//--------------********-------------\n" +
	"	//----*********************----------\n" +
	"	//--------------********-------------\n" +
	"	if(left.t_in > right.t_in && left.t_out < right.t_out)\n" +
	"		return left;\n" +
	"\n" +
	"	//-------***************------------\n" +
	"	//----------------***********-------\n" +
	"	//----------------******------------\n" +
	"	if(left.t_in < right.t_in && left.t_out < right.t_out && left.t_out > right.t_in)\n" +
	"		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out, right.color);\n" +
	"\n" +
	"	//----------******************-----\n" +
	"	//----***********------------------\n" +
	"	//----------*****------------------\n" +
	"	if(left.t_in > right.t_in && left.t_out > right.t_out && left.t_in < right.t_out)\n" +
	"		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out, left.color);\n" +
	"\n" +
	"	return hasNotIntercepted;\n" +
	"}\n" +
	"\n" +
	"CSG_Object Union(CSG_Object left, CSG_Object right){\n" +
	"\n" +
	"	//-----------------------------\n" +
	"	//----------**************-----\n" +
	"	//----------**************-----\n" +
	"	if(!left.hasIntercepted)\n" +
	"		return right;\n" +
	"\n" +
	"	//----************-------------\n" +
	"	//-----------------------------\n" +
	"	//----************-------------\n" +
	"	if(!right.hasIntercepted)\n" +
	"		return left;\n" +
	"\n" +
	"	//----------********------------\n" +
	"	//------****************--------\n" +
	"	//------****************--------\n" +
	"	if(left.t_in > right.t_in && left.t_out < right.t_out)\n" +
	"		return right;\n" +
	"\n" +
	"	//--***************-------------\n" +
	"	//-------*****------------------\n" +
	"	//--***************-------------\n" +
	"	if(left.t_in <= right.t_in && left.t_out >= right.t_out)\n" +
	"		return left;\n" +
	"\n" +
	"	//----************--------------\n" +
	"	//----------*************-------\n" +
	"	//----*******************-------\n" +
	"	if(left.t_in < right.t_in && left.t_out < right.t_out)\n" +
	"		return CSG_Object(true, left.t_in, right.t_out, left.normal_in, right.normal_out, left.color);\n" +
	"\n" +
	"	//-------------**************--\n" +
	"	//------***********------------\n" +
	"	//------*********************--\n" +
	"	if(right.t_in < left.t_in && right.t_out < left.t_out)\n" +
	"		return CSG_Object(true, right.t_in, left.t_out, right.normal_in, left.normal_out, right.color);\n" +
	"\n" +
	"	//---********------------------\n" +
	"	//---------------******--------\n" +
	"	//---********------------------\n" +
	"	if(left.t_in < right.t_in)\n" +
	"		return left;\n" +
	"\n" +
	"	//------------------*******----\n" +
	"	//-----*********---------------\n" +
	"	//-----*********---------------\n" +
	"	return right;\n" +
	"}\n" +
	"\n" +
	"void main(){\n" +
	"\n" +
	"CSG_Object finalObject;" +
	"\n" +
	"vec3 camDir = normalize(enterPoint - camPos);";
	
	
	public static final String end = "\n" +
	"	if(!finalObject.hasIntercepted)\n" +
	"		discard;\n" +
	"\n" +
	"	// Light and Colors\n" +	
	"	float ambientContribution = 0.15;\n" +
	"	float difuseContribution = 0.35;\n" +
	"	float specularContribution = 0.4;\n" +
	"\n" +
	"	vec4 modelIntersectionPoint;\n" +
	"	modelIntersectionPoint.xyz = camPos + (finalObject.t_in * camDir);\n" +
	"	modelIntersectionPoint.w = 1.0;\n" +
	"	vec4 viewCamPos = gl_ModelViewMatrix * modelIntersectionPoint;\n" +
	"\n" +
	"	vec3 lightDir = normalize(gl_LightSource[0].position.xyz);\n" +
	"\n" +
	"	//Difuse light\n" +
	"	float difuseComponent = max(dot(lightDir, finalObject.normal_in), 0.0);\n" +	
	"\n" +
	"	//Specular light\n" +
	"	vec3 reflectedLight = reflect(normalize(lightDir), finalObject.normal_in);\n" +
	"\n" +
	"	float specularCos = max(dot(reflectedLight, normalize(viewCamPos.xyz)), 0.0);\n" +
	"	float specularComponent = pow(specularCos, 16.0);\n" +
 	"	vec3 specularColor = vec3(1.0, 1.0, 1.0);\n" +
	"\n" +
	"	vec3 color = ambientContribution * finalObject.color\n" +
	"			   + difuseContribution * difuseComponent * finalObject.color\n" +
	"			   + specularContribution * specularComponent * specularColor;\n" +
	"\n" +
	"	gl_FragColor.rgb  = color;\n" +
	"	gl_FragColor.a = 1.0;\n" +
"}";
}
