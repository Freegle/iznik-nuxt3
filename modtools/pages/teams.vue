<template>
  <div class="bg-white pl-2">
    <client-only>
      <h1>
        Teams
      </h1>
      <p>
        Freegle has a number of internal teams. Click to find out more about them, and who's on each one.
      </p>

      <div class="d-flex flex-wrap">
        <b-button v-for="t in teams" :key="'team-' + t.name" variant="white" class="m-1" @click="selectTeam(t)">
          {{ t.name }}
        </b-button>
      </div>
      <div v-if="selected && team && team.members" class="mt-2">
        <h2>{{ team.name }}</h2>
        <b-input-group v-if="supportOrAdmin" class="mt-2 mb-2">
          <b-form-input v-model="memberToAdd" type="number" placeholder="Add member by ID" />
          <b-input-group-append>
            <SpinButton variant="primary" name="plus" label="Add" spinclass="text-white" :handler="addMember" :disabled="!memberToAdd" />
          </b-input-group-append>
        </b-input-group>
        <NoticeMessage v-if="!team.active" variant="info">
          This team is not active at the moment.
        </NoticeMessage>
        <p>{{ team.description }}</p>
        <p v-if="team.wikiurl">
          You can read more
          <ExternalLink :href="team.wikiurl">on the wiki</ExternalLink>.
        </p>
        <p v-if="team.email">
          Contact email: <ExternalLink :href="'mailto:' + team.email">{{ team.email }}</ExternalLink>
        </p>
        <ModTeamMember v-for="member in team.members" :key="'member-' + member.id" :teamid="team.id" :member="member" />
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { useTeamStore } from '@/stores/team'
const teamStore = useTeamStore()

const team = ref(null)
const selected = ref(null)
const memberToAdd = ref(null)

const teams = computed(() => {
  return teamStore.all
})

onMounted(() => {
  console.log("TEAMS onMounted")
  teamStore.fetch()
})

const selectTeam = async (t) => {
  console.log('selectTeam', t.id)
  team.value = await teamStore.fetch(t.name)
  console.log('selectTeam', team.value)

  selected.value = t.id
}

</script>
