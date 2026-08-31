import qrcode from "qrcode-terminal";

// whatsapp-web.js is CommonJS and heavy (puppeteer) - require lazily so it
// only loads once, on the server, and never during a client bundle/build.
type WAClient = any;

interface WAGlobal {
  client: WAClient | null;
  status: "disconnected" | "qr" | "connected" | "initializing";
  qr: string | null;
  initialized: boolean;
}

const g = global as any;
if (!g.__whatsapp) {
  g.__whatsapp = {
    client: null,
    status: "disconnected",
    qr: null,
    initialized: false,
  } as WAGlobal;
}

const state: WAGlobal = g.__whatsapp;

export function getWhatsAppStatus() {
  return { status: state.status, qr: state.qr };
}

export function initWhatsApp() {
  if (state.initialized) return state.client;
  state.initialized = true;
  state.status = "initializing";

  const { Client, LocalAuth } = require("whatsapp-web.js");

  const fs = require("fs");
  const candidateChromePaths = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean) as string[];
  const executablePath = candidateChromePaths.find((p) => fs.existsSync(p));

  const client: WAClient = new Client({
    authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
    puppeteer: {
      headless: true,
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr: string) => {
    state.status = "qr";
    state.qr = qr;
    console.log("Scan this QR code with WhatsApp to connect:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    state.status = "connected";
    state.qr = null;
    console.log("WhatsApp client is ready.");
  });

  client.on("disconnected", () => {
    state.status = "disconnected";
    console.log("WhatsApp client disconnected.");
  });

  client.on("auth_failure", (msg: string) => {
    state.status = "disconnected";
    console.error("WhatsApp auth failure:", msg);
  });

  client.initialize().catch((err: any) => {
    console.error("Failed to initialize WhatsApp client:", err);
    state.status = "disconnected";
  });

  state.client = client;
  return client;
}

export function formatPhoneForWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@c.us`;
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  if (!state.client || state.status !== "connected") {
    throw new Error("WhatsApp client is not connected");
  }
  const chatId = formatPhoneForWhatsApp(phone);

  const registeredId = await state.client.getNumberId(chatId);
  if (!registeredId) {
    throw new Error(`Phone number ${phone} is not registered on WhatsApp`);
  }

  await state.client.sendMessage(registeredId._serialized, message);
}
