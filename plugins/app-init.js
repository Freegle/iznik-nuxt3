import { Device } from '@capacitor/device'

export const mobilestate = {
  isiOS: false,
  devicePersistentId: null
}

console.log('--------------startup--------------')

export default defineNuxtPlugin(async () => {
  const runtimeConfig = useRuntimeConfig()
  if( !runtimeConfig.public.IS_APP) return

  console.log('--------------initapp--------------')
  const deviceinfo = await Device.getInfo()
  console.log('deviceinfo', deviceinfo)
  mobilestate.isiOS = deviceinfo.platform === 'ios'
  const deviceid = await Device.getId()
  console.log('deviceid', deviceid)
  mobilestate.devicePersistentId = deviceid.uuid
})