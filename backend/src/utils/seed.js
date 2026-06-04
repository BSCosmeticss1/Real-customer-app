require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const seed = async () => {
  try {
    console.log('Connecting to PostgreSQL via Prisma...');
    await prisma.$connect();

    // Create admin user
    const email = 'admin@messagepro.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    let adminUser;
    
    if (!existing) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Admin user created: admin@messagepro.com / Admin@123');
    } else {
      adminUser = existing;
      console.log('ℹ️ Admin user already exists');
    }

    // Seed contacts
    const contactCount = await prisma.contact.count({ where: { userId: adminUser.id } });
    if (contactCount === 0) {
      await prisma.contact.createMany({
        data: [
          { userId: adminUser.id, name: 'Adaeze Obi', company: 'TechNigeria Ltd', phone: '+2348012345678', whatsapp: '+2348012345678', instagram: '@adaeze_obi', facebook: 'adaeze.obi', tiktok: '@adaeze', tags: ['VIP'], segment: 'Customer', source: 'manual' },
          { userId: adminUser.id, name: 'Emeka Chukwu', company: 'Lagos Supplies', phone: '+2348023456789', whatsapp: '+2348023456789', facebook: 'emeka.chukwu', tags: ['Lead'], segment: 'Prospect', source: 'manual' },
          { userId: adminUser.id, name: 'Ngozi Eze', phone: '+2348034567890', whatsapp: '+2348034567890', tags: [], segment: 'Customer', source: 'manual' },
          { userId: adminUser.id, name: 'Kemi Adesanya', company: 'Adesanya Group', phone: '+2348045678901', whatsapp: '+2348045678901', instagram: '@kemi_a', tags: ['VIP', 'Premium'], segment: 'Customer', source: 'manual' },
          { userId: adminUser.id, name: 'Tunde Bakare', phone: '+2348056789012', tags: [], segment: 'Lead', source: 'manual' },
        ],
      });
      console.log('✅ Sample contacts created');
    }

    // Seed templates
    const templateCount = await prisma.messageTemplate.count({ where: { userId: adminUser.id } });
    if (templateCount === 0) {
      await prisma.messageTemplate.createMany({
        data: [
          { userId: adminUser.id, name: 'Welcome Message', content: 'Hi {{FirstName}}! 👋 Welcome to {{Company}}. We\'re excited to have you on board! Feel free to reach out anytime.', platform: 'whatsapp', variables: ['FirstName', 'Company'] },
          { userId: adminUser.id, name: 'Promotional Offer', content: '🔥 Exclusive deal just for you, {{FirstName}}! Get 20% off your next order. Limited time only. Reply YES to claim!', platform: 'all', variables: ['FirstName'] },
          { userId: adminUser.id, name: 'Follow Up', content: 'Hi {{FirstName}}, just checking in! How can we help you today? We\'re always here to assist. 😊', platform: 'facebook', variables: ['FirstName'] },
          { userId: adminUser.id, name: 'Payment Reminder', content: 'Dear {{FirstName}}, this is a friendly reminder that your invoice is due. Please make payment at your earliest convenience. Thank you!', platform: 'whatsapp', variables: ['FirstName'] },
        ],
      });
      console.log('✅ Sample templates created');
    }

    console.log('\n🚀 Seed completed successfully!');
    console.log('Login credentials: admin@messagepro.com / Admin@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
