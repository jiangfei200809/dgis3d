package dgis.threed.model;

import java.util.Date;

public class Scene {
    public Scene() {
    }

    public Scene(String uid, Date createTime, String json, String email) {
        this.uid = uid;
        this.createTime = createTime;
        this.json = json;
        this.email = email;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public String getJson() {
        return json;
    }

    public void setJson(String json) {
        this.json = json;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public Integer getEmailStatus() {
        return emailStatus;
    }

    public void setEmailStatus(Integer emailStatus) {
        this.emailStatus = emailStatus;
    }

    public Date getEmailSendTime() {
        return emailSendTime;
    }

    public void setEmailSendTime(Date emailSendTime) {
        this.emailSendTime = emailSendTime;
    }

    private String uid;

    private Date createTime;

    private String json;

    private String email;


    private Integer emailStatus;

    private Date emailSendTime;
}
