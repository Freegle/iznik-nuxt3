<template>
  <div :title="modtoshow.displayname">
    <ProfileImage
      :image="modtoshow.profile.paththumb"
      is-thumbnail
      size="md"
      :alt-text="modtoshow.displayname"
      large
      border
    />
  </div>
</template>
<script>
export default {
  props: {
    modtoshow: {
      type: Object,
      required: true,
    },
  },
}
</script>
