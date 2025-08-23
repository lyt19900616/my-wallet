import * as constant from './constant'
export default function injectMyWallet() {
  if (window.myWallet || window.myWalletInjected) {
    return
  }

  const myWallet = {
    // 连接钱包
    connect: async () => {
      return new Promise((resolve, reject) => {
        // 向background发送连接请求
        chrome.runtime.sendMessage(
          { type: constant.WALLET_CONNECT },
          (response) => {
            if (chrome.runtime.lastError) {
              reject("连接失败" + chrome.runtime.lastError.message)
              return
            }
            if (response.success) {
              resolve(response.data)
            } else {
              reject(response.error || "用户未授权")
            }
          }
        )
      })
    },
    // 获取当前账户信息
    getAccount: async () => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: constant.WALLET_GET_ACCOUNT },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message)
              return
            }
            resolve(response.data || null)
          }
        )
      })
    },
    // 签名信息
    signMessage: async (message: string) => {
      console.log('进行签名', message);
      
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { 
            type: constant.WALLET_SIGN_MESSAGE,
            data: { message }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message)
              return
            }
            if (response.success) {
              resolve(response.data.signedMessage)
            } else {
              reject(response.error || '签名失败')
            }
          }
        )
      })
    },
    // 断开连接
    disconnect: async () => {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: constant.WALLET_DISCONNECT },
          () => { resolve(true) }
        )
      })
    }
  }
  window.myWallet = myWallet
  window.myWalletInjected = true
}