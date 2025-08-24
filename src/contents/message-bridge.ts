import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
  // world: "ISOLATED"
}
console.log("message-bridge.ts 已经加载");

// 监听来自 injected-helper 的消息
window.addEventListener("message", (event) => {
  console.log("收到来自 injected-helper 的消息：", event);
  if (
    event.source !== window ||
    !event.data ||
    event.data.from !== "injected-helper" ||
    event.data.type ||
    event.data.requestId
  ) {
    return
  }

  // 转发消息到background
  chrome.runtime.sendMessage(
    {
      type: event.data.type,
      requestId: event.data.requestId,
      data: event.data.data
    },
    (response) => {
      console.log("收到来自 background 的响应：", response)
      if (chrome.runtime.lastError) {
        console.error("转发消息到background失败：", chrome.runtime.lastError)
         window.postMessage({
          from: 'message-bridge',
          requestId: event.data.requestId,
          success: false,
          error: chrome.runtime.lastError.message
         }, window.location.origin)
         return
      }
      window.postMessage({
        from: 'message-bridge',
        requestId: event.data.requestId,
        success: true,
        data: response.data
      }, window.location.origin)
    }
  )
})
