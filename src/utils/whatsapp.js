export const buildOrderText = (state) => {
  const lines = ['PEDIDO'];
  const customer = state.customerData;
  lines.push(`Cliente: ${customer.apellido || ''}, ${customer.nombre || ''}`);
  if (state.customerType === 'cliente') {
    lines.push(`DNI: ${customer.dni || '-'}`);
  } else {
    lines.push(`CUIT/CUIL: ${customer.cuit || '-'}`);
    lines.push(`Localidad: ${customer.localidad || '-'}`);
    lines.push(`Provincia: ${customer.provincia || '-'}`);
    lines.push(`Matrícula: ${customer.matricula || '-'}`);
  }
  lines.push('', 'DETALLE:');
  const grouped = {};
  state.cartItems.forEach((item) => {
    grouped[item.categoria] ??= {};
    grouped[item.categoria][item.sistema] ??= [];
    grouped[item.categoria][item.sistema].push(item);
  });

  Object.entries(grouped).forEach(([cat, systems]) => {
    lines.push(`- ${cat}`);
    Object.entries(systems).forEach(([system, items]) => {
      lines.push(`  - ${system}`);
      items.forEach((item) => {
        const detail = item.subgrupo ? `${item.subgrupo} - ${item.nombre}` : item.nombre;
        lines.push(`    • ${detail} x${item.cantidad}`);
      });
    });
  });

  lines.push('', 'Enviado desde formulario de pedidos.');
  return lines.join('\n');
};

export const buildWhatsAppUrl = (phone, text) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
