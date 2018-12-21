package dgis.threed.web.webAPI;

import Service.MongoService;
import dgis.threed.common.Config;
import dgis.threed.web.model.ResultObj;
import dgis.threed.web.model.UploadFile;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;

@RestController
public class UploadController {
    /**
     * 上传文件
     *
     * @param request
     * @return
     */
    @RequestMapping("/file/upload")
    public ResultObj Upload(MultipartHttpServletRequest request) {
        Map parameter = (Map) request.getParameterMap();

        List<UploadFile> items = new ArrayList<UploadFile>();

        /*DiskFileItemFactory factory = new DiskFileItemFactory();
        // 缓存大小为512KB
        factory.setSizeThreshold(5242880);
        factory.setRepository(new File(request.getRealPath("/upload/tem")));
        // 初始化上传控件
        ServletFileUpload upload = new ServletFileUpload(factory);
        // 文件大小最大300MB
        upload.setFileSizeMax(300*1204*1024);
        upload.setHeaderEncoding("UTF-8");*/

        Iterator<String> it = request.getFileNames();
        MultipartFile mpf = null;

        while (it.hasNext()) {
            String filenametmp = it.next();
            mpf = request.getFile(filenametmp);
            if (mpf != null) {
                InputStream inputStream = null;
                try {
                    inputStream = mpf.getInputStream();
                    String md5 = MongoService.GetInstance(Config.MongoIp,Config.MongoPort,Config.MongoDataBase,Config.MongoUserName,Config.MongoPsw).GetMd5(inputStream);
                    String fileName = mpf.getOriginalFilename();
                    String extension=fileName.substring(fileName.lastIndexOf("."));

                    String savePath = Config.WebPath+"Upload\\" + md5+extension;
                    inputStream = mpf.getInputStream();
                    if (saveFile(savePath, inputStream))
                    {
                        items.add(new UploadFile(fileName, md5, null, new Date()));
                    }

                } catch (Exception e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }finally {
                }
            }
        }

        ResultObj resultObj = new ResultObj(false, "", null, 0, "");

        if (items.size() == 0) {
            resultObj.setMsg("没有文件");
        } else {
            resultObj.setSuccess(true);
            resultObj.setContent(items);
        }

        return resultObj;
    }

    private boolean saveFile(String destination, InputStream input) {
        File file = new File(destination);
        //文件存在，不上传
        if(file.exists())
            return  true;

        try {

            int index;
            byte[] bytes = new byte[1024];
            FileOutputStream downloadFile = new FileOutputStream(destination);

            while ((index = input.read(bytes)) != -1) {
                downloadFile.write(bytes, 0, index);
                downloadFile.flush();
            }
            downloadFile.close();
            input.close();

            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    /**
     * 下载文件
     *
     * @param key
     * @param response
     */
    @RequestMapping("/file/downloadFile")
    public void downloadFile(String key, HttpServletResponse response) {
        dowload(key, response, "application/octet-stream");
    }

    /**
     * 下载图片
     *
     * @param key
     * @param response
     */
    @RequestMapping("/file/downloadImg")
    public void downloadImg(String key, HttpServletResponse response) {
        dowload(key, response, "image/jpeg");
    }

    /**
     * 下载文件
     *
     * @param key         key
     * @param response
     * @param contentType 文件类型(图片显示，文件下载)
     */
    private void dowload(String key, HttpServletResponse response, String contentType) {
        String fileName = key;
        response.setHeader("content-type", contentType);
        response.setContentType(contentType);
        response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
        byte[] buff = new byte[1024];
        ServletOutputStream os = null;
        try {
            os = response.getOutputStream();
            String filePath = Config.WebPath+"Upload\\"+ key;
            FileInputStream in= new FileInputStream(new File(filePath));
            int i =0;
            while ((i=in.read(buff)) != -1) {
                os.write(buff, 0, buff.length);
            }

            in.close();
            in=null;

            os.flush();
            os.close();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {

        }
    }
}
