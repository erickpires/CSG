import java.util.Stack;


public class Intersection implements Element {

	private static int intersections = 0;
	private Element right;
	private Element left;
	private String name;
	
	public Intersection(Stack<Element> elementStack) {
		right = elementStack.pop();
		left = elementStack.pop();
		
		name = "intersection" + intersections++;
	}
	
	@Override
	public String getCreationCode(){
		return "\tCSG_Object " + name + " = intersection(" + left.getName() + ", " + right.getName() + ");\n";
	}
	
	@Override
	public String getName(){
		return name;
	}
}
