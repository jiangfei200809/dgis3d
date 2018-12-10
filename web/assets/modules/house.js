var house = {
    floor: function (l, w, h, call) {
        var floorTexture = THREE.ImageUtils.loadTexture("../assets/images/floor1.png", {}, function () {
            floorTexture.repeat.set(12, 14);
            floorTexture.wrapS = THREE.RepeatWrapping;
            floorTexture.wrapT = THREE.RepeatWrapping;


            var floorMesh = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
                new THREE.MeshLambertMaterial({
                    map: floorTexture,
                    visible: true
                })
            );

            var pt = getPosition({x: 0, y: 0, z: 0}, l, w, h);
            //floorMesh.position.set(0,0,0);
            floorMesh.position.set(0, 0, 0);

            call(floorMesh);
        });
    },

    wall: function (l, w, h, position, colors) {
        var materials = [];
        for (var i = 0; i < 6; i++) {
            //右左上下前后
            materials.push(new THREE.MeshPhongMaterial({
                color: colors[i],
                specular: "white",
                visible: i != 3
            }));
        }

        var wallMesh = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
            new THREE.MeshFaceMaterial(materials)
        );

        var pt = getPosition(position, l, w, h);
        wallMesh.position.set(pt.x, pt.y, pt.z);

        return wallMesh;
    },

    door: function (l, w, h, angleY, position, callBack) {
        var doorTexture = THREE.ImageUtils.loadTexture("../assets/images/door.png", {}, function () {
            var doorMesh = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
                new THREE.MeshLambertMaterial({
                    map: doorTexture,
                    visible: true
                }));

            doorMesh.rotateY(angleY);

            var pt = getPosition(position, l, w, h);
            doorMesh.position.set(pt.x, pt.y, pt.z);

            callBack(doorMesh);
        });
    },

    box: function (l, w, h, position, color, opacity) {
        var box = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
            new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: opacity,
            })
        );
        var pt = getPosition(position, l, w, h);
        box.position.set(pt.x, pt.y, pt.z);

        return box;
    },

    boxImg: function (l, w, h, position, img, callBack) {
        var texture = THREE.ImageUtils.loadTexture(img, {}, function () {
            var mesh = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
                new THREE.MeshLambertMaterial({
                    map: texture,
                    visible: true
                }));
            var pt = getPosition(position, l, w, h);
            mesh.position.set(pt.x, pt.y, pt.z);

            callBack(mesh);
        });
    },

    boxImgs: function (l, w, h, position, imgs, callBack) {
        var materials = [];
        for (var i = 0; i < imgs.length; i++) {
            var texture = THREE.ImageUtils.loadTexture(imgs[i], {}, function () {
                /**/


                renderer.render(scene, camera);
            });
            if (i == 0)
                texture.repeat.set(4, 1);
            else
                texture.repeat.set(1, 5);

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            var meterial = new THREE.MeshLambertMaterial({
                map: texture,
                overdraw: true
            });
            materials.push(meterial);
        }

        var mesh = new THREE.Mesh(new THREE.CubeGeometry(l, h, w),
            new THREE.MeshFaceMaterial(materials)
        );
        var pt = getPosition(position, l, w, h);
        mesh.position.set(pt.x, pt.y, pt.z);

        callBack(mesh);
    },

    model: function (l, w, h, position, mtlPath, modelPath, angleX, angleY, angleZ, callBack) {
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
                obj.rotation.set(angleX, angleY, angleZ);

                var pt = getPosition(position, l, w, h);
                obj.position.set(pt.x, pt.y, pt.z);

                obj.castShadow = true;
                obj.receiveShadow = true;

                callBack(obj);
            });


        });

        /*var loader = new THREE.STLLoader();
        loader.load(model, function (geometry) {
            var material = new THREE.MeshPhongMaterial({
                color: color,
                specular: 0x111111,
                shininess: 200
            });
            var mesh = new THREE.Mesh(geometry, material);

            if (geometry.boundingBox != null) {
                var length = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
                var width = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
                var height = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

                mesh.scale.set(l / length, w / width, h / height);
            }

            mesh.rotation.set(angleX, angleY, angleZ);

            var pt = getPosition(position, l, w, h);
            mesh.position.set(pt.x, pt.y, pt.z);

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            callBack(mesh);

        });*/
    },

    cylinder: function (r, l, angleX, angleY, angleZ) {
        var cylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 60, 60),
            new THREE.MeshPhongMaterial({
                color: "gray",
                specular: "#ccc",
                shininess: 5
            }));

        //var pt = getPosition(position, r, r, l);

        /*cylinderMesh.rotateOnAxis( new THREE.Vector3(0,1,0),angleZ);//绕axis轴旋转π/8
        cylinderMesh.rotateOnAxis( new THREE.Vector3(0,1,0),angleZ);//绕axis轴旋转π/8*/

        cylinderMesh.rotateX(angleX);
        cylinderMesh.rotateY(angleY);
        cylinderMesh.rotateZ(angleZ);

        /*cylinderMesh.position.set(pt.x, pt.y, pt.z);
        scene.add(cylinderMesh);
        renderer.render(scene, camera);*/

        return cylinderMesh;
    },

    light: function (x, y, z, color) {
        var light = new THREE.PointLight(color, 1, 300);

        var pt = getPosition({x: x, y: y, z: z}, 2, 2, 2);
        light.position.set(pt.x, pt.y, pt.z);

        scene.add(light);
        renderer.render(scene, camera);
    }
};

/**
 * 裁剪图形
 * @param {*} box
 * @param {*} clipBox 裁掉的部分
 */
function clipBox(box, clipBox) {
    var bsp = new ThreeBSP(box);
    var subtract = bsp.subtract(new ThreeBSP(clipBox));
    var result = subtract.toMesh(
        box.material);
    result.geometry.computeVertexNormals();

    return result;
}

function getPosition(position, l, w, h) {
    var ll = 710, ww = 850, hh = 2;

    var x = position.x + (l - ll) / 2 + 50;
    var y = position.z + (h - hh) / 2 + 2;
    var z = position.y + (w - ww) / 2 + 50;

    return {x: x, y: y, z: z};
}