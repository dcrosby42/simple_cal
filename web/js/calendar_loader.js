/*
Result index looks like this:
{
    "env": "production",
    "components": {
        "auth": [
            { // (we call this object a resultMeta in the view code)
                "type": "ValidationResult",
                "path": "validationResults/auth/auth_aspnetusers_validationResult.json",
                "component": "auth",
                "validationId": "aspnetusers"
            },
            {
                "type": "ValidationResult",
                "path": "validationResults/auth/auth_securityanswers_validationresult.json",
                "component": "auth",
                "validationId": "securityanswers"
            }
        ]
    }
}
*/
async function loadResultIndex() {
  return await loadJson("validationResultIndex.json")
}

async function loadValidationResult(resultMeta) {
  return await loadJson(resultMeta.path)
}

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


export { loadResultIndex, loadValidationResult }