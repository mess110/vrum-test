class BuildScene extends Scene {
  init(options) {
    addBaseLight(this)

    let barrel = AssetManager.clone('barrel.001.glb')
    barrel.position.set(0, -4.5, 0)
    this.add(barrel)

    for (var i = 0; i < 10; i++) {
      let wall = AssetManager.clone('wall.001.glb')
      wall.position.set(-30 + i * 6, -4.5, -10)
      wall.rotation.set(0, Math.PI, 0)
      this.add(wall)
    }

    let ground = Utils.plane({width: 60, height: 20, color: '#55AA55' })
    ground.position.set(0, -4.5, 0)
    ground.rotation.set(Math.PI / 2, 0, 0)
    this.add(ground)

    this.tanks = []
    this.buttons = []

    let tank = new Tank()
    tank.position.set(0, 0, 1)
    this.tanks.push(tank)
    this.add(tank)

    let sky = new Sky()
    sky.updateSun(sky.distance, 0.1, sky.azimuth)
    this.add(sky)
    this.sky = sky

    this.mouseDown = false
    this.stopAutoRotate = false
    this.heldButton = undefined

    let chassisButton = new MenuButton('chassis')
    chassisButton.position.set(-7, 4.75, -3)
    chassisButton.lookAt(Hodler.get('camera').position)
    chassisButton.onClick = () => {
      Hodler.get('scene').tanks[0].nextChassis()
    }
    this.add(chassisButton)
    this.buttons.push(chassisButton)

    let weaponButton = new MenuButton('weapon')
    weaponButton.position.set(0, 5, -3)
    weaponButton.lookAt(Hodler.get('camera').position)
    weaponButton.onClick = () => {
      Hodler.get('scene').tanks[0].nextWeapon()
    }
    this.add(weaponButton)
    this.buttons.push(weaponButton)

    let wheelButton = new MenuButton('wheels')
    wheelButton.position.set(7, 4.75, -3)
    wheelButton.lookAt(Hodler.get('camera').position)
    wheelButton.onClick = () => {
      Hodler.get('scene').tanks[0].nextWheels()
    }
    this.add(wheelButton)
    this.buttons.push(wheelButton)

    let saveButton = new MenuButton('start')
    saveButton.position.set(0, -2, 4)
    saveButton.lookAt(Hodler.get('camera').position)
    saveButton.onClick = () => {
      saveButton.isEnabled = false
      Engine.switch(gameScene)
    }
    this.add(saveButton)
    this.buttons.push(saveButton)

    this.resetMenu()
    this.lastGamepadEventTime = 0
  }

  resetMenu() {
    this.leftArray = [0, 1, 2].toCyclicArray()
    this.leftArray.next()
  }

  tick(tpf) {
    this.tanks.forEach((tank) => {
      tank.wheelFL.tick(-tpf)
      tank.wheelFR.tick(tpf)
      tank.wheelBL.tick(-tpf)
      tank.wheelBR.tick(tpf)
      tank.rotation.y += tpf
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
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      if (event.type !== 'keydown') { return }

      this.buttons.forEach((button) => {
        button.isHovered = false
      })

      if (event.code == 'ArrowDown') {
        this.resetMenu()
        this.buttons[3].isHovered = true
      }

      let topIsHovered = this.buttons[0].isHovered || this.buttons[1].isHovered || this.buttons[2].isHovered
      if (event.code == 'ArrowUp') {
        this.resetMenu()
        if (!topIsHovered) {
          this.buttons[1].isHovered = true
        }
      }
      if (event.code == 'ArrowLeft') {
        if (!topIsHovered) {
          this.buttons[this.leftArray.prev()].isHovered = true
        }
      }
      if (event.code == 'ArrowRight') {
        if (!topIsHovered) {
          this.buttons[this.leftArray.next()].isHovered = true
        }
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
