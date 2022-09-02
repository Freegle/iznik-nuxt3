<template>
  <div>
    <NewsUserIntro v-if="userid" :userid="userid" :newsfeed="newsfeed" />
    <!-- eslint-disable-next-line-->
    <p>

    </p>
  </div>
</template>
<script>
import NewsBase from '~/components/NewsBase'
import NewsUserIntro from '~/components/NewsUserIntro'

export default {
  components: {
    NewsUserIntro,
  },
  extends: NewsBase,
}
</script>
