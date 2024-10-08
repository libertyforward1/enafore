import { database } from '../_database/database.js'
import { mark, stop } from '../_utils/marks.js'
import { rehydrateStatusOrNotification } from './rehydrateStatusOrNotification.js'
import { store } from '../_store/store.js'

async function getNotification (instanceName, timelineType, timelineValue, itemId) {
  return {
    timelineType,
    timelineValue,
    notification: await database.getNotification(instanceName, itemId)
  }
}

async function getStatus (instanceName, timelineType, timelineValue, itemId) {
  return {
    timelineType,
    timelineValue,
    status: await database.getStatus(instanceName, itemId)
  }
}

export function createMakeProps (instanceName, timelineType, timelineValue) {
  let promiseChain = Promise.resolve()
  async function fetchFromIndexedDB (itemId) {
    mark(`fetchFromIndexedDB-${itemId}`)
    try {
      const res = await (timelineType === 'notifications'
        ? getNotification(instanceName, timelineType, timelineValue, itemId)
        : getStatus(instanceName, timelineType, timelineValue, itemId))
      const instanceDataReady = store.getInstanceData(instanceName, 'instanceDataReady')
      await instanceDataReady
      await rehydrateStatusOrNotification(res)
      return res
    } finally {
      stop(`fetchFromIndexedDB-${itemId}`)
    }
  }

  async function getStatusOrNotification (itemId) {
    const statusOrNotification = await fetchFromIndexedDB(itemId)
    return statusOrNotification
  }

  // The results from IndexedDB or the worker thread can return in random order,
  // so we ensure consistent ordering based on the order this function is called in.
  return itemSummary => {
    const getStatusOrNotificationPromise = getStatusOrNotification(itemSummary.id) // start the promise ASAP
    return new Promise((resolve, reject) => {
      promiseChain = promiseChain
        .then(() => getStatusOrNotificationPromise)
        .then(resolve, reject)
    })
  }
}
