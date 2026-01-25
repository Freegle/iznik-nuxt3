<template>
  <b-row class="mb-2">
    <b-col cols="4">
      <ProfileImage
        :image="member.profile.turl"
        :name="member.displayname"
        class="mr-2"
        size="lg"
      />
    </b-col>
    <b-col cols="6">
      <strong>{{ member.displayname }}</strong>
      <span class="text-faded small">
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ member.id }}
      </span>
    </b-col>
    <b-col>
      <b-button v-if="supportOrAdmin" size="sm" variant="white" @click="remove">
        <v-icon icon="trash-alt" />
      </b-button>
    </b-col>
  </b-row>
</template>
<script>
import { useTeamStore } from '@/stores/team'
import { useMe } from '~/composables/useMe'

export default {
  props: {
    teamid: {
      type: Number,
      required: true,
    },
    member: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const { supportOrAdmin } = useMe()
    return { supportOrAdmin }
  },
  methods: {
    async remove() {
      const teamStore = useTeamStore()
      await teamStore.remove({
        id: this.teamid,
        userid: this.member.id,
      })
      this.$emit('removed')
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 145px;
}
</style>
