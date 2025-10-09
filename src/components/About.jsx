import React from "react";

function About() {
  return (
    <div className="flex justify-center items-center bg-gray-900 min-h-screen px-6 py-12">
      <div className="max-w-3xl bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col gap-6">
        
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center text-teal-400 tracking-wide">
          About <span className="text-white">HelpOrphan</span>
        </h1>

        {/* Mission Statement */}
        <p className="text-gray-300 leading-relaxed text-lg">
          <span className="font-semibold text-white">OrphanHelp</span> is a Socially Relevant Project (SRP) developed by 
          <span className="text-teal-400"> Bhanu Prasad, Suresh and Bharat </span> 
          from Maharaj Vijayaram Gajapathi Raj College of Engineering. 
          Our mission is to bridge the gap between orphanages and generous individuals 
          by providing a <span className="text-teal-300 font-medium">transparent, need-based wishlist platform.</span>
        </p>

        {/* Problem Statement */}
        <p className="text-gray-300 leading-relaxed">
          Many orphanages struggle with unmet needs such as food, clothing, school materials, 
          and hygiene products. This isn’t always due to a lack of generosity, 
          but rather due to <span className="font-semibold text-white">lack of visibility</span>. 
          HelpOrphan highlights these needs, enabling people to contribute directly where it matters most.
        </p>

        {/* Features List */}
        <div className="bg-gray-700/40 rounded-xl p-6 shadow-inner">
          <h2 className="text-xl font-semibold text-white mb-3">✨ Key Features:</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>Lists <span className="text-teal-400">real-time required items</span> from orphanages</li>
            <li>Allows well-wishers to <span className="text-teal-400">donate directly</span></li>
            <li>Aims to <span className="text-teal-400">reduce wastage</span> with targeted donations</li>
          </ul>
        </div>

        {/* Vision */}
        <p className="text-gray-300 leading-relaxed">
          We envision a world where <span className="text-white font-semibold">no orphanage feels forgotten</span>, 
          and every act of kindness reaches those who need it most. 
          Though developed as part of our academic journey, our hope is that 
          HelpOrphan evolves into a <span className="text-teal-300 font-medium">real-world solution </span> 
          supported by communities, NGOs, and educational institutions alike.
        </p>
      </div>
    </div>
  );
}

export default About;
