import * as THREE from 'three'
import './index.css'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import GUI from 'lil-gui'

const canvas = document.querySelector('canvas.webgl')


const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize',() => {
    // Update sizes
    windowSize.width = window.innerWidth
    windowSize.height = window.innerHeight

    // Update camera
    camera.aspect = windowSize.width / windowSize.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(windowSize.width, windowSize.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const scene = new THREE.Scene();
export const gui = new GUI()

/**
 *
 * Scene
 */

const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const envMap = cubeTextureLoader.load([
    'textures/env_map/px.jpg',
    'textures/env_map/nx.jpg',
    'textures/env_map/py.jpg',
    'textures/env_map/ny.jpg',
    'textures/env_map/pz.jpg',
    'textures/env_map/nz.jpg',
])

const gltfLoader = new GLTFLoader()

gltfLoader.load(
    'models/door_model/FrontDoor.gltf',
    (object) => {
        const doorFolder = gui.addFolder('door')
        doorFolder.close()
        object.scene.children[0].rotation.y = Math.PI
        doorFolder.add(object.scene.children[0].rotation, 'y').min(-Math.PI).max(Math.PI).step(.01).name('Rotate')
        doorFolder.add(object.scene.children[0].position, 'z').min(-4).max(4).step(.01).name('Move forward/backward')
        scene.add(object.scene.children[0])
    }
)

const cubeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff })
cubeMaterial.metalness = .75
cubeMaterial.roughness = .05
cubeMaterial.envMap = envMap

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(5,5,5,32,32,32),
    cubeMaterial
)

cube.castShadow = true
cube.position.set(7, 2.5, 0)

const cubeFolder = gui.addFolder('cube')
cubeFolder.close()

cubeFolder.add(cubeMaterial, 'metalness').min(0).max(1).step(.001).name('Cube metalness')
cubeFolder.add(cubeMaterial, 'roughness').min(0).max(1).step(.001).name('Cube roughness')
cubeFolder.add(cube.position, 'x').min(4.8).max(8).step(.01).name('Cube position x')
cubeFolder.add(cube.position, 'y').min(-5).max(7.5).step(.01).name('Cube position y')
cubeFolder.add(cube.position, 'z').min(-5).max(5).step(.01).name('Cube position z')

const sphere = new Reflector(
    new THREE.PlaneGeometry(5, 5, 64, 64),
    {
        color: new THREE.Color(0x7f7f7f),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio
    }
)

sphere.castShadow = true
sphere.position.set(-7, 2.5, -3)
sphere.rotation.y = Math.PI * .25

const sphereFolder = gui.addFolder('sphere')
sphereFolder.close()

sphereFolder.add(sphere.position, 'x').min(-8).max(-4.8).step(.01).name('Sphere position x')
sphereFolder.add(sphere.position, 'y').min(-5).max(7.5).step(.01).name('Sphere position y')
sphereFolder.add(sphere.position, 'z').min(-5).max(5).step(.01).name('Sphere position z')
sphereFolder.add(sphere.rotation, 'x').min(-Math.PI * .5).max(Math.PI * .5).step(.01).name('Sphere rotation x')
sphereFolder.add(sphere.rotation, 'y').min(Math.PI * .25).max(Math.PI * 1.25).step(.01).name('Sphere rotation y')
sphereFolder.add(sphere.rotation, 'z').min(-Math.PI * .5).max(Math.PI * .5).step(.01).name('Sphere rotation z')

scene.add(cube, sphere)

/**
 *
 * Plain
 */

const planeGeometry = new THREE.PlaneGeometry(30, 30, 16, 16)
const planeMaterial = new THREE.MeshStandardMaterial()


const plane = new THREE.Mesh(
    planeGeometry,
    planeMaterial
)
plane.receiveShadow = true
plane.rotation.x =  - Math.PI * .5
scene.add(plane)

/**
 *
 * Lights
 */

const pointLight = new THREE.PointLight(0xffffff, .5, 30)
pointLight.position.set(0, 10, 7)
pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = .5
pointLight.shadow.camera.far = 15
const lightFolder = gui.addFolder('Lights')
lightFolder.close()
lightFolder.add(pointLight.position, 'x').min(-6).max(6).step(.01).name('Light 1 x axes')
lightFolder.add(pointLight.position, 'y').min(3).max(12).step(.01).name('Light 1 y axes')
lightFolder.add(pointLight, 'visible').name('Turn light 1 on/off')
scene.add(pointLight)

const pointLight1 = new THREE.PointLight(0xffffff, .3, 30)
pointLight1.position.set(0, 6, -7)
pointLight1.castShadow = true
pointLight1.shadow.mapSize.width = 1024
pointLight1.shadow.mapSize.height = 1024
pointLight1.shadow.camera.near = .5
pointLight1.shadow.camera.far = 15
scene.add(pointLight1)

const pointLightHelper = new THREE.PointLightHelper(pointLight, .1)
pointLightHelper.visible = false
lightFolder.add(pointLightHelper, 'visible').name('Show/Hide light 1 helper')
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
lightFolder.add(pointLightCameraHelper, 'visible').name('Show/Hide light 1 shadow camera helper')
scene.add(pointLightCameraHelper, pointLightHelper)

lightFolder.add(pointLight1.position, 'x').min(-6).max(6).step(.01).name('Light 2 x axes')
lightFolder.add(pointLight1.position, 'y').min(3).max(12).step(.01).name('Light 2 y axes')
lightFolder.add(pointLight1, 'visible').name('Turn light 2 on/off')

const ambientLight = new THREE.AmbientLight(0xffffff, .8)
scene.add(ambientLight)

/**
 *
 * Camera
 */

const camera = new THREE.PerspectiveCamera( 75, windowSize.width / windowSize.height, 0.1, 1000 );
camera.position.set(0, 6, 13)
camera.lookAt(0, 5, 0)

/**
 *
 * Reanderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize( windowSize.width, windowSize.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
const controls = new OrbitControls( camera, canvas );
controls.enableDamping = true
controls.update()

/**
 *
 * Ticks
 */

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.elapsedTime

    controls.update()
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}
tick()