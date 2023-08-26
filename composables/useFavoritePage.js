import { useMiscStore } from '~/stores/misc'

export function useFavoritePage(pageName) {
  const miscStore = useMiscStore()

  // save this page as the favorite one, so that the user is automatically redirected here the next time they load the app
  const existingHomepage = miscStore.get('lasthomepage')

  if (existingHomepage !== pageName) {
    miscStore.set({
      key: 'lasthomepage',
      value: pageName,
    })
  }
}
