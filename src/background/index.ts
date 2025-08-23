import injectMyWallet from './injected-helper';
import { useWalletStore } from '../stores/walletStore'
import * as constant from './constant'

console.log('background');


// 给chrom 注入wallet的时机 
// 1.标签页加载完成时
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("chrome.tabs.onUpdated", tabId, changeInfo, tab);
  
  // 只在页面完成加载时注入
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    console.log("🔄 页面加载完成，开始注入 myWallet:", tab.url)
    inject(tabId)
  }
})

// 2.在标签页激活时也注入（备用机制）
chrome.tabs.onActivated.addListener((e) => {
  console.log("chrome.tabs.onActivated", e);
  chrome.tabs.get(e.tabId, (tab) => {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      console.log("🔄 标签页激活，注入 myWallet:", tab.url)
      inject(e.tabId)
    }
  })
})

const inject = async (tabId: number) => {
  try {
    // 执行注入
    await chrome.scripting.executeScript(
      {
        target: {
          tabId
        },
        world: "MAIN", // MAIN in order to access the window object
        func: injectMyWallet
      }
    )
    console.log("✅ Background script: myWallet 注入完成")
  } catch (error) {
    console.error("❌ Background script: 注入失败", error)
  }
}

// 监听来自 injected-helper 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("监听来自 injected-helper 的消息");
  console.log('message:', message);
  console.log('sender:', sender);
  console.log('sendResponse:', sendResponse);
  
  const walletStore = useWalletStore.getState()

  // 处理连接请求
  if (message.type === constant.WALLET_CONNECT) {
    if (walletStore.isConnected && walletStore.currentAccount) {
      sendResponse({
        success: true,
        data: {
          address: walletStore.currentAccount.address,
          chainId: walletStore.currentNetwork.chainId
        }
      })
    } else {
      walletStore.connect().then((account) => {
        sendResponse({
          success: true,
          data: {
            address: account.address,
            chainId: walletStore.currentNetwork.chainId
          }
        })
      }).catch((err) => {
        console.log('connect方法出错了', err);
        sendResponse({ success: false, error: err.message})
      })
    }
  }

  // 获取账户请求
  if (message.type === constant.WALLET_GET_ACCOUNT) {
    sendResponse({
      data: walletStore.currentAccount
      ? {
        address: walletStore.currentAccount.address,
        balance: 0,
        chainId: walletStore.currentNetwork.chainId
      }
      : null
    })
    return true
  }

  // 签名请求
  if (message.type === constant.WALLET_SIGN_MESSAGE) {
    const { message: rawMessage } = message.data
    if (!walletStore.currentAccount) {
      sendResponse({ success: false, error: '未连接钱包'})
      return true
    }
    const signed = walletStore.signMessage(rawMessage)
    sendResponse({
      success: true,
      data: { signedMessage: signed}
    })
    return true
  }
  // 断开连接
  if (message.type === constant.WALLET_DISCONNECT) {
    walletStore.disconnect()
    sendResponse({ success: true })
    return true
  }
})