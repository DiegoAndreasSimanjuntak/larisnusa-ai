const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const state = {
  rows: [],
  exchangeRate: 16200,
  rateSource: "fallback",
  lastOutputText: "",
  visual: {
    colorName: "hangat",
    hex: "#d95f4b",
  },
};

const categoryPlaybook = {
  kuliner: {
    audience: "keluarga, pekerja kantor, dan pelanggan langganan WhatsApp",
    angle: "rasa fresh, praktis, dan bisa pre-order",
    tactic: "paket kantor dan promo bundling jam makan",
  },
  fashion: {
    audience: "pembeli muda, reseller kecil, dan komunitas lokal",
    angle: "tampilan rapi, bahan nyaman, dan stok terbatas",
    tactic: "lookbook singkat dan katalog ukuran",
  },
  kerajinan: {
    audience: "pencari hadiah, komunitas kreatif, dan pembeli custom",
    angle: "cerita handmade, detail bahan, dan personalisasi",
    tactic: "konten proses produksi dan paket hadiah",
  },
  pertanian: {
    audience: "rumah tangga, warung, dan pembeli langganan mingguan",
    angle: "panen segar, asal jelas, dan pengiriman pagi",
    tactic: "langganan mingguan dan paket panen",
  },
  jasa: {
    audience: "pelanggan sekitar, keluarga sibuk, dan pemilik usaha kecil",
    angle: "respons cepat, jadwal jelas, dan bukti layanan",
    tactic: "paket langganan dan testimoni pelanggan",
  },
};

const selectors = {
  aiStatus: document.querySelector("#aiStatus"),
  onlineStatus: document.querySelector("#onlineStatus"),
  productPhoto: document.querySelector("#productPhoto"),
  productPreview: document.querySelector("#productPreview"),
  visualInsight: document.querySelector("#visualInsight"),
  businessName: document.querySelector("#businessName"),
  businessType: document.querySelector("#businessType"),
  salesNotes: document.querySelector("#salesNotes"),
  aiGoal: document.querySelector("#aiGoal"),
  apiEndpoint: document.querySelector("#apiEndpoint"),
  revenueMetric: document.querySelector("#revenueMetric"),
  revenueNote: document.querySelector("#revenueNote"),
  topProductMetric: document.querySelector("#topProductMetric"),
  priorityMetric: document.querySelector("#priorityMetric"),
  priorityNote: document.querySelector("#priorityNote"),
  usdMetric: document.querySelector("#usdMetric"),
  rateNote: document.querySelector("#rateNote"),
  aiOutput: document.querySelector("#aiOutput"),
  campaignCards: document.querySelector("#campaignCards"),
  campaignTone: document.querySelector("#campaignTone"),
  financeRows: document.querySelector("#financeRows"),
  exportCopy: document.querySelector("#exportCopy"),
  copyButton: document.querySelector("#copyButton"),
  chatBox: document.querySelector("#chatBox"),
  chatForm: document.querySelector("#chatForm"),
  customerQuestion: document.querySelector("#customerQuestion"),
};

const sectionLinks = [...document.querySelectorAll("[data-section-link]")];
let lockActiveSectionUntil = 0;
let activeSectionFrame = 0;

function setActiveSection(id) {
  sectionLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.sectionLink === id);
  });
}

function updateActiveSectionFromScroll() {
  if (Date.now() < lockActiveSectionUntil) return;

  const sections = sectionLinks
    .map((link) => document.getElementById(link.dataset.sectionLink))
    .filter(Boolean);
  const anchorLine = Math.min(window.innerHeight * 0.38, 240);
  const current =
    [...sections]
      .reverse()
      .find((section) => section.getBoundingClientRect().top <= anchorLine) || sections[0];

  if (current) setActiveSection(current.id);
}

function requestActiveSectionUpdate() {
  if (activeSectionFrame) return;
  activeSectionFrame = requestAnimationFrame(() => {
    activeSectionFrame = 0;
    updateActiveSectionFromScroll();
  });
}

