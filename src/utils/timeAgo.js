import { format, register } from 'timeago.js';

const toBanglaDigit = (number) => {
  return number.toString().replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

const localeFunc = (number, index, total_sec) => {
  const bnNumber = toBanglaDigit(number);
  switch (index) {
    case 0: return ['এইমাত্র', 'এইমাত্র'];
    case 1: return [`${bnNumber} সেকেন্ড আগে`, `${bnNumber} সেকেন্ডের মধ্যে`];
    case 2: return ['১ মিনিট আগে', '১ মিনিটের মধ্যে'];
    case 3: return [`${bnNumber} মিনিট আগে`, `${bnNumber} মিনিটের মধ্যে`];
    case 4: return ['১ ঘণ্টা আগে', '১ ঘণ্টার মধ্যে'];
    case 5: return [`${bnNumber} ঘণ্টা আগে`, `${bnNumber} ঘণ্টার মধ্যে`];
    case 6: return ['১ দিন আগে', '১ দিনের মধ্যে'];
    case 7: return [`${bnNumber} দিন আগে`, `${bnNumber} দিনের মধ্যে`];
    case 8: return ['১ সপ্তাহ আগে', '১ সপ্তাহের মধ্যে'];
    case 9: return [`${bnNumber} সপ্তাহ আগে`, `${bnNumber} সপ্তাহের মধ্যে`];
    case 10: return ['১ মাস আগে', '১ মাসের মধ্যে'];
    case 11: return [`${bnNumber} মাস আগে`, `${bnNumber} মাসের মধ্যে`];
    case 12: return ['১ বছর আগে', '১ বছরের মধ্যে'];
    case 13: return [`${bnNumber} বছর আগে`, `${bnNumber} বছরের মধ্যে`];
    default: return [total_sec + ' সেকেন্ড আগে', total_sec + ' সেকেন্ডের মধ্যে'];
  }
};

register('bn', localeFunc);

export const formatTimeAgo = (date) => {
  return format(date, 'bn');
};
