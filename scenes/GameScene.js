class GameScene extends Scene {
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

    this.infoText = new BaseText({
      text: '', fillStyle: 'white', align: 'center',
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'})
    this.infoText.scale.setScalar(8)
    this.infoText.rotation.set(-Math.PI / 2, 0, 0)
    this.infoText.position.set(0, 0.1, 18)
    this.add(this.infoText)
  }

  setInfoMsg(key) {
    let easing = TWEEN.Easing.Cubic.InOut
    if (!isBlank(this.fadeIn)) {
      this.fadeIn.stop()
      this.fadeIn = undefined
    }
    if (!isBlank(this.fadeOut)) {
      this.fadeOut.stop()
      this.fadeOut = undefined
    }
    this.fadeIn = new FadeModifier(this.infoText, 1, 0, 500, easing)
    this.fadeIn.start()
    this.setTimeout(() => {
      this.infoText.setText(key)
      this.fadeOut = new FadeModifier(this.infoText, 0, 1, 500, easing)
      this.fadeOut.start()
    }, 600)
    return
  }

  tick(tpf) {
    Measure.clearLines()

    PoolManager.itemsInUse(Bullet).forEach((bullet) => {
      bullet.tick(tpf)
    })
  }
}
