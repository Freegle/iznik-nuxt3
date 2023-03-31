<template>
  <div
    :class="{
      hidden: hidden,
    }"
  >
    <b-badge
      v-b-tooltip="{
        title: 'Kindly supports Freegle - click for more info',
      }"
      variant="primary rounded supporter"
      :class="'clickme ' + 'size-' + size"
      @click="showModal"
    >
      <v-icon icon="trophy" />
      Supporter
    </b-badge>
    <SupporterInfoModal v-if="showInfoModal" ref="modal" />
  </div>
</template>
<script>
const SupporterInfoModal = () => import('~/components/SupporterInfoModal.vue')

export default {
  components: { SupporterInfoModal },
  props: {
    size: {
      type: String,
      required: false,
      default: 'md',
    },
    hidden: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showInfoModal: false,
    }
  },
  methods: {
    showModal(e) {
      this.showInfoModal = true
      this.waitForRef('modal', () => {
        this.$refs.modal.show()
      })
      e.preventDefault()
      e.stopPropagation()
    },
  },
}
</script>
<style scoped lang="scss">
.supporter {
  color: white;
  background-color: $color-gold !important;
}

.size-lg {
  font-size: 1.25rem;
}

.hidden {
  opacity: 0.5;
}
</style>
