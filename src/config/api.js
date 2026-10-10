// ที่อยู่ API server — ตั้งทับได้ด้วย VITE_API_SERVER ใน .env (ใส่ค่าว่าง = ใช้ข้อมูลตัวอย่าง)
const fromEnv = import.meta.env.VITE_API_SERVER;

export const API_SERVER = (fromEnv ?? 'http://127.0.0.1:7001/api').replace(/\/+$/, '');
