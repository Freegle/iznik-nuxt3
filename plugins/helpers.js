import { useGroupStore } from '../stores/group'
import { useMiscStore } from '../stores/misc'
import { useMessageStore } from '~/stores/message'
import { timeago } from '~/composables/useTimeFormat'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      // We have a global mixin for the stores so that we can access any store without the rigmarole of calling the
      // appropriate use...() method and returning it from setup().  But we might still have to do that if we
      // want to use the store from within setup(), as we often do.
      //
      // TODO Is there a better way of doing this without boilerplate everywhere?  I get that mixins can be bad, but
      // everything I can find seems surprisingly blase about the code duplication.
      groupStore() {
        return useGroupStore()
      },
      messageStore() {
        return useMessageStore()
      },
      miscStore() {
        console.log('Get misc store')
        return useMiscStore()
      },
      timeago,
    },
    // Similarly for time formatting.
  }
})
