import type { PlasmoCSConfig } from "plasmo"
console.log('plasmo');

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"], // 覆盖所有测试域名
  world: "MAIN" // 强制主世界运行
}

const injectBridgeScript = () => {
  const runtime = chrome?.runtime
  
  if (!runtime) {
    console.error("❌ 无法访问 runtime API，可能是环境隔离或文件名错误导致");
    return;
  }

  try {
    const script = document.createElement("script");
    script.src = runtime.getURL("bridge.js"); // 使用正确的 runtime 引用
    script.onload = () => {
      console.log("✅ bridge.js 注入成功");
      script.remove();
    };
    script.onerror = () => {
      console.error("❌ bridge.js 加载失败，检查 public 目录是否存在该文件");
    };
    document.head.appendChild(script);
  } catch (err) {
    console.error("❌ 注入失败：", err);
  }
}

// 页面加载时执行（改用 DOMContentLoaded 提前注入）
document.addEventListener("DOMContentLoaded", () => {
  console.log("📌 内容脚本已加载，准备注入 bridge.js...");
  injectBridgeScript();
});