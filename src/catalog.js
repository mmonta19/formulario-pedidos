const mapLengths = (lengths, suffix = 'mm') => lengths.map((l) => `${l} ${suffix}`);

const monoBasalLengths = {
  'Ø3.5': ['10 mm', '12 mm', '15 mm', '18 mm', '21 mm', '23 mm', '24 mm', '26 mm', '28 mm', '24 C14', '26 C16', '28 C18'],
  'Ø4.5': ['10 mm', '12 mm', '15 mm', '18 mm', '21 mm', '23 mm', '24 mm', '26 mm', '28 mm', '24 C14', '26 C15', '28 C18'],
  'Ø5.5': ['10 mm', '12 mm', '15 mm', '18 mm'],
  'Ø6.5': ['10 mm', '12 mm', '15 mm'],
  'Ø8.5': ['10 mm', '12 mm', '15 mm']
};

const compresivoLengths = {
  'Ø3.0': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm'],
  'Ø3.5': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm'],
  'Ø4.0': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm'],
  'Ø4.5': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm'],
  'Ø5.0': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm'],
  'Ø5.5': ['6 mm', '8 mm', '10 mm', '11.5 mm', '13 mm', '15 mm', '18 mm', '20 mm']
};

export const CATALOG = [
  {
    key: 'implantes',
    label: 'Implantes',
    systems: [
      {
        label: 'Hexágono Interno',
        products: [
          'Ø3.0 x 6.5 mm','Ø3.0 x 8 mm','Ø3.0 x 10 mm','Ø3.0 x 11.5 mm','Ø3.0 x 13 mm','Ø3.0 x 16 mm',
          'Ø3.75 x 6.5 mm','Ø3.75 x 8 mm','Ø3.75 x 10 mm','Ø3.75 x 11.5 mm','Ø3.75 x 13 mm','Ø3.75 x 16 mm',
          'Ø4.2 x 6.5 mm','Ø4.2 x 8 mm','Ø4.2 x 10 mm','Ø4.2 x 11.5 mm','Ø4.2 x 13 mm','Ø4.2 x 16 mm',
          'Ø5.0 x 6.5 mm','Ø5.0 x 8 mm','Ø5.0 x 10 mm','Ø5.0 x 11.5 mm','Ø5.0 x 13 mm','Ø5.0 x 16 mm'
        ]
      },
      {
        label: 'Hexágono Externo',
        groups: [
          { label: 'Ø3.30 (Plataforma Ø3.4)', products: mapLengths(['8.5','10','11.5','13','15']) },
          { label: 'Ø3.75 (Plataforma Ø4.1)', products: mapLengths(['8.5','10','11.5','13','15']) },
          { label: 'Ø4.0 (Plataforma Ø4.1)', products: mapLengths(['6','8.5','10','11.5','13','15']) },
          { label: 'Ø5.0 (Plataforma Ø5.0)', products: mapLengths(['8.5','10','11.5','13','15']) }
        ]
      },
      {
        label: 'Cono Morse',
        products: [
          'Ø3.30 x 8 mm','Ø3.30 x 10 mm','Ø3.0 x 11.5 mm','Ø3.30 x 13 mm','Ø3.30 x 16 mm',
          'Ø3.75 x 8 mm','Ø3.75 x 10 mm','Ø3.75 x 11.5 mm','Ø3.75 x 13 mm','Ø3.75 x 16 mm',
          'Ø4.2 x 8 mm','Ø4.2 x 10 mm','Ø4.2 x 11.5 mm','Ø4.2 x 13 mm','Ø4.2 x 16 mm',
          'Ø5.0 x 8 mm','Ø5.0 x 10 mm','Ø5.0 x 11.5 mm','Ø5.0 x 13 mm','Ø5.0 x 16 mm'
        ]
      },
      {
        label: 'Monopieza',
        groups: [
          { label: 'Ø3.0', products: mapLengths(['6','8','10','11.5','13','15','18','20']) },
          { label: 'Ø3.5', products: mapLengths(['6','8','10','11.5','13','15','18','20']) },
          { label: 'Ø4.0', products: mapLengths(['6','8','10','11.5','13','15','18','20']) },
          { label: 'Ø4.5', products: mapLengths(['6','8','10','11.5','13','15','18','20']) },
          { label: 'Ø5.0', products: mapLengths(['6','8','10','11.5','13']) },
          { label: 'Ø5.5', products: mapLengths(['6','8','10','11.5','13']) }
        ]
      },
      {
        label: 'Monopieza Basal',
        groups: [
          { label: 'Pulido', groups: Object.entries(monoBasalLengths).map(([k, v]) => ({ label: k, products: v })) },
          { label: 'Tratamiento superficial', groups: Object.entries(monoBasalLengths).map(([k, v]) => ({ label: k, products: v })) }
        ]
      },
      {
        label: 'Compresivo Multiunit',
        groups: Object.entries(compresivoLengths).map(([diameter, lengths]) => ({
          label: diameter,
          groups: [
            { label: 'Estándar', products: lengths },
            { label: 'C3', products: lengths.map((l) => `${l} C3`) }
          ]
        }))
      }
    ]
  },
  {
    key: 'componentes-analogicos',
    label: 'Componentes protésicos analógicos',
    systems: [
      {
        label: 'Hexágono Interno',
        groups: [
          { label: 'Ucla Calcinable', products: ['Rotacional', 'Anti-Rotacional'] },
          { label: 'Análogo de Titanio', products: ['Análogo de Titanio'] },
          { label: 'BallAttach y Cazoleta', products: ['H1', 'H2', 'H3', 'H4'] },
          { label: 'Tapa de cicatrización', products: ['H1', 'H2', 'H3', 'H4'] },
          { label: 'Transfer cubeta', products: ['Abierta', 'Cerrada'] },
          { label: 'Pilar recto c/tornillo', products: ['H1', 'H2', 'H3', 'H4'] },
          { label: 'Minipilar Angulado H.I + Llave transportadora + tornillo', products: ['1.5mm', '2.5mm', '3.5mm'] },
          { label: 'Pilar angulado c/tornillo', products: ['15°', '25°'] }
        ]
      },
      {
        label: 'Hexágono Externo',
        groups: [
          {
            label: 'Ucla calcinable',
            groups: [
              { label: 'Rotacional', groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({ label: p, products: ['H1', 'H2', 'H3', 'H4'] })) },
              { label: 'Anti-rotacional', groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({ label: p, products: ['H1', 'H2', 'H3', 'H4'] })) }
            ]
          },
          { label: 'Tapa de cicatrización', groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({ label: p, products: ['H1', 'H2', 'H3'] })) },
          { label: 'Transfer cubeta', groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({ label: p, products: ['Abierta', 'Cerrada'] })) },
          { label: 'Ball attach', groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({ label: p, products: ['H1', 'H2', 'H3', 'H4'] })) },
          {
            label: 'Pilar recto c/tornillo',
            groups: ['Plat Ø3.4', 'Plat Ø4.1', 'Plat Ø5.0'].map((p) => ({
              label: p,
              products: ['H1 Hexagonal', 'H1 Cuadrado', 'H2 Hexagonal', 'H2 Cuadrado', 'H3 Hexagonal', 'H3 Cuadrado']
            }))
          },
          { label: 'Tornillo protésico', products: ['Cuadrado', 'Hexagonal'] },
          { label: 'Pilar angulado c/tornillo', groups: [{ label: 'Plat Ø4.1', products: ['15°', '25°'] }] }
        ]
      },
      {
        label: 'Cono Morse',
        groups: [
          {
            label: 'Pilares estándar',
            groups: [
              { label: 'Ø3.3', products: ['Ø3.3x0.8x4','Ø3.3x1.5x4','Ø3.3x2.5x4','Ø3.3x3.5x4','Ø3.3x4.5x4','Ø3.3x5.5x4','Ø3.3x0.8x6','Ø3.3x1.5x6','Ø3.3x2.5x6','Ø3.3x3.5x6','Ø3.3x4.5x6','Ø3.3x5.5x6'] },
              { label: 'Ø4.5', products: ['Ø4.5x0.8x4','Ø4.5x1.5x4','Ø4.5x2.5x4','Ø4.5x3.5x4','Ø4.5x4.5x4','Ø4.5x5.5x4','Ø4.5x0.8x6','Ø4.5x1.5x6','Ø4.5x2.5x6','Ø4.5x3.5x6','Ø4.5x4.5x6','Ø4.5x5.5x6'] }
            ]
          },
          {
            label: 'Pilares c/tornillo pasante',
            groups: [
              { label: 'Ø3.3', products: ['Ø3.3x0.8x4','Ø3.3x1.5x4','Ø3.3x2.5x4','Ø3.3x3.5x4','Ø3.3x4.5x4','Ø3.3x5.5x4','Ø3.3x0.8x6','Ø3.3x1.5x6','Ø3.3x2.5x6','Ø3.3x3.5x6','Ø3.3x4.5x6','Ø3.3x5.5x6'] },
              { label: 'Ø4.5', products: ['Ø4.5x0.8x4','Ø4.5x1.5x4','Ø4.5x2.5x4','Ø4.5x3.5x4','Ø4.5x4.5x4','Ø4.5x5.5x4','Ø4.5x0.8x6','Ø4.5x1.5x6','Ø4.5x2.5x6','Ø4.5x3.5x6','Ø4.5x4.5x6','Ø4.5x5.5x6'] }
            ]
          },
          { label: 'Pilares de cicatrización', groups: [{ label: 'Ø3.3', products: ['H1.5', 'H2.5', 'H3.5'] }, { label: 'Ø4.5', products: ['H1.5', 'H2.5', 'H3.5'] }] },
          { label: 'Análogo Universal', products: ['Análogo Universal'] },
          { label: 'BallAttach y Cazoleta', products: ['H1.5', 'H2.5', 'H3.5', 'H4.5', 'H5.5'] }
        ]
      },
      {
        label: 'Monopieza',
        groups: [
          { label: 'Análogo', products: ['Análogo'] },
          { label: 'Ucla Calcinable', products: ['Ø3.0', 'Ø3.5', 'Ø4.0', 'Ø4.5', 'Ø5.0'] },
          { label: 'Transfer Rotacional', products: ['Transfer Rotacional'] }
        ]
      },
      {
        label: 'Compresivo Multiunit',
        groups: [
          { label: 'Transfer Cubeta Abierta', products: ['Transfer Cubeta Abierta'] },
          { label: 'Cicatrizal c/tornillo', products: ['H2', 'H3', 'H4'] },
          { label: 'Ballattach y cazoleta', products: ['H2', 'H3', 'H4'] },
          { label: 'Pilar Recto c/tornillo', products: ['Pilar Recto c/tornillo'] }
        ]
      }
    ]
  },
  {
    key: 'componentes-digitales',
    label: 'Componentes digitales',
    systems: []
  },
  {
    key: 'herramental',
    label: 'Instrumental',
    systems: [
      { label: 'Fresa Lanza', products: ['Corta', 'Larga'] },
      { label: 'Fresa Lanza Guiada', products: ['Corta', 'Larga'] },
      { label: 'Fresa Helicoidal', products: ['Ø2.0', 'Ø2.5', 'Ø2.8', 'Ø3.2', 'Ø3.6', 'Ø4.0', 'Ø4.3', 'Ø4.6', 'Ø5.0', 'Ø5.3'] },
      { label: 'Kit 3 Expansores de Hueso', products: ['Kit 3 Expansores de Hueso'] },
      { label: 'Kit 3 Expansores de Hueso - Monopieza', products: ['Kit 3 Expansores de Hueso - Monopieza'] },
      { label: 'Torquimetro Dinamometrico', products: ['Torquimetro Dinamometrico'] },
      { label: 'Mango Rigido', products: ['Mango Rigido'] },
      { label: 'Mango para angulacion de Pilar MP', products: ['Mango para angulacion de Pilar MP'] },
      { label: 'Extractor de Raiz residual', products: ['Extractor de Raiz residual'] },
      { label: 'Driver Retractil', products: ['Azul', 'Verde'] },
      { label: 'Punta Driver para Monopieza', products: ['Larga', 'Corta'] },
      { label: 'Llave conectora para contrangulo MP', products: ['Larga', 'Corta'] },
      { label: 'Destornillador Digital Cuadrado', products: ['Corto 0.050', 'Estándar 0.050', 'Largo 0.050', 'Extra Largo 0.050'] },
      { label: 'Destornillador Digital Hexagonal', products: ['Corto 0.048', 'Estandar 0.048', 'Largo 0.048', 'Extra Largo 0.048'] },
      { label: 'Destornillador Cuadrado p/Torquímetro', products: ['Corto 0.050', 'Estándar 0.050', 'Largo 0.050', 'Extra Largo 0.050'] },
      { label: 'Destornillador Hexagonal p/Torquímetro', products: ['Corto 0.048', 'Estandar 0.048', 'Largo 0.048', 'Extra Largo 0.048'] },
      { label: 'Prolongador de Fresa', products: ['Prolongador de Fresa'] },
      { label: 'Prolongador 4x4', products: ['Corto', 'Largo'] },
      { label: 'Conctor para torquímetro CMHI', products: ['Conctor para torquímetro CMHI'] },
      { label: 'Punch', products: ['3.4mm', '4.1mm', '5.0mm'] },
      { label: 'Anilla para Guia', products: ['Ø5,5-Ø2,1', 'Ø5,5-Ø4,2', 'Ø4,1-Ø3,0'] },
      { label: 'Llave conectora Monopieza', products: ['Corta', 'Larga'] },
      { label: 'Llave conectora CMU', products: ['Corta', 'Larga'] }
    ]
  }
];
