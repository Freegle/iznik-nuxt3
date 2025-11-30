<template>
  <div class="bg-light">
    <h2 class="p-2 text-black">Please choose:</h2>
    <div class="bg-light">
      <div class="mt-2 bg-white p-2 d-flex clickme" @click="goto('/give')">
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="shopping-cart" class="back fa-1-5x" />
        </div>
        <div class="flex-grow-1">
          <h3>Offer</h3>
          <p>
            Got an item to give away for free? Offer it to someone in your
            community.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="angle-right" size="2x" class="back" />
        </div>
      </div>
      <div
        class="mt-2 bg-white p-2 d-flex clickme w-100"
        @click="goto('/find')"
      >
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="search" class="back fa-1-5x" />
        </div>
        <div class="flex-grow-1">
          <h3>Wanted</h3>
          <p>
            Looking for something specific? Post a WANTED ad and see if anyone
            has it.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="angle-right" size="2x" class="back" />
        </div>
      </div>
      <div class="mt-2 bg-white p-2 d-flex clickme" @click="goto('/chitchat')">
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="coffee" class="back fa-1-5x" />
        </div>
        <div class="flex-grow-1">
          <h3>ChitChat</h3>
          <p>
            Feeling chatty? Talk to other freeglers in your community forum.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="angle-right" size="2x" class="back" />
        </div>
      </div>
      <div
        class="mt-2 bg-white p-2 d-flex clickme"
        @click="goto('/communityevents')"
      >
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="calendar-alt" class="back fa-1-5x" />
        </div>
        <div class="flex-grow-1">
          <h3>Event</h3>
          <p>
            See local events, and add your own, to let everyone know about it.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="angle-right" size="2x" class="back" />
        </div>
      </div>
      <div
        class="mt-2 bg-white p-2 d-flex clickme"
        @click="goto('/volunteerings')"
      >
        <div class="d-flex flex-column justify-content-around pl-2 pr-3">
          <v-icon icon="hands-helping" class="back fa-1-5x" />
        </div>
        <div class="flex-grow-1">
          <h3>Volunteering</h3>
          <p>
            See volunteering opportunities, and add your own to find someone to
            help out.
          </p>
        </div>
        <div class="d-flex flex-column justify-content-around">
          <v-icon icon="angle-right" size="2x" class="back" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from '#imports'

const router = useRouter()

function goto(path) {
  router.push(path)
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.back {
  color: $color-green-background;
}
</style>
