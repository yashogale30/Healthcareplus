"use client";
import { useEffect } from "react";
import MedicineForm from "./components/MedicineForm";
import MedicineList from "./components/MedicineList";
import { useMedicines, Medicine } from "./hooks/useMedicines";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { supabase } from "../../lib/supabaseClient"; // <- new

export default function MedicinePage() {
  const [medicines, setMedicines] = useMedicines();

  // Fetch from Supabase on mount
  useEffect(() => {   
    const fetchMedicines = async () => {
      try {
        const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("date", { ascending: true })
        .order("time::TIME", { ascending: true });  // Cast in query [web:41]


        if (error) {
          console.error("supabase fetch error:", error);
          return;
        }
        if (data) {
          // supabase returns date as string or Date depending on client settings
          // ensure date is YYYY-MM-DD string
          const normalized = data.map((d) => ({
            ...d,
            date: typeof d.date === "string" ? d.date : (d.date as unknown as string),
          }));
          setMedicines(normalized);
        }
      } catch (err) {
        console.error("fetchMedicines err", err);
      }
    };

    fetchMedicines();

    // optionally: subscribe to realtime changes (advanced)
  }, [setMedicines]);

  const addMedicines = async (newMedicines: Medicine[]) => {
    // optimistic update
    setMedicines((prev) => [...prev, ...newMedicines]);

    try {
      // send inserts to supabase. Use insert array; ensure id/date types match DB
      const payload = newMedicines.map((m) => ({
        id: m.id,
        name: m.name,
        time: m.time,
        dosage: m.dosage,
        date: m.date, // YYYY-MM-DD
        taken: m.taken,
      }));

      const { data, error } = await supabase.from("medicines").insert(payload);

      if (error) {
        console.error("supabase insert error:", error);
        // revert optimistic update or show error
        setMedicines((prev) => prev.filter((p) => !payload.some((x) => x.id === p.id)));
        alert("Failed to save medicines to database.");
      } else {
        // optional: replace with returned rows (to sync any DB defaults)
        // map returned data to your shape if needed
      }
    } catch (err) {
      console.error("addMedicines err", err);
    }
  };

  const toggleTaken = async (id: string) => {
    // optimistic state update
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m)));

    try {
      // read current state to decide new taken value (or pass toggled value)
      const item = medicines.find((m) => m.id === id);
      const newTaken = item ? !item.taken : true;
      const { error } = await supabase.from("medicines").update({ taken: newTaken }).eq("id", id);

      if (error) {
        console.error("supabase update error:", error);
        // revert if required
        setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: item?.taken ?? false } : m)));
        alert("Failed to update status in database.");
      }
    } catch (err) {
      console.error("toggleTaken err", err);
    }
  };

  const deleteMedicine = async (id: string) => {
    // optimistic remove
    const old = medicines;
    setMedicines((prev) => prev.filter((m) => m.id !== id));

    try {
      const { error } = await supabase.from("medicines").delete().eq("id", id);
      if (error) {
        console.error("supabase delete error:", error);
        setMedicines(old); // revert
        alert("Failed to delete from database.");
      }
    } catch (err) {
      console.error("deleteMedicine err", err);
      setMedicines(old);
    }
  };

  // rest of your render code stays the same (uniqueDates, mapping, etc.)
  const uniqueDates = Array.from(new Set(medicines.map((med) => med.date))).sort();
  const dateToDayLabel = uniqueDates.reduce((acc, date, idx) => {
    acc[date] = `Day ${idx + 1} (${date})`;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] via-white to-[#C0A9BD]/5 py-8">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6">
        {/* header & form */}
        <div className="bg-white/70 ... mb-8">
          <h2 className="text-2xl ...">Create Medicine Schedule</h2>
          <MedicineForm addMedicine={addMedicines} />
        </div>

        {uniqueDates.length === 0 && (
          <div className="bg-white/70 ... p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl ...">No medicines added yet</h3>
            <p className="text-[#64766A]/60">Create your first medicine schedule above</p>
          </div>
        )}

        {uniqueDates.map((date) => (
          <div key={date} className="bg-white/70 ... p-8 mb-8">
            <h2 className="text-2xl ...">
              <span className="w-10 h-10 ...">
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
      <Footer />
    </div>
  );
}
