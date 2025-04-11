"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SupportPage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(session.user);
    }
  }, [status, session]);

  if (status === "loading") {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with us or find answers to common questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Us Section */}
          <div>
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    placeholder="How can we help you?"
                    className="min-h-[150px]"
                  />
                </div>
                <Button className="w-full">Send Message</Button>
              </form>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">Get in touch</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">ayushpatidar2810@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-gray-600">+91 62632 77425</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-600">
                      135-LIG/B, Sector B
                      <br />
                      Sonagiri, Bhopal 462021
                      <br />
                      India
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-primary text-primary-foreground p-6 rounded-md">
                <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                <div className="space-y-2">
                  <p>Monday - Friday: 10:00 AM - 8:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Help Section */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger className="py-4 font-semibold text-lg">
                    What is StreakTrack?
                  </AccordionTrigger>
                  <AccordionContent className="py-2">
                    StreakTrack is a system designed to streamline attendance
                    management using facial recognition technology. It aims to
                    improve accuracy and efficiency in tracking attendance.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="py-4 font-semibold text-lg">
                    How do I get started?
                  </AccordionTrigger>
                  <AccordionContent className="py-2">
                    To get started, you&apos;ll need an account. If you&apos;re
                    an administrator, your organization will set up your access.
                    If you&apos;re a student, you&apos;ll be added to the system
                    by your institution.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="py-4 font-semibold text-lg">
                    Is my data secure?
                  </AccordionTrigger>
                  <AccordionContent className="py-2">
                    Yes, we take data security very seriously. We employ robust
                    encryption and security measures to protect your
                    information.
                  </AccordionContent>
                </AccordionItem>
                {/* Add more general help items here */}
              </Accordion>
            </Card>

            {/* User-Specific Help Section (Conditional) */}
            {user && (
              <Card className="p-6 mt-8">
                <h2 className="text-2xl font-bold mb-6">
                  Help for {user.role === "admin" ? "Administrators" : "Users"}
                </h2>
                <Accordion type="single" collapsible>
                  {user.role === "admin" && (
                    <>
                      <AccordionItem value="admin-1">
                        <AccordionTrigger className="py-4 font-semibold text-lg">
                          How do I add new students?
                        </AccordionTrigger>
                        <AccordionContent className="py-2">
                          Go to the &quot;Manage Students&quot; section in the
                          dashboard and follow the instructions to add new
                          student records.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="admin-2">
                        <AccordionTrigger className="py-4 font-semibold text-lg">
                          How do I generate attendance reports?
                        </AccordionTrigger>
                        <AccordionContent className="py-2">
                          You can generate reports from the &quot;Reports&quot;
                          section of the dashboard. Specify the date range and
                          other criteria to customize your report.
                        </AccordionContent>
                      </AccordionItem>
                      {/* Add more admin-specific help items here */}
                    </>
                  )}
                  {user.role !== "admin" && (
                    <>
                      <AccordionItem value="user-1">
                        <AccordionTrigger className="py-4 font-semibold text-lg">
                          How do I check my attendance?
                        </AccordionTrigger>
                        <AccordionContent className="py-2">
                          You can view your attendance record in the &quot;My
                          Attendance&quot; section of your profile.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="user-2">
                        <AccordionTrigger className="py-4 font-semibold text-lg">
                          What if my attendance is incorrect?
                        </AccordionTrigger>
                        <AccordionContent className="py-2">
                          Please contact your administrator or teacher to
                          correct any inaccuracies in your attendance record.
                        </AccordionContent>
                      </AccordionItem>
                      {/* Add more user-specific help items here */}
                    </>
                  )}
                </Accordion>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
