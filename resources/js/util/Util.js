import * as Three from 'three';



window.N = 512*512;
window.G = makeSpecifiedArray1D(N, Math.random, new Float32Array(N));
window.P = makeSpecifiedArray1D(N, function() {return randomInt(0, N-1)}, new Uint32Array(N));
window.ran1 = ( Math.floor(Math.random() * 100 ) ) / 10;
window.ran2 = ( Math.floor(Math.random() * 100 ) ) / 10;
window.ran3 = ( Math.floor(Math.random() * 100 ) ) / 10;




export function generateSeeds(seed) {
    console.log(random(seed));
    window.G = makeSpecifiedArray1D(N, Math.random, new Float32Array(N));
    window.P = makeSpecifiedArray1D(N, function() {return randomInt(0, N-1)}, new Uint32Array(N));
console.log(seed);
    window.ran1 = ( Math.floor(random(seed*2) * 100 ) ) / 10;
    window.ran2 = ( Math.floor(random(seed/2) * 100 ) ) / 10;
    window.ran3 = ( Math.floor(random(seed) * 100 ) ) / 10;
    console.log(ran1);
    console.log(ran2);
    console.log(ran3);



}



export function makeScalarField(index,width, height) {
    let nofPixels = width*height;
    let size = width * height;
    let data = new Uint8Array( 3 * size );

    for (let i = 0; i < nofPixels; i++) {
        let x = i%width;
        let y = Math.floor(i/width);
        let sphericalCoord = getSphericalCoord(index, x, y, width);


        let color = scalarField(sphericalCoord.x, sphericalCoord.y, sphericalCoord.z);

        data[i*3] = color.r*255;
        data[i*3+1] = color.g*255;
        data[i*3+2] = color.b*255;
    }


    return data;
}


export function addScalarField (map, index) {
    var width = map.image.width;
    var height = map.image.height;
    var nofPixels = width*height;

    for (var i = 0; i < nofPixels; i++) {
        var x = i%width;
        var y = Math.floor(i/width);
        var sphericalCoord = getSphericalCoord(index, x, y, width);

        var color = scalarField(sphericalCoord.x, sphericalCoord.y, sphericalCoord.z);

        map.image.data[i*3] = color.r*255;
        map.image.data[i*3+1] = color.g*255;
        map.image.data[i*3+2] = color.b*255;
    }
}








export function getSphericalCoord(index, x, y, width) {
    width /= 2;
    x -= width;
    y -= width;
    let coord = new Three.Vector3();

    if (index == 0) {coord.x=width; coord.y=-y, coord.z=-x}
    else if (index == 1) {coord.x=-width; coord.y=-y, coord.z=x}
    else if (index == 2) {coord.x=x; coord.y=width, coord.z=y}
    else if (index == 3) {coord.x=x; coord.y=-width, coord.z=-y}
    else if (index == 4) {coord.x=x; coord.y=-y, coord.z=width}
    else if (index == 5) {coord.x=-x; coord.y=-y, coord.z=-width}

    coord.normalize();
    return coord;
}





export function scalarField(x, y, z) {
    let resolution1 = 4;
    let resolution2 = 16;
    let resolution3 = 64;
    let resolutionMax = 512;

    let coordFloat = new Three.Vector3();

    let randomScalarField = function(x, y, z) {
        return random4(x, y, z);
    }

    let helper = function(x, y, z, scalarField, resolution, interpolationMethod) {
        // Because the sphere sample function gives normalized coordinates:
        x = (x+1)/2*resolution;
        y = (y+1)/2*resolution;
        z = (z+1)/2*resolution;

        coordFloat.set(x, y, z);
        let interpolated = interpolationMethod(coordFloat, scalarField);
        return interpolated*2 - 1; // Gives values (-1, 1)
    }

    let level1 = helper(x, y, z, randomScalarField, resolution1, tricosineInterpolation);
    let level2 = helper(x, y, z, randomScalarField, resolution2, tricosineInterpolation);
    let level3 = helper(x, y, z, randomScalarField, resolution3, tricosineInterpolation);
    let levelMax = helper(x, y, z, randomScalarField, resolutionMax, tricosineInterpolation);

    let c = 0.5;
    c *= 1 + level1*0.75;
    c *= 1 + level2*0.25;
    c *= 1 + level3*0.075;
    c *= 1 + levelMax*(1/25);

    if (c < 0.5) c *= 0.6;

    c = clamp(c, 0, 2);


    return new Three.Color().setRGB(c /ran1 + ran1 , c / ran2 + ran2 , c / ran3 + ran3 );
}

export function clamp(number, from, to) {
    return Math.max(Math.min(number, to), from);
}


