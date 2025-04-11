"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database, Calendar, Pencil, KeyRound, Upload, CameraIcon, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newContactNo, setNewContactNo] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const { toast } = useToast();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser({
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
        contactNo: session.user.contactNo,
      });
      setOrganization(session.organization);
      setNewName(session.user.name);
      setNewEmail(session.user.email);
      setNewContactNo(session.user.contactNo || "");
    }
  }, [session]);

  if (!session) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!user || !organization) return null; // Check for both user and organization

  async function updateUserProfile(data: {
    name?: string;
    email?: string;
    image?: string;
    contactNo?: string;
  }) {
    const response = await fetch("/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || "Failed to update profile");
    }
    return response.json();
  }

  const handleCancelEdit = () => {
    setOpen(false);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewContactNo(user.contactNo || "");
    setNewAvatar(null);
  };

  const handleSaveProfile = async () => {
    try {
      setUploadingAvatar(!!newAvatar); // Set uploading state if there's a new avatar

      const formData = new FormData();
      if (newName !== user.name) {
        formData.append("name", newName);
      }
      if (newEmail !== user.email) {
        formData.append("email", newEmail);
      }
      if (newContactNo !== user.contactNo) {
        formData.append("contactNo", newContactNo);
      }
      if (newAvatar) {
        formData.append("image", newAvatar);
      }

      if (formData.entries().next().done) {
        // No changes to save
        setOpen(false);
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error updating profile.",
          description: errorData?.message || "Failed to update profile.",
        });
      } else {
        const updatedUser = await response.json();
        await update({ ...session, user: updatedUser });
        setUser((prev) => ({ ...prev, ...updatedUser }));
        toast({
          title: "Profile updated successfully!",
        });
        setOpen(false);
        setNewAvatar(null); // Clear the selected avatar after successful upload
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile.",
        description: error.message,
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="container mx-auto space-y-6">
        <Card>
          <CardHeader className="mt-12">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="sm:flex block sm:justify-between sm:items-center space-y-2">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/default-avatar.png" alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-muted-foreground">Role: {user.role}</p>
                  <p className="text-muted-foreground">
                    <Phone className="inline-block mr-1 h-4 w-4" />{": "}
                    {user.contactNo}
                  </p>
                </div>

              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="relative flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        {newAvatar ? (
                          <AvatarImage
                            src={URL.createObjectURL(newAvatar)}
                            alt={newName}
                          />
                        ) : (
                          <AvatarImage
                            src={user?.image || "/default-avatar.png"}
                            alt={user?.name}
                          />
                        )}
                        <AvatarFallback>{newName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 left-8 p-1 bg-secondary rounded-full cursor-pointer shadow-sm"
                      >
                        <CameraIcon className="h-5 w-5 text-secondary-foreground" />
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="sr-only"
                        />
                      </label>
                      {uploadingAvatar && (
                        <p className="text-sm text-muted-foreground">
                          Uploading avatar...
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="name">Name</label>
                      <Input
                        id="name"
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="email">Email</label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="contactNo">Contact Number</label>
                      <Input
                        id="contactNo"
                        type="tel"
                        value={newContactNo}
                        onChange={(e) => setNewContactNo(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={uploadingAvatar}
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Organization</h3>
                  </div>
                  <p className="mt-2">{organization.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Type: {organization.type || "N/A"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">Member Since</h3>
                  </div>
                  <p className="mt-2">
                    {organization.createdAt
                      ? new Date(organization.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-2">Account Actions</h2>
              <div className="flex items-center justify-start gap-10">
                <Button variant="outline" asChild>
                  <a href="/auth/reset-password" className="flex items-center">
                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                  </a>
                </Button>
                <Button variant="destructive" onClick={() => signOut()}>
                  <Upload className="mr-2 h-4 w-4 rotate-180" /> Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
