// public/bridge.js
if (window.myWallet) {
  console.log("⚠️ myWallet 已存在，避免重复注入")
} else {
  // 暴露钱包接口到 window
  window.myWallet = {
    requestAccounts: async () => {
      console.log("📞 收到 requestAccounts 调用")
      return ["0x1234567890abcdef..."] // 示例账户
    },
    isConnected: () => true
  }
  console.log("✅ window.myWallet 已初始化")
  // 触发事件通知DApp钱包已加载
  window.dispatchEvent(new Event("myWalletLoaded"))
}