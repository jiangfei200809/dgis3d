define(function () {
    var main = {
        vueObj: null,
        init: null
    };

    main.init = function (data) {
        var dgisUploader = new DgisUploader("uploadObjBtn", "/webapi/model/objUpload", false, function (result) {
            if (result.Success) {
                var item=result.Content[0];
                main.vueObj.Data.material.path = "/Upload/"+item.md5+"/"+item.md5;
                window.parent.main.changeModelProperty(main.vueObj.Data);
            } else {
                layer.msg("上传模型失败", { icon: 2 });
            }
        });

        if (data == null) {
            data = {
                name: new Date().getTime(),
                geometry: {
                    type: "obj",
                    l: 100,
                    w: 100,
                    h: 100,
                    r: 0
                },
                material: {
                    type: "obj",
                    color: "",
                    opacity: 1,
                    reflect: true,
                    path: "/Upload/macbook/macbook",
                    repeat: [1, 1]
                },
                angle: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                }
            }
        }
        if (main.vueObj == null) {
            main.vueObj = new Vue({
                el: "ul",
                data: { Data: data },
                methods: {
                    changeData: function (obj) {
                        this.Data = obj;
                    },
                    changeValue: function () {
                        window.parent.main.changeModelProperty(main.vueObj.Data);
                    }
                }
            });


        } else {
            main.vueObj.changeData(data);
        }
    };

    return main;

});