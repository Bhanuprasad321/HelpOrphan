import React from "react";

function Contact() {
  return (
    <div className="flex justify-center items-center bg-gray-900 min-h-screen px-6 py-12">
      <div className="max-w-3xl bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-10 flex flex-col gap-8">
        
        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center text-teal-400 tracking-wide underline">
          Get in Touch
        </h1>

        {/* Intro Message */}
        <p className="text-gray-300 text-lg leading-relaxed text-center">
          We’d love to hear from you! Whether you're an orphanage in need, 
          a kind-hearted donor, or someone with feedback, <br />
          <span className="font-semibold text-white">your voice matters to us.</span>
        </p>

        {/* Sections */}
        <div className="space-y-6">
          <div className="bg-gray-700/40 rounded-lg p-5 shadow-inner">
            <h2 className="text-xl text-white font-semibold mb-2">🏠 For Orphanages</h2>
            <p className="text-gray-300">
              Want to list your requirements on our platform? 
              Share your organization's details and current needs. 
              <span className="text-teal-400"> We’ll respond within 48 hours.</span>
            </p>
          </div>

          <div className="bg-gray-700/40 rounded-lg p-5 shadow-inner">
            <h2 className="text-xl text-white font-semibold mb-2">🤝 For Donors & Volunteers</h2>
            <p className="text-gray-300">
              Interested in supporting orphanages through OrphanHelp? 
              Let us know how you'd like to contribute — 
              <span className="text-teal-400"> donations, logistics, or awareness.</span>
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-700/40 rounded-lg p-5 shadow-inner">
            <h2 className="text-xl text-white font-semibold mb-2">📧 Project Team</h2>
            <p className="text-gray-300">
              Developed by <span className="text-teal-400">Bhanu Prasad Naidu, Suresh, and Bharat</span> 
              of Maharaj Vijayaram Gajapathi Raj College of Engineering.
            </p>
            <p className="text-gray-300 mt-3">
              <span className="font-semibold text-white">Email:</span> orphanhelp.project@gmail.com <br />
              <span className="font-semibold text-white">Phone:</span> +91 98765 43210 <br />
              <span className="font-semibold text-white">Address:</span> MVGRCE, Vizianagaram, Andhra Pradesh, India
            </p>
          </div>
        </div>

        {/* Closing Note */}
        <p className="text-gray-400 italic text-center mt-6">
          🌟 Your support can light up many lives. <br /> 
          Together, let’s build a better, kinder world.
        </p>
      </div>
    </div>
  );
}

export default Contact;