function toTitleCase(value) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanProductName(value) {
  return value
    .replace(/\b(hari ini|terjual|jual|sebanyak|dan|dengan|harga|rp|idr)\b/gi, "")
    .replace(/[.,]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function parseTransactions(text) {
  const normalized = text.toLowerCase().replace(/rp\s*/g, "");
  const pattern = /(\d+)\s+([a-zA-Z0-9\s]+?)\s+harga\s+(\d{3,9})/g;
  const rows = [];
  let match = pattern.exec(normalized);

  while (match) {
    const qty = Number(match[1]);
    const name = cleanProductName(match[2]);
    const price = Number(match[3]);

    if (qty > 0 && name && price > 0) {
      rows.push({
        name: toTitleCase(name),
        qty,
        price,
        subtotal: qty * price,
      });
    }

    match = pattern.exec(normalized);
  }

  return rows;
}

function getTotal(rows = state.rows) {
  return rows.reduce((sum, row) => sum + row.subtotal, 0);
}

function getTopProduct(rows = state.rows) {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => b.subtotal - a.subtotal)[0];
}

function getPriority(text) {
  const lower = text.toLowerCase();

  if (/(habis|tinggal|menipis|stok.*kurang|sold out)/.test(lower)) {
    return {
      label: "Amankan stok",
      note: "Ada sinyal stok menipis saat permintaan masih aktif.",
      risk: "tinggi",
    };
  }

  if (/(promo|banyak tanya|ramai|permintaan|pre.?order|whatsapp)/.test(lower)) {
    return {
      label: "Dorong order",
      note: "Pelanggan sedang aktif bertanya. Siapkan broadcast dan template jawaban.",
      risk: "sedang",
    };
  }

  return {
    label: "Validasi data",
    note: "Tambahkan catatan stok dan pertanyaan pelanggan agar rekomendasi makin tajam.",
    risk: "rendah",
  };
}

function updateMetrics() {
  state.rows = parseTransactions(selectors.salesNotes.value);
  const total = getTotal();
  const topProduct = getTopProduct();
  const priority = getPriority(selectors.salesNotes.value);

  selectors.revenueMetric.textContent = rupiah.format(total);
  selectors.revenueNote.textContent = state.rows.length
    ? `${state.rows.length} baris transaksi terbaca dari bahasa natural.`
    : "Format contoh: 10 risol harga 5000.";
  selectors.topProductMetric.textContent = topProduct ? topProduct.name : "Belum ada";
  selectors.priorityMetric.textContent = priority.label;
  selectors.priorityNote.textContent = priority.note;
  selectors.usdMetric.textContent = usd.format(total / state.exchangeRate);
  selectors.rateNote.textContent =
    state.rateSource === "live"
      ? `Kurs live sekitar ${rupiah.format(state.exchangeRate)} per USD.`
      : `Fallback kurs ${rupiah.format(state.exchangeRate)} per USD.`;

  renderFinance();
  renderCampaign();
  renderExport();
}

function renderFinance() {
  if (!state.rows.length) {
    selectors.financeRows.innerHTML = `<tr><td colspan="4">Belum ada transaksi yang terdeteksi.</td></tr>`;
    return;
  }

  selectors.financeRows.innerHTML = state.rows
    .map(
      (row) => `
        <tr>
          <td>${row.name}</td>
          <td>${row.qty}</td>
          <td>${rupiah.format(row.price)}</td>
          <td>${rupiah.format(row.subtotal)}</td>
        </tr>
      `,
    )
    .join("");
}

function getBusinessContext() {
  const business = selectors.businessName.value.trim() || "Usaha lokal";
  const type = selectors.businessType.value;
  const playbook = categoryPlaybook[type];
  const topProduct = getTopProduct();
  const product = topProduct?.name || "produk unggulan";
  const total = getTotal();
  const priority = getPriority(selectors.salesNotes.value);

  return { business, type, playbook, topProduct, product, total, priority };
}

function renderCampaign() {
  const { business, playbook, product, priority } = getBusinessContext();
  const colorTone = state.visual.colorName;

  selectors.campaignTone.textContent = priority.risk === "tinggi" ? "Pre-order" : "Hangat";
  selectors.campaignCards.innerHTML = [
    {
      title: "Instagram",
      body: `${business} lagi siapkan ${product} dengan nuansa visual ${colorTone}. Cocok untuk ${playbook.audience}. Pesan hari ini lewat WhatsApp, produksi dibuat bertahap supaya tetap fresh.`,
    },
    {
      title: "WhatsApp Broadcast",
      body: `Halo Kak, ${product} sedang jadi favorit hari ini. Kami buka ${priority.risk === "tinggi" ? "pre-order terbatas" : "paket bundling hemat"} untuk pemesanan cepat. Balas pesan ini dengan jumlah pesanan dan jam ambil/kirim ya.`,
    },
    {
      title: "Marketplace",
      body: `${product} dari ${business}. ${playbook.angle}. Siap dipesan untuk kebutuhan harian, hadiah, atau konsumsi kantor. Chat untuk cek stok dan pengiriman.`,
    },
  ]
    .map((item) => `<section class="campaign-card"><h3>${item.title}</h3><p>${item.body}</p></section>`)
    .join("");
}

function renderExport() {
  const { business, product, playbook, topProduct, total } = getBusinessContext();
  const price = topProduct ? topProduct.price : total || 25000;

  selectors.exportCopy.innerHTML = `
    <p><strong>Indonesia:</strong> ${product} dari ${business} adalah produk lokal Indonesia dengan nilai utama: ${playbook.angle}. Cocok untuk pembeli yang mencari produk praktis, autentik, dan mudah dipesan.</p>
    <p><strong>English:</strong> ${product} by ${business} is an Indonesian local product focused on ${playbook.angle}. It is suitable for customers looking for something practical, authentic, and easy to order.</p>
    <p><strong>Estimasi harga global:</strong> ${rupiah.format(price)} per item atau sekitar ${usd.format(price / state.exchangeRate)}.</p>
  `;
}

function buildLocalPlan() {
  updateMetrics();
  const { business, playbook, product, total, priority } = getBusinessContext();
  const rows = state.rows;
  const goal = selectors.aiGoal.value.trim();

  const blocks = [
    {
      title: "Strategi 24 Jam",
      list: [
        `Pakai ${product} sebagai produk pembuka karena paling mudah dijelaskan ke ${playbook.audience}.`,
        `Angkat sudut ${playbook.angle}, lalu tutup dengan CTA WhatsApp yang jelas.`,
        priority.risk === "tinggi"
          ? "Gunakan pre-order terbatas agar permintaan tetap masuk tanpa menjanjikan stok berlebihan."
          : `Tes ${playbook.tactic} selama satu hari dan catat pertanyaan pelanggan yang berulang.`,
      ],
    },
    {
      title: "Ringkasan Kas",
      body: rows.length
        ? `Terdeteksi ${rows.length} produk dengan omzet ${rupiah.format(total)}. Produk prioritas: ${product}. Nilai ekspor estimasi: ${usd.format(total / state.exchangeRate)}.`
        : "Belum ada transaksi terstruktur. Gunakan pola: 12 nama produk harga 5000.",
    },
    {
      title: "Caption Siap Unggah",
      body: `${business} buka pesanan ${product} hari ini. Dibuat untuk kamu yang butuh pilihan praktis, enak, dan gampang dipesan. Stok kami kelola bertahap, jadi chat WhatsApp sekarang untuk amankan pesanan.`,
    },
    {
      title: "Template Balasan Pelanggan",
      body: `Halo Kak, terima kasih sudah menghubungi ${business}. Untuk ${product}, Kakak bisa pesan dengan format: nama produk, jumlah, dan jam ambil/kirim. Nanti kami bantu cek stok dan totalnya.`,
    },
    {
      title: "Instruksi yang Dipahami AI",
      body: goal || "AI membuat rekomendasi dari kategori usaha, catatan transaksi, visual produk, dan sinyal stok.",
    },
  ];

  renderPlan(blocks);
}

function renderPlan(blocks) {
  selectors.aiOutput.innerHTML = blocks
    .map((block) => {
      if (block.list) {
        return `<section class="result-card"><h3>${block.title}</h3><ul>${block.list.map((item) => `<li>${item}</li>`).join("")}</ul></section>`;
      }

      return `<section class="result-card"><h3>${block.title}</h3><p>${block.body}</p></section>`;
    })
    .join("");

  state.lastOutputText = blocks
    .map((block) => {
      const content = block.list ? block.list.map((item) => `- ${item}`).join("\n") : block.body;
      return `${block.title}\n${content}`;
    })
    .join("\n\n");
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-999px";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    throw new Error("Browser menolak akses salin.");
  }
}

