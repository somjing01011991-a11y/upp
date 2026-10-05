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
  data/register.js         ← BankList, Channel ของฟอร์มสมัคร
  data/bankIcons.js        ← SVG โลโก้ธนาคาร + สีพื้น
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
    PromotionPage.jsx      ← หน้าโปรโมชั่น + modal รายละเอียด
    LoginModal.jsx         ← modal เข้าสู่ระบบ (มีลิงก์ไปสมัครสมาชิก)
    RegisterForm.jsx       ← ฟอร์มสมัครสมาชิก 2 ขั้น (เบอร์โทร → ข้อมูลบัญชี + รหัสผ่าน)
    BankIcon.jsx           ← โลโก้ธนาคาร
  styles/tokens.css        ← design tokens
  styles/app.css           ← สไตล์คอมโพเนนต์ (อ่านค่าจากตัวแปร --c-/--r-/--l-/--f-)
  App.jsx                  ← โหลดข้อมูล, จัดการเมนู, onPlay
```

## เชื่อม API จริง

ค่า apiserver เก็บไว้ที่ `src/config/api.js` (ค่าเริ่มต้น `http://127.0.0.1:7001/api`) เปลี่ยนได้โดยคัดลอก `.env.example` เป็น `.env` แล้วใส่

```
VITE_API_SERVER=http://127.0.0.1:7001/api
```

- ก่อนเปิดหน้า โหลด `GET {VITE_API_SERVER}/member/webconfig` แล้วใช้ `data[0].logo` เป็นโลโก้, `data[0].company` เป็นชื่อเว็บข้างโลโก้และไตเติลแท็บ และ `data[0].colors` ทับสีใน `theme.json` (ชื่อคีย์เดียวกัน) ถ้าโหลดไม่สำเร็จใช้ธีมและโลโก้เดิม
- รายชื่อค่ายโหลดจาก `GET {VITE_API_SERVER}/member/gameprovider` ซึ่งคืน `{ msg: true, data: [ { provider, providerType, ... } ] }` แล้วจัดเข้าหมวดตาม `providerType` ตัวพิมพ์เล็ก (`SLOT` → `slot`, `AFB` → `afb`) ให้ตรงกับ `sources` ใน `theme.json`
- หมวดใน Sidebar จัดตาม `GET {VITE_API_SERVER}/member/categories` (`{ msg: true, data: [{ providerType: 'AFB', category: 'sport' }, ...] }`)
  - providerType ที่ไม่อยู่ในลิสต์จะไม่แสดง
  - `category` ตรงกับ `key` ใน `theme.json` → เข้าหมวดนั้น
  - `category` เป็น `null` (หรือไม่รู้จัก) → ใช้หมวดใน `theme.json` ที่มี providerType นี้ใน `sources`
  - ไม่เจอทั้งสองแบบ → เข้าหมวด "เกมอื่นๆ" (`key: "other"`)
- เมนูโปรโมชั่นโหลดจาก `GET {VITE_API_SERVER}/member/promotion` แสดงรูป `media.coverImage` กับ `bonusName` คลิกแล้วเปิด modal แสดง `bonusDescription` (คงการขึ้นบรรทัดใหม่)
- เข้าสู่ระบบ: ปุ่ม "เข้าสู่ระบบ" มุมบน และเมนู "สมัครสมาชิก" (แทนโปรไฟล์ตอนยังไม่ล็อกอิน) เปิด modal กรอก PhoneNumber, Password → `POST {VITE_API_SERVER}/member/login` ถ้า `login: false` แสดง `msg` ถ้าสำเร็จเก็บ response ไว้ใน `sessionStorage` (`src/lib/session.js`) แล้วแสดง Username, Ranking, เครดิต, กระเป๋าเงิน, ค่าคอมมิชชั่น กดรูปโปรไฟล์เพื่อออกจากระบบ
- ยอดคงเหลือ: ระหว่างล็อกอินจะเรียก `POST {VITE_API_SERVER}/member/balance` (ตั้ง path ที่ `BALANCE_PATH` ใน `src/lib/api.js`) ทุก 10 วินาที ส่ง `{ Username, accesstoken }` จาก session แล้วอัปเดต `totalWallet`, `CraditGames`, `totalCommission` ถ้าได้ `{ msg: false, access: "denied" }` จะล้าง session แล้วเปิด modal เข้าสู่ระบบ
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

## URL ของแต่ละหน้า

ทุกหน้ามี path ของตัวเอง (`src/lib/route.js`) กดย้อนกลับ/ไปข้างหน้า, รีเฟรช หรือแชร์ลิงก์แล้วจะกลับมาหน้าเดิม

| path | หน้า |
|---|---|
| `/` | หน้าแรก (หมวดแรก) |
| `/category/{หมวด}` | หมวดเกม เช่น `/category/casino` |
| `/category/{หมวด}/{ค่าย}` | รายชื่อเกมของค่าย เช่น `/category/slot/PGS` |
| `/promotion` | โปรโมชั่น |
| `/wallet`, `/profile`, `/contact` | ฝากถอน, โปรไฟล์, ติดต่อ |
| `/register?ref=&pref=` | สมัครสมาชิก |

## ฟอร์มสมัครสมาชิก

เปิดจากลิงก์ "สมัครสมาชิก" ใน modal เข้าสู่ระบบ หรือเปิดตรงที่ `/register` ก็ได้

ลิงก์แนะนำเพื่อน: `/register?ref=xxx&pref=xxxx` จะเก็บ `ref`, `pref` ไว้ใน sessionStorage (`ta-ref`, ตัวที่ไม่มีเป็น `null`)
แล้วส่งไปพร้อมข้อมูลสมัคร ถ้าเปิดเว็บโดยไม่มี params จะใช้ค่าที่เก็บไว้เดิมในแท็บนั้น (ไม่มีเลยส่ง `null`)

ตอนขึ้นเซิร์ฟเวอร์จริง ต้องตั้งให้ทุก path ที่ไม่ใช่ไฟล์ส่ง `index.html` (SPA fallback) เช่น nginx `try_files $uri /index.html;`
ไม่งั้นเปิด `/register` ตรงๆ จะได้ 404 (`npm run dev` / `npm run preview` ทำให้อยู่แล้ว)

1. กรอกเบอร์โทร 10 หลัก → `POST /member/checkphonenumber` `{ PhoneNumber }` ได้ `{ verify }`: `false` = แสดง "เบอร์นี้ถูกใช้งานแล้ว", `true` = ไปขั้นถัดไป
2. กรอก ชื่อ, นามสกุล, ธนาคาร, เลขบัญชี (10–16 หลัก), ช่องทางที่รู้จัก, LINE ID (ไม่บังคับ), รหัสผ่าน และยืนยันรหัสผ่าน (ต้องตรงกัน 6–20 ตัวอักษร)
   → `POST /member/register` `{ PhoneNumber, Fname, Lname, Channel, Password, LineId, BankCode, AccNumber, ref, pref }`
3. ได้ `{ register: true, data }` → เก็บ `data` เป็น session เข้าสู่ระบบทันที (เหมือน login) แล้วกลับหน้าแรก;
   พร้อมเด้ง modal "สมัครสมาชิกสำเร็จ — ยินดีต้อนรับสู่ {company}"; `{ register: false }` → แสดง `msg` หรือ "สมัครสมาชิกไม่สำเร็จ"
