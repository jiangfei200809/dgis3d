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
                var cameraPostion;
                if (obj instanceof THREE.Mesh) {
                    //普通模型添加缓存
                    main.cacheObjs.push({ mesh: obj, material: obj.material });
                    //设置选中渲染
                    obj.material = material;
                    cameraPostion = obj.position;
                } else {
                    //外部模型读取子模型添加缓存
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            main.cacheObjs.push({ mesh: child, material: child.material });
                            //设置选中渲染
                            child.material = material;
                        }
                    });
                    cameraPostion = obj.parent.position;
                }
                //跳转到选中模型
                TweenMax.to(dgis3d.camera.position, 1, {
                    x: cameraPostion.x + 10,
                    y: cameraPostion.y + 10,
                    z: cameraPostion.z - 10,
                    ease: Expo.easeInOut,
                    onComplete: function () { }
                })

                dgis3d.render();

            });
        });
    };

    main.buildModel = function (data) {
        //创建结构
        var geometry;
        switch (data.geometry.type) {
            case "box":
                geometry = dgis3d.geometry.box(data.geometry.l, data.geometry.w, data.geometry.h);
                break;
            case "cylinder":
                geometry = dgis3d.geometry.cylinder(data.geometry.r, data.geometry.l);
                break;
            case "obj":
                dgis3d.geometry.model(data.geometry.l, data.geometry.w, data.geometry.h, data.material.path + ".mtl", data.material.path + ".obj", data.angle, data.position, function (obj) {
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
                material = dgis3d.material.bitmapMaterial(data.material.path, data.material.repeat[0], data.material.repeat[1]);
                break;
            case "color":
                material = dgis3d.material.colorMaterial(data.material.color, data.material.opacity, data.material.reflect);
                break;
        }

        if (geometry != null) {
            //创建模型
            var mesh = new THREE.Mesh(geometry, material);

            //计算相对位置
            var pt = dgis3d.geometry.getPosition(data.position, data.geometry.l, data.geometry.w, data.geometry.h);
            mesh.position.set(pt.x, pt.y, pt.z);

            return mesh;

        }
    };

    main.floor = function () {
        var data = {
            geometry: {
                type: "box",
                l: 910,
                w: 660,
                h: 4,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/floor.jpg",
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
                z: -4
            }
        };

        var mesh = main.buildModel(data);

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


        var datas = [];
        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 220,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
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
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 280,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 0,
                y: 370,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 900,
                w: 5,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
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
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 130,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 250,
                y: 0,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 10,
                w: 5,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 250,
                y: 130,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 130,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 350,
                y: 0,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 60,
                w: 5,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 295,
                y: 130,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 130,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 710,
                y: 0,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 15,
                w: 5,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 700,
                y: 130,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 390,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 900,
                y: 0,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 20,
                w: 20,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 890,
                y: 390,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 480,
                w: 5,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 0,
                y: 650,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 20,
                w: 20,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 480,
                y: 640,
                z: 0
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 230,
                h: 100,
                r: 0
            },
            material: {
                type: "img",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/images/netroom/wall.jpg",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 250,
                y: 420,
                z: 0
            }
        });

        var h = 100;

        //砖墙
        for (var i = 0; i < datas.length; i++) {
            var mesh = main.buildModel(datas[i]);
            dgis3d.scene.add(mesh);
        }

        //玻璃墙墩
        datas = [];
        datas.push({
            geometry: {
                type: "box",
                l: 405,
                w: 5,
                h: 30,
                r: 0
            },
            material: {
                type: "color",
                color: "#8a96a6",
                opacity: 1,
                reflect: false,
                path: "",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 500,
                y: 650,
                z: 0
            }
        });
        datas.push({
            geometry: {
                type: "box",
                l: 5,
                w: 240,
                h: 30,
                r: 0
            },
            material: {
                type: "color",
                color: "#8a96a6",
                opacity: 1,
                reflect: false,
                path: "",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 900,
                y: 410,
                z: 0
            }
        });
        for (var i = 0; i < datas.length; i++) {
            var mesh = main.buildModel(datas[i]);
            dgis3d.scene.add(mesh);
        }


        //外围玻璃墙
        datas = [];
        datas.push({
            geometry: {
                type: "box",
                l: 400,
                w: 3,
                h: 70,
                r: 0
            },
            material: {
                type: "color",
                color: "#2184be",
                opacity: 0.5,
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
                x: 500,
                y: 651,
                z: 20
            }
        });

        datas.push({
            geometry: {
                type: "box",
                l: 3,
                w: 240,
                h: 70,
                r: 0
            },
            material: {
                type: "color",
                color: "#2184be",
                opacity: 0.5,
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
                x: 899,
                y: 410,
                z: 20
            }
        });
        for (var i = 0; i < datas.length; i++) {
            var mesh = main.buildModel(datas[i]);
            dgis3d.scene.add(mesh);
        }

    };

    main.desktop = function () {
        var datas = [];
        datas.push({
            geometry: {
                type: "obj",
                l: 70,
                w: 30,
                h: 40,
                r: 0
            },
            material: {
                type: "obj",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/models/desktop/desk/desk",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 400,
                y: 50,
                z: 5
            }
        });

        datas.push({
            geometry: {
                type: "obj",
                l: 70,
                w: 30,
                h: 40,
                r: 0
            },
            material: {
                type: "obj",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/models/desktop/desk/desk",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: 0,
                z: 0
            },
            position: {
                x: 470,
                y: 50,
                z: 5
            }
        });

        datas.push({
            geometry: {
                type: "obj",
                l: 30,
                w: 30,
                h: 50,
                r: 0
            },
            material: {
                type: "obj",
                color: "",
                opacity: 1,
                reflect: true,
                path: "../assets/models/desktop/chair/chair",
                repeat: [1, 1]
            },
            angle: {
                x: 0,
                y: Math.PI / 2,
                z: 0
            },
            position: {
                x: 420,
                y: 85,
                z: 5
            }
        });

        for (var i = 0; i < datas.length; i++) {
            var mesh = main.buildModel(datas[i]);
            if(mesh!=null)
                dgis3d.scene.add(mesh);
        }


        return;
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