import java.util.Iterator;


public class Sphere implements Element {

	private static int spheres = 0;
	private String name;
	
	private String x = "",
				   y = "",
				   z = "";
	private String radius = "";
	private String r = "",
				   g = "",
				   b = "";
	
	public Sphere(Iterator<Character> iterator) throws Exception{
		
		char current;
		
		current = iterator.next();
		
		if(current != '(')
			throw new Exception("Invalid Input");
		
		while((current = iterator.next())!= ',')
			x += current;
		
		while((current = iterator.next())!= ',')
			y += current;
		
		while((current = iterator.next())!= ',')
			z += current;
		
		while((current = iterator.next())!= ',')
			radius += current;
		
		while((current = iterator.next())!= ',')
			r += current;
		
		while((current = iterator.next())!= ',')
			g += current;
		
		while((current = iterator.next())!= ')')
			b += current;
				
		name = "sphere" + spheres++;
	}
	
	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getCreationCode() {
		return "\tCSG_Object " + name + " = sphereIntersection(vec3(" + x + ", " + y + ", " + z + "), " + radius + ", vec3(" + r + ", " + g + ", " + b + "), camDir);\n";
	}

}
