// pages/AboutUs.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AboutUs = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send this data to your backend
        console.log("Form submitted:", formData);
        alert("Thank you for your message! We'll get back to you soon.");
        setFormData({
            name: "",
            email: "",
            subject: "",
            message: ""
        });
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">About Our Clinic</h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Dedicated to providing exceptional healthcare services with compassion and expertise.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Section - About Information */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Our Story</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                Founded in 2010, our clinic has been serving the community with top-quality healthcare services.
                                We started with a small team of dedicated professionals and have grown into a comprehensive
                                healthcare facility with multiple specialties.
                            </p>
                            <p className="text-gray-700">
                                Our mission is to provide personalized, compassionate care to every patient who walks through our doors.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Our Team</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">Dr. Sarah Johnson</h3>
                                    <p className="text-gray-600">Chief Medical Officer</p>
                                    <p className="text-gray-700 mt-2">
                                        With over 15 years of experience, Dr. Johnson leads our team with expertise and compassion.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-lg">Dr. Michael Chen</h3>
                                    <p className="text-gray-600">Senior Physician</p>
                                    <p className="text-gray-700 mt-2">
                                        Specializing in internal medicine, Dr. Chen is known for his thorough approach to patient care.
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-lg">Nurse Emily Rodriguez</h3>
                                    <p className="text-gray-600">Head Nurse</p>
                                    <p className="text-gray-700 mt-2">
                                        Our nursing team lead with a focus on patient comfort and wellbeing.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Our Facility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">
                                Our state-of-the-art facility includes:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>Modern examination rooms</li>
                                <li>On-site laboratory services</li>
                                <li>Digital imaging center</li>
                                <li>Comfortable waiting areas</li>
                                <li>Wheelchair accessible facilities</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Section - Contact Information */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Get In Touch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg">Location</h3>
                                    <p className="text-gray-700">Wadi Musalam St. - Najib Nasser Building</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg">Email</h3>
                                    <p className="text-gray-700">contact@ourclinic.com</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg">Phone</h3>
                                    <p className="text-gray-700">(123) 456-7890</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg">Hours of Operation</h3>
                                    <p className="text-gray-700">
                                        Monday - Friday: 8:00 AM - 6:00 PM<br />
                                        Saturday: 9:00 AM - 2:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>

                                <Separator className="my-6" />

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h3 className="font-semibold text-lg">Send Us a Message</h3>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject
                                        </label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            type="text"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Send Message
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;