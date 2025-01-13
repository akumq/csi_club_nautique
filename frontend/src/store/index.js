import { createStore } from 'vuex'
import clients from './modules/clients'
import activities from './modules/activities'
import materials from './modules/materials'
import personnel from './modules/personnel'
import offres from './modules/offres'
import auth from './modules/auth'

export default createStore({
  state: {
    // état global si nécessaire
  },
  mutations: {
    // mutations globales si nécessaires
  },
  actions: {
    // actions globales si nécessaires
  },
  modules: {
    clients,
    activities,
    materials,
    personnel,
    offres,
    auth
  }
}) 