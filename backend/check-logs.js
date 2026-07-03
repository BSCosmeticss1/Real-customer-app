
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching latest 10 message logs...');
  const logs = await prisma.messageLog.findMany({
    orderBy: { sentAt: 'desc' },
    take: 10,
  });

  console.log('\n=== Message Logs ===');
  logs.forEach((log, index) => {
    console.log(`\n--- Log ${index + 1} ---`);
    console.log('ID:', log.id);
    console.log('Contact Name:', log.contactName);
    console.log('Platform:', log.platform);
    console.log('Status:', log.status);
    console.log('Error:', log.error);
    console.log('Sent At:', log.sentAt);
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Error fetching logs:', e);
  prisma.$disconnect();
  process.exit(1);
});
