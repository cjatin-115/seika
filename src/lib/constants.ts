// Design System Colors - Japanese Wabi-Sabi Minimalism
export const colors = {
  background: '#FAFAF8',
  surface: '#F2F0EB',
  border: '#E2DDD5',
  textPrimary: '#1A1916',
  textSecondary: '#6B6760',
  accentCherry: '#D4768A', // Primary accent
  accentDark: '#A3495C',
  success: '#4A7C59', // Matcha
  info: '#2E4A6B', // Ink blue
  warning: '#B8860B', // Amber
};

// Days of week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Blood groups
export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// Genders
export const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

// Appointment statuses
export const APPOINTMENT_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked In',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
};

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
};

// User roles
export const USER_ROLES = {
  PATIENT: 'Patient',
  HOSPITAL_ADMIN: 'Hospital Admin',
  DOCTOR: 'Doctor',
  SUPER_ADMIN: 'Super Admin',
};

// Departments with icons
export const DEPARTMENTS = [
  { name: 'General Medicine', icon: 'stethoscope' },
  { name: 'Cardiology', icon: 'heart' },
  { name: 'Dermatology', icon: 'skin' },
  { name: 'Orthopedics', icon: 'bone' },
  { name: 'Pediatrics', icon: 'baby' },
  { name: 'Gynecology', icon: 'heart-handshake' },
];

// Languages
export const LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Bengali',
];

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_CONFIRMED: 'Your appointment has been confirmed',
  REMINDER_24H: 'Your appointment is tomorrow',
  REMINDER_1H: 'Your appointment is in 1 hour',
  CANCELLED: 'Your appointment has been cancelled',
  REVIEW_PROMPT: 'Please rate your appointment',
};

// Rating options
export const RATING_OPTIONS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Very Good' },
  { value: 5, label: 'Excellent' },
];

// Specializations
export const SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'ENT',
  'Ophthalmology',
  'Gynecology',
  'Urology',
  'Gastroenterology',
  'Pulmonology',
];

// App constants
export const APP_NAME = 'MediBook';
export const APP_TAGLINE = '予約を、もっと簡単に / Booking, made simpler';

// Booking constraints
export const BOOKING = {
  ADVANCE_BOOKING_DAYS: 30, // Can book up to 30 days in advance
  CANCELLATION_WINDOW_HOURS: 2, // Can cancel up to 2 hours before
  MAX_PROFILES_PER_USER: 5,
  SLOT_LOCK_DURATION_SECONDS: 300, // 5 minutes
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Time formats
export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const DISPLAY_DATE_FORMAT = 'EEEE, dd MMMM yyyy';
export const DISPLAY_DATETIME_FORMAT = 'EEEE, dd MMMM yyyy HH:mm';
