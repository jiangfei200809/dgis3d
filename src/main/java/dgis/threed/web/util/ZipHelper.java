package dgis.threed.web.util;

import org.apache.commons.io.FileUtils;

import java.io.*;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

public class ZipHelper {
    private static ZipHelper _zipHelper;

    public static ZipHelper GetInstance() {
        if (_zipHelper == null)
            _zipHelper = new ZipHelper();

        return _zipHelper;
    }

    /**
     * 压缩文件夹
     *
     * @param folder
     * @param savePath
     * @return
     */
    public boolean CompressFolderZip(String folder, String savePath) {
        try {
            //创建zip输出流
            ZipOutputStream out = new ZipOutputStream(new FileOutputStream(savePath));

            //创建缓冲输出流
            BufferedOutputStream bos = new BufferedOutputStream(out);

            File sourceFile = new File(folder);

            //调用函数
            Compress(out, bos, sourceFile, sourceFile.getName());

            bos.close();
            out.close();

            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    private void Compress(ZipOutputStream out, BufferedOutputStream bos, File sourceFile, String base) throws Exception {
        //如果路径为目录（文件夹）
        if (sourceFile.isDirectory()) {

            //取出文件夹中的文件（或子文件夹）
            File[] flist = sourceFile.listFiles();

            if (flist.length == 0)//如果文件夹为空，则只需在目的地zip文件中写入一个目录进入点
            {
                System.out.println(base + "/");
                out.putNextEntry(new ZipEntry(base + "/"));
            } else//如果文件夹不为空，则递归调用compress，文件夹中的每一个文件（或文件夹）进行压缩
            {
                for (int i = 0; i < flist.length; i++) {
                    Compress(out, bos, flist[i], base + "/" + flist[i].getName());
                }
            }
        } else//如果不是目录（文件夹），即为文件，则先写入目录进入点，之后将文件写入zip文件中
        {
            out.putNextEntry(new ZipEntry(base));
            FileInputStream fos = new FileInputStream(sourceFile);
            BufferedInputStream bis = new BufferedInputStream(fos);

            int tag;
            System.out.println(base);
            //将源文件写入到zip文件中
            while ((tag = bis.read()) != -1) {
                out.write(tag);
            }
            bis.close();
            fos.close();

        }
    }

    /**
     * 解压zip
     *
     * @param zipPath
     * @param saveFolder
     * @return
     */
    public boolean DeCompressZip(String zipPath, String saveFolder) {
        try {
            File file = new File(zipPath);

            if (!file.exists()) {
                throw new RuntimeException(zipPath + "所指文件不存在");
            }

            ZipFile zf = new ZipFile(file);
            Enumeration entries = zf.entries();
            ZipEntry entry = null;

            String uid = saveFolder.substring(saveFolder.lastIndexOf("\\") + 1);

            while (entries.hasMoreElements()) {
                entry = (ZipEntry) entries.nextElement();
                //System.out.println("解压" + entry.getName());

                if (entry.isDirectory()) {
                    String dirPath = saveFolder + File.separator + entry.getName();
                    File dir = new File(dirPath);
                    dir.mkdirs();
                } else {
                    // 表示文件
                    String fileName = entry.getName();
                    if (fileName.lastIndexOf(".") != -1) {
                        String fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

                        //针对obj和mtl文件重命名
                        if (fileExtension.equals(".obj") || fileExtension.equals(".mtl")) {
                            fileName = uid + fileExtension;
                        }
                    }

                    File f = new File(saveFolder + File.separator + fileName);
                    if (!f.exists()) {
                        String dirs = f.getParent();
                        File parentDir = new File(dirs);

                        parentDir.mkdirs();
                    }

                    f.createNewFile();

                    // 将压缩文件内容写入到这个文件中
                    InputStream is = zf.getInputStream(entry);
                    FileOutputStream fos = new FileOutputStream(f);

                    int count;

                    byte[] buf = new byte[8192];

                    while ((count = is.read(buf)) != -1) {
                        fos.write(buf, 0, count);
                    }

                    is.close();
                    fos.close();
                }
            }
            zf.close();

            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }
}
