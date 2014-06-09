import java.util.Iterator;

public class Cube implements Element {

	private static int cubes = 0;
	private String name;
	
	private String x = "",
				   y = "",
				   z = "";
	private String side = "";
	private String r = "",
				   g = "",
				   b = "";
	
	public Cube(Iterator<Character> iterator) throws Exception{
		
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
			side += current;
		
		while((current = iterator.next())!= ',')
			r += current;
		
		while((current = iterator.next())!= ',')
			g += current;
		
		while((current = iterator.next())!= ')')
			b += current;
				
		name = "cube" + cubes++;
	}
	
	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getCreationCode() {
		return "\tCSG_Object " + name + " = cubeIntersection(vec3(" + x + ", " + y + ", " + z + "), " + side + ", vec3(" + r + ", " + g + ", " + b + "), camPos, camDir);\n";
	}

}
