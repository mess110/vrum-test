class Coin extends THREE.Object3D {
  constructor() {
    super()

    let coin = AssetManager.clone('coin.001.glb')
    Utils.addOutline(coin)
    this.add(coin)
  }
}
