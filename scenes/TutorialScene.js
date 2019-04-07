class TutorialScene extends GameScene {
  init(options) {
    super.init(options)

    let tank = new Player()
    tank.rayScanner.collidables = this.collidables
    this.add(tank)
    this.tank = tank

    let infoText = '    WASD KEYS   TO MOVE'
    if (VirtualController.isAvailable()) {
      infoText = '          LEFT              JOYSTICK     TO MOVE'
    } else {
    }
    this.setInfoMsg(infoText)

    this.tutorialStage = 0

    let vector = new THREE.Vector3();
    this.hitVector = vector
  }

  uninit() {
    this.tank.uninit()
  }

  tick(tpf) {
    super.tick(tpf)

    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))

    PoolManager.itemsInUse(Coin).forEach((coin) => {
      coin.tick(tpf)
      this.hitVector.setFromMatrixPosition(this.tank.boundingCube.matrixWorld);

      let distance = Measure.distanceBetween(coin, this.hitVector)
      if (distance < 3) {
        coin.pickup()
      }
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
            this.setInfoMsg('  EXIT STAGE   RIGHT')
            this.remove(this.practiceDummy)
          }, 500)
        }
      })
    }

    if (this.tutorialStage == 2) {
      if (this.tank.controlWeapon.isMoving()) {
        this.tutorialStage += 1
        let infoText = 'PRESS SPACE TO SHOOT'
        if (VirtualController.isAvailable()) {
          infoText = '          LEFT              JOYSTICK     TO SHOOT'
        }
        this.setInfoMsg(infoText)
      }
    }

    if (this.tutorialStage == 1) {
      if (PoolManager.itemsInUse(Coin).size() == 0) {
        this.tutorialStage += 1

        let infoText = 'ARROW KEYS TO AIM'
        if (VirtualController.isAvailable()) {
          infoText = '          LEFT              JOYSTICK     TO AIM'
        }
        this.setInfoMsg(infoText)

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
        this.setInfoMsg(' PICK UP ALL  THE COINS')
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
