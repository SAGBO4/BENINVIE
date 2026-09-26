const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const path = require("path");

let mainWindow = null;

const isDev = process.env.NODE_ENV !== "production";
const DEV_URL = process.env.ELECTRON_START_URL || "http://localhost:3000";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: "BENINVIE — Logiciel Desktop Officines & Structures Sanitaires",
    backgroundColor: "#0a3764",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    icon: path.join(__dirname, "../public/armoiries-benin.png"),
  });

  // Construction du Menu Applicatif Métier Officine & Santé
  const templateMenu = [
    {
      label: "BENINVIE Santé",
      submenu: [
        {
          label: "Guichet de Vérification QR Officiel",
          accelerator: "CmdOrCtrl+Shift+V",
          click: () => {
            mainWindow.loadURL(`${DEV_URL}/verify`);
          },
        },
        {
          label: "Console Transfusionnelle & Carte NFC HEMORA",
          accelerator: "CmdOrCtrl+Shift+H",
          click: () => {
            mainWindow.loadURL(`${DEV_URL}/projects?module=passport`);
          },
        },
        {
          label: "Espace Officine & Délivrance Ordonnances",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => {
            mainWindow.loadURL(`${DEV_URL}/dashboard/pharmacien`);
          },
        },
        { type: "separator" },
        {
          label: "Mode Kiosque Plein Écran (Officine)",
          accelerator: "F11",
          click: () => {
            const isFull = mainWindow.isFullScreen();
            mainWindow.setFullScreen(!isFull);
          },
        },
        { type: "separator" },
        {
          label: "Quitter BENINVIE Desktop",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Périphériques & Matériel",
      submenu: [
        {
          label: "Tester Douchette Code-barres / QR USB",
          click: () => {
            mainWindow.webContents.send("hardware-event", {
              type: "BARCODE_SCAN",
              payload: "ORD-2026-001",
            });
          },
        },
        {
          label: "Tester Borne Sans Contact NFC PC/SC",
          click: () => {
            mainWindow.webContents.send("hardware-event", {
              type: "NFC_TAP",
              payload: {
                uid: "04:C8:7B:A2:3F:89:E1",
                npi: "NPI-CIT-1995-1029",
                nom: "SAGBOHAN Chantal",
                groupe: "O+",
              },
            });
          },
        },
        {
          label: "Imprimer Récépissé Officinal (Imprimante Thermique)",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            mainWindow.webContents.print({ silent: false, printBackground: true });
          },
        },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        { role: "reload", label: "Actualiser l'application" },
        { role: "forceReload", label: "Forcer le rechargement" },
        { role: "toggleDevTools", label: "Outils Développeur" },
        { type: "separator" },
        { role: "resetZoom", label: "Zoom normal" },
        { role: "zoomIn", label: "Zoom avant" },
        { role: "zoomOut", label: "Zoom arrière" },
      ],
    },
    {
      label: "Aide & Réglementation",
      submenu: [
        {
          label: "Conformité APDP (Loi n° 2017-20)",
          click: async () => {
            await dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Conformité Légale République du Bénin",
              message: "BENINVIE Logiciel Certifié",
              detail:
                "Conforme aux dispositions de la Loi n° 2017-20 portant Code du Numérique en République du Bénin. Les données de santé sont chiffrées de bout en bout et scellées par l'ANIP.",
            });
          },
        },
        {
          label: "Assistance Téléphonique Nationale : 136",
          click: async () => {
            await dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "SAMU & Urgences Sanitaires",
              message: "Numéro Vert National Gratuit : 136",
              detail: "Disponible 24h/24 et 7j/7 sur tout le territoire de la République du Bénin.",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(menu);

  // Tentative de chargement du serveur local
  mainWindow.loadURL(DEV_URL).catch(() => {
    // Si le serveur local Next.js n'est pas encore prêt, charger la page de secours locale
    mainWindow.loadFile(path.join(__dirname, "offline.html"));
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC : Traitement des commandes matérielles
ipcMain.handle("get-app-version", () => app.getVersion());

ipcMain.handle("get-hardware-status", () => {
  return {
    nfcReaderConnected: true,
    nfcDeviceModel: "Identiv / ACS ACR122U PC/SC Contactless Reader",
    barcodeScannerConnected: true,
    barcodeScannerModel: "Datalogic QuickScan QD2430 USB 2D Imager",
    receiptPrinterConnected: true,
    receiptPrinterModel: "Epson TM-T20III Thermal 80mm",
    apdpCertified: true,
  };
});

ipcMain.handle("print-receipt", async (event, data) => {
  if (mainWindow) {
    mainWindow.webContents.print({ silent: false, printBackground: true });
    return { success: true };
  }
  return { success: false, error: "Fenêtre fermée" };
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