function showCopyStatus(status) {
  const success = status === "success";
  selectors.copyButton.classList.toggle("is-copied", success);
  selectors.copyButton.title = success ? "Berhasil disalin" : "Gagal menyalin";
  selectors.copyButton.setAttribute("aria-label", selectors.copyButton.title);

  window.setTimeout(() => {
    selectors.copyButton.classList.remove("is-copied");
    selectors.copyButton.title = "Salin hasil";
    selectors.copyButton.setAttribute("aria-label", "Salin hasil");
  }, 1600);
}

async function requestRemoteAi() {
  const endpoint = selectors.apiEndpoint.value.trim();
  if (!endpoint) {
    buildLocalPlan();
    return;
  }

  selectors.aiStatus.textContent = "Menghubungi AI API";

  try {
    const { business, type, product, total, priority } = getBusinessContext();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business,
        category: type,
        product,
        totalRevenue: total,
        priority: priority.label,
        visual: state.visual,
        notes: selectors.salesNotes.value,
        goal: selectors.aiGoal.value,
      }),
    });

    if (!response.ok) throw new Error("Endpoint AI tidak merespons dengan sukses.");
    const data = await response.json();
    const text = data.output || data.text || data.message || JSON.stringify(data, null, 2);
    renderPlan([{ title: "Hasil dari AI API", body: text }]);
    selectors.aiStatus.textContent = "AI API aktif";
  } catch (error) {
    selectors.aiStatus.textContent = "Local copilot aktif";
    renderPlan([
      {
        title: "AI API belum tersedia",
        body: `${error.message} Aplikasi otomatis memakai local copilot agar demo tetap berjalan.`,
      },
    ]);
    buildLocalPlan();
  }
}

