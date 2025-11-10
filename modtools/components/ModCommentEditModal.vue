<template>
  <div>
    <b-modal
      :id="'modCommentModal-' + user.id"
      ref="modal"
      size="lg"
      no-stacking
      @hidden="onHide"
    >
      <template #title class="w-100">
        Edit Note for {{ user.displayname }} <span v-if="groupname">on</span>
        {{ groupname }}
      </template>
      <template #default>
        <p>
          You can add one or more notes about members. They'll appear in a
          coloured box next to the user.
        </p>
        <p>
          These comments can be seen by moderators, and also by members who
          choose to download their data under GDPR. So keep them objective,
          polite and factual, and without identifiable personal information
          please.
        </p>
        <b-form-input v-model="comment.user1" :placeholder="placeholders[1]" />
        <b-form-input v-model="comment.user2" :placeholder="placeholders[2]" />
        <b-form-input v-model="comment.user3" :placeholder="placeholders[3]" />
        <b-form-input v-model="comment.user4" :placeholder="placeholders[4]" />
        <b-form-input v-model="comment.user5" :placeholder="placeholders[5]" />
        <b-form-input v-model="comment.user6" :placeholder="placeholders[6]" />
        <b-form-input v-model="comment.user7" :placeholder="placeholders[7]" />
        <b-form-input v-model="comment.user8" :placeholder="placeholders[8]" />
        <b-form-input v-model="comment.user9" :placeholder="placeholders[9]" />
        <b-form-input
          v-model="comment.user10"
          :placeholder="placeholders[10]"
        />
        <b-form-input
          v-model="comment.user11"
          :placeholder="placeholders[11]"
        />
        <p class="mt-2">
          You can choose for this note to be be alerted to other groups, which
          will put the member in <em>Member->Review</em>
          if they are an existing member or join a group. Please use this only
          for serious issues.
        </p>
        <OurToggle
          :value="comment.flag"
          class="mt-2"
          :height="30"
          :width="250"
          :font-size="14"
          :sync="true"
          :labels="{
            checked: 'Will alert other groups',
            unchecked: 'Will not alert other groups',
          }"
          variant="modgreen"
          @change="toggleFlag"
        />
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button variant="primary" @click="save"> Save </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useOurModal } from '~/composables/useOurModal'
import { useUserStore } from '~/stores/user'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    comment: {
      type: Object,
      required: true,
    },
    groupname: {
      type: String,
    },
  },
  setup() {
    const userStore = useUserStore()
    const { modal, hide } = useOurModal()
    return { userStore, modal, hide }
  },
  data: function () {
    return {
      placeholders: [
        null,
        'Add a comment about this member here',
        '...and more information here',
        '...and here',
        '...you get the idea',
      ],
    }
  },
  methods: {
    onHide() {
      this.$emit('hidden')
    },
    toggleFlag() {
      this.comment.flag = !this.comment.flag
    },
    async save() {
      await this.userStore.saveComment(this.comment)
      this.$emit('edited')
      this.hide()
    },
  },
}
</script>
