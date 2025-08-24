import * as constant from './constant'
export default function injectMyWallet() {
  if (window.myWallet || window.myWalletInjected) {
    return
  }

  // 请求id
  const generateRequestId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  const myWallet = {
    // 连接钱包
    connect: async () => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        // 向桥接发送连接请求
        const message = {
          type: constant.WALLET_CONNECT,
          requestId,
          from : 'injected-helper'
        }
        // window.postMessage(message, '*')
        window.postMessage(message, window.location.origin)

        // 监听连接结果
        const handleResponse = (event: MessageEvent) => {
          // if (
          //   event.source !== window || 
          //   !event.data || 
          //   event.data.from !== 'injected-helper' || 
          //   event.data.requestId !== requestId) {
          //   return
          // }
          if (!_isValidResponse(event, requestId)) return
          //  清除监听
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.account)
          } else {
            reject(event.data.error || '连接失败')
          }
        }
        window.addEventListener('message', handleResponse)

        // 超时处理
        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject('连接超时')
        }, 30000)
      })
    },
    // 获取当前账户信息
    getAccount: async () => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const message = {
          type: constant.WALLET_GET_ACCOUNT,
          requestId,
          from : 'injected-helper'
        }
        window.postMessage(message, window.location.origin)

        const handleResponse = (event: MessageEvent) => {
          // if (
          //   event.source !== window || 
          //   !event.data || 
          //   event.data.from !== 'injected-helper' || 
          //   event.data.requestId !== requestId) {
          //   return
          // }
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.account)
          } else {
            reject(event.data.error || '获取账户信息失败')
          }
        }
        window.addEventListener('message', handleResponse)
      })
    },
    // 签名信息
    signMessage: async (message: string) => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const messageData = {
          type: constant.WALLET_SIGN_MESSAGE,
          data: { message },
          requestId,
          from : 'injected-helper'
        }
        window.postMessage(messageData, window.location.origin)

        const handleResponse = (event: MessageEvent) => {
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)

          if (event.data.success) {
            resolve(event.data.data.signedMessage)
          } else {
            reject(event.data.error || '签名失败')
          }
        }
        window.addEventListener('message', handleResponse)
        setTimeout(() => {
          window.removeEventListener('message', handleResponse)
          reject('签名超时')
        }, 30000)
      })
    },
    // 断开连接
    disconnect: async () => {
      return new Promise((resolve, reject) => {
        const requestId = generateRequestId()
        const message = {
          type: constant.WALLET_DISCONNECT,
          requestId,
          from : 'injected-helper'
        }
        window.postMessage(message, window.location.origin)

        const handleResponse = (event: MessageEvent) => {
          if (!_isValidResponse(event, requestId)) return
          window.removeEventListener('message', handleResponse)
          resolve(true)
        }
        window.addEventListener('message', handleResponse)
      })
    }
  }
  window.myWallet = myWallet
  window.myWalletInjected = true
  console.log("myWallet 已经注入到页面"); 
}  

function _isValidResponse(event: MessageEvent, requestId: string) {
  return event.source === window &&
          !event.data &&
          event.data.from === 'injected-helper' &&
          event.data.requestId === requestId
}

// export default function injectMyWallet() {
//   if (window.myWallet || window.myWalletInjected) {
//     return
//   }

//   const myWallet = {
//     // 连接钱包
//     connect: async () => {
//       return new Promise((resolve, reject) => {
//         // 向background发送连接请求
//         chrome.runtime.sendMessage(
//           { type: constant.WALLET_CONNECT },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               reject("连接失败" + chrome.runtime.lastError.message)
//               return
//             }
//             if (response.success) {
//               resolve(response.data)
//             } else {
//               reject(response.error || "用户未授权")
//             }
//           }
//         )
//       })
//     },
//     // 获取当前账户信息
//     getAccount: async () => {
//       return new Promise((resolve, reject) => {
//         chrome.runtime.sendMessage(
//           { type: constant.WALLET_GET_ACCOUNT },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               reject(chrome.runtime.lastError.message)
//               return
//             }
//             resolve(response.data || null)
//           }
//         )
//       })
//     },
//     // 签名信息
//     signMessage: async (message: string) => {
//       console.log('进行签名', message);
      
//       return new Promise((resolve, reject) => {
//         chrome.runtime.sendMessage(
//           { 
//             type: constant.WALLET_SIGN_MESSAGE,
//             data: { message }
//           },
//           (response) => {
//             if (chrome.runtime.lastError) {
//               reject(chrome.runtime.lastError.message)
//               return
//             }
//             if (response.success) {
//               resolve(response.data.signedMessage)
//             } else {
//               reject(response.error || '签名失败')
//             }
//           }
//         )
//       })
//     },
//     // 断开连接
//     disconnect: async () => {
//       return new Promise((resolve) => {
//         chrome.runtime.sendMessage(
//           { type: constant.WALLET_DISCONNECT },
//           () => { resolve(true) }
//         )
//       })
//     }
//   }
//   window.myWallet = myWallet
//   window.myWalletInjected = true
// }