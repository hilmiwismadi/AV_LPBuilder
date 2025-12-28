import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create chat templates
  const templates = [
    {
      name: 'First Cold Chatting - Umum',
      category: 'First Contact',
      message: 'Permisi kak, apakah benar ini kontak salah satu panitia dari [event_organizer]?',
      variables: ['event_organizer', 'variant_fcc'],
    },
    {
      name: 'First Cold Chatting - Sponsor/Partner',
      category: 'First Contact',
      message: 'Permisi kak, apakah benar ini kontak panitia divisi sponsor/partnership dari [event_organizer]?',
      variables: ['event_organizer'],
    },
    {
      name: 'Collaborate Check Up',
      category: 'Follow Up',
      message: 'Kalau boleh tahu apakah panitia juga membuka peluang sponsorship atau kolaborasi digital, kak?',
      variables: [],
    },
    {
      name: 'Introduction with Proposal - Default',
      category: 'Introduction',
      message: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management. untuk detail produk kami lampirkan pada file berikut\n*attach pdf proposal*',
      variables: [],
    },
    {
      name: 'Introduction with Proposal - Without Attachment',
      category: 'Introduction',
      message: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management.',
      variables: [],
    },
    {
      name: 'Link Demo',
      category: 'Proposal',
      message: 'Kami disini mau menawarkan kerja sama platform pendaftaran (seperti google form) namun terintegrasi dengan sistem pembayaran dan manajemen data secara otomatis kak. Berikut contoh demo website yang telah kami siapkan khusus dari untuk [event_organizer] kakk: [link_demo]\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas pelajar/mahasiswa kak sehingga panitia tidak perlu membayar namun sistem kerjasama kami melakukan charge tambahan kepada pendaftar. Kalau dari pihak panitia [event_organizer] tertarik untuk bekerja sama?',
      variables: ['event_organizer', 'link_demo'],
    },
    {
      name: 'Follow Up - General',
      category: 'Follow Up',
      message: 'kalau dari pihak sponsor/ticketing tertarik untuk event-event [event_organizer], boleh banget tanya-tanya dulu😁\nkalau mungkin ada pertanyaan atau hal yang dapat kami perjelas, jangan ragu tanyakan pada kamu ya kak 😁',
      variables: ['event_organizer'],
    },
  ];

  for (const template of templates) {
    await prisma.chatTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    });
    console.log(`✓ Created template: ${template.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
