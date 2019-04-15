class GameScene extends Scene {
  init(options) {
    addBaseLight(this)
    Utils.setCursor('none')

    this.inputMapper = new InputMapper()

    let camera = this.getCamera()
    camera.position.set(0, 35, 25)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.position.set(0, 80, 80)

    let island = AssetManager.clone('island.002.glb')
    // Utils.addOutline(island)
    this.add(island)
    island.shadowReceive()
    this.island = island

    let islandWalk = AssetManager.clone('island.002.walk.glb')
    islandWalk.children[0].material.visible = false
    this.islandWalk = islandWalk
    this.add(islandWalk)

    let sky = Utils.plane({size: 1000, color: '#29bbf4' })
    sky.position.set(0, 0, -100)
    sky.lookAt(camera.position)
    this.add(sky)

    this.characters = []
    this.collidables = [islandWalk]

    this.infoText = new BaseText({
      text: '', fillStyle: 'white', align: 'center',
      material: THREE.MeshLambertMaterial,
      strokeStyle: 'black', strokeLineWidth: 1,
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'
    })
    this.infoText.scale.setScalar(8)
    this.infoText.rotation.set(-Math.PI / 2, 0, 0)
    this.infoText.position.set(0, 0.1, 18)
    this.infoText.shadowReceive()
    // this.infoText.material.depthTest = false
    this.add(this.infoText)

    let score = new Score()
    this.score = score
    camera.add(score)
    this.add(camera)

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
    Hodler.get('camera').remove(this.score)
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
    tank.shadowCastAndNotReceive()

    tank.health = new Health()
    tank.add(tank.health)

    this.characters.forEach((character) => {
      tank.rayScanner.addCollidable(character)
      character.rayScanner.addCollidable(tank)
    })
    this.add(tank)
    this.characters.push(tank)

    return tank
  }

  removePlayer(tank) {
    this.characters.forEach((character) => {
      character.rayScanner.removeCollidable(tank)
    })
    this.characters.remove(tank)
    this.remove(tank)
  }

  getLerpTarget() {
    let x, y, z
    let items = this.inputMapper.models()
      .filter((e) => { return !e.health.isDead() })

    if (items.any()) {
      x = items.map((e) => { return e.position.x }).reduce((a, b) => { return a + b }) / items.size()
      y = items.map((e) => { return e.position.y }).reduce((a, b) => { return a + b }) / items.size()
      z = items.map((e) => { return e.position.z }).reduce((a, b) => { return a + b }) / items.size()
    } else {
      x = 0
      y = 0
      z = 0
    }
    return new THREE.Vector3(x, y, z)
  }

  tick(tpf) {
    Measure.clearLines()

    Utils.lerpCamera(this.getLerpTarget(), new THREE.Vector3(0, 35, 25))
    this.score.tick(tpf)
    this.doMobileEvent(this.inputMapper.mobile)

    PoolManager.itemsInUse(Bullet).forEach((bullet) => {
      bullet.tick(tpf)
    })

    PoolManager.itemsInUse(Coin).forEach((coin) => {
      coin.tick(tpf)
    })
  }

  findOrCreate() {
    let found
    this.characters.forEach((character) => {
      if (isBlank(character.botControls) && !this.inputMapper.uuids().includes(character.uuid)) {
        if (Config.instance.engine.debug) {
          console.info(`found ${character.uuid} using for input`)
        }
        found = character
      }
    })
    if (isBlank(found)) {
      if (Config.instance.engine.debug) {
        console.info('creating new player')
      }
      return this.addPlayer()
    } else {
      return found
    }
  }

  // use the mouse to detect player touching the screen on mobile
  // doMobileEvent happens on every tick
  doMouseEvent(event, raycaster) {
    if (!VirtualController.isAvailable()) { return }
    if (!isBlank(this.inputMapper.mobile)) { return }
    let target = this.findOrCreate()
    target.health.setText('M')
    this.inputMapper.mobile = target
  }

  doMobileEvent(target) {
    if (isBlank(target)) { return }
    if (!VirtualController.isAvailable()) { return }
    target.doMobileEvent(this.vj)
  }


  doKeyboardEvent(event) {
    let target = this.inputMapper.keyboard
    if (isBlank(target)) {
      this.inputMapper.keyboard = this.findOrCreate()
      target = this.inputMapper.keyboard
      target.health.setText('K')
    }
    target.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    if (event.type !== 'gamepadtick-vrum') { return }

    [
      this.inputMapper.gamepad1, this.inputMapper.gamepad2,
      this.inputMapper.gamepad3, this.inputMapper.gamepad4
    ].forEach((target, index) => {
      if (isBlank(target)) {
        if (!isBlank(event[index])) {
          let targetModel = this.findOrCreate()
          this.inputMapper[`gamepad${index + 1}`] = targetModel
          targetModel.health.setText(`G${index + 1}`)
        }
      } else {
        target.doGamepadEvent(event, index)
      }
    })
  }
}
