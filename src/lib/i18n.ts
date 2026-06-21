import { id as localeId, enUS as localeEn } from 'date-fns/locale';

export type Language = 'id' | 'en';

export const translations = {
  id: {
    common: {
      back: 'Kembali',
      readMore: 'Baca Selengkapnya',
      updated: 'Diperbarui',
      now: 'Sekarang',
      all: 'Semua',
    },
    navbar: {
      home: 'Home',
      explore: 'Explore',
      projects: 'Projects',
    },
    hero: {
      collaboration: 'Tersedia untuk kolaborasi',
      tagline: 'Student · Builder · System Administrator',
      statement: 'Membangun sistem yang memecahkan masalah nyata. Mengeksplorasi teknologi, pendidikan, dan inovasi.',
      ctaExplore: 'Explore My Journey',
      ctaContact: 'Get in Touch',
    },
    about: {
      title: 'Tentang Saya',
      subtitle: 'About Muhlim',
      education: 'Pendidikan',
      techStack: 'Tech Stack',
    },
    projects: {
      title: 'Proyek',
      subtitle: 'Yang Sedang Saya Bangun',
      description: 'Kumpulan proyek yang mencerminkan eksplorasi saya di bidang teknologi — dari infrastruktur jaringan hingga aplikasi web modern.',
      featured: 'Featured Projects',
      active: '🟢 Sedang Aktif',
      other: 'Proyek Lainnya',
      detail: 'Lihat Detail',
      empty: 'Belum ada proyek yang dipublikasikan.',
      back: 'Kembali ke Proyek',
      aboutProject: 'Tentang Proyek',
      timeline: 'Linimasa',
      ctaText: 'Tertarik berkolaborasi atau ingin tahu lebih lanjut?',
      ctaButton: 'Hubungi Saya',
    },
    explore: {
      title: 'Explore',
      subtitle: 'Konten, perjalanan, dan pencapaian yang membentuk saya.',
      tabs: {
        feed: 'Feed',
        journey: 'Journey',
        achievements: 'Achievements',
      },
      feed: {
        all: 'Semua',
        article: 'Artikel',
        thread: 'Thread',
        text: 'Catatan',
        image: 'Foto',
        video: 'Video',
        projectUpdate: 'Project Update',
        empty: 'Belum ada konten di kategori ini.',
      },
      journey: {
        empty: 'Belum ada linimasa yang dipublikasikan.',
      },
      achievements: {
        empty: 'Belum ada pencapaian yang dipublikasikan.',
        dialogTitle: 'Detail Pencapaian',
        dialogClose: 'Tutup',
      },
    },
    stats: {
      years: 'Tahun Belajar Tech',
      projects: 'Proyek Dibangun',
      competitions: 'Kompetisi Diikuti',
      passion: 'Semangat Belajar',
    },
    contact: {
      title: 'Kontak',
      subtitle: 'Mari Berkolaborasi',
      description: 'Saya terbuka untuk proyek, diskusi, atau sekadar berbagi ilmu. Jangan ragu untuk menghubungi.',
    },
    footer: {
      builtWith: 'Dibuat dengan',
      rights: 'Muhammad Hilmi Mu\'afa. Hak Cipta Dilindungi.',
    },
    now: {
      back: 'Kembali',
      title: 'Sekarang',
      subtitle: 'Halaman ini menampilkan apa yang sedang saya fokuskan saat ini. Diperbarui:',
      inspired: 'Terinspirasi dari',
      where: '📍 Di Mana',
      whereDesc: 'Sedang berada di Indonesia, fokus pada pengembangan diri sebagai network engineer dan web developer. Aktif belajar, membangun proyek, dan mendokumentasikan perjalanan.',
      building: 'Sedang Dibangun',
      activeGoals: 'Tujuan Aktif',
      recentWriting: 'Tulisan Terbaru',
      contact: '✉️ Kontak',
      contactDesc: 'Ingin berkolaborasi atau sekadar ngobrol? Kirim email atau cek halaman Tentang.',
      emailBtn: 'Kirim email',
      aboutBtn: 'Tentang',
    },
    comments: {
      header: 'Komentar',
      anonymous: 'Anonymous',
      placeholderName: 'Nama (opsional) — tampil sebagai Anonymous jika kosong',
      placeholderBody: 'Tulis komentar...',
      errorSubmit: 'Gagal mengirim komentar.',
      successSubmit: '✓ Komentar dikirim. Akan tampil setelah disetujui. Terima kasih!',
      addComment: 'Tinggalkan Komentar',
      reviewNotice: 'Komentar akan ditinjau sebelum dipublikasikan.',
      submitBtn: 'Kirim',
      submittingBtn: 'Mengirim...',
      emptyState: 'Belum ada komentar. Jadilah yang pertama!',
      readTime: 'min baca',
      featuredStory: 'Cerita Unggulan',
      latestPosts: 'Tulisan Terbaru',
    }
  },
  en: {
    common: {
      back: 'Back',
      readMore: 'Read More',
      updated: 'Updated',
      now: 'Now',
      all: 'All',
    },
    navbar: {
      home: 'Home',
      explore: 'Explore',
      projects: 'Projects',
    },
    hero: {
      collaboration: 'Available for collaboration',
      tagline: 'Student · Builder · System Administrator',
      statement: 'Building systems that solve real problems. Exploring technology, education, and innovation.',
      ctaExplore: 'Explore My Journey',
      ctaContact: 'Get in Touch',
    },
    about: {
      title: 'About Me',
      subtitle: 'About Muhlim',
      education: 'Education',
      techStack: 'Tech Stack',
    },
    projects: {
      title: 'Projects',
      subtitle: 'What I\'m Building',
      description: 'A collection of projects reflecting my exploration in technology — from network infrastructure to modern web apps.',
      featured: 'Featured Projects',
      active: '🟢 Active Now',
      other: 'Other Projects',
      detail: 'View Detail',
      empty: 'No projects have been published yet.',
      back: 'Back to Projects',
      aboutProject: 'About the Project',
      timeline: 'Timeline',
      ctaText: 'Interested in collaborating or want to know more?',
      ctaButton: 'Contact Me',
    },
    explore: {
      title: 'Explore',
      subtitle: 'Content, journey, and achievements that shape me.',
      tabs: {
        feed: 'Feed',
        journey: 'Journey',
        achievements: 'Achievements',
      },
      feed: {
        all: 'All',
        article: 'Article',
        thread: 'Thread',
        text: 'Notes',
        image: 'Photo',
        video: 'Video',
        projectUpdate: 'Project Update',
        empty: 'No content in this category yet.',
      },
      journey: {
        empty: 'No timeline has been published yet.',
      },
      achievements: {
        empty: 'No achievements have been published yet.',
        dialogTitle: 'Achievement Detail',
        dialogClose: 'Close',
      },
    },
    stats: {
      years: 'Years Learning Tech',
      projects: 'Projects Built',
      competitions: 'Competitions Joined',
      passion: 'Passion for Learning',
    },
    contact: {
      title: 'Contact',
      subtitle: 'Let\'s Collaborate',
      description: 'I\'m open for projects, discussions, or just sharing knowledge. Feel free to reach out.',
    },
    footer: {
      builtWith: 'Built with',
      rights: 'Muhammad Hilmi Mu\'afa. All Rights Reserved.',
    },
    now: {
      back: 'Back',
      title: 'Now',
      subtitle: 'This page shows what I\'m focused on right now. Updated:',
      inspired: 'Inspired by',
      where: '📍 Where',
      whereDesc: 'Based in Indonesia, focusing on self-development as a network engineer and web developer. Actively learning, building projects, and documenting my journey.',
      building: 'Currently Building',
      activeGoals: 'Active Goals',
      recentWriting: 'Recent Writing',
      contact: '✉️ Contact',
      contactDesc: 'Interested in collaborating or just chatting? Send an email or check the About page.',
      emailBtn: 'Send email',
      aboutBtn: 'About',
    },
    comments: {
      header: 'Comments',
      anonymous: 'Anonymous',
      placeholderName: 'Name (optional) — appears as Anonymous if empty',
      placeholderBody: 'Write a comment...',
      errorSubmit: 'Failed to submit comment.',
      successSubmit: '✓ Comment submitted. It will appear after approval. Thank you!',
      addComment: 'Leave a Comment',
      reviewNotice: 'Comments will be moderated before publication.',
      submitBtn: 'Submit',
      submittingBtn: 'Submitting...',
      emptyState: 'No comments yet. Be the first to comment!',
      readTime: 'min read',
      featuredStory: 'Featured Story',
      latestPosts: 'Latest Posts',
    }
  },
};



