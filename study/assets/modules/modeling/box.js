define( function() {
    var main={
        vueObj:null,
        init:null
    };

    main.init=function(data){
        if(data==null){
            data={
                name: new Date().getTime(),
                geometry: {
                    type: "box",
                    l: 100,
                    w: 100,
                    h: 100,
                    r: 0
                },
                material: {
                    type: "color",
                    color: "red",
                    opacity: 1,
                    reflect: true,
                    path: "",
                    repeat: [36, 26]
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
        if(main.vueObj==null){
            main.vueObj=new Vue({
                el:"ul",
                data:{Data:data},
                methods: {
                    changeData:function(obj){
                        this.Data=obj;
                    },
                    changeValue:function(){
                        window.parent.main.changeModelProperty(main.vueObj.Data);
                    }
                }
            });


        }else{
            main.vueObj.changeData(data);
        }
    };

    return main;
    
});