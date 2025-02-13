import { Camera, Shield, Clock, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About StreakTrack</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionizing attendance tracking with cutting-edge face detection technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              StreakTrack aims to modernize attendance management in educational institutions
              by leveraging advanced face detection technology. We believe in making the
              attendance process more efficient, accurate, and secure.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              We envision a future where manual attendance tracking becomes obsolete,
              replaced by seamless, automated systems that save time and reduce errors,
              allowing educators to focus on what matters most - teaching.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-primary mb-4">
              <Shield className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">
              State-of-the-art face detection ensures accurate identification and prevents proxy attendance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-primary mb-4">
              <Clock className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Time-Efficient</h3>
            <p className="text-gray-600">
              Automated attendance marking saves valuable class time and reduces administrative burden.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-primary mb-4">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold mb-2">User-Friendly</h3>
            <p className="text-gray-600">
              Intuitive interface makes it easy for faculty and administrators to manage attendance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}