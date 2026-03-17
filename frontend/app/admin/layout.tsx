"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  );
}
