class Score extends THREE.Object3D {
  constructor() {
    super()

    this.score = 0

    let scoreText = new BaseText({
      text: '0', fillStyle: 'white', align: 'center',
      strokeStyle: 'black', strokeLineWidth: 1,
      canvasW: 512, canvasH: 512,
      font: '72px luckiest-guy'
    })
    this.add(scoreText)

    let coin = AssetManager.clone('coin.001.glb')
    Utils.addOutline(coin)
    coin.scale.setScalar(0.25)
    coin.position.set(0.6, 1.4, 0)
    this.add(coin)

    this.position.set(0, 2.9, -10)
  }

  bump() {
    this.score += 1
    this.children[0].setText(this.score)
  }

  tick(tpf) {
    this.children[1].rotation.y += tpf
  }
}
