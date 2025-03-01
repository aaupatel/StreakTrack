// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
import { Camera, Users, Calendar, BarChart, ShieldCheck, Clock, MapPin, Lightbulb, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 ">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex flex-col items-center gap-4">
            <Logo className="h-72 w-72 text-primary" />
            <h1 className="text-5xl font-semibold text-gray-900">
              Welcome to{" "}
              <span className="text-yellow-300 font-bold">StreakTrack</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            A modern face detection-based attendance tracking system for
            educational institutions
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Camera className="w-8 h-8" />}
            title="Face Detection"
            description="Automated attendance tracking using advanced face detection technology"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Student Management"
            description="Easy registration and management of student profiles"
          />
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Real-time Tracking"
            description="Instant attendance marking and status updates"
          />
          <FeatureCard
            icon={<BarChart className="w-8 h-8" />}
            title="Analytics"
            description="Comprehensive attendance reports and analytics"
          />
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Enhanced Security"
            description="Secure data handling and robust privacy measures"
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="Time Efficiency"
            description="Reduces manual attendance processes, saving valuable time"
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8" />}
            title="Location Flexibility"
            description="Supports attendance tracking across multiple locations"
          />
          <FeatureCard
            icon={<Lightbulb className="w-8 h-8" />}
            title="Smart Insights"
            description="Provides actionable insights for improving attendance rates"
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8" />}
            title="Customizable Reports"
            description="Generate tailored attendance reports to meet specific needs"
          />
        </div>

        {/* <div className="text-center">
          <Link href="/auth/login">
            <Button size="lg" className="mr-4">
              Faculty Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              Register as Faculty
            </Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}