class Health extends THREE.Object3D {
  constructor() {
    super()

    let outlineScalePercent = 10

    let heart = AssetManager.clone('heart.001.glb')
    heart.lookAt(Hodler.get('camera').position)
    Utils.addOutline(heart, outlineScalePercent)
    heart.position.set(-2, 0, 0)
    this.add(heart)

    let heart2 = AssetManager.clone('heart.001.glb')
    heart2.lookAt(Hodler.get('camera').position)
    Utils.addOutline(heart2, outlineScalePercent)
    heart2.position.set(0, 0, 0)
    this.add(heart2)

    let heart3 = AssetManager.clone('heart.001.glb')
    heart3.lookAt(Hodler.get('camera').position)
    Utils.addOutline(heart3, outlineScalePercent)
    heart3.position.set(2, 0, 0)
    this.add(heart3)

    this.position.set(0, 4.5, -2)

    this.health = 3
  }

  dmg() {
    this.health -= 1

    let fadeSpeed = 500
    let easing = TWEEN.Easing.Exponential.Out
    if (this.health == 2) {
      new FadeModifier(this.children[2], 1, 0, fadeSpeed, easing).start()
      new ScaleModifier(this.children[2], 1, 0.5, fadeSpeed, easing).start()
    } else if (this.health == 1) {
      new FadeModifier(this.children[1], 1, 0, fadeSpeed, easing).start()
      new ScaleModifier(this.children[1], 1, 0.5, fadeSpeed, easing).start()
    } else if (this.health == 0) {
      new FadeModifier(this.children[0], 1, 0, fadeSpeed, easing).start()
      new ScaleModifier(this.children[0], 1, 0.5, fadeSpeed, easing).start()
    }
  }

  isDead() {
    return this.health <= 0
  }
}
