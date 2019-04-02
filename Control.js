class Control {
  constructor() {
    this.keys = {}
    this.keybindings = {
      'Forward': 'KeyW',
      'Backward': 'KeyS',
      'Left': 'KeyA',
      'Right': 'KeyD',
      'RotateLeft': 'ArrowLeft',
      'RotateRight': 'ArrowRight'
    }
  }


  doKeyboardEvent(event) {
    if (!Object.values(this.keybindings).includes(event.code)) { return }
    this.keys[event.code] = event.type == "keydown"
  }

  is(which) {
    return this.keys[this.keybindings[which]]
  }

  isMoving() {
    return this.is('Forward') || this.is('Backward') || this.is('Left') || this.is('Right')
  }
}
