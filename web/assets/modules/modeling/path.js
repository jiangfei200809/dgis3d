define(function () {
    var main = {
        vueObj: null,
        init: null
    };

    main.init = function (data) {
        if (data == null) {
            data = {
                name: new Date().getTime(),
                geometry: {
                    type: "path",
                    l: 0,
                    w: 0,
                    h: 100,
                    r: 0,
                    path:""
                },
                material: {
                    type: "color",
                    color: "#037cab",
                    opacity: 1,
                    reflect: true,
                    path: "",
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
                data: {Data: data},
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