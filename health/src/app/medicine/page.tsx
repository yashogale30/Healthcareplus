// MedicinePage.tsx
"use client";
import { useEffect } from "react";
import MedicineForm from "./components/MedicineForm";
import MedicineList from "./components/MedicineList";
import { useMedicines, Medicine } from "./hooks/useMedicines";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { supabase } from "../../lib/supabaseClient";

export default function MedicinePage() {
  const [medicines, setMedicines] = useMedicines();

  // Utility: normalize a DB row's date -> YYYY-MM-DD
  const normalizeRow = (d: any): Medicine => ({
    ...d,
    date: typeof d.date === "string" ? d.date.split("T")[0] : String(d.date),
  });

  // Fetch from Supabase on mount
  useEffect(() => {
    let mounted = true;
    const fetchMedicines = async () => {
      try {
        const { data, error } = await supabase
          .from("medicines")
          .select("*")
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        console.log("fetchMedicines result:", { data, error });

        if (error) {
          console.error("supabase fetch error:", error);
          return;
        }
        if (data && mounted) {
          const normalized = data.map((d: any) => normalizeRow(d));
          setMedicines(normalized);
        }
      } catch (err) {
        console.error("fetchMedicines err", err);
      }
    };

    fetchMedicines();

    // Realtime subscription (keeps UI synced across clients)
    // Optional: remove if you don't want realtime
    const channel = supabase
      .channel("public:medicines")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medicines" },
        (payload) => {
          // payload contains { eventType, new, old }
          console.log("realtime payload:", payload);
          const evt = payload.eventType;
          if (evt === "INSERT" && payload.new) {
            setMedicines((prev) => {
              // avoid duplicates
              if (prev.some((p) => p.id === payload.new.id)) return prev;
              return [...prev, normalizeRow(payload.new)].sort((a, b) =>
                a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
              );
            });
          } else if (evt === "UPDATE" && payload.new) {
            setMedicines((prev) => prev.map((p) => (p.id === payload.new.id ? normalizeRow(payload.new) : p)));
          } else if (evt === "DELETE" && payload.old) {
            setMedicines((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [setMedicines]);

  // Add medicines: wait for DB, sync with returned rows
  const addMedicines = async (newMedicines: Medicine[]) => {
    try {
      // Prepare payload - DO NOT send client id unless necessary (let DB generate it)
      const payload = newMedicines.map((m) => ({
        name: m.name,
        time: m.time,
        dosage: m.dosage,
        date: m.date, // should be YYYY-MM-DD
        taken: m.taken ?? false,
        // include user_id if your table requires association, e.g.
        // user_id: supabase.auth.getUser?.()?.data?.user?.id
      }));

      // Insert and ask DB to return the inserted rows
      const { data, error } = await supabase.from("medicines").insert(payload).select("*");

      console.log("insert result:", { data, error });

      if (error) {
        console.error("supabase insert error:", error);
        alert("Failed to save medicines to database: " + (error.message ?? JSON.stringify(error)));
        return;
      }

      if (data) {
        const normalized = data.map((d: any) => normalizeRow(d));
        setMedicines((prev) => {
          // merge without duplicating existing rows with same id
          const existingIds = new Set(prev.map((p) => p.id));
          const merged = [...prev, ...normalized.filter((n) => !existingIds.has(n.id))];
          merged.sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));
          return merged;
        });
      }
    } catch (err) {
      console.error("addMedicines err", err);
      alert("Unexpected error saving medicines.");
    }
  };

  // Toggle taken status: update DB and sync with returned row
  const toggleTaken = async (id: string) => {
    // compute newTaken from local state
    const item = medicines.find((m) => m.id === id);
    const newTaken = item ? !item.taken : true;

    // optimistic UI update
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: newTaken } : m)));

    try {
      const { data, error } = await supabase.from("medicines").update({ taken: newTaken }).eq("id", id).select("*");
      console.log("toggle update:", { data, error });

      if (error) throw error;
      if (data && data[0]) {
        const updated = normalizeRow(data[0]);
        setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      }
    } catch (err) {
      console.error("supabase update error:", err);
      // revert optimistic change
      setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, taken: item?.taken ?? false } : m)));
      alert("Failed to update status in database.");
    }
  };

  // Delete medicine: delete on DB and update state based on DB response
  const deleteMedicine = async (id: string) => {
    // optimistic remove
    const old = medicines;
    setMedicines((prev) => prev.filter((m) => m.id !== id));

    try {
      const { data, error } = await supabase.from("medicines").delete().eq("id", id).select("*");
      console.log("delete result:", { data, error });

      if (error) {
        console.error("supabase delete error:", error);
        setMedicines(old); // revert
        alert("Failed to delete from database.");
        return;
      }

      // If DB returned deleted row(s), we already removed from UI; no further action needed.
    } catch (err) {
      console.error("deleteMedicine err", err);
      setMedicines(old);
      alert("Unexpected error deleting medicine.");
    }
  };

  // UI helpers
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
        <div className="bg-white/70 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Medicine Schedule</h2>
          <MedicineForm addMedicine={addMedicines} />
        </div>

        {uniqueDates.length === 0 && (
          <div className="bg-white/70 rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl font-medium mb-2">No medicines added yet</h3>
            <p className="text-[#64766A]/60">Create your first medicine schedule above</p>
          </div>
        )}

        {uniqueDates.map((date) => (
          <div key={date} className="bg-white/70 rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#F0E7F4] flex items-center justify-center text-sm">{uniqueDates.indexOf(date) + 1}</span>
              {dateToDayLabel[date]}
            </h2>
            <MedicineList medicines={medicines.filter((med) => med.date === date)} toggleTaken={toggleTaken} deleteMedicine={deleteMedicine} />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
