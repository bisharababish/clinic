import * as React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import AdminLoginButton from "../auth/AdminLoginButton";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Clinic Info (Right) */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Bethlehem Clinic Center</h3>
            <p className="text-sm text-muted-foreground">
              Providing quality healthcare services since 2025
            </p>
          </div>


          {/* Quick Links (Middle) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="#" className="text-sm text-primary hover:underline">About Us</a>
              <a href="#" className="text-sm text-primary hover:underline">Services</a>
              <a href="#" className="text-sm text-primary hover:underline">Doctors</a>
              <a href="#" className="text-sm text-primary hover:underline">Appointments</a>
              <a href="#" className="text-sm text-primary hover:underline">Privacy Policy</a>
              <a href="#" className="text-sm text-primary hover:underline">Terms of Use</a>
            </div>
          </div>


          {/* Contact Info (Left) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                <span>+123 456 7890</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@clinic.com</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>Beit Sahour, ASSAKJHD</span>
              </div>
            </div>
          </div>




        </div>

        <div className="mt-8 pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full flex justify-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Clinic. All rights reserved.
            </p>
          </div>
          <AdminLoginButton />
        </div>
      </div>
    </footer>
  );
};

export default Footer;