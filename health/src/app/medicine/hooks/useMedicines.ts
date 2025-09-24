
import { useState, useEffect } from "react";

export interface Medicine {
  id: string;
  name: string;
  time: string;
  dosage: string;
  date: string;
  taken: boolean;
}

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem("medicines");
    if (stored) setMedicines(JSON.parse(stored));
  }, []);
  useEffect(() => {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }, [medicines]);
  return [medicines, setMedicines] as const;
}