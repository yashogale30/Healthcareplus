
"use client";
import MedicineForm from "./components/MedicineForm";
import MedicineList from "./components/MedicineList";
import { useMedicines, Medicine } from "./hooks/useMedicines";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
export default function MedicinePage() {
  const [medicines, setMedicines] = useMedicines();

  const uniqueDates = Array.from(
    new Set(medicines.map((med) => med.date))
  ).sort();

  const dateToDayLabel = uniqueDates.reduce((acc, date, idx) => {
    acc[date] = `Day ${idx + 1} (${date})`;
    return acc;
  }, {} as Record<string, string>);

  // Updated to handle bulk addition
  const addMedicines = (newMedicines: Medicine[]) => {
    setMedicines([...medicines, ...newMedicines]);
  };

  const toggleTaken = (id: string) => {
    setMedicines(
      medicines.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const deleteMedicine = (id: string) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#C0A9BD]/5 py-8">
        <Navbar/>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-light text-[#64766A] mb-3 tracking-tight">
            Medicine Tracker
            <span className="text-[#C0A9BD] font-normal">+</span>
          </h1>
          <p className="text-[#64766A]/70 text-lg">Stay consistent with your medication schedule</p>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-[#C0A9BD]/20 p-8 mb-8">
          <h2 className="text-2xl font-light text-[#64766A] mb-6">Create Medicine Schedule</h2>
          <MedicineForm addMedicine={addMedicines} />
        </div>

        {uniqueDates.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-[#C0A9BD]/20 p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl font-light text-[#64766A] mb-2">No medicines added yet</h3>
            <p className="text-[#64766A]/60">Create your first medicine schedule above</p>
          </div>
        )}

        {uniqueDates.map((date) => (
          <div key={date} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-[#C0A9BD]/20 p-8 mb-8">
            <h2 className="text-2xl font-light text-[#64766A] mb-6 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-r from-[#64766A] to-[#C0A9BD] text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                {uniqueDates.indexOf(date) + 1}
              </span>
              {dateToDayLabel[date]}
            </h2>
            <MedicineList
              medicines={medicines.filter((med) => med.date === date)}
              toggleTaken={toggleTaken}
              deleteMedicine={deleteMedicine}
            />
          </div>
        ))}
      </div>
      <Footer/>
    </div>
  );
}