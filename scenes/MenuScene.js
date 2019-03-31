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

    let ground = Utils.plane({size: 1000, color: '#55AA55' })
    ground.position.set(0, 0, -30)
    // ground.rotation.set(Math.PI / 2, 0, 0)
    this.add(ground)

    this.tanks = []
    this.buttons = []

    let tank = new Tank()
    tank.position.set(36.33804182448716, -13.380791386191827, -9.071187079287736)
    tank.rotation.set(-0.5880026035475676, -1, 0)
    tank.scale.setScalar(3)
    tank.changeChassis(tank.chassises.items.shuffle().first())
    tank.changeWheels(tank.wheels.items.shuffle().first())
    tank.changeWeapon(tank.weapons.items.shuffle().first())
    this.tanks.push(tank)
    this.add(tank)

    let duration = 2000
    let pos = {
      x: 10.168294196961579,
      y: -4.0599411590172,
      z: 4.9100882614742005
    }
    new BaseModifier(tank.position, pos, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheelFR.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheelFL.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheelBL.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()
    new BaseModifier(tank.wheelBR.rotation, { x: '+9' }, duration, TWEEN.Easing.Bounce.Out).start()

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

    let sky = new Sky()
    sky.updateSun(sky.distance, 0.1, sky.azimuth)
    this.add(sky)
    this.sky = sky

    this.mouseDown = false
    this.stopAutoRotate = false
    this.heldButton = undefined

    let tutorialButton = new MenuButton('tutorial')
    tutorialButton.position.set(-3, 1, 0)
    tutorialButton.lookAt(Hodler.get('camera').position)
    tutorialButton.position.set(-8, 3, 1)
    tutorialButton.rotation.x -= 0.1
    tutorialButton.onClick = () => {
      tutorialButton.isEnabled = false
      Engine.switch(tutorialScene)
    }
    this.add(tutorialButton)
    this.buttons.push(tutorialButton)

    let playButton = new MenuButton('play')
    playButton.position.set(-3, 1, 0)
    playButton.lookAt(Hodler.get('camera').position)
    playButton.position.set(-8, 0, 2)
    playButton.rotation.x -= 0.1
    playButton.onClick = () => {
      playButton.isEnabled = false
      Engine.switch(buildScene)
    }
    this.add(playButton)
    this.buttons.push(playButton)

    let creditsButton = new MenuButton('credits')
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
  }

  tick(tpf) {
    this.tanks.forEach((tank) => {
      // tank.tick(tpf)
    })
    this.buttons.forEach((button) => {
      button.tick(tpf)
    })
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
