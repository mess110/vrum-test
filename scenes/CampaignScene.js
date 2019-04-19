class CampaignScene extends GameScene {
  init(options) {
    super.init(options)

    this.findOrCreate()

    // this.addBot({position: { x: 15, z: 15 }})
    // this.addBot({position: { x: 15, z: 15 }})
    // this.addBot({position: { x: 15, z: 15 }})
    // this.addBot({position: { x: 15, z: 15 }})
    // this.addBot({position: { x: 15, z: 15 }})

    // this.addBot({position: { x: -15, z: 15 }})
    // this.addBot({position: { x: -15, z: 15 }})
    // this.addBot({position: { x: -15, z: 15 }})
    // this.addBot({position: { x: -15, z: 15 }})
    // this.addBot({position: { x: -15, z: 15 }})

    // this.addBot({position: { x: -25, z: -15 }, type: BotMeleeControls })
    // this.addBot({position: { x: -25, z: -15 }})
    // this.addBot({position: { x: -25, z: -15 }})
    // this.addBot({position: { x: -25, z: -15 }})
    // this.addBot({position: { x: -25, z: -15 }})

    // this.addBot({position: { x: 25, z: -15 }})
    // this.addBot({position: { x: 25, z: -15 }})
    // this.addBot({position: { x: 25, z: -15 }})
    // this.addBot({position: { x: 25, z: -15 }})
    // this.addBot({position: { x: 25, z: -15 }, type: BotMeleeControls })

    this.phase = 0
    this.ended = 0
  }

  addBot(options) {
    if (isBlank(options)) { options = {} }
    if (isBlank(options.type)) {
      options.type = BotRandomControls
    }
    options.model = {
      chassis: CHASSISES.shuffle().first(),
      wheels: WHEELS.shuffle().first(),
      weapon: WEAPONS.shuffle().first()
    }
    if (options.type == BotMeleeControls) {
      options.model.weapon = 'weapon.004.glb'
    }
    let bot = this.addPlayer(options)
    bot.health.setText(`${Config.instance.vax.BOT}: ${this.vrumKey}`)
    bot.vrumOwner = this.vrumKey
    bot.isBot = true
    bot.shootCooldown = 1

    if (options.type == BotMeleeControls) {
      bot.acceleration = 1
      bot.control.acceleration = 1
    }
    bot.botControls = new options.type()
    return bot
  }

  tick(tpf) {
    super.tick(tpf)

    if (this.phase == 1) {
      this.ended += tpf
      if (this.ended > 5) {
        this.phase += 1
        // Engine.switch(menuScene)
      }
    }

    this.characters.forEach((character) => {
      character.tick(tpf)

      // we don't check for isBot because we want only the vrumOwner
      // to control the bot
      if (!isBlank(character.botControls)) {
        character.botControls.tick(tpf, character)

        if (character.botControls instanceof BotMeleeControls) {
          this.characters.forEach((other) => {
            if (character.uuid !== other.uuid) {
              this.hitVector.setFromMatrixPosition(other.boundingCube.matrixWorld);
              let distance = Measure.distanceBetween(character, this.hitVector)
              if (distance < 6) {
                other.health.dmg()
                this.checkDead(other)
              }
            }
          })
        }
      }

      PoolManager.itemsInUse(Coin).forEach((coin) => {
        if (!coin.pickedUp) {
          this.hitVector.setFromMatrixPosition(character.boundingCube.matrixWorld);
          let distance = Measure.distanceBetween(coin, this.hitVector)
          if (distance < 3) {
            coin.pickup()
            this.inputMapper.uuids().forEach((uuid) => {
              if (character.uuid == uuid) {
                this.score.bump()
              }
            })
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
          this.checkDead(character)
        }
      })
    })
  }

  allEnemiesDead() {
    let playerUuids = this.inputMapper.uuids()
    let allEnemiesDead = true
    this.characters.forEach((e) => {
      if (!playerUuids.includes(e.uuid)) {
        if (!e.health.isDead()) {
          allEnemiesDead = false
        }
      }
    })
    return allEnemiesDead
  }

  atLeastOneAlive() {
    let atLeastOneAlive = false
    this.inputMapper.models().forEach((model) => {
      atLeastOneAlive = atLeastOneAlive || !model.health.isDead()
    })
    return atLeastOneAlive
  }

  checkDead(character) {
    if (character.health.isDead()) {
      this.removePlayer(character)
      let coinPos = character.position.clone()
      coinPos.y = 2
      PoolManager.spawn(Coin, { position: coinPos })

      if (this.phase === 0) {
        if (!this.atLeastOneAlive()) {
          this.setInfoMsg('try again')
          this.phase = 1
        }

        if (this.allEnemiesDead()) {
          this.setInfoMsg('gg')
          this.phase = 1
        }
      }
    }
  }
}
