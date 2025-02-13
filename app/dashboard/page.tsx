import { Card } from "@/components/ui/card";
import { 
  Users,
  UserCheck,
  UserX,
  Calendar
} from "lucide-react";

export default async function Dashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="156"
          icon={<Users className="h-6 w-6" />}
          description="Registered students"
        />
        <StatsCard
          title="Present Today"
          value="142"
          icon={<UserCheck className="h-6 w-6" />}
          description="90.3% attendance"
        />
        <StatsCard
          title="Absent Today"
          value="14"
          icon={<UserX className="h-6 w-6" />}
          description="9.7% absent"
        />
        <StatsCard
          title="This Month"
          value="95.2%"
          icon={<Calendar className="h-6 w-6" />}
          description="Average attendance"
        />
      </div>

      {/* Add charts and detailed statistics here */}
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </Card>
  );
}