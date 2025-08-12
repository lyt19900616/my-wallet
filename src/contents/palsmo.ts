import type { PlasmoCSConfig } from 'plasmo';

export const config: PlasmoCSConfig = {
  matches: ["https://*/*", "http://*/*", "http://localhost:*/*", "http://localhost:3000/"]
}
console.log('palsmo content script loaded');

const injectWallectProvider = () => {
  console.log('injecting wallet provider');
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('injected-script.js')
  console.log("src: ", script.src);
  // script.onload = () => {
  //   script.remove()
  // }
}

window.addEventListener('load', () => {
  console.log('wallet content script loaded');
  injectWallectProvider()
})


