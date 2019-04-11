class Player extends Tank {
  constructor() {
    super()

    this.speed = 10
    this.acceleration = 2
    this.shootCooldown = 0.3
    this.timeSinceLastShot = 0
    this.size = 4


    let control = new PositionXZRotationYControls()
    control.speed = this.speed
    control.acceleration = this.acceleration
    this.control = control

    let controlWeapon = new PositionXZRotationYControls()
    controlWeapon.keybindings = {
      'Forward': 'ArrowUp',
      'Backward': 'ArrowDown',
      'Left': 'ArrowLeft',
      'Right': 'ArrowRight',
    }
    controlWeapon.gamepadbindings = {
      'StickLeftRight': 2,
      'StickUpDown': 3,
    }
    controlWeapon.speed = this.speed
    controlWeapon.acceleration *= this.acceleration
    this.controlWeapon = controlWeapon

    let rayScanner = new RayScanner()
    // rayScanner.drawLines = Config.instance.engine.debug
    this.rayScanner = rayScanner

    let boundingCube = Utils.boundingBox({size: this.size})
    boundingCube.position.y = 2
    this.add(boundingCube)
    this.boundingCube = boundingCube
  }

  shoot() {
    if (this.timeSinceLastShot < this.shootCooldown) {
      return
    }
    this.timeSinceLastShot = 0
    PoolManager.spawn(Bullet, { from: this })
  }

  move(direction) {
    this._controlAction(this.control, direction)
  }

  turn(direction) {
    this._controlAction(this.controlWeapon, direction)
  }

  _controlAction(control, direction) {
    control.doKeyboardEvent({code: control.keybindings['Forward'], type: 'keyup'})
    control.doKeyboardEvent({code: control.keybindings['Backward'], type: 'keyup'})
    control.doKeyboardEvent({code: control.keybindings['Left'], type: 'keyup'})
    control.doKeyboardEvent({code: control.keybindings['Right'], type: 'keyup'})

    if (!isArray(direction)) {
      direction = [direction]
    }
    direction.forEach((dir) => {
      control.doKeyboardEvent({code: control.keybindings[dir], type: 'keydown'})
    })
  }

  tick(tpf) {
    this.timeSinceLastShot += tpf

    this.control.tick(tpf)
    this.controlWeapon.tick(tpf)

    if (this.control.isMoving()) {
      this.wheels.tick(tpf * 2)
    }

    this.chassis.rotation.y = this.control.rotationY
    this.wheels.rotation.y = this.control.rotationY
    this.weapon.rotation.y = this.controlWeapon.rotationY

    let fromPosition = this.position.clone()
    fromPosition.y += 2
    this.rayScanner.scan(fromPosition, this.control.velocity)

    if (this.rayScanner.addX) {
      this.position.x += this.control.velocity.x
    }
    if (this.rayScanner.addZ) {
      this.position.z += this.control.velocity.z
    }
  }

  doKeyboardEvent(event) {
    this.control.doKeyboardEvent(event)
    this.controlWeapon.doKeyboardEvent(event)

    if (event.type == 'keydown' && event.code == 'Space') {
      this.shoot()
    }
  }

  doGamepadEvent(event) {
    this.control.doGamepadEvent(event)
    this.controlWeapon.doGamepadEvent(event)

    let gamepad = event[0]
    if (isBlank(gamepad)) { return }
    if (gamepad.buttons[0].pressed) {
      this.shoot()
    }
    if (this.controlWeapon.getGamepadDeltaX(gamepad) > 0.85 ||
        this.controlWeapon.getGamepadDeltaX(gamepad) < -0.85 ||
        this.controlWeapon.getGamepadDeltaY(gamepad) > 0.85 ||
        this.controlWeapon.getGamepadDeltaY(gamepad) < -0.85) {
      this.shoot()
    }
  }
}
