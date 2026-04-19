'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { colors } from '@/lib/constants';
import { Edit2, Plus, Trash2, Save, AlertCircle } from 'lucide-react';

interface PatientProfile {
  id: string;
  displayName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isDefault: boolean;
  medicalHistory?: string;
  currentMedications?: string;
  surgicalHistory?: string;
  familyMedicalHistory?: string;
  height?: number;
  weight?: number;
  chronicDiseases?: string;
  hospitalizationHistory?: string;
}

interface FieldErrors {
  [key: string]: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PatientProfile>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Validation helper functions
  const validateHeight = (value: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Height must be a valid number';
    if (num <= 0) return 'Height must be greater than 0';
    if (num > 300) return 'Height must be less than 300 cm';
    return null;
  };

  const validateWeight = (value: string): string | null => {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return 'Weight must be a valid number';
    if (num <= 0) return 'Weight must be greater than 0';
    if (num > 500) return 'Weight must be less than 500 kg';
    return null;
  };

  const validatePhone = (value: string): string | null => {
    if (!value) return null;
    if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
      return 'Phone must be 10 digits';
    }
    return null;
  };

  const validateDisplayName = (value: string): string | null => {
    if (!value || !value.trim()) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const validateField = (fieldName: string, value: string | number | undefined): string | null => {
    if (fieldName === 'height') return validateHeight(String(value || ''));
    if (fieldName === 'weight') return validateWeight(String(value || ''));
    if (fieldName === 'phone') return validatePhone(String(value || ''));
    if (fieldName === 'emergencyContactPhone') return validatePhone(String(value || ''));
    if (fieldName === 'displayName') return validateDisplayName(String(value || ''));
    return null;
  };

  const updateFieldError = (fieldName: string, value: string | number | undefined) => {
    const error = validateField(fieldName, value);
    setFieldErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[fieldName] = error;
      } else {
        delete updated[fieldName];
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (profile: PatientProfile) => {
    setEditingId(profile.id);
    setEditData({ ...profile });
  };

  const handleSave = async () => {
    const nameError = validateDisplayName(editData.displayName || '');
    if (nameError) {
      setFieldErrors((prev) => ({ ...prev, displayName: nameError }));
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      // If editing existing profile
      if (editingId) {
        const res = await fetch(`/api/profiles/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        });

        if (res.ok) {
          setEditingId(null);
          setFieldErrors({});
          fetchProfiles();
        } else {
          const error = await res.json();
          alert(error.message || 'Failed to save profile');
        }
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('An error occurred while saving');
    }
  };

  const handleAddNewProfile = async () => {
    const nameError = validateDisplayName(editData.displayName || '');
    if (nameError) {
      setFieldErrors((prev) => ({ ...prev, displayName: nameError }));
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      alert('Please fix the errors in the form');
      return;
    }

    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setShowAddForm(false);
        setEditData({});
        setFieldErrors({});
        fetchProfiles();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add profile');
      }
    } catch (error) {
      console.error('Failed to add profile:', error);
      alert('An error occurred while adding member');
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfiles();
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
      <h1
        style={{ color: colors.textPrimary, fontFamily: '"Noto Serif JP", serif' }}
        className="text-3xl mb-2"
      >
        Profile & Settings
      </h1>
      <p style={{ color: colors.textSecondary }} className="mb-6">
        Manage your profile and family members
      </p>

      {/* Account Info */}
      <div
        className="p-4 rounded-lg border mb-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-4">
          Account Information
        </h2>
        <div className="space-y-3">
          <div>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              Email
            </p>
            <p style={{ color: colors.textPrimary }} className="font-medium">
              {session?.user?.email}
            </p>
          </div>
          <div>
            <p style={{ color: colors.textSecondary }} className="text-sm">
              Name
            </p>
            <p style={{ color: colors.textPrimary }} className="font-medium">
              {session?.user?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Profiles */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: colors.textPrimary }} className="text-xl font-semibold">
            Medical Profiles
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: colors.accentCherry,
              color: 'white',
            }}
          >
            <Plus size={16} />
            Add Family Member
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p style={{ color: colors.textSecondary }}>Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: colors.surface }}
          >
            <p style={{ color: colors.textSecondary }}>No profiles yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {editingId === profile.id ? (
                  // Edit Mode
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={editData.displayName || ''}
                            onChange={(e) => {
                              setEditData({ ...editData, displayName: e.target.value })
                              updateFieldError('displayName', e.target.value);
                            }}
                            onBlur={(e) => updateFieldError('displayName', e.target.value)}
                            className={`w-full px-4 py-3 rounded-md border text-sm ${
                              fieldErrors.displayName ? 'border-red-500 bg-red-50' : ''
                            }`}
                            style={{
                              borderColor: fieldErrors.displayName ? '#ef4444' : colors.border,
                              backgroundColor: fieldErrors.displayName ? '#fef2f2' : colors.background,
                              color: colors.textPrimary,
                            }}
                          />
                          {fieldErrors.displayName && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldErrors.displayName}
                            </p>
                          )}
                        </div>
                        <input
                          type="date"
                          value={editData.dateOfBirth || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, dateOfBirth: e.target.value })
                          }
                          className="px-4 py-3 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          }}
                        />
                        <select
                          value={editData.gender || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, gender: e.target.value })
                          }
                          className="px-4 py-3 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          }}
                        >
                          <option value="">Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                        <div>
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={editData.phone || ''}
                            onChange={(e) => {
                              setEditData({ ...editData, phone: e.target.value })
                              updateFieldError('phone', e.target.value);
                            }}
                            onBlur={(e) => updateFieldError('phone', e.target.value)}
                            className={`w-full px-4 py-3 rounded-md border text-sm ${
                              fieldErrors.phone ? 'border-red-500 bg-red-50' : ''
                            }`}
                            style={{
                              borderColor: fieldErrors.phone ? '#ef4444' : colors.border,
                              backgroundColor: fieldErrors.phone ? '#fef2f2' : colors.background,
                              color: colors.textPrimary,
                            }}
                          />
                          {fieldErrors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldErrors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Physical Information */}
                    <div>
                      <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                        Physical Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <input
                            type="number"
                            placeholder="Height (cm)"
                            value={editData.height || ''}
                            onChange={(e) => {
                              setEditData({ ...editData, height: e.target.value ? parseFloat(e.target.value) : undefined })
                              updateFieldError('height', e.target.value);
                            }}
                            onBlur={(e) => updateFieldError('height', e.target.value)}
                            className={`w-full px-4 py-3 rounded-md border text-sm ${
                              fieldErrors.height ? 'border-red-500 bg-red-50' : ''
                            }`}
                            style={{
                              borderColor: fieldErrors.height ? '#ef4444' : colors.border,
                              backgroundColor: fieldErrors.height ? '#fef2f2' : colors.background,
                              color: colors.textPrimary,
                            }}
                          />
                          {fieldErrors.height && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldErrors.height}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Weight (kg)"
                            value={editData.weight || ''}
                            onChange={(e) => {
                              setEditData({ ...editData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                              updateFieldError('weight', e.target.value);
                            }}
                            onBlur={(e) => updateFieldError('weight', e.target.value)}
                            className={`w-full px-4 py-3 rounded-md border text-sm ${
                              fieldErrors.weight ? 'border-red-500 bg-red-50' : ''
                            }`}
                            style={{
                              borderColor: fieldErrors.weight ? '#ef4444' : colors.border,
                              backgroundColor: fieldErrors.weight ? '#fef2f2' : colors.background,
                              color: colors.textPrimary,
                            }}
                          />
                          {fieldErrors.weight && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldErrors.weight}
                            </p>
                          )}
                        </div>
                        <select
                          value={editData.bloodGroup || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, bloodGroup: e.target.value })
                          }
                          className="px-3 py-2 rounded-md border"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                        >
                          <option value="">Blood Group</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div>
                      <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                        Medical History
                      </h4>
                      <div className="space-y-4">
                        <textarea
                          placeholder="Chronic Diseases"
                          value={editData.chronicDiseases || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, chronicDiseases: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                          rows={2}
                        />
                        <textarea
                          placeholder="Current Medications"
                          value={editData.currentMedications || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, currentMedications: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                          rows={2}
                        />
                        <textarea
                          placeholder="Allergies"
                          value={editData.allergies || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, allergies: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                          rows={2}
                        />
                        <textarea
                          placeholder="Surgical History"
                          value={editData.surgicalHistory || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, surgicalHistory: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                          rows={2}
                        />
                        <textarea
                          placeholder="Family Medical History"
                          value={editData.familyMedicalHistory || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, familyMedicalHistory: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-md border text-sm"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Emergency Contact Name"
                          value={editData.emergencyContactName || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, emergencyContactName: e.target.value })
                          }
                          className="px-3 py-2 rounded-md border"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }}
                        />
                        <div>
                          <input
                            type="tel"
                            placeholder="Emergency Contact Phone"
                            value={editData.emergencyContactPhone || ''}
                            onChange={(e) => {
                              setEditData({ ...editData, emergencyContactPhone: e.target.value })
                              updateFieldError('emergencyContactPhone', e.target.value);
                            }}
                            onBlur={(e) => updateFieldError('emergencyContactPhone', e.target.value)}
                            className={`w-full px-3 py-2 rounded-md border ${
                              fieldErrors.emergencyContactPhone ? 'border-red-500 bg-red-50' : ''
                            }`}
                            style={{
                              borderColor: fieldErrors.emergencyContactPhone ? '#ef4444' : colors.border,
                              backgroundColor: fieldErrors.emergencyContactPhone ? '#fef2f2' : colors.background,
                            }}
                          />
                          {fieldErrors.emergencyContactPhone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {fieldErrors.emergencyContactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t" style={{ borderColor: colors.border }}>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-md font-medium"
                        style={{ backgroundColor: colors.accentCherry, color: 'white' }}
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-md border font-medium"
                        style={{ borderColor: colors.border, color: colors.textSecondary }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 style={{ color: colors.textPrimary }} className="font-semibold text-lg mb-2">
                          {profile.displayName}
                        </h3>
                        <div className="space-y-1 text-sm" style={{ color: colors.textSecondary }}>
                          {profile.dateOfBirth && (
                            <p>Age: {new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear()}</p>
                          )}
                          {profile.gender && <p>Gender: {profile.gender === 'MALE' ? 'Male' : profile.gender === 'FEMALE' ? 'Female' : 'Other'}</p>}
                          {profile.bloodGroup && <p>Blood Group: {profile.bloodGroup}</p>}
                          {profile.height && profile.weight && (
                            <p>Height/Weight: {profile.height}cm / {profile.weight}kg</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(profile)}
                          className="p-2 rounded-md transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            color: colors.accentCherry,
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id)}
                          className="p-2 rounded-md transition-all"
                          style={{
                            backgroundColor: colors.surface,
                            color: '#ef4444',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Medical Details in View Mode */}
                    <div
                      className="p-4 rounded-lg mt-4 text-sm space-y-2"
                      style={{ backgroundColor: colors.background }}
                    >
                      {profile.chronicDiseases && (
                        <p>
                          <span style={{ color: colors.textSecondary }}>Chronic Diseases:</span>{' '}
                          <span style={{ color: colors.textPrimary }}>{profile.chronicDiseases}</span>
                        </p>
                      )}
                      {profile.currentMedications && (
                        <p>
                          <span style={{ color: colors.textSecondary }}>Current Medications:</span>{' '}
                          <span style={{ color: colors.textPrimary }}>{profile.currentMedications}</span>
                        </p>
                      )}
                      {profile.allergies && (
                        <p>
                          <span style={{ color: colors.textSecondary }}>Allergies:</span>{' '}
                          <span style={{ color: colors.textPrimary }}>{profile.allergies}</span>
                        </p>
                      )}
                      {profile.surgicalHistory && (
                        <p>
                          <span style={{ color: colors.textSecondary }}>Surgical History:</span>{' '}
                          <span style={{ color: colors.textPrimary }}>{profile.surgicalHistory}</span>
                        </p>
                      )}
                      {profile.familyMedicalHistory && (
                        <p>
                          <span style={{ color: colors.textSecondary }}>Family Medical History:</span>{' '}
                          <span style={{ color: colors.textPrimary }}>{profile.familyMedicalHistory}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Profile Form */}
      {showAddForm && (
        <div
          className="p-6 rounded-lg border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <h3 style={{ color: colors.textPrimary }} className="font-semibold text-lg mb-6">
            Add New Family Member
          </h3>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={editData.displayName || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, displayName: e.target.value })
                      updateFieldError('displayName', e.target.value);
                    }}
                    onBlur={(e) => updateFieldError('displayName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-md border text-sm ${
                      fieldErrors.displayName ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      borderColor: fieldErrors.displayName ? '#ef4444' : colors.border,
                      backgroundColor: fieldErrors.displayName ? '#fef2f2' : colors.background,
                      color: colors.textPrimary,
                    }}
                  />
                  {fieldErrors.displayName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.displayName}
                    </p>
                  )}
                </div>
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={editData.dateOfBirth || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, dateOfBirth: e.target.value })
                  }
                  className="px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                />
                <select
                  value={editData.gender || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, gender: e.target.value })
                  }
                  className="px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="">Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={editData.phone || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, phone: e.target.value })
                      updateFieldError('phone', e.target.value);
                    }}
                    onBlur={(e) => updateFieldError('phone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-md border text-sm ${
                      fieldErrors.phone ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      borderColor: fieldErrors.phone ? '#ef4444' : colors.border,
                      backgroundColor: fieldErrors.phone ? '#fef2f2' : colors.background,
                      color: colors.textPrimary,
                    }}
                  />
                  {fieldErrors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical Information */}
            <div>
              <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                Physical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Height (cm)"
                    value={editData.height || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, height: e.target.value ? parseFloat(e.target.value) : undefined })
                      updateFieldError('height', e.target.value);
                    }}
                    onBlur={(e) => updateFieldError('height', e.target.value)}
                    className={`w-full px-4 py-3 rounded-md border text-sm ${
                      fieldErrors.height ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      borderColor: fieldErrors.height ? '#ef4444' : colors.border,
                      backgroundColor: fieldErrors.height ? '#fef2f2' : colors.background,
                      color: colors.textPrimary,
                    }}
                  />
                  {fieldErrors.height && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.height}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Weight (kg)"
                    value={editData.weight || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                      updateFieldError('weight', e.target.value);
                    }}
                    onBlur={(e) => updateFieldError('weight', e.target.value)}
                    className={`w-full px-4 py-3 rounded-md border text-sm ${
                      fieldErrors.weight ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      borderColor: fieldErrors.weight ? '#ef4444' : colors.border,
                      backgroundColor: fieldErrors.weight ? '#fef2f2' : colors.background,
                      color: colors.textPrimary,
                    }}
                  />
                  {fieldErrors.weight && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.weight}
                    </p>
                  )}
                </div>
                <select
                  value={editData.bloodGroup || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, bloodGroup: e.target.value })
                  }
                  className="px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="">Blood Group</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                Medical History
              </h4>
              <div className="space-y-4">
                <textarea
                  placeholder="Chronic Diseases (e.g., Diabetes, Hypertension, Asthma)"
                  value={editData.chronicDiseases || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, chronicDiseases: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Current Medications (e.g., Aspirin 100mg daily)"
                  value={editData.currentMedications || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, currentMedications: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Allergies"
                  value={editData.allergies || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, allergies: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Surgical History (e.g., Appendectomy 2015)"
                  value={editData.surgicalHistory || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, surgicalHistory: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                  rows={2}
                />
                <textarea
                  placeholder="Family Medical History (e.g., Father has heart disease)"
                  value={editData.familyMedicalHistory || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, familyMedicalHistory: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                  rows={2}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 style={{ color: colors.textPrimary }} className="font-semibold mb-3 text-sm">
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Emergency Contact Name"
                  value={editData.emergencyContactName || ''}
                  onChange={(e) =>
                    setEditData({ ...editData, emergencyContactName: e.target.value })
                  }
                  className="px-4 py-3 rounded-md border text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  }}
                />
                <div>
                  <input
                    type="tel"
                    placeholder="Emergency Contact Phone"
                    value={editData.emergencyContactPhone || ''}
                    onChange={(e) => {
                      setEditData({ ...editData, emergencyContactPhone: e.target.value })
                      updateFieldError('emergencyContactPhone', e.target.value);
                    }}
                    onBlur={(e) => updateFieldError('emergencyContactPhone', e.target.value)}
                    className={`w-full px-4 py-3 rounded-md border text-sm ${
                      fieldErrors.emergencyContactPhone ? 'border-red-500 bg-red-50' : ''
                    }`}
                    style={{
                      borderColor: fieldErrors.emergencyContactPhone ? '#ef4444' : colors.border,
                      backgroundColor: fieldErrors.emergencyContactPhone ? '#fef2f2' : colors.background,
                      color: colors.textPrimary,
                    }}
                  />
                  {fieldErrors.emergencyContactPhone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.emergencyContactPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
              <button
                onClick={() => {
                  handleAddNewProfile();
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-md font-medium"
                style={{ backgroundColor: colors.accentCherry, color: 'white' }}
              >
                <Plus size={16} />
                Add Member
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditData({});
                }}
                className="px-6 py-2 rounded-md border font-medium"
                style={{ borderColor: colors.border, color: colors.textSecondary }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
