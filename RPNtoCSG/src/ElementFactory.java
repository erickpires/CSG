import java.util.Iterator;
import java.util.Stack;


public class ElementFactory {
	
	public static Element createNew(Iterator<Character> iterator, Stack<Element> elementStack) throws Exception{
		
		char current = iterator.next();
		
		switch (current) {
		case 'i':
			return new Intersection(elementStack);
			
		case 'u':
			return new Union(elementStack);
			
		case 'd':
			return new Difference(elementStack);
			
		case 'S':
			return new Sphere(iterator);
		case 'C':
			return new Cube(iterator);
		default:
			throw new Exception("Invalid Input");
		}
	}
}
