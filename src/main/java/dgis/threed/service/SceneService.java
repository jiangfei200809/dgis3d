package dgis.threed.service;

import Service.SqliteService;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.sun.jmx.snmp.tasks.Task;
import dgis.email.core.Model.FromMail;
import dgis.email.core.Model.ToMail;
import dgis.email.core.Service.EmailService;
import dgis.threed.common.Config;
import dgis.threed.model.Scene;
import dgis.threed.web.util.FileHelper;
import dgis.threed.web.util.ZipHelper;

import java.io.File;
import java.util.*;

public class SceneService {
    private static SceneService _sceneService;

    //邮件队列
    private static Queue<EmailQueueModel> _emailQueue;

    //临时队列
    private static Queue<EmailQueueModel> _cacheEmailQueue;

    private Task _task;

    private SqliteService _sqliteService = SqliteService.GetInstance(Config.SqliteDbPath);

    public static SceneService GetInstance() {
        if (_sceneService == null) {
            _sceneService = new SceneService();
            _emailQueue = new LinkedList();
            _cacheEmailQueue=new LinkedList<>();
        }

        return _sceneService;
    }

    public  List<Scene> GetAll() {
        String sql = "select * from Scene";
        try {
            List<Scene> items = _sqliteService.Query(sql, Scene.class);

            return items;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
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

    public int GetQueueCount(){
        return _emailQueue.size();
    }

    /**
     * 邮件请求放入队列
     *
     * @param id
     * @param emailAddress
     */
    public void AddMailScene(String id, String emailAddress) {
        EmailQueueModel model=new EmailQueueModel(id, emailAddress, 0);
        if(!_emailQueue.contains(model))
            _emailQueue.add(model);
    }

    /**
     * 添加临时邮件队列
     * @param id
     * @param emailAddress
     */
    public void AddCacheMailScene(String id,String  emailAddress){
        EmailQueueModel model=new EmailQueueModel(id, emailAddress, 0);
        if(!_cacheEmailQueue.contains(model))
            _cacheEmailQueue.add(model);
    }

    /**
     * 另存为并压缩场景
     *
     * @param id
     * @return
     */
    public boolean MailScene(String id, String emailAddress) {
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
        String zipPath = Config.WebPath + "Cache\\" + id + ".zip";
        if (ZipHelper.GetInstance().CompressFolderZip(cacheFolderPath, zipPath)) {
            FileHelper.GetInstance().DelFolder(cacheFolderPath);

            //发送邮件
            EmailService emailService = EmailService.GetInstance();
            FromMail fromMail = new FromMail("dgis3d@hotmail.com", "jiangfei628441", "88GIS/DGIS3D三维建模平台", "smtp.office365.com", 587, true);
            List<String> files = new ArrayList<>();
            files.add(zipPath);
            StringBuffer sb = new StringBuffer();
            sb.append("用户，您好：\r\n");
            sb.append("     您在DGIS3D生成的编号为【" + id + "】的场景已经打包到附件，请解压后放入web服务环境中查看。\n");
            sb.append("     如果您在使用中遇到问题，请访问http://www.88gis.cn 查看帮助\n");

            ToMail toMail = new ToMail(emailAddress, "DGIS3D在线场景模型推送", sb.toString(), files);

            boolean result= emailService.Send(fromMail, toMail);
            item.setEmailStatus(result?2:1);
            if(result){
                item.setEmailSendTime(new Date());
            }
            Update(item);
        }
        return true;
    }

    /**
     * 开启邮件发送线程
     */
    public void StartMailScene(){
        if (_task == null) {
            _task = new Task() {
                @Override
                public void cancel() {

                }

                @Override
                public void run() {
                    System.out.println("邮件发送线程开启...");
                    while (true) {
                        if (!_emailQueue.isEmpty()) {
                            EmailQueueModel item = _emailQueue.poll();
                            System.out.println("准备发送id为:"+item.getModelId()+"的场景");
                            boolean result=MailScene(item.getModelId(), item.getEmailAddress());

                            if (result) {

                            } else {
                                if (item.reCount < 2) {
                                    //放到最后，过期自动发送
                                    item.reCount++;
                                    _emailQueue.add(item);
                                }
                            }

                        }else{
                            if(!_cacheEmailQueue.isEmpty()){
                                EmailQueueModel item = _cacheEmailQueue.poll();
                                _emailQueue.add(item);
                            }
                        }

                        //休息3秒
                        try {
                            Thread.sleep(3000);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }
                }
            };
            _task.run();
        }
    }

    class EmailQueueModel {
        private String modelId;

        private String emailAddress;

        private int reCount;

        public EmailQueueModel(String modelId, String emailAddress, int reCount) {
            this.modelId = modelId;
            this.emailAddress = emailAddress;
            this.reCount = reCount;
        }

        public int getReCount() {
            return reCount;
        }

        public void setReCount(int reCount) {
            this.reCount = reCount;
        }


        public String getModelId() {
            return modelId;
        }

        public void setModelId(String modelId) {
            this.modelId = modelId;
        }

        public String getEmailAddress() {
            return emailAddress;
        }

        public void setEmailAddress(String emailAddress) {
            this.emailAddress = emailAddress;
        }


    }
}
