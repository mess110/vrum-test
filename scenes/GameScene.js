class GameScene extends Scene {
  init(options) {
    addBaseLight(this)
    Utils.setCursor('none')

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

    this.characters = []
    this.collidables = [island]

    this.infoText = new BaseText({
      text: '', fillStyle: 'white', align: 'center',
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'})
    this.infoText.scale.setScalar(8)
    this.infoText.rotation.set(-Math.PI / 2, 0, 0)
    this.infoText.position.set(0, 0.1, 18)
    this.add(this.infoText)

    let vector = new THREE.Vector3();
    this.hitVector = vector

    let vj = new VirtualController({
      joystickLeft: {
        stickRadius: 60
      },
      joystickRight: {
        stickRadius: 60
      }
    })
    this.vj = vj
  }

  uninit() {
    this.vj.uninit()
  }

  doMobileEvent(target) {
    if (!VirtualController.isAvailable()) { return }
    let joystickLeft = this.vj.joystickLeft
    let joystickRight = this.vj.joystickRight
    target.control.doMobileEvent(joystickLeft)
    target.controlWeapon.doMobileEvent(joystickRight)

    let joystick = joystickRight
    if (!isBlank(joystick)) {
      let deltaX = joystick.deltaX()
      let deltaY = joystick.deltaY()

      if (deltaX > 40 || deltaX < -40 || deltaY > 40 || deltaY < -40) {
        target.shoot()
      }
    }
  }

  setInfoMsg(key) {
    let easing = TWEEN.Easing.Cubic.InOut
    if (!isBlank(this.fadeIn)) {
      this.fadeIn.stop()
      this.fadeIn = undefined
    }
    if (!isBlank(this.fadeOut)) {
      this.fadeOut.stop()
      this.fadeOut = undefined
    }
    this.fadeIn = new FadeModifier(this.infoText, 1, 0, 500, easing)
    this.fadeIn.start()
    this.setTimeout(() => {
      this.infoText.setText(key)
      this.fadeOut = new FadeModifier(this.infoText, 0, 1, 500, easing)
      this.fadeOut.start()
    }, 600)
    return
  }

  addPlayer(options) {
    if (isBlank(options)) { options = {} }
    if (isBlank(options.model)) { options.model = {} }
    if (isBlank(options.model.chassis)) { options.model.chassis = 'chassis.001.glb' }
    if (isBlank(options.model.wheels)) { options.model.wheels = 'wheel.001.glb' }
    if (isBlank(options.model.weapon)) { options.model.weapon = 'weapon.001.glb' }
    if (isBlank(options.position)) { options.position = {} }
    if (isBlank(options.position.x)) { options.position.x = 0 }
    if (isBlank(options.position.y)) { options.position.y = 0 }
    if (isBlank(options.position.z)) { options.position.z = 0 }

    let tank = new Player()
    tank.position.set(options.position.x, options.position.y, options.position.z)
    tank.setModel(options.model.chassis)
    tank.changeWheels(options.model.wheels)
    tank.changeWeapon(options.model.weapon)
    tank.rayScanner.collidables = this.collidables
    this.characters.forEach((character) => {
      tank.rayScanner.addCollidable(character)
      character.rayScanner.addCollidable(tank)
    })
    this.add(tank)
    this.characters.push(tank)

    return tank
  }

  tick(tpf) {
    Measure.clearLines()

    PoolManager.itemsInUse(Bullet).forEach((bullet) => {
      bullet.tick(tpf)
    })
  }
}
