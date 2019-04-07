class Bot extends Player {
  constructor() {
    super()
  }

  tick(tpf) {
    super.tick(tpf)
  }

  shoot() {
    super.shoot()
  }

  move(direction) {
    this.controlAction(this.control, direction)
  }

  turn(direction) {
    this.controlAction(this.controlWeapon, direction)
  }

  controlAction(control, direction) {
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
}
