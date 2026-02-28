export const isValidRuetEmail = (email) => {
  const patterns = [
    /^[0-9]+@student\.ruet\.ac\.bd$/i,       // RUET: 2010033@student.ruet.ac.bd
    /^s[0-9]+@ru\.ac\.bd$/i,                 // RU: s2310876102@ru.ac.bd
    /^[0-9]{7}@[a-z]+\.buet\.ac\.bd$/i,      // BUET: 2212011@cse.buet.ac.bd
    /^[0-9]{10}@student\.sust\.edu$/i,       // SUST: 2024134111@student.sust.edu
  ];

  return patterns.some((regex) => regex.test(email));
};
