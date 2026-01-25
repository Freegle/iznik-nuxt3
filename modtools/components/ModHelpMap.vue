<template>
  <NoticeMessage v-if="showHelp" variant="info" class="mt-2 mb-2">
    <b-button variant="white" class="float-end" @click="toggleHelp">
      Hide Help
    </b-button>
    <p>
      Here you can change the areas that postcodes map to on your community.
    </p>
    <ul>
      <li>
        Click on the little polygon on the top right of the map, under the
        Search box, to add a new area.
      </li>
      <li>
        Click on an existing area to select it. If one is hidden below another,
        change the shape of the one on top, save it, then click the one
        underneath, then change the shape back afterwards.
      </li>
      <li>
        Once selected you'll see little dots appear which you can then drag to
        edit - then Save.
      </li>
      <li>
        Once you select an area, you can't move or zoom the map, so position the
        map first. Click <em>Cancel</em> to unselect it.
      </li>
      <li>
        If you're remapping an area with a lot of points, it might be simpler to
        add a new simpler one and delete the old one.
      </li>
      <li>You can change the name of an area, and then click <em>Save</em>.</li>
      <li>
        <em>Areas to review</em> helps you see where mapping has changed or
        could be improved.
      </li>
      <li>
        CGA and DPA polygons cannot be changed here - use
        Settings->Group->Mapping.
      </li>
    </ul>
  </NoticeMessage>
  <b-button
    v-if="!showHelp"
    variant="link"
    class="float-end pt-0"
    @click="toggleHelp"
  >
    Help
  </b-button>
</template>
<script setup>
import { useHelpBox } from '~/composables/useHelpBox'

const { hide, toggleHelp, showHelp } = useHelpBox()

onMounted(() => {
  hide()
})
</script>
