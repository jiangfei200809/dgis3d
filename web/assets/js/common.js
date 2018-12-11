/**
 * 刷新当前页面
 */
function refresh() {
    window.location.reload();
}

var common = {
    /**
     * 时间戳
     * @returns
     */
    timestamp: function () {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        return timestamp;

    },
    /**
     * URL参数获取
     * @param name 参数名称
     * @returns
     */
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
        if (r != null) return unescape(r[2]); return null; //返回参数值
    },
    /**
     * loading加载栏(20秒后消失)
     */
    showLoading: function () {
        layer.load(0, { shade: true, shade: 0.8, });
        setTimeout(function () {
            layer.closeAll('loading');
        }, 20000);
    },
    /**
     * json格式转正常日期
     * @param str
     * @returns {String}
     */
    dateFromStringWithTime: function (str) {
        //if (str == null || str == undefined) {
        //    return '';
        //}
        //var match;
        //if (!(match = str.match(/\d+/))) {
        //    return false;
        //}
        //var date = new Date();
        //date.setTime(match[0] - 0);
        //return DateToStr(date);
        var da = new Date(str);
        if (isNaN(da.getFullYear()))
            da = eval('new ' + str.replace('/', '', 'g').replace('/', '', 'g'));

        var month = da.getMonth() + 1;

        return da.getFullYear() + "-" + (month < 10 ? ("0" + month) : month) + "-" + (da.getDate() < 10 ? ("0" + da.getDate()) : da.getDate()) + " " + da.getHours() + ":" + da.getMinutes() + ":" + da.getSeconds();
    },

    /**
 * 从集合中查找指定数据
 * @param {} items 
 * @param {} fieldName 
 * @param {} fieldValue 
 * @returns {} 
 */
    getItemInItems: function (items, fieldName, fieldValue) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            for (var key in item) {
                if (key == fieldName) {
                    if (item[key] == fieldValue)
                        return item;
                }
            }
        }

        return null;
    },

    /**
     * 显示错误信息
     * @param {} httpStatus 
     * @param {} msg 
     * @returns {} 
     */
    showError: function (httpStatus, msg) {
        //if (httpStatus == 401) {
        //    layer.msg("系统超时，请重新登录！", { icon: 0 });
        //    return;
        //}
        if (httpStatus == 402) {
            layer.msg("系统超时，请重新登录！", { icon: 0 });
            return;
        }
        if (httpStatus == 403) {
            layer.msg(msg, { icon: 0 });
            return;
        }
        if (httpStatus == 500) {
            layer.msg(msg, { icon: 0 });
            return;
        }
        layer.msg(msg, { icon: 0 });
    }
};


/*
jQuery同步请求类
*/
function syncRequest() { };

syncRequest.post = function (url, data, success, error, before, contentType, dataType) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: success,
        beforeSend: function (request) {
            //var token = $.cookie("doorPlateToken");
            //request.setRequestHeader("doorPlateToken", token);
        },
        error: function (xhr) {
            try {
                common.hideMask();
            } catch (e) {

            };
            var errorMsg = '';
            if (parseInt(xhr.status) != 200) {
                //errorMsg = decodeURI(decodeURIComponent(xhr.getResponseHeader("Server-Msg")));
                //if (errorMsg.indexOf("用户未登录") >= 0) {
                //    errorMsg = "登录失效，请<a href='' style='color:red;'>重新登录</a>。";
                //}
                switch (xhr.status) {
                    case 500:
                        errorMsg = "服务器运行异常。" + xhr.responseText;
                        break;
                    case 403://用户登录但没有功能权限
                        //errorMsg = "不具有操作权限，请检查权限设置。";
                        errorMsg = xhr.responseText;
                        break;
                    case 402://用户无效被禁用
                        errorMsg = "用户无效，请重新登录。";
                        break;
                    case 401://用户没有登录
                        errorMsg = "系统超时，请重新登录。";
                        break;
                    default:
                        errorMsg = xhr.responseText;
                        break;
                }
                //common.showAlert(errorMsg);
                //if (xhr.status == '500') {
                //    errorMsg = xhr.responseText;
                //} else {
                //    errorMsg = xhr.statusText;
                //}
            } else {
                var ct = xhr.getResponseHeader("content-type") || "";
                if (ct.indexOf("json") < 0)
                    errorMsg = '请求与返回的数据格式不一致';
                else {
                    errorMsg = xhr.responseText;
                }
            }
            //if (errorMsg == null || errorMsg == "")
            if (!errorMsg || errorMsg == "" || errorMsg == "null")
                return;
            if (error)
                error(errorMsg, xhr.status);
            else
                common.showError(xhr.status, errorMsg);

        }
    });
};

