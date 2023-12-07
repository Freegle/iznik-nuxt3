<template>
  <div class="bg-light">
    <h2 class="p-2 text-black">Which post would you like to make?</h2>
    <div class="bg-light">
      <div class="mt-2 bg-white p-2 d-flex clickme" @click="goto('/give')">
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="shopping-cart" class="back fa-1-5x" />
        </div>
        <div>
          <h3>Offer</h3>
          <p>
            Got an item you want to give away? Offer it to someone in your
            community.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="arrow-right" size="2x" class="back" />
        </div>
      </div>
      <div class="mt-2 bg-white p-2 d-flex clickme" @click="goto('/find')">
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="search" class="back fa-1-5x" />
        </div>
        <div>
          <h3>Wanted</h3>
          <p>
            Looking for something specific? Post a WANTED ad and see if anyone
            has it.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="arrow-right" size="2x" class="back" />
        </div>
      </div>
      <div class="mt-2 bg-white p-2 d-flex clickme" @click="goto('/chitchat')">
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="coffee" class="back fa-1-5x" />
        </div>
        <div>
          <h3>ChitChat</h3>
          <p>
            Feeling chatty? Make a post in your community ChitChat forum and
            chat to other freeglers.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="arrow-right" size="2x" class="back" />
        </div>
      </div>
      <div
        class="mt-2 bg-white p-2 d-flex clickme"
        @click="goto('/communityevents')"
      >
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="coffee" class="back fa-1-5x" />
        </div>
        <div>
          <h3>Event</h3>
          <p>Got an event coming up? Let everyone know about it.</p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="arrow-right" size="2x" class="back" />
        </div>
      </div>
      <div
        class="mt-2 bg-white p-2 d-flex clickme"
        @click="goto('/volunteerings')"
      >
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="coffee" class="back fa-1-5x" />
        </div>
        <div>
          <h3>Volunteering</h3>
          <p>
            Know of any volunteering opportunities? Find someone to help out.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="arrow-right" size="2x" class="back" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    goto(path) {
      const router = useRouter()
      router.push(path)
    },
  },
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.back {
  color: $color-green-background;
}
</style>
