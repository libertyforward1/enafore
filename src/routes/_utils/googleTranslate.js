import getGoogleTranslateHTML from "./googleTranslateHTML.js";
import { languageList } from "lingva-scraper/dist/utils/language.js";
export const languageNames = languageList.all
export const translate = getGoogleTranslateHTML(async function translate(text, to, from) {
  const data = (await (await fetch("https://lingva.garudalinux.org/api/graphql", {
    "headers": {
      "Content-Type": "application/json",
    },
    "body": JSON.stringify({
      "query": "query($q:String!,$s:String!,$t:String!){translation(query:$q,source:$s,target:$t){source{detected{code}}target{text}}}",
      "variables":{
        "q": text,
        "s": from,
        "t": to
      }
    }),
    "method": "POST"
  })).json()).data.translation
  return {
    detected: data.source.detected.code,
    text: data.target.text,
    to,
    from
  }
});
