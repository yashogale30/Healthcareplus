// Ensures AI output is safe and non-prescriptive
export const filterSafety = (data) => {
    if (data.medicines) {
        // Remove any prescription-only drugs
        const otcSafe = data.medicines.filter(med => !med.toLowerCase().includes("prescription"));
        data.medicines = otcSafe;
    }

    // Always add disclaimer
    data.disclaimer = "This is not medical advice. Consult a doctor for serious symptoms.";
    return data;
};
