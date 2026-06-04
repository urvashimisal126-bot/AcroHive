import React from 'react';
import { UserCircle, Shield } from 'lucide-react';
import { RoleCard } from '@/components/auth/RoleCard';

/**
 * /auth — Role selector page.
 * Two cards: Student and Admin.
 */
export default function AuthPage() {
  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background geometric shapes at 4% opacity */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circle */}
        <svg
          className="absolute top-[15%] left-[10%] opacity-[0.04]"
          width="200"
          height="200"
          viewBox="0 0 200 200"
        >
          <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
        {/* Triangle */}
        <svg
          className="absolute bottom-[20%] right-[8%] opacity-[0.04]"
          width="180"
          height="180"
          viewBox="0 0 180 180"
        >
          <polygon
            points="90,10 170,170 10,170"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        {/* Square */}
        <svg
          className="absolute top-[60%] left-[65%] opacity-[0.04]"
          width="140"
          height="140"
          viewBox="0 0 140 140"
        >
          <rect
            x="10"
            y="10"
            width="120"
            height="120"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        {/* Small circle */}
        <svg
          className="absolute top-[8%] right-[25%] opacity-[0.03]"
          width="100"
          height="100"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[780px]">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Choose Your Role
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto">
            Your access level determines what you can see and do.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <RoleCard
            icon={<UserCircle className="w-10 h-10" />}
            title="Student"
            badge="ATTENDEE"
            description="Browse events, register instantly, collect your QR tickets and check in at the venue."
            buttonLabel="Enter Student Portal →"
            buttonVariant="primary"
            route="/auth/student"
          />
          <RoleCard
            icon={<Shield className="w-10 h-10" />}
            title="Admin"
            badge="ORGANIZER"
            description="Create events, monitor live registrations, open attendance windows and generate certificates."
            buttonLabel="Enter Command Center →"
            buttonVariant="outline"
            route="/auth/admin"
          />
        </div>
      </div>
    </div>
  );
}
