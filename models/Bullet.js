class Bullet extends THREE.Object3D {
  constructor() {
    super()

    let coin = AssetManager.clone('ammo.002.glb')
    Utils.addOutline(coin)
    this.add(coin)
    this.maxLifeTime = 5

    this.shadowCastAndNotReceive()
  }

  from(tank) {
    this.lifeTime = 0
    this.position.copy(tank.position)
    this.position.y = 2.65
    this.rotation.copy(tank.weapon.rotation)
    this.translateZ(2.5)
  }

  tick(tpf) {
    this.rotation.z += tpf * 5
    this.translateZ(tpf * 35)
    this.lifeTime += tpf
    if (this.lifeTime > this.maxLifeTime) {
      PoolManager.release(this)
    }
  }
}
