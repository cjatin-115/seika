'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { colors } from '@/lib/constants';

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');

  const [hospitalName, setHospitalName] = useState('');
  const [hospitalSlug, setHospitalSlug] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalCity, setHospitalCity] = useState('');
  const [hospitalState, setHospitalState] = useState('');
  const [hospitalPincode, setHospitalPincode] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalEmail, setHospitalEmail] = useState('');
  const [hospitalWebsite, setHospitalWebsite] = useState('');

  const slugPreview = useMemo(() => {
    return hospitalName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }, [hospitalName]);

  const handleCreateHospitalAdmin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const slug = (hospitalSlug || slugPreview).trim();
      const res = await fetch('/api/superadmin/hospital-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName,
          adminEmail,
          password,
          hospitalName,
          hospitalSlug: slug,
          hospitalAddress,
          hospitalCity,
          hospitalState,
          hospitalPincode,
          hospitalPhone,
          hospitalEmail,
          hospitalWebsite,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message || data?.error?.message || 'Failed to create hospital admin');
        return;
      }

      setSuccess(
        `Created hospital admin for ${data?.data?.hospital?.name || hospitalName}. They can sign in at /auth.`
      );
      setPassword('');
    } catch {
      setError('Failed to create hospital admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: colors.textPrimary }} className="text-3xl font-serif mb-4">
        Super Admin Dashboard
      </h1>
      <p style={{ color: colors.textSecondary }} className="text-lg">
        Welcome to the super admin panel. Here you can manage hospitals, super users, and analytics.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
            Create hospital admin
          </h2>
          <p style={{ color: colors.textSecondary }} className="text-sm mb-6">
            Creates a <strong>HOSPITAL_ADMIN</strong> user with email/password login, and links a new hospital to
            that admin.
          </p>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ backgroundColor: '#dcfce7', color: '#166534' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleCreateHospitalAdmin} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Admin name
                </label>
                <input
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Admin email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Temporary password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2.5 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
              />
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Minimum 8 characters. Ask the hospital admin to change it after first login (once you add that flow).
              </p>
            </div>

            <div className="border-t pt-4" style={{ borderColor: colors.border }} />

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Hospital name
              </label>
              <input
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Hospital slug (optional)
              </label>
              <input
                value={hospitalSlug}
                onChange={(e) => setHospitalSlug(e.target.value)}
                placeholder={slugPreview || 'example-hospital'}
                className="w-full px-4 py-2.5 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
              />
              <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                Lowercase letters, numbers, and hyphens only. If left blank, we’ll use: <span className="font-mono">{slugPreview || '—'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                Address
              </label>
              <input
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border"
                style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  City
                </label>
                <input
                  value={hospitalCity}
                  onChange={(e) => setHospitalCity(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  State
                </label>
                <input
                  value={hospitalState}
                  onChange={(e) => setHospitalState(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Pincode (5–6 digits)
                </label>
                <input
                  value={hospitalPincode}
                  onChange={(e) => setHospitalPincode(e.target.value)}
                  required
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Phone (10 digits)
                </label>
                <input
                  value={hospitalPhone}
                  onChange={(e) => setHospitalPhone(e.target.value)}
                  required
                  inputMode="numeric"
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Hospital contact email
                </label>
                <input
                  type="email"
                  value={hospitalEmail}
                  onChange={(e) => setHospitalEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
                  Website (optional)
                </label>
                <input
                  value={hospitalWebsite}
                  onChange={(e) => setHospitalWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: colors.border, backgroundColor: colors.background, color: colors.textPrimary }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: colors.accentCherry, color: 'white' }}
            >
              {loading ? 'Creating…' : 'Create hospital admin'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
              Hospitals
            </h2>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              Manage all hospitals in the system (listing UI can come next).
            </p>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
              Users
            </h2>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              Manage system users and roles (listing UI can come next).
            </p>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
              Analytics
            </h2>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              View system analytics and reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
