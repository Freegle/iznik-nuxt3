<template>
  <div>
    <notice-message variant="warning" class="mb-2">
      Email doesn't always get through, so check your spam folders, and check
      <nuxt-link to="/chats">Chats</nuxt-link> on here occasionally.
    </notice-message>
    <div v-if="simpleEmailSetting === 'Basic'" class="small">
      <p>You will also receive:</p>
      <ul>
        <li>
          Chat replies from other freeglers, for example about your posts.
        </li>
      </ul>
      <p>You will not receive:</p>
      <ul>
        <li>Community Event emails</li>
        <li>Volunteer Opportunity emails</li>
        <li>Emails about ChitChat posts</li>
        <li>Emails about notifications on the site</li>
        <li>
          Emails about specific OFFERs/WANTEDs we think you might be interested
          in
        </li>
        <li>Emails to remind you that we would love you to freegle again</li>
        <li>Occasional newsletters or collections of nice stories</li>
      </ul>
    </div>
    <div v-else class="small">
      <p>You will also receive:</p>
      <ul>
        <li>
          Chat replies from other freeglers, for example about your posts.
        </li>
        <li>Community Event emails</li>
        <li>Volunteer Opportunity emails</li>
        <li>Emails about ChitChat posts</li>
        <li>Emails about notifications on the site</li>
        <li>
          Emails about specific OFFERs/WANTEDs we think you might be interested
          in
        </li>
        <li>Emails to remind you that we would love you to freegle again</li>
        <li>Occasional newsletters or collections of nice stories</li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    simpleEmailSetting: {
      type: String,
      required: true,
    },
  },
}
</script>
