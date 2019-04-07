class CampaignScene extends GameScene {
  init(options) {
    super.init(options)

    if (isBlank(options)) { options = {} }
    if (isBlank(options.model)) { options.model = {} }
    if (isBlank(options.model.chassis)) { options.model.chassis = 'chassis.001.glb' }
    if (isBlank(options.model.wheels)) { options.model.wheels = 'wheel.001.glb' }
    if (isBlank(options.model.weapon)) { options.model.weapon = 'weapon.001.glb' }

    let tank = new Player()
    tank.rayScanner.collidables = this.collidables
    tank.setModel(options.model.chassis)
    tank.changeWheels(options.model.wheels)
    tank.changeWeapon(options.model.weapon)
    this.add(tank)
    this.tank = tank

    this.enemies = []

    let enemy = new Bot()
    enemy.position.set(15, 0, 15)
    enemy.rayScanner.collidables = this.collidables
    this.add(enemy)
    this.enemies.push(enemy)

    let barrel = AssetManager.clone('barrel.001.glb')
    barrel.position.set(15, 0, 0)
    this.add(barrel)

    tank.rayScanner.addCollidable(barrel)
    enemy.rayScanner.addCollidable(barrel)

    tank.rayScanner.addCollidable(enemy)
    enemy.rayScanner.addCollidable(tank)

    let vector = new THREE.Vector3();
    this.hitVector = vector
  }

  uninit() {
    this.tank.uninit()
  }

  tick(tpf) {
    super.tick(tpf)

    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))
    this.tank.tick(tpf)

    PoolManager.itemsInUse(Bullet).forEach((bullet) => {
      this.enemies.forEach((enemy) => {
        this.hitVector.setFromMatrixPosition(enemy.boundingCube.matrixWorld);


        let distance = Measure.distanceBetween(bullet, this.hitVector)
        if (distance < 10 && Config.instance.engine.debug) {
          Measure.addLineBetween(bullet, this.hitVector, 'yellow')
        }
        if (distance < 2) {
          PoolManager.release(bullet)
        }
      })
    })

    this.enemies.forEach((enemy) => {
      enemy.tick(tpf)
    })
  }

  doKeyboardEvent(event) {
    // console.log(`${event.type} ${event.code} (${event.which})`)
    this.tank.doKeyboardEvent(event)
  }

  doGamepadEvent(event) {
    // console.log(event.type)
    this.tank.doGamepadEvent(event)
  }
}
