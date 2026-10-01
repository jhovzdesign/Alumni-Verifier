import React, { useState, useRef } from 'react';
import { api } from '../../services/api.js';
import { decodeQRCodeFromImage, extractVerificationToken } from '../../utils/qrDecoder.js';
import QRCodeLib from 'qrcode';
import {
  User,
  GraduationCap,
  CreditCard,
  QrCode,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AdminAddAlumniProps {
  onSuccess: (alumniId: string) => void;
  onCancel: () => void;
}

export const AdminAddAlumni: React.FC<AdminAddAlumniProps> = ({ onSuccess, onCancel }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Section 1: Personal Info
  const [alumniId, setAlumniId] = useState('');
  const [alumniIdError, setAlumniIdError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Section 2: Academic Info
  // Bachelor's (Required)
  const [bachelorProgram, setBachelorProgram] = useState('');
  const [bachelorCollege, setBachelorCollege] = useState('');
  const [bachelorMajor, setBachelorMajor] = useState('');
  const [bachelorYear, setBachelorYear] = useState<number>(2024);
  const [bachelorCampus, setBachelorCampus] = useState('Urdaneta Campus');

  // Master's (Optional)
  const [hasMaster, setHasMaster] = useState(false);
  const [masterProgram, setMasterProgram] = useState('');
  const [masterCollege, setMasterCollege] = useState('College of Graduate Studies');
  const [masterMajor, setMasterMajor] = useState('');
  const [masterYear, setMasterYear] = useState<number>(2026);
  const [masterCampus, setMasterCampus] = useState('Urdaneta Campus');

  // Doctorate (Optional)
  const [hasDoctorate, setHasDoctorate] = useState(false);
  const [docProgram, setDocProgram] = useState('');
  const [docCollege, setDocCollege] = useState('College of Graduate Studies');
  const [docMajor, setDocMajor] = useState('');
  const [docYear, setDocYear] = useState<number>(2026);
  const [docCampus, setDocCampus] = useState('Urdaneta Campus');

  // Section 3: Alumni Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [issueDate, setIssueDate] = useState('2024-06-15');
  const [expirationDate, setExpirationDate] = useState('2029-06-15');
  const [cardStatus, setCardStatus] = useState<'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ACTIVE');

  // Section 4: QR Code
  const [qrValue, setQrValue] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [qrStatus, setQrStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [qrDecoding, setQrDecoding] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrSuccessMsg, setQrSuccessMsg] = useState<string | null>(null);

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Validate Alumni ID uniqueness
  const handleAlumniIdBlur = async () => {
    if (!alumniId.trim()) return;
    setAlumniIdError(null);
    try {
      const available = await api.checkUnique('alumni_id', alumniId.trim());
      if (!available) {
        setAlumniIdError('This Alumni ID is already registered in the system.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Validate Card Number uniqueness
  const handleCardNumberBlur = async () => {
    if (!cardNumber.trim()) return;
    setCardNumberError(null);
    try {
      const available = await api.checkUnique('card_number', cardNumber.trim());
      if (!available) {
        setCardNumberError('This Card Number is already associated with another card.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Profile Picture File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setFormError('Profile picture must be a JPG, JPEG, PNG, or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle QR Image File Upload & Decoding (Sections 24, 25, 26)
  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrDecoding(true);
    setQrError(null);
    setQrSuccessMsg(null);

    try {
      const decoded = await decodeQRCodeFromImage(file);
      const token = extractVerificationToken(decoded.value);

      // Check duplicate QR
      const isUnique = await api.checkUnique('qr_value', token);
      if (!isUnique) {
        setQrError('⚠ QR CODE ALREADY REGISTERED: This QR code is already associated with another alumni card.');
        setQrValue('');
        setQrImageUrl('');
        return;
      }

      setQrValue(token);
      setQrImageUrl(decoded.imageDataUrl || '');
      setQrSuccessMsg('QR code successfully detected and decoded.');
    } catch (err: any) {
      setQrError(err.message || 'QR CODE COULD NOT BE READ. Please upload a clear QR code image containing a valid QR code.');
      setQrValue('');
      setQrImageUrl('');
    } finally {
      setQrDecoding(false);
      if (qrFileInputRef.current) {
        qrFileInputRef.current.value = '';
      }
    }
  };

  // Generate an official QR value helper
  const handleGenerateOfficialQR = async () => {
    const idSeed = alumniId.trim() || 'PU-' + Math.floor(100000 + Math.random() * 900000);
    const randPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const token = `${idSeed}-${randPart}`;

    setQrDecoding(true);
    setQrError(null);
    try {
      const isUnique = await api.checkUnique('qr_value', token);
      if (!isUnique) {
        throw new Error('Generated token conflict. Please try again.');
      }
      const dataUrl = await QRCodeLib.toDataURL(token, {
        width: 300,
        margin: 2,
        color: { dark: '#0F172A', light: '#FFFFFF' }
      });
      setQrValue(token);
      setQrImageUrl(dataUrl);
      setQrSuccessMsg('Generated and associated official cryptographic QR token.');
    } catch (err: any) {
      setQrError(err.message);
    } finally {
      setQrDecoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!alumniId.trim()) {
      setFormError('Alumni ID is required.');
      return;
    }
    if (alumniIdError) {
      setFormError('Please resolve Alumni ID conflict.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('First Name and Last Name are required.');
      return;
    }
    if (!bachelorProgram.trim() || !bachelorCollege.trim()) {
      setFormError("Bachelor's degree program and college are required.");
      return;
    }
    if (!cardNumber.trim()) {
      setFormError('Card Number is required.');
      return;
    }
    if (cardNumberError) {
      setFormError('Please resolve Card Number conflict.');
      return;
    }
    if (!qrValue.trim()) {
      setFormError('Please upload and decode a valid QR code for this alumni card.');
      return;
    }

    setSubmitting(true);

    try {
      // Build academic records array
      const academic_records: any[] = [
        {
          degree_level: 'BACHELORS',
          degree_program: bachelorProgram.trim(),
          college: bachelorCollege.trim(),
          major: bachelorMajor.trim() || bachelorProgram.trim(),
          graduation_year: bachelorYear,
          campus: bachelorCampus.trim()
        }
      ];

      if (hasMaster && masterProgram.trim()) {
        academic_records.push({
          degree_level: 'MASTERS',
          degree_program: masterProgram.trim(),
          college: masterCollege.trim(),
          major: masterMajor.trim() || masterProgram.trim(),
          graduation_year: masterYear,
          campus: masterCampus.trim()
        });
      }

      if (hasDoctorate && docProgram.trim()) {
        academic_records.push({
          degree_level: 'DOCTORATE',
          degree_program: docProgram.trim(),
          college: docCollege.trim(),
          major: docMajor.trim() || docProgram.trim(),
          graduation_year: docYear,
          campus: docCampus.trim()
        });
      }

      const res = await api.createAlumnus({
        alumni_id: alumniId.trim(),
        first_name: firstName.trim(),
        middle_name: middleName.trim(),
        last_name: lastName.trim(),
        suffix: suffix.trim(),
        photo_url: photoUrl,
        email: email.trim(),
        phone: phone.trim(),
        academic_records,
        card: {
          card_number: cardNumber.trim(),
          issue_date: issueDate,
          expiration_date: expirationDate,
          status: cardStatus
        },
        qr: {
          qr_value: qrValue.trim(),
          qr_image_url: qrImageUrl,
          status: qrStatus
        }
      });

      onSuccess(res.alumnus.alumni_id);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save alumni record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="text-xl font-serif font-bold text-slate-900">
            Register New Alumnus
          </h1>
          <p className="text-xs text-slate-600">
            Create an official verified alumni profile, academic degree credentials, card, and QR token.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Registration Error</span>
            <p>{formError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              1. Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Column */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Profile Picture
              </label>
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden relative flex items-center justify-center group shadow-xs">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 space-y-1 text-slate-600">
                      <User className="w-8 h-8 mx-auto" />
                      <span className="text-[10px] block font-medium">No photo selected</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="file"
                    ref={photoFileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <label
                    htmlFor="profile-photo-upload"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {photoUrl ? 'Replace Photo' : 'Upload Photo'}
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-600 mt-1">
                  JPG, PNG, or WebP. Centered portrait recommended.
                </span>
              </div>
            </div>

            {/* Inputs Column */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alumni ID */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Alumni ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={alumniId}
                  onChange={(e) => { setAlumniId(e.target.value); setAlumniIdError(null); }}
                  onBlur={handleAlumniIdBlur}
                  placeholder="e.g. PU-2024-00123"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none ${
                    alumniIdError ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-slate-900'
                  }`}
                />
                {alumniIdError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {alumniIdError}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Middle Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Santos (optional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dela Cruz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Suffix */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Suffix
                </label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  placeholder="Jr., III, Ph.D. (optional)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Email (Private) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Email <span className="text-[10px] text-slate-600">(Admin-only)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="graduate@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Phone (Private) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Contact Phone <span className="text-[10px] text-slate-600">(Admin-only)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+63 917 000 0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC INFORMATION */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Academic Information
            </h2>
          </div>

          {/* Bachelor's Degree Section (Required) */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Bachelor&apos;s Degree (Required)
              </span>
              <span className="text-[10px] text-slate-600">Base Undergraduate Qualification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Bachelor&apos;s Degree Program <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bachelorProgram}
                  onChange={(e) => setBachelorProgram(e.target.value)}
                  placeholder="e.g. Bachelor of Science in Information Technology"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  College <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bachelorCollege}
                  onChange={(e) => setBachelorCollege(e.target.value)}
                  placeholder="e.g. College of Computing and Information Technology"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Major / Specialization
                </label>
                <input
                  type="text"
                  value={bachelorMajor}
                  onChange={(e) => setBachelorMajor(e.target.value)}
                  placeholder="e.g. Information Technology"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Graduation Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={bachelorYear}
                  onChange={(e) => setBachelorYear(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Campus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bachelorCampus}
                  onChange={(e) => setBachelorCampus(e.target.value)}
                  placeholder="e.g. Urdaneta Campus"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Master's Degree Section (Optional with Checkbox) */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has-master-checkbox"
                checked={hasMaster}
                onChange={(e) => setHasMaster(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="has-master-checkbox" className="text-xs font-bold text-slate-900 cursor-pointer">
                Has Master&apos;s Degree (Optional)
              </label>
            </div>

            {hasMaster && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Master&apos;s Degree Program
                  </label>
                  <input
                    type="text"
                    value={masterProgram}
                    onChange={(e) => setMasterProgram(e.target.value)}
                    placeholder="e.g. Master of Information Technology"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    College
                  </label>
                  <input
                    type="text"
                    value={masterCollege}
                    onChange={(e) => setMasterCollege(e.target.value)}
                    placeholder="College of Graduate Studies"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Major / Specialization
                  </label>
                  <input
                    type="text"
                    value={masterMajor}
                    onChange={(e) => setMasterMajor(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={masterYear}
                    onChange={(e) => setMasterYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Campus
                  </label>
                  <input
                    type="text"
                    value={masterCampus}
                    onChange={(e) => setMasterCampus(e.target.value)}
                    placeholder="e.g. Urdaneta Campus"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Doctorate Degree Section (Optional with Checkbox) */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="has-doctorate-checkbox"
                checked={hasDoctorate}
                onChange={(e) => setHasDoctorate(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="has-doctorate-checkbox" className="text-xs font-bold text-slate-900 cursor-pointer">
                Has Doctorate Degree (Optional)
              </label>
            </div>

            {hasDoctorate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Doctorate Degree Program
                  </label>
                  <input
                    type="text"
                    value={docProgram}
                    onChange={(e) => setDocProgram(e.target.value)}
                    placeholder="e.g. Doctor of Philosophy in Information Technology"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    College
                  </label>
                  <input
                    type="text"
                    value={docCollege}
                    onChange={(e) => setDocCollege(e.target.value)}
                    placeholder="College of Graduate Studies"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Major / Specialization
                  </label>
                  <input
                    type="text"
                    value={docMajor}
                    onChange={(e) => setDocMajor(e.target.value)}
                    placeholder="e.g. Information Technology"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={docYear}
                    onChange={(e) => setDocYear(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Campus
                  </label>
                  <input
                    type="text"
                    value={docCampus}
                    onChange={(e) => setDocCampus(e.target.value)}
                    placeholder="e.g. Urdaneta Campus"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: ALUMNI CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Alumni Card
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Card Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => { setCardNumber(e.target.value); setCardNumberError(null); }}
                onBlur={handleCardNumberBlur}
                placeholder="e.g. AC-2024-00123"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none ${
                  cardNumberError ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-slate-900'
                }`}
              />
              {cardNumberError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1">
                  {cardNumberError}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Initial Card Status
              </label>
              <select
                value={cardStatus}
                onChange={(e) => setCardStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none font-semibold"
              >
                <option value="ACTIVE">ACTIVE (Card is currently valid)</option>
                <option value="EXPIRED">EXPIRED (Card validity has lapsed)</option>
                <option value="REVOKED">REVOKED (Card is cancelled/superseded)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: QR CODE UPLOAD & DECODING (Sections 24-27) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-slate-800" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                4. QR Code & Cryptographic Token
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGenerateOfficialQR}
              disabled={qrDecoding}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Generate Official QR</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload QR Image Box */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Existing Physical QR Image
              </label>

              <input
                type="file"
                ref={qrFileInputRef}
                onChange={handleQRUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                id="qr-upload-input"
              />

              <label
                htmlFor="qr-upload-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-6 transition-all cursor-pointer text-center"
              >
                {qrDecoding ? (
                  <div className="space-y-2 py-4">
                    <Loader2 className="w-8 h-8 text-slate-800 animate-spin mx-auto" />
                    <span className="text-xs font-semibold text-slate-700">
                      Scanning & Decoding QR Image...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 inline-block">
                      <Upload className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Select QR Code Photo / Image
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Browser engine will detect and decode QR token
                      </span>
                    </div>
                  </div>
                )}
              </label>

              {/* Status alerts */}
              {qrError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
                  {qrError}
                </div>
              )}
              {qrSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{qrSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* QR Preview & Decoded Value Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                QR Verification Association
              </span>

              <div className="flex items-center gap-4">
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-lg p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-600 text-center font-medium">
                      No QR Associated
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-600 block">
                      Decoded QR Value (Token)
                    </span>
                    <input
                      type="text"
                      required
                      value={qrValue}
                      onChange={(e) => setQrValue(e.target.value)}
                      placeholder="e.g. PU-ALUMNI-2024-8X29P7"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 truncate"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-600 block">
                      QR Token Status
                    </span>
                    <select
                      value={qrStatus}
                      onChange={(e) => setQrStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                The QR contains exclusively this unique identifier. Public users scanning this QR will query the live database to verify current membership and status.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || qrDecoding}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Alumnus...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Register Alumni Record</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
