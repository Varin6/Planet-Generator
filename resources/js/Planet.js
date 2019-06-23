import * as Three from 'three';
import * as OrbitControls from 'three-orbitcontrols';
import * as dat from 'dat.gui';
import * as Util from './util/util';


let camera = null,
    scene = null,
    renderer = null,
    mesh = null,
    time = 0,
    vertices = null,
    sphereV1 = 16,
    sphereV2 = 16,
    rotationX = 0,
    rotationY = 0,
    originalGeometry = null,
    gui = new dat.GUI({
        height: 5 * 32 - 1
    }),
    params = {
        multiplier: 5,
        reflectivity: 0,
        roughness: 0,
        metalness: 0,
        wireframe: false,
        seed: ''

    };


export function init() {


    /**
     * declare container
     */

    let container = document.getElementById('app');

    /**
     * set up Camera
     * @type {PerspectiveCamera}
     */

    camera = new Three.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.01, 20);
    camera.position.z = 7;


    /**
     * Set up Scene
     * @type {Scene}
     */

    scene = new Three.Scene();


    /**
     * load textures
     * @type {Texture}
     */

    //let texture = new Three.TextureLoader().load( '/images/moon.jpg');
    //let textureNormal = new Three.TextureLoader().load('/images/moon-normal.png');
    let reflection = new Three.TextureLoader().load('../public/images/refl2.jpg');


    // let texture = generateDataMaterial();


    // let sunLight = new Three.PointLight(new Three.Color(0xffffff), 1.0);
    // sunLight.position.set(100, 0, 0);
    // scene.add(sunLight);


    let width = 512;
    let height = 512;


    function generateMap() {

        let materialArray = [];

        for (let i = 0; i < 6; i++) {

            console.log('creating map');

            let map = createMap(i, Util.scalarField);

            // let faceMaterial = new Three.MeshStandardMaterial({
            //     map: map,
            //     needsUpdate: true,
            // });

            // let faceMaterial = Util.shaderMaterial(map, sunLight);
            let faceMaterial = new Three.MeshStandardMaterial({
                map: map,
                normalMap: Util.heightToNormalMap(map),
                //normalScale: new Three.Vector2(0.8, 0.8),

            });

            materialArray.push(faceMaterial);
        }

        let newMaterialArray = materialArray.slice();

        newMaterialArray[2] = materialArray[3];
        newMaterialArray[3] = materialArray[2];

        return newMaterialArray;
    }

    let newMaterialArray = generateMap();


    //let texture = new Three.DataTexture( Util.makeScalarField(), width, height, Three.RGBFormat );

    function createMap(index, scalarField) {

        let map = Util.generateDataTexture(width, height, new Three.Color(0x000000));


        Util.addScalarField(map, index, Util.makeScalarField(index, width, height));

        // let map = new Three.DataTexture(Util.makeScalarField(index, width, height), width, height, Three.RGBFormat);



        // let map = THREE.ImageUtils.generateDataTexture(resolution, resolution, new THREE.Color(0x000000));
        map.magFilter = Three.LinearFilter;
        map.minFilter = Three.LinearMipMapLinearFilter;
        map.generateMipmaps = true;
        map.needsUpdate = true;
        return map;
    }


    /**
     * set up reflections
     * @type {PixelFormat}
     */

    reflection.format = Three.RGBFormat;
    reflection.mapping = Three.SphericalReflectionMapping;
    reflection.encoding = Three.sRGBEncoding;


    // texture.onload = function()  {
    //     reflection.needsUpdate = true;
    // };


    /**
     * set up Geometries
     * @type {SphereGeometry}
     */


        //let geometry = new Three.SphereGeometry(2.5, sphereV1, sphereV2);
    let geometry = new Three.BoxGeometry(2.5, 2.5, 2.5, sphereV1, sphereV2, sphereV2);

    for (let i in geometry.vertices) {
        let vertex = geometry.vertices[i];
        vertex.normalize().multiplyScalar(2.5);
    }




    /**
     * set up Materials
     * @type {MeshStandardMaterial}
     */




    // let material = new Three.MeshStandardMaterial({
    //     //color: 0x5E9FFD,
    //     roughness: 0.1,
    //     wireframe: true,
    //     map: texture,
    //     //bumpMap: textureBump,
    //     //bumpScale: 1,
    //     //normalMap: textureNormal,
    //     normalScale: new Three.Vector2(0.8, 0.8),
    //     envMap: reflection,
    //     envMapIntensity: 0.5,
    //     metalness: 0.6,
    //     reflectifity: params.reflectivity
    //
    // });


    /**
     * set up Meshes
     * @type {Mesh}
     */

    // mesh = new Three.Mesh(geometry, material);
    mesh = new Three.Mesh(geometry, newMaterialArray);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;

    originalGeometry = mesh.geometry.clone();


    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.uvsNeedUpdate = true;

    /**
     * Add meshes
     * @type {Group}
     */


    scene.add(mesh);



    /**
     * Planet geometry
     *
     */




