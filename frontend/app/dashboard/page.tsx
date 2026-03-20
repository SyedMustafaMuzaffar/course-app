"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { Enrollment } from '@/types';
import Link from 'next/link';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get(`/enrollments/my?t=${Date.now()}`);
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to load enrollments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">My Learning</h1>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-2">No courses yet</h3>
              <p className="text-slate-500 mb-6">You haven't enrolled in any courses yet.</p>
              <Link href="/courses" className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm h-10 px-4 py-2">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enr) => (
                <Link key={enr.id} href={`/learn/${enr.subject_id}`} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    {enr.thumbnail_url ? (
                      <img src={enr.thumbnail_url} alt={enr.subject_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-4xl text-slate-300">🎓</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {enr.subject_title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Enrolled on {new Date(enr.enrolled_at).toLocaleDateString()}
                    </p>
                    <div className="mt-4 flex items-center text-sm font-medium text-indigo-600">
                      Continue Learning →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
