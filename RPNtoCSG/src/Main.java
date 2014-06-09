import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Stack;

public class Main {
	private static File input;
	private static File output;
	
	public static void main(String[] args) {
		
		handleParams(args);
		
		try {
			BufferedReader bufferedReader = new BufferedReader(new FileReader(input));
			FileWriter fileWriter = new FileWriter(output);
			
			String line = bufferedReader.readLine();
			
			String code = generateShaderCode(line);
			
			fileWriter.write(CodeStorage.begin);
			fileWriter.append(code);
			fileWriter.append(CodeStorage.end);
			
			bufferedReader.close();
			fileWriter.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		
	}
	
	private static String generateShaderCode(String line) throws Exception {
		Stack<Element> stack = new Stack<>();
		List<Character> charsList = new ArrayList<>();
		
		line = line.replaceAll(" ", "");
		String result = "";
		
		char[] chars = line.toCharArray();		
		
		for(char c : chars)
			charsList.add(c);
		
		Iterator<Character> listIterator = charsList.iterator();
		
		while (listIterator.hasNext()) {
			Element currentElement = ElementFactory.createNew(listIterator, stack);
			result += currentElement.getCreationCode() + "\n";
			
			stack.push(currentElement);	
		}
		
		result += "\tfinalObject = " + stack.pop().getName() + ";";

		return result;
	}

	private static void handleParams(String[] args){
		for(int i = 0; i < args.length; i++)
			switch (args[i]) {
			case "-o":
				output = new File(args[++i]);
				break;
			default:
				input = new File(args[i]);
				break;
			}
	}
}