//     function generateDataMaterial() {
//
//         let width = 512;
//         let height = 512;
//         let size = width * height;
//         let data = new Uint8Array(3 * size);
//
//
//         for (let i = 0; i < size; i++) {
//
//             let r = Math.floor(Math.random() * 255);
//             let g = Math.floor(Math.random() * 255);
//             let b = Math.floor(Math.random() * 255);
//
//             let stride = i * 3;
//
//             data[stride] = r;
//             data[stride + 1] = g;
//             data[stride + 2] = b;
//
//         }
//
// // used the buffer to create a DataTexture
//
//         let texture = new Three.DataTexture(data, width, height, Three.RGBFormat);
//         texture.needsUpdate = true;
//
//         return texture;
//
//     }


    function generatePlanetGeometry() {

        console.log();


        let mountains = [];
        let valleys = [];


        originalGeometry.vertices.forEach(function (item, index) {

            mesh.geometry.vertices[index].x = item.x;
            mesh.geometry.vertices[index].y = item.y;
            mesh.geometry.vertices[index].z = item.z;

        });


        for (let x = 0; x <= 10; x++) {

            let randomVertex = parseInt(getRndInteger(30, (((sphereV1 * (sphereV1 / 2)) * 11) + 2)));
            mountains.push(randomVertex)

        }


        for (let x = 0; x <= 10; x++) {

            let randomVertex = parseInt(getRndInteger(30, (((sphereV1 * (sphereV1 / 2)) * 11) + 2)));
            valleys.push(randomVertex)

        }

        // console.log(mountains);


        mesh.geometry.vertices.forEach(function (item, index) {


            if (index <= (sphereV1 - 1) * 12 || index >= (sphereV1 - 1) * (sphereV1 - 12)) {

                item.x = item.x + getRndInteger(-0.0100, 0.0200) * item.x;
                item.y = item.y + getRndInteger(-0.0100, 0.0200) * item.y;
                item.z = item.z + getRndInteger(-0.0100, 0.0200) * item.z;

            } else {


                item.x = item.x + getRndInteger(-0.0100, 0.0200) * item.x;
                item.y = item.y + getRndInteger(-0.0100, 0.0200) * item.y;
                item.z = item.z + getRndInteger(-0.0100, 0.0200) * item.z;

            }

        });


        /**
         * generate mountains
         */


        mountains.forEach(function (item, index) {

            let area = [];

            area.push(mesh.geometry.vertices[item]);
            area.push(mesh.geometry.vertices[item - 1]);
            area.push(mesh.geometry.vertices[item + 1]);

            area.push(mesh.geometry.vertices[item - sphereV1]);
            area.push(mesh.geometry.vertices[item - sphereV1 - 1]);
            area.push(mesh.geometry.vertices[item - sphereV1 + 1]);

            area.push(mesh.geometry.vertices[item + sphereV1]);
            area.push(mesh.geometry.vertices[item + sphereV1 - 1]);
            area.push(mesh.geometry.vertices[item + sphereV1 + 1]);

            area.forEach(function (item2, index2) {

                item2.x = item2.x + getRndInteger(0.0100, 0.0800) * item2.x;
                item2.y = item2.y + getRndInteger(0.0100, 0.0800) * item2.y;
                item2.z = item2.z + getRndInteger(0.0100, 0.0800) * item2.z;


            });

        });


        /**
         * generate valleys
         */


        valleys.forEach(function (item, index) {

            let area = [];

            area.push(mesh.geometry.vertices[item]);
            area.push(mesh.geometry.vertices[item - 1]);
            area.push(mesh.geometry.vertices[item + 1]);

            area.push(mesh.geometry.vertices[item - sphereV1]);
            area.push(mesh.geometry.vertices[item - sphereV1 - 1]);
            area.push(mesh.geometry.vertices[item - sphereV1 + 1]);

            area.push(mesh.geometry.vertices[item + sphereV1]);
            area.push(mesh.geometry.vertices[item + sphereV1 - 1]);
            area.push(mesh.geometry.vertices[item + sphereV1 + 1]);

            area.forEach(function (item2, index2) {

                item2.x = item2.x + getRndInteger(-0.0800, -0.0100) * item2.x;
                item2.y = item2.y + getRndInteger(-0.0800, -0.0100) * item2.y;
                item2.z = item2.z + getRndInteger(-0.0800, -0.0100) * item2.z;


            });

        });


        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.uvsNeedUpdate = true;

        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();

    }


    /**
     * Ambient light
     * @type {AmbientLight}
     */

    let light = new Three.AmbientLight(0x404040, 3); // soft white light
    //scene.add(light);


    /**
     * Directional Light
     * @type {DirectionalLight}
     */

    var directionalLight = new Three.DirectionalLight(0xffffff, 1);
    directionalLight.position.y = -200;
    directionalLight.position.z = 400;
    directionalLight.position.x = -300;
    scene.add(directionalLight);








    /**
     * set up Renderer
     * @type {WebGLRenderer}
     */


    renderer = new Three.WebGLRenderer({antialias: true, alpha: false});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(container.clientWidth, container.clientHeight);
    //renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    /**
     * set up OrbitControls
     * @type {*|exports.default|THREE.OrbitControls}
     */

    let controls = new OrbitControls(camera, renderer.domElement);
    //controls.addEventListener( 'change', renderer );
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;


    /**
     * Set up canvas resize on window resize
     */

    renderer = renderer;
    camera = camera;

    window.addEventListener('resize', function () {
        let width = container.clientWidth,
            height = container.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    rotationX = mesh.rotation.x;
    rotationY = mesh.rotation.y;


    gui.add(params, 'roughness', 0, 1);
    gui.add(params, 'metalness', 0, 1);
    gui.add(params, 'wireframe', 0, 1);
    gui.add(params, 'seed', 'text');


    /**
     * Generate random integer between numbers
     * @param min
     * @param max
     * @returns {*}
     */

    function getRndInteger(min, max) {
        return Math.random() * (max - min) + min;
    }


    window.addEventListener('click', function () {
        // //let texture = generateDataMaterial();
        // //generatePlanetGeometry();
        //
        // Util.generateSeeds(params.seed);
        //
        // //console.log(params.seed);
        //
        // //console.log(Util.stringToNumber('bobe'));
        // // console.log(Util.random('bobe'));
        //
        // let newMaterialArray = generateMap();
        // mesh.material = newMaterialArray;
        // mesh.material[0].map.needsUpdate = true;


    });



    document.addEventListener("keydown", onDocumentKeyDown, false);

    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 32) {
            //generatePlanetGeometry();
            Util.generateSeeds(params.seed);
            let newMaterialArray = generateMap();
            mesh.material = newMaterialArray;
            mesh.material[0].map.needsUpdate = true;
        }
    }




    //generatePlanetGeometry(this);


    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.uvsNeedUpdate = true;

    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeFaceNormals();

    console.log(mesh);

}


export function animate() {

    requestAnimationFrame(animate);

    /**
     * set up time changes
     * @type {number}
     */



    time += 0.01;
    //let time = time;

    /**
     * Spotlight movement
     * @type {number}
     */


    mesh.material.forEach(function (item, index) {
        item.roughness = params.roughness;
    });

    mesh.material.forEach(function (item, index) {
        item.metalness = params.metalness;
    });

    // mesh.rotation.y = rotationY + Math.sin(time);
    mesh.rotation.y = rotationY - time;

    if (params.wireframe == 1) {
        mesh.material.forEach(function (item, index) {
            item.wireframe = true;
        })
    } else {
        mesh.material.forEach(function (item, index) {
            item.wireframe = false;
        })
    }


    mesh.geometry.verticesNeedUpdate = true;
    mesh.geometry.uvsNeedUpdate = true;
    mesh.material.needsUpdate = true;


    mesh.material.map.needsUpdate = true;


    for (let i = 0; i < 6; i++) {


        // console.log('updating needsupd');

        // mesh.material[i].map.needsUpdate = true;
        mesh.material[i].needsUpdate = true;
        mesh.material.needsUpdate = true;


    }


    renderer.render(scene, camera);
}