function addChatBubble(message, type) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${type}`;
  bubble.textContent = message;
  selectors.chatBox.appendChild(bubble);
  selectors.chatBox.scrollTop = selectors.chatBox.scrollHeight;
}

function answerCustomer(question) {
  updateMetrics();
  const { business, product, topProduct, priority } = getBusinessContext();
  const lower = question.toLowerCase();
  let answer = `Halo Kak, ${business} siap bantu. ${product} bisa dipesan lewat WhatsApp dengan menulis jumlah dan waktu ambil/kirim.`;

  if (/promo|diskon|hemat|bundling/.test(lower)) {
    answer = priority.risk === "tinggi"
      ? `Untuk ${product}, kami buka pre-order terbatas karena stok sedang kami amankan. Kakak bisa pesan jumlahnya dulu supaya masuk antrean produksi.`
      : `Ada paket hemat untuk ${product}. Kakak bisa ambil paket coba dulu, nanti kami bantu hitungkan total sesuai jumlah pesanan.`;
  } else if (/harga|berapa/.test(lower) && topProduct) {
    answer = `${product} harganya ${rupiah.format(topProduct.price)} per item. Kalau pesan banyak, kami bisa bantu susun paket yang lebih hemat.`;
  } else if (/stok|ready|tersedia/.test(lower)) {
    answer = `Stok ${product} kami cek berdasarkan antrean hari ini. Kakak bisa tulis jumlah pesanan supaya kami amankan slotnya.`;
  } else if (/kirim|ongkir|antar/.test(lower)) {
    answer = `Bisa bantu pengiriman sekitar area usaha. Kirim lokasi Kakak dulu ya, nanti kami cek estimasi ongkir dan jam kirim.`;
  }

  addChatBubble(question, "user");
  addChatBubble(answer, "bot");
}

function downloadCsv() {
  updateMetrics();
  const rows = [["Produk", "Qty", "Harga", "Subtotal"], ...state.rows.map((row) => [row.name, row.qty, row.price, row.subtotal])];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "larisnusa-catatan-kas.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function colorDistance(color, target) {
  return Math.sqrt((color.r - target.r) ** 2 + (color.g - target.g) ** 2 + (color.b - target.b) ** 2);
}

function nameColor({ r, g, b }) {
  const palette = [
    { name: "segar hijau", r: 42, g: 126, b: 85 },
    { name: "hangat keemasan", r: 226, g: 170, b: 59 },
    { name: "berani koral", r: 217, g: 95, b: 75 },
    { name: "tenang biru", r: 39, g: 107, b: 159 },
    { name: "premium gelap", r: 44, g: 38, b: 52 },
  ];
  return palette.sort((a, b) => colorDistance({ r, g, b }, a) - colorDistance({ r, g, b }, b))[0].name;
}

function analyzeImage(file) {
  const reader = new FileReader();

  reader.onload = () => {
    selectors.productPreview.src = reader.result;
    selectors.productPreview.parentElement.classList.add("has-image");

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = 24;
      canvas.height = 24;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) continue;
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count += 1;
      }

      const avg = {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
      };

      state.visual = {
        colorName: nameColor(avg),
        hex: `#${[avg.r, avg.g, avg.b].map((value) => value.toString(16).padStart(2, "0")).join("")}`,
      };

      selectors.visualInsight.textContent = `Visual produk terbaca bernuansa ${state.visual.colorName}. Copy promosi akan dibuat lebih selaras dengan foto.`;
      renderCampaign();
      buildLocalPlan();
    };
    image.src = reader.result;
  };

  reader.readAsDataURL(file);
}

