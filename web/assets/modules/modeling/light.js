define(function () {
    var main = {
        vueObj: null,
        init: null
    };

    main.init = function (data) {
        
        if (data == null) {
            data = {
                name:new Date().getTime(),
                geometry: {
                    type: "light",
                    l: 100,
                    w: 0,
                    h: 0,
                    r: 1
                },      
                material: {
                    type: "color",
                    color: "white",
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