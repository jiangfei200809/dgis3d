/**
 * 文件上传类
 * @param {*} buttonDomId 按钮id
 * @param {*} actionUrl 上传action
 * @param {*} multiple 是否多传
 * @param {*} callBack 回调func
 */
var DgisUploader = function (buttonDomId, actionUrl, multipart, callBack) {
    //移除绑定事件
    $("#" + buttonDomId).unbind();
    $("#" + id + "Upload").unbind();

    //移除所有上传组件
    $(".uploadForm").remove();

    //添加上传组件
    var id = new Date().getTime();
    var form = "<form id=\"" + id + "Form\" class=\"uploadForm\" method=\"post\" action=\"" + actionUrl + "\" enctype=\"multipart/form-data\" style=\"display: none;\"><input type=\"file\" name=\"file\"";
    if (multipart)
        form += " multiple=\"multiple\" ";
    form += "id=\"" + id + "Upload\"/></form>";

    $("body").append(form);

    $(document).ready(function(){
        
    }).on("click", "#" + buttonDomId, function () {
        $("#" + id + "Upload").click();
    }).on("change", "#" + id + "Upload", function () {
        //上传文件
        if ($("#" + id + "Upload").val().length > 0)
            $('#' + id + "Form").ajaxSubmit(function (data) {
                //清空数据
                $("#" + id + "Upload").val("");
                //回调
                if(data.Success){
                    for(var i=0;i<data.Content.length;i++){
                        var item=data.Content[i];
                        item.url="/Upload/"+item.md5+item.name.substring(item.name.indexOf("."));
                    }
                }
                callBack(data);
            });
    });

    return this;
}