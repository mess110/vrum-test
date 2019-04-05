class Player extends Tank {
  constructor() {
    super()

    this.speed = 10
    this.acceleration = 2
    this.shootCooldown = 0.3
    this.timeSinceLastShot = 0

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


    if (VirtualController.isAvailable()) {
      control.vj.joystickRight.destroy()
      controlWeapon.vj.joystickLeft.destroy()
      controlWeapon.vjbindings.TargetJoystick = 'joystickRight'
    }

    let rayScanner = new RayScanner()
    // rayScanner.drawLines = true
    this.rayScanner = rayScanner
  }

  uninit() {
    if (VirtualController.isAvailable()) {
      this.control.vj.uninit()
      this.controlWeapon.vj.uninit()
    }
  }

  shoot() {
    if (this.timeSinceLastShot < this.shootCooldown) {
      return
    }
    this.timeSinceLastShot = 0
    PoolManager.spawn(Bullet, { from: this })
  }

  tick(tpf) {
    this.timeSinceLastShot += tpf

    this.doMobileEvent(tpf)

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

  doMobileEvent(tpf) {
    this.control.doMobileEvent()
    this.control.tick(tpf)
    this.controlWeapon.doMobileEvent()
    let joystick = this.controlWeapon.getMobileTargetJoystick()
    if (!isBlank(joystick)) {
      let deltaX = joystick.deltaX()
      let deltaY = joystick.deltaY()

      if (deltaX > 40 || deltaX < -40 || deltaY > 40 || deltaY < -40) {
        this.shoot()
      }
    }
    this.controlWeapon.tick(tpf)
  }
}
