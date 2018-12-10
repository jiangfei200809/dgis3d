package dgis.threed.web.webAPI;

import dgis.threed.common.Config;
import dgis.threed.web.model.ResultObj;
import dgis.threed.web.model.UploadFile;
import dgis.threed.web.util.ZipHelper;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import java.io.File;
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
            String zipPath = Config.FileUploadPath+"\\" + files.get(0).getMd5();

            //解压文件
            String uid=UUID.randomUUID().toString();
            String saveFolder=Config.FileUploadPath+"\\"+uid;
            boolean result= ZipHelper.GetInstance().DeCompressZip(zipPath,saveFolder);
            if(result){
                File file = new File(zipPath);
                file.delete();

                item.setSuccess(true);
                String content=uid+"/"+uid;
                item.setContent(content);
            }else{
                item.setSuccess(false);
            }
        }

        return item;
    }

    /**
     * 保存场景
     * @param json
     * @return
     */
    @RequestMapping("/model/save")
    public ResultObj Save(String json){
        ResultObj resultObj=new ResultObj(false,"",null,0,"");
        return resultObj;
    }

}
