"use client";

import { useEffect, useState } from 'react';
import { Subject } from '@/types';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default function AdminDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subjects', { title, description, thumbnail });
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setThumbnail('');
      fetchSubjects();
    } catch (err) {
      console.error(err);
      alert('Failed to create course');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Courses</h1>
        <Button onClick={() => setIsCreating(true)}>+ New Course</Button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Create New Course</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <Input 
              label="Course Title" 
              required 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
            <div className="w-full text-slate-900">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                required 
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                rows={3}
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>
            <Input 
              label="Thumbnail URL" 
              value={thumbnail} 
              onChange={e => setThumbnail(e.target.value)} 
              placeholder="https://example.com/image.jpg"
            />
            <div className="flex space-x-3 text-slate-900">
              <Button type="submit">Create</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-slate-900">
              {subjects.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                        {sub.thumbnail_url ? <img src={sub.thumbnail_url} className="w-full h-full object-cover" /> : '📚'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{sub.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/courses/${sub.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Manage Content
                    </Link>
                    <button onClick={() => handleDelete(sub.id)} className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-slate-500">No courses found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
