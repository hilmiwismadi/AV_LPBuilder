const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedTemplates() {
  const templates = [
    {
      name: 'First Cold Chatting',
      category: 'Initial Contact',
      description: 'Verify contact from event',
      message: 'Permisi kak, apakah benar ini kontak {variant_fcc} dari {event_organizer}?',
      variables: ['variant_fcc', 'event_organizer'],
      tags: ['cold-chat', 'verification']
    },
    {
      name: 'Collaborate Check Up',
      category: 'Partnership',
      description: 'Ask about sponsorship or collaboration opportunities',
      message: 'Kalau boleh tahu apakah panitia juga membuka peluang sponsorship atau kolaborasi digital, kak?',
      variables: [],
      tags: ['partnership', 'collaboration']
    },
    {
      name: 'Check Previous Ticketing (with event)',
      category: 'Ticketing',
      description: 'Ask about previous ticketing system with specific event',
      message: 'Kalau event seperti {last_event} dari {event_organizer} untuk management ticketingnya apakah berpartner dengan platform ticket kak?',
      variables: ['last_event', 'event_organizer'],
      tags: ['ticketing', 'research']
    },
    {
      name: 'Check Previous Ticketing (General)',
      category: 'Ticketing',
      description: 'Ask about ticketing system in general',
      message: 'Kalau dari {event_organizer} untuk management ticketingnya apakah berpartner dengan platform ticket kak?',
      variables: ['event_organizer'],
      tags: ['ticketing', 'research']
    },
    {
      name: 'Demo Link (Default)',
      category: 'Demo & Proposal',
      description: 'Send demo link with default message for students',
      message: 'Kami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
      variables: ['event_organizer', 'link_demo'],
      tags: ['demo', 'proposal', 'student']
    },
    {
      name: 'Demo Link (After GForms)',
      category: 'Demo & Proposal',
      description: 'Send demo after noticing they used Google Forms',
      message: 'Disini kami lihat kalau event sebelumnya pembelian tiket masih manual menggunakan google forms ya kak?\n\nKami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
      variables: ['event_organizer', 'link_demo'],
      tags: ['demo', 'gforms', 'follow-up']
    },
    {
      name: 'Demo Link (After WhatsApp)',
      category: 'Demo & Proposal',
      description: 'Send demo after noticing they used WhatsApp confirmation',
      message: 'Disini kami lihat kalau event sebelumnya pembelian tiket masih manual menggunakan konfirmasi via WhatsApp ya kak?\n\nKami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
      variables: ['event_organizer', 'link_demo'],
      tags: ['demo', 'whatsapp', 'follow-up']
    },
    {
      name: 'Demo Link (Non-Student)',
      category: 'Demo & Proposal',
      description: 'Send demo link for non-student events',
      message: 'Kami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package). kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
      variables: ['event_organizer', 'link_demo'],
      tags: ['demo', 'non-student', 'professional']
    },
    {
      name: 'Introduction with Proposal',
      category: 'Introduction',
      description: 'Introduce yourself and attach proposal',
      message: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management. untuk detail produk kami lampirkan pada file berikut\n\n*attach pdf proposal*',
      variables: [],
      tags: ['introduction', 'proposal']
    },
    {
      name: 'Introduction (No Attachment)',
      category: 'Introduction',
      description: 'Introduce yourself without attachment',
      message: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management.',
      variables: [],
      tags: ['introduction']
    }
  ];

  for (const template of templates) {
    await prisma.chatTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    });
  }

  console.log('Templates seeded successfully!');
  await prisma.$disconnect();
}

seedTemplates().catch(console.error);
