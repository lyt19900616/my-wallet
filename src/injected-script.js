window.myWallet = {
  requestAccount: async () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'REQUEST_ACCOUNTS' }, (response) => {
        if (response && response.accounts) {
          resolve(response.accounts)
        } else {
          reject(response.error)
        }
      })
    })
  },
  signMessage: async (message) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'SIGN_MESSAGE', data: message }, (response) => {
        if (response && response.signedMessage) {
          resolve(response.signedMessage)
        } else {
          reject(response.error)
          
        }
      })
    })
  }
}

window.dispatchEvent(new Event('myWallet:initialized'))