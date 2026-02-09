module.exports = {
  events: [
    {
      id: 'evt-001',
      slug: 'dance-competition-2026',
      name: 'National Dance Competition 2026',
      category: 'Competition',
      poster: '/images/event-poster-1.jpg',
      location: 'Sleman, Yogyakarta',
      date: '14 Februari 2026',
      description: 'Annual dance competition featuring participants from across Indonesia',
      ticketTypes: [
        { id: 'sina', name: 'Sina Category', price: 260000, tshirtRequired: true },
        { id: 'forest', name: 'Forest Category', price: 150000, tshirtRequired: true },
        { id: 'regular', name: 'Regular Audience', price: 85000, tshirtRequired: false }
      ]
    },
    {
      id: 'evt-002',
      slug: 'love-wall-titans-show',
      name: 'Love Wall Titans Show B',
      category: 'Competition',
      poster: '/images/event-poster-2.jpg',
      location: 'Yogyakarta',
      date: '14 Februari 2026',
      description: 'Dance competition with amazing prizes',
      ticketTypes: [
        { id: 'forest', name: 'Forest Category', price: 260000, tshirtRequired: true },
        { id: 'sina', name: 'Sina Category', price: 260000, tshirtRequired: true }
      ]
    }
  ]
};
