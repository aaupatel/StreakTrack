"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Database,
  Calendar,
  Pencil,
  KeyRound,
  Upload,
  CameraIcon,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNo: z.string().regex(/^\d{10}$/, "Contact must be 10 digits"),
});

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContactNo, setNewContactNo] = useState("");
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactNo: "",
    },
  });

  useEffect(() => {
    if (session?.user) {
      const userData = {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.profileImage,
        contactNo: session.user.contactNo,
      };
      setUser(userData);
      setOrganization(session.organization);
      form.reset({
        name: userData.name || "",
        contactNo: userData.contactNo || "",
      });
    }
  }, [session, form]);

  const handleCancelEdit = () => {
    setOpen(false);
    form.reset({
      name: user?.name || "",
      contactNo: user?.contactNo || "",
    });
    setNewAvatar(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
    }
  };

  const handleSaveProfile = async (data: any) => {
    const formData = new FormData();

    if (data.name !== user.name) {
      formData.append("name", data.name);
    }
    if (data.contactNo !== user.contactNo) {
      formData.append("contactNo", data.contactNo);
    }

    if (newAvatar) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        formData.append("image", reader.result as string);
        await updateUserProfile(formData);
      };
      reader.readAsDataURL(newAvatar);
    } else {
      await updateUserProfile(formData);
    }
  };

  async function updateUserProfile(formData: FormData) {
    const response = await fetch("/api/profile", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error("Error updating profile.");
      console.error("Failed to fetch students:", errorData);
    } else {
      const updatedUser = await response.json();
      setUser((prev: any) => ({ ...prev, ...updatedUser }));
      toast.success("Profile updated successfully!");
      setOpen(false);
      setNewAvatar(null);
    }
  }

  if (!session || !user || !organization) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="mt-12">
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="sm:flex block sm:justify-between sm:items-center space-y-2">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.image || "/default-avatar.png"}
                  alt={user.name}
                />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-muted-foreground">Role: {user.role}</p>
                <p className="text-muted-foreground">
                  <Phone className="inline-block mr-1 h-4 w-4" />:{" "}
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile information.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="relative flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          newAvatar
                            ? URL.createObjectURL(newAvatar)
                            : user?.image || "/default-avatar.png"
                        }
                        alt={user?.name}
                      />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
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
                  </div>

                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSaveProfile)}
                      className="grid gap-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter student name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter contact number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter className="pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={uploadingAvatar}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </FormProvider>
                </div>
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
  );
}
