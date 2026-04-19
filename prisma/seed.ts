import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorLeave.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.department.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create Super Admin User
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'admin@medibook.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  // Create Patient Users
  const patient1 = await prisma.user.create({
    data: {
      email: 'patient1@example.com',
      name: 'Raj Kumar',
      role: 'PATIENT',
      emailVerified: new Date(),
    },
  });

  const patient2 = await prisma.user.create({
    data: {
      email: 'patient2@example.com',
      name: 'Priya Sharma',
      role: 'PATIENT',
      emailVerified: new Date(),
    },
  });

  console.log('✓ Created patient users');

  // Create Patient Profiles
  const profile1 = await prisma.patientProfile.create({
    data: {
      userId: patient1.id,
      displayName: 'Raj Kumar',
      phone: '9876543210',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      emergencyContactName: 'Anjali Kumar',
      emergencyContactPhone: '9876543211',
      isDefault: true,
    },
  });

  const profile2 = await prisma.patientProfile.create({
    data: {
      userId: patient1.id,
      displayName: 'Anjali Kumar (Wife)',
      phone: '9876543211',
      dateOfBirth: new Date('1992-08-20'),
      gender: 'FEMALE',
      bloodGroup: 'A+',
      allergies: 'Aspirin',
      emergencyContactName: 'Raj Kumar',
      emergencyContactPhone: '9876543210',
      isDefault: false,
    },
  });

  const profile3 = await prisma.patientProfile.create({
    data: {
      userId: patient2.id,
      displayName: 'Priya Sharma',
      phone: '9988776655',
      dateOfBirth: new Date('1988-03-10'),
      gender: 'FEMALE',
      bloodGroup: 'B+',
      isDefault: true,
    },
  });

  console.log('✓ Created patient profiles');

  // Create Hospital Admin Users and Hospitals
  const hospitalAdmin1 = await prisma.user.create({
    data: {
      email: 'admin@lilavati.in',
      name: 'Dr. Vikas Kumar',
      role: 'HOSPITAL_ADMIN',
      emailVerified: new Date(),
    },
  });

  const hospital1 = await prisma.hospital.create({
    data: {
      name: 'Lilavati Hospital',
      slug: 'lilavati-hospital',
      description: 'Premier multi-specialty hospital in Mumbai',
      address: '463 Lal Bahadur Shastri Marg, Bandstand',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400026',
      phone: '02226751000',
      email: 'contact@lilavati.in',
      website: 'https://www.lilavatihospital.com',
      adminUserId: hospitalAdmin1.id,
      isVerified: true,
      isActive: true,
      openingTime: '08:00',
      closingTime: '20:00',
      latitude: 19.067,
      longitude: 72.826,
    },
  });

  const hospitalAdmin2 = await prisma.user.create({
    data: {
      email: 'admin@kokilaben.in',
      name: 'Dr. Meera Patel',
      role: 'HOSPITAL_ADMIN',
      emailVerified: new Date(),
    },
  });

  const hospital2 = await prisma.hospital.create({
    data: {
      name: 'Kokilaben Dhirubhai Ambani Hospital',
      slug: 'kokilaben-hospital',
      description: 'Advanced medical care center',
      address: 'Achyutananda Scindia Marg, Mahim',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400016',
      phone: '02226670000',
      email: 'info@kokilaben.co.in',
      website: 'https://www.kokilabenhospital.com',
      adminUserId: hospitalAdmin2.id,
      isVerified: true,
      isActive: true,
      openingTime: '09:00',
      closingTime: '21:00',
      latitude: 19.035,
      longitude: 72.828,
    },
  });

  const hospitalAdmin3 = await prisma.user.create({
    data: {
      email: 'admin@bombayhospital.in',
      name: 'Dr. Rajesh Verma',
      role: 'HOSPITAL_ADMIN',
      emailVerified: new Date(),
    },
  });

  const hospital3 = await prisma.hospital.create({
    data: {
      name: 'Bombay Hospital',
      slug: 'bombay-hospital',
      description: 'Trusted healthcare provider since 1907',
      address: 'New Marine Lines, Opposite Wankhede Stadium',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400020',
      phone: '02224063000',
      email: 'info@bombayhospital.com',
      website: 'https://www.bombayhospital.com',
      adminUserId: hospitalAdmin3.id,
      isVerified: true,
      isActive: true,
      openingTime: '08:30',
      closingTime: '19:30',
      latitude: 19.015,
      longitude: 72.824,
    },
  });

  console.log('✓ Created hospitals');

  // Create Departments
  const departments = [
    { name: 'General Medicine', iconSlug: 'stethoscope' },
    { name: 'Cardiology', iconSlug: 'heart' },
    { name: 'Dermatology', iconSlug: 'skin' },
    { name: 'Orthopedics', iconSlug: 'bone' },
    { name: 'Pediatrics', iconSlug: 'baby' },
  ];

  const deptMap: Record<string, string> = {};

  for (const hospital of [hospital1, hospital2, hospital3]) {
    for (const dept of departments) {
      const created = await prisma.department.create({
        data: {
          hospitalId: hospital.id,
          ...dept,
        },
      });
      deptMap[`${hospital.id}-${dept.name}`] = created.id;
    }
  }

  console.log('✓ Created departments');

  // Create Doctors
  const doctorNames = [
    { first: 'Amit', last: 'Singh', spec: 'General Practice' },
    { first: 'Neha', last: 'Gupta', spec: 'Cardiology' },
    { first: 'Rohan', last: 'Desai', spec: 'Dermatology' },
    { first: 'Sneha', last: 'Iyer', spec: 'Orthopedics' },
    { first: 'Vikram', last: 'Reddy', spec: 'Pediatrics' },
  ];

  const doctors: any[] = [];
  let doctorCount = 0;

  for (const hospital of [hospital1, hospital2, hospital3]) {
    for (const dept of departments) {
      for (let i = 0; i < 3; i++) {
        const doctorInfo = doctorNames[(doctorCount++) % doctorNames.length];
        const doctor = await prisma.doctor.create({
          data: {
            hospitalId: hospital.id,
            departmentId: deptMap[`${hospital.id}-${dept.name}`],
            name: `Dr. ${doctorInfo.first} ${doctorInfo.last}`,
            title: 'Dr.',
            specialization: doctorInfo.spec,
            experience: Math.floor(Math.random() * 20) + 3,
            consultationFee: Math.floor(Math.random() * 1000) + 300,
            bio: `Experienced ${doctorInfo.spec} with expertise in patient care.`,
            languages: ['English', 'Hindi', 'Marathi'],
            isActive: true,
            rating: parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
            totalReviews: Math.floor(Math.random() * 100) + 10,
          },
        });
        doctors.push(doctor);
      }
    }
  }

  console.log(`✓ Created ${doctors.length} doctors`);

  // Create Doctor Schedules (Mon-Fri, 9am-5pm, 30-min slots)
  for (const doctor of doctors) {
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          maxPatientsPerSlot: 1,
          isActive: true,
        },
      });
    }
  }

  console.log('✓ Created doctor schedules');

  // Create Appointments
  const appointments = [];
  for (let i = 0; i < 10; i++) {
    const doctor = doctors[Math.floor(Math.random() * doctors.length)];
    const patient = i % 2 === 0 ? patient1 : patient2;
    const profile = i % 2 === 0 ? (i < 5 ? profile1 : profile2) : profile3;
    const appointmentDate = addDays(new Date(), Math.floor(Math.random() * 20) + 1);

    // Ensure date is a weekday
    while (appointmentDate.getDay() === 0 || appointmentDate.getDay() === 6) {
      appointmentDate.setDate(appointmentDate.getDate() + 1);
    }

    const hours = Math.floor(Math.random() * 8) + 9;
    const minutes = Math.random() > 0.5 ? '00' : '30';
    const slotTime = `${String(hours).padStart(2, '0')}:${minutes}`;
    const slotEndTime = `${String(hours).padStart(2, '0')}:${String(parseInt(minutes) + 30).padStart(2, '0')}`;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        patientProfileId: profile.id,
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        appointmentDate,
        slotTime,
        slotEndTime,
        status: 'CONFIRMED',
        consultationFee: doctor.consultationFee,
        reason: 'Regular checkup',
        reminderSent: false,
      },
    });
    appointments.push(appointment);
  }

  console.log(`✓ Created ${appointments.length} appointments`);

  // Create Reviews for past appointments
  for (let i = 0; i < Math.min(3, appointments.length); i++) {
    const appt = appointments[i];
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: 'COMPLETED' },
    });

    await prisma.review.create({
      data: {
        appointmentId: appt.id,
        patientProfileId: appt.patientProfileId,
        doctorId: appt.doctorId,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: 'Great doctor, very helpful!',
        isAnonymous: false,
      },
    });
  }

  console.log('✓ Created reviews');

  // Create Notifications
  for (const appointment of appointments.slice(0, 3)) {
    await prisma.notification.create({
      data: {
        userId: appointment.patientId,
        title: 'Appointment Confirmed',
        body: `Your appointment is confirmed for ${format(appointment.appointmentDate, 'MMM dd')}`,
        type: 'APPOINTMENT_CONFIRMED',
        metadata: { appointmentId: appointment.id },
      },
    });
  }

  console.log('✓ Created notifications');

  // Create Tasks
  for (const hospital of [hospital1, hospital2]) {
    await prisma.task.create({
      data: {
        hospitalId: hospital.id,
        title: 'Update patient records',
        description: 'Complete pending patient registrations',
        assignedToUserId: hospital.adminUserId,
        isCompleted: false,
        dueDate: addDays(new Date(), 3),
      },
    });
  }

  console.log('✓ Created tasks');

  console.log('✅ Database seed completed!');
  console.log(`
📊 Summary:
  - Hospitals: 3
  - Departments: 15
  - Doctors: 45
  - Patients: 2
  - Patient Profiles: 3
  - Appointments: ${appointments.length}
  - Reviews: 3
  
🧪 Test Credentials:
  Super Admin: admin@medibook.com
  Patient 1: patient1@example.com (profiles: Raj Kumar, Anjali Kumar)
  Patient 2: patient2@example.com
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
