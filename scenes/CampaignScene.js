class CampaignScene extends GameScene {
  init(options) {
    super.init(options)

    this.tank = this.addPlayer(options)
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

    this.addBot({position: { x: -25, z: -15 }})
    this.addBot({position: { x: -25, z: -15 }})
    this.addBot({position: { x: -25, z: -15 }})
    this.addBot({position: { x: -25, z: -15 }})
    this.addBot({position: { x: -25, z: -15 }})

    this.addBot({position: { x: 25, z: -15 }})
    this.addBot({position: { x: 25, z: -15 }})
    this.addBot({position: { x: 25, z: -15 }})
    this.addBot({position: { x: 25, z: -15 }})
    this.addBot({position: { x: 25, z: -15 }})

    // let barrel = AssetManager.clone('barrel.001.glb')
    // barrel.position.set(15, 0, 0)
    // this.add(barrel)

    this.phase = 0
    this.ended = 0
  }

  addBot(options) {
    options.model = {
      chassis: CHASSISES.shuffle().first(),
      wheels: WHEELS.shuffle().first(),
      weapon: WEAPONS.shuffle().first()
    }
    let tank = this.addPlayer(options)
    tank.botControls = new BotControls()
    return tank
  }

  tick(tpf) {
    super.tick(tpf)

    Utils.lerpCamera(this.tank, new THREE.Vector3(0, 35, 25))
    this.doMobileEvent(this.tank)

    if (this.phase == 1) {
      this.ended += tpf
      if (this.ended > 5) {
        this.phase += 1
        Engine.switch(menuScene)
      }
    }

    if (this.characters.size() == 1 && this.phase == 0) {
      this.setInfoMsg('gg')
      this.phase += 1
    }

    PoolManager.itemsInUse(Coin).forEach((coin) => {
      coin.tick(tpf)
    })

    this.characters.forEach((character) => {
      character.tick(tpf)

      if (!isBlank(character.botControls)) {
        character.botControls.tick(tpf, character)
      }

      PoolManager.itemsInUse(Coin).forEach((coin) => {
        if (!coin.pickedUp) {
          this.hitVector.setFromMatrixPosition(character.boundingCube.matrixWorld);
          let distance = Measure.distanceBetween(coin, this.hitVector)
          if (distance < 3) {
            coin.pickup()
            if (character.uuid == this.tank.uuid) {
              this.score.bump()
            }
          }
        }
      })

      PoolManager.itemsInUse(Bullet).forEach((bullet) => {
        this.hitVector.setFromMatrixPosition(character.boundingCube.matrixWorld);
        let distance = Measure.distanceBetween(bullet, this.hitVector)
        // if (distance < 10 && Config.instance.engine.debug) {
          // Measure.addLineBetween(bullet, this.hitVector, 'yellow')
        // }
        if (distance < 2) {
          PoolManager.release(bullet)
          let expl = PoolManager.spawn(Explosion, { from: bullet })

          this.setTimeout((e) => {
            PoolManager.release(expl)
          }, expl.explosion.getMaxAge() * 1000 - 50)

          character.health.dmg()
          if (character.health.isDead()) {
            this.removePlayer(character)
            let coinPos = character.position.clone()
            coinPos.y = 2
            PoolManager.spawn(Coin, { position: coinPos })


            if (character.uuid == this.tank.uuid && this.phase == 0) {
              character.position.set(0, 0, 0)
              this.setInfoMsg('try again')
              this.phase += 1
            }
          }
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
