package dgis.threed.web.util;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

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
        return false;
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

            String uid = saveFolder.substring(saveFolder.lastIndexOf("\\")+1);

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
