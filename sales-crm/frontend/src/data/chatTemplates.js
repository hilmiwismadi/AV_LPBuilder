export const chatTemplates = [
  {
    id: 'first-cold-chat',
    category: 'Initial Contact',
    name: 'First Cold Chatting',
    description: 'Verify contact from event',
    template: 'Permisi kak, apakah benar ini kontak {variant_fcc} dari {event_organizer}?',
    variables: ['variant_fcc', 'event_organizer']
  },
  {
    id: 'collaborate-checkup',
    category: 'Partnership',
    name: 'Collaborate Check Up',
    description: 'Ask about sponsorship or collaboration opportunities',
    template: 'Kalau boleh tahu apakah panitia juga membuka peluang sponsorship atau kolaborasi digital, kak?',
    variables: []
  },
  {
    id: 'check-ticketing-with-event',
    category: 'Ticketing',
    name: 'Check Previous Ticketing (with Event)',
    description: 'Ask about previous ticketing system',
    template: 'Kalau event seperti {last_event} dari {event_organizer} untuk management ticketingnya apakah berpartner dengan platform ticket kak?',
    variables: ['last_event', 'event_organizer']
  },
  {
    id: 'check-ticketing-general',
    category: 'Ticketing',
    name: 'Check Previous Ticketing (General)',
    description: 'Ask about ticketing system in general',
    template: 'Kalau dari {event_organizer} untuk management ticketingnya apakah berpartner dengan platform ticket kak?',
    variables: ['event_organizer']
  },
  {
    id: 'demo-link-default',
    category: 'Demo & Proposal',
    name: 'Demo Link (Default)',
    description: 'Send demo link with default message',
    template: 'Kami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
    variables: ['event_organizer', 'link_demo']
  },
  {
    id: 'demo-link-prev-gforms',
    category: 'Demo & Proposal',
    name: 'Demo Link (After GForms)',
    description: 'Send demo after noticing they used Google Forms',
    template: 'Disini kami lihat kalau event sebelumnya pembelian tiket masih manual menggunakan google forms ya kak?\n\nKami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
    variables: ['event_organizer', 'link_demo']
  },
  {
    id: 'demo-link-prev-wa',
    category: 'Demo & Proposal',
    name: 'Demo Link (After WhatsApp)',
    description: 'Send demo after noticing they used WhatsApp confirmation',
    template: 'Disini kami lihat kalau event sebelumnya pembelian tiket masih manual menggunakan konfirmasi via WhatsApp ya kak?\n\nKami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package) terutama untuk komunitas mahasiswa kak, kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
    variables: ['event_organizer', 'link_demo']
  },
  {
    id: 'demo-link-nonstudent',
    category: 'Demo & Proposal',
    name: 'Demo Link (Non-Student)',
    description: 'Send demo link for non-student events',
    template: 'Kami disini mau menawarkan kerja sama platform ticketing. Berikut contoh demo yang telah kami siapkan khusus dari untuk {event_organizer} kakk: {link_demo}\n\nKebetulan sekarang kami lagi ada promo web siap pakai (Partneship Package). kalau dari pihak sponsor/ticketing tertarik untuk event-event {event_organizer}, boleh banget tanya-tanya dulu😁\n\n*attach web screenshot*',
    variables: ['event_organizer', 'link_demo']
  },
  {
    id: 'introduction-default',
    category: 'Introduction',
    name: 'Introduction with Proposal',
    description: 'Introduce yourself and attach proposal',
    template: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management. untuk detail produk kami lampirkan pada file berikut\n\n*attach pdf proposal*',
    variables: []
  },
  {
    id: 'introduction-with-propo',
    category: 'Introduction',
    name: 'Introduction (No Attachment)',
    description: 'Introduce yourself without attachment',
    template: 'Oh iya sebelumnya perkenalkan kak, saya Dzaki dari https://www.instagram.com/arachnova.id/, startup website terkhususnya platform event management.',
    variables: []
  }
];

export const getTemplateVariables = (client) => {
  if (!client) return {};

  return {
    event_organizer: client.eventOrganizer || '[event_organizer]',
    variant_fcc: client.notes || 'salah satu panitia',
    last_event: client.lastEvent || '[last_event]',
    link_demo: client.linkDemo || 'https://arachnova.id/demo',
    pic_name: client.pic1st || client.cp1st || '[PIC Name]',
    startup: client.startup || 'NOVAGATE'
  };
};
