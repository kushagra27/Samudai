import Web3 from 'web3'
import Torus from '@toruslabs/torus-embed'

const GOOGLE = "google";

const vMap = {
  [GOOGLE]: {
    name: "Google",
    typeOfLogin: "google",
    verifier: "platform-google-testnet",
    clientId: "747937709474-psr6g8jl3e3g2opgqbr6qbi7q61ijvb6.apps.googleusercontent.com",
  }
}

const web3Obj = {
  web3: new Web3(),
  torus: {},
  setweb3: function(provider) {
    const web3Inst = new Web3(provider)
    web3Obj.web3 = web3Inst
  },
  initialize: async function(buildEnv) {
    const torus = new Torus()
    await torus.init({ buildEnv: buildEnv || 'production', network: { host: 'ropsten' } })
    await torus.login()
    web3Obj.setweb3(torus.provider)
    web3Obj.torus = torus
    sessionStorage.setItem('pageUsingTorus', buildEnv)
  }
}
export default web3Obj