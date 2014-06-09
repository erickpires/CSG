import java.util.Stack;


public class Union implements Element {

	private static int unions = 0;
	private Element right;
	private Element left;
	private String name;
	
	public Union(Stack<Element> elementStack) {
		right = elementStack.pop();
		left = elementStack.pop();
		
		name = "union" + unions++;
	}

	@Override
	public String getName() {
		return name;
	}

	@Override
	public String getCreationCode() {
		return "\tCSG_Object " + name + " = Union(" + left.getName() + ", " + right.getName() + ");\n";
	}
}
