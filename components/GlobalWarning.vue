<template>
  <div v-if="true">
    <NoticeMessage v-if="show" variant="info">
      <b-button variant="link" class="float-end" @click="hideit">
        Hide this
      </b-button>
      <div class="d-flex justify-content-between">
        <b-img
          src="/national_reuse_day_2023_Logo_round_500x500px.png"
          style="width: 125px; height: 125px"
          class="mr-2"
        />
        <div>
          <p>
            Are you ready to shine a light on reuse for
            <b>#NationalReuseDay2023</b> on Friday 20 October? A day to
            celebrate all things #Reuse, organised by Freegle, the reuse
            experts.
          </p>
          <b-button
            to="https://mailchi.mp/896a4360914b/freegle-bites-april-17353736"
            variant="white"
            class="mt-2"
          >
            Find out how to get involved
          </b-button>
        </div>
      </div>
    </NoticeMessage>
    <div v-else class="text-danger text-end clickme" @click="showit">
      Show notice.
    </div>
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
      return !this.miscStore?.get('hideglobalwarning')
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
