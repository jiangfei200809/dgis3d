define(function () {
    var main = {
        vueObj: null,
        init: null
    };

    main.init = function () {
        var data = window.parent.main.datas;
        if (main.vueObj == null) {
            main.vueObj = new Vue({
                el: "#mainTable",
                data: { Datas: data },
                methods: {
                    changeData: function (obj) {
                        this.Data = obj;
                    },
                    changeValue: function (data) {
                        var cloneData = clone(data);
                        var obj = window.parent.main.getModelByName(data.name);
                        window.parent.main.renderSelectModel(obj);
                        window.parent.main.changeModelProperty(cloneData);

                        //值复制
                        function clone(obj) {
                            //判断是对象，就进行循环复制
                            if (typeof obj === 'object' && typeof obj !== 'null') {
                                // 区分是数组还是对象，创建空的数组或对象
                                var o = Object.prototype.toString.call(obj).slice(8, -1) === "Array" ? [] : {};
                                for (var k in obj) {
                                    // 如果属性对应的值为对象，则递归复制
                                    if (typeof obj[k] === 'object' && typeof obj[k] !== 'null') {
                                        o[k] = clone(obj[k])
                                    } else {
                                        o[k] = obj[k];
                                    }
                                }
                            } else { //不为对象，直接把值返回
                                return obj;
                            }
                            return o;
                        }
                    },
                    typeConvert: function (type) {
                        var str="";
                        switch (type) {
                            case "box":
                            str="立方体";
                                break;
                            case "cylinder":
                            str="柱状图";
                                break;
                            case "obj":
                            str="外部模型";
                                break;
                            case "path":
                            str="GeoJSON";
                                break;
                            case "light":
                            str="灯光";
                                break;

                            default:
                                break;
                        }
                        return str;
                    },
                    selectModel: function (data) {
                        var obj = window.parent.main.getModelByName(data.name);
                        window.parent.main.renderSelectModel(obj);
                    },
                    removeModel: function (data) {
                        window.parent.layer.confirm('是否确定移除该模型？', { "title": "提醒" }, function () {
                            window.parent.main.removeModel(window.parent.main.cacheObjs);
                            window.parent.layer.closeAll('dialog');
                        }, function () {
                        });
                    }
                }
            });


        } else {
            main.vueObj.changeData(data);
        }
    };

    return main;

});