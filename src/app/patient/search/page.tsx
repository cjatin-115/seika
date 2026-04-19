'use client';

import { useState, useEffect } from 'react';
import { colors, DEPARTMENTS } from '@/lib/constants';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Star, Clock, Search as SearchIcon } from 'lucide-react';
import Card from '@/components/shared/Card';
import PrimaryButton from '@/components/shared/PrimaryButton';
import SectionHeader from '@/components/shared/SectionHeader';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  hospital?: { name: string; city: string };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    searchParams.get('specialty') || ''
  );

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append('name', searchQuery);
        if (selectedSpecialty) params.append('specialization', selectedSpecialty);

        const res = await fetch(`/api/doctors?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setDoctors(data.data?.doctors || []);
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedSpecialty]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      <SectionHeader title="Find a Doctor" subtitle="Search by name, specialty, or hospital" />

      {/* Search Bar */}
      <div
        className="relative px-4 py-3.5 rounded-xl border flex items-center gap-3 mb-6 soft-card"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <SearchIcon size={20} style={{ color: colors.textSecondary }} />
        <input
          type="text"
          placeholder="Search by name, specialization, hospital..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
          style={{ color: colors.textPrimary }}
        />
      </div>

      {/* Specialties Filter */}
      <div className="mb-6">
        <p style={{ color: colors.textSecondary }} className="text-sm mb-3 font-medium">
          Filter by Specialty:
        </p>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => setSelectedSpecialty('')}
            variant={selectedSpecialty === '' ? 'primary' : 'secondary'}
            style={{
              paddingInline: '1rem',
              paddingBlock: '0.625rem',
            }}
          >
            All
          </PrimaryButton>
          {DEPARTMENTS.map((dept) => (
            <PrimaryButton
              key={dept.name}
              onClick={() => setSelectedSpecialty(dept.name)}
              variant={selectedSpecialty === dept.name ? 'primary' : 'secondary'}
              style={{
                paddingInline: '1rem',
                paddingBlock: '0.625rem',
              }}
            >
              {dept.name}
            </PrimaryButton>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <Card className="text-center py-12 rounded-xl">
          <div
            className="w-12 h-12 border-4 border-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: colors.accentCherry }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading doctors...</p>
        </Card>
      ) : doctors.length === 0 ? (
        <Card className="text-center py-12 rounded-xl">
          <p style={{ color: colors.textSecondary }}>No doctors found. Try adjusting your filters.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="p-4 rounded-xl border transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Link href={`/patient/doctors/${doctor.id}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 style={{ color: colors.textPrimary }} className="font-semibold">
                      {doctor.name}
                    </h3>
                    <p style={{ color: colors.textSecondary }} className="text-sm">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {doctor.hospital && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} style={{ color: colors.accentCherry }} />
                      <span style={{ color: colors.textSecondary }}>
                        {doctor.hospital.name}, {doctor.hospital.city}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Star size={16} style={{ color: colors.accentCherry }} fill="currentColor" />
                    <span style={{ color: colors.textSecondary }}>
                      {doctor.rating.toFixed(1)} ({doctor.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} style={{ color: colors.accentCherry }} />
                    <span style={{ color: colors.textSecondary }}>
                      ₹{doctor.consultationFee}
                    </span>
                  </div>
                </div>

                <PrimaryButton className="w-full">Book Appointment</PrimaryButton>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
