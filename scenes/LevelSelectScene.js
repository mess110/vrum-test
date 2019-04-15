class LevelSelectScene extends Scene {
  init(options) {
    addBaseLight(this)
    Utils.addCEButton({ type: 'fullscreen', position: 'bottom-left' })
    Utils.setCursor('assets/hand.png')

    let camera = Hodler.get('camera')
    camera.position.set(0, 15, 25)
    camera.lookAt(new THREE.Vector3(0, 0, -15))

    let sky = Utils.plane({size: 1000, color: Config.instance.vax.skyColor})
    sky.position.set(0, 0, -50)
    sky.lookAt(camera.position)
    this.add(sky)

    this.buttons = []

    this.initClouds()

    let island = AssetManager.clone('island.002.glb')
    island.position.set(0, 0, 11)
    island.rotation.set(-0.6, 0, 0)
    // island.rotation.set(-0.6, -0.9, 0)
    // Utils.addOutline(island)
    this.add(island)
    island.shadowReceive()
    this.island = island

    this.mouseDown = false
    this.stopAutoRotate = false
    this.heldButton = undefined

    let buttonModels = new THREE.Object3D()

    let tutorialButton = new Button3D('tutorial')
    tutorialButton.position.set(0, 3, 0)
    tutorialButton.onClick = () => {
      tutorialButton.isEnabled = false
      Engine.switch(tutorialScene)
    }
    buttonModels.add(tutorialButton)
    this.buttons.push(tutorialButton)

    let playButton = new Button3D('campaign')
    playButton.position.set(0, 0, 0)
    playButton.onClick = () => {
      playButton.isEnabled = false
      Engine.switch(buildScene)
    }
    buttonModels.add(playButton)
    this.buttons.push(playButton)

    let multiplayerButton = new Button3D('multiplayer')
    multiplayerButton.position.set(0, -3, 0)
    multiplayerButton.onClick = () => {
      multiplayerButton.isEnabled = false
      Engine.switch(lobbyBrowserScene)
    }
    buttonModels.add(multiplayerButton)
    this.buttons.push(multiplayerButton)

    let creditsButton = new Button3D('credits')
    creditsButton.position.set(0, -6, 0)
    creditsButton.onClick = () => {
      creditsButton.isEnabled = false
      Engine.switch(creditsScene)
    }
    buttonModels.add(creditsButton)
    this.buttons.push(creditsButton)

    this.add(buttonModels)
    let p = AssetManager.clone('plaque.001.glb')
    Utils.addOutline(p)
    p.position.set(0, -2.75, -0.5)
    buttonModels.add(p)
    buttonModels.position.set(-6.95, 8.5, 7.9)
    // buttonModels.position.set(0, 8.5, 7.9)
    buttonModels.lookAt(camera.position)
    this.buttonModels = buttonModels

    this.keyboardFocused = undefined
    this.leftArray = [0, 1, 2, 3].toCyclicArray()
    this.leftArray.prev()

    this.lastGamepadEventTime = 0
  }

  uninit() {
    Utils.removeCEButtons()
  }

  initClouds() {
    let om = Utils.outlineMaterial('white', 0.001)

    let cloud = AssetManager.clone('cloud.001.glb')
    cloud.position.set(-50, 15, -30)
    cloud.rotation.set(-0.25, 0, 0)
    cloud.setOpacity(0.4)
    Utils.addOutline(cloud, 10, om)
    cloud.outline.setOpacity(0.1)
    this.add(cloud)

    let scanEasing = TWEEN.Easing.Quadratic.InOut
    let scanDuration = 4000
    var up = new BaseModifier(cloud.rotation, { x: '+0.5' }, scanDuration, scanEasing)
    var down = new BaseModifier(cloud.rotation, { x: '-0.5' }, scanDuration, scanEasing)
    up.chain(down)
    down.chain(up)
    up.start()

    scanDuration = 20000
    var left = new BaseModifier(cloud.position, { x: '+100' }, scanDuration, scanEasing)
    var right = new BaseModifier(cloud.position, { x: '-100' }, scanDuration, scanEasing)
    left.chain(right)
    right.chain(left)
    left.start()
  }

  tick(tpf) {
    this.buttons.forEach((button) => {
      button.tick(tpf)
    })
    this.island.rotation.y += tpf / 100
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

      let hasHover = false
      this.buttons.forEach((button) => {
        hasHover = hasHover || button.isHovered
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
