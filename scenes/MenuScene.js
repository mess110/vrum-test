class MenuScene extends Scene {
  init(options) {
    addBaseLight(this)

    let camera = Hodler.get('camera')
    camera.position.set(0, 10, 15)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let wall = AssetManager.clone('wall.001.glb')
    wall.position.set(-20, -2, -6)
    wall.scale.setScalar(8)
    wall.rotation.set(2.6415926535897927, 0, -1.5707963267948966)
    // Utils.addOutline(wall)
    this.wall = wall
    this.add(wall)

    let sky = Utils.plane({size: 1000, color: Config.instance.vax.skyColor})
    sky.position.set(0, 0, -30)
    this.add(sky)

    this.buttons = []

    let tank = new Tank()
    tank.position.set(36.33804182448716, -13.380791386191827, -9.071187079287736)
    tank.rotation.set(-0.5880026035475676, -1, 0)
    tank.scale.setScalar(3)
    tank.setModel(tank.chassisModels.items.shuffle().first())
    tank.changeWheels(tank.wheelModels.items.shuffle().first())
    tank.changeWeapon(tank.weaponModels.items.shuffle().first())
    // tank.visible = false
    this.add(tank)

    this.initClouds()

    let coin = new Coin()
    coin.position.set(0.5, 0, 0)
    this.add(coin)
    this.coin = coin

    let ground = AssetManager.clone('ground.001.glb')
    ground.position.set(10, -8, 4.9)
    ground.rotation.set(-0.5880026035475676, -1, 0)
    ground.scale.setScalar(3)
    ground.translateZ(-18.5 * 2 - 7)
    this.add(ground)

    let duration = 2000
    let pos = {
      x: 10.168294196961579,
      y: -4.0599411590172,
      z: 4.9100882614742005
    }
    new BaseModifier(tank.position, pos, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheels.wheelFR.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheels.wheelFL.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheels.wheelBL.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheels.wheelBR.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()

    let scanEasing = TWEEN.Easing.Elastic.Out
    let scanDuration = 4000
    var up = new BaseModifier(tank.weapon.rotation, { y: '+0.5' }, scanDuration, scanEasing)
    var down = new BaseModifier(tank.weapon.rotation, { y: '-0.5' }, scanDuration, scanEasing)
    down.delay(4000)
    up.delay(4000)
    up.chain(down)
    down.chain(up)
    this.setTimeout(() => {
      let left = new BaseModifier(tank.weapon.rotation, { y: '-0.25' }, scanDuration / 2, scanEasing)
      left.chain(up)
      left.start()
    }, duration + 100)

    this.mouseDown = false
    this.stopAutoRotate = false
    this.heldButton = undefined

    let tutorialButton = new Button3D('tutorial')
    tutorialButton.position.set(-3, 1, 0)
    tutorialButton.lookAt(Hodler.get('camera').position)
    tutorialButton.position.set(-8, 5.5, 0)
    tutorialButton.rotation.x -= 0.1
    tutorialButton.onClick = () => {
      tutorialButton.isEnabled = false
      Engine.switch(tutorialScene)
    }
    this.add(tutorialButton)
    this.buttons.push(tutorialButton)

    let playButton = new Button3D('campaign')
    playButton.position.set(-3, 1, 0)
    playButton.lookAt(Hodler.get('camera').position)
    playButton.position.set(-8, 2.8, 1)
    playButton.rotation.x -= 0.1
    playButton.onClick = () => {
      playButton.isEnabled = false
      Engine.switch(buildScene)
    }
    this.add(playButton)
    this.buttons.push(playButton)

    let multiplayerButton = new Button3D('multiplayer')
    multiplayerButton.position.set(-3, 1, 0)
    multiplayerButton.lookAt(Hodler.get('camera').position)
    multiplayerButton.position.set(-8, 0, 2)
    multiplayerButton.rotation.x -= 0.1
    multiplayerButton.onClick = () => {
      multiplayerButton.isEnabled = false
      Engine.switch(lobbyBrowserScene)
    }
    this.add(multiplayerButton)
    this.buttons.push(multiplayerButton)

    let creditsButton = new Button3D('credits')
    creditsButton.position.set(-3, 1, 0)
    creditsButton.lookAt(Hodler.get('camera').position)
    creditsButton.position.set(-8, -3, 3)
    creditsButton.rotation.x -= 0.1
    creditsButton.onClick = () => {
      creditsButton.isEnabled = false
      Engine.switch(creditsScene)
    }
    this.add(creditsButton)
    this.buttons.push(creditsButton)

    this.keyboardFocused = undefined
    this.leftArray = [0, 1, 2].toCyclicArray()
    this.leftArray.prev()

    this.lastGamepadEventTime = 0

    let gameName = new BaseText({
      text: 'Vax Albina', fillStyle: 'white', align: 'center',
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'})
    gameName.scale.setScalar(2.5)
    gameName.lookAt(camera.position)
    gameName.position.set(3.8, -1, 11)
    this.add(gameName)
  }

  initClouds() {
    let om = Utils.outlineMaterial('white', 0.001)

    let cloud = AssetManager.clone('cloud.001.glb')
    cloud.position.set(-10, 1, -20)
    cloud.rotation.set(-0.25, 0, 0)
    Utils.addOutline(cloud, 10, om)
    this.add(cloud)

    let scanEasing = TWEEN.Easing.Quadratic.InOut
    let scanDuration = 4000
    var up = new BaseModifier(cloud.rotation, { x: '+0.5' }, scanDuration, scanEasing)
    var down = new BaseModifier(cloud.rotation, { x: '-0.5' }, scanDuration, scanEasing)
    up.chain(down)
    down.chain(up)
    up.start()

    // let scanDuration = 4000
    var left = new BaseModifier(cloud.position, { x: '+50' }, scanDuration, scanEasing)
    var right = new BaseModifier(cloud.position, { x: '-50' }, scanDuration, scanEasing)
    left.chain(right)
    right.chain(left)
    left.start()
  }

  tick(tpf) {
    this.buttons.forEach((button) => {
      button.tick(tpf)
    })
    this.coin.rotation.y += tpf
  }

  doMouseEvent(event, raycaster) {
    if (event.type == 'mousedown') {
      this.mouseDown = true
    }
    if (event.type == 'mouseup') {
      this.mouseDown = false
    }
    this.buttons.forEach((button) => {
      button.doMouseEvent(event, raycaster)
    })
  }

  doKeyboardEvent(event) {
    if (['ArrowUp', 'ArrowDown'].includes(event.code)) {
      if (event.type !== 'keydown') { return }

      let hasHover = this.buttons[0].isHovered || this.buttons[1].isHovered || this.buttons[2].isHovered
      this.buttons.forEach((button) => {
        button.isHovered = false
      })

      if (event.code == 'ArrowDown') {
        this.buttons[this.leftArray.next()].isHovered = true
      }

      if (event.code == 'ArrowUp') {
        if (!hasHover) {
          this.leftArray.next()
        }
        this.buttons[this.leftArray.prev()].isHovered = true
      }
    }

    if (event.code == 'Space' || event.code == 'Enter') {
      this.buttons.forEach((button) => {
        if (button.isHovered) {
          if (event.type == 'keyup') {
            button.click()
          }
          button.isPressed = event.type == 'keydown'
        }
      })
    }
  }

  doGamepadEvent(event) {
    if (event.type !== 'gamepadtick-vrum') { return }
    if (this.lastGamepadEventTime + 0.2 > this.uptime) {
      return
    }
    let gamepad = event[0]
    if (gamepad.axes[1] > 0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'ArrowDown'})
      this.lastGamepadEventTime = this.uptime
    }
    if (gamepad.axes[1] < -0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'ArrowUp'})
      this.lastGamepadEventTime = this.uptime
    }
    if (gamepad.axes[0] < -0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'ArrowLeft'})
      this.lastGamepadEventTime = this.uptime
    }
    if (gamepad.axes[0] > 0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'ArrowRight'})
      this.lastGamepadEventTime = this.uptime
    }
    if (gamepad.buttons[0].pressed) {
      this.doKeyboardEvent({type: 'keydown', code: 'Space'})
      this.setTimeout(() => {
        this.doKeyboardEvent({type: 'keyup', code: 'Space'})
      }, 100)
      this.lastGamepadEventTime = this.uptime
    }
  }
}
