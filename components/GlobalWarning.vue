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
import NoticeMessage from './NoticeMessage'
import { useMiscStore } from '~/stores/misc'

export default {
  components: { NoticeMessage },
  setup() {
    const miscStore = useMiscStore()
    return { miscStore }
  },
  computed: {
    show() {
      return !this.miscStore.get('hideglobalwarning')
    },
  },
  methods: {
    hideit() {
      this.miscStore.set({
        key: 'hideglobalwarning',
        value: true,
      })
    },
    showit() {
      this.miscStore.set({
        key: 'hideglobalwarning',
        value: false,
      })
    },
  },
}
</script>
