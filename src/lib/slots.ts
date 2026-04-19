import { prisma } from './prisma';
import { getRedis } from './redis';
import { addMinutes, format } from 'date-fns';

export interface AvailableSlot {
  time: string;
  endTime: string;
  available: boolean;
}

/**
 * Generate available time slots for a doctor on a specific date
 */
export async function generateDoctorSlots(
  doctorId: string,
  date: Date
): Promise<AvailableSlot[]> {
  const dayOfWeek = date.getDay();

  // Get doctor's schedule for this day
  const schedule = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_dayOfWeek: {
        doctorId,
        dayOfWeek,
      },
    },
  });

  if (!schedule || !schedule.isActive) {
    return [];
  }

  // Check if doctor is on leave
  const leave = await prisma.doctorLeave.findFirst({
    where: {
      doctorId,
      startDate: { lte: date },
      endDate: { gte: date },
    },
  });

  if (leave) {
    return [];
  }

  // Generate slots
  const slots: AvailableSlot[] = [];
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);

  while (currentTime < endTime) {
    const slotEnd = addMinutes(currentTime, schedule.slotDurationMinutes);

    // Check if slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: date,
        slotTime: format(currentTime, 'HH:mm'),
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    const isBooked = existingAppointment !== null;
    const slotCount = await prisma.appointment.count({
      where: {
        doctorId,
        appointmentDate: date,
        slotTime: format(currentTime, 'HH:mm'),
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    slots.push({
      time: format(currentTime, 'HH:mm'),
      endTime: format(slotEnd, 'HH:mm'),
      available:
        !isBooked || slotCount < schedule.maxPatientsPerSlot,
    });

    currentTime = slotEnd;
  }

  return slots;
}

/**
 * Lock a slot temporarily (for 5 minutes) to prevent double booking
 */
export async function lockSlot(
  doctorId: string,
  date: Date,
  slotTime: string,
  patientProfileId: string
): Promise<boolean> {
  // Key must be per-slot (not per-patient), otherwise multiple users can "lock" the same slot.
  const key = `lock:${doctorId}:${format(date, 'yyyy-MM-dd')}:${slotTime}`;

  let redis: Awaited<ReturnType<typeof getRedis>> | null = null;
  try {
    redis = await getRedis();
  } catch {
    // If Redis is unavailable (common in local dev), don't block bookings.
    return true;
  }

  const existingLock = await redis.get(key);
  if (existingLock && existingLock !== patientProfileId) {
    return false; // Another user has this slot locked
  }

  await redis.setEx(key, 300, patientProfileId); // 5 minute lock
  return true;
}

/**
 * Release a slot lock
 */
export async function releaseSlotLock(
  doctorId: string,
  date: Date,
  slotTime: string,
  patientProfileId: string
): Promise<void> {
  const key = `lock:${doctorId}:${format(date, 'yyyy-MM-dd')}:${slotTime}`;
  try {
    const redis = await getRedis();
    const existingLock = await redis.get(key);
    if (existingLock === patientProfileId) {
      await redis.del(key);
    }
  } catch {
    // ignore when redis unavailable
  }
}

/**
 * Check if a slot is locked by another user
 */
export async function isSlotLocked(
  doctorId: string,
  date: Date,
  slotTime: string,
  patientProfileId: string
): Promise<boolean> {
  const key = `lock:${doctorId}:${format(date, 'yyyy-MM-dd')}:${slotTime}`;
  try {
    const redis = await getRedis();
    const lock = await redis.get(key);
    return lock !== null && lock !== patientProfileId;
  } catch {
    // If redis is down, treat as "not locked" (avoid blocking UI)
    return false;
  }
}

/**
 * Get next available slot for a doctor
 */
export async function getNextAvailableSlot(
  doctorId: string,
  fromDate: Date = new Date()
): Promise<
  | {
      date: Date;
      time: string;
    }
  | undefined
> {
  // Check next 30 days
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);
    if (checkDate.getDay() === 0) continue; // Skip Sundays

    const slots = await generateDoctorSlots(doctorId, checkDate);
    const availableSlot = slots.find((s) => s.available);

    if (availableSlot) {
      return {
        date: checkDate,
        time: availableSlot.time,
      };
    }
  }

  return undefined;
}
