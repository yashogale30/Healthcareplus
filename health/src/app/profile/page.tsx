"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/navbar";
import { useRouter } from "next/navigation";
import Loader from "../../components/ui/loader";
import Link from "next/link";

interface EmergencyContact {
  name: string;
  phone: string;
  email?: string;
}

interface Profile {
  id: string;
  full_name: string;
  dob: string;
  gender: string;
  blood_group: string;
  phone: string;
  email: string;
  medical_id: string;
  emergency_contacts: EmergencyContact[];
  updated_at?: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalId, setMedicalId] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [latestCategory, setLatestCategory] = useState<string>("");

  useEffect(() => {
    if (user === null) {
      setLoading(true);
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error.message);
          return;
        }
        let profileData: Profile;
        if (data) {
          profileData = data;
        } else {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .upsert([{
              id: user.id,
              full_name: "",
              dob: null,
              gender: "",
              blood_group: "",
              phone: "",
              email: user.email ?? "",
              medical_id: "",
              emergency_contacts: [],
              updated_at: new Date().toISOString(),
            }], { onConflict: "id"})
            .select()
            .single();

          if (insertError) {
            console.error("Error creating profile:", insertError.message);
            return;
          }

          profileData = newProfile;
        }

        // Populate form
        setProfile(profileData);
        setFullName(profileData.full_name ?? "");
        setDob(profileData.dob ?? "");
        setGender(profileData.gender ?? "");
        setBloodGroup(profileData.blood_group ?? "");
        setPhone(profileData.phone ?? "");
        setMedicalId(profileData.medical_id ?? "");
        setEmergencyContacts(profileData.emergency_contacts ?? []);

        //latest mental health score
        const { data: mhData, error: mhError } = await supabase
          .from("mental_health_logs")
          .select("score, category")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)

        if (mhError) {
          console.error("Error fetching latest mental health score:", mhError.message);
        } else if (mhData && mhData.length > 0) {
          setLatestScore(mhData[0].score);
          setLatestCategory(mhData[0].category);
        } else {
          setLatestScore(null);
          setLatestCategory("");
        }
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getAge = (dob?: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return "";
    const diff = new Date().getTime() - birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleUpdate = async () => {
    if (!user) return;
    if (!validateProfile()) return;
    setSaving(true);
    try{
      const { data, error } = await supabase
        .from("profiles")
        .upsert([{
          id: user.id,
          full_name: fullName.trim(),
          dob: dob || null,
          gender,
          blood_group: bloodGroup,
          phone: phone.trim(),
          medical_id: medicalId,
          emergency_contacts: emergencyContacts,
          updated_at: new Date().toISOString(),
        }], { onConflict: "id"})
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error.message);
        alert("Failed to update profile.");
      } else {
        alert("Profile updated!");
        setProfile(data ?? null);
      }
    } catch (err) {
      console.error("Unexpected error updating profile:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setDob(profile.dob ?? "");
    setGender(profile.gender ?? "");
    setBloodGroup(profile.blood_group ?? "");
    setPhone(profile.phone ?? "");
    setMedicalId(profile.medical_id ?? "");
    setEmergencyContacts(profile.emergency_contacts ?? []);
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!dob) newErrors.dob = "Date of Birth is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else {
      const phonePattern = /^\+?[0-9]{7,15}$/;
      if (!phonePattern.test(phone)) newErrors.phone = "Invalid phone number";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  if (!user) return null;
  if (loading || !profile) return <Loader />;

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="eg. Tom Cruise"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* Date of Birth */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Date of Birth *</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full border rounded px-3 py-2"
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
        </div>

        {/* Age display */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Age</label>
          <input
            type="text"
            value={dob ? `${getAge(dob)} years` : ""}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Gender *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>

        {/* Blood Group */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Blood Group</label>
          <input
            type="text"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="A+, A-, B+, B-, AB+, AB-, O+ or O-"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Phone *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 9999999999"
            pattern="^\+?[0-9]{7,15}$"
            title="Enter a valid phone number"
            className="w-full border rounded px-3 py-2"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Medical ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Medical ID</label>
          <input
            type="text"
            value={medicalId}
            onChange={(e) => setMedicalId(e.target.value)}
            placeholder="Enter your medical ID"
            pattern="^[A-Za-z0-9-]+$"
            title="Only letters, numbers, and hyphens are allowed"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Mental Health Score */}
        <div className="mb-4 p-3 bg-yellow-100 rounded">
          {latestScore !== null ? (
            <p>
              Latest mental health score: <strong>{latestScore}</strong> ({latestCategory})
            </p>
          ) : (
            <div>
              <p>
                You haven't taken a mental health test yet.{' '}
              </p>
              <p>
                <Link
                  href="/mentalHealth"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  You can take it here
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Emergency Contacts</label>

          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Name"
                value={contact.name}
                onChange={(e) => {
                  const updated = [...emergencyContacts];
                  updated[index].name = e.target.value;
                  setEmergencyContacts(updated);
                }}
                className="border rounded px-2 py-1 w-1/3"
              />
              <input
                type="text"
                placeholder="Phone"
                value={contact.phone}
                onChange={(e) => {
                  const updated = [...emergencyContacts];
                  updated[index].phone = e.target.value;
                  setEmergencyContacts(updated);
                }}
                className="border rounded px-2 py-1 w-1/3"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={contact.email ?? ""}
                onChange={(e) => {
                  const updated = [...emergencyContacts];
                  updated[index].email = e.target.value;
                  setEmergencyContacts(updated);
                }}
                className="border rounded px-2 py-1 w-1/3"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => {
                  setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
                }}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add button */}
          <button
            type="button"
            onClick={() =>
              setEmergencyContacts([...emergencyContacts, { name: "", phone: "", email: "" }])
            }
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            + Add Contact
          </button>
        </div>

        {/* Last updated */}
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Never"}
        </p>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className={`px-4 py-2 rounded text-white transition ${
              saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded text-white bg-gray-500 hover:bg-gray-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}