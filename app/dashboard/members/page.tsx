"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";

interface Member {
  _id: string;
  name: string;
  type: 'student' | 'employee';
  branch: string;
  enrollmentId: string;
  fatherName: string;
  contactNo: string;
  email: string;
  images: string[];
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function MembersPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/members?page=${pagination.page}&limit=${pagination.limit}&search=${searchTerm}`
      );
      if (!response.ok) throw new Error("Failed to fetch members");
      const data = await response.json();
      setMembers(data.members);
      setPagination(data.pagination);
    } catch (error) {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const getMemberTypeLabel = (type: 'student' | 'employee') => {
    return type === 'student' ? 'Student' : 'Employee';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization&apos;s {session?.user?.organizationName} members
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add {session?.user?.organizationType === 'education' ? 'Student' : 'Employee'}
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Branch/Dept</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  {member.images?.[0] && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={member.images[0]}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>
                  <Badge variant={member.type === 'student' ? 'default' : 'secondary'}>
                    {getMemberTypeLabel(member.type)}
                  </Badge>
                </TableCell>
                <TableCell>{member.enrollmentId}</TableCell>
                <TableCell>{member.branch}</TableCell>
                <TableCell>{member.contactNo}</TableCell>
                <TableCell>{member.email}</TableCell>
              </TableRow>
            ))}
            {members.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No members found
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}