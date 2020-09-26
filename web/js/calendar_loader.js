
const JsonByUrl = {} // Caching of json results by their url

async function loadJson(url, caching = true) {
  if (caching) {
    if (JsonByUrl[url]) {
      return JsonByUrl[url]
    }
  }
  const res = await fetch(url)
  let data = await res.json()
  data = Object.freeze(data) // freezing objects discourages Vue from trying to subscribe/depend. we got big daters.
  JsonByUrl[url] = data
  return data
}

const loadCalendar = loadJson

export { loadCalendar }