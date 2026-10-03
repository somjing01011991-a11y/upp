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
  config/api.js            ← API_SERVER (ค่าเริ่มต้น http://127.0.0.1:7001/api)
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

ค่า apiserver เก็บไว้ที่ `src/config/api.js` (ค่าเริ่มต้น `http://127.0.0.1:7001/api`) เปลี่ยนได้โดยคัดลอก `.env.example` เป็น `.env` แล้วใส่

```
VITE_API_SERVER=http://127.0.0.1:7001/api
```

- รายชื่อค่ายโหลดจาก `GET {VITE_API_SERVER}/member/gameprovider` ซึ่งคืน `{ msg: true, data: [ { provider, providerType, ... } ] }` แล้วจัดเข้าหมวดตาม `providerType` ตัวพิมพ์เล็ก (`SLOT` → `slot`, `AFB` → `afb`) ให้ตรงกับ `sources` ใน `theme.json`
- หมวดใน Sidebar แสดงเฉพาะประเภทที่อยู่ใน `GET {VITE_API_SERVER}/member/providertype` (`{ msg: true, data: ['SLOT', 'AFB', ...] }`) ประเภทที่ไม่อยู่ในลิสต์จะไม่แสดง
- ใส่ `VITE_API_SERVER=` (ค่าว่าง) เพื่อใช้ข้อมูลตัวอย่างแทน
- เซิร์ฟเวอร์ต้องเปิด CORS ให้ต้นทางของหน้าเว็บ (เช่น `http://localhost:5173`)
- คลิกการ์ดค่ายแล้วโหลดรายชื่อเกมจาก `GET {VITE_API_SERVER}/member/gamelistprovider/{provider}` แสดงเฉพาะเกม `status: ACTIVE` ใช้รูป `image.square` ถ้าค่ายไม่มีเกมหรือโหลดไม่สำเร็จจะแสดงปุ่มเข้าสู่ล็อบบี้แทน
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
