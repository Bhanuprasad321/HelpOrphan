import React, { useEffect, useState } from "react";

function DonorWall() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch("https://helporphanapi.onrender.com/donors");
        const data = await res.json();
        setDonors(data);
      } catch (err) {
        console.error("Error fetching donors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900 text-white">
        Loading Donors...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-teal-400 mb-6">🌟 Donor Wall</h1>
        <p className="text-gray-400 mb-10">
          A heartfelt thanks to our amazing donors for their generosity and support ❤️
        </p>

        {donors.length === 0 ? (
          <p className="text-gray-400 italic">No donations recorded yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donors.map((donor, index) => (
              <div
                key={index}
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-5 hover:shadow-teal-700/40 hover:scale-105 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold text-teal-300">
                  {donor.donorName}
                </h2>
                <p className="text-gray-300 mt-2">
                  Donated: <span className="text-white">{donor.itemCommitted}</span>
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Contact: {donor.contactEmail}
                </p>
                <p className="text-gray-500 text-xs mt-2 italic">
                  {new Date(donor.commitmentTimestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorWall;
