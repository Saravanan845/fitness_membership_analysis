const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const connectDB = require('../config/db');
const User = require('../models/User');
const Member = require('../models/Member');
const Membership = require('../models/Membership');
const Attendance = require('../models/Attendance');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleMembersData = [
  { memberId: 'M1001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210', age: 21, gender: 'Male', visitsLast30Days: 18, classesAttended: 6, daysSinceLastVisit: 2, monthlySpend: 2500, renewed: true },
  { memberId: 'M1002', name: 'Priya Patel', email: 'priya.patel@example.com', phone: '+91 98765 43211', age: 28, gender: 'Female', visitsLast30Days: 13, classesAttended: 4, daysSinceLastVisit: 4, monthlySpend: 2200, renewed: true },
  { memberId: 'M1003', name: 'Rohan Verma', email: 'rohan.verma@example.com', phone: '+91 98765 43212', age: 34, gender: 'Male', visitsLast30Days: 4, classesAttended: 1, daysSinceLastVisit: 19, monthlySpend: 1500, renewed: false },
  { memberId: 'M1004', name: 'Ananya Iyer', email: 'ananya.iyer@example.com', phone: '+91 98765 43213', age: 42, gender: 'Female', visitsLast30Days: 2, classesAttended: 0, daysSinceLastVisit: 32, monthlySpend: 1200, renewed: false },
  { memberId: 'M1005', name: 'Vikram Singh', email: 'vikram.singh@example.com', phone: '+91 98765 43214', age: 25, gender: 'Male', visitsLast30Days: 21, classesAttended: 8, daysSinceLastVisit: 1, monthlySpend: 3000, renewed: true },
  { memberId: 'M1006', name: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '+91 98765 43215', age: 31, gender: 'Female', visitsLast30Days: 7, classesAttended: 2, daysSinceLastVisit: 11, monthlySpend: 1800, renewed: false },
  { memberId: 'M1007', name: 'Kabir Mehta', email: 'kabir.mehta@example.com', phone: '+91 98765 43216', age: 38, gender: 'Male', visitsLast30Days: 5, classesAttended: 1, daysSinceLastVisit: 17, monthlySpend: 1600, renewed: false },
  { memberId: 'M1008', name: 'Diya Nair', email: 'diya.nair@example.com', phone: '+91 98765 43217', age: 23, gender: 'Female', visitsLast30Days: 16, classesAttended: 5, daysSinceLastVisit: 3, monthlySpend: 2600, renewed: true },
  { memberId: 'M1009', name: 'Suresh Menon', email: 'suresh.menon@example.com', phone: '+91 98765 43218', age: 45, gender: 'Male', visitsLast30Days: 1, classesAttended: 0, daysSinceLastVisit: 40, monthlySpend: 1000, renewed: false },
  { memberId: 'M1010', name: 'Kavita Joshi', email: 'kavita.joshi@example.com', phone: '+91 98765 43219', age: 29, gender: 'Female', visitsLast30Days: 9, classesAttended: 3, daysSinceLastVisit: 8, monthlySpend: 1900, renewed: true },
  { memberId: 'M1011', name: 'Arjun Das', email: 'arjun.das@example.com', phone: '+91 98765 43220', age: 36, gender: 'Male', visitsLast30Days: 12, classesAttended: 4, daysSinceLastVisit: 5, monthlySpend: 2300, renewed: true },
  { memberId: 'M1012', name: 'Ritu Kapoor', email: 'ritu.kapoor@example.com', phone: '+91 98765 43221', age: 24, gender: 'Female', visitsLast30Days: 3, classesAttended: 0, daysSinceLastVisit: 25, monthlySpend: 1100, renewed: false },
  { memberId: 'M1013', name: 'Manish Reddy', email: 'manish.reddy@example.com', phone: '+91 98765 43222', age: 40, gender: 'Male', visitsLast30Days: 6, classesAttended: 2, daysSinceLastVisit: 16, monthlySpend: 1700, renewed: false },
  { memberId: 'M1014', name: 'Tanvi Shah', email: 'tanvi.shah@example.com', phone: '+91 98765 43223', age: 27, gender: 'Female', visitsLast30Days: 19, classesAttended: 7, daysSinceLastVisit: 2, monthlySpend: 2800, renewed: true },
  { memberId: 'M1015', name: 'Aditya Kulkarni', email: 'aditya.kulkarni@example.com', phone: '+91 98765 43224', age: 33, gender: 'Male', visitsLast30Days: 8, classesAttended: 2, daysSinceLastVisit: 10, monthlySpend: 1900, renewed: false }
];

