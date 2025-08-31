export const filterSafety = (data) => {
  if (data.medicines) {
    const otcSafe = data.medicines.filter(med => !med.toLowerCase().includes("prescription"));
    data.medicines = otcSafe;
  }
  data.disclaimer = "This is not medical advice. Consult a doctor for serious symptoms.";
  return data;
};
