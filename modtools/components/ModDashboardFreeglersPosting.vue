<template>
  <div>
    <b-card v-if="loading" no-body>
      <b-card-body>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row>
          <b-col class="text-faded pulsate text-center"> Loading... </b-col>
        </b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
        <b-row><b-col>&nbsp;</b-col></b-row>
      </b-card-body>
    </b-card>
    <div v-else-if="UsersPosting && UsersPosting.length">
      <b-card no-body>
        <b-card-body>
          <b-row v-for="user in UsersPosting" :key="'popular-' + user.id">
            <b-col cols="4" md="3" class="text-nowrap">
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                user.id
              }}
            </b-col>
            <b-col cols="8" md="6" class="text-success font-weight-bold">
              <ProfileImage
                :image="user.profile?.turl"
                :name="user.displayname"
                is-thumbnail
                size="sm"
                class="breakgrid"
                :is-moderator="
                  user.systemrole === 'Moderator' ||
                  user.systemrole === 'Support' ||
                  user.systemrole === 'Admin'
                "
              />
              {{ user.displayname }}
            </b-col>
            <b-col cols="12" md="3">
              {{ pluralise('post', user.posts, true) }}
            </b-col>
          </b-row>
        </b-card-body>
      </b-card>
    </div>
  </div>
</template>
<script setup>
import { useModDashboard } from '~/modtools/composables/useModDashboard'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupName: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
})

const { loading, UsersPosting } = useModDashboard(props, ['UsersPosting'])
</script>