export function makeSpecifiedArray1D(size, value, array) {
    let valueFloat = value;
    for (let x = 0; x < size; x++) {
        if (typeof(value) == "function") valueFloat = value(x);
        array[x] = valueFloat;
    }
    return array;
}



export function random4(i, j, k) {
    return G[(i + P[(j + P[k % N]) % N]) % N];
}


export function randomInt(from, to, seed) {
    return Math.floor(randomFloat(from, to+1, seed));
}

export function randomFloat(from, to, seed) {
    return random(seed)*(to-from)+from;
    //return Math.random()*369584646456549;
}


export function random(seed) {
    let scope = random;

    scope.MAX = scope.MAX || Math.pow(2, 32);
    scope.a = 1664525;
    scope.c = 1013904223;

    scope.seeds = scope.seeds || {};

    seed = seed || 0;
    let key = seed;
    if (typeof seed == "string") {
        if (scope.seeds[seed] == undefined) {
            let numeric = numberFromString(seed);
            scope.seeds[seed] = numeric; // Memoization
            seed = numeric;
        } else {
            seed = scope.seeds[seed];
        }
    }
    scope.series = scope.series || {};
    scope.series[key] = scope.series[key] || seed;

    let lastRandom = scope.series[key];
    let newRandom = (scope.a * lastRandom + scope.c) % scope.MAX;

    scope.series[key] = newRandom;

    return newRandom/scope.MAX;
}



export function numberFromString(string) {
    let result = 0;
    for (let i = 0; i < string.length; i++) {
        result += string[i].charCodeAt(0) * (i+1) * (string[i].charCodeAt(0)/10);
    }
    return result;
}





export function trilinearInterpolation(coordFloat, scalarField, interpolation) {
    interpolation = interpolation || function(a, b, x) {
        return  a*(1-x) + b*x;
    }

    let coord0 = {x: Math.floor(coordFloat.x), y: Math.floor(coordFloat.y), z: Math.floor(coordFloat.z)};
    let coord1 = {x: coord0.x+1, y: coord0.y+1, z: coord0.z+1};
    let xd = (coordFloat.x - coord0.x)/Math.max(1, (coord1.x-coord0.x));
    let yd = (coordFloat.y - coord0.y)/Math.max(1, (coord1.y-coord0.y));
    let zd = (coordFloat.z - coord0.z)/Math.max(1, (coord1.z-coord0.z));
    let c00 = interpolation(scalarField(coord0.x, coord0.y, coord0.z), scalarField(coord1.x, coord0.y, coord0.z), xd);
    let c10 = interpolation(scalarField(coord0.x, coord1.y, coord0.z), scalarField(coord1.x, coord1.y, coord0.z), xd);
    let c01 = interpolation(scalarField(coord0.x, coord0.y, coord1.z), scalarField(coord1.x, coord0.y, coord1.z), xd);
    let c11 = interpolation(scalarField(coord0.x, coord1.y, coord1.z), scalarField(coord1.x, coord1.y, coord1.z), xd);
    let c0 = interpolation(c00, c10, yd);
    let c1 = interpolation(c01, c11, yd);
    let c = interpolation(c0, c1, zd);

    return c;

}

export function nearestNeighbour(coordFloat, scalarField) {
    return scalarField(Math.floor(coordFloat.x), Math.floor(coordFloat.y), Math.floor(coordFloat.z));
}

export function tricosineInterpolation(coordFloat, scalarField) {

    let interpolation = function(a, b, x) {
        let ft = x * 3.1415927;
        let f = (1 - Math.cos(ft)) * 0.5;
        return  a*(1-f) + b*f
    }

    return trilinearInterpolation(coordFloat, scalarField, interpolation);
}



export function stringToNumber(string){

    string.forEach(function (item, index) {
        console.log(item);
    })

}

export function bobewille(seed, test_name, options) {
    let word = CryptoJS.MD5("" + seed + test_name).words[0]; // take first 32-bit word
    i = Math.abs(word % options.length);
    return options[i];
}



