'use client';

import { useState, useEffect } from 'react';
import { colors } from '@/lib/constants';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import Card from '@/components/shared/Card';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SectionHeader from '@/components/shared/SectionHeader';

interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  doctor?: {
    name: string;
    specialization: string;
  };
  hospital?: {
    name: string;
    city: string;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>(
    'all'
  );

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/appointments');
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

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return apt.status === 'CONFIRMED' || apt.status === 'PENDING';
    if (filter === 'completed') return apt.status === 'COMPLETED';
    if (filter === 'cancelled') return apt.status === 'CANCELLED';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'COMPLETED':
        return '#6366f1';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">
      <SectionHeader title="My Appointments" subtitle="Track upcoming and past visits" />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'upcoming', 'completed', 'cancelled'].map((status) => (
          <PrimaryButton
            key={status}
            onClick={() => setFilter(status as any)}
            variant={filter === status ? 'primary' : 'secondary'}
            className="capitalize"
            style={{
              paddingInline: '1rem',
              paddingBlock: '0.625rem',
            }}
          >
            {status}
          </PrimaryButton>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <Card className="text-center py-12 rounded-xl">
          <div
            className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.accentCherry }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading appointments...</p>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="text-center py-12 rounded-xl">
          <p style={{ color: colors.textSecondary }}>
            No {filter !== 'all' ? filter : ''} appointments yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  {/* Doctor Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} style={{ color: colors.accentCherry }} />
                    <h3 style={{ color: colors.textPrimary }} className="font-semibold">
                      {appointment.doctor?.name}
                    </h3>
                  </div>

                  <p style={{ color: colors.textSecondary }} className="text-sm mb-3">
                    {appointment.doctor?.specialization}
                  </p>

                  {/* Appointment Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} style={{ color: colors.accentCherry }} />
                      <span style={{ color: colors.textSecondary }}>
                        {new Date(appointment.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} style={{ color: colors.accentCherry }} />
                      <span style={{ color: colors.textSecondary }}>{appointment.timeSlot}</span>
                    </div>
                    {appointment.hospital && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} style={{ color: colors.accentCherry }} />
                        <span style={{ color: colors.textSecondary }}>
                          {appointment.hospital.name}, {appointment.hospital.city}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-start md:items-end gap-3">
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status}
                  </div>
                  {appointment.status === 'CONFIRMED' && (
                    <PrimaryButton>
                      Join Video Call
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
