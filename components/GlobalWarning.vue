<template>
  <div v-if="false">
    <client-only>
      <NoticeMessage v-if="show" variant="danger">
        <b-button variant="link" class="float-right" @click="hideit">
          Hide this
        </b-button>
        <p>This would be a global alert.</p>
      </NoticeMessage>
      <div v-else class="text-danger text-right clickme" @click="showit">
        Show notice.
      </div>
    </client-only>
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import NoticeMessage from './NoticeMessage'

export default {
  components: { NoticeMessage },
  setup() {
    const misc = useMiscStore()
    return { misc }
  },
  computed: {
    show() {
      return !this.misc.get('hideglobalwarning')
    },
  },
  methods: {
    hideit() {
      this.misc.set({
        key: 'hideglobalwarning',
        value: true,
      })
    },
    showit() {
      this.misc.set({
        key: 'hideglobalwarning',
        value: false,
      })
    },
  },
}
</script>
