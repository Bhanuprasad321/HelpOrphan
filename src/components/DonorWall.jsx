import React, { useEffect, useState } from "react";

function DonorWall() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch("https://helporphanapi.onrender.com/donors");
        const data = await res.json();
        setDonors(data);
        setFilteredDonors(data);
      } catch (err) {
        console.error("Error fetching donors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  // 🔍 Filter logic
  useEffect(() => {
    const results = donors.filter((donor) =>
      donor.donorName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDonors(results);
  }, [search, donors]);

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
        <p className="text-gray-400 mb-6">
          A heartfelt thanks to our amazing donors for their generosity and support ❤️
        </p>

        {/* 🔍 Search bar */}
        <div className="mb-10 flex justify-center">
          <input
            type="text"
            placeholder="Search donor by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          />
        </div>

        {filteredDonors.length === 0 ? (
          <p className="text-gray-400 italic">No matching donors found.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map((donor, index) => (
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
