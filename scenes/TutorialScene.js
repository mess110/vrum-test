class TutorialScene extends Scene {
  init(options) {
    addBaseLight(this)

    let camera = this.getCamera()
    camera.position.set(0, 35, 25)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.position.set(0, 100, 100)

    let island = AssetManager.clone('island.001.glb')
    Utils.addOutline(island)
    this.add(island)
    this.island = island

    let sky = Utils.plane({size: 1000, color: '#29bbf4' })
    sky.position.set(0, 0, -30)
    this.add(sky)

    this.coins = []

    let coin = new Coin()
    coin.position.set(0, 2, 8)
    this.add(coin)
    this.coins.push(coin)
    this.coin = coin

    this.barrels = []

    let barrel = AssetManager.clone('barrel.001.glb')
    barrel.position.set(0, 0, -8)
    Utils.addOutline(barrel)
    this.add(barrel)
    this.barrel = barrel

    let wall = AssetManager.clone('wall.001.glb')
    wall.position.set(12, 0, 0)
    this.add(wall)
    this.wall = wall

    this.tanks = []

    let tank = new Tank()
    tank.position.set(0, 0, 1)
    this.tanks.push(tank)
    this.add(tank)
    this.tank = tank

    let control = new PositionXZRotationYControls()
    control.speed *= 2
    control.acceleration *= 2
    this.control = control

    let rayScanner = new RayScanner()
    // rayScanner.drawLines = true
    this.rayScanner = rayScanner
  }

  tick(tpf) {
    Measure.clearLines()

    this.control.doMobileEvent()
    this.control.tick(tpf)

    if (this.control.isMoving()) {
      let wheelSpeed = 2
      this.tank.wheelFL.tick(tpf * wheelSpeed)
      this.tank.wheelFR.tick(tpf * wheelSpeed)
      this.tank.wheelBL.tick(tpf * wheelSpeed)
      this.tank.wheelBR.tick(tpf * wheelSpeed)
    }

    this.coins.forEach((coin) => {
      coin.rotation.y += tpf
    })

    this.tank.rotation.y = this.control.rotationY

    let fromPosition = this.tank.position.clone()
    fromPosition.y += 2

    this.rayScanner.scan(
      [this.island, this.barrel, this.wall],
      fromPosition, this.control.velocity
    )

    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))

    if (this.rayScanner.addX) {
      this.tank.position.x += this.control.velocity.x
    }
    if (this.rayScanner.addZ) {
      this.tank.position.z += this.control.velocity.z
    }
  }

  doKeyboardEvent(event) {
    this.control.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    this.control.doGamepadEvent(event)
  }
}
