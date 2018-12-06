define(function () {
    var main = {
        vueObj: null,
        init: null
    };

    main.init = function (data) {

        var color = data.material.type == "color";
        $(".color").css("display", color ? "block" : "none");
        $(".img").css("display", !color ? "block" : "none");
        
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
                    },
                    changeType: function (color) {
                        $(".color").css("display", color ? "block" : "none");
                        $(".img").css("display", !color ? "block" : "none");
                    }
                }
            });
        } else {
            main.vueObj.changeData(data);
        }
    }

    return main;

});