import { createModule  } from "../blort-cdn.js";

const module = createModule()

module.addVariable(async function dog() {
  return fetchJSON(`https://dog.ceo/api/breeds/image/random`)
})

module.addVariable(async function breeds() {
  return fetchJSON(`https://dog.ceo/api/breeds/list/all`)
})

module.addVariable(function dogImage(html, dog) {
  return html`<img src='${dog.message}'/>`
})

async function fetchJSON(url) {
  const fetched = await fetch(url)
  return fetched.json()
}
