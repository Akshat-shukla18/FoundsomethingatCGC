// Lightweight campus decorum filter to prevent abuse and harassment

const BLOCKED_WORDS = [
  'abuse', 'harass', 'idiot', 'stupid', 'bastard', 'bitch', 'asshole', 'fuck', 'shit', 'cunt', 'dick',
  'motherfucker', 'kill you', 'die', 'threat', 'scam', 'fraud', 'steal', 'rob', 'slut', 'whore',
  'chutiya', 'madarchod', 'behenchod', 'harami', 'kamina', 'saale', 'gandu', 'bhosdike'
];

const checkMessageDecorum = (text) => {
  if (!text || typeof text !== 'string') return { isClean: true };

  const lower = text.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      return {
        isClean: false,
        reason: `Your message contains words that violate campus decorum rules ("${word}"). Please communicate politely and respectfully.`
      };
    }
  }

  return { isClean: true };
};

module.exports = {
  checkMessageDecorum
};
