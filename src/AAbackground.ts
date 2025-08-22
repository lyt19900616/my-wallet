// 存储账户信息（实际项目中应加密存储）
const mockAccounts = ["0x1234567890abcdef..."]

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background received message:", message)

  switch (message.type) {
    case "WALLET_REQUEST_ACCOUNTS":
      // 模拟授权逻辑
      sendResponse({ accounts: mockAccounts })
      break
    case "WALLET_SIGN_MESSAGE":
      // 模拟签名逻辑
      const signed = `signed:${message.data}`
      sendResponse({ signedMessage: signed })
      break
    default:
      sendResponse({ error: "Unknown command" })
  }
})

console.log("background script loaded, ready to handle messages")