const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getHardwareStatus: () => ipcRenderer.invoke("get-hardware-status"),
  printReceipt: (receiptData) => ipcRenderer.invoke("print-receipt", receiptData),
  onHardwareEvent: (callback) => {
    const subscription = (event, data) => callback(data);
    ipcRenderer.on("hardware-event", subscription);
    return () => ipcRenderer.removeListener("hardware-event", subscription);
  },
});
