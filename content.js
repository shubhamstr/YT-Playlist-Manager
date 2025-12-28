console.log("[YT Playlist Manager] content script loaded")

// Small helper
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Inject checkboxes on each playlist video
function injectCheckboxes() {
  const items = document.querySelectorAll("ytd-playlist-video-renderer")

  items.forEach((item, index) => {
    // Avoid duplicates
    if (item.querySelector(".yt-bulk-checkbox")) return

    const checkbox = document.createElement("input")
    checkbox.type = "checkbox"
    checkbox.className = "yt-bulk-checkbox"
    checkbox.style.marginRight = "8px"
    checkbox.style.cursor = "pointer"

    // Where to insert – near the thumbnail or title
    const targetContainer =
      item.querySelector("#thumbnail") ||
      item.querySelector("#thumbnail-container") ||
      item.querySelector("#meta")

    if (targetContainer && targetContainer.parentElement) {
      targetContainer.parentElement.insertBefore(checkbox, targetContainer)
    }
  })
}

// YouTube dynamically loads items, so run periodically
setInterval(injectCheckboxes, 1500)

// Add the floating control panel (UI)
function createControlPanel() {
  // If panel exists, just show it again
  if (document.getElementById("yt-bulk-panel")) {
    document.getElementById("yt-bulk-panel").style.display = "block"
    return
  }

  // If reopen button doesn't exist, create it
  if (!document.getElementById("yt-bulk-reopen")) {
    const reopenBtn = document.createElement("button")
    reopenBtn.id = "yt-bulk-reopen"
    reopenBtn.innerText = "YT"
    reopenBtn.style.position = "fixed"
    reopenBtn.style.bottom = "20px"
    reopenBtn.style.right = "20px"
    reopenBtn.style.zIndex = "99999999"
    reopenBtn.style.background = "#1e88e5"
    reopenBtn.style.color = "#fff"
    reopenBtn.style.border = "none"
    reopenBtn.style.borderRadius = "50%"
    reopenBtn.style.width = "45px"
    reopenBtn.style.height = "45px"
    reopenBtn.style.cursor = "pointer"
    reopenBtn.style.fontWeight = "bold"
    reopenBtn.style.fontSize = "16px"
    reopenBtn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.25)"

    reopenBtn.onclick = () => {
      const panel = document.getElementById("yt-bulk-panel")
      if (panel) panel.style.display = "block"
    }

    document.body.appendChild(reopenBtn)
  }

  // Main panel
  const panel = document.createElement("div")
  panel.id = "yt-bulk-panel"
  panel.style.position = "fixed"
  panel.style.top = "80px"
  panel.style.right = "20px"
  panel.style.zIndex = "9999999"
  panel.style.background = "#ffffff"
  panel.style.padding = "12px"
  panel.style.borderRadius = "10px"
  panel.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"
  panel.style.fontFamily = "Arial, sans-serif"
  panel.style.fontSize = "12px"
  panel.style.maxWidth = "260px"

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <div style="font-weight:bold;">YT Bulk Playlist</div>
      <button id="yb-close"
        style="
          background:none;
          border:none;
          font-size:16px;
          cursor:pointer;
          padding:0;
          margin:0;
          line-height:14px;
        ">✖</button>
    </div>

    <button id="yb-select-page" style="margin:2px 0; width:100%;">Select All (page)</button>
    <button id="yb-select-all" style="margin:2px 0; width:100%;">Auto Select Entire Playlist</button>

    <hr style="margin:8px 0;">

    <div style="margin-bottom:4px;">Title contains:</div>
    <input id="yb-title-input" placeholder="e.g. tutorial" style="width:100%; margin-bottom:4px;"/>
    <button id="yb-select-title" style="margin:2px 0; width:100%;">Select by Title</button>

    <div style="margin-top:6px; margin-bottom:4px;">Channel contains:</div>
    <input id="yb-channel-input" placeholder="e.g. fireship" style="width:100%; margin-bottom:4px;"/>
    <button id="yb-select-channel" style="margin:2px 0; width:100%;">Select by Channel</button>

    <div style="margin-top:6px; margin-bottom:4px;">Min duration (minutes):</div>
    <input id="yb-duration-input" type="number" min="0" placeholder="e.g. 10" style="width:100%; margin-bottom:4px;"/>
    <button id="yb-select-duration" style="margin:2px 0; width:100%;">Select by Duration</button>

    <button id="yb-select-unavailable" style="margin-top:6px; width:100%;">Select Unavailable</button>

    <hr style="margin:8px 0;">

    <button id="yb-remove" style="background:#e53935; color:#fff; width:100%; margin-bottom:4px;">
      Remove Selected
    </button>

    <button id="yb-move" style="background:#1e88e5; color:#fff; width:100%;">
      Add/Move to Playlist
    </button>
  `

  document.body.appendChild(panel)

  // Close button — hides, not removes
  document.getElementById("yb-close").onclick = () => {
    panel.style.display = "none"
  }

  // Event bindings
  document.getElementById("yb-select-page").onclick = selectAllOnPage
  document.getElementById("yb-select-all").onclick = autoSelectEntirePlaylist
  document.getElementById("yb-select-title").onclick = selectByTitle
  document.getElementById("yb-select-channel").onclick = selectByChannel

  document.getElementById("yb-select-duration").onclick = () => {
    const val = document.getElementById("yb-duration-input").value
    const min = parseInt(val, 10)
    if (!isNaN(min)) selectByDuration(min)
    else alert("Enter a valid number")
  }

  document.getElementById("yb-select-unavailable").onclick = selectUnavailable
  document.getElementById("yb-remove").onclick = bulkRemove
  document.getElementById("yb-move").onclick = bulkMove
}

// Wait for page to stabilize a bit
setTimeout(createControlPanel, 3000)

// Implement “Select All” behaviors
function selectAllOnPage() {
  const checkboxes = document.querySelectorAll(".yt-bulk-checkbox")
  let count = 0
  checkboxes.forEach((cb) => {
    cb.checked = true
    count++
  })
  alert(`Selected ${count} videos on this page.`)
}
async function autoSelectEntirePlaylist() {
  let lastCount = 0

  // Keep scrolling until no more items load
  while (true) {
    window.scrollTo(0, document.documentElement.scrollHeight)
    await wait(1000)

    const items = document.querySelectorAll(
      "ytd-playlist-video-renderer"
    ).length
    if (items === lastCount) break
    lastCount = items
  }

  injectCheckboxes() // ensure all items got checkboxes

  const checkboxes = document.querySelectorAll(".yt-bulk-checkbox")
  checkboxes.forEach((cb) => (cb.checked = true))

  alert(`Auto-selected all ${checkboxes.length} videos in this playlist.`)
}

// Implement filters (title, channel, duration, unavailable)
function selectByTitle() {
  const input = document.getElementById("yb-title-input")
  const keyword = (input.value || "").toLowerCase().trim()
  if (!keyword) {
    alert("Enter a title keyword first.")
    return
  }

  const items = document.querySelectorAll("ytd-playlist-video-renderer")
  let count = 0

  items.forEach((item) => {
    const titleEl = item.querySelector("#video-title")
    if (!titleEl) return

    const title = titleEl.innerText.toLowerCase()
    const cb = item.querySelector(".yt-bulk-checkbox")
    if (!cb) return

    if (title.includes(keyword)) {
      cb.checked = true
      count++
    }
  })

  alert(`Selected ${count} videos with title containing "${keyword}".`)
}
function selectByChannel() {
  const input = document.getElementById("yb-channel-input")
  const keyword = (input.value || "").toLowerCase().trim()
  if (!keyword) {
    alert("Enter a channel keyword first.")
    return
  }

  const items = document.querySelectorAll("ytd-playlist-video-renderer")
  let count = 0

  items.forEach((item) => {
    const channelEl = item.querySelector("ytd-channel-name a")
    if (!channelEl) return

    const channelName = channelEl.innerText.toLowerCase()
    const cb = item.querySelector(".yt-bulk-checkbox")
    if (!cb) return

    if (channelName.includes(keyword)) {
      cb.checked = true
      count++
    }
  })

  alert(`Selected ${count} videos from channels containing "${keyword}".`)
}
function parseTimeToSeconds(timeStr) {
  // e.g. "12:34" or "1:02:03"
  if (!timeStr) return 0
  const parts = timeStr.trim().split(":").map(Number)
  if (parts.some(isNaN)) return 0

  if (parts.length === 3) {
    const [h, m, s] = parts
    return h * 3600 + m * 60 + s
  }
  if (parts.length === 2) {
    const [m, s] = parts
    return m * 60 + s
  }
  return parts[0] || 0
}

function selectByDuration(minMinutes) {
  const minSeconds = minMinutes * 60
  const items = document.querySelectorAll("ytd-playlist-video-renderer")
  let count = 0

  items.forEach((item) => {
    // Duration text on thumbnail overlay
    const timeEl =
      item.querySelector("ytd-thumbnail-overlay-time-status-renderer span") ||
      item.querySelector("span.ytd-thumbnail-overlay-time-status-renderer") ||
      item.querySelector("span#text")
    if (!timeEl) return

    const seconds = parseTimeToSeconds(timeEl.innerText)
    const cb = item.querySelector(".yt-bulk-checkbox")
    if (!cb) return

    if (seconds >= minSeconds) {
      cb.checked = true
      count++
    }
  })

  alert(`Selected ${count} videos longer than ${minMinutes} minutes.`)
}
function selectUnavailable() {
  const items = document.querySelectorAll("ytd-playlist-video-renderer")
  let count = 0

  items.forEach((item) => {
    const text = item.innerText.toLowerCase()
    const cb = item.querySelector(".yt-bulk-checkbox")
    if (!cb) return

    if (text.includes("deleted video") || text.includes("private video")) {
      cb.checked = true
      count++
    }
  })

  alert(`Selected ${count} unavailable (deleted/private) videos.`)
}

// Helpers to click YouTube menu items
function getSelectedItems() {
  return Array.from(document.querySelectorAll(".yt-bulk-checkbox:checked"))
    .map((cb) => cb.closest("ytd-playlist-video-renderer"))
    .filter(Boolean)
}

function findMenuButtonForItem(item) {
  // The menu button is inside ytd-menu-renderer
  const menuBtn =
    item.querySelector("ytd-menu-renderer yt-icon-button#button") ||
    item.querySelector("#button[aria-label*='Action menu']") ||
    item.querySelector("#button[aria-label*='More actions']")
  return menuBtn
}

function clickMenuItemByText(partialText) {
  partialText = partialText.toLowerCase()
  const candidates = Array.from(
    document.querySelectorAll(
      "tp-yt-paper-item, ytd-menu-service-item-renderer, ytd-compact-link-renderer"
    )
  )

  const target = candidates.find((el) =>
    el.innerText.toLowerCase().includes(partialText)
  )

  if (target) {
    target.click()
    return true
  }
  return false
}

// Bulk Remove selected videos
async function bulkRemove() {
  const items = getSelectedItems()
  if (!items.length) {
    alert("No videos selected.")
    return
  }

  if (!confirm(`Remove ${items.length} videos from this playlist?`)) {
    return
  }

  for (const item of items) {
    const menuBtn = findMenuButtonForItem(item)
    if (!menuBtn) {
      console.warn("Menu button not found for an item")
      continue
    }

    menuBtn.click()
    await wait(400)

    // Try to click "Remove from playlist"
    let clicked = clickMenuItemByText("remove from playlist")
    if (!clicked) {
      // fallback if language/localization changes; you can adjust text
      clicked = clickMenuItemByText("remove")
    }

    await wait(600) // wait for removal to process
  }

  alert(
    `Requested removal of ${items.length} videos. Page may refresh or update automatically.`
  )
}

// Bulk Add/Move to another playlist
async function bulkMove() {
  console.log("bulkMove")
  const items = getSelectedItems()
  if (!items.length) {
    alert("No videos selected.")
    return
  }

  const targetName = prompt("Enter target playlist name (or part of it):")
  if (!targetName) return

  const targetLower = targetName.toLowerCase()

  for (const item of items) {
    const menuBtn = findMenuButtonForItem(item)
    if (!menuBtn) {
      console.warn("Menu button not found for an item")
      continue
    }

    menuBtn.click()
    await wait(400)

    // Open "Save to playlist"
    let clicked = clickMenuItemByText("save to playlist")
    if (!clicked) {
      clicked = clickMenuItemByText("save")
    }

    await wait(700) // wait for dialog

    // Inside dialog: find a playlist option
    const options = Array.from(
      document.querySelectorAll(
        "yt-list-item-view-model"
      )
    )
    console.log("targetLower", targetLower)
    console.log("options", options)

    const targetOption = options.find((el) =>
      el.innerText.toLowerCase().includes(targetLower)
    )

    console.log("targetOption", targetOption)

    if (targetOption) {
      targetOption.click()
      await wait(300)
    } else {
      console.warn("Playlist not found in dialog:", targetName)
    }

    // Close dialog if needed by pressing Escape (optional)
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
      })
    )

    await wait(500)
  }

  alert(
    `Tried to add/move ${items.length} videos to playlist containing: "${targetName}".`
  )
}
