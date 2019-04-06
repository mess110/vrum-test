class TutorialScene extends Scene {
  init(options) {
    addBaseLight(this)
    Utils.setCursor('none')

    let camera = this.getCamera()
    camera.position.set(0, 35, 25)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    camera.position.set(0, 80, 80)

    let island = AssetManager.clone('island.002.glb')
    // Utils.addOutline(island)
    this.add(island)
    this.island = island

    let sky = Utils.plane({size: 1000, color: '#29bbf4' })
    sky.position.set(0, 0, -100)
    sky.lookAt(camera.position)
    this.add(sky)

    this.collidables = [island]

    let tank = new Player()
    tank.rayScanner.collidables = this.collidables
    this.add(tank)
    this.tank = tank

    let tutorialText = '    WASD KEYS   TO MOVE'
    if (VirtualController.isAvailable()) {
      tutorialText = '          LEFT              JOYSTICK     TO MOVE'
    }
    this.tutorialText = new BaseText({
      text: tutorialText, fillStyle: 'white', align: 'center',
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'})
    this.tutorialText.scale.setScalar(8)
    this.tutorialText.rotation.set(-Math.PI / 2, 0, 0)
    this.tutorialText.position.set(0, 0.1, 18)
    this.add(this.tutorialText)

    this.tutorialStage = 0
  }

  setTutorial(key) {
    let easing = TWEEN.Easing.Cubic.InOut
    if (!isBlank(this.fadeIn)) {
      this.fadeIn.stop()
      this.fadeIn = undefined
    }
    if (!isBlank(this.fadeOut)) {
      this.fadeOut.stop()
      this.fadeOut = undefined
    }
    this.fadeIn = new FadeModifier(this.tutorialText, 1, 0, 500, easing)
    this.fadeIn.start()
    this.setTimeout(() => {
      this.tutorialText.setText(key)
      this.fadeOut = new FadeModifier(this.tutorialText, 0, 1, 500, easing)
      this.fadeOut.start()
    }, 600)
    return
  }

  uninit() {
    this.tank.uninit()
  }

  tick(tpf) {
    Measure.clearLines()
    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))

    PoolManager.itemsInUse(Coin).forEach((coin) => {
      coin.tick(tpf)
      let distance = Measure.distanceBetween(this.tank, coin)
      if (distance < 3) {
        coin.pickup()
      }
    })
    PoolManager.itemsInUse(Bullet).forEach((bullet) => {
      bullet.tick(tpf)
    })

    this.tank.tick(tpf)

    if (this.tutorialStage == 4) {
      if (this.tank.position.x > 35) {
        this.tutorialStage += 1
        Engine.switch(menuScene)
      }
    }

    if (this.tutorialStage == 3) {
      PoolManager.itemsInUse(Bullet).forEach((bullet) => {
        let distance = Measure.distanceBetween(bullet, this.practiceDummy)
        if (distance < 4) {
          PoolManager.release(bullet)
          this.tutorialStage += 1
          new FadeModifier(this.practiceDummy, 1, 0, 500).start()
          this.setTimeout(() => {
            this.setTutorial('  EXIT STAGE   RIGHT')
            this.remove(this.practiceDummy)
          }, 500)
        }
      })
    }

    if (this.tutorialStage == 2) {
      if (this.tank.controlWeapon.isMoving()) {
        this.tutorialStage += 1
        let tutorialText = 'PRESS SPACE TO SHOOT'
        if (VirtualController.isAvailable()) {
          tutorialText = '          LEFT              JOYSTICK     TO SHOOT'
        }
        this.setTutorial(tutorialText)
      }
    }

    if (this.tutorialStage == 1) {
      if (PoolManager.itemsInUse(Coin).size() == 0) {
        this.tutorialStage += 1

        let tutorialText = 'ARROW KEYS TO AIM'
        if (VirtualController.isAvailable()) {
          tutorialText = '          LEFT              JOYSTICK     TO AIM'
        }
        this.setTutorial(tutorialText)

        let practiceDummy = AssetManager.clone('practice.dummy.001.glb')
        practiceDummy.position.set(0, 0, -16)
        this.add(practiceDummy)
        this.practiceDummy = practiceDummy
      }
    }

    if (this.tutorialStage == 0) {
      if (this.tank.control.isMoving()) {
        PoolManager.spawn(Coin, { position: new THREE.Vector3(9, 2, 16) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(6, 2, 18) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(3, 2, 19) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(0, 2, 20) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(-3, 2, 19) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(-6, 2, 18) })
        PoolManager.spawn(Coin, { position: new THREE.Vector3(-9, 2, 16) })

        this.tutorialStage += 1
        this.setTutorial(' PICK UP ALL  THE COINS')
      }
    }
  }

  doKeyboardEvent(event) {
    this.tank.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    this.tank.doGamepadEvent(event)
  }
}
