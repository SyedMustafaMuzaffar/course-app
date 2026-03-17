"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Subject, Section, Video } from '@/types';
import api from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

export default function CourseManagement() {
  const { id } = useParams();
  const router = useRouter();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [videosMap, setVideosMap] = useState<Record<number, Video[]>>({});
  const [loading, setLoading] = useState(true);

  // New section form
  const [newSectionTitle, setNewSectionTitle] = useState('');
  
  // New video form
  const [activeSectionForVideo, setActiveSectionForVideo] = useState<number | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', url: '', duration: 0 });

  const fetchData = async () => {
    try {
      const { data: sub } = await api.get(`/subjects/${id}`);
      setSubject(sub);

      const { data: sects } = await api.get(`/sections/subject/${id}`);
      setSections(sects);

      const vMap: Record<number, Video[]> = {};
      for (const sect of sects) {
        const { data: vids } = await api.get(`/videos/section/${sect.id}`);
        vMap[sect.id] = vids;
      }
      setVideosMap(vMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sections', {
        subject_id: Number(id),
        title: newSectionTitle,
        order_index: sections.length
      });
      setNewSectionTitle('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent, sectionId: number) => {
    e.preventDefault();
    try {
      const vids = videosMap[sectionId] || [];
      await api.post('/videos', {
        section_id: sectionId,
        title: newVideo.title,
        youtube_url: newVideo.url,
        duration: newVideo.duration,
        order_index: vids.length
      });
      setActiveSectionForVideo(null);
      setNewVideo({ title: '', url: '', duration: 0 });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await api.delete(`/videos/${videoId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'video') {
      const sectionId = Number(source.droppableId.split('-')[1]);
      const videos = Array.from(videosMap[sectionId] || []);
      const [movedVideo] = videos.splice(source.index, 1);
      videos.splice(destination.index, 0, movedVideo);

      // Optimistic update
      setVideosMap({ ...videosMap, [sectionId]: videos });

      // Save to server
      const updates = videos.map((v, idx) => ({ id: v.id, order_index: idx }));
      try {
        await api.post('/videos/reorder', { updates });
      } catch (err) {
        console.error('Failed to reorder videos', err);
        fetchData(); // Rollback
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/admin/dashboard')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-2 inline-block">
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{subject?.title}</h1>
          <p className="text-slate-500 mt-1">Manage course content</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-xl font-bold mb-4 text-slate-900">Add Section</h2>
        <form onSubmit={handleCreateSection} className="flex gap-4">
          <div className="flex-1">
            <Input 
              value={newSectionTitle} 
              onChange={e => setNewSectionTitle(e.target.value)} 
              placeholder="Section Title (e.g., Module 1: Basics)"
              required
            />
          </div>
          <Button type="submit">Add Section</Button>
        </form>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200">
                <h3 className="font-bold text-slate-900">{section.title}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveSectionForVideo(section.id)}>
                    <Plus size={16} className="mr-1" /> Add Video
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {activeSectionForVideo === section.id && (
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <h4 className="font-medium mb-3 text-slate-900">New Video</h4>
                  <form onSubmit={(e) => handleCreateVideo(e, section.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Video Title" 
                      required 
                      value={newVideo.title} 
                      onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} 
                    />
                    <Input 
                      label="YouTube Embedded URL" 
                      placeholder="https://www.youtube.com/embed/..."
                      required 
                      value={newVideo.url} 
                      onChange={e => setNewVideo({ ...newVideo, url: e.target.value })} 
                    />
                    <Input 
                      label="Duration (seconds)" 
                      type="number"
                      required 
                      value={newVideo.duration} 
                      onChange={e => setNewVideo({ ...newVideo, duration: Number(e.target.value) })} 
                    />
                    <div className="flex items-end space-x-2">
                      <Button type="submit">Save Video</Button>
                      <Button type="button" variant="ghost" onClick={() => setActiveSectionForVideo(null)}>Cancel</Button>
                    </div>
                  </form>
                </div>
              )}

              <Droppable droppableId={`section-${section.id}`} type="video">
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="p-4"
                  >
                    {(videosMap[section.id] || []).length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-sm">No videos in this section yet</div>
                    ) : null}
                    
                    {(videosMap[section.id] || []).map((video, index) => (
                      <Draggable key={video.id.toString()} draggableId={`video-${video.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-3 mb-2 bg-white rounded-lg border 
                              ${snapshot.isDragging ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <GripVertical size={20} />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{video.title}</h4>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">{video.youtube_url}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </main>
  );
}
