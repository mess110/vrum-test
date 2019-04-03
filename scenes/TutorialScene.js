class TutorialScene extends Scene {
  init(options) {
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

    this.coins = []
    this.bullets = []

    let coin = new Coin()
    coin.position.set(7, 2, -8)
    this.add(coin)
    this.coins.push(coin)
    this.coin = coin

    this.collidables = [island]

    let tank = new Player()
    tank.rayScanner.collidables = this.collidables
    this.add(tank)
    this.tank = tank

    this.alreadySwitched = false
  }

  tick(tpf) {
    Measure.clearLines()
    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))

    this.coins.forEach((coin) => {
      coin.rotation.y += tpf
    })
    this.bullets.forEach((bullet) => {
      bullet.rotation.z += tpf * 5
      bullet.translateZ(tpf * 35)
    })

    this.tank.tick(tpf)

    if (this.alreadySwitched) {
      return
    }

    let distance = Measure.distanceBetween(this.tank, this.coins[0])
    if (distance < 3) {
      this.alreadySwitched = true
      Engine.switch(menuScene)
    }
  }

  shoot() {
    let bullet = AssetManager.clone('ammo.002.glb')
    let pos = this.tank.position.clone()
    pos.y = 2.65
    bullet.position.copy(pos)

    bullet.rotation.copy(this.tank.weapon.rotation)

    bullet.translateZ(2.5)
    this.bullets.push(bullet)
    this.add(bullet)
    console.log('fire')
  }

  doKeyboardEvent(event) {
    this.tank.doKeyboardEvent(event)

    if (event.type == 'keydown' && event.code == 'Space') {
      this.shoot()
    }
  }

  doGamepadEvent(event) {
    this.tank.doGamepadEvent(event)

    if (event.type !== 'gamepadtick-vrum') { return }
    let gamepad = event[0]
    if (isBlank(gamepad)) { return }
    if (gamepad.buttons[0].pressed) {
      this.shoot()
    }
  }
}
