import { colors } from '@/lib/constants';

export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ color: colors.textPrimary }} className="text-3xl font-serif mb-4">
        Hospital Dashboard
      </h1>
      <p style={{ color: colors.textSecondary }} className="text-lg">
        Welcome to the hospital admin panel. Here you can manage appointments, doctors, and staff.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Overview</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">Manage your hospital status and settings</p>
        </div>
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Schedule</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">View and manage doctor schedules</p>
        </div>
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Appointments</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">Track patient appointments</p>
        </div>
      </div>
    </div>
  );
}
