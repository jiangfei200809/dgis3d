package dgis.threed.common;

import dgis.threed.web.util.XMLHelper;

import java.util.Map;

public class Config {
    /*数据库配置*/
    public static String SqliteDbPath = "";

    /*Redis配置*/
    public static String RedisIp = "127.0.0.1";
    public static Integer RedisPort = 6379;
    public static Integer RedisOutTime = 100;//缓存过期时间，单位秒

    /*Mongo配置*/
    public static String MongoIp = "127.0.0.1";
    public static Integer MongoPort = 27017;
    public static String MongoDataBase = "admin";
    public static String MongoUserName = "root";
    public static String MongoPsw = "root";

    /*系统配置*/
    public static String WebPath = "H:\\Work\\Develop\\Web\\ThreeJS\\web\\";
    //加密秘钥
    public static String DesKey = "dgis3d";
    //登录过期时间 20分钟
    public static int LoginOutTime = 1200;//单位秒

    public static void Init() {
        String xmlPath = "config.xml";
        XMLHelper xmlHelper = new XMLHelper();
        Map map = xmlHelper.GetXmlModes(xmlPath, "Config");
        SqliteDbPath = map.get("SqliteDbPath").toString();
        RedisIp = map.get("RedisIp").toString();
        RedisPort = Integer.parseInt(map.get("RedisPort").toString());
        RedisOutTime = Integer.parseInt(map.get("RedisOutTime").toString());
        MongoIp = map.get("MongoIp").toString();
        MongoPort = Integer.parseInt(map.get("MongoPort").toString());
        MongoDataBase = map.get("MongoDataBase").toString();
        MongoUserName = map.get("MongoUserName").toString();
        MongoPsw = map.get("MongoPsw").toString();
        WebPath = map.get("WebPath").toString();
        DesKey = map.get("DesKey").toString();
        LoginOutTime = Integer.parseInt(map.get("LoginOutTime").toString());
    }
}
