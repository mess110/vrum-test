class Menu extends THREE.Object3D {
}

class MenuButton extends THREE.Object3D {
  constructor(s) {
    super()

    let bg = AssetManager.clone('button.bg.001.glb')
    this.add(bg)
    this.bg = bg

    let fg = AssetManager.clone('button.fg.001.glb')
    this.add(fg)
    this.fg = fg

    let text = new BaseText({
      text: s, fillStyle: 'white',
      canvasW: 512, canvasH: 512, align: 'center',
      font: '84px luckiest-guy'})
    text.position.set(0, -1.4, 0.7)
    text.scale.set(1, 1, 1)
    fg.add(text)

    this.isHovered = false
    this.isPressed = false
    this.isEnabled = true
    this.pressSpeed = 4
    this.growSpeed = 2
    this.isMobileOrTablet = Utils.isMobileOrTablet()
  }

  tick(tpf) {
    let scale = this.scale.x
    if (this.isHovered) {
      let maxScale = 1.2
      scale += tpf * this.growSpeed
      if (scale > maxScale) { scale = maxScale }
    } else {
      let minScale = 1
      scale -= tpf * this.growSpeed
      if (scale < minScale) { scale = minScale }
    }
    this.scale.setScalar(scale)

    let z = this.fg.position.z
    if (this.isPressed) {
      let minZ = -0.3
      z -= tpf * this.pressSpeed
      if (z < minZ) { z = minZ }
    } else {
      let maxZ = 0
      z += tpf * this.pressSpeed
      if (z > maxZ) { z = maxZ }
    }
    this.fg.position.z = z
  }

  doMouseEvent(event, raycaster) {
    if (this.isMobileOrTablet) {
      this.doMobileEvent(event, raycaster)
    } else {
      this.doPCEvent(event, raycaster)
    }
  }

  doMobileEvent(event, raycaster) {
    if (event.type == 'mousedown' || event.type == 'mouseup') {
      let intersections = raycaster.intersectObject(this, true)
      intersections = intersections.filter((e) => !(e.object instanceof BaseText))

      if (intersections.any() && event.type == 'mousedown') {
        this.isPressed = true
      }
      if (event.type == 'mouseup') {
        this.isPressed = false
        if (intersections.any()) {
          this.click()
        }
      }
    }
  }

  doPCEvent(event, raycaster) {
    if (event.type == 'mousemove') {
      let intersections = raycaster.intersectObject(this, true)
      intersections = intersections.filter((e) => !(e.object instanceof BaseText))
      this.isHovered = intersections.any()
    }

    if (event.type == 'mousedown') {
      if (this.isHovered) {
        this.isPressed = true
      }
    }
    if (event.type == 'mouseup') {
      this.isPressed = false
      if (this.isHovered) {
        this.click()
      }
    }
  }

  doGamepadEvent(event) {
    if (event.type !== 'gamepadtick-vrum') { return }
    // console.log(event[0].axes)
    let button = event[0].buttons[0]
    if (button.pressed) {
    }
    // if (button.)
  }

  click() {
    console.log('click')
  }
}
