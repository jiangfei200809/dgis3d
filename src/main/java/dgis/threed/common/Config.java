package dgis.threed.common;

public class Config {
    /*数据库配置*/
    public static String SqliteDbPath="H:\\Work\\Develop\\Web\\ThreeJS\\Data\\dgis3d.db3";

    /*Redis配置*/
    public static String RedisIp="127.0.0.1";
    public static Integer RedisPort=6379;
    public static Integer RedisOutTime=100;//缓存过期时间，单位秒

    /*Mongo配置*/
    public static String MongoIp="127.0.0.1";
    public static Integer MongoPort=27017;
    public  static  String MongoDataBase="admin";
    public static String MongoUserName="root";
    public static String MongoPsw="root";

    /*系统配置*/
    public  static  String WebPath="H:\\Work\\Develop\\Web\\ThreeJS\\web\\";
    //加密秘钥
    public  static  String DesKey="dgis3d";
    //登录过期时间 20分钟
    public static int LoginOutTime=1200;//单位秒
}
