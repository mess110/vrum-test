Config.instance.engine.prod = true
Config.instance.engine.debug = !Config.instance.engine.prod
Config.instance.window.showStatsOnStart = !Config.instance.engine.prod
Config.instance.window.showStatsOnStart = true

Config.instance.vax = {
  skyColor: '#29bbf4',
  groundColor: '#55AA55'
}

PoolManager.on('spawn', Bullet, (item, options) => {
  item.from(options.from)
  Hodler.get('scene').add(item)
})
PoolManager.on('release', Bullet, (item) => {
  Hodler.get('scene').remove(item)
})

PoolManager.on('spawn', Coin, (item, options) => {
  item.reset()
  item.position.copy(options.position)
  Hodler.get('scene').add(item)
})
PoolManager.on('release', Coin, (item, options) => {
  Hodler.get('scene').remove(item)
})

let menuScene = new MenuScene()
let campaignScene = new CampaignScene()
let lobbyBrowserScene = new LobbyBrowserScene()
let buildScene = new BuildScene()
let screenshotScene = new ScreenshotScene()
let tutorialScene = new TutorialScene()

let creditsScene = new AddsScene(menuScene, ["vrum-text.png", "credits.png"])

let sceneAfterLoading = Config.instance.engine.prod ? menuScene : campaignScene

let loadingScene = new LoadingScene(sceneAfterLoading, [
  { type: 'image', path: 'assets/hand.png' },

  { type: 'model', path: 'assets/models/ammo.001.glb' },
  { type: 'model', path: 'assets/models/ammo.002.glb' },
  // { type: 'model', path: 'assets/models/barrel.001.glb' }, // already loaded
  { type: 'model', path: 'assets/models/button.bg.001.glb' },
  { type: 'model', path: 'assets/models/button.fg.001.glb' },
  { type: 'model', path: 'assets/models/chassis.001.glb' },
  { type: 'model', path: 'assets/models/chassis.002.glb' },
  { type: 'model', path: 'assets/models/chassis.003.glb' },
  { type: 'model', path: 'assets/models/chassis.004.glb' },
  { type: 'model', path: 'assets/models/chassis.005.glb' },
  { type: 'model', path: 'assets/models/cloud.001.glb' },
  { type: 'model', path: 'assets/models/coin.001.glb' },
  { type: 'model', path: 'assets/models/flag.001.glb' },
  { type: 'model', path: 'assets/models/ground.001.glb' },
  { type: 'model', path: 'assets/models/rench.001.glb' },
  { type: 'model', path: 'assets/models/tower.001.glb' },
  { type: 'model', path: 'assets/models/island.002.glb' },
  { type: 'model', path: 'assets/models/tree.001.glb' },
  { type: 'model', path: 'assets/models/practice.dummy.001.glb' },
  { type: 'model', path: 'assets/models/wall.001.glb' },
  { type: 'model', path: 'assets/models/wall.002.glb' },
  { type: 'model', path: 'assets/models/wall.corner.001.glb' },
  { type: 'model', path: 'assets/models/weapon.001.glb' },
  { type: 'model', path: 'assets/models/weapon.002.glb' },
  { type: 'model', path: 'assets/models/weapon.003.glb' },
  { type: 'model', path: 'assets/models/wheel.001.glb' },
  { type: 'model', path: 'assets/models/wheel.002.glb' },
  { type: 'model', path: 'assets/models/wheel.003.glb' },
])
loadingScene.initCallback = () => {
  addBaseLight(loadingScene)
  loadingScene.cube = new THREE.Object3D()

  let barrel = AssetManager.clone('barrel.001.glb')
  loadingScene.barrel = barrel

  loadingScene.cube.add(barrel)
  loadingScene.cube.rotation.set(0, 0, Math.PI / 2)
  loadingScene.add(loadingScene.cube)

  let text = new BaseText({
    text: 'loading', fillStyle: 'white',
    canvasW: 512, canvasH: 512, align: 'center',
    font: '84px luckiest-guy'})
  text.position.set(0, 0, 6)
  text.lookAt(Hodler.get('camera').position)
  loadingScene.add(text)
}
loadingScene.tick = (tpf) => {
  loadingScene.barrel.rotation.y -= tpf
  loadingScene.barrel.rotation.x += tpf
}
let logosScene = new AddsScene(loadingScene, ["logo.png"])

const addBaseLight = (scene) => {
  let light = new THREE.PointLight()
  light.position.set(0, 50, 0)
  scene.add(light)

  let ambient = new THREE.AmbientLight('white', 0.6)
  scene.add(ambient)
}

let sceneAfterInit = Config.instance.engine.prod ? logosScene : loadingScene

Utils.setCursor('none')

Engine.start(sceneAfterInit, [
  { type: 'font', path: 'assets/luckiest-guy' },
  { type: 'image', path: 'assets/vrum-text.png'},
  { type: 'image', path: 'assets/logo.png'},
  { type: 'image', path: 'assets/credits.png'},
  { type: 'model', path: 'assets/models/barrel.001.glb' },
])
