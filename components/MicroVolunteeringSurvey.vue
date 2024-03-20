<template>
  <div>
    <iframe
      class="embed-responsive-item w-100"
      style="height: 3777px"
      :src="url"
      allowfullscreen
    />
  </div>
</template>
<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
}
</script>
