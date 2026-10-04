import { useState } from 'react';
import { BankList, Channel } from '../data/register.js';
import { checkPhone, register } from '../lib/api.js';
import BankSelect from './BankSelect.jsx';
import Spinner from './Spinner.jsx';

const PHONE_RE = /^0\d{9}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 20;
const EMPTY = { Fname: '', Lname: '', AccNumber: '', BankCode: '', Channel: '', LineId: '', Password: '', confirmPassword: '' };

function validate(f) {
  const e = {};
  if (!f.Fname.trim()) e.Fname = 'กรุณากรอกชื่อ';
  if (!f.Lname.trim()) e.Lname = 'กรุณากรอกนามสกุล';
  if (!f.BankCode) e.BankCode = 'กรุณาเลือกธนาคาร';
  if (!/^\d{10,16}$/.test(f.AccNumber)) e.AccNumber = 'เลขบัญชีต้องเป็นตัวเลข 10–16 หลัก';
  if (!f.Channel) e.Channel = 'กรุณาเลือกช่องทางที่รู้จัก';
  if (!f.Password) e.Password = 'กรุณากรอกรหัสผ่าน';
  else if (f.Password.length < PASSWORD_MIN || f.Password.length > PASSWORD_MAX)
    e.Password = `รหัสผ่านต้องมี ${PASSWORD_MIN}–${PASSWORD_MAX} ตัวอักษร`;
  if (!f.confirmPassword) e.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
  else if (f.confirmPassword !== f.Password) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
  return e;
}

/**
 * สมัครสมาชิก 2 ขั้น
 * 1. กรอกเบอร์โทร 10 หลัก → checkPhone() (POST /member/checkphonenumber): verify false = เบอร์ซ้ำ, true = ไปขั้นถัดไป
 * 2. ชื่อ, นามสกุล, ธนาคาร, เลขบัญชี (10–16 หลัก), ช่องทางที่รู้จัก, LINE ID (ไม่บังคับ),
 *    รหัสผ่าน + ยืนยันรหัสผ่าน (ตรงกัน, 6–20 ตัว) → register() (POST /member/register)
 * register: true → onRegistered(data) เข้าสู่ระบบทันที, register: false → แสดงข้อความสมัครไม่สำเร็จ
 */
