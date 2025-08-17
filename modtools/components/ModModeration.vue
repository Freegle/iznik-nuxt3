<template>
  <div class="d-inline d-flex justify-content-start flex-wrap">
    <b-form-select
      v-model="postingStatus"
      :options="options"
      class="sel"
      :size="size"
    />
    <b-form-select v-model="trustlevel" class="sel" :size="size" readyonly>
      <option :value="null">Volunteering - not asked</option>
      <option value="Basic">Volunteering - basic</option>
      <option value="Moderate">Volunteering - moderate</option>
      <option value="Advanced">Volunteering - advanced</option>
      <option value="Declined">Volunteering - declined</option>
      <option value="Excluded">Volunteering - disabled</option>
    </b-form-select>
  </div>
</template>
<script>
import { useUserStore } from '../../stores/user'

export default {
  props: {
    membership: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    userid: {
      type: Number,
      required: false,
      default: 0,
    },
    size: {
      type: String,
      required: false,
      default: 'lg',
    },
  },
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  computed: {
    postingStatus: {
      get() {
        return this.membership.ourpostingstatus || 'MODERATED'
      },
      async set(val) {
        const groupid = this.membership.groupid ?? this.membership.id
        const userid = this.userid ? this.userid : this.user.id
        await this.userStore.edit({
          id: userid,
          groupid,
          ourPostingStatus: val,
        })
      },
    },
    trustlevel: {
      get() {
        return this.user.trustlevel ? this.user.trustlevel : null
      },
      async set(val) {
        const groupid = this.membership.groupid ?? this.membership.id
        const userid = this.userid ? this.userid : this.user.id
        await this.userStore.edit({
          id: userid,
          groupid,
          trustlevel: val,
        })
      },
    },
    options() {
      return [
        {
          value: 'MODERATED',
          text: 'Moderated',
        },
        {
          value: 'DEFAULT',
          text: 'Group Settings',
        },
        {
          value: 'PROHIBITED',
          text: "Can't Post",
        },
      ]
    },
  },
}
</script>
<style scoped>
.sel {
  max-width: 200px;
}
</style>
