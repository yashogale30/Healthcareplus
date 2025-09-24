"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../lib/authContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { useRouter } from "next/navigation";
import Loader from "../../components/ui/loader";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

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
            }], { onConflict: "id" })
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

        // Latest mental health score
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
    try {
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
        }], { onConflict: "id" })
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

  const getMentalHealthColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "severe":
        return "from-red-500 to-red-600";
      case "moderately severe":
        return "from-orange-500 to-red-500";
      case "moderate":
        return "from-yellow-500 to-orange-500";
      case "mild":
        return "from-blue-400 to-blue-500";
      default:
        return "from-green-400 to-green-500";
    }
  };

  const handleExportPDF = () => {
    if (!profile) return;

    const doc = new jsPDF();
    let y = 25;
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Personal Health Profile";
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, y);
    y += 15;

    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const addField = (label: string, value: string) => {
      doc.setFont("times", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("times", "normal");
      const splitText = doc.splitTextToSize(value, 160);
      doc.text(splitText, 50, y);
      y += splitText.length * 7 + 3;
    };

    addField("Full Name", profile.full_name);
    addField("Date of Birth", profile.dob);
    addField("Age", getAge(profile.dob) ? `${getAge(profile.dob)} years` : "");
    addField("Gender", profile.gender);
    addField("Blood Group", profile.blood_group);
    addField("Phone", profile.phone);
    addField("Email", profile.email);
    addField("Medical ID", profile.medical_id);

    y += 5;
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // Emergency Contacts
    doc.setFont("times", "bold");
    doc.text("Emergency Contacts", 14, y);
    y += 8;

    if (profile.emergency_contacts.length === 0) {
      doc.setFont("times", "normal");
      doc.text("None", 14, y);
      y += 8;
    } else {
      profile.emergency_contacts.forEach((c, i) => {
        doc.setFont("times", "bold");
        doc.text(`Contact ${i + 1}:`, 14, y);
        doc.setFont("times", "normal");
        const contactInfo = `Name: ${c.name || "-"} | Phone: ${c.phone || "-"} | Email: ${c.email || "-"}`;
        const splitText = doc.splitTextToSize(contactInfo, pageWidth - 34);
        doc.text(splitText, 20, y);
        y += splitText.length * 7 + 3;
      });
    }

    y += 5;
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    // Last updated
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.text(
      `Last updated: ${profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Never"}`,
      14,
      y
    );

    doc.save(`${profile.full_name || "profile"}.pdf`);
  };

  if (!user) return null;
  if (loading || !profile) return <Loader />;

  return (
    <div className="bg-[#F4F2F3] min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#94A7AE]/20 to-[#64766A]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#C0A9BD]/30 rounded-full text-sm text-[#64766A]">
            <span className="w-2 h-2 bg-[#94A7AE] rounded-full mr-2 animate-pulse"></span>
            Personal Health Profile
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-[#64766A] mb-6">
            Your <span className="text-[#C0A9BD]">Profile</span>
          </h1>
          
          <p className="text-xl text-[#64766A]/80 max-w-2xl mx-auto leading-relaxed font-light">
            Manage your personal information and health data to get the most personalized healthcare experience.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl border border-[#C0A9BD]/20 shadow-xl p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="text-center lg:text-left mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#C0A9BD]/20 to-[#94A7AE]/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C0A9BD] to-[#94A7AE] rounded-xl"></div>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Personal Information</h2>
                  <p className="text-[#64766A]/70">Basic details and contact information</p>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                    placeholder="e.g. John Doe"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Date of Birth *</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                  />
                  {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
                </div>

                {/* Age Display */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Age</label>
                  <input
                    type="text"
                    value={dob ? `${getAge(dob)} years` : ""}
                    readOnly
                    className="w-full p-3 bg-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-xl text-[#64766A]/70 cursor-not-allowed"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9999999999"
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full p-3 bg-[#94A7AE]/10 border border-[#C0A9BD]/20 rounded-xl text-[#64766A]/70 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <div className="text-center lg:text-left mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#94A7AE]/20 to-[#64766A]/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#94A7AE] to-[#64766A] rounded-xl"></div>
                  </div>
                  <h2 className="text-2xl font-semibold text-[#64766A] mb-2">Medical Information</h2>
                  <p className="text-[#64766A]/70">Health-related details and emergency contacts</p>
                </div>

                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                    placeholder="A+, A-, B+, B-, AB+, AB-, O+, O-"
                  />
                </div>

                {/* Medical ID */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Medical ID</label>
                  <input
                    type="text"
                    value={medicalId}
                    onChange={(e) => setMedicalId(e.target.value)}
                    placeholder="Enter your medical ID"
                    className="w-full p-3 bg-white/60 border border-[#C0A9BD]/30 rounded-xl text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-2 focus:ring-[#C0A9BD]/50 focus:border-transparent transition-all"
                  />
                </div>

                {/* Mental Health Score */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#64766A]">Mental Health Status</label>
                  {latestScore !== null ? (
                    <div className={`bg-gradient-to-r ${getMentalHealthColor(latestCategory)} rounded-xl p-4 text-white`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm opacity-90">Latest Assessment</p>
                          <p className="text-lg font-semibold">Score: {latestScore} ({latestCategory})</p>
                        </div>
                        <Link href="/mentalHealth" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-all">
                          Retake
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-[#64766A] mb-2">You haven't taken a mental health assessment yet.</p>
                      <Link
                        href="/mentalHealth"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-lg hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all text-sm"
                      >
                        Take Assessment
                      </Link>
                    </div>
                  )}
                </div>

                {/* Emergency Contacts */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#64766A]">Emergency Contacts</label>
                  
                  <AnimatePresence>
                    {emergencyContacts.map((contact, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/60 border border-[#C0A9BD]/30 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-[#64766A]">Contact {index + 1}</h4>
                          <button
                            onClick={() => {
                              setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
                            }}
                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all"
                          >
                            ×
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Name"
                            value={contact.name}
                            onChange={(e) => {
                              const updated = [...emergencyContacts];
                              updated[index].name = e.target.value;
                              setEmergencyContacts(updated);
                            }}
                            className="w-full p-2 bg-white/60 border border-[#C0A9BD]/20 rounded-lg text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-1 focus:ring-[#C0A9BD]/40 transition-all"
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
                            className="w-full p-2 bg-white/60 border border-[#C0A9BD]/20 rounded-lg text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-1 focus:ring-[#C0A9BD]/40 transition-all"
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
                            className="w-full p-2 bg-white/60 border border-[#C0A9BD]/20 rounded-lg text-[#64766A] placeholder-[#64766A]/50 focus:outline-none focus:ring-1 focus:ring-[#C0A9BD]/40 transition-all"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    onClick={() =>
                      setEmergencyContacts([...emergencyContacts, { name: "", phone: "", email: "" }])
                    }
                    className="w-full p-3 border-2 border-dashed border-[#C0A9BD]/40 rounded-xl text-[#C0A9BD] hover:bg-[#C0A9BD]/5 hover:border-[#C0A9BD]/60 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span>
                    Add Emergency Contact
                  </button>
                </div>
              </div>
            </div>

            {/* Export to PDF */}
            <div className="mt-6">
              <button
                onClick={handleExportPDF}
                className="w-full px-8 py-4 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-full text-lg font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Export Profile as PDF
              </button>
            </div>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-[#C0A9BD]/20">
              <p className="text-sm text-[#64766A]/60 text-center">
                Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleString() : "Never"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-[#64766A] to-[#64766A]/90 text-white rounded-full text-lg font-medium hover:from-[#64766A]/90 hover:to-[#64766A]/80 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Profile"
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={saving}
                className="px-8 py-4 bg-white/70 backdrop-blur-sm text-[#64766A] rounded-full text-lg font-medium hover:bg-white/90 transition-all duration-300 border border-[#C0A9BD]/30"
              >
                Reset Changes
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}