import type { PlasmoCSConfig } from "plasmo"

console.log('message-bridge');


export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// 监听来自页面的消息
window.addEventListener("message", (event) => {
  console.log("网页 message", event);
  
  // 只处理来自同一个窗口的消息
  if (event.source !== window) return
  
  // 只处理我们关心的消息类型
  if (event.data && event.data.type === 'WALLET_CONNECT_REQUEST' && event.data.source === 'myWallet') {
    console.log("🌉 Content script 收到连接请求，转发给 background script")
    
    // 转发消息到 background script
    chrome.runtime.sendMessage({
      type: 'WALLET_CONNECT_REQUEST',
      source: 'contentScript',
      timestamp: event.data.timestamp,
      origin: window.location.origin
    })
  }
})

// 监听来自 background script 的响应
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background message", event);
  if (message.type === 'WALLET_CONNECT_RESPONSE') {
    console.log("🌉 Content script 收到 background 响应，转发给页面")
    
    // 转发响应到页面
    window.postMessage(message, '*')
  }
})

console.log("🌉 Message bridge content script 已加载")