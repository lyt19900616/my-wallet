// content.ts

console.log("content.ts 加载成功");

// ① 注入 inpage.js
const script = document.createElement("script")
script.src = chrome.runtime.getURL("inpage.js")
console.log('src: ', chrome.runtime.getURL("inpage.js"));

script.type = "text/javascript"
document.documentElement.appendChild(script)
script.remove()

// ② 监听 inpage 发来的 window.postMessage
window.addEventListener("message", (event) => {
  if (event.source !== window) return
  if (event.data.type && event.data.type === "FROM_INPAGE") {
    console.log("[content] 收到 inpage 消息：", event.data.data)

    // 转发给 background
    chrome.runtime.sendMessage(
      { type: "FROM_PAGE", data: event.data.data },
      (response) => {
        console.log("[content] 收到 background 回复：", response)

        // 再把回复发回给 inpage
        window.postMessage(
          { type: "FROM_BACKGROUND", data: response },
          "*"
        )
      }
    )
  }
})
