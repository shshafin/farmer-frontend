const MESSAGE_MAP = [
  {
    regex: /commented on your post/i,
    text: "আপনার পোস্টে মন্তব্য করেছে",
  },
  {
    regex: /liked your post/i,
    text: "আপনার পোস্টে লাইক দিয়েছে",
  },
  {
    regex: /unliked your post/i,
    text: "আপনার পোস্ট থেকে লাইক সরিয়েছে",
  },
  {
    regex: /followed you|started following you/i,
    text: "আপনাকে অনুসরণ করেছে",
  },
  {
    regex: /unfollowed you|stopped following you/i,
    text: "আপনাকে আনফলো করেছে",
  },
  {
    regex: /mentioned you/i,
    text: "আপনাকে উল্লেখ করেছে",
  },
];

export const translateNotificationMessage = (message) => {
  if (typeof message !== "string") return "";
  const trimmed = message.trim();
  if (!trimmed) return "";
  for (const rule of MESSAGE_MAP) {
    if (rule.regex.test(trimmed)) {
      return trimmed.replace(rule.regex, rule.text);
    }
  }
  return trimmed;
};
