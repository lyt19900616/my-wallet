import { useWalletStore } from '../stores/walletStore';
import * as constant from './constant';
import injectMyWallet from './injected-helper';

console.log('background 脚本启动了');

// 初始化钱包状态
const initWallet = () => {
  const walletStore = useWalletStore.getState()
  // TODO 初始化逻辑
  console.log('🔄 初始化钱包状态完成'); 
}

// 注册消息监听器
const setupMessageListener = () => {
  console.log('🔄 监听来自 message-bridge 的消息');
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("background 收到消息:", message.type, "来自标签页：", sender.tab?.id);
    // 处理连接请求
    if (message.type === constant.WALLET_CONNECT) {
      const walletStore = useWalletStore.getState()
      try {
        walletStore.connect().then(() => {
          const account = walletStore.currentAccount
          sendResponse({
            data: { account }
          })
        }).catch((error) => {
          sendResponse({
            data: { error: error.message },
          })
        })
      } catch (error) {
        sendResponse({
          data: { error: error instanceof Error ? error.message : '连接失败' },
        })
      }
      return true
    }

    // 获取账号请求
    if (message.type === constant.WALLET_GET_ACCOUNT) {
      const walletStore = useWalletStore.getState()
      const account = walletStore.currentAccount
      sendResponse({
        data: { account }
      })
      return true
    }
    
    // 处理签名
    if (message.type === constant.WALLET_SIGN_MESSAGE) {
      if (!message.data || !message.data.message) {
        sendResponse({
          data: { error: '缺少签名信息' },
        })
        return true 
      }
      const walletStore = useWalletStore.getState()
      try {
        walletStore.signMessage(message.data.message)
        .then((signedMessage) => {
          sendResponse({
            data: { signedMessage }
          })
        })
        .catch((error) => {
          sendResponse({
            data: { error: error.message },
          })
        })
      } catch (error) {
        sendResponse({
          data: { error: error instanceof Error ? error.message : '签名失败' },
        })
      }
    }

    // 处理断开连接
    if (message.type === constant.WALLET_DISCONNECT) {
      const walletStore = useWalletStore.getState()
      walletStore.disconnect()
      sendResponse({
        data: { success: true }
      })
      return true
    }

    // 未知类型消息
    sendResponse({
      data: { error: '未知消息类型' },
    })
    return true
  })
}

// 注入钱包脚本到页面
const setupScriptInjection = () => {
  // 当页面加载完成时注入
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
      console.log("🔄 页面加载完成，开始注入 myWallet:", tab.url)
      chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: injectMyWallet
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Background script: 注入失败", chrome.runtime.lastError)
        } else {
          console.log("✅ Background script: myWallet 注入完成")
        }
      })
    }
  })

  // 当标签页激活时也注入（备用机制）
  chrome.tabs.onActivated.addListener((e) => {
    chrome.tabs.get(e.tabId, (tab) => {
      if (tab.url && !tab.url.startsWith('chrome://')) {
        console.log("🔄 标签页激活，注入 myWallet:", tab.url)
        chrome.scripting.executeScript({
          target: { tabId: e.tabId },
          world: "MAIN",
          func: injectMyWallet
        }, () => {
          if (chrome.runtime.lastError) {
            console.error("❌ Background script: 注入失败", chrome.runtime.lastError)
          } else {
            console.log("✅ Background script: myWallet 注入完成")
          }
        })  
      }
    })  
  })
}

// 初始化
initWallet()
setupMessageListener()
setupScriptInjection()

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔄 扩展安装事件:', details.reason);
  if (details.reason === 'install') {
    // 执行安装时的操作
    console.log('🔄 扩展安装完成');
  }
})

// // 给chrom 注入wallet的时机 
// // 1.标签页加载完成时
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   console.log("chrome.tabs.onUpdated", tabId, changeInfo, tab);
  
//   // 只在页面完成加载时注入
//   if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
//     console.log("🔄 页面加载完成，开始注入 myWallet:", tab.url)
//     inject(tabId)
//   }
// })

// // 2.在标签页激活时也注入（备用机制）
// chrome.tabs.onActivated.addListener((e) => {
//   console.log("chrome.tabs.onActivated", e);
//   chrome.tabs.get(e.tabId, (tab) => {
//     if (tab.url && !tab.url.startsWith('chrome://')) {
//       console.log("🔄 标签页激活，注入 myWallet:", tab.url)
//       inject(e.tabId)
//     }
//   })
// })

// const inject = async (tabId: number) => {
//   try {
//     // 执行注入
//     await chrome.scripting.executeScript(
//       {
//         target: {
//           tabId
//         },
//         world: "MAIN", // MAIN in order to access the window object
//         func: injectMyWallet
//       }
//     )
//     console.log("✅ Background script: myWallet 注入完成")
//   } catch (error) {
//     console.error("❌ Background script: 注入失败", error)
//   }
// }

// // 监听来自 injected-helper 的消息
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("监听来自 injected-helper 的消息");
//   console.log('message:', message);
//   console.log('sender:', sender);
//   console.log('sendResponse:', sendResponse);
  
//   const walletStore = useWalletStore.getState()

//   // 处理连接请求
//   if (message.type === constant.WALLET_CONNECT) {
//     if (walletStore.isConnected && walletStore.currentAccount) {
//       sendResponse({
//         success: true,
//         data: {
//           address: walletStore.currentAccount.address,
//           chainId: walletStore.currentNetwork.chainId
//         }
//       })
//     } else {
//       walletStore.connect().then((account) => {
//         sendResponse({
//           success: true,
//           data: {
//             address: account.address,
//             chainId: walletStore.currentNetwork.chainId
//           }
//         })
//       }).catch((err) => {
//         console.log('connect方法出错了', err);
//         sendResponse({ success: false, error: err.message})
//       })
//     }
//   }

//   // 获取账户请求
//   if (message.type === constant.WALLET_GET_ACCOUNT) {
//     sendResponse({
//       data: walletStore.currentAccount
//       ? {
//         address: walletStore.currentAccount.address,
//         balance: 0,
//         chainId: walletStore.currentNetwork.chainId
//       }
//       : null
//     })
//     return true
//   }

//   // 签名请求
//   if (message.type === constant.WALLET_SIGN_MESSAGE) {
//     const { message: rawMessage } = message.data
//     if (!walletStore.currentAccount) {
//       sendResponse({ success: false, error: '未连接钱包'})
//       return true
//     }
//     const signed = walletStore.signMessage(rawMessage)
//     sendResponse({
//       success: true,
//       data: { signedMessage: signed}
//     })
//     return true
//   }
//   // 断开连接
//   if (message.type === constant.WALLET_DISCONNECT) {
//     walletStore.disconnect()
//     sendResponse({ success: true })
//     return true
//   }
// })