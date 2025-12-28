import { defineStore } from 'pinia'

export const useReplyStore = defineStore({
  id: 'reply',
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: [
      'replyMsgId',
      'replyMessage',
      'replyingAt',
      'machineState',
      'isNewUser',
    ],
  },
  state: () => ({
    replyMsgId: null,
    replyMessage: null,
    replyingAt: null,
    // State machine state for resume capability
    machineState: null,
    isNewUser: false,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    // Clear all reply state
    clearReply() {
      this.replyMsgId = null
      this.replyMessage = null
      this.replyingAt = null
      this.machineState = null
      this.isNewUser = false
    },
    // Save state machine state for resume
    saveMachineState(state, isNewUser = false) {
      this.machineState = state
      this.isNewUser = isNewUser
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
