const VALID_PASSWORDS = [
  'ayan@2024',
  'ayan2024',
  '11star',
  '11starclub',
  'admin',
];

export const verifyAdminPassword = (input: string): boolean => {
  if (!input) return false;
  const cleanInput = input.trim().toLowerCase();
  return VALID_PASSWORDS.includes(cleanInput);
};
