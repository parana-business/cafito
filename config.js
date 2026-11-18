// Completá los datos reales antes de recibir pedidos.
export const shop = {
  sampleMenu: true,
  whatsappNumber: '', // Código de país y número, únicamente dígitos.
  paymentMethods: ['Efectivo', 'Transferencia'],
  instagramProfile: '',
  products: [
    { id: 'espresso', name: 'Espresso', category: 'calientes', description: 'Corto, intenso y con crema.', price: 2300, image: 'espresso.webp', alt: 'Espresso en vaso de papel amarillo' },
    { id: 'latte', name: 'Latte', category: 'calientes', description: 'Espresso y leche suave.', price: 3400, image: 'latte.webp', alt: 'Vaso de latte con arte en la espuma' },
    { id: 'iced', name: 'Iced Latte', category: 'frios', description: 'Café, leche y mucho hielo.', price: 3900, image: 'iced.webp', alt: 'Iced latte en un vaso transparente con hielo' },
    { id: 'cookie', name: 'Cookie de choco', category: 'acompanar', description: 'Doradita, con chips de chocolate.', price: 2400, image: 'cookie.webp', alt: 'Dos cookies con chips de chocolate' },
  ],
  // Reemplazá la galería de muestra por los posts reales, del más reciente al más antiguo.
  instagramPosts: [
    { image: 'social-1.webp', alt: 'Manos sosteniendo un café en la vereda', url: '' },
    { image: 'social-2.webp', alt: 'Leche vertida sobre un café con arte latte', url: '' },
    { image: 'social-3.webp', alt: 'Cookie dorada junto a un café helado', url: '' },
  ],
};
