class Player extends Tank {
  constructor() {
    super()

    let control = new PositionXZRotationYControls()
    control.speed *= 2
    control.acceleration *= 2
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
    controlWeapon.speed *= 2
    controlWeapon.acceleration *= 2
    this.controlWeapon = controlWeapon

    let rayScanner = new RayScanner()
    // rayScanner.drawLines = true
    this.rayScanner = rayScanner
  }

  tick(tpf) {
    this.control.doMobileEvent()
    this.control.tick(tpf)
    this.controlWeapon.doMobileEvent()
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
  }

  doGamepadEvent(event) {
    this.control.doGamepadEvent(event)
    this.controlWeapon.doGamepadEvent(event)
  }
}