/*
contentType:请求数据类型(form,json)
dataType：接收数据类型
*/
syncRequest.get = function (url, data, success, error, before, contentType, dataType) {
    var ajaxData;
    var ajaxType = "form";
    if (contentType)
        ajaxType = contentType;
    if (ajaxType == "json") {
        ajaxType = "application/json;charset=utf-8";
        ajaxData = convert.toJsonStr(data);
    }
    else {
        ajaxType = "application/x-www-form-urlencoded";
        ajaxData = convert.toFormValue(data);
    }
    var ajaxDataType = dataType ? dataType : "json";

    //var getTimestamp = new Date().getTime();
    //var rquery = (/\?/);
    //url += (rquery.test(url) ? "&" : "?") + "_ts=" + getTimestamp;

    $.ajax({
        type: "get",
        url: url,
        data: ajaxData,
        //data: data,
        cache: false,
        async: false,
        //contentType: "application/json;charset=utf-8", //请求数据类型  application/x-www-form-urlencoded
        //contentType: "application/x-www-form-urlencoded",
        contentType: ajaxType,
        dataType: ajaxDataType, //接收数据类型
        processData: false,
        success: success,
        beforeSend: before,
        error: function (xhr) {
            var errorMsg = '';
            if (parseInt(xhr.status) != 200) {
                //errorMsg = decodeURI(decodeURIComponent(xhr.getResponseHeader("Server-Msg")));
                //if (errorMsg.indexOf("用户未登录") >= 0) {
                //    errorMsg = "登录失效，请<a href='' style='color:red;'>重新登录</a>。";
                //}
                switch (xhr.status) {
                    case 500:
                        errorMsg = "服务器运行异常。" + xhr.responseText;
                        break;
                    case 403://用户登录但没有功能权限
                        //errorMsg = "不具有操作权限，请检查权限设置。";
                        errorMsg = xhr.responseText;
                        break;
                    case 402://用户无效被禁用
                        errorMsg = "用户无效，请重新登录。";
                        break;
                    case 401://用户没有登录
                        errorMsg = "系统超时，请重新登录。";
                        break;
                    default:
                        errorMsg = xhr.responseText;
                        break;
                }
                //common.showAlert(errorMsg);
                //if (xhr.status == '500') {
                //    errorMsg = xhr.responseText;
                //} else {
                //    errorMsg = xhr.statusText;
                //}
            } else {
                var ct = xhr.getResponseHeader("content-type") || "";
                if ((ajaxDataType.indexOf("json") >= 0 && ct.indexOf("json") < 0) ||
                    (ajaxDataType.indexOf("html") >= 0 && ct.indexOf("html") < 0)
                )
                    errorMsg = '请求与返回的数据格式不一致';
                else {
                    errorMsg = xhr.responseText;
                }
            }
            //if (errorMsg == null || errorMsg == "")
            if (!errorMsg || errorMsg == "" || errorMsg == "null")
                return;
            if (error)
                error(errorMsg, xhr.status);
            else {
                common.showError(xhr.status, errorMsg);
            }
        },
        complete: function (xhr) {
            //alert(xhr.status);
        }
    });
};


/*
对象转换器
*/
function convert() {

};

/*
将对象转换成form表单形式提交的字符串值
*/
///	<summary>
///		创建数组或对象的序列化表示形式(适合于在 URL
///		查询字符串或 Ajax 请求中使用)。
///	</summary>
///	<param name="o" type="Object">
///		要序列化的数组或对象。
///	</param>
///	<param name="traditional" type="Boolean">
///		一个指示是否执行传统的“浅表”序列化的布尔值。
///	</param>
///	<returns type="String" />
convert.toFormValue = function (o, traditional) {
    if (!o) return null;
    var a = o;
    var r20 = /%20/g;
    var s = [];

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if (traditional === undefined) {
        traditional = jQuery.ajaxSettings.traditional;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if (jQuery.isArray(a) || a.jquery) {
        // Serialize the form elements
        jQuery.each(a, function () {
            add(this.name, this.value);
        });

    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for (var prefix in a) {
            buildParams(prefix, a[prefix]);
        }
    }

    // Return the resulting serialization
    return s.join("&").replace(r20, "+");

    function buildParams(prefix, obj) {
        if (jQuery.isArray(obj)) {
            // Serialize array item.
            jQuery.each(obj, function (i, v) {
                if (traditional) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    // If array item is non-scalar (array or object), encode its
                    // numeric index to resolve deserialization ambiguity issues.
                    // Note that rack (as of 1.0.0) can't currently deserialize
                    // nested arrays properly, and attempting to do so may cause
                    // a server error. Possible fixes are to modify rack's
                    // deserialization algorithm or to provide an option or flag
                    // to force array serialization to be shallow.
                    buildParams(prefix + "[" + (typeof v === "object" || jQuery.isArray(v) ? i : "") + "]", v);
                }
            });

        } else if (!traditional && obj != null && typeof obj === "object") {
            // Serialize object item.
            jQuery.each(obj, function (k, v) {
                //buildParams(prefix + "[" + k + "]", v);
                buildParams(prefix + "." + k, v);
            });

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }

    function add(key, value) {
        // If value is a function, invoke it and return its value
        value = jQuery.isFunction(value) ? value() : value;
        s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }



};

/*
将对象转换成json字符串
*/
convert.toJsonStr = function (o) {
    return JSON.stringify(o);
};
/*
将json字符串转换成json对象
*/
convert.toJson = function (jsonstr) {
    return JSON.parse(jsonstr);
};

/*
数字每3位用“，”分开(千位分隔符)
*/
convert.setCurrencyFormat = function (str) {
    str += '';
    var x = str.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    var totalPrice = x1 + x2;
    return totalPrice;
};

common.Pager = function Pager(url, pageSize, pageContainerId, func) {
    var self = this;
    var url = url;
    var pagerInit = false;
    var func = func;
    this.show = function (pageIndex, params) {
        //分页信息
        if (params == null)
            params = { queryValue: null };

        var postParams = params;

        postParams.pageIndex = pageIndex;//当前页
        postParams.pageSize = pageSize;//显示内容行数

        syncRequest.post(url, postParams, function (result) {
            var pageCount = Math.ceil(result.DataCount / pageSize);
            var datas = result.Content;

            if (!pagerInit) {
                $("#" + pageContainerId).jPages({
                    containerID: pageContainerId,
                    previous: "上一页",
                    next: "下一页",
                    numPages: pageCount,
                    callback: function (a, b) {
                        if (!pagerInit) {
                            pagerInit = true;
                            func(datas);
                        } else {
                            self.show(a.current, params);
                        }
                    },
                    midRange: 5, //跳过页码...数量
                    perPage: 10 //每页显示数
                });
            } else {
                func(datas);
            }
        });
    };
}