export default function RegisterForm({ onRegistered }) {
  const [step, setStep] = useState('phone'); // phone | details
  const [submitError, setSubmitError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submitPhone = async (ev) => {
    ev.preventDefault();
    if (!PHONE_RE.test(phone)) {
      setPhoneError('กรุณากรอกเบอร์โทร 10 หลัก ขึ้นต้นด้วย 0');
      return;
    }
    setBusy(true);
    setPhoneError('');
    try {
      const ok = await checkPhone(phone);
      if (ok) setStep('details');
      else setPhoneError('เบอร์นี้ถูกใช้งานแล้ว');
    } catch {
      setPhoneError('ตรวจสอบเบอร์ไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (ev) => {
    const v = k === 'AccNumber' ? ev.target.value.replace(/\D/g, '') : ev.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
    setSubmitError('');
  };

  const submitDetails = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setSubmitError('');
    try {
      const res = await register({
        PhoneNumber: phone,
        Fname: form.Fname.trim(),
        Lname: form.Lname.trim(),
        Channel: form.Channel,
        Password: form.Password, // confirmPassword is checked here only, not sent
        LineId: form.LineId.trim(),
        BankCode: form.BankCode,
        AccNumber: form.AccNumber,
      });
      if (res.register === true && res.data) {
        onRegistered?.(res.data);
        return;
      }
      setSubmitError(typeof res.msg === 'string' && res.msg ? res.msg : 'สมัครสมาชิกไม่สำเร็จ');
    } catch {
      setSubmitError('สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ta-section ta-reg">
      <h2 className="ta-reg-title">สมัครสมาชิก</h2>
      <ol className="ta-reg-steps" aria-label="ขั้นตอน">
        <li className={step === 'phone' ? 'is-on' : 'is-done'}>1. เบอร์โทร</li>
        <li className={step === 'details' ? 'is-on' : ''}>2. ข้อมูลบัญชี</li>
      </ol>

      {step === 'phone' ? (
        <form onSubmit={submitPhone} noValidate>
          <label className="ta-field">
            <span className="ta-field-label">เบอร์โทรศัพท์</span>
            <input
              className="ta-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="0XXXXXXXXX"
              value={phone}
              aria-invalid={!!phoneError}
              onChange={(ev) => {
                setPhone(ev.target.value.replace(/\D/g, ''));
                setPhoneError('');
              }}
            />
            {phoneError && <span className="ta-field-error" role="alert">{phoneError}</span>}
          </label>
          <button className="ta-btn ta-btn--primary ta-reg-submit" type="submit" disabled={busy}>
            {busy ? <><Spinner size={18} /> กำลังตรวจสอบ…</> : 'ถัดไป'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitDetails} noValidate>
          <div className="ta-reg-phone">
            <span>เบอร์โทร <b>{phone}</b></span>
            <button type="button" className="ta-link" onClick={() => setStep('phone')}>เปลี่ยน</button>
          </div>

          <div className="ta-reg-row">
            <label className="ta-field">
              <span className="ta-field-label">ชื่อ</span>
              <input className="ta-input" autoComplete="given-name" value={form.Fname} onChange={set('Fname')} aria-invalid={!!errors.Fname} />
              {errors.Fname && <span className="ta-field-error">{errors.Fname}</span>}
            </label>
            <label className="ta-field">
              <span className="ta-field-label">นามสกุล</span>
              <input className="ta-input" autoComplete="family-name" value={form.Lname} onChange={set('Lname')} aria-invalid={!!errors.Lname} />
              {errors.Lname && <span className="ta-field-error">{errors.Lname}</span>}
            </label>
          </div>

          <div className="ta-field">
            <span className="ta-field-label">ธนาคาร</span>
            <BankSelect
              banks={BankList}
              value={form.BankCode}
              invalid={!!errors.BankCode}
              onChange={(code) => set('BankCode')({ target: { value: code } })}
            />
            {errors.BankCode && <span className="ta-field-error">{errors.BankCode}</span>}
          </div>

          <label className="ta-field">
            <span className="ta-field-label">เลขบัญชี</span>
            <input className="ta-input" inputMode="numeric" maxLength={16} placeholder="ตัวเลข 10–16 หลัก" value={form.AccNumber} onChange={set('AccNumber')} aria-invalid={!!errors.AccNumber} />
            {errors.AccNumber && <span className="ta-field-error">{errors.AccNumber}</span>}
          </label>

          <fieldset className="ta-field">
            <legend className="ta-field-label">รู้จักเราผ่านช่องทาง</legend>
            <div className="ta-chips">
              {Channel.map((c) => (
                <label key={c.va} className={`ta-chip${form.Channel === c.va ? ' is-on' : ''}`}>
                  <input type="radio" name="channel" value={c.va} checked={form.Channel === c.va} onChange={set('Channel')} />
                  {c.Channel}
                </label>
              ))}
            </div>
            {errors.Channel && <span className="ta-field-error">{errors.Channel}</span>}
          </fieldset>

          <label className="ta-field">
            <span className="ta-field-label">LINE ID <span className="ta-field-opt">(ไม่บังคับ)</span></span>
            <input className="ta-input" autoComplete="off" maxLength={50} value={form.LineId} onChange={set('LineId')} />
          </label>

          <div className="ta-reg-row">
            <label className="ta-field">
              <span className="ta-field-label">รหัสผ่าน</span>
              <input className="ta-input" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} value={form.Password} onChange={set('Password')} aria-invalid={!!errors.Password} />
              {errors.Password && <span className="ta-field-error">{errors.Password}</span>}
            </label>
            <label className="ta-field">
              <span className="ta-field-label">ยืนยันรหัสผ่าน</span>
              <input className="ta-input" type="password" autoComplete="new-password" maxLength={PASSWORD_MAX} value={form.confirmPassword} onChange={set('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
              {errors.confirmPassword && <span className="ta-field-error">{errors.confirmPassword}</span>}
            </label>
          </div>
          <p className="ta-reg-hint ta-reg-note">รหัสผ่าน {PASSWORD_MIN}–{PASSWORD_MAX} ตัวอักษร</p>

          {submitError && <p className="ta-field-error ta-reg-error" role="alert">{submitError}</p>}

          <button className="ta-btn ta-btn--primary ta-reg-submit" type="submit" disabled={busy}>
            {busy ? <><Spinner size={18} /> กำลังสมัคร…</> : 'สมัครสมาชิก'}
          </button>
        </form>
      )}
    </div>
  );
}
