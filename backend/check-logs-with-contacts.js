
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching latest 10 message logs with contacts...');
  const logs = await prisma.messageLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 10,
    include: { contact: true },
  });

  console.log('\n=== Message Logs ===');
  logs.forEach((log, index) => {
    console.log(`\n--- Log ${index + 1} ---`);
    console.log('ID:', log.id);
    console.log('Contact Name:', log.contactName);
    console.log('Platform:', log.platform);
    console.log('Status:', log.status);
    console.log('External ID (Meta WAM ID:', log.externalId);
    console.log('Error:', log.error);
    console.log('Sent At:', log.sentAt);
    
    if (log.contact) {
      console.log('\n--- Contact Details ---');
      console.log('Phone:', log.contact.phone);
      console.log('WhatsApp:', log.contact.whatsapp);
      console.log('Facebook:', log.contact.facebook);
      console.log('Instagram:', log.contact.instagram);
    }
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error fetching logs:', e);
  prisma.$disconnect();
  process.exit(1);
});
