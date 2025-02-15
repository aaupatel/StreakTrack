import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, Users, Calendar, BarChart } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex flex-col items-center gap-4">
            <Logo className="h-24 w-24 text-primary" />
            <h1 className="text-5xl font-semibold text-gray-900">
              Welcome to <span className='text-yellow-300 font-bold'>StreakTrack</span>
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            A modern face detection-based attendance tracking system for
            educational institutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
        </div>

        <div className="text-center">
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
        </div>
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