export function getLanguageClient(): Language {
  if (typeof window === 'undefined') return 'id';
  const match = document.cookie.match(/(^| )lang=([^;]+)/);
  const lang = match ? match[2] : localStorage.getItem('lang');
  return (lang === 'en' ? 'en' : 'id') as Language;
}

export function getDateLocale(lang: Language) {
  return lang === 'en' ? localeEn : localeId;
}

export const getStatusLabel = (status: string, lang: Language) => {
  const labels: Record<string, Record<Language, string>> = {
    planning: { id: 'Perencanaan', en: 'Planning' },
    active: { id: 'Aktif', en: 'Active' },
    paused: { id: 'Dijeda', en: 'Paused' },
    completed: { id: 'Selesai', en: 'Completed' },
    archived: { id: 'Diarsipkan', en: 'Archived' },
  };
  return labels[status]?.[lang] || status;
};

export const getPostTypeLabel = (type: string, lang: Language) => {
  const labels: Record<string, Record<Language, string>> = {
    text: { id: 'Catatan', en: 'Notes' },
    thread: { id: 'Thread', en: 'Thread' },
    image: { id: 'Foto', en: 'Photo' },
    video: { id: 'Video', en: 'Video' },
    article: { id: 'Artikel', en: 'Article' },
    project_update: { id: 'Project Update', en: 'Project Update' },
    mixed: { id: 'Post', en: 'Post' },
  };
  return labels[type]?.[lang] || type;
};
