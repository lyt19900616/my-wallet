console.log('background.ts loaded');

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'REQUEST_ACCOUNTS':
      console.log("DApp请求授权");
      // 进行授权操作
      sendResponse({ message: '授权成功' });
      break;

    case 'SING_TRANSACTION': 
      // 进行签名操作
      const signedTx = `signed_${JSON.stringify(request.data)}`
      sendResponse({ signedTx });
    default:
      sendResponse({ message: '未知消息类型' });
      break;
  }
  return true; // 返回 true 表示异步处理
})