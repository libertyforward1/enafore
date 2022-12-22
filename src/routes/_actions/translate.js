import { importGoogleTranslate } from '../_utils/asyncModules/importGoogleTranslate.js'
import { store } from '../_store/store.js'
import { massageUserText } from '../_utils/massageUserText.js'
async function translate(html, to, from) {
  const { languageNames, translate } = await importGoogleTranslate()
  return {content:await translate(html, to, from), languageNames}
}
export function translateStatus(status, currentInstance, to = process.env.LOCALE, from = "auto") {
  const id = currentInstance + "-" + status.id;
  const { statusTranslations, statusTranslationContents, autoplayGifs } = store.get();
  statusTranslations[id] = statusTranslations[id] || {}
  statusTranslations[id].show = true;
  if(!(statusTranslations[id].loading || (statusTranslationContents[id] && statusTranslationContents[id].to === to  && statusTranslationContents[id].from === from))) {
    statusTranslations[id].loading = true
    translate(massageUserText(status.content, status.emojis || [], autoplayGifs), to, from).then(({content,languageNames}) => {
      const { statusTranslations, statusTranslationContents } = store.get();
      statusTranslations[id].loading = false
      statusTranslations[id].languageNames = languageNames
      statusTranslationContents[id] = content
      store.set({ statusTranslations, statusTranslationContents })
    }).catch((err) => {
      const { statusTranslations, statusTranslationContents } = store.get();
      statusTranslations[id].loading = false
      statusTranslations[id].error = true
      delete statusTranslationContents[id]
      store.set({ statusTranslations, statusTranslationContents })
    })
  }
  store.set({ statusTranslations })
}