class Tank extends THREE.Object3D {
  constructor() {
    super()

    this.chassises = ['chassis.001.glb', 'chassis.002.glb'].toCyclicArray()
    this.wheels = ['wheel.001.glb', 'wheel.002.glb', 'wheel.003.glb'].toCyclicArray()
    this.weapons = ['weapon.001.glb', 'weapon.002.glb', 'weapon.003.glb'].toCyclicArray()

    this.changeChassis(this.chassises.get())

    let wheelKey = this.wheels.get()

    let wheelFL = new Wheel(wheelKey)
    wheelFL.position.set(1.35, 0.5, 0.9)
    this.add(wheelFL)
    this.wheelFL = wheelFL

    let wheelFR = new Wheel(wheelKey)
    wheelFR.position.set(-1.35, 0.5, 0.9)
    this.add(wheelFR)
    this.wheelFR = wheelFR

    let wheelBL = new Wheel(wheelKey)
    wheelBL.position.set(1.35, 0.5, -0.9)
    this.add(wheelBL)
    this.wheelBL = wheelBL

    let wheelBR = new Wheel(wheelKey)
    wheelBR.position.set(-1.35, 0.5, -0.9)
    this.add(wheelBR)
    this.wheelBR = wheelBR

    let weapon = new Weapon(this.weapons.get())
    weapon.position.set(0, 2.5, 0)
    this.add(weapon)
    this.weapon = weapon
  }

  nextChassis() {
    this.changeChassis(this.chassises.next())
  }

  changeChassis(key) {
    this.remove(this.chassis)
    let chassis = AssetManager.clone(key)
    Utils.addOutline(chassis)
    this.chassis = chassis
    this.add(chassis)
  }

  nextWheels() {
    this.changeWheels(this.wheels.next())
  }

  changeWheels(key) {
    this.wheelFL.setModel(key)
    this.wheelFR.setModel(key)
    this.wheelBL.setModel(key)
    this.wheelBR.setModel(key)
  }

  nextWeapon() {
    this.changeWeapon(this.weapons.next())
  }

  changeWeapon(key) {
    this.weapon.setModel(key)
  }

  tick(tpf) {
    this.wheelFL.tick(tpf)
    this.wheelFR.tick(tpf)
    this.wheelBL.tick(tpf)
    this.wheelBR.tick(tpf)
  }
}

class Wheel extends THREE.Object3D {
  constructor(key) {
    super()
    this.setModel(key)
  }

  setModel(key) {
    this.remove(this.wheel)
    this.wheel = AssetManager.clone(key)
    Utils.addOutline(this.wheel)
    this.add(this.wheel)
  }

  tick(tpf) {
    this.wheel.rotation.x += tpf * 5
  }
}

class Weapon extends THREE.Object3D {
  constructor(key) {
    super()
    this.setModel(key)
  }

  setModel(key) {
    this.remove(this.weapon)
    this.weapon = AssetManager.clone(key)
    Utils.addOutline(this.weapon)
    this.add(this.weapon)
  }
}
