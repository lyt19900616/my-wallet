import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  // 覆盖你的测试DApp域名，例如本地开发环境或目标网站
  matches: ["<all_urls>"], // 临时使用所有域名测试，后续可缩小范围
  world: "MAIN" // 关键：运行在主世界以访问 chrome.runtime
}

// 添加注入 bridge.js 的逻辑
const injectBridgeScript = () => {
  // 检查 chrome.runtime 是否可用
  if (typeof chrome === "undefined" || !chrome.runtime) {
    console.error("❌ chrome.runtime 不可用，无法注入 bridge.js")
    return
  }

  try {
    const script = document.createElement("script")
    // 生成 bridge.js 的资源URL（需确保 bridge.js 在 public 目录）
    script.src = chrome.runtime.getURL("bridge.js")
    // 加载成功后移除脚本标签（可选）
    script.onload = () => {
      console.log("✅ bridge.js 注入成功")
      script.remove()
    }
    // 加载失败处理
    script.onerror = () => {
      console.error("❌ bridge.js 加载失败，请检查路径和 web_accessible_resources 配置")
    }
    document.head.appendChild(script)
  } catch (err) {
    console.error("❌ 注入 bridge.js 时出错：", err)
  }
}

// 页面加载后执行注入
window.addEventListener("load", () => {
  console.log("📌 内容脚本已加载，准备注入 bridge.js...")
  injectBridgeScript()
})