const isInGame = () => {
  let scene = Hodler.get('scene')
  return scene instanceof GameScene
}

const tryDcNetwork = () => {
  if (isBlank(MeshNetwork.instance)) { return }
  MeshNetwork.instance.disconnect()
  delete MeshNetwork.instance
}

const netLog = (s) => {
  if (Config.instance.engine.debug) {
    console.log(`VAXNET: ${s}`)
  }
}

const networkTick = () => {
  let mn = MeshNetwork.instance
  if (!mn.isConnected()) {
    console.warn('should not be ticking while disconnected')
    return
  }

  if (!isInGame()) { return }
  let scene = Hodler.get('scene')

  data = {
    type: 'vrum-network',
    characters: [],
    bullets: mn.bullets
  }
  mn.bullets = []


  let myChars = scene.characters.filter((char) => { return char.vrumOwner === scene.vrumKey })
  myChars.forEach((char) => {
    data.characters.push({
      vrumKey: char.vrumKey,
      vrumOwner: char.vrumOwner,
      control: char.control.keys,
      controlWeapon: char.controlWeapon.keys,
      model: char.toJsonModel(),
      position: char.position,
      shooting: char.shooting,
      shootCooldown: char.shootCooldown,
      speed: char.speed,
      acceleration: char.acceleration,
      isBot: char.isBot,
    })
  })

  MeshNetwork.instance.emit(data)
}

const initNetwork = (roomId) => {
  tryDcNetwork()
  if (isBlank(roomId)) { roomId = Utils.guid() }
  netLog(`Connecting to room '${roomId}'`)

  let mn = new MeshNetwork()
  mn.bullets = []
  mn.setSignalingDebug(Config.instance.engine.debug)

  // mn.onConnect = (peer) => {
    // netLog(`New peer connected ${peer.cmKey}`)
  // }

  mn.onData = (peer, data) => {
    if (!isInGame()) { return }
    let scene = Hodler.get('scene')

    if (data.type == 'vrum-controller') {
      scene.doVrumControllerTick(data, peer.cmKey)
    }

    if (data.type == 'vrum-network') {
      scene.doNetworkTick(data, peer.cmKey)
    }
  }

  mn.onError = (peer, error) => {
    console.error(peer)
    console.error(error)
  }

  mn.onClose = (peer) => {
    netLog(`Peer disconnected ${peer.cmKey}`)
    if (!isInGame()) { return }
    let scene = Hodler.get('scene')
    let vrumOwner = scene.inputMapper.peer2key[peer.cmKey]
    scene.characters
      .filter((e) => { return e.vrumOwner === vrumOwner })
      .forEach((char) => {
      scene.removePlayer(char)
    })
    delete scene.inputMapper.peer2key[peer.cmKey]
  }

  mn.connect('https://mesh.opinie-publica.ro', roomId, {
    cCallback: function () {
      netLog('Connected to room, starting peer network loop')
      if (!isBlank(MeshNetwork.networkLoop)) {
        clearInterval(MeshNetwork.networkLoop)
      }
      MeshNetwork.networkLoop = setInterval(networkTick, 1 / 30 * 1000)
    },
    dcCallback: function () {
      netLog('Disconnected from room, stopping peer network loop')
      if (!isBlank(MeshNetwork.networkLoop)) {
        clearInterval(MeshNetwork.networkLoop)
      }
    }
  })

  MeshNetwork.instance = mn
}
