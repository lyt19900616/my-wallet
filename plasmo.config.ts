export default {
  manifest: {
    manifest_version: 3,
    name: "My Wallet",
    version: "0.0.1",
    permissions: ["tabs"],
    host_permissions: ["https://*/*"],
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["contents/content.js"],
        run_at: "document_start"
      }
    ],
    web_accessible_resources: [
      {
        resources: ["inpage.js"],
        matches: ["<all_urls>"]
      }
    ],
    background: {
      service_worker: "background.js"
    }
  }
}
