class TutorialScene extends Scene {
  init(options) {
    addBaseLight(this)

    let camera = this.getCamera()
    camera.position.set(0, 35, 25)
    camera.lookAt(new THREE.Vector3(0, 0, 0))

    let island = AssetManager.clone('island.001.glb')
    Utils.addOutline(island)
    this.add(island)

    let sky = Utils.plane({size: 1000, color: '#29bbf4' })
    sky.position.set(0, 0, -30)
    this.add(sky)

    this.coins = []

    let coin = new Coin()
    coin.position.set(0, 2, 8)
    this.add(coin)
    this.coins.push(coin)
    this.coin = coin

    this.tanks = []

    let tank = new Tank()
    tank.position.set(0, 0, 1)
    this.tanks.push(tank)
    this.add(tank)
    this.tank = tank

    this.velY = 0
    this.velX = 0
    this.speed = 100
    this.acceleration = 10
    this.friction = 0.98
    let control = new Control()
    this.control = control

    this.targetRotationY = 0

    let vj = new VirtualController()
    this.vj = vj
  }

  tick(tpf) {
    if (Utils.isMobileOrTablet()) {
      let joy = this.vj.joystick1
      if (joy.right()) {
        this.doKeyboardEvent({type: 'keydown', code: 'KeyD'})
      } else {
        this.doKeyboardEvent({type: 'keyup', code: 'KeyD'})
      }
      if (joy.left()) {
        this.doKeyboardEvent({type: 'keydown', code: 'KeyA'})
      } else {
        this.doKeyboardEvent({type: 'keyup', code: 'KeyA'})
      }
      if (joy.down()) {
        this.doKeyboardEvent({type: 'keydown', code: 'KeyS'})
      } else {
        this.doKeyboardEvent({type: 'keyup', code: 'KeyS'})
      }
      if (joy.up()) {
        this.doKeyboardEvent({type: 'keydown', code: 'KeyW'})
      } else {
        this.doKeyboardEvent({type: 'keyup', code: 'KeyW'})
      }
    }
    let velY = this.velY
    let velX = this.velX
    let speed = this.speed
    let friction = this.friction
    let acceleration = this.acceleration
    let keys = this.control.keys

    if (this.control.is('Forward')) {
      if (velY > -speed) {
        velY -= tpf * acceleration
      }
      this.targetRotationY = Math.PI
    }

    if (this.control.is('Backward')) {
      if (velY < speed) {
        velY += tpf * acceleration
      }
      this.targetRotationY = 0
    }

    if (this.control.is('Left')) {
      if (velX > -speed) {
        velX -= tpf * acceleration
      }
      this.targetRotationY = Math.PI / 2 * 3
    }

    if (this.control.is('Right')) {
      if (velX < speed) {
        velX += tpf * acceleration
      }
      this.targetRotationY = Math.PI / 2
    }

    if (this.control.is('Forward') && this.control.is('Left')) {
      this.targetRotationY = (Math.PI + Math.PI / 2 * 3) / 2
    }
    if (this.control.is('Forward') && this.control.is('Right')) {
      this.targetRotationY = (Math.PI + Math.PI / 2) / 2
    }
    if (this.control.is('Backward') && this.control.is('Left')) {
      this.targetRotationY = (Math.PI * 2 + Math.PI / 2 * 3) / 2
    }
    if (this.control.is('Backward') && this.control.is('Right')) {
      this.targetRotationY = (0 + Math.PI / 2) / 2
    }

    let rSpeed = 12

    // var quaternion = new THREE.Quaternion()
    // quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), this.targetRotationY)
    // this.tank.quaternion.slerp(quaternion, (rSpeed * tpf))

    let diff = Math.abs(this.tank.rotation.y - this.targetRotationY)
    if (diff >= rSpeed * tpf) {
      let tankR = Utils.radiansToDeg(this.tank.rotation.y)
      let targetR = Utils.radiansToDeg(this.targetRotationY)
      if (Utils.calcShortestRotDirection(tankR, targetR)) {
        this.tank.rotation.y += rSpeed * tpf
      } else {
        this.tank.rotation.y -= rSpeed * tpf
      }
    this.tank.rotation.y = Utils.normalizeRadians(this.tank.rotation.y)
    } else {
      this.tank.rotation.y = this.targetRotationY
    }

    if (this.control.isMoving()) {
      let wheelSpeed = 2
      this.tank.wheelFL.tick(tpf * wheelSpeed)
      this.tank.wheelFR.tick(tpf * wheelSpeed)
      this.tank.wheelBL.tick(tpf * wheelSpeed)
      this.tank.wheelBR.tick(tpf * wheelSpeed)
    }

    let y = this.tank.position.z
    let x = this.tank.position.x

    velY *= friction;
    y += velY;
    velX *= friction;
    x += velX;

    this.coins.forEach((coin) => {
      coin.rotation.y += tpf
    })

    this.tank.position.x += velX
    this.tank.position.z += velY
  }

  fuck(from, to) {
  }

  doKeyboardEvent(event) {
    this.control.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    if (event.type !== 'gamepadtick-vrum') { return }
    let gamepad = event[0]
      if (isBlank(gamepad)) { return }

    if (gamepad.axes[0] > 0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'KeyD'})
    } else {
      this.doKeyboardEvent({type: 'keyup', code: 'KeyD'})
    }
    if (gamepad.axes[0] < -0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'KeyA'})
    } else {
      this.doKeyboardEvent({type: 'keyup', code: 'KeyA'})
    }
    if (gamepad.axes[1] > 0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'KeyS'})
    } else {
      this.doKeyboardEvent({type: 'keyup', code: 'KeyS'})
    }
    if (gamepad.axes[1] < -0.5) {
      this.doKeyboardEvent({type: 'keydown', code: 'KeyW'})
    } else {
      this.doKeyboardEvent({type: 'keyup', code: 'KeyW'})
    }
  }
}
