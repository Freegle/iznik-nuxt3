// We list the icons we use explicitly because this reduces our bundle size.

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowLeft,
  faBars,
  faBullhorn,
  faCamera,
  faCoffee,
  faCog,
  faCalendarAlt,
  faCrown,
  faEye,
  faGift,
  faHandsHelping,
  faHashtag,
  faHome,
  faLeaf,
  faLink,
  faPlus,
  faQuestionCircle,
  faSearch,
  faShoppingCart,
  faSignOutAlt,
  faSpinner,
  faTimesCircle,
  faTrashAlt,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faArrowLeft,
  faBars,
  faBullhorn,
  faCamera,
  faCoffee,
  faCog,
  faCalendarAlt,
  faCrown,
  faEye,
  faGift,
  faHandsHelping,
  faHashtag,
  faHome,
  faLeaf,
  faLink,
  faPlus,
  faQuestionCircle,
  faSearch,
  faShoppingCart,
  faSignOutAlt,
  faSpinner,
  faTimesCircle,
  faTrashAlt,
  faUser
)

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VIcon', FontAwesomeIcon)
})
