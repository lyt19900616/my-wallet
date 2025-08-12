import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/*"]
}
console.log('palsmo content script loaded');

const injectWallectProvider = () => {
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.textContent = `
    window.myWallet = {
      // 请求账户 
      requestAccounts: async () => {
        return new Promise((resolve) => {
          // 向background 发送消息
          chrome.runtime.sendMessage(
            { type: 'REQUEST_ACCOUNTS' }, 
            (response) => resolve(response.accounts)
          )
        })
      },
      // 签名交易
      signTransaction: async (tx) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'SIGN_TRANSACTION', data: tx },
            (response) => resolve(response.signedTx)
          )
        })
      }
    }
    // 触发DApp监听的事件
    const event = new Event('walletconnect')
    window.dispatchEvent(event)
  `
  document.head.appendChild(script)
}

window.addEventListener('load', () => {
  console.log('wallet content script loaded');
  injectWallectProvider()
})


