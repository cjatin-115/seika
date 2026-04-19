'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { colors, DEPARTMENTS } from '@/lib/constants';
import Link from 'next/link';
import { MapPin, Star, Clock, Search } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appointments?status=CONFIRMED&limit=1');
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.data?.appointments || []);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1
          style={{ color: colors.textPrimary, fontFamily: '"Noto Serif JP", serif' }}
          className="text-3xl mb-2"
        >
          Welcome, {session?.user?.name?.split(' ')[0]}!
        </h1>
        <p style={{ color: colors.textSecondary }} className="text-lg">
          Ready to book your next appointment?
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div
          className="relative px-4 py-3 rounded-lg border flex items-center gap-3"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Search size={20} style={{ color: colors.textSecondary }} />
          <input
            type="text"
            placeholder="Search doctors, hospitals, specialties..."
            className="w-full bg-transparent outline-none text-sm"
            style={{ color: colors.textPrimary }}
          />
        </div>
      </div>

      {/* Upcoming Appointment */}
      {appointments.length > 0 && (
        <div className="mb-8">
          <h2
            style={{ color: colors.textPrimary, fontFamily: '"Noto Serif JP", serif' }}
            className="text-2xl mb-4"
          >
            Upcoming Appointment
          </h2>
          <AppointmentCard appointment={appointments[0]} />
        </div>
      )}

      {/* Quick Access Departments */}
      <div className="mb-8">
        <h2
          style={{ color: colors.textPrimary, fontFamily: '"Noto Serif JP", serif' }}
          className="text-2xl mb-4"
        >
          Popular Specialties
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept.name}
              href={`/search?specialty=${encodeURIComponent(dept.name)}`}
              className="p-4 rounded-lg text-center text-sm transition-colors"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.textSecondary,
                border: `1px solid`,
              }}
            >
              {dept.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div
        className="p-6 rounded-lg text-center"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderColor: colors.border,
        }}
      >
        <h3
          style={{ color: colors.textPrimary, fontFamily: '"Noto Serif JP", serif' }}
          className="text-xl mb-2"
        >
          Ready to book an appointment?
        </h3>
        <p style={{ color: colors.textSecondary }} className="text-sm mb-4">
          Browse our network of hospitals and doctors
        </p>
        <Link
          href="/search"
          className="inline-block px-6 py-3 rounded-md font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: colors.accentCherry,
            color: 'white',
            border: `1px solid ${colors.accentCherry}`,
          }}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: any }) {
  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        border: `1px solid`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 style={{ color: colors.textPrimary }} className="font-medium text-lg">
            Dr. {appointment.doctor?.name}
          </h3>
          <p style={{ color: colors.textSecondary }} className="text-sm">
            {appointment.doctor?.specialization}
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: colors.success,
            color: 'white',
          }}
        >
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
          <MapPin size={16} />
          {appointment.doctor?.hospital?.name}
        </div>
        <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
          <Clock size={16} />
          {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
          {appointment.slotTime}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
        <Link
          href={`/appointments/${appointment.id}`}
          className="text-sm font-medium transition-colors"
          style={{ color: colors.accentCherry }}
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
