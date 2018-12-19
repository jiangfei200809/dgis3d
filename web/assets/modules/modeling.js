define(["/assets/modules/dgis3d"], function (dgis3d) {
    var main = {
        init: null,
        sceneDomId: "",
        initToolbar: null,
        event: "control",
        viewType: 0,//视图类型
        datas: [],
        cacheObjs: []
    };

    main.init = function (domId) {
        $(document).ready(function () {
            //外框渲染
            var techBox=new DGISTechBox();
            techBox.renderByDomClass("dgisBox");
            $(".right_div").css("display", "none");

            //时间提示
            setInterval(function () {
                date = new Date();
                var minute = date.getMinutes();
                var seconds = date.getSeconds();

                $("#time").text(date.getHours() + ":" + (minute < 10 ? "0" : "") + minute + ":" + (seconds < 10 ? "0" : "") + seconds);
                $("#date").text(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
            }, 1000);

            //工具栏
            main.initToolbar();
            //模型栏
            main.initModels();

            //右侧属性工具栏
            /*
             var slider0 = new DgisSlider("modelsDiv");
             slider0.init("150px", "500px", "200px", true, true);
 
             var slider1 = new DgisSlider("propertyUl");
             slider1.init("280px", "100%", "0", false, true);
             */

            //画布
            main.sceneDomId = domId;
            main.initScene();

            var uid = common.getUrlParam("id");
            if (uid == null) {
                main.test();
            } else {
                syncRequest.get("/webapi/model/get?uid=" + uid, null, function (e) {
                    if (e.Success) {
                        main.datas = JSON.parse(e.Content.json);
                        for (var i = 0; i < main.datas.length; i++) {
                            var mesh = main.buildModel(main.datas[i]);
                            if(mesh!=null)
                                dgis3d.scene.add(mesh);
                        }
                        dgis3d.render();
                    } else {
                        layer.msg("模型获取失败", { icon: 2 });
                    }
                });
            }


        }).on("click", function (e) {
            main.orbitControls.enabled = true;
            main.dragControls.enabled = false;

            if (main.event == "select") {
                main.selectModel(e);
            } else if (main.event == "move") {
                main.orbitControls.enabled = false;
                main.dragControls.enabled = true;
            }

        });

        $(window).on("resize", function () {
            dgis3d.camera.aspect = window.innerWidth / window.innerHeight;
            dgis3d.camera.updateProjectionMatrix();

            dgis3d.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    /**
     * 初始化工具栏
     */
    main.initToolbar = function () {
        var menus = [];
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1257"><path d="M288 320h448a32 32 0 0 0 0-64H288a32 32 0 0 0 0 64zM288 544h448a32 32 0 0 0 0-64H288a32 32 0 0 0 0 64zM544 704H288a32 32 0 0 0 0 64h256a32 32 0 0 0 0-64zM896 132.928C896 77.28 851.552 32 796.928 32H227.04C172.448 32 128 77.28 128 132.928v758.144C128 946.72 172.448 992 227.04 992h435.008c1.568 0 2.912-0.672 4.416-0.896 8.96 1.6 18.464-0.256 25.984-6.528l192-160a31.424 31.424 0 0 0 10.816-27.2c0.16-1.184 0.736-2.208 0.736-3.424V132.928zM192 891.072V132.928C192 112.576 207.712 96 227.04 96h569.888C816.288 96 832 112.576 832 132.928V736h-96a96 96 0 0 0-96 96v96H227.04C207.712 928 192 911.424 192 891.072zM814.016 800L704 891.68V832a32 32 0 0 1 32-32h78.016z" p-id="1258"></path></svg>',
            text: "新建",
            index: 0,
            color: "darkslategray",
            click: "main.toolbar.new()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3447"><path d="M928.16 144H736V64a32 32 0 0 0-32-32H320a32 32 0 0 0-32 32v80H95.84a32 32 0 0 0 0 64H129.6l77.92 698.656A96 96 0 0 0 302.912 992h418.144a96.032 96.032 0 0 0 95.424-85.344L894.4 208h33.728a32 32 0 0 0 0.032-64zM352 96h320v48H352V96z m400.896 803.552a32 32 0 0 1-31.808 28.448H302.912a32 32 0 0 1-31.808-28.448L193.984 208h636.032l-77.12 691.552zM608 820.928a32 32 0 0 0 32-32V319.104a32 32 0 0 0-64 0v469.824a32 32 0 0 0 32 32zM432 820.928a32 32 0 0 0 32-32V319.104a32 32 0 0 0-64 0v469.824a32 32 0 0 0 32 32z" p-id="3448"></path></svg>',
            text: "删除",
            index: 1,
            color: "darkslategray",
            click: "main.toolbar.del()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2735"><path d="M321.051906 916.481888C181.547648 850.785498 81.714093 715.074259 66.34498 554.683771H2.356269c21.75649 262.818402 241.488832 469.316229 509.857191 469.316229l28.143867-1.264339-162.541507-162.557927-56.763914 56.304154z m37.979443-278.187515a70.770168 70.770168 0 0 1-22.18341-3.415358c-6.847137-2.545099-12.364254-5.566377-17.076793-10.246076a42.396421 42.396421 0 0 1-11.099915-15.779613 51.148277 51.148277 0 0 1-3.825858-20.048811h-55.466735c0 15.352693 2.988439 29.014127 8.948896 40.508122a94.185078 94.185078 0 0 0 23.891089 29.457467 107.715152 107.715152 0 0 0 34.991005 17.487292c12.791174 4.269198 26.452608 6.403797 40.967881 6.403797 15.779613 0 30.721806-2.134599 43.9399-6.403797 13.661434-4.285618 25.615188-10.656575 35.401504-18.800891a84.398762 84.398762 0 0 0 23.48059-30.688967 99.997755 99.997755 0 0 0 8.521976-41.394801c0-8.111476-0.85384-16.206533-2.988439-23.891089s-5.123038-14.925773-9.819155-21.75649c-4.269198-6.814297-10.229655-12.774754-17.060373-18.341132-7.241217-5.549958-15.796033-9.819156-26.042108-13.234514a89.20982 89.20982 0 0 0 37.995863-31.986146c4.269198-6.403797 7.241217-12.791174 9.392236-19.621891 2.134599-6.830717 2.972019-13.661434 2.972019-20.475731 0-15.369113-2.561519-29.030547-7.668137-40.967881a75.942466 75.942466 0 0 0-21.77291-29.441047c-8.538396-8.095056-20.065231-14.055514-32.856405-18.341132a155.85857 155.85857 0 0 0-43.496561-5.960457c-15.369113 0-29.441047 2.134599-42.659141 6.830717-12.807594 4.679698-24.318009 11.083495-33.710245 19.194971a95.580777 95.580777 0 0 0-21.75649 28.587207 84.874942 84.874942 0 0 0-7.684556 36.255344h55.466735c0-7.241217 1.280759-13.645014 3.825858-19.194972 2.561519-5.549958 5.976877-10.656575 10.672995-14.515273 4.696118-3.825858 9.819156-7.241217 16.206533-9.375816 6.403797-2.134599 12.807594-3.415358 20.475731-3.415358 17.076792 0 29.867967 4.269198 37.979443 13.234514 8.095056 8.538396 12.364254 20.902651 12.364254 36.682263 0 7.684557-1.280759 14.515273-3.415358 20.902651s-5.976877 11.510415-10.672996 15.796033a54.317336 54.317336 0 0 1-17.487292 10.229655c-6.847137 2.561519-15.369113 3.842278-24.744929 3.842278h-32.839985v43.939901h32.839985c9.392236 0 17.914212 0.85384 25.598769 2.988438 7.684557 2.134599 14.071934 5.549958 19.194971 9.802736 5.123038 4.696118 9.392236 10.246075 12.380675 17.093212 2.988439 6.797877 4.252778 14.942193 4.252778 24.318009 0 17.470872-5.123038 30.688966-14.942193 39.670703-9.769896 9.802736-23.431329 14.071934-40.491702 14.071933z m364.819396-252.572326a142.624056 142.624056 0 0 0-48.652438-32.856406c-18.341132-7.684557-39.276622-11.510415-62.297452-11.510414h-100.687395v341.322386h98.125876c23.480589 0 45.23708-3.825858 64.432051-11.526834 19.194971-7.684557 35.844844-18.341132 49.489858-32.429486a143.806295 143.806295 0 0 0 31.592065-50.770617c7.241217-20.065231 11.083495-42.232221 11.083495-66.97715v-17.076792c0-24.744929-3.825858-46.911919-11.083495-66.97715-7.717397-20.065231-18.357552-37.125603-32.002565-51.197537z m-16.649873 134.824559a187.187916 187.187916 0 0 1-5.976877 48.225518c-4.269198 14.071934-10.246075 26.436188-18.341132 36.271764a79.932524 79.932524 0 0 1-30.311306 22.61033c-12.364254 5.123038-26.436188 7.668137-42.232221 7.668137h-38.816863V389.137405h41.394802c30.721806 0 54.185976 9.819156 69.982008 29.441047 16.206533 19.621891 24.318009 47.782179 24.318009 84.907782v17.060372h-0.01642zM512.19704 0l-28.160287 1.280759 162.557927 162.557927 56.747494-56.747494C842.862851 173.214502 942.696407 308.482401 957.6386 468.905729h63.988711C1000.314161 206.530667 780.581819 0 512.19704 0z" fill="" p-id="2736"></path></svg>',
            text: "控制",
            index: 2,
            color: "darkslategray",
            click: "main.toolbar.control()"
        });

        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7349"><path d="M281.611519 767.961602h-204.78976C34.481476 767.961602 0.025599 733.505725 0.025599 691.165442v-614.369282C0.025599 34.455877 34.481476 0 76.821759 0h716.764162c42.340283 0 76.79616 34.455877 76.79616 76.79616v358.382081a25.59872 25.59872 0 0 1-51.19744 0v-358.382081a25.59872 25.59872 0 0 0-25.59872-25.59872h-716.764162a25.59872 25.59872 0 0 0-25.59872 25.59872v614.369282a25.59872 25.59872 0 0 0 25.59872 25.59872h204.78976a25.59872 25.59872 0 0 1 0 51.19744z" fill="" p-id="7350"></path><path d="M665.59232 1023.948803a25.59872 25.59872 0 0 1-23.755612-16.075997l-86.882056-217.179541-151.698015 173.354533A25.59872 25.59872 0 0 1 358.40768 947.20384v-767.961602a25.59872 25.59872 0 0 1 42.852257-18.943053l563.171841 511.974401a25.547523 25.547523 0 0 1-17.202339 44.541773H729.077146l88.366782 220.865757a25.59872 25.59872 0 0 1-14.284086 33.278336l-127.9936 51.19744a26.0083 26.0083 0 0 1-9.522724 1.843108z m-102.39488-307.184641a25.59872 25.59872 0 0 1 23.755612 16.075996l92.872157 232.231588 80.482376-32.203189-92.872157-232.231589a25.547523 25.547523 0 0 1 23.755612-35.121444h189.788911L409.60512 236.99295v641.964702l134.342083-153.541123a25.649918 25.649918 0 0 1 19.250237-8.754762z" fill="" p-id="7351"></path></svg>',
            text: "选择",
            index: 3,
            color: "darkslategray",
            click: "main.toolbar.slt()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7603"><path d="M430.933333 985.6l-221.866666-277.333333s-12.8-102.4 89.6-59.733334c55.466667 25.6 76.8 81.066667 76.8 81.066667V311.466667s59.733333-89.6 110.933333 0v264.533333s64-85.333333 140.8 4.266667c0 0 55.466667-93.866667 136.533333 4.266666 0 0 42.666667-64 93.866667-4.266666 12.8 17.066667 21.333333 42.666667 17.066667 64l-21.333334 200.533333c-4.266667 55.466667-34.133333 106.666667-81.066666 136.533333" fill="#FBFBFC" p-id="7604"></path><path d="M430.933333 1006.933333c-4.266667 0-12.8-4.266667-17.066666-8.533333L192 725.333333c-4.266667-4.266667-4.266667-8.533333-4.266667-12.8 0-4.266667-4.266667-55.466667 29.866667-81.066666 21.333333-17.066667 51.2-17.066667 89.6 0 17.066667 8.533333 34.133333 21.333333 46.933333 34.133333V311.466667c0-4.266667 0-8.533333 4.266667-12.8 4.266667-4.266667 34.133333-51.2 76.8-46.933334 25.6 0 51.2 17.066667 68.266667 51.2 0 4.266667 4.266667 8.533333 4.266666 8.533334v217.6c12.8-8.533333 25.6-12.8 42.666667-12.8 25.6 0 51.2 8.533333 72.533333 29.866666 12.8-12.8 34.133333-25.6 59.733334-29.866666 25.6 0 51.2 8.533333 76.8 34.133333 12.8-8.533333 25.6-17.066667 46.933333-17.066667 21.333333 0 42.666667 8.533333 64 34.133334 17.066667 21.333333 25.6 51.2 21.333333 76.8l-21.333333 200.533333c-8.533333 64-38.4 119.466667-89.6 153.6-8.533333 4.266667-21.333333 4.266667-29.866667-4.266667-8.533333-8.533333-4.266667-21.333333 4.266667-29.866666 38.4-25.6 64-72.533333 72.533333-123.733334l21.333334-200.533333c0-17.066667-4.266667-34.133333-12.8-46.933333-8.533333-12.8-17.066667-21.333333-29.866667-17.066667-12.8 0-25.6 17.066667-29.866667 21.333333-4.266667 4.266667-8.533333 8.533333-17.066666 8.533334s-12.8-4.266667-17.066667-8.533334c-12.8-17.066667-34.133333-38.4-59.733333-38.4-25.6 0-42.666667 29.866667-42.666667 29.866667-4.266667 4.266667-8.533333 8.533333-17.066667 8.533333s-12.8-4.266667-17.066666-8.533333c-21.333333-25.6-38.4-34.133333-55.466667-34.133333-25.6 0-46.933333 29.866667-46.933333 29.866666-4.266667 8.533333-17.066667 8.533333-25.6 8.533334-8.533333-4.266667-12.8-12.8-12.8-21.333334V311.466667c-8.533333-12.8-17.066667-25.6-29.866667-25.6-12.8 0-29.866667 17.066667-38.4 25.6V725.333333c0 8.533333-8.533333 17.066667-17.066667 21.333334-8.533333 0-21.333333-4.266667-25.6-12.8 0 0-17.066667-46.933333-68.266666-68.266667-21.333333-8.533333-38.4-12.8-46.933334-4.266667-8.533333 8.533333-12.8 25.6-12.8 38.4l217.6 268.8c8.533333 8.533333 4.266667 21.333333-4.266666 29.866667 0 8.533333-4.266667 8.533333-8.533334 8.533333z" fill="#788698" p-id="7605"></path><path d="M264.533333 529.066667c-4.266667 0-12.8 0-17.066666-4.266667A282.88 282.88 0 0 1 128 294.4C128 140.8 256 17.066667 409.6 17.066667s281.6 123.733333 281.6 281.6c0 64-21.333333 128-64 179.2-12.8 12.8-29.866667 17.066667-46.933333 4.266666-12.8-12.8-17.066667-29.866667-4.266667-46.933333 29.866667-38.4 51.2-85.333333 51.2-136.533333 0-119.466667-98.133333-217.6-217.6-217.6s-217.6 93.866667-217.6 213.333333c0 68.266667 34.133333 136.533333 93.866667 174.933333 12.8 8.533333 17.066667 29.866667 8.533333 42.666667-8.533333 12.8-17.066667 17.066667-29.866667 17.066667z" fill="#2BA5E3" p-id="7606"></path></svg>',
            text: "移动",
            index: 4,
            color: "darkslategray",
            click: "main.toolbar.move()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10769"><path d="M964 751.968h-600A59.968 59.968 0 0 1 304 692V91.968C304 58.88 330.848 32 364 32h600C997.152 32 1024 58.88 1024 91.968v600.032a59.968 59.968 0 0 1-60 59.968z m0-629.984a30.016 30.016 0 0 0-30.016-30.016H393.984a29.984 29.984 0 0 0-29.984 30.016v540c0 16.608 13.44 30.016 29.984 30.016h540a29.984 29.984 0 0 0 30.016-30.016V121.984z m-840 240.064v539.968c0 16.576 13.44 30.016 30.016 30.016h540a29.984 29.984 0 0 0 30.016-30.016v-89.984H784v120A60 60 0 0 1 724 992H124A60 60 0 0 1 64 932v-600C64 298.848 90.848 272 124 272h120v60H154.016a30.016 30.016 0 0 0-30.016 30.048z" p-id="10770"></path></svg>',
            text: "合并",
            index: 5,
            color: "darkslategray",
            click: "main.toolbar.merge()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10250"><path d="M267.726077 1024a185.759637 185.759637 0 1 1 185.759637-185.759637 185.759637 185.759637 0 0 1-185.759637 185.759637z m0-278.639456a92.879819 92.879819 0 1 0 92.879819 92.879819 92.879819 92.879819 0 0 0-92.879819-92.879819zM756.273923 1024a185.759637 185.759637 0 1 1 185.759637-185.759637 185.759637 185.759637 0 0 1-185.759637 185.759637z m0-278.639456a92.879819 92.879819 0 1 0 92.879818 92.879819 92.879819 92.879819 0 0 0-92.879818-92.879819z" p-id="10251"></path><path d="M350.389116 760.685714a46.439909 46.439909 0 0 1-27.863946-9.287982 46.439909 46.439909 0 0 1-9.752381-65.015873L800.391837 28.328345a46.439909 46.439909 0 0 1 65.015873-9.752381 46.439909 46.439909 0 0 1 9.752381 65.015873L387.541043 743.038549a46.439909 46.439909 0 0 1-37.151927 17.647165z" p-id="10252"></path><path d="M673.610884 760.685714a46.439909 46.439909 0 0 1-37.151927-19.040363L148.839909 83.591837A46.439909 46.439909 0 0 1 158.59229 18.575964a46.439909 46.439909 0 0 1 65.015873 9.752381l487.619048 658.053514a46.439909 46.439909 0 0 1-9.752381 65.015873 46.439909 46.439909 0 0 1-27.863946 9.287982z" p-id="10253"></path></svg>',
            text: "裁剪",
            index: 6,
            color: "darkslategray",
            click: "main.toolbar.clip()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2973"><path d="M433.257931 0L18.220138 216.734897l3.707586 6.779586L17.655172 222.631724v666.376828l558.962759 130.295172L1006.344828 786.078897V108.932414L433.257931 0zM57.979586 231.212138L437.954207 32.979862l518.17931 102.4L575.205517 341.203862 58.014897 231.212138z m-10.663724 634.526896V258.930759l501.300966 106.354758v614.4L47.351172 865.739034z" p-id="2974"></path></svg>',
            text: "视图切换",
            index: 7,
            color: "darkslategray",
            click: "main.toolbar.view()"
        });
        menus.push({
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1"            xmlns="http://www.w3.org/2000/svg" p-id="1543">            <path d="M941.248 352L672 82.752A64 64 0 0 0 626.752 64H128a64 64 0 0 0-64 64v768a64 64 0 0 0 64 64h768a64 64 0 0 0 64-64V397.248A64 64 0 0 0 941.248 352zM256 128h48v160H256V128z m112 0H512v160h-144V128zM256 896v-192h512v192H256z m640 0h-64v-224a32 32 0 0 0-32-32H224a32 32 0 0 0-32 32v224H128V128h64v192a32 32 0 0 0 32 32h320a32 32 0 0 0 32-32V128h50.752L896 397.248V896z"                p-id="1544"></path>        </svg>',
            text: "保存",
            index: 10,
            color: "darkslategray",
            click: "main.toolbar.save()",
            split: false
        });

        for (var i = 0; i < menus.length; i++) {
            var menu = menus[i];

            var link = "<a href=\"javascript:void(0)\" class=\"tools_btn\" ";
            link += "onclick=\"" + menu.click + "\"";
            link += "style=\"color:";
            link += menu.color;
            link += "\">            <span>";
            link += menu.svg;
            link += "<b>";
            link += menu.text;
            link += "</b></span></a>";

            if (menu.split) {
                link += "<div class=\"tools_separator\"></div>";
            }

            $(".partialButton").append(link);
        }
    };

    /**
     * 工具栏事件
     */
    main.toolbar = {
        new: function () {
            main.event = "control";
            window.location.href = "/";
        },
        del: function () {
            if (main.cacheObjs.length == 0) {
                layer.msg("请选选择需要删除的模型", { icon: 0 });
            } else {
                for (var n = main.cacheObjs.length - 1; n >= 0; n--) {
                    var model = main.cacheObjs[n];
                    dgis3d.scene.remove(model.mesh);
                    main.cacheObjs.splice(n, 1);
                    dgis3d.render();

                    for (var i = 0; i < main.datas.length; i++) {
                        if (main.datas[i].name == model.name) {
                            main.datas.splice(i, 1);
                            break;
                        }
                    }
                }

            }
        },
        slt: function () {
            main.event = "select";
        },
        move: function () {
            main.event = "move";
        },
        control: function () {
            main.event = "control";
        },
        view: function () {
            main.viewType++;
            if (main.viewType > 2)
                main.viewType = 0;
            dgis3d.view(main.viewType);
            main.orbitControls.update();
        },
        save: function () {
            var data = {
                json: JSON.stringify(main.datas),
                uid: common.getUrlParam("id"),
                email: "xdfsfds"
            };
            syncRequest.post("/webapi/model/save", data, function (e) {
                if (e.Success) {
                    var uid = e.Content;
                    layer.msg("保存模型成功，即将跳转至您的模型页面，请注意收藏改页面", { icon: 1 });
                    setTimeout(function () {
                        window.location.href = "/?id=" + uid;
                    }, 2000);
                } else {
                    layer.msg("保存模型失败", { icon: 2 });
                }
            });
        }
    };

    /**
     * 初始化模型控件
     */
    main.initModels = function () {
        var models = [];
        models.push({
            type: "box",
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9905"><path d="M42.669227 213.335893l469.330773-213.335893 469.330773 213.335893 0 597.328213-469.330773 213.335893-469.330773-213.335893 0-597.328213zM469.341013 453.99156l-341.333333-154.98954 0 456.653907 341.333333 155.337693 0-456.98158zM895.99232 755.655927l0-456.653907-341.333333 154.98954 0 456.98158zM826.668907 236.662147l-314.668907-142.9885-314.668907 142.9885 314.668907 142.9885z" p-id="9906"></path></svg>',
            text: "立方体",
            url: "/pages/modeling/box.html"
        });
        models.push({
            type: "cylinder",
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11164"><path d="M512 384C257.567804 384 0 318.048192 0 192.000361 0 65.951808 257.567804 0 512 0c254.431473 0 512 65.951808 512 192.000361 0 126.047831-257.568527 191.999639-512 191.999639z m0-319.999639c-273.471984 0-448.000361 75.808021-448.000361 128S238.528016 320.000361 512 320.000361s447.999639-75.808021 447.999639-128S785.471984 64.000361 512 64.000361zM512 1024C257.567804 1024 0 958.048192 0 832.000361h64.000361c0 52.191257 174.527655 128 448.000361 128 273.471984 0 447.999639-75.808743 447.999639-128h64.000361c-0.000722 126.047831-257.569249 191.999639-512.000722 191.999639zM959.999639 192.000361h64.000361v640h-64.000361zM0 192.000361h64.000361v640H0z" p-id="11165"></path></svg>',
            text: "柱状体",
            url: "/pages/modeling/cylinder.html"
        });
        models.push({
            type: "obj",
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10596"><path d="M1017.6 781.8c-1.2 8.2-3.2 16.2-6.2 22.4-5.4 11-10.6 12-31 11-26.4-1.2-64.2 0-104.2 1.6 0 11 0.4 16.2 0.4 16.2 2.6 30.2 16.2 31.2 21.6 31.2 6 0 78.4 0 86 0s14.6 0 20-3.6c7-4.6 10-18 12.6-41.4 0.4-3.4 0.6-7.8 0.8-13 0 0 0-0.2 0-0.2 0-1.6 0.2-3.6 0.2-5.8 0-0.8 0-1.6 0-2.2 0 0 0 0 0 0C1017.8 792.6 1017.8 786.6 1017.6 781.8zM6 781.8c1.2 8.2 3.2 16.2 6.2 22.4 5.4 11 10.6 12 31 11 26.4-1.2 64.2 0 104.2 1.6 0 11-0.4 16.2-0.4 16.2-2.6 30.2-16.2 31.2-21.6 31.2-6 0-78.4 0-86 0s-14 0-20-3.6c-7.2-4.2-10-18-12.6-41.4-0.4-3.4-0.6-7.8-0.8-13 0 0 0-0.2 0-0.2 0-1.6-0.2-3.6-0.2-5.8 0-0.8 0-1.6 0-2.2 0 0 0 0 0 0C6 792.6 6 786.6 6 781.8zM1024 593.2c0-61.4-8-121.4-11.2-128-2.4-4.8-17.8-17.4-52.8-41.2-35.4-24.2-34.6-20.6-41-36.4 5.8-1.8 11.4-5.2 14.8-5.6 7.6-0.8 8 6.4 23.8 6.4s50-4.2 57-11.2c7-7 9.2-9.4 9.2-15.6s-3.6-19-10.4-26.6-35.8-11.4-52.8-13.6-19.4 0-23.8 2.8c-7 4.4-7.4 44.6-7.4 44.6l-16.6 0.4c-10.8-26.6-25.8-80.2-49.2-122.4-25.6-46-52.4-60.4-63.6-64-11-3.4-21-5.8-96-13.4-76.6-8-137.6-9-192-9s-115.4 1.2-192 9c-75 7.8-85 10-96 13.4-11 3.4-38 18-63.6 64-23.4 42.2-38.4 95.8-49.2 122.4l-16.6-0.4c0 0-0.2-40.2-7.4-44.6-4.4-2.8-6.8-5.2-23.8-2.8s-46 6-52.8 13.6-10.4 20.4-10.4 26.6 2.2 8.8 9.2 15.6c7 7 41.2 11.2 57 11.2s16.2-7.2 23.8-6.4c3.4 0.4 9.2 3.8 14.8 5.6-6.6 15.8-5.6 12.2-41 36.4-35 24-50.6 36.4-52.8 41.2C8 471.8 0 531.8 0 593.2s4.4 116.6 4.4 136.2c0 8.2 0 22.6 1.8 36.4 1.2 8.2 3 16.2 6.2 22.4 5.4 11 10.4 12 31 11 26.4-1.2 64.6 0 104 1.6 26.4 1 53.4 2 77.4 2.6 60 1.2 42.4-8.8 68-8.4 25.6 0.4 126.6 4.6 219 4.6s193.6-4.2 219-4.6c25.6-0.4 8 9.6 68 8.4 24-0.4 51-1.6 77.4-2.6 39.4-1.4 77.8-2.8 104-1.6 20.6 1 25.6 0 31-11 3-6.2 5-14.2 6.2-22.4 2-13.8 1.8-28.2 1.8-36.4C1019.6 710 1024 654.6 1024 593.2zM172.4 290.4c9.6-22.4 38.4-67.4 52.4-75.4 3.4-2 33.2-11.4 107.8-16.4 68.6-4.6 144.4-6.4 179.6-6.4s111 1.8 179.6 6.4c74.4 5 104.6 14.2 107.8 16.4 18 12.4 42.8 53 52.4 75.4 9.6 22.4 22.4 66.4 20 72.4-2.4 6 2.4 9-30 6.4-32.2-2.4-234.4-5-329.6-5-95 0-297.2 2.6-329.6 5-32.4 2.4-27.6-0.4-30-6.4C150 356.8 162.8 313 172.4 290.4zM246 540.8c-14.4 3.6-23 11.4-41 11.2-18 0-66.6-8.2-77-8.6-10.4-0.4-19.6 7-25 8.4s-16-2.4-32-7.4-25.4-3.6-30.6-25.4c-5.4-21.6 0-52.6 0-52.6 34.6-1.6 68 1.6 130.6 19.2 62.6 17.6 97.4 51.4 97.4 51.4S260.4 537.2 246 540.8zM716.4 698.4c-28.6 3.8-148.4 4.8-204.4 4.8-56 0-175.8-1.2-204.4-4.8-29.2-3.8-67.2-38.8-41-66.6 35.4-37.8 28.8-36.6 109.2-47 69.6-9 122.4-9.4 136.2-9.4 13.6 0 66.6 0.6 136.2 9.4 80.4 10.4 73.8 9.2 109.2 47C783.6 659.6 745.6 694.6 716.4 698.4zM983.6 519.2c-5.4 21.6-14.6 20.4-30.6 25.4s-26.6 8.6-32 7.4-14.6-8.6-25-8.4c-10.4 0.4-59 8.6-77 8.6-18 0-26.6-7.6-41-11.2-14.4-3.6-22.4-3.6-22.4-3.6s34.6-34 97.4-51.4c62.6-17.6 96-20.8 130.6-19.2C983.6 466.4 989 497.4 983.6 519.2z" p-id="10597"></path></svg>',
            text: "外部模型",
            url: "/pages/modeling/obj.html"
        });
        models.push({
            type: "light",
            svg: '<svg class="icon" style="vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11319"><path d="M389.12 930.048c-19.84 0-35.072-13.888-35.072-30.976s15.232-30.976 35.072-30.976h245.76c19.84 0 35.072 13.888 35.072 30.976s-15.232 30.976-35.072 30.976H389.12z m28.16 31.04h189.44c17.472 0 31.616 13.824 31.616 30.976a31.296 31.296 0 0 1-31.552 30.976H417.216a31.296 31.296 0 0 1-31.552-30.976c0-17.152 14.08-30.976 31.552-30.976zM512 837.12c-191.936 0-347.52-152.64-347.52-340.864S320.064 155.392 512 155.392c191.936 0 347.52 152.64 347.52 340.864S703.936 837.12 512 837.12z m0-61.952c157.056 0 284.352-124.864 284.352-278.912 0-153.984-127.36-278.848-284.352-278.848-157.056 0-284.352 124.8-284.352 278.848S355.008 775.168 512 775.168zM511.552 0.512c8.32 0 16.384 3.2 22.336 9.024a30.72 30.72 0 0 1 9.216 21.952v61.952a31.296 31.296 0 0 1-31.552 30.976 31.296 31.296 0 0 1-31.616-30.976V31.488a30.72 30.72 0 0 1 9.28-21.952 31.936 31.936 0 0 1 22.336-9.024z m368.576 149.76a30.592 30.592 0 0 1 0 43.776l-44.672 43.84a32 32 0 0 1-30.72 8.448 31.296 31.296 0 0 1-22.592-22.144 30.592 30.592 0 0 1 8.64-30.08l44.672-43.84a32 32 0 0 1 44.672 0z m143.68 361.472a31.296 31.296 0 0 1-31.616 30.976h-63.168a31.296 31.296 0 0 1-31.616-30.976c0-17.088 14.144-30.976 31.616-30.976h63.168c8.32 0 16.384 3.264 22.336 9.088a30.72 30.72 0 0 1 9.28 21.888z m-1023.616 0a30.72 30.72 0 0 1 9.28-21.888 31.936 31.936 0 0 1 22.4-9.088h63.104c17.472 0 31.616 13.888 31.616 30.976a31.296 31.296 0 0 1-31.616 30.976H31.808a31.296 31.296 0 0 1-31.616-30.976z m142.72-361.472a32 32 0 0 1 44.736 0l44.672 43.776a30.592 30.592 0 0 1-0.384 43.456 32 32 0 0 1-44.288 0.384l-44.672-43.84a30.592 30.592 0 0 1 0-43.776z" p-id="11320"></path></svg>',
            text: "点光",
            url: "/pages/modeling/light.html"
        });

        for (var i = 0; i < models.length; i++) {
            var model = models[i];

            var li = "<li><a href=\"javascript:void(0)\" onclick=\"main.newModel('创建" + model.text + "','" + model.url + "')\">";
            li += model.svg;
            li += "<div>";
            li += model.text;
            li += "</div></a></li>";

            $("#modelsDiv").append(li);
        }

    };

    /**
     * 初始化场景
     */
    main.initScene = function () {
        $("#" + main.sceneDomId).attr({ "width": $(window).width() + "px", "height": $(window).height() + "px" });

        //场景
        dgis3d.init(main.sceneDomId, 900, 650, 100);
        var path = "../assets/images/netroom/";
        var format = ".png";

        //场景背景
        //右左上下前后
        var urls = [
            path + '2' + format, path + '4' + format,
            path + '1' + format, path + '6' + format,
            path + '5' + format, path + '3' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load(urls);
        reflectionCube.format = THREE.RGBFormat;

        /*
        var refractionCube = new THREE.CubeTextureLoader().load(urls);
        refractionCube.mapping = THREE.CubeRefractionMapping;
        refractionCube.format = THREE.RGBFormat;
        */

        dgis3d.scene.background = reflectionCube;

        //控制器
        main.orbitControls = new THREE.OrbitControls(dgis3d.camera, dgis3d.renderer.domElement);
        main.orbitControls.target = new THREE.Vector3(0, 0, 0);//控制焦点
        main.orbitControls.autoRotate = false;//将自动旋转关闭
        main.clock = new THREE.Clock();//用于更新轨道控制器

        //拖拽
        main.dragControls = new THREE.DragControls(dgis3d.scene.children, dgis3d.camera, dgis3d.renderer.domElement);
        main.dragControls.enabled = false;

        //视角固定        
        dgis3d.view(main.viewType);
        main.orbitControls.update();
    };

    main.test = function () {

        main.datas.push({
            name: "floor",
            geometry: {
                type: "box",
                l: 910,
                w: 660,
                h: 4,
                r: 0
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
                z: -4
            }
        });

        for (var i = 0; i < main.datas.length; i++) {
            var mesh = main.buildModel(main.datas[i]);
            dgis3d.scene.add(mesh);
        }
        dgis3d.render();
    }

    /**
     * 新建模型
     * @param {*} title
     * @param {*} url
     */
    main.newModel = function (title, url) {
        layer.open({
            type: 2,
            title: title,
            area: ["350px", "300px"],
            content: url,
            btn: ['确定', '取消'],
            success: function (layero, index) {
                var iframeWin = window[layero.find('iframe')[0]['name']];
                iframeWin.main.init();

                $(".layui-layer").addClass("tech_box").append('<div class="lth corner" style="width: 20px;height: 4px;left: -2px;top:-2px;"></div>        <div class="ltv corner" style="width: 4px;height: 20px;left: -2px;top:-2px;"></div>        <div class="rth corner" style="width: 20px;height: 4px;right: -2px;top:-2px;"></div>        <div class="rtv corner" style="width: 4px;height: 20px;right: -2px;top:-2px;"></div>        <div class="lbh corner" style="width: 20px;height: 4px;left: -2px;bottom:-2px;"></div>        <div class="lbv corner" style="width: 4px;height: 20px;left: -2px;bottom:-2px;"></div>        <div class="rbh corner" style="width: 20px;height: 4px;right: -2px;bottom:-2px;"></div>        <div class="rbv corner" style="width: 4px;height: 20px;right: -2px;bottom:-2px;"></div> ');
            },
            yes: function (index, layero) {
                var iframeWin = window[layero.find('iframe')[0]['name']];
                var data = iframeWin.main.vueObj.Data;
                var mesh = main.buildModel(data);
                dgis3d.scene.add(mesh);
                main.datas.push(data);
                dgis3d.render();

                layer.close(index);
            },
            btn2: function (index, layero) {
                layer.close(index);
            }
        });
    };

    /**
     * 选择模型
     */
    main.selectModel = function (e) {
        var material = dgis3d.material.colorMaterial("red", 0.6, true);
        dgis3d.event.getMesh(e, function (obj) {
            //选中数据
            var selectData = null;
            //将上一次选中的模型颜色还原
            for (var i = 0; i < main.cacheObjs.length; i++) {
                var oldObj = main.cacheObjs[i];
                oldObj.mesh.material = oldObj.material;
            }

            //清空上次模型缓存
            main.cacheObjs = [];

            //选中模型添加渲染
            var cameraPostion;
            if (obj instanceof THREE.Mesh) {
                //普通模型添加缓存
                main.cacheObjs.push({ mesh: obj, material: obj.material });
                //设置选中渲染
                obj.material = material;
                cameraPostion = obj.position;

                selectData = main.syncModelProperty(obj);
            } else {
                //外部模型读取子模型添加缓存
                if (obj != null) {
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            main.cacheObjs.push({ mesh: child, material: child.material });
                            //设置选中渲染
                            child.material = material;
                        }
                    });
                    cameraPostion = obj.parent.position;

                    main.cacheObjs.push({ mesh: obj.parent, material: null });
                    selectData = main.syncModelProperty(obj.parent);
                }
            }

            dgis3d.render();

            //显示属性
            main.showModelProperty(selectData);
        });
    };

    /**
     * 创建模型
     * @param {*} data
     */
    main.buildModel = function (data) {
        //创建结构
        var geometry;
        switch (data.geometry.type) {
            case "box":
                geometry = dgis3d.geometry.box(data.geometry.l, data.geometry.w, data.geometry.h);
                break;
            case "cylinder":
                geometry = dgis3d.geometry.cylinder(data.geometry.r, data.geometry.h);
                break;
            case "obj":
                dgis3d.geometry.model(data.geometry.l, data.geometry.w, data.geometry.h, data.material.path + ".mtl", data.material.path + ".obj", data.angle, data.position, function (obj) {
                    obj.name = data.name;
                    dgis3d.scene.add(obj);
                    dgis3d.render();
                });
                return;
                break;
        }

        //创建纹理
        var material;
        switch (data.material.type) {
            case "img":
                material = dgis3d.material.bitmapMaterial(data.material.path, data.material.opacity, data.material.repeat[0], data.material.repeat[1]);
                break;
            case "color":
                material = dgis3d.material.colorMaterial(data.material.color, data.material.opacity, data.material.reflect);
                break;
        }

        if (geometry != null) {
            //创建模型
            var mesh = new THREE.Mesh(geometry, material);

            //旋转模型
            mesh.rotation.set(data.angle.x, data.angle.y, data.angle.z);

            //计算相对位置
            var pt = dgis3d.geometry.getPosition(data.position, data.geometry.l, data.geometry.w, data.geometry.h);
            mesh.position.set(pt.x, pt.y, pt.z);
            mesh.name = data.name;

            return mesh;

        }
    };

    /**
     * 显示属性
     * @param {*} data
     */
    main.showModelProperty = function (data) {
        $(".right_div").css("display", (data == null) ? "none" : "block");
        if (data == null)
            return;

        //显示基本属性
        var url = "";
        switch (data.geometry.type) {
            case "box":
                url = "/pages/modeling/box.html";
                break;
            case "cylinder":
                url = "/pages/modeling/cylinder.html";
                break;
            case "obj":
                url = "/pages/modeling/obj.html";
                break;
        }

        //显示基本属性
        var iframe = document.getElementById("geometryIframe");
        iframe.src = url;
        if (iframe.attachEvent) {
            iframe.attachEvent("onload", function () {
                window.frames["geometryIframe"].contentWindow.main.init(data);
            });
        } else {
            iframe.onload = function () {
                window.frames["geometryIframe"].contentWindow.main.init(data);
            };
        }

        //显示材质属性
        window.frames["materialIframe"].contentWindow.main.init(data);
    };

    /**
     * 修改模型属性
     * @param {*} data
     */
    main.changeModelProperty = function (data) {
        if (main.cacheObjs.length > 0) {
            //删除旧模型
            for (var i = 0; i < main.cacheObjs.length; i++) {
                var model = main.cacheObjs[i].mesh;
                if (model.name == data.name) {
                    dgis3d.scene.remove(model);
                    main.cacheObjs.splice(i, 1);
                    break;
                }
            }

            //创建新模型
            var newModel = main.buildModel(data);
            if (newModel != null) {
                dgis3d.scene.add(newModel);
                main.cacheObjs.push({
                    mesh: newModel,
                    material: newModel.material
                });
            }

            //缓存替换
            var oldData = common.getItemInItems(main.datas, "name", data.name);
            oldData = data;
        }
    };

    /**
     * 同步模型属性
     * @param {*} model
     */
    main.syncModelProperty = function (model) {
        //找到旧数据
        var data = common.getItemInItems(main.datas, "name", model.name);

        //分类获取模型尺寸
        if (model.geometry instanceof THREE.BoxGeometry) {
            //box模型
            var box = new THREE.Box3();
            box.expandByObject(model);

            var length = box.max.x - box.min.x;
            var width = box.max.z - box.min.z;
            var height = box.max.y - box.min.y;

            data.geometry.l = length;
            data.geometry.w = width;
            data.geometry.h = height;
        } else if (model.geometry instanceof THREE.CylinderGeometry) {
            var length = model.geometry.parameters.height;
            var r = model.geometry.parameters.radialSegments;

            data.geometry.l = r * 2;
            data.geometry.w = r * 2;
            data.geometry.h = length;

            data.geometry.r = r;
        }

        //获取位置
        var position = model.position;
        position = dgis3d.geometry.restorePositon(position, data.geometry.l, data.geometry.w, data.geometry.h);
        data.position = position;

        return data;
    };

    return main;
});