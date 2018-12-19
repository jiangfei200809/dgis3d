package dgis.threed.web.webAPI;

import dgis.threed.common.Config;
import dgis.threed.model.Scene;
import dgis.threed.service.SceneService;
import dgis.threed.web.model.ResultObj;
import dgis.threed.web.model.UploadFile;
import dgis.threed.web.util.ZipHelper;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.File;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
public class ModelController {
    /**
     * 上传obj模型zip文件夹
     * @param request
     * @return
     */
    @RequestMapping("/model/objUpload")
    public ResultObj ObjUpload(MultipartHttpServletRequest request){
        UploadController uploadController=new UploadController();
        ResultObj item=uploadController.Upload(request);

        if(item.isSuccess()){
            List<UploadFile> files=(List<UploadFile>)item.getContent();
            UploadFile uploadFile=files.get(0);
            String zipPath = Config.WebPath+"Upload\\" + uploadFile.getMd5()+uploadFile.getName().substring(uploadFile.getName().lastIndexOf("."));

            //解压文件
            String saveFolder=Config.WebPath+"Upload\\"+uploadFile.getMd5();
            boolean result= ZipHelper.GetInstance().DeCompressZip(zipPath,saveFolder);
            if(result){
                File file = new File(zipPath);
                file.delete();

                item.setSuccess(true);
                item.setContent(files);
            }else{
                item.setSuccess(false);
            }
        }

        return item;
    }

    /**
     * 保存场景
     * @param item
     * @return
     */
    @RequestMapping("/model/save")
    public ResultObj Save(Scene item){
        ResultObj resultObj=new ResultObj(false,"",null,0,"");

        boolean result=false;
        item.setCreateTime(new Date());
        if(item.getUid().isEmpty()){
            item.setUid(UUID.randomUUID().toString());
            result=SceneService.GetInstance().Add(item );
        }else{
            result=SceneService.GetInstance().Update(item );
        }
        resultObj.setSuccess(result);
        resultObj.setContent(item.getUid());

        return resultObj;
    }

    /**
     * 场景发送邮件
     * @param id
     * @param email
     * @return
     */
    @RequestMapping("/model/email")
    public ResultObj Email(String id,String email){
        boolean result= SceneService.GetInstance().MailScene(id,email);
        ResultObj resultObj=new ResultObj(result,"",null,0,"");
        return resultObj;
    }

    /**
     * 获取场景
     * @param uid
     * @return
     */
    @RequestMapping("/model/get")
    public ResultObj GetModels(String uid){
        ResultObj resultObj=new ResultObj(false,"",null,0,"");
        Scene item=SceneService.GetInstance().GetById(uid);
        resultObj.setSuccess(true);
        resultObj.setContent(item);
        return resultObj;
    }
}
