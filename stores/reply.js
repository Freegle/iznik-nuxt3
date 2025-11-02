import { defineStore } from 'pinia'

export const useReplyStore = defineStore({
  id: 'reply',
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['replyMsgId', 'replyMessage', 'replyingAt'],
  },
  state: () => ({
    replyMsgId: null,
    replyMessage: null,
    replyingAt: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
  },
})

// export const mutations = {
//   set(state, params) {
//     state.replyMsgId = params.replyMsgId
//     state.replyMessage = params.replyMessage
//     state.replyingAt = params.replyingAt
//   }
// }
//
// export const getters = {
//   get: state => {
//     return state
//   }
// }
//
// export const actions = {
//   set({ commit }, params) {
//     commit('set', params)
//   }
// }
