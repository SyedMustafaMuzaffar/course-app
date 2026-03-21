"use client";

import { useEffect, useState, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { Subject, Section, Video } from '@/types';
import { PlayCircle, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { memo } from 'react';

const getEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/embed/')) return url;
  const idMatch = url.match(/[?&]v=([^&#]+)/);
  if (idMatch) return `https://www.youtube.com/embed/${idMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^&#]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  return url;
};

const VideoPlayer = memo(({ url, startTime }: { url: string; startTime: number }) => (
  <iframe
    width="100%"
    height="100%"
    src={`${getEmbedUrl(url)}?start=${startTime}&autoplay=1&modestbranding=1&rel=0&showinfo=0`}
    title="Video Player"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
    className="w-full h-full"
  ></iframe>
));

VideoPlayer.displayName = 'VideoPlayer';

export default function VideoLearningInterface() {
  const { courseId } = useParams();
  const router = useRouter();
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [videosMap, setVideosMap] = useState<Record<number, Video[]>>({});
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  
  // Progress tracking
  const [watchTime, setWatchTime] = useState(0);
  const [initialStartTime, setInitialStartTime] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // 1. Verify enrollment
        const { data: { isEnrolled } } = await api.get(`/enrollments/check/${courseId}`);
        if (!isEnrolled) {
          router.push('/courses');
          return;
        }

        // 2. Fetch subject with hierarchical content (sections + videos)
        const { data: sub } = await api.get(`/subjects/${courseId}?t=${Date.now()}`);
        setSubject(sub);
        
        if (sub.sections) {
          setSections(sub.sections);
          const vMap: Record<number, Video[]> = {};
          let firstVid: Video | null = null;
          
          sub.sections.forEach((sect: any) => {
            vMap[sect.id] = sect.videos || [];
            if (!firstVid && sect.videos?.length > 0) {
              firstVid = sect.videos[0];
            }
          });
          setVideosMap(vMap);
          if (firstVid) setActiveVideo(firstVid);
        }

        // 3. Fetch progress
        const { data: progList } = await api.get(`/progress/subject/${courseId}?t=${Date.now()}`);
        const pMap: Record<number, boolean> = {};
        if (Array.isArray(progList)) {
          progList.forEach((p: any) => {
            pMap[p.video_id] = p.completed;
          });
        }
        setProgressMap(pMap);

      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, router]);

  // Handle active video progress load
  useEffect(() => {
    if (activeVideo) {
      api.get(`/progress/video/${activeVideo.id}`).then(({ data: vp }) => {
        const time = vp?.watched_seconds || 0;
        setWatchTime(time);
        setInitialStartTime(time);
      }).catch(() => {
        setWatchTime(0);
        setInitialStartTime(0);
      });
    }
  }, [activeVideo]);

  // Simulate video watching progress
  useEffect(() => {
    if (!activeVideo || progressMap[activeVideo.id]) return;

    const interval = setInterval(() => {
      setWatchTime(prev => {
        const next = prev + 5;
        const duration = activeVideo.duration || 600; // fallback 10m
        const isCompleted = next >= (duration * 0.9);
        
        if (isCompleted && !progressMap[activeVideo.id]) {
            api.post('/progress/update', {
                video_id: activeVideo.id,
                watched_seconds: next,
                completed: true
            }).then(() => {
                setProgressMap(curr => ({ ...curr, [activeVideo.id]: true }));
            });
        } else if (!isCompleted) {
            api.post('/progress/update', {
                video_id: activeVideo.id,
                watched_seconds: next,
                completed: false
            });
        }
        
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeVideo, progressMap]);

  const selectVideo = async (video: Video, isLocked: boolean) => {
    if (isLocked) return;
    setActiveVideo(video);
    try {
      const { data: vp } = await api.get(`/progress/video/${video.id}`);
      const time = vp?.watched_seconds || 0;
      setWatchTime(time);
      setInitialStartTime(time);
    } catch {
      setWatchTime(0);
      setInitialStartTime(0);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      </ProtectedRoute>
    );
  }

  // Calculate sequential unlock
  let allPreviousCompleted = true;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full border-x border-slate-200">
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-white">
            <div className="p-6 h-full flex flex-col">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">{activeVideo?.title || 'Course Overview'}</h1>
                <p className="text-slate-500 mt-1">{subject?.title}</p>
              </div>

              {activeVideo ? (
                <div className="flex-1 flex flex-col">
                  <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-slate-200">
                    <VideoPlayer 
                      url={activeVideo.youtube_url} 
                      startTime={initialStartTime} 
                    />
                  </div>


                  
                  <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <h4 className="font-semibold text-slate-800">Your Progress</h4>
                      <p className="text-sm text-slate-500">
                        {progressMap[activeVideo.id] 
                          ? 'Completed 🎉' 
                          : `Watching... (${Math.floor((watchTime / activeVideo.duration) * 100)}%)`}
                      </p>
                    </div>
                    {progressMap[activeVideo.id] ? (
                      <CheckCircle2 className="text-green-500 h-8 w-8" />
                    ) : (
                      <PlayCircle className="text-indigo-500 h-8 w-8 animate-pulse" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  Select a video from the sidebar to start learning
                </div>
              )}

              {/* Mobile Lesson List (Visible only on small screens) */}
              <div className="lg:hidden mt-8 border-t border-slate-200 pt-6">
                <h2 className="font-bold text-slate-900 mb-4">Course Content</h2>
                <div className="space-y-4">
                  {sections.map(section => (
                    <div key={section.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800 text-sm">{section.title}</h3>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {(videosMap[section.id] || []).map(video => {
                          const isCompleted = progressMap[video.id];
                          const isActive = activeVideo?.id === video.id;
                          return (
                            <button
                              key={video.id}
                              onClick={() => selectVideo(video, false)}
                              className={`w-full flex items-center p-3 text-left transition-colors
                                ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}
                              `}
                            >
                              <div className="flex-shrink-0 mr-3">
                                {isCompleted ? (
                                  <CheckCircle2 size={18} className="text-green-500" />
                                ) : (
                                  <PlayCircle size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                                  {video.title}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
              <h2 className="font-bold text-slate-900">Course Content</h2>
            </div>
            <div className="p-2 space-y-4">
              {sections.map(section => (
                <div key={section.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 pb-2">
                    <h3 className="font-semibold text-slate-800 text-sm">{section.title}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(videosMap[section.id] || []).map(video => {
                      const isCompleted = progressMap[video.id];
                      const isLocked = !allPreviousCompleted;
                      
                      // Update for next video iteration
                      if (!isCompleted) {
                        allPreviousCompleted = false;
                      }

                      const isActive = activeVideo?.id === video.id;

                      return (
                        <button
                          key={video.id}
                          onClick={() => selectVideo(video, isLocked)}
                          disabled={isLocked}
                          className={`w-full flex items-center p-3 text-left transition-colors
                            ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}
                            ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                        >
                          <div className="flex-shrink-0 mr-3">
                            {isCompleted ? (
                              <CheckCircle2 size={18} className="text-green-500" />
                            ) : isLocked ? (
                              <Lock size={18} className="text-slate-400" />
                            ) : (
                              <PlayCircle size={18} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {video.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  );
}
