package dgis.threed.web.model;

import java.io.InputStream;
import java.util.Date;

public class UploadFile {
    private String name;

    private String md5;

    private InputStream fileStream;

    private Date uploadDate;

    public UploadFile(String name, String md5, InputStream fileStream, Date uploadDate) {
        this.name = name;
        this.md5 = md5;
        this.fileStream = fileStream;
        this.uploadDate = uploadDate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public InputStream getFileStream() {
        return fileStream;
    }

    public void setFileStream(InputStream fileStream) {
        this.fileStream = fileStream;
    }

    public Date getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(Date uploadDate) {
        this.uploadDate = uploadDate;
    }
}
