export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface Subject {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  price: number;
  duration_hours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  students_count: number;
  rating: number;
}


export interface Section {
  id: number;
  subject_id: number;
  title: string;
  order_index: number;
}

export interface Video {
  id: number;
  section_id: number;
  title: string;
  youtube_url: string;
  duration: number;
  order_index: number;
}

export interface Enrollment {
  id: number;
  user_id: number;
  subject_id: number;
  enrolled_at: string;
  subject_title?: string;
  thumbnail_url?: string;
}

export interface Progress {
  user_id: number;
  video_id: number;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
}
