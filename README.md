# 🤖 Discord Event Reminder Bot

Bot Telegram untuk mengingatkan event-event Discord community seperti Quiz, Poker, Chess, dll.

## ✨ Fitur

- 📅 Reminder otomatis 5 menit sebelum event (jam 20:55 WIB)
- 🎯 Pilih event mana saja yang mau di-remind
- 👤 Data tersimpan per user
- 🧪 Mode test untuk coba reminder

## 📦 Instalasi

### 1. Clone/Copy project ini

### 2. Install dependencies
```bash
npm install
```

### 3. Buat Bot Telegram

1. Buka Telegram dan cari `@BotFather`
2. Kirim `/newbot`
3. Ikuti instruksi untuk memberi nama bot
4. Copy **token** yang diberikan

### 4. Setup Environment

Copy `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Edit file `.env` dan masukkan token bot:
```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 5. Jalankan Bot
```bash
npm start
```

Atau untuk development dengan auto-reload:
```bash
npm run dev
```

## 📱 Cara Pakai

1. Cari bot kamu di Telegram
2. Ketik `/start`
3. Ketik `/events` untuk memilih event
4. Klik tombol event yang mau di-remind
5. Selesai! Kamu akan dapat reminder jam 20:55 WIB

## 📋 Commands

| Command | Deskripsi |
|---------|-----------|
| `/start` | Mulai bot dan lihat welcome message |
| `/events` | Pilih event untuk reminder |
| `/mystatus` | Lihat event yang sudah di-subscribe |
| `/help` | Tampilkan bantuan |
| `/test` | Test reminder (untuk development) |

## 🎮 Event yang Tersedia

- 🧠 Quiz
- 🃏 Poker
- ♟️ Chess
- 🎬 Movie Night
- 🎮 Gaming Session
- 🎤 Karaoke

## ⚙️ Kustomisasi

### Tambah Event Baru

Edit file `src/config/events.js`:

```javascript
const EVENTS = {
    // ... event lainnya
    
    newEvent: {
        name: '🎯 New Event',
        emoji: '🎯',
        time: '21:00 WIB',
        description: 'Deskripsi event'
    }
};
```

### Ubah Waktu Reminder

Edit file `src/scheduler/scheduler.js`:

```javascript
// Cron format: minute hour day month weekday
// Contoh: 55 20 * * * = 20:55 setiap hari
cron.schedule('55 20 * * *', async () => {
    // ...
}, {
    timezone: 'Asia/Jakarta'
});
```

## 📁 Struktur Project

```
bot_reminder_seismic_event/
├── src/
│   ├── config/
│   │   └── events.js       # Daftar event
│   ├── database/
│   │   └── db.js           # Database (JSON file)
│   ├── handlers/
│   │   └── commands.js     # Command handlers
│   ├── scheduler/
│   │   └── scheduler.js    # Cron scheduler
│   └── index.js            # Entry point
├── data/
│   └── subscribers.json    # Data subscribers (auto-generated)
├── .env                    # Environment variables
├── .env.example            # Contoh .env
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deploy ke VPS/Server

1. Clone repository ke server
2. Install Node.js jika belum ada
3. Install PM2: `npm install -g pm2`
4. Jalankan dengan PM2:
```bash
pm2 start src/index.js --name "reminder-bot"
pm2 save
pm2 startup
```

## 📝 Catatan

- Bot harus running 24/7 agar reminder terkirim
- Data disimpan di file JSON lokal
- Timezone sudah di-set ke Asia/Jakarta (WIB)

## 🐛 Troubleshooting

**Bot tidak merespon:**
- Pastikan token sudah benar
- Cek koneksi internet
- Cek apakah ada error di console

**Reminder tidak terkirim:**
- Pastikan bot running
- Cek timezone server
- Pastikan sudah subscribe ke event

---

Made with ❤️ for Discord Community
