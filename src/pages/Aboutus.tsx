// pages/AboutUs.tsx
import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { LanguageContext } from "@/components/contexts/LanguageContext";
import "./styles/aboutus.css";

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
        <div className={`about-container ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header Section */}
            <div className={`about-header ${isRTL ? 'rtl' : 'ltr'}`}>
                <h1 className={`about-title ${isRTL ? 'ltr' : 'ltr'}`}>
                    {t('aboutUs.title')}
                </h1>
                <p className={`about-subtitle ${isRTL ? 'ltr' : 'ltr'}`}>
                    {t('aboutUs.subtitle')}
                </p>
            </div>

            {/* Main Content Grid */}
            <div className={`about-main-grid ${isRTL ? 'rtl' : 'ltr'}`}>

                {/* Information Section */}
                <div className={`about-info-section ${isRTL ? 'rtl' : 'ltr'}`}>

                    {/* Our Story Card */}
                    <Card className="about-card card-animate"
                    >
                        <CardHeader>
                            <CardTitle className={`about-card-title ${isRTL ? 'rtl' : 'ltr'}`}>

                                {t('aboutUs.ourStory')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className={`about-text-content ${isRTL ? 'rtl' : 'ltr'}`}>

                                {t('aboutUs.ourStoryContent1')}
                            </p>
                            <p className={`about-text-content ${isRTL ? 'rtl' : 'ltr'}`}>

                                {t('aboutUs.ourStoryContent2')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Our Team Card */}
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className={`about-card-title ${isRTL ? 'rtl' : 'ltr'}`}>

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
                            <CardTitle className={`about-card-title ${isRTL ? 'rtl' : 'ltr'}`}>

                                {t('aboutUs.ourFacility')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`about-text-content ${isRTL ? 'rtl' : 'ltr'}`}>

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
                <div className={`about-contact-section ${isRTL ? 'rtl' : 'ltr'}`}>
                    <Card className="about-card contact-card">
                        <CardHeader>
                            <CardTitle className={`about-card-title ${isRTL ? 'rtl' : 'ltr'}`}>

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

                                    <form onSubmit={handleSubmit} className="contact-form">

                                        {/* Name Field */}
                                        <div className="form-field">
                                            <label htmlFor="name" className={`form-label ${isRTL ? 'rtl' : 'ltr'}`}>
                                                {t('common.name')}
                                            </label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className={`form-input touch-target ${isRTL ? 'rtl' : 'ltr'}`}
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
                                            className="submit-button touch-target"
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