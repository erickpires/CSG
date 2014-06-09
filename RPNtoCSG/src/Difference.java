import java.util.Stack;


public class Difference implements Element {

	private static int differences = 0;
	private Element right;
	private Element left;
	private String name;
	
	public Difference(Stack<Element> elementStack) {
		right = elementStack.pop();
		left = elementStack.pop();
		
		name = "difference" + differences++;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getCreationCode() {
		return "\tCSG_Object " + name + " = difference(" + left.getName() + ", " + right.getName() + ");\n";
	}
}
