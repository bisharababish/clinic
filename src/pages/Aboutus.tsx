// pages/AboutUs.tsx
import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/components/contexts/LanguageContext";

const AboutUs = () => {
    const { t } = useTranslation();
    const { isRTL } = useContext(LanguageContext);

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
        console.log("Form submitted:", formData);
        alert(t('aboutUs.thankYouMessage'));
        setFormData({
            name: "",
            email: "",
            subject: "",
            message: ""
        });
    };

    return (
        <div
            className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
                fontFamily: isRTL ? '"Noto Sans Arabic", "Cairo", "Segoe UI", Tahoma, Arial, sans-serif' : 'inherit'
            }}
        >
            {/* Header Section */}
            <div className={`mb-12 ${isRTL ? 'text-right' : 'text-center'}`}>
                <h1
                    className="text-4xl font-bold text-gray-900 mb-6"
                    style={{
                        textAlign: isRTL ? 'right' : 'center',
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}
                >
                    {t('aboutUs.title')}
                </h1>
                <p
                    className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed"
                    style={{
                        textAlign: isRTL ? 'right' : 'center',
                        direction: isRTL ? 'rtl' : 'ltr',
                        lineHeight: isRTL ? '2.0' : '1.6',
                        // Fix for Arabic subtitle spacing
                        marginLeft: isRTL ? '0' : 'auto',
                        marginRight: isRTL ? '0' : 'auto'
                    }}
                >
                    {t('aboutUs.subtitle')}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>

                {/* Information Section */}
                <div className={`space-y-8 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>

                    {/* Our Story Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle
                                className="text-2xl font-bold"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            >
                                {t('aboutUs.ourStory')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p
                                className="text-gray-700"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr',
                                    lineHeight: isRTL ? '2.2' : '1.7',
                                    fontSize: isRTL ? '16px' : '15px'
                                }}
                            >
                                {t('aboutUs.ourStoryContent1')}
                            </p>
                            <p
                                className="text-gray-700"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr',
                                    lineHeight: isRTL ? '2.2' : '1.7',
                                    fontSize: isRTL ? '16px' : '15px'
                                }}
                            >
                                {t('aboutUs.ourStoryContent2')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Our Team Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle
                                className="text-2xl font-bold"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            >
                                {t('aboutUs.ourTeam')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">

                                {/* Team Member 1 */}
                                <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                    <h3 className="font-bold text-lg text-blue-600 mb-1">
                                        {t('aboutUs.drSarahJohnson')}
                                    </h3>
                                    <p className="text-blue-500 font-medium mb-3">
                                        {t('aboutUs.chiefMedicalOfficer')}
                                    </p>
                                    <p
                                        className="text-gray-700"
                                        style={{
                                            lineHeight: isRTL ? '2.1' : '1.6',
                                            fontSize: isRTL ? '15px' : '14px'
                                        }}
                                    >
                                        {t('aboutUs.drSarahDesc')}
                                    </p>
                                </div>

                                <Separator className="my-6" />

                                {/* Team Member 2 */}
                                <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                    <h3 className="font-bold text-lg text-blue-600 mb-1">
                                        {t('aboutUs.drMichaelChen')}
                                    </h3>
                                    <p className="text-blue-500 font-medium mb-3">
                                        {t('aboutUs.seniorPhysician')}
                                    </p>
                                    <p
                                        className="text-gray-700"
                                        style={{
                                            lineHeight: isRTL ? '2.1' : '1.6',
                                            fontSize: isRTL ? '15px' : '14px'
                                        }}
                                    >
                                        {t('aboutUs.drMichaelDesc')}
                                    </p>
                                </div>

                                <Separator className="my-6" />

                                {/* Team Member 3 */}
                                <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                    <h3 className="font-bold text-lg text-blue-600 mb-1">
                                        {t('aboutUs.nurseEmily')}
                                    </h3>
                                    <p className="text-blue-500 font-medium mb-3">
                                        {t('aboutUs.headNurse')}
                                    </p>
                                    <p
                                        className="text-gray-700"
                                        style={{
                                            lineHeight: isRTL ? '2.1' : '1.6',
                                            fontSize: isRTL ? '15px' : '14px'
                                        }}
                                    >
                                        {t('aboutUs.nurseEmilyDesc')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Our Facility Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle
                                className="text-2xl font-bold"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            >
                                {t('aboutUs.ourFacility')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className="text-gray-700 mb-6"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr',
                                    lineHeight: isRTL ? '2.2' : '1.7',
                                    fontSize: isRTL ? '16px' : '15px'
                                }}
                            >
                                {t('aboutUs.facilityIntro')}
                            </p>

                            {/* Facility Features List - COMPLETELY FIXED FOR RTL */}
                            <div className="space-y-4">
                                {[
                                    t('aboutUs.facilityFeatures.examRooms'),
                                    t('aboutUs.facilityFeatures.labServices'),
                                    t('aboutUs.facilityFeatures.imagingCenter'),
                                    t('aboutUs.facilityFeatures.waitingAreas'),
                                    t('aboutUs.facilityFeatures.accessibility')
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="relative"
                                        style={{
                                            textAlign: isRTL ? 'right' : 'left',
                                            direction: isRTL ? 'rtl' : 'ltr'
                                        }}
                                    >
                                        {isRTL ? (
                                            <div className="flex items-start justify-end">
                                                <span
                                                    className="text-gray-700"
                                                    style={{
                                                        textAlign: 'right',
                                                        direction: 'rtl',
                                                        lineHeight: '2.0',
                                                        fontSize: '15px',
                                                        paddingRight: '24px',
                                                        display: 'block',
                                                        width: '100%'
                                                    }}
                                                >
                                                    {feature}
                                                </span>
                                                <span
                                                    className="text-blue-500 text-lg font-bold"
                                                    style={{
                                                        position: 'absolute',
                                                        right: '0px',
                                                        top: '4px'
                                                    }}
                                                >
                                                    •
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-start">
                                                <span
                                                    className="text-blue-500 text-lg font-bold"
                                                    style={{
                                                        marginTop: '4px',
                                                        marginRight: '12px',
                                                        lineHeight: '1'
                                                    }}
                                                >
                                                    •
                                                </span>
                                                <span
                                                    className="text-gray-700"
                                                    style={{
                                                        textAlign: 'left',
                                                        lineHeight: '1.6',
                                                        fontSize: '14px',
                                                        flex: '1'
                                                    }}
                                                >
                                                    {feature}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Section */}
                <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'}`}>
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-fit sticky top-8">
                        <CardHeader>
                            <CardTitle
                                className="text-2xl font-bold"
                                style={{
                                    textAlign: isRTL ? 'right' : 'left',
                                    direction: isRTL ? 'rtl' : 'ltr'
                                }}
                            >
                                {t('aboutUs.getInTouch')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">

                                {/* Contact Information */}
                                <div className="space-y-6">

                                    {/* Location */}
                                    <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <h3 className="font-bold text-lg text-blue-600 mb-3">
                                            {t('aboutUs.location')}
                                        </h3>
                                        <div
                                            className="text-gray-700 space-y-2"
                                            style={{
                                                lineHeight: isRTL ? '2.0' : '1.6',
                                                fontSize: isRTL ? '15px' : '14px'
                                            }}
                                        >
                                            <p>{t('footer.address')}</p>
                                            <p>{t('footer.city')}</p>
                                        </div>
                                    </div>

                                    {/* Email - FIXED */}
                                    <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <h3 className="font-bold text-lg text-blue-600 mb-3">
                                            {t('aboutUs.email')}
                                        </h3>
                                        <p
                                            className="text-gray-700"
                                            style={{
                                                textAlign: isRTL ? 'right' : 'left',
                                                direction: 'ltr',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {t('aboutUs.contactEmail')}
                                        </p>
                                    </div>

                                    {/* Phone - FIXED */}
                                    <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <h3 className="font-bold text-lg text-blue-600 mb-3">
                                            {t('aboutUs.phone')}
                                        </h3>
                                        <p
                                            className="text-gray-700"
                                            style={{
                                                textAlign: isRTL ? 'right' : 'left',
                                                direction: 'ltr',
                                                fontFamily: 'monospace'
                                            }}
                                        >
                                            {t('aboutUs.contactPhone')}
                                        </p>
                                    </div>

                                    {/* Hours */}
                                    <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <h3 className="font-bold text-lg text-blue-600 mb-3">
                                            {t('aboutUs.hoursOfOperation')}
                                        </h3>
                                        <div
                                            className="text-gray-700 space-y-2"
                                            style={{
                                                lineHeight: isRTL ? '2.0' : '1.6',
                                                fontSize: isRTL ? '15px' : '14px'
                                            }}
                                        >
                                            <p>{t('aboutUs.mondayFriday')}</p>
                                            <p>{t('aboutUs.saturday')}</p>
                                            <p>{t('aboutUs.sunday')}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-8" />

                                {/* Contact Form */}
                                <div style={{ textAlign: isRTL ? 'right' : 'left', direction: isRTL ? 'rtl' : 'ltr' }}>
                                    <h3 className="font-bold text-xl text-blue-600 mb-6">
                                        {t('aboutUs.sendMessage')}
                                    </h3>

                                    <form onSubmit={handleSubmit} className="space-y-6">

                                        {/* Name Field */}
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                            >
                                                {t('common.name')}
                                            </label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full transition-all duration-200"
                                                style={{
                                                    textAlign: isRTL ? 'right' : 'left',
                                                    direction: isRTL ? 'rtl' : 'ltr',
                                                    fontFamily: isRTL ? '"Noto Sans Arabic", "Cairo", Arial, sans-serif' : 'inherit',
                                                    fontSize: isRTL ? '15px' : '14px'
                                                }}
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                            >
                                                {t('common.email')}
                                            </label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full transition-all duration-200"
                                                style={{
                                                    textAlign: isRTL ? 'right' : 'left',
                                                    direction: 'ltr'
                                                }}
                                            />
                                        </div>

                                        {/* Subject Field */}
                                        <div>
                                            <label
                                                htmlFor="subject"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                            >
                                                {t('aboutUs.subject')}
                                            </label>
                                            <Input
                                                id="subject"
                                                name="subject"
                                                type="text"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full transition-all duration-200"
                                                style={{
                                                    textAlign: isRTL ? 'right' : 'left',
                                                    direction: isRTL ? 'rtl' : 'ltr',
                                                    fontFamily: isRTL ? '"Noto Sans Arabic", "Cairo", Arial, sans-serif' : 'inherit',
                                                    fontSize: isRTL ? '15px' : '14px'
                                                }}
                                            />
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="block text-sm font-semibold text-gray-700 mb-2"
                                                style={{ textAlign: isRTL ? 'right' : 'left' }}
                                            >
                                                {t('aboutUs.message')}
                                            </label>
                                            <Textarea
                                                id="message"
                                                name="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                className="w-full transition-all duration-200 resize-none"
                                                style={{
                                                    textAlign: isRTL ? 'right' : 'left',
                                                    direction: isRTL ? 'rtl' : 'ltr',
                                                    fontFamily: isRTL ? '"Noto Sans Arabic", "Cairo", Arial, sans-serif' : 'inherit',
                                                    lineHeight: isRTL ? '1.9' : '1.5',
                                                    fontSize: isRTL ? '15px' : '14px'
                                                }}
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full py-3 text-lg font-semibold transition-all duration-200 hover:shadow-lg"
                                        >
                                            {t('aboutUs.sendMessageBtn')}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;