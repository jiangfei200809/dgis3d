package dgis.threed.web.util;

import org.apache.commons.io.input.BOMInputStream;

import java.io.*;

public class FileHelper {
    private static FileHelper _fileHelper;

    public static FileHelper GetInstance() {
        if (_fileHelper == null)
            _fileHelper = new FileHelper();

        return _fileHelper;
    }

    /**
     * 复制文件夹
     *
     * @param orgFolderPath
     * @param targetFolderPath
     * @param contanFolder     包含当前文件夹
     * @return
     */
    public boolean CopyFolder(String orgFolderPath, String targetFolderPath, boolean contanFolder) {
        //01 创建目标文件夹
        targetFolderPath += "\\";
        File targetFolder = new File(targetFolderPath);
        if (!targetFolder.exists())
            targetFolder.mkdirs();

        //02 获取原始文件夹文件
        File orgFolder = new File(orgFolderPath);
        if (contanFolder) {
            return CopyFolder(orgFolder, targetFolderPath);
        } else {
            File[] files = orgFolder.listFiles();
            for (int i = 0; i < files.length; i++) {
                File file = files[i];
                if (file.isDirectory()) {
                    CopyFolder(file, targetFolderPath);
                } else {
                    CopyFile(file, targetFolderPath);
                }
            }

            return true;
        }
    }

    /**
     * 复制文件到指定文件夹
     * @param orgPath
     * @param targetFolderPath
     * @return
     */
    public  boolean CopyFile(String orgPath,String targetFolderPath){
        File file=new File(orgPath);
        return CopyFile(file,targetFolderPath);
    }

    private boolean CopyFolder(File oldFolder, String newPath) {
        newPath += "\\";
        File newFolder = new File(newPath + oldFolder.getName());
        if (!newFolder.exists())
            newFolder.mkdirs();

        File[] files = oldFolder.listFiles();
        for (int i = 0; i < files.length; i++) {
            File file = files[i];
            if (file.isDirectory()) {
                CopyFolder(file, newPath + oldFolder.getName());
            } else {
                CopyFile(file, newPath + oldFolder.getName());
            }
        }

        return true;
    }

    private boolean CopyFile(File oldFile, String newPath) {
        newPath += "\\";
        try {
            File newFolder = new File(newPath);
            if (!newFolder.exists())
                newFolder.mkdirs();

            File newFile = new File(newPath + oldFile.getName());
            if (newFile.exists()) {
                newFile.delete();
            }

            // 新建文件输入流并对它进行缓冲
            FileInputStream input = new FileInputStream(oldFile);
            BufferedInputStream inBuff = new BufferedInputStream(input);

            // 新建文件输出流并对它进行缓冲
            FileOutputStream output = new FileOutputStream(newFile);
            BufferedOutputStream outBuff = new BufferedOutputStream(output);

            // 缓冲数组
            byte[] b = new byte[1024 * 5];
            int len;
            while ((len = inBuff.read(b)) != -1) {
                outBuff.write(b, 0, len);
            }
            // 刷新此缓冲的输出流
            outBuff.flush();

            //关闭流
            inBuff.close();
            outBuff.close();
            output.close();
            input.close();

            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * 创建文件
     * @param bytes
     * @param filePath
     * @return
     */
    public boolean CreateFile(byte[] bytes, String filePath) {
        try {
            File newFile = new File(filePath);
            if (newFile.exists())
                newFile.delete();
            else
                newFile.createNewFile();

            // 新建文件输出流并对它进行缓冲
            FileOutputStream output = new FileOutputStream(newFile);
            BufferedOutputStream outBuff = new BufferedOutputStream(output);

            // 缓冲数组
            byte[] b = new byte[1024 * 100];
            int index = 0;
            while (index<bytes.length) {
                int len=b.length;
                if(len>bytes.length-index)
                {
                    len=bytes.length-index;
                    b = new byte[len];
                }
                System.arraycopy(bytes, index, b, 0, len);
                outBuff.write(b);

                index+=len;
            }
            // 刷新此缓冲的输出流
            outBuff.flush();

            //关闭流
            bytes = null;
            outBuff.close();
            output.close();

            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    /**
     * 删除文件夹
     * @param dir
     * @return
     */
    public boolean DelFolder (String dir){
        //如果dir不以文件分隔符结尾，自动添加文件分隔符
        if(!dir.endsWith(File.separator)){
            dir = dir+File.separator;
        }
        File dirFile = new File(dir);
        //如果dir对应的文件不存在，或者不是一个目录，则退出
        if(!dirFile.exists() || !dirFile.isDirectory()){
            System.out.println("删除目录失败"+dir+"目录不存在！");
            return false;
        }
        boolean flag = true;
        //删除文件夹下的所有文件(包括子目录)
        File[] files = dirFile.listFiles();
        for(int i=0;i<files.length;i++){
            //删除子文件
            if(files[i].isFile()){
                flag = DeleteFile(files[i].getAbsolutePath());
                if(!flag){
                    break;
                }
            }
            //删除子目录
            else{
                flag = DelFolder(files[i].getAbsolutePath());
                if(!flag){
                    break;
                }
            }
        }

        if(!flag){
            System.out.println("删除目录失败");
            return false;
        }

        //删除当前目录
        if(dirFile.delete()){
            //System.out.println("删除目录"+dir+"成功！");
            return true;
        }else{
            //System.out.println("删除目录"+dir+"失败！");
            return false;
        }
    }

    private boolean DeleteFile(String fileName){
        File file = new File(fileName);
        if(file.isFile() && file.exists()){
            Boolean succeedDelete = file.delete();
            if(succeedDelete){
                //System.out.println("删除单个文件"+fileName+"成功！");
                return true;
            }
            else{
                //System.out.println("删除单个文件"+fileName+"失败！");
                return true;
            }
        }else{
            System.out.println("删除单个文件"+fileName+"失败！");
            return false;
        }
    }
}
