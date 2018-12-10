package dgis.threed.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResultObj {
    public ResultObj(boolean success, String msg, Object content, int dataCount, String token) {
        this.success = success;
        this.msg = msg;
        this.content = content;
        this.dataCount = dataCount;
        this.token = token;
    }

    @JsonProperty(value ="Success")
    private boolean success;

    @JsonProperty(value ="Msg")
    private String msg;

    @JsonProperty(value ="Content")
    private Object content;

    /// <summary>
    /// 数据总量(分页用)
    /// </summary>
    @JsonProperty(value ="DataCount")
    private int dataCount;

    @JsonProperty(value ="Token")
    private String token;


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public int getDataCount() {
        return dataCount;
    }

    public void setDataCount(int dataCount) {
        this.dataCount = dataCount;
    }

    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
