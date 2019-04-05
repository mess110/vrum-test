class CampaignScene extends Scene {
  init(options) {
    if (isBlank(options)) { options = {} }
    if (isBlank(options.model)) { options.model = {} }
    if (isBlank(options.model.chassis)) { options.model.chassis = 'chassis.001.glb' }
    if (isBlank(options.model.wheels)) { options.model.wheels = 'wheels.001.glb' }
    if (isBlank(options.model.weapon)) { options.model.weapon = 'weapon.001.glb' }
    console.log(options)

    addBaseLight(this)

    let camera = this.getCamera()
    camera.position.set(0, 35, 25)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.position.set(0, 80, 80)

    let island = AssetManager.clone('island.002.glb')
    // Utils.addOutline(island)
    this.add(island)
    this.island = island

    let sky = Utils.plane({size: 1000, color: '#29bbf4' })
    sky.position.set(0, 0, -100)
    sky.lookAt(camera.position)
    this.add(sky)

    this.collidables = [island]
  }

  uninit() {
    // this.tank.uninit()
  }

  tick(tpf) {
    Utils.lerpCamera(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 35, 25))
  }

  doKeyboardEvent(event) {
    // console.log(`${event.type} ${event.code} (${event.which})`)
    // this.tank.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    // console.log(event.type)
    // this.tank.doGamepadEvent(event)
  }
}
