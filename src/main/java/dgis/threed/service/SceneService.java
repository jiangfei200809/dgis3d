package dgis.threed.service;

import Service.SqliteService;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import dgis.email.core.Model.FromMail;
import dgis.email.core.Model.ToMail;
import dgis.email.core.Service.EmailService;
import dgis.threed.common.Config;
import dgis.threed.model.Scene;
import dgis.threed.web.util.FileHelper;
import dgis.threed.web.util.ZipHelper;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class SceneService {
    private static SceneService _sceneService;

    private SqliteService _sqliteService = SqliteService.GetInstance(Config.SqliteDbPath);

    public static SceneService GetInstance() {
        if (_sceneService == null)
            _sceneService = new SceneService();

        return _sceneService;
    }

    public Scene GetById(String id) {
        String sql = "select * from Scene where Uid='" + id + "'";
        try {
            List<Scene> items = _sqliteService.Query(sql, Scene.class);

            if (items.size() > 0)
                return items.get(0);
            else
                return null;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public boolean Add(Scene item) {
        try {
            return _sqliteService.Add(item, "Id", Scene.class);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean Update(Scene item) {
        try {
            return _sqliteService.Update(item, "uid", item.getUid(), Scene.class);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    public boolean Del(String id) {
        try {
            String sql = "delete from Scene where uid='" + id + "'";
            return _sqliteService.Del(sql);
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    /**
     * 另存为并压缩场景
     * @param id
     * @return
     */
    public boolean MailScene(String id,String emailAddress) {
        Scene item = GetById(id);

        //Tem模板文件夹
        String tempFolderPath = Config.WebPath + "Template";

        //临时目录
        String cacheFolderPath = Config.WebPath + "Cache\\" + id;
        FileHelper.GetInstance().DelFolder(cacheFolderPath);

        //复制文件
        FileHelper.GetInstance().CopyFolder(tempFolderPath, cacheFolderPath, false);

        //修改data json文件，复制纹理和模型到临时目录
        String dataJson = item.getJson();
        JSONArray geos = JSON.parseArray(dataJson);
        for (Object geo : geos) {
            JSONObject geoJson = (JSONObject) geo;
            //01 判断纹理类型
            String material = geoJson.getString("material");
            String type = ((JSONObject) JSONObject.parse(material)).getString("type");
            String path = ((JSONObject) JSONObject.parse(material)).getString("path");
            String saveFolder = cacheFolderPath + "\\img";
            if (type.equals("obj")) {
                //模型，复制文件夹
                String objPath = Config.WebPath + path;
                objPath = objPath.substring(0, objPath.lastIndexOf("/"));
                FileHelper.GetInstance().CopyFolder(objPath, saveFolder, true);
            } else if (type.equals("img")) {
                //贴图，复制文件
                String imgPath = Config.WebPath + path;
                FileHelper.GetInstance().CopyFile(imgPath, saveFolder);
            } else {
                //其他类型，忽略
            }
        }

        //保存data json
        dataJson = dataJson.replaceAll("Upload", "img");
        //创建data.json
        String dataJsonPath = Config.WebPath + "Cache\\" + id + "\\data.json";
        byte[] bytes = dataJson.getBytes();
        FileHelper.GetInstance().CreateFile(bytes, dataJsonPath);

        //压缩文件
        String zipPath=Config.WebPath + "Cache\\" + id+".zip";
        if(ZipHelper.GetInstance().CompressFolderZip(cacheFolderPath,zipPath)){
            FileHelper.GetInstance().DelFolder(cacheFolderPath);

            //发送邮件
            EmailService emailService=EmailService.GetInstance();
            FromMail fromMail=new FromMail("dview187@126.com","dviewcd187","JF","smtp.126.com",25,false);
            List<String> files=new ArrayList<>();
            files.add(zipPath);
            StringBuffer sb=new StringBuffer();
            sb.append("用户，您好：\r\n");
            sb.append("     您在DGIS3D生成的编号为【"+id+"】的场景已经打包到附件，请解压后放入web服务环境中查看。\n");
            sb.append("     如果您在使用中遇到问题，请访问http://www.88gis.cn 查看帮助\n");

            ToMail toMail=new ToMail(emailAddress,"DGIS3D在线场景模型推送",sb.toString(),files);

            return emailService.Send(fromMail,toMail);
        }
        return true;
    }
}