async function fetchExchangeRate() {
  if (!navigator.onLine) {
    selectors.onlineStatus.textContent = "Offline. Aplikasi tetap berjalan dengan kurs fallback.";
    updateMetrics();
    return;
  }

  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=IDR");
    if (!response.ok) throw new Error("Kurs tidak tersedia.");
    const data = await response.json();
    state.exchangeRate = Math.round(data.rates.IDR);
    state.rateSource = "live";
    selectors.onlineStatus.textContent = "Online. Kurs ekspor berhasil diperbarui.";
  } catch {
    selectors.onlineStatus.textContent = "Online, tetapi kurs live gagal. Memakai fallback.";
  }

  updateMetrics();
}

function startVoiceInput() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    selectors.aiGoal.value = "Browser belum mendukung input suara. Tetap buat rencana dari teks yang tersedia.";
    buildLocalPlan();
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "id-ID";
  recognition.onresult = (event) => {
    selectors.salesNotes.value += ` ${event.results[0][0].transcript}`;
    buildLocalPlan();
  };
  recognition.start();
}

document.querySelectorAll("[data-goal]").forEach((button) => {
  button.addEventListener("click", () => {
    selectors.aiGoal.value = button.dataset.goal;
    buildLocalPlan();
  });
});

sectionLinks.forEach((link) => {
  link.addEventListener("click", () => {
    lockActiveSectionUntil = Date.now() + 900;
    setActiveSection(link.dataset.sectionLink);
    window.setTimeout(updateActiveSectionFromScroll, 950);
  });
});

selectors.productPhoto.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) analyzeImage(file);
});

selectors.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = selectors.customerQuestion.value.trim();
  if (!question) return;
  answerCustomer(question);
  selectors.customerQuestion.value = "";
});

document.querySelector("#generateButton").addEventListener("click", requestRemoteAi);
document.querySelector("#downloadCsv").addEventListener("click", downloadCsv);
document.querySelector("#voiceButton").addEventListener("click", startVoiceInput);

selectors.copyButton.addEventListener("click", async () => {
  if (!state.lastOutputText) buildLocalPlan();

  try {
    await copyText(state.lastOutputText);
    showCopyStatus("success");
  } catch {
    showCopyStatus("error");
  }
});

["input", "change"].forEach((eventName) => {
  selectors.salesNotes.addEventListener(eventName, updateMetrics);
  selectors.businessType.addEventListener(eventName, () => {
    updateMetrics();
    buildLocalPlan();
  });
  selectors.businessName.addEventListener(eventName, updateMetrics);
});

window.addEventListener("online", fetchExchangeRate);
window.addEventListener("offline", () => {
  selectors.onlineStatus.textContent = "Offline. Aplikasi tetap bisa dipakai untuk demo lapangan.";
});
window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
window.addEventListener("resize", requestActiveSectionUpdate);

addChatBubble("Halo Kak, mau tanya harga, promo, stok, atau pengiriman? Saya bantu jawab cepat.", "bot");
fetchExchangeRate();
buildLocalPlan();
updateActiveSectionFromScroll();
