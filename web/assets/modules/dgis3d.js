define(function () {
    var main = {
        renderer: null,
        scene: null,
        camera: null,

        sceneRange: null
    };

    /**
     * 初始化
     * @param {*} domId canvasId
     * @param {*} maxL 场景长度
     * @param {*} maxW 场景宽度
     * @param {*} maxH 场景高度
     */
    main.init = function (domId, maxL, maxW, maxH) {
        main.sceneRange = {
            l: maxL,
            w: maxW,
            h: maxH
        };

        main.scene = new THREE.Scene(); // 创建场景

        var dom = document.getElementById(domId);
        var width = dom.offsetWidth;
        var height = dom.offsetHeight;
        main.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10000000);
        main.camera.up = new THREE.Vector3(0, 1, 0)
        //var pt = main.geometry.getPosition({ x: maxL / 2, y: maxW, z: maxH }, maxL, maxW, maxH);

        //俯视图
        main.camera.lookAt({
            x: 0,
            y: 0,
            z: 0
        });
        //main.camera.position.set(0, maxH*10, 0);

        var light = new THREE.AmbientLight("#ccc");

        main.scene.add(light);
        main.scene.add(main.camera);

        main.renderer = new THREE.WebGLRenderer({
            canvas: dom,
            //增加下面两个属性，可以抗锯齿
            /*
            antialias: true,
            alpha: true
            */
        });
        main.renderer.setClearColor("#3d5c94");
        main.renderer.setSize(width, height);
    };

    /**
     * 设置摄像机视图
     * @param {s} type 0:俯视图 1：正视图 2：斜视图
     */
    main.view = function (type) {
        var position = {
            x: 0,
            y: 0,
            z: 0
        };
        switch (type) {
            case 0:
                //main.camera.position.set(0, main.sceneRange.h * 10, 0);
                position.z = main.sceneRange.h * 10;
                break;
            case 1:
                //main.camera.position.set(0, 0, main.sceneRange.w*1 );
                position.y = main.sceneRange.w * 1;
                break;
            case 2:
                //main.camera.position.set(main.sceneRange.l, main.sceneRange.h * 2, main.sceneRange.w);
                position.x = main.sceneRange.l * 1;
                position.y = main.sceneRange.w * 1;
                position.z = main.sceneRange.h * 2;
                break;
        }

        var pt = main.geometry.getPosition(position, main.sceneRange.l, main.sceneRange.w, main.sceneRange.h);
        main.camera.position.set(pt.x, pt.y, pt.z);
        main.render();
    };

    /**
     * 材质
     */
    main.material = {
        /**
         * 纯色材质
         *  @param {*} color 颜色
         *  @param {*} opacity 透明度
         *  @param {*} reflect 是否金属质感反射
         */
        colorMaterial: function (color, opacity, reflect) {
            var material;
            if (reflect) {
                material = new THREE.MeshPhongMaterial({
                    color: color,
                    transparent: opacity < 1,
                    opacity: opacity,
                });
            } else {
                material = new THREE.MeshLambertMaterial({
                    color: color,
                    transparent: opacity < 1,
                    opacity: opacity,
                })
            }

            return material;
        },
        /**
         * 单一贴图材质
         *  @param {*} bitmapPath 图片路径（默认512x512尺寸）
         *  @param {*} repeatX x重复量
         *  @param {*} repeatY y重复量
         */
        bitmapMaterial: function (bitmapPath,opacity, repeatX, repeatY) {
            var texture = THREE.ImageUtils.loadTexture(bitmapPath, {}, function () {
                texture.repeat.set(repeatX, repeatY);
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                //加载完成后渲染
                main.render();
            });

            return new THREE.MeshLambertMaterial({
                map: texture,
                transparent: opacity < 1,
                opacity: opacity,
                visible: true
            });
        },
        /**
         * 多面贴图材质
         * (默认的顺序 右左上下前后)
         *  @param {*} bitmaps 图片配置json集合
         */
        bitmapsMaterial: function (bitmaps) {
            /*
            bitmap={
                bitmapPath:"",
                repeatX:1,
                repeatY:1,
                visible:true,
                color:"white"
            }
            */
            var materials = [];
            for (var i = 0; i < bitmaps.length; i++) {
                var bitmap = bitmaps[i];
                if (bitmap.visible) {
                    var texture = THREE.ImageUtils.loadTexture(bitmap.bitmapPath, {}, function () {
                        texture.repeat.set(bitmap.repeatX, bitmap.repeatY);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;

                        //加载完成后渲染
                        main.render();
                    });

                    //var material = new THREE.MeshLambertMaterial({
                    var material = new THREE.MeshPhongMaterial({
                        map: texture
                    });

                    materials.push(material);
                } else {
                    materials.push(new THREE.MeshPhongMaterial({
                        color: bitmap.color
                    }));
                }
            }

            return new THREE.MeshFaceMaterial(materials);
        }
    };

    /**
     * 图形
     */
    main.geometry = {
        /**
         * 创建立方体
         */
        box: function (l, w, h) {
            var box = new THREE.CubeGeometry(l, h, w);
            return box;
        },
        /**
         * 创建面
         */
        polygon: function (points) {
            var area=main.geometry.computeArea(points);

            var shape = new THREE.Shape();
            var point = points[0];
            shape.moveTo(point.x, point.y);
            for (var i = 1; i < points.length; i++) {
                point = points[i];
                shape.lineTo(point.x, point.y);
            }
            point = points[0];
            shape.lineTo(point.x, point.y);

            return shape;
        },
        /**
         * 创建圆
         */
        circle: function (point, r) {
            var circleShape = new THREE.Shape();
            circleShape.moveTo(0, circleRadius);
            circleShape.quadraticCurveTo(r, r, r, 0);
            circleShape.quadraticCurveTo(r, -r, 0, -r);
            circleShape.quadraticCurveTo(-r, -r, -r, 0);
            circleShape.quadraticCurveTo(-r, r, 0, r);

            return circleShape;
        },
        /**
         * 线
         */
        line: function (points) {
            var splineShape = new THREE.Shape();
            var splinepts = [];

            var point = points[0];
            splineShape.moveTo(point.x, point.y);
            for (var i = 1; i < points.length; i++) {
                splinepts.push(new THREE.Vector2(point.x, point.y));
            }

            splineShape.splineThru(splinepts);

            return splineShape;
        },
        /**
         * 拉伸图形
         */
        extrudeShape: function (shape, h) {
            return new THREE.ExtrudeGeometry(shape, {
                amount: h,
                bevelThinkness: 2,
                bevelSize: 1,
                bevelSegments: 3,
                bevelEnabled: true,
                curveSegments: 12,
                steps: 1
            });
        },
        /**
         * 创建圆柱
         */
        cylinder: function (r, l) {
            //var cylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, r, r));
            /*
            cylinderMesh.rotateX(angleX);
            cylinderMesh.rotateY(angleY);
            cylinderMesh.rotateZ(angleZ);
            */

            return new THREE.CylinderGeometry(r, r, l, r, r);
        },
        /**
         * 加载模型
         */
        model: function (l, w, h, mtlPath, modelPath, angle, position, callBack) {
            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.load(mtlPath, function (materials) {
                materials.preload();

                var loader = new THREE.OBJLoader();
                loader.setMaterials(materials);
                loader.load(modelPath, function (obj) {
                    //计算模型尺寸
                    var box = new THREE.Box3();
                    box.expandByObject(obj);

                    var length = box.max.x - box.min.x;
                    var width = box.max.z - box.min.z;
                    var height = box.max.y - box.min.y;

                    obj.scale.set(l / length, h / height, w / width);

                    var x = (box.max.x + box.min.x) / 2 * obj.scale.x;
                    var y = (box.max.y + box.min.y) / 2 * obj.scale.y;
                    var z = (box.max.z + box.min.z) / 2 * obj.scale.z;

                    var pt = main.geometry.getPosition(position, l, w, h);
                    obj.position.set(0 - x, 0 - y, 0 - z);

                    obj.castShadow = true;
                    obj.receiveShadow = true;

                    /* 据说是模型材质透明度
                    obj.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {

                            //child.material.shininess=0;
                            //在加载模型时，透明材质必须是透明的
                            child.material.transparent = true;
                            // child.shading=THREE.FlatShading
                        }
                    });
                    */
                    let wrapper = new THREE.Object3D();
                    wrapper.position.set(pt.x, pt.y, pt.z);
                    wrapper.add(obj);
                    //obj.position.set(-x,-y,-z);

                    wrapper.rotation.set(angle.x, angle.y, angle.z);

                    callBack(wrapper);
                });
            })
        },

        /**
         * 计算范围
         */
        computeArea:function(points){
            var x=[];
            var y=[];

            for (var i = 1; i < points.length; i++) {
                point = points[i];
                x.push(point.x);
                y.push(point.y);
            }

            var minX=Math.min.apply(Math,x);
            var maxX=Math.max.apply(Math,x);
            var minY=Math.min.apply(Math,y);
            var maxY=Math.max.apply(Math,y);

            return {
                minX:minX,
                maxX:maxX,
                minY:minY,
                maxY:maxY
            }
        },

        mesh: function (geometry, position, material) {
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            var box = new THREE.Box3();
            box.expandByObject(mesh);

            var l = box.max.x - box.min.x;
            var w = box.max.z - box.min.z;
            var h = box.max.y - box.min.y;

            var position = main.geometry.getPosition(position, l, w, h);
            mesh.position.set(position.x, position.y, position.z);
            mesh.updateMatrix();
            return mesh;
        },

        /**
         * 计算模型在场景中的位置
         * @param {*} position 模型绝对位置
         * @param {*} l 模型长
         * @param {*} w 模型宽
         * @param {*} h 模型高
         */
        getPosition: function (position, l, w, h) {
            var x = position.x + (l - main.sceneRange.l) / 2;
            var y = position.z + (h - main.sceneRange.h) / 2;
            var z = position.y + (w - main.sceneRange.w) / 2;

            return { x: x, y: y, z: z };
        },

        /**
         * 根据模型实际场景位置计算原始位置
         */
        restorePositon: function (position, l, w, h) {
            var x = position.x - (l - main.sceneRange.l) / 2;
            var z = position.y - (h - main.sceneRange.h) / 2;
            var y = position.z - (w - main.sceneRange.w) / 2;

            return { x: x, y: y, z: z };
        },

        /**
         * 裁剪图形
         * @param {*} mesh 原始模型
         * @param {*} clipMesh 裁掉的部分
         */
        clipBox: function (mesh, clipMesh) {
            var bsp = new ThreeBSP(mesh);
            var subtract = bsp.subtract(new ThreeBSP(clipMesh));
            var result = subtract.toMesh(
                mesh.material);
            result.geometry.computeVertexNormals();

            return result;
        },

        /**
         * 合并图形
         */
        mergeBox: function (meshs) {
            var geometry = new THREE.Geometry();
            for (var i = 0; i < meshs.length; i++) {
                var mesh = meshs[i];
                geometry.merge(mesh.geometry, mesh.matrix);
            }

            return geometry;

        }
    };

    /**
     * 光照
     */
    main.light = {
        /**
         * 点光源
         *  @param {*} position 位置
         *  @param {*} color 颜色
         *  @param {*} strength 强度
         *  @param {*} distance 距离
         */
        pointLight: function (position, color, strength, distance) {
            var light = new THREE.PointLight(color, strength, distance);

            var pt = main.geometry.getPosition(position, 2, 2, 2);
            light.position.set(pt.x, pt.y, pt.z);

            return light;
        }
    };

    main.event = {
        getMesh: function (event, callBack) {
            event.preventDefault();

            /*
            console.log("event.clientX:" + event.clientX);
            console.log("event.clientY:" + event.clientY);
            */

            // 声明 raycaster 和 mouse 变量
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2();

            // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
            raycaster.setFromCamera(mouse, main.camera);

            // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
            //var intersects = raycaster.intersectObjects(main.scene.children);
            var scensObjs = [];
            main.scene.children.forEach(child => {
                for (var i = 0;
                    i < child.children.length;
                    i++
                ) {
                    var grop = child.children[i];
                    for (var n = 0; n < grop.children.length; n++) {
                        scensObjs.push(grop.children[n]);
                    }
                }
            });

            //返回选中的外部模型对象
            var intersects = raycaster.intersectObjects(scensObjs);

            var objs = [];
            for (var i = 0; i < intersects.length; i++) {
                var intersect = intersects[i];
                if (intersect.object instanceof THREE.Mesh) {
                    var obj = intersect.object.parent;
                    if(obj.name=="")
                        obj=obj.parent;
                    obj.userData.distance = intersect.distance;
                    objs.push(obj);
                }
            }

            //返回选中的矢量模型对象
            intersects = raycaster.intersectObjects(main.scene.children);
            for (var i = 0; i < intersects.length; i++) {
                var intersect = intersects[i];
                if (intersect.object instanceof THREE.Mesh) {
                    var obj = intersect.object;
                    obj.userData.distance = intersect.distance;
                    objs.push(obj);
                }
            }

            //按照距离排序
            objs = objs.sort(function (a, b) {
                return a.userData.distance - b.userData.distance;
            });


            callBack(objs[0]);

        }
    }

    /**
     * 渲染
     */
    main.render = function () {
        main.renderer.render(main.scene, main.camera);
        requestAnimationFrame(main.render);
    };


    return main;
});