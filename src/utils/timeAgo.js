import { format, register } from "timeago.js";

const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

export const toBanglaDigits = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().replace(/\d/g, (d) => BANGLA_DIGITS[d]);
};

const localeFunc = (number, index, total_sec) => {
  const bnNumber = toBanglaDigits(number);
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
    default: {
      const bnTotal = toBanglaDigits(total_sec);
      return [`${bnTotal} সেকেন্ড আগে`, `${bnTotal} সেকেন্ডের মধ্যে`];
    }
  }
};

register('bn', localeFunc);

export const formatTimeAgo = (date) => {
  if (!date) return "সময় তথ্য নেই";
  try {
    return format(date, "bn");
  } catch (error) {
    return "সময় তথ্য নেই";
  }
};
