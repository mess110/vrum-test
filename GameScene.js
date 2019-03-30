class GameScene extends Scene {
  init(options) {
    let camera = this.getCamera()
    camera.position.set(0, 0, 30)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    // Utils.addOutline(cannon)
  }

  tick(tpf) {
  }

  doMouseEvent(event, raycaster) {
    console.log(`${event.type} ${event.which} ${event.x}:${event.y} ${event.wheelDelta}`)
  }

  doKeyboardEvent(event) {
    console.log(`${event.type} ${event.code} (${event.which})`)
  }

  doGamepadEvent(event) {
    // console.log(event.type)
  }
}
