define(["/assets/modules/dgis3d"], function (dgis3d) {
    var main = {
        init: null,
        orbitControls: null,
        clock: null,
        cacheObjs: []
    };

    main.init = function (domId) {
        $(document).ready(function () {
            $("#" + domId).attr({ "width": $(window).width() + "px", "height": $(window).height() + "px" });

            //场景
            dgis3d.init(domId, 900, 650, 100);
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
            main.orbitControls.target = new THREE.Vector3(10, 0, 10);//控制焦点
            main.orbitControls.autoRotate = false;//将自动旋转关闭
            main.clock = new THREE.Clock();//用于更新轨道控制器



            //加载场景
            main.floor();

            main.wall();

            main.desktop();

            main.light();

            /*
            var dragControls = new THREE.DragControls( dgis3d.scene.children, dgis3d.camera, dgis3d.renderer.domElement );
				dragControls.addEventListener( 'dragstart', function () {

					main.orbitControls.enabled = false;

				} );
				dragControls.addEventListener( 'dragend', function () {

					main.orbitControls.enabled = true;

                } );                
                */
        }).on("dblclick", function (e) {
            var material = dgis3d.material.colorMaterial("red", 0.6, true);
            dgis3d.event.getMesh(e, function (obj) {
                //将上一次选中的模型颜色还原
                for (var i = 0; i < main.cacheObjs.length; i++) {
                    var oldObj = main.cacheObjs[i];
                    oldObj.mesh.material = oldObj.material;
                }

                //清空上次模型缓存
                main.cacheObjs = [];

                //选中模型添加渲染
                if (obj instanceof THREE.Mesh) {
                    //普通模型添加缓存
                    main.cacheObjs.push({ mesh: obj, material: obj.material });
                    //设置选中渲染
                    obj.material = material;
                } else {
                    //外部模型读取子模型添加缓存
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            main.cacheObjs.push({ mesh: child, material: child.material });
                            //设置选中渲染
                            child.material = material;
                        }
                    });
                }


                dgis3d.render();

            });
        });
    };

    main.floor = function () {
        var geo = dgis3d.geometry.box(910, 660, 4);
        var material = dgis3d.material.bitmapMaterial("../assets/images/netroom/floor.jpg", 36, 26);

        var mesh = new THREE.Mesh(geo, material);

        var pt = dgis3d.geometry.getPosition({ x: 0, y: 0, z: -4 }, 910, 660, 4);
        mesh.position.set(pt.x, pt.y, pt.z);

        dgis3d.scene.add(mesh);
        dgis3d.render();
    };

    main.wall = function () {
        /*var points=[];
        points.push({x:0,y:220});
        points.push({x:0,y:0});
        points.push({x:900,y:0});
        points.push({x:900,y:390});
        points.push({x:910,y:390});
        points.push({x:910,y:410});
        points.push({x:890,y:410});
        points.push({x:890,y:385});
        points.push({x:890,y:5});
        points.push({x:5,y:5});
        points.push({x:5,y:220});
        points.push({x:0,y:220});

        var geo=dgis3d.geometry.polygon(points);
        geo=dgis3d.geometry.extrudeShape(geo,100);
        var material = dgis3d.material.bitmapMaterial("../assets/images/netroom/wall.jpg",1,1);
        var mesh= new THREE.Mesh(geo,material);
        mesh=mesh.rotateX(Math.PI/2);
        var position=dgis3d.geometry.getPosition({ x: -910/2, y: -410/2, z: 50+4 }, 910, 410, 100);
        mesh.position.set(position.x, position.y, position.z);
        mesh.updateMatrix();

        dgis3d.scene.add(mesh);
        dgis3d.render();*/

        var h = 100;

        //砖墙
        var meshs = [];
        var wWallGeo1 = dgis3d.geometry.box(5, 220, h);
        var wWallMesh1 = dgis3d.geometry.mesh(wWallGeo1, { x: 0, y: 0, z: 0 }, null);
        meshs.push(wWallMesh1);

        var wWallGeo2 = dgis3d.geometry.box(5, 280, h);
        var wWallMesh2 = dgis3d.geometry.mesh(wWallGeo2, { x: 0, y: 370, z: 0 }, null);
        meshs.push(wWallMesh2);

        var nWallGeo = dgis3d.geometry.box(900, 5, h);
        var nWallMesh = dgis3d.geometry.mesh(nWallGeo, { x: 0, y: 0, z: 0 }, null);
        meshs.push(nWallMesh);

        var nWallMesh1 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 130, h), { x: 250, y: 0, z: 0 }, null);
        meshs.push(nWallMesh1);

        var nWallMesh2 = dgis3d.geometry.mesh(dgis3d.geometry.box(10, 5, h), { x: 250, y: 130, z: 0 }, null);
        meshs.push(nWallMesh2);

        var nWallMesh3 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 130, h), { x: 350, y: 0, z: 0 }, null);
        meshs.push(nWallMesh3);

        var nWallMesh4 = dgis3d.geometry.mesh(dgis3d.geometry.box(60, 5, h), { x: 295, y: 130, z: 0 }, null);
        meshs.push(nWallMesh4);

        var nWallMesh5 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 130, h), { x: 710, y: 0, z: 0 }, null);
        meshs.push(nWallMesh5);

        var nWallMesh6 = dgis3d.geometry.mesh(dgis3d.geometry.box(15, 5, h), { x: 700, y: 130, z: 0 }, null);
        meshs.push(nWallMesh6);

        var eWallGeo1 = dgis3d.geometry.box(5, 390, h);
        var eWallMesh1 = dgis3d.geometry.mesh(eWallGeo1, { x: 900, y: 0, z: 0 }, null);
        meshs.push(eWallMesh1);

        var eWallBoxGeo = dgis3d.geometry.box(20, 20, h);
        var eWallBoxMesh = dgis3d.geometry.mesh(eWallBoxGeo, { x: 890, y: 390, z: 0 }, null);
        meshs.push(eWallBoxMesh);

        var sWallGeo = dgis3d.geometry.box(480, 0, h);
        var sWallMesh = dgis3d.geometry.mesh(sWallGeo, { x: 0, y: 650, z: 0 });
        meshs.push(sWallMesh);

        var sWallBoxGeo = dgis3d.geometry.box(20, 20, h);
        var sWallBoxMesh = dgis3d.geometry.mesh(sWallBoxGeo, { x: 480, y: 640, z: 0 }, null);
        meshs.push(sWallBoxMesh);

        var sWallBoxMesh1 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 230, h), { x: 250, y: 420, z: 0 }, null);
        meshs.push(sWallBoxMesh1);

        var bitmaps = [];
        for (var i = 0; i < 6; i++) {
            var bitmap = {
                bitmapPath: "../assets/images/netroom/wall.jpg",
                repeatX: 1,
                repeatY: 1,
                visible: i != 2 && i != 3,
                color: "#ccc"
            }
            bitmaps.push(bitmap);
        }

        var geometry = dgis3d.geometry.mergeBox(meshs);
        var material = dgis3d.material.bitmapsMaterial(bitmaps);
        var mesh = new THREE.Mesh(geometry, material);
        dgis3d.scene.add(mesh);

        //外围玻璃墙墩
        var wallBottomMaterial = dgis3d.material.colorMaterial("#6c7682", 1, true);

        var sGlassBottomGeo = dgis3d.geometry.box(405, 5, 30);
        var sGlassBottomMesh = dgis3d.geometry.mesh(sGlassBottomGeo, { x: 500, y: 650, z: 0 }, wallBottomMaterial);
        dgis3d.scene.add(sGlassBottomMesh);

        var eGlassBottomGeo = dgis3d.geometry.box(5, 240, 30);
        var eGlassBottomMesh = dgis3d.geometry.mesh(eGlassBottomGeo, { x: 900, y: 410, z: 0 }, wallBottomMaterial);
        dgis3d.scene.add(eGlassBottomMesh);


        //外围玻璃墙
        var glassMaterial = dgis3d.material.colorMaterial("#2184be", 0.5, true);

        var sGlassGeo = dgis3d.geometry.box(400, 3, h - 30);
        var sGlassMesh = dgis3d.geometry.mesh(sGlassGeo, { x: 500, y: 651, z: 20 }, glassMaterial);
        dgis3d.scene.add(sGlassMesh);

        var eGlassGeo = dgis3d.geometry.box(3, 240, h - 30);
        var eGlassMesh = dgis3d.geometry.mesh(eGlassGeo, { x: 899, y: 410, z: 20 }, glassMaterial);
        dgis3d.scene.add(eGlassMesh);

        //中间玻璃墙墩
        var midGlassBottomMeshs = [];

        var midGlassBottomGeo1 = dgis3d.geometry.box(540, 5, 5);
        var midGlassBottomMesh1 = dgis3d.geometry.mesh(midGlassBottomGeo1, { x: 360, y: 290, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh1);

        var midGlassBottomGeo2 = dgis3d.geometry.box(5, 120, 5);
        var midGlassBottomMesh2 = dgis3d.geometry.mesh(midGlassBottomGeo2, { x: 355, y: 290, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh2);

        var midGlassBottomGeo3 = dgis3d.geometry.box(10, 5, 5);
        var midGlassBottomMesh3 = dgis3d.geometry.mesh(midGlassBottomGeo3, { x: 350, y: 410, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh3);

        var midGlassBottomMesh4 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 110, 5), { x: 490, y: 530, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh4);

        var midGlassBottomMesh5 = dgis3d.geometry.mesh(dgis3d.geometry.box(135, 5, 5), { x: 355, y: 530, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh5);

        var midGlassBottomMesh6 = dgis3d.geometry.mesh(dgis3d.geometry.box(15, 5, 5), { x: 250, y: 530, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh6);

        var midGlassBottomMesh7 = dgis3d.geometry.mesh(dgis3d.geometry.box(15, 5, 5), { x: 350, y: 130, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh7);

        var midGlassBottomMesh8 = dgis3d.geometry.mesh(dgis3d.geometry.box(200, 5, 5), { x: 415, y: 130, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh8);

        var midGlassBottomMesh9 = dgis3d.geometry.mesh(dgis3d.geometry.box(5, 40, 5), { x: 615, y: 95, z: 0 }, wallBottomMaterial);
        midGlassBottomMeshs.push(midGlassBottomMesh9);

        var glassBottomGeometry = dgis3d.geometry.mergeBox(midGlassBottomMeshs);
        var glassBottomMesh = new THREE.Mesh(glassBottomGeometry, wallBottomMaterial);
        dgis3d.scene.add(glassBottomMesh);


        //中间玻璃墙
        var midGlassMeshs = [];

        var midGlassGeo1 = dgis3d.geometry.box(540, 3, h - 5);
        var midGlassMesh1 = dgis3d.geometry.mesh(midGlassGeo1, { x: 360, y: 291, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh1);

        var midGlassGeo2 = dgis3d.geometry.box(3, 120, h - 5);
        var midGlassMesh2 = dgis3d.geometry.mesh(midGlassGeo2, { x: 357, y: 291, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh2);

        var midGlassGeo3 = dgis3d.geometry.box(10, 3, h - 5);
        var midGlassMesh3 = dgis3d.geometry.mesh(midGlassGeo3, { x: 350, y: 411, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh3);

        var midGlassMesh4 = dgis3d.geometry.mesh(dgis3d.geometry.box(200, 1, h - 5), { x: 415, y: 130, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh4);

        var midGlassMesh5 = dgis3d.geometry.mesh(dgis3d.geometry.box(1, 35, h - 5), { x: 615, y: 99, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh5);

        var midGlassMesh6 = dgis3d.geometry.mesh(dgis3d.geometry.box(1, 108, h - 5), { x: 490, y: 532, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh6);

        var midGlassMesh7 = dgis3d.geometry.mesh(dgis3d.geometry.box(137, 1, h - 5), { x: 355, y: 532, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh7);

        var midGlassMesh8 = dgis3d.geometry.mesh(dgis3d.geometry.box(10, 1, h - 5), { x: 255, y: 532, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh8);

        var midGlassMesh9 = dgis3d.geometry.mesh(dgis3d.geometry.box(10, 1, h - 5), { x: 355, y: 132, z: 5 }, glassMaterial);
        midGlassMeshs.push(midGlassMesh9);


        var glassGeometry = dgis3d.geometry.mergeBox(midGlassMeshs);
        var glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        dgis3d.scene.add(glassMesh);

        //

        dgis3d.render();
    };

    main.desktop = function () {
        dgis3d.geometry.model(70, 30, 40, "../assets/models/desktop/desk/desk.mtl", "../assets/models/desktop/desk/desk.obj", 0, 0, 0, { x: 400, y: 50, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });
        dgis3d.geometry.model(70, 30, 40, "../assets/models/desktop/desk/desk.mtl", "../assets/models/desktop/desk/desk.obj", 0, 0, 0, { x: 470, y: 50, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });
        dgis3d.geometry.model(70, 30, 40, "../assets/models/desktop/desk/desk.mtl", "../assets/models/desktop/desk/desk.obj", 0, 0, 0, { x: 540, y: 50, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(30, 30, 50, "../assets/models/desktop/chair/chair.mtl", "../assets/models/desktop/chair/chair.obj", 0, Math.PI / 2, 0, { x: 420, y: 85, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(30, 30, 50, "../assets/models/desktop/chair/chair.mtl", "../assets/models/desktop/chair/chair.obj", 0, Math.PI / 2, 0, { x: 490, y: 85, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(30, 30, 50, "../assets/models/desktop/chair/chair.mtl", "../assets/models/desktop/chair/chair.obj", 0, Math.PI / 2, 0, { x: 560, y: 85, z: 5 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(10, 15, 10, "../assets/models/pc/macbook/macbook.mtl", "../assets/models/pc/macbook/macbook.obj", 0, Math.PI / 2, 0, { x: 430, y: 60, z: 45 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(20, 15, 15, "../assets/models/pc/mac/mac.mtl", "../assets/models/pc/mac/mac.obj", 0, 0, 0, { x: 495, y: 60, z: 45 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(20, 15, 15, "../assets/models/pc/mac/mac.mtl", "../assets/models/pc/mac/mac.obj", 0, 0, 0, { x: 570, y: 60, z: 45 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });

        dgis3d.geometry.model(5, 15, 5, "../assets/models/camare/hk/hk.mtl", "../assets/models/camare/hk/hk.obj", Math.PI / 4, Math.PI / 4, 0, { x: 8, y: 5, z: 80 }, function (obj) {
            dgis3d.scene.add(obj);
            dgis3d.render();
        });


    };

    main.light = function () {
        dgis3d.scene.add(dgis3d.light.pointLight({ x: 250, y: 300, z: 200 }, "white", 1, 500));
        dgis3d.scene.add(dgis3d.light.pointLight({ x: 600, y: 300, z: 200 }, "white", 1, 500));
        dgis3d.render();
    };

    return main;

});