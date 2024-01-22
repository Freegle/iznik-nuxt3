<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" />
      <b-col cols="12" md="6" class="bg-white">
        <div>
          <h1>We've removed your account</h1>
          <p>
            Other freeglers will no longer be able to see your personal data,
            posts or chat messages. You should stop receiving emails within a
            few hours.
          </p>
          <p>
            We'll keep your account data for 14 days, in case you change your
            mind. You can recover your account by logging back in - you'll see a
            button you can click to restore it. After that, we'll wipe your
            data.
          </p>
        </div>
      </b-col>
      <b-col cols="0" md="3" />
    </b-row>
  </client-only>
</template>
<script>
export default {
  mounted() {
    try {
      console.log('Disable Google autoselect')
      window?.google?.accounts?.id?.disableAutoSelect()
    } catch (e) {
      console.log('Ignore Google autoselect error', e)
    }
  },
}
</script>
