class GameScene extends Scene {
  init(options) {
    this.savedOptions = options

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

    let sky = Utils.plane({size: 1000, color: Config.instance.vax.skyColor })
    sky.position.set(0, 0, -100)
    sky.lookAt(camera.position)
    this.add(sky)

    this.respawner = new Respawner()
    this.characters = []
    this.collidables = [islandWalk]
    this.vrumKey = Utils.guid()

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
    if (isBlank(options.vrumKey)) { options.vrumKey = Utils.guid() }

    let tank = new Player()
    tank.vrumKey = options.vrumKey
    tank.position.set(options.position.x, options.position.y, options.position.z)
    tank.fromJsonModel(options.model)
    tank.rayScanner.collidables = this.collidables
    tank.shadowCastAndNotReceive()
    tank.health.shadowNone()

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
    if (!tank.isBot) {
      this.respawner.add(tank)
    }
    this.remove(tank)
  }

  getLerpTarget() {
    let x, y, z
    let items = this.characters
      .filter((e) => { return !e.isBot })
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

  findOrCreate(vrumKey) {
    let vrumOwner
    if (isBlank(vrumKey)) {
      vrumKey = this.vrumKey
    }
    vrumOwner = vrumKey
    let found

    this.characters.forEach((character) => {
      if (vrumKey == character.vrumKey) {
        found = character
      }
    })
    if (isBlank(found)) {
      let char = this.addPlayer({ model: this.savedOptions.model, vrumKey: vrumKey })
      char.vrumNetNeedsInit = true
      char.vrumOwner = vrumOwner
      return char
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
    target.health.setText(`${Config.instance.vax.MOBILE}: ${target.vrumKey}`)
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
      target.health.setText(`${Config.instance.vax.KEYBOARD}: ${target.vrumKey}`)
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
          let target = this.findOrCreate()
          this.inputMapper[`gamepad${index + 1}`] = target
          let which = Config.instance.vax[`GAMEPAD${index + 1}`]
          target.health.setText(`${which}: ${target.vrumKey}`)
        }
      } else {
        target.doGamepadEvent(event, index)
      }
    })
  }

  doNetworkTick(data, cmKey) {
    data.bullets.forEach((bullet) => {
      let bulletOwner = this.characters.filter((e) => { return bullet.vrumKey == e.vrumKey }).first()
      if (bulletOwner.isNetwork) {
        PoolManager.spawn(Bullet, bullet)
      }
    })
    data.characters.forEach((char) => {
      let key = char.vrumKey
      let target = this.findOrCreate(key)
      if (target.vrumNetNeedsInit) {
        delete target.vrumNetNeedsInit
        target.fromJsonModel(char.model)
        target.shootCooldown = char.shootCooldown
        target.speed = char.speed
        target.acceleration = char.acceleration
        this.inputMapper.peer2key[cmKey] = key
        if (char.isBot) {
          target.isBot = true
          target.health.setText(`${Config.instance.vax.BOT_NETWORK}: ${key}`)
        } else {
          target.health.setText(`${Config.instance.vax.NETWORK}: ${key}`)
        }
      }
      target.isNetwork = true
      target.control.keys = char.control
      target.controlWeapon.keys = char.controlWeapon
      target.shooting = char.shooting
      if (Measure.distanceBetween(target, char.position) > 2) {
        target.position.set(char.position.x, char.position.y, char.position.z)
      }
    })
  }

  doVrumControllerTick(data, cmKey) {
    if (this.respawner.has(data.vrumKey)) { return }
    let target = this.findOrCreate(data.vrumKey)

    if (target.vrumNetNeedsInit) {
      delete target.vrumNetNeedsInit
      target.defaultSkin()
      target.health.setText(`${Config.instance.vax.CONTROLLER}: ${target.vrumKey}`)
      target.isNetwork = true
      target.isController = true
      this.inputMapper.peer2key[cmKey] = target.vrumKey
    }
    target.doVrumControllerEvent(data)
  }
}