const activityOptions = ['Open Gym', 'HIIT Class', 'Yoga & Pilates', 'Spinning', 'Strength Training', 'Zumba'];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Membership.deleteMany({}),
      Attendance.deleteMany({})
    ]);

    // 1. Seed Admin & Staff Users
    console.log('[Seeder] Creating admin and staff accounts...');
    const adminUser = await User.create({
      name: 'System Admin',
      username: 'admin',
      email: 'admin@fittrack.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    await User.create({
      name: 'Sarah Connor (Manager)',
      username: 'manager',
      email: 'manager@fittrack.com',
      password: 'managerpassword123',
      role: 'manager'
    });

    console.log(`[Seeder] Admin created: username=admin, password=adminpassword123`);

    // 2. Seed Members
    console.log('[Seeder] Inserting member records...');
    const createdMembers = [];
    for (const data of sampleMembersData) {
      const member = new Member(data);
      await member.save();
      createdMembers.push(member);
    }
    console.log(`[Seeder] Seeded ${createdMembers.length} members successfully.`);

    // 3. Seed Memberships (Entity Relationships)
    console.log('[Seeder] Creating membership subscription records...');
    for (const member of createdMembers) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 25);
      const endDate = new Date(startDate);

      if (member.renewed) {
        endDate.setDate(endDate.getDate() + 45); // Expires in future
      } else {
        endDate.setDate(endDate.getDate() + (member.daysSinceLastVisit > 20 ? 5 : 20)); // Expired or expiring soon
      }

      let planName = 'Standard Fit';
      if (member.monthlySpend >= 3000) planName = 'Elite VIP';
      else if (member.monthlySpend >= 2500) planName = 'Pro Performance';
      else if (member.monthlySpend <= 1500) planName = 'Basic Pass';

      await Membership.create({
        memberId: member._id,
        planName,
        billingCycle: 'Monthly',
        price: member.monthlySpend,
        startDate,
        endDate,
        status: member.renewed ? 'Active' : (member.daysSinceLastVisit > 20 ? 'Expired' : 'Expiring Soon'),
        autoRenew: member.renewed,
        paymentStatus: 'Paid'
      });
    }

    // 4. Seed Attendance Records spanning past 30 days
    console.log('[Seeder] Generating attendance logs...');
    let totalAttendanceRecords = 0;
    for (const member of createdMembers) {
      const visits = member.visitsLast30Days;
      for (let i = 0; i < visits; i++) {
        const attendanceDate = new Date();
        const daysAgo = Math.floor(Math.random() * 28) + 1;
        attendanceDate.setDate(attendanceDate.getDate() - daysAgo);

        const activity = activityOptions[Math.floor(Math.random() * activityOptions.length)];

        await Attendance.create({
          memberId: member._id,
          date: attendanceDate,
          checkInTime: attendanceDate,
          activityType: activity,
          durationMinutes: [45, 60, 75, 90][Math.floor(Math.random() * 4)]
        });
        totalAttendanceRecords++;
      }
    }

    console.log(`[Seeder] Seeded ${totalAttendanceRecords} attendance log records.`);
    console.log('✅ [Seeder] Database seeding completed successfully!');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ [Seeder Error]', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
