import { defineStore } from 'pinia'

export const useReplyStore = defineStore({
  id: 'reply',
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
      },
    ],
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
