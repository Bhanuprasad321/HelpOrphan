import React from "react";

function About() {
  return (
    <div className="flex justify-center items-center bg-gray-900 min-h-screen px-6 py-12">
      <div className="max-w-3xl bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col gap-6">
        
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center text-teal-400 tracking-wide">
          About <span className="text-white">HelpOrphan</span>
        </h1>

        {/* Purpose & SRP */}
        <p className="text-gray-300 leading-relaxed text-lg">
          <span className="font-semibold text-white">HelpOrphan</span> is a <span className="text-teal-400 font-medium">Socially Relevant Project (SRP)</span> 
          developed by <span className="text-teal-400">Bhanu Prasad, Suresh, and Bharat</span> from Maharaj Vijayaram Gajapathi Raj College of Engineering. 
          The platform addresses a critical social need: connecting orphanages with individuals and organizations willing to help. 
          By creating a <span className="text-teal-300 font-medium">transparent, need-based wishlist system</span>, we aim to ensure that orphanages receive essential supplies efficiently.
        </p>

        {/* Why Website/App */}
        <p className="text-gray-300 leading-relaxed">
          We chose a <span className="font-semibold text-white">web-based application</span> for its accessibility and ease of use. 
          Any user with internet access can view orphanages’ needs, donate, or contribute without geographical limitations. 
          The platform also allows orphanages to update their wishlist in real-time, ensuring that the information remains accurate and actionable.
        </p>

        {/* Unique Selling Points */}
        <p className="text-gray-300 leading-relaxed">
          What makes <span className="text-white font-semibold">HelpOrphan</span> unique is its combination of <span className="text-teal-300 font-medium">real-time transparency, user engagement, and simplicity</span>. 
          Donors can see exactly what is needed, and orphanages gain visibility that was previously missing. 
          This reduces duplication of donations and ensures resources reach the children who need them most.
        </p>

        {/* Features List */}
        <div className="bg-gray-700/40 rounded-xl p-6 shadow-inner">
          <h2 className="text-xl font-semibold text-white mb-3">✨ Key Features:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Showcases <span className="text-teal-400">real-time wishlists</span> from multiple orphanages</li>
            <li>Enables donors to <span className="text-teal-400">contribute directly</span> to specific needs</li>
            <li>Helps reduce wastage and duplication by highlighting <span className="text-teal-400">exact requirements</span></li>
            <li>Admin dashboard allows <span className="text-teal-400">managing orphanage listings and items</span></li>
            <li>Responsive web interface ensures accessibility across devices</li>
            <li>Supports transparency and accountability in charitable contributions</li>
          </ul>
        </div>

        {/* Vision */}
        <p className="text-gray-300 leading-relaxed">
          Our vision is a world where <span className="text-white font-semibold">no orphanage is overlooked</span> and every act of kindness reaches those in need. 
          Although developed as part of an academic project, we hope <span className="text-teal-300 font-medium">HelpOrphan</span> evolves into a real-world solution embraced by communities, NGOs, and educational institutions.
        </p>

      </div>
    </div>
  );
}

export default About;
