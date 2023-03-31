<template>
  <div>
    <IsoChrone
      v-for="(isochrone, ix) in list"
      :id="isochrone.id"
      :key="'isochrone-' + isochrone.id"
      :add-button="ix === 0"
      :last="ix === list.length - 1"
      @add="showAdd = true"
    />
    <IsoChrone
      v-if="showAdd"
      @added="showAdd = false"
      @cancel="showAdd = false"
    />
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { useIsochroneStore } from '~/stores/isochrone'
import IsoChrone from '~/components/IsoChrone'

export default {
  components: {
    IsoChrone,
  },
  data() {
    return {
      showAdd: false,
    }
  },
  computed: {
    ...mapState(useIsochroneStore, ['list']),
  },
  methods: {
    add() {
      this.showAdd = true
    },
  },
}
</script>
