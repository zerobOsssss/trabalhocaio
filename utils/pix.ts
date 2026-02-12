
// Função auxiliar para calcular o CRC16 (obrigatório para o padrão EMV do PIX)
function crc16ccitt(text: string) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i);
    crc ^= c << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

// Formata campos do padrão EMV (ID + Tamanho + Valor)
function formatField(id: string, value: string) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

// Remove acentos e caracteres especiais para compatibilidade bancária
function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

interface PixData {
  key: string;
  name: string;
  city: string;
  amount: number;
  id?: string;
}

export const generatePixPayload = ({ key, name, city, amount, id = '***' }: PixData) => {
  const normalizedName = normalizeText(name).substring(0, 25);
  const normalizedCity = normalizeText(city).substring(0, 15);
  const formattedAmount = amount.toFixed(2);
  
  // Montagem do Payload (Padrão Banco Central / EMVCo)
  let payload = 
    formatField('00', '01') +                         // Payload Format Indicator
    formatField('01', '12') +                         // Point of Initiation Method (12 = Dynamic, 11 = Static)
    formatField('26',                                 // Merchant Account Information
      formatField('00', 'BR.GOV.BCB.PIX') +           // GUI
      formatField('01', key)                          // Chave PIX
    ) +
    formatField('52', '0000') +                       // Merchant Category Code
    formatField('53', '986') +                        // Transaction Currency (BRL)
    formatField('54', formattedAmount) +              // Transaction Amount
    formatField('58', 'BR') +                         // Country Code
    formatField('59', normalizedName) +               // Merchant Name
    formatField('60', normalizedCity) +               // Merchant City
    formatField('62',                                 // Additional Data Field Template
      formatField('05', id)                           // Reference Label (TxID)
    ) +
    '6304';                                           // CRC16 ID + Length (o valor vem depois)

  // Calcula o CRC e anexa ao final
  payload += crc16ccitt(payload);

  return payload;
};
