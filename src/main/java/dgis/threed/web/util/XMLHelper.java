package dgis.threed.web.util;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class XMLHelper {
    public Map<String,String> GetXmlModes(String path,String nodeName) {
        Map<String,String> map=new HashMap<>();

        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        //创建一个DocumentBuilder的对象
        try {
            //创建DocumentBuilder对象
            DocumentBuilder db = dbf.newDocumentBuilder();
            //通过DocumentBuilder对象的parser方法加载books.xml文件到当前项目下
            Document document = db.parse(path);

            NodeList nodes= document.getElementsByTagName(nodeName);
            for (int i = 0; i < nodes.getLength(); i++) {
                Node node= nodes.item(i);
                NamedNodeMap keys=node.getAttributes();

                String key= keys.item(0).getNodeName();
                String value=keys.item(0).getNodeValue();
                map.put(key,value);
            }
        } catch (ParserConfigurationException e) {
            e.printStackTrace();
        } catch (SAXException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return map;
    }
}
