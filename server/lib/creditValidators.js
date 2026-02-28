export const isGiftCreditValid = (rcc, rentalEndDate = null) => {
  if (!rcc.isGiftCredit) return true;
  if (!rcc.validityDate) return true;
  
  const expiryDate = new Date(rcc.validityDate);
  const checkDate = rentalEndDate ? new Date(rentalEndDate) : new Date();
  
  return checkDate < expiryDate;
};