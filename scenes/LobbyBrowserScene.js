class LobbyBrowserScene extends Scene {
  init(options) {
    addBaseLight(this)

    let camera = this.getCamera()
    camera.position.set(0, 0, 10)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Utils.addOutline(cannon)
    let wip = new BaseText({
      text: 'WIP', fillStyle: 'white', align: 'center',
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'})
    wip.scale.setScalar(2.5)
    wip.lookAt(camera.position)
    this.add(wip)
  }

  tick(tpf) {
  }

  doMouseEvent(event, raycaster) {
    // console.log(`${event.type} ${event.which} ${event.x}:${event.y} ${event.wheelDelta}`)
    if (event.type == 'mousedown') {
      this.alreadySwitching = true
      Engine.switch(menuScene)
    }
  }

  doKeyboardEvent(event) {
    // console.log(`${event.type} ${event.code} (${event.which})`)
    if (event.type != 'keydown') { return }
    if (this.alreadySwitching) { return }

    if (event.code == 'Space') {
      this.alreadySwitching = true
      Engine.switch(menuScene)
    }
  }

  doGamepadEvent(event) {
    if (event.type != 'gamepadtick-vrum') { return }
    if (this.alreadySwitching) { return }
    let gamepad = event[0]

    if (gamepad.buttons[0].pressed) {
      this.alreadySwitching = true
      Engine.switch(menuScene)
    }
  }
}
