import prisma from "../server/config/prisma.js";

const isValidRuetEmail = (email) => {
  const patterns = [
    /^[0-9]+@student\.ruet\.ac\.bd$/i,       // RUET: 2010033@student.ruet.ac.bd
    /^s[0-9]+@ru\.ac\.bd$/i,                 // RU: s2310876102@ru.ac.bd
    /^[0-9]{7}@[a-z]+\.buet\.ac\.bd$/i,      // BUET: 2212011@cse.buet.ac.bd
    /^[0-9]{10}@student\.sust\.edu$/i,       // SUST: 2024134111@student.sust.edu
  ];
  return patterns.some((regex) => regex.test(email));
};

async function main() {
  console.log('🔍 Checking user emails for RUET validity...');

  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  let updatedCount = 0;

  for (const user of users) {
    const valid = isValidRuetEmail(user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: { isValidRuetMail: valid },
    });

    updatedCount++;
    console.log(
      `→ Updated: ${user.email} => ${valid ? '✅ valid' : '❌ invalid'}`
    );
  }

  console.log(`\n✅ Done! Updated ${updatedCount} users.`);
}

main()
  .catch((e) => {
    console.error('❌ Error updating RUET emails:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