export function heightToNormalMap(map, intensity) {
    let width = map.image.width;
    let height = map.image.height;
    let nofPixels = width*height;

    intensity = intensity || 1.0;

    let getHeight = function(x, y) {
        x = Math.min(x, width-1);
        y = Math.min(y, height-1);
        return (
            map.image.data[(y*width+x)*3+0]/255 +
            map.image.data[(y*width+x)*3+1]/255 +
            map.image.data[(y*width+x)*3+2]/255
        )/3*intensity;
    }

    let normalMap = generateDataTexture(width, height, new Three.Color(0x000000));

    for (let i = 0; i < nofPixels; i++) {
        let x = i%width;
        let y = Math.floor(i/width);

        let pixel00 = new Three.Vector3(0, 0, getHeight(x, y));
        let pixel01 = new Three.Vector3(0, 1, getHeight(x, y+1));
        let pixel10 = new Three.Vector3(1, 0, getHeight(x+1, y));
        let orto = pixel10.clone().sub(pixel00).cross(pixel01.clone().sub(pixel00)).normalize();

        let color = new Three.Color(orto.x+0.5, orto.y+0.5, -orto.z);

        normalMap.image.data[i*3+0] = color.r*255;
        normalMap.image.data[i*3+1] = color.g*255;
        normalMap.image.data[i*3+2] = color.b*255;
    }

    normalMap.magFilter = Three.LinearFilter;
    normalMap.minFilter = Three.LinearMipMapLinearFilter;
    normalMap.generateMipmaps = true;
    normalMap.needsUpdate = true;
    return normalMap;
}





export function shaderMaterial(map, sunLight) {
    let vertexShader = "\
		varying vec3 vNormal;\
		varying vec3 cameraVector;\
		varying vec3 vPosition;\
		varying vec2 vUv;\
		\
		void main() {\
			vNormal = normal;\
			vec4 vPosition4 = modelMatrix * vec4(position, 1.0);\
			vPosition = vPosition4.xyz;\
			cameraVector = cameraPosition - vPosition;\
			vUv = uv;\
			\
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\
		}\
	";

    let fragmentShader = "\
		uniform vec3 pointLightPosition;\
		uniform sampler2D map;\
		uniform sampler2D normalMap;\
		\
		varying vec3 vNormal;\
		varying vec3 vPosition;\
		varying vec3 cameraVector;\
		varying vec2 vUv;\
        \
        mat4 rotationMatrix(vec3 axis, float angle) {\
            axis = normalize(axis);\
            float s = sin(angle);\
            float c = cos(angle);\
            float oc = 1.0 - c;\
            \
            return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\
                        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\
                        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\
                        0.0,                                0.0,                                0.0,                                1.0);\
        }\
        \
        vec3 bumpNormal(sampler2D normalMap, vec2 vUv) {\
            vec3 bumpedNormal = normalize(texture2D(normalMap, vUv).xyz * 2.0 - 1.0);\
            \
            vec3 y_axis = vec3(0,1,0);\
            float rot_angle = acos(dot(bumpedNormal,y_axis));\
            vec3 rot_axis = normalize(cross(bumpedNormal,y_axis));\
            return vec3(rotationMatrix(rot_axis, rot_angle) * vec4(vNormal, 1.0));\
        }\
        \
		void main() {\
			float PI = 3.14159265358979323846264;\
			vec3 light = pointLightPosition - vPosition;\
			vec3 cameraDir = normalize(cameraVector);\
            vec3 newNormal = bumpNormal(normalMap, vUv);\
			\
			light = normalize(light);\
			\
			float lightAngle = max(0.0, dot(newNormal, light));\
			float viewAngle = max(0.0, dot(vNormal, cameraDir));\
			float adjustedLightAngle = min(0.6, lightAngle) / 0.6;\
			float adjustedViewAngle = min(0.65, viewAngle) / 0.65;\
			float invertedViewAngle = pow(acos(viewAngle), 3.0) * 0.4;\
			\
			float dProd = 0.0;\
			dProd += 0.5 * lightAngle;\
			dProd += 0.2 * lightAngle * (invertedViewAngle - 0.1);\
			dProd += invertedViewAngle * 0.5 * (max(-0.35, dot(vNormal, light)) + 0.35);\
			dProd *= 0.7 + pow(invertedViewAngle/(PI/2.0), 2.0);\
			\
			dProd *= 0.5;\
			vec4 atmColor = vec4(dProd, dProd, dProd, 1.0);\
			\
			vec4 texelColor = texture2D(map, vUv) * min(asin(lightAngle), 1.0);\
			gl_FragColor = texelColor + min(atmColor, 0.8);\
		}\
	";

    let uniforms = {
        //"pointLightPosition": {"value": sunLight.position},
        "map": {"value": map},
        "normalMap": {"value": heightToNormalMap(map, 0.5)}
    };


    return new Three.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true
    });
}

export function generateDataTexture(width, height, color ) {

    let size = width * height;
    let data = new Uint8Array( 3 * size );

    let r = Math.floor( color.r * 255 );
    let g = Math.floor( color.g * 255 );
    let b = Math.floor( color.b * 255 );

    for ( let i = 0; i < size; i ++ ) {

        data[ i * 3 ] 	   = r;
        data[ i * 3 + 1 ] = g;
        data[ i * 3 + 2 ] = b;

    }

    let texture = new Three.DataTexture( data, width, height, Three.RGBFormat );
    texture.needsUpdate = true;

    return texture;

}