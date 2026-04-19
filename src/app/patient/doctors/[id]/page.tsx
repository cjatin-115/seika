'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { colors } from '@/lib/constants';
import { ArrowLeft, Star, MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Calendar from '@/components/shared/Calendar';

interface DoctorDetails {
  id: string;
  name: string;
  title?: string;
  specialization: string;
  qualifications?: string;
  experience: number;
  consultationFee: number;
  bio?: string;
  rating: number;
  totalReviews: number;
  languages: string[];
  hospital?: {
    id: string;
    name: string;
    city: string;
    phone: string;
    email: string;
    address: string;
  };
}

interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
}

interface PatientProfile {
  id: string;
  displayName: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const doctorId = params.id as string;

  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDoctorInfo, setShowDoctorInfo] = useState(false);
  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    if (!session?.user?.id) {
      router.push('/auth');
      return;
    }
    fetchDoctorDetails();
    fetchPatientProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, router]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}`);
      if (res.ok) {
        const data = await res.json();
        setDoctor(data.data);
      } else {
        setError('Doctor not found');
      }
    } catch {
      setError('Failed to load doctor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        const profilesList = data.data || [];
        setProfiles(profilesList);
        if (profilesList.length > 0) {
          setSelectedProfile(profilesList[0].id);
        }
      }
    } catch {
      console.error('Failed to fetch profiles');
    }
  };

  const fetchSlots = async (date: string) => {
    if (!date) return;

    try {
      const res = await fetch(`/api/doctors/${doctorId}/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setSlots(data.data?.slots || []);
        setSelectedSlot('');
      }
    } catch {
      console.error('Failed to fetch slots');
      setError('Failed to load available slots');
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleBookAppointment = async () => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[booking] click', {
        selectedProfile,
        selectedDate,
        selectedSlot,
        slotsCount: slots.length,
      });
    }
    if (!selectedProfile || !selectedDate || !selectedSlot) {
      setError('Please select profile, date, and time slot');
      return;
    }

    setBookingLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedSlotData = slots.find((slot) => slot.time === selectedSlot);
      if (!selectedSlotData?.endTime) {
        setError('Invalid slot selected. Please choose another time.');
        setBookingLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      if (isDev) {
        // eslint-disable-next-line no-console
        console.log('[booking] posting /api/appointments');
      }
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          patientProfileId: selectedProfile,
          doctorId,
          appointmentDate: selectedDate,
          slotTime: selectedSlot,
          slotEndTime: selectedSlotData.endTime,
          reason,
        }),
      }).finally(() => clearTimeout(timeoutId));

      if (res.ok) {
        setSuccess('Appointment booked successfully!');
        setTimeout(() => {
          router.replace('/patient/home');
        }, 800);
      } else {
        let message = 'Failed to book appointment';
        try {
          const data = await res.json();
          message = data?.message || data?.error?.message || message;
        } catch {
          // ignore JSON parse errors
        }
        setError(message);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Booking took too long (timeout). Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div
            className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.accentCherry }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
        <Link href="/patient/search" className="flex items-center gap-2 mb-6">
          <ArrowLeft size={20} style={{ color: colors.accentCherry }} />
          <span style={{ color: colors.accentCherry }}>Back to Search</span>
        </Link>
        <div
          className="text-center py-12 rounded-lg"
          style={{ backgroundColor: colors.surface }}
        >
          <p style={{ color: colors.textSecondary }}>{error || 'Doctor not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link href="/patient/search" className="flex items-center gap-2 mb-6">
        <ArrowLeft size={20} style={{ color: colors.accentCherry }} />
        <span style={{ color: colors.accentCherry }}>Back to Search</span>
      </Link>

      {/* Collapsible Doctor Info */}
      <button
        onClick={() => setShowDoctorInfo(!showDoctorInfo)}
        className="w-full mb-6 p-4 rounded-lg border transition-all"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left flex-1">
            <h2
              style={{ color: colors.textPrimary }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              {doctor.title} {doctor.name}
              <span style={{ color: colors.textSecondary }} className="text-sm font-normal">
                • {doctor.specialization}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <Star
                  size={14}
                  style={{ color: colors.accentCherry }}
                  fill="currentColor"
                />
                <span style={{ color: colors.textPrimary }}>
                  {doctor.rating.toFixed(1)}
                </span>
                <span style={{ color: colors.textSecondary }}>
                  ({doctor.totalReviews} reviews)
                </span>
              </div>
              <div
                className="px-3 py-1 rounded text-sm font-semibold"
                style={{
                  backgroundColor: colors.accentCherry,
                  color: 'white',
                }}
              >
                ₹{doctor.consultationFee}
              </div>
            </div>
          </div>
          <div style={{ color: colors.textSecondary }}>
            {showDoctorInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Expanded Doctor Details */}
      {showDoctorInfo && (
        <div className="mb-6 p-6 rounded-lg border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          {doctor.bio && (
            <div className="mb-6">
              <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
                About
              </h3>
              <p style={{ color: colors.textSecondary }}>{doctor.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
                Experience
              </h3>
              <p style={{ color: colors.textSecondary }}>{doctor.experience} years</p>
            </div>
            {doctor.qualifications && (
              <div>
                <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
                  Qualifications
                </h3>
                <p style={{ color: colors.textSecondary }}>{doctor.qualifications}</p>
              </div>
            )}
          </div>

          {doctor.languages.length > 0 && (
            <div className="mb-6">
              <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-2">
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      backgroundColor: colors.accentCherry,
                      color: 'white',
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hospital Info */}
          {doctor.hospital && (
            <div>
              <h3 style={{ color: colors.textPrimary }} className="font-semibold mb-3">
                Hospital
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 style={{ color: colors.textPrimary }} className="font-medium">
                    {doctor.hospital.name}
                  </h4>
                  <p style={{ color: colors.textSecondary }} className="text-sm">
                    {doctor.hospital.city}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} style={{ color: colors.accentCherry, marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <p style={{ color: colors.textSecondary }} className="text-sm">
                      {doctor.hospital.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} style={{ color: colors.accentCherry }} />
                  <a
                    href={`tel:${doctor.hospital.phone}`}
                    style={{ color: colors.accentCherry }}
                    className="text-sm"
                  >
                    {doctor.hospital.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} style={{ color: colors.accentCherry }} />
                  <a
                    href={`mailto:${doctor.hospital.email}`}
                    style={{ color: colors.accentCherry }}
                    className="text-sm"
                  >
                    {doctor.hospital.email}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Form */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <h2 style={{ color: colors.textPrimary }} className="text-2xl font-semibold mb-6">
          Book Appointment
        </h2>

        {isDev && (
          <div
            className="p-3 rounded-lg mb-4 text-xs"
            style={{ backgroundColor: '#eef2ff', color: '#3730a3' }}
          >
            Debug: profile={selectedProfile || '∅'} date={selectedDate || '∅'} slot=
            {selectedSlot || '∅'} slots={slots.length} loading={String(bookingLoading)}
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-lg mb-4 text-sm"
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 rounded-lg mb-4 text-sm"
            style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
            }}
          >
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Patient Profile Selection */}
          <div>
            <label style={{ color: colors.textPrimary }} className="block text-sm font-semibold mb-2">
              Select Profile
            </label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full px-4 py-3 rounded-md border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.textPrimary,
              }}
            >
              <option value="">Choose a profile</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection with Calendar */}
          <div>
            <label style={{ color: colors.textPrimary }} className="block text-sm font-semibold mb-3">
              Select Date
            </label>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              minDate={new Date()}
              maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label style={{ color: colors.textPrimary }} className="block text-sm font-semibold mb-3">
                Select Time
              </label>
              {slots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                      className="px-3 py-3 rounded-md text-sm font-medium transition-all"
                      style={{
                        backgroundColor:
                          selectedSlot === slot.time
                            ? colors.accentCherry
                            : slot.available
                            ? colors.background
                            : '#f3f4f6',
                        color:
                          selectedSlot === slot.time
                            ? 'white'
                            : slot.available
                            ? colors.textPrimary
                            : colors.textSecondary,
                        border: `1px solid ${colors.border}`,
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        opacity: slot.available ? 1 : 0.5,
                      }}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textSecondary }} className="text-sm py-4">
                  No slots available for this date
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label style={{ color: colors.textPrimary }} className="block text-sm font-semibold mb-2">
              Reason for Visit (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your health concern..."
              className="w-full px-4 py-3 rounded-md border text-sm"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.textPrimary,
              }}
              rows={3}
            />
          </div>

          {/* Book Button */}
          <button
            onClick={handleBookAppointment}
            disabled={bookingLoading || !selectedProfile || !selectedDate || !selectedSlot}
            className="w-full py-3 rounded-md font-semibold transition-all text-base"
            style={{
              backgroundColor:
                bookingLoading || !selectedProfile || !selectedDate || !selectedSlot
                  ? '#d1d5db'
                  : colors.accentCherry,
              color: 'white',
              cursor:
                bookingLoading || !selectedProfile || !selectedDate || !selectedSlot
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {bookingLoading ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
