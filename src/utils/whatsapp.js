export const buildOrderText = (state) => {
  const lines = ['PEDIDO DE IMPLANTES DENTALES'];
  const customer = state.customerData;

  lines.push(`Cliente: ${customer.apellido || ''}, ${customer.nombre || ''}`);

  if (state.customerType === 'cliente') {
    lines.push(`DNI: ${customer.dni || '-'}`);
  } else {
    lines.push(`CUIL: ${customer.cuil || '-'}`);
    lines.push(`Localidad: ${customer.localidad || '-'}`);
    lines.push(`Provincia: ${customer.provincia || '-'}`);
    lines.push(`Matrícula profesional: ${customer.matricula || '-'}`);
  }

  lines.push('', 'DETALLE:');

  const grouped = state.cartItems.reduce((acc, item) => {
    acc[item.sistema] ??= [];
    acc[item.sistema].push(item);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([system, items]) => {
    lines.push(`- ${system}`);
    items.forEach((item) => {
      lines.push(`  • ${item.diametro} / ${item.largo} x${item.cantidad}`);
    });
  });

  lines.push('', 'Sin precios. Enviado desde formulario web.');
  return lines.join('\n');
};

export const buildWhatsAppUrl = (phone, text) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
