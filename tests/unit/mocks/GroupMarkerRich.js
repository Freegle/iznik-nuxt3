// Mock for GroupMarkerRich component
export default {
  name: 'GroupMarkerRich',
  props: ['group'],
  template: '<div class="group-marker-rich" :data-group-id="group?.id"></div>',
}
