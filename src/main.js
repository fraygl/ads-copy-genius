document.addEventListener("DOMContentLoaded", () => {
  const mainView = document.getElementById("main")
  const authView = document.getElementById("auth")
  const settingsButton = document.getElementById("settings-button")
  const logoButton = document.getElementById("logo-container")
  const submitButton = document.getElementById("submit-button")
  const resetButton = document.getElementById("reset-button")
  const submitApiKeyButton = document.getElementById("submit-key-button")
  const headlinesResult = document.querySelector(".headlines-result")
  const bodiesResult = document.querySelector(".bodies-result")
  const headlinesLoader = document.querySelector(".headlines-loader")
  const bodiesLoader = document.querySelector(".bodies-loader")

  chrome.storage.local.get("apiKey").then(({ apiKey }) => {
    if (apiKey) {
      mainView.style.display = "block"

      chrome.storage.session.get("savedStade").then(({ savedStade }) => {
        if (savedStade) {
          const { productDescription, headlines, bodies } = savedStade

          setDescription(productDescription)
          setHeadlines(headlines)
          setBodies(bodies)
        }
      })
    } else {
      authView.style.display = "block"
      console.log("no auth")
    }
  })

  //Buttons Events

  logoButton.addEventListener("click", () => {
    chrome.storage.local.get("apiKey").then(({ apiKey }) => {
      if (apiKey) {
        authView.style.display = "none"
        mainView.style.display = "block"
      }
    })
  })

  settingsButton.addEventListener("click", () => {
    const apiKeyInput = document.getElementById("apiKey")
    chrome.storage.local.get("apiKey").then(({ apiKey }) => {
      if (apiKey) {
        apiKeyInput.value = apiKey
      }
    })

    authView.style.display = "block"
    mainView.style.display = "none"
  })

  submitButton.addEventListener("click", () => {
    const description = document.getElementById("textarea").value

    headlinesLoader.style.display = "block"
    bodiesLoader.style.display = "block"
    headlinesResult.style.display = "none"
    bodiesResult.style.display = "none"

    let session = {
      productDescription: description,
      headlines: null,
      bodies: null,
    }

    generateHeadlines(description).then((data) => {
      const output = cleanOutput(data.choices[0].text)
      session = { ...session, headlines: output }
      chrome.storage.session.set({
        savedStade: session,
      })
      setHeadlines(output)
    })

    generateBodies(description).then((data) => {
      const output = cleanOutput(data.choices[0].text)
      session = { ...session, bodies: output }
      chrome.storage.session.set({
        savedStade: session,
      })
      setBodies(output)
    })
  })

  resetButton.addEventListener("click", () => {
    headlinesLoader.style.display = "none"
    bodiesLoader.style.display = "none"
    headlinesResult.style.display = "none"
    bodiesResult.style.display = "none"
    document.getElementById("textarea").value = ""
    chrome.storage.session.set({
      savedStade: {
        productDescription: null,
        headlines: null,
        bodies: null,
      },
    })
  })

  submitApiKeyButton.addEventListener("click", () => {
    const apiKey = document.getElementById("apiKey").value

    chrome.storage.local
      .set({
        apiKey,
      })
      .then(() => {
        authView.style.display = "none"
        mainView.style.display = "block"
        console.log("Saved API Key")
      })
  })
})

function setDescription(description) {
  if (!description) return
  document.getElementById("textarea").value = description
}

function setHeadlines(headlines) {
  if (!headlines) return
  const headlinesResult = document.querySelector(".headlines-result")
  const headlinesLoader = document.querySelector(".headlines-loader")
  const headlinesDiv = document.querySelector("#headlines")
  headlinesDiv.innerText = headlines
  headlinesLoader.style.display = "none"
  headlinesResult.style.display = "block"
}

function setBodies(bodies) {
  if (!bodies) return
  const bodiesResult = document.querySelector(".bodies-result")
  const bodiesLoader = document.querySelector(".bodies-loader")
  const bodiesDiv = document.querySelector("#body-texts")
  bodiesDiv.innerText = bodies
  bodiesLoader.style.display = "none"
  bodiesResult.style.display = "block"
}

function cleanOutput(text) {
  return text.trim()
}
