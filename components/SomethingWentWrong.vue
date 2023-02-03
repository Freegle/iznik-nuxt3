<template>
  <div class="d-flex justify-content-around">
    <NoticeMessage
      v-if="showError"
      variant="danger"
      class="posit text-center"
      show
    >
      <p>Sorry, something went wrong.</p>
      <p>
        That might be a bug, or perhaps your network connection broke. Please
        try again - if you continue to have problems then please take a
        screenshot and contact <SupportLink />
      </p>
    </NoticeMessage>
  </div>
</template>
<script>
import { useMiscStore } from '~/stores/misc'
import SupportLink from '~/components/SupportLink'

export default {
  components: {
    SupportLink,
  },
  data() {
    return {
      showError: false,
    }
  },
  computed: {
    somethingWentWrong() {
      const miscStore = useMiscStore()
      return miscStore.somethingWentWrong
    },
  },
  watch: {
    somethingWentWrong(newVal) {
      if (newVal) {
        this.showError = true
        setTimeout(() => {
          this.showError = false
        }, 10000)
      }
    },
  },
}
</script>
<style scoped lang="scss">
.posit {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}
</style>
