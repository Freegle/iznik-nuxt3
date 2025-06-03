<template>
  <div>
    <ModMicrovolunteeringModal
      v-if="showMicrovolunteeringModal"
      ref="microvolunteering"
      :user="user"
      :item-ids="itemIds"
      @hidden="showMicrovolunteeringModal = false"
    />
    <b-button variant="link" @click="showModal"> View </b-button>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    user: {
      type: Object,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
  },
  data: function () {
    return {
      showMicrovolunteeringModal: false,
    }
  },
  computed: {
    itemIds() {
      return this.items.map((m) => m.id)
    },
  },
  methods: {
    async showModal() {
      this.showMicrovolunteeringModal = true
      await nextTick()
      this.$refs.microvolunteering?.show()
    },
  },
}
</script>
