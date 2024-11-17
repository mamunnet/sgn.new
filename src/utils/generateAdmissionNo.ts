export const generateAdmissionNo = () => {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SGN${year}${randomNum}`;
};