import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import { useRuntimeConfig } from '#app'
import Api from '~/api'
import { useMobileStore } from '~/stores/mobile'

export function useDonationAskModal(requestedVariant = null) {
  const authStore = useAuthStore()
  const miscStore = useMiscStore()
  const runtimeConfig = useRuntimeConfig()
  const api = Api(runtimeConfig)

  const me = authStore.user

  const variant = ref(requestedVariant)
  const groupId = ref(null)

  const { $bus } = useNuxtApp()

  $bus.$on('outcome', (params) => {
    groupId.value = params.groupid
    const { outcome } = params

    if (outcome === 'Taken' || outcome === 'Received') {
      // If someone has set up a regular donation, then we don't ask them to donate again.  Wouldn't be fair to
      // pester them.

      const lastAsk = miscStore.get('lastdonationask')
      const canAsk =
        !lastAsk || new Date().getTime() - lastAsk > 60 * 60 * 1000 * 24 * 7

      if (!me?.donorrecurring && canAsk) {
        show()
      }
    }
  })

  const showDonationAskModal = ref(false)
  async function show(requestedVariant) {
    const mobileStore = useMobileStore()
    miscStore.set({
      key: 'lastdonationask',
      value: new Date().getTime(),
    })

    console.log('stripe uDAM start', variant.value, requestedVariant)
    console.log('Show', variant.value, requestedVariant)
    if (requestedVariant) {
      // We need to decide which variant of donation ask to show.
      variant.value = requestedVariant
    }

    if (typeof variant.value === 'undefined' || !variant.value) {
      try {
        if (!requestedVariant) {
          requestedVariant = {
            variant: 'stripe',
          }

          let gotnow = false
          if (mobileStore.isApp) {
            const rateappnotagain =
              window.localStorage.getItem('rateappnotagain')
            if (!rateappnotagain) {
              const acertainratio = Math.random()
              console.log('stripe acertainratio', acertainratio)
              if (acertainratio > 0.7) {
                requestedVariant = { variant: 'rateapp' }
                gotnow = true
                console.log(
                  'stripe uDAM rateapp',
                  variant.value,
                  requestedVariant
                )
              }
            }
          }

          if (!gotnow) {
            requestedVariant = await api.bandit.choose({
              uid: 'donation',
            })
            console.log('stripe uDAM chosen', variant.value, requestedVariant)
          }

          if (requestedVariant) {
            variant.value = requestedVariant.variant
          }
        }
      } catch (e) {
        console.error('Get variant failed')
      }
    }
    if (mobileStore.isApp && mobileStore.isiOS && variant.value === 'stripe') {
      variant.value = 'buttons2510'
      console.log('stripe uDAM iOS', variant.value)
    }

    showDonationAskModal.value = true

    // Record the show
    await api.bandit.shown({
      uid: 'donation',
      variant: variant.value,
    })
    console.log('stripe uDAM end', variant.value)
  }

  return { showDonationAskModal, variant, groupId, show }
}
