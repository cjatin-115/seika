import { z } from 'zod';

// Patient Profile
export const createPatientProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().optional(),
  bloodGroup: z.enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']).optional(),
  allergies: z.string().max(500).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().max(1000).optional(),
  currentMedications: z.string().max(1000).optional(),
  surgicalHistory: z.string().max(1000).optional(),
  familyMedicalHistory: z.string().max(1000).optional(),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  chronicDiseases: z.string().max(1000).optional(),
  hospitalizationHistory: z.string().max(1000).optional(),
});

export const updatePatientProfileSchema = createPatientProfileSchema.partial();

// Hospital
export const createHospitalSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{5,6}$/),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email(),
  website: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

// Department
export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  iconSlug: z.string().optional(),
});

// Doctor
export const createDoctorSchema = z.object({
  name: z.string().min(2).max(100),
  title: z.string().optional(),
  specialization: z.string().min(2),
  qualifications: z.string().optional(),
  experience: z.number().int().min(0).max(100),
  consultationFee: z.number().positive(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

// Doctor Schedule
export const createDoctorScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().positive(),
  maxPatientsPerSlot: z.number().int().positive().default(1),
});

// Doctor Leave
export const createDoctorLeaveSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  reason: z.string().optional(),
});

// Appointment
export const createAppointmentSchema = z.object({
  doctorId: z.string().cuid(),
  appointmentDate: z.string().date(),
  slotTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional(),
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(5).max(500),
});

// Review
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  isAnonymous: z.boolean().default(false),
});

// Task
export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  assignedToUserId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
});

// Validation helpers
export const validateDateString = (date: string): boolean => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

export const validateSlotTime = (time: string): boolean => {
  return /^\d{2}:\d{2}$/.test(time);
};
