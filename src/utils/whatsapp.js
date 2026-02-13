export const buildOrderText = (state) => {

  return lines.join('\n');
};

export const buildWhatsAppUrl = (phone, text) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
