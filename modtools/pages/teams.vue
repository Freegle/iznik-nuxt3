<template>
  <div class="bg-white pl-2">
    <client-only>
      <h1>Teams</h1>
      <p>
        Freegle has a number of internal teams. Click to find out more about
        them, and who's on each one.
      </p>

      <div class="d-flex flex-wrap">
        <b-button
          v-for="t in teams"
          :key="'team-' + t.name"
          variant="white"
          class="m-1"
          @click="selectTeam(t)"
        >
          {{ t.name }}
        </b-button>
      </div>
      <div v-if="selected && team && team.members" class="mt-2">
        <h2>{{ team.name }}</h2>
        <p v-if="team.supporttools" class="font-weight-bold">
          Members of this team have Support Tools access.
        </p>
        <p v-else class="font-weight-normal">
          Members of this team don't need Support Tools access.
        </p>
        <b-input-group v-if="supportOrAdmin" class="mt-2 mb-2">
          <b-form-input
            v-model="memberToAdd"
            type="number"
            placeholder="Add member by ID"
          />
          <slot name="append">
            <SpinButton
              variant="primary"
              icon-name="plus"
              label="Add"
              spinclass="text-white"
              :disabled="!memberToAdd"
              @handle="addMember($event, team.name)"
            />
          </slot>
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
          Contact email:
          <ExternalLink :href="'mailto:' + team.email">{{
            team.email
          }}</ExternalLink>
        </p>
        <ModTeamMember
          v-for="member in team.members"
          :key="'member-' + member.id"
          :teamid="team.id"
          :member="member"
          @removed="removed(team.name)"
        />
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { useModGroupStore } from '@/stores/modgroup'
import { useTeamStore } from '@/stores/team'
const modGroupStore = useModGroupStore()
const teamStore = useTeamStore()

const team = ref(null)
const selected = ref(null)
const memberToAdd = ref(null)

const teams = computed(() => {
  return teamStore.all
})

onMounted(() => {
  modGroupStore.getModGroups()
  teamStore.fetch()
})

const selectTeam = async (t) => {
  team.value = await teamStore.fetch(t.name)

  selected.value = t.id
}
const addMember = async (callback, name) => {
  if (memberToAdd.value && selected.value) {
    await teamStore.add({
      id: selected.value,
      userid: memberToAdd.value,
    })
    team.value = await teamStore.fetch(name)
    callback()
  }
}
const removed = async (name) => {
  team.value = await teamStore.fetch(name)
}
</script>
