class CampaignScene extends GameScene {
  init(options) {
    super.init(options)

    this.tank = this.addPlayer(options)
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: 15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})
    this.addBot({position: { x: -15, z: 15 }})

    // let barrel = AssetManager.clone('barrel.001.glb')
    // barrel.position.set(15, 0, 0)
    // this.add(barrel)
  }

  addBot(options) {
    let tank = this.addPlayer(options)
    tank.botControls = new BotControls()
    return tank
  }

  tick(tpf) {
    super.tick(tpf)

    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))
    this.doMobileEvent(this.tank)

    this.characters.forEach((character) => {
      character.tick(tpf)

      if (!isBlank(character.botControls)) {
        character.botControls.tick(tpf, character)
      }

      PoolManager.itemsInUse(Bullet).forEach((bullet) => {
        this.hitVector.setFromMatrixPosition(character.boundingCube.matrixWorld);

        let distance = Measure.distanceBetween(bullet, this.hitVector)
        // if (distance < 10 && Config.instance.engine.debug) {
          // Measure.addLineBetween(bullet, this.hitVector, 'yellow')
        // }
        if (distance < 2) {
          PoolManager.release(bullet)
          // let jsonParticleData = AssetManager.get('explosion.json').particle
          // let explosion = new BaseParticle(jsonParticleData)
          // explosion.position.copy(bullet.position)
          // this.add(explosion)
        }
      })
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
