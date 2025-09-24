
"use client";
import { useState } from "react";
import { Medicine } from "../hooks/useMedicines";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";

export default function MedicineForm({ addMedicine }: { addMedicine: (medicines: Medicine[]) => void }) {
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [duration, setDuration] = useState(1); // Number of days
  const [frequency, setFrequency] = useState("specific"); // "specific" or "interval"
  const [times, setTimes] = useState(["09:00"]); // Array of times
  const [intervalHours, setIntervalHours] = useState(8); // For interval-based dosing
  const [timesPerDay, setTimesPerDay] = useState(2); // For interval-based dosing

  const addTimeSlot = () => {
    setTimes([...times, "12:00"]);
  };

  const removeTimeSlot = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const generateIntervalTimes = (startTime: string, interval: number, count: number): string[] => {
    const times = [];
    let currentTime = new Date(`2000-01-01T${startTime}:00`);
    
    for (let i = 0; i < count; i++) {
      times.push(currentTime.toTimeString().slice(0, 5));
      currentTime.setHours(currentTime.getHours() + interval);
    }
    
    return times;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !startDate) {
      alert("Please enter medicine name and start date");
      return;
    }

    let doseTimes: string[] = [];
    
    if (frequency === "specific") {
      if (times.length === 0 || times.some(time => !time)) {
        alert("Please specify all dose times");
        return;
      }
      doseTimes = times;
    } else {
      // Generate interval-based times
      doseTimes = generateIntervalTimes("09:00", intervalHours, timesPerDay);
    }

    const medicines: Medicine[] = [];
    
    // Generate medicines for each day
    for (let day = 0; day < duration; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dateString = currentDate.toISOString().split("T")[0];
      
      // Generate medicines for each time slot
      doseTimes.forEach(time => {
        medicines.push({
          id: crypto.randomUUID(),
          name: name.trim(),
          time: time,
          dosage: dosage.trim(),
          date: dateString,
          taken: false,
        });
      });
    }

    addMedicine(medicines);
    
    // Reset form
    setName("");
    setDosage("");
    setStartDate(today);
    setDuration(1);
    setTimes(["09:00"]);
    setFrequency("specific");
    setIntervalHours(8);
    setTimesPerDay(2);
  };

  return (
    
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#64766A]">Medicine Name</label>
          <input
            type="text"
            placeholder="e.g., Dolo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#64766A]">Dosage per dose</label>
          <input
            type="text"
            placeholder="e.g., 1 tablet"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#64766A]">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
            min={today}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#64766A]">Duration (days)</label>
          <input
            type="number"
            min="1"
            max="365"
            value={duration}
            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : 0)}
            className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
            required
          />
        </div>
      </div>

      {/* Frequency Selection */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[#64766A]">Dosing Schedule</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="frequency"
              value="specific"
              checked={frequency === "specific"}
              onChange={(e) => setFrequency(e.target.value)}
              className="mr-2"
            />
            <span className="text-[#64766A]">Specific Times</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="frequency"
              value="interval"
              checked={frequency === "interval"}
              onChange={(e) => setFrequency(e.target.value)}
              className="mr-2"
            />
            <span className="text-[#64766A]">Every X Hours</span>
          </label>
        </div>
      </div>

      {/* Specific Times */}
      {frequency === "specific" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-[#64766A]">Dose Times</label>
            <button
              type="button"
              onClick={addTimeSlot}
              className="px-3 py-1 bg-[#C0A9BD] text-white rounded-lg text-sm hover:bg-[#C0A9BD]/80 transition-all duration-300"
            >
              + Add Time
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {times.map((time, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="flex-1 border border-[#C0A9BD]/30 rounded-lg p-2 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300"
                  required
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-all duration-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interval-based dosing */}
      {frequency === "interval" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#64766A]">Every X Hours</label>
            <select
              value={intervalHours}
              onChange={(e) => setIntervalHours(parseInt(e.target.value))}
              className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
            >
              <option value={4}>Every 4 hours</option>
              <option value={6}>Every 6 hours</option>
              <option value={8}>Every 8 hours</option>
              <option value={12}>Every 12 hours</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#64766A]">Times per day</label>
            <input
              type="number"
              min="1"
              max="6"
              value={timesPerDay}
              onChange={(e) => setTimesPerDay(parseInt(e.target.value))}
              className="w-full border border-[#C0A9BD]/30 rounded-xl p-4 focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-[#C0A9BD] transition-all duration-300 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-[#C0A9BD]/10 rounded-xl p-4">
        <h4 className="font-medium text-[#64766A] mb-2">Summary:</h4>
        <p className="text-sm text-[#64766A]/70">
          This will create <strong>{duration} days</strong> × <strong>{frequency === "specific" ? times.length : timesPerDay} doses/day</strong> = <strong>{duration * (frequency === "specific" ? times.length : timesPerDay)} total doses</strong>
        </p>
      </div>

      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-[#64766A] to-[#C0A9BD] text-white font-medium py-4 px-8 rounded-xl hover:from-[#64766A]/90 hover:to-[#C0A9BD]/90 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        ➕ Create Medicine Schedule
      </button>
    </form>
  );
}