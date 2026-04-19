import { colors } from '@/lib/constants';

export default function SuperAdminPage() {
  return (
    <div>
      <h1 style={{ color: colors.textPrimary }} className="text-3xl font-serif mb-4">
        Super Admin Dashboard
      </h1>
      <p style={{ color: colors.textSecondary }} className="text-lg">
        Welcome to the super admin panel. Here you can manage hospitals, super users, and analytics.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Hospitals</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">Manage all hospitals in the system</p>
        </div>
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Users</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">Manage system users and roles</p>
        </div>
        <div 
          className="p-6 rounded-lg"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, border: `1px solid ${colors.border}` }}
        >
          <h2 style={{ color: colors.textPrimary }} className="font-semibold mb-2">Analytics</h2>
          <p style={{ color: colors.textSecondary }} className="text-sm">View system analytics and reports</p>
        </div>
      </div>
    </div>
  );
}
