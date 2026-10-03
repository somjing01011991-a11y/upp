import { useState } from 'react';
import { BankList, Channel } from '../data/register.js';
import { checkPhone, register } from '../lib/api.js';
import BankIcon from './BankIcon.jsx';

const PHONE_RE = /^0\d{9}$/;
const EMPTY = { firstName: '', lastName: '', accountNo: '', bankCode: '', channel: '' };

function validate(f) {
  const e = {};
  if (!f.firstName.trim()) e.firstName = 'กรุณากรอกชื่อ';
  if (!f.lastName.trim()) e.lastName = 'กรุณากรอกนามสกุล';
  if (!f.bankCode) e.bankCode = 'กรุณาเลือกธนาคาร';
  if (!/^\d{10,15}$/.test(f.accountNo)) e.accountNo = 'เลขบัญชีต้องเป็นตัวเลข 10–15 หลัก';
  if (!f.channel) e.channel = 'กรุณาเลือกช่องทางที่รู้จัก';
  return e;
}

/**
 * สมัครสมาชิก 2 ขั้น
 * 1. กรอกเบอร์โทร → checkPhone(): false = แสดงว่าเบอร์ถูกใช้งานแล้ว, true = ไปขั้นถัดไป
 * 2. ชื่อ, นามสกุล, เลขบัญชี, ธนาคาร, ช่องทางที่รู้จัก
 */
export default function RegisterForm({ onDone }) {
  const [step, setStep] = useState('phone'); // phone | details | done
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
    const v = k === 'accountNo' ? ev.target.value.replace(/\D/g, '') : ev.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submitDetails = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await register({ phone, ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() });
      setStep('done');
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="ta-section ta-reg">
        <h2 className="ta-reg-title">สมัครสมาชิกสำเร็จ</h2>
        <p className="ta-reg-hint">ยินดีต้อนรับ คุณ{form.firstName}</p>
      </div>
    );
  }

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
            {busy ? 'กำลังตรวจสอบ…' : 'ถัดไป'}
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
              <input className="ta-input" autoComplete="given-name" value={form.firstName} onChange={set('firstName')} aria-invalid={!!errors.firstName} />
              {errors.firstName && <span className="ta-field-error">{errors.firstName}</span>}
            </label>
            <label className="ta-field">
              <span className="ta-field-label">นามสกุล</span>
              <input className="ta-input" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} aria-invalid={!!errors.lastName} />
              {errors.lastName && <span className="ta-field-error">{errors.lastName}</span>}
            </label>
          </div>

          <fieldset className="ta-field">
            <legend className="ta-field-label">ธนาคาร</legend>
            <div className="ta-banks">
              {BankList.map((b) => (
                <label key={b.BankCode} className={`ta-bank${form.bankCode === b.BankCode ? ' is-on' : ''}`} title={b.BankName}>
                  <input type="radio" name="bank" value={b.BankCode} checked={form.bankCode === b.BankCode} onChange={set('bankCode')} />
                  <BankIcon code={b.BankCode} size={36} />
                  <span className="ta-bank-name">{b.BankName}</span>
                </label>
              ))}
            </div>
            {errors.bankCode && <span className="ta-field-error">{errors.bankCode}</span>}
          </fieldset>

          <label className="ta-field">
            <span className="ta-field-label">เลขบัญชี</span>
            <input className="ta-input" inputMode="numeric" maxLength={15} placeholder="ตัวเลขเท่านั้น" value={form.accountNo} onChange={set('accountNo')} aria-invalid={!!errors.accountNo} />
            {errors.accountNo && <span className="ta-field-error">{errors.accountNo}</span>}
          </label>

          <fieldset className="ta-field">
            <legend className="ta-field-label">รู้จักเราผ่านช่องทาง</legend>
            <div className="ta-chips">
              {Channel.map((c) => (
                <label key={c.va} className={`ta-chip${form.channel === c.va ? ' is-on' : ''}`}>
                  <input type="radio" name="channel" value={c.va} checked={form.channel === c.va} onChange={set('channel')} />
                  {c.Channel}
                </label>
              ))}
            </div>
            {errors.channel && <span className="ta-field-error">{errors.channel}</span>}
          </fieldset>

          <button className="ta-btn ta-btn--primary ta-reg-submit" type="submit" disabled={busy}>
            {busy ? 'กำลังสมัคร…' : 'สมัครสมาชิก'}
          </button>
        </form>
      )}
    </div>
  );
}
