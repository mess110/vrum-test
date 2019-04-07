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
    this.control.doKeyboardEvent({code: this.control.keybindings['Forward'], type: 'keyup'})
    this.control.doKeyboardEvent({code: this.control.keybindings['Backward'], type: 'keyup'})
    this.control.doKeyboardEvent({code: this.control.keybindings['Left'], type: 'keyup'})
    this.control.doKeyboardEvent({code: this.control.keybindings['Right'], type: 'keyup'})

    this.control.doKeyboardEvent({code: this.control.keybindings[direction], type: 'keydown'})
  }

  turn(direction) {
    this.controlWeapon.doKeyboardEvent({code: this.controlWeapon.keybindings[direction], type: 'keydown'})
    this.controlWeapon.doKeyboardEvent({code: this.controlWeapon.keybindings[direction], type: 'keyup'})
  }
}
