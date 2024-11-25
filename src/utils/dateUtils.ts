const numberToWords = (num: number): string => {
  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (num < 20) return units[num];
  
  const digit2 = num % 10;
  const digit1 = Math.floor(num / 10);
  
  return digit2 === 0 ? tens[digit1] : `${tens[digit1]}-${units[digit2]}`;
};

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export const dateToWords = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Convert year to words
  const yearThousands = Math.floor(year / 1000);
  const yearRemainder = year % 1000;
  const yearHundreds = Math.floor(yearRemainder / 100);
  const yearTens = yearRemainder % 100;

  const yearInWords = `${numberToWords(yearThousands)} thousand ${
    yearHundreds > 0 ? `${numberToWords(yearHundreds)} hundred and ` : ''
  }${yearTens > 0 ? numberToWords(yearTens) : ''}`;

  // Format the date
  return `${numberToWords(day)}${getOrdinalSuffix(day)} ${months[month]}, ${yearInWords}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
};
