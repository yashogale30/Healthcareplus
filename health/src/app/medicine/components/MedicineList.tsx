
"use client";
import { Medicine } from "../hooks/useMedicines";

export default function MedicineList({
  medicines,
  toggleTaken,
  deleteMedicine,
}: {
  medicines: Medicine[];
  toggleTaken: (id: string) => void;
  deleteMedicine: (id: string) => void;
}) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📅</div>
        <p className="text-gray-500">No medicines scheduled for this day.</p>
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">⏰ Time</th>
            <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">💊 Medicine</th>
            <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">📊 Dosage</th>
            <th className="border border-gray-200 p-4 text-center font-semibold text-gray-700">Status</th>
            <th className="border border-gray-200 p-4 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => {
            const doseTime = new Date(`${med.date}T${med.time}:00`);
            const isPastDue = now > doseTime && !med.taken;
            return (
              <tr 
                key={med.id} 
                className={`
                  ${isPastDue ? "bg-red-50 border-red-200" : "hover:bg-gray-50"}
                  transition-colors duration-150
                `}
              >
                <td className="border border-gray-200 p-4 font-mono text-lg">
                  {med.time}
                </td>
                <td className="border border-gray-200 p-4 font-medium">
                  {med.name}
                </td>
                <td className="border border-gray-200 p-4 text-gray-600">
                  {med.dosage || "Not specified"}
                </td>
                <td className="border border-gray-200 p-4 text-center">
                  {med.taken ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      ✅ Taken
                    </span>
                  ) : isPastDue ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                      ⚠️ Missed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      ⏳ Pending
                    </span>
                  )}
                </td>
                <td className="border border-gray-200 p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => toggleTaken(med.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        med.taken 
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                          : "bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg"
                      }`}
                      disabled={med.taken}
                    >
                      {med.taken ? "✅ Done" : "✅ Mark Taken"}
                    </button>
                    <button
                      onClick={() => deleteMedicine(med.id)}
                      className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}