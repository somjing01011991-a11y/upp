# TEST APP

เว็บแอปล็อบบี้เกมโทนมืด (React 18 + Vite) แบ่ง 3 ส่วน: ส่วนบน · ส่วนกลาง (Sidebar หมวด + เนื้อหาค่ายละ 8 เกม) · เมนูบาร์ล่าง
CSS ทั้งหมดปรับได้จาก `src/config/theme.json`

## เริ่มใช้งาน

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # ไฟล์พร้อมขึ้นเซิร์ฟเวอร์อยู่ใน dist/
```

## โครงสร้าง

```
src/
  config/theme.json        ← ปรับสี มุม ฟอนต์ เลย์เอาต์ ข้อความ หมวด เมนู ที่นี่
  data/session.js          ← ข้อมูลเว็บ (logo, Name) และผู้ใช้
  data/sampleProviders.js  ← ข้อมูลค่ายตัวอย่าง (ใช้เมื่อไม่ได้ตั้ง API)
  lib/api.js               ← fetchProviders / fetchGames
  lib/providers.js         ← กรอง ACTIVE, ตัดค่ายซ้ำ, จัดค่ายตามหมวด
  theme/ThemeProvider.jsx  ← แปลง JSON → CSS variables (--c-*, --r-*, --l-*, --f-*)
  components/
    GameApp.jsx            ← ทั้งหน้า
    AppHeader.jsx          ← 1. ส่วนบน
    CategorySidebar.jsx    ← 2. Sidebar หมวดเกม
    ProviderSection.jsx    ← 2. ค่าย + 8 เกม (detailStatus:false = ปุ่มเข้าล็อบบี้)
    ProviderTile.jsx       ← 2. การ์ดค่าย (หมวดกีฬา หวย ฯลฯ)
    GameCard.jsx, TierBadge.jsx, Icon.jsx, Img.jsx
    BottomNav.jsx          ← 3. เมนูบาร์ล่าง
  styles/tokens.css        ← design tokens
  styles/app.css           ← สไตล์คอมโพเนนต์ (อ่านค่าจากตัวแปร --c-/--r-/--l-/--f-)
  App.jsx                  ← โหลดข้อมูล, จัดการเมนู, onPlay
```

## เชื่อม API จริง

คัดลอก `.env.example` เป็น `.env` แล้วใส่

```
VITE_PROVIDER_API=https://your-api/providers
VITE_GAMES_API=https://your-api/games?provider={provider}&type={type}
```

- `VITE_PROVIDER_API` ต้องคืน `{ code: 0, msg, data: { slot: [...], casino: [...], ... } }` ตามรูปแบบเดิม
- `VITE_GAMES_API` — ปรับการแปลงข้อมูลใน `fetchGames()` (`src/lib/api.js`) ให้ตรงกับ response จริง ผลลัพธ์ต้องเป็น `[{ gameCode, gameName, imageURL, tag }]` ถ้าไม่ได้ตั้งค่าไว้ จะแสดงการ์ดตัวอย่าง 8 ใบต่อค่าย
- การเปิดเกม: แก้ `handlePlay` ใน `src/App.jsx` (`game` เป็น `null` เมื่อเข้าล็อบบี้ของค่าย)

## ปรับธีมด้วย JSON

| คีย์ | ผล |
| --- | --- |
| `colors.*` | สีทั้งหมด → `--c-*` (เช่น `primaryDeep` → `--c-primary-deep`) |
| `radius.*` | มุมโค้ง → `--r-*` |
| `font.family`, `font.size` | ฟอนต์ (เปลี่ยนแล้วแก้ลิงก์ Google Fonts ใน `index.html` ด้วย) |
| `layout.*` | ความกว้าง/สูงของส่วนต่าง ๆ, `gameColumns`, `gameColumnsWide`, `gameRatio`, `gamesPerProvider` |
| `header.*` | แสดง/ซ่อนเครดิต กระเป๋าเงิน, สกุลเงิน |
| `texts.*` | ทุกคำบนปุ่ม |
| `categories[]` | หมวดใน Sidebar: `label`, `icon`, `cover` (URL รูปปก), `sources` (คีย์ใน `data` ของ API), `display` (`games` / `providers`) |
| `nav[]` | เมนูบาร์ล่าง (`primary: true` = ปุ่มกลมตรงกลาง) |
