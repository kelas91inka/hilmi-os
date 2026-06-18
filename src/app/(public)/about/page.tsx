import { Metadata } from 'next';
import { ArrowRight, Code2, Network, Server, Globe, Mail, Link2 } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tentang | Hilmi OS',
  description: 'Pelajari lebih lanjut tentang Muhammad Hilmi Mu\'afa — Network Engineer, Web Developer, dan Technology Enthusiast.',
};

const SKILLS = [
  { category: 'Network & Infrastructure', items: ['Cisco Networking', 'MikroTik', 'Linux Administration', 'Network Security', 'VLAN & Routing'] },
  { category: 'Web Development', items: ['Next.js', 'TypeScript', 'React', 'Supabase', 'TailwindCSS', 'PostgreSQL'] },
  { category: 'Tools & Platforms', items: ['Git', 'Docker', 'Vercel', 'Cloudinary', 'VS Code'] },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:py-24 space-y-20">
      {/* Siapa Saya */}
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Tentang Saya</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Muhammad Hilmi Mu&apos;afa
          </h1>
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Network engineer dan web developer yang percaya bahwa teknologi harus membuat hidup 
          lebih mudah — bukan lebih rumit. Saya membangun sistem yang elegan, cepat, dan bermakna.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:hilmi@muhlim.my.id"
            className="inline-flex items-center gap-2 text-sm border rounded-full px-4 py-2 hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <a
            href="https://github.com/hilmimuafa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm border rounded-full px-4 py-2 hover:bg-muted transition-colors"
          >
            <Link2 className="w-4 h-4" /> GitHub
          </a>
          <a
            href="https://linkedin.com/in/hilmimuafa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm border rounded-full px-4 py-2 hover:bg-muted transition-colors"
          >
            <Link2 className="w-4 h-4" /> LinkedIn
          </a>
        </div>
      </section>

      <div className="border-t" />

      {/* Perjalanan */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Perjalanan</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Ketertarikan saya pada teknologi dimulai sejak bangku sekolah menengah, ketika saya 
            pertama kali menyentuh konfigurasi jaringan komputer. Dari sana, saya tidak pernah berhenti 
            belajar — dari infrastruktur jaringan ke pengembangan web, dari command line ke user interface.
          </p>
          <p>
            Saya percaya bahwa seorang teknolog sejati harus memahami sistem secara menyeluruh, 
            dari lapisan fisik hingga pengalaman pengguna akhir. Filosofi ini yang mendorong saya 
            untuk terus mengeksplorasi kedua dunia — infrastruktur dan aplikasi.
          </p>
          <p>
            Saat ini saya sedang membangun <strong className="text-foreground">Hilmi OS</strong> — sebuah 
            sistem operasi personal berbasis web yang menggabungkan manajemen produktivitas, knowledge base, 
            dan portfolio profesional dalam satu platform terpadu.
          </p>
        </div>
      </section>

      <div className="border-t" />

      {/* Keahlian */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Keahlian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SKILLS.map((skill) => (
            <div key={skill.category} className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                {skill.category.includes('Network') && <Network className="w-4 h-4 text-primary" />}
                {skill.category.includes('Web') && <Code2 className="w-4 h-4 text-primary" />}
                {skill.category.includes('Tools') && <Server className="w-4 h-4 text-primary" />}
                <h3 className="font-semibold text-sm">{skill.category}</h3>
              </div>
              <ul className="space-y-1">
                {skill.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t" />

      {/* Fokus Saat Ini */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Fokus Saat Ini</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Globe, title: 'Hilmi OS', desc: 'Membangun personal operating system yang menjadi pusat aktivitas digital sehari-hari.' },
            { icon: Code2, title: 'Full-Stack Development', desc: 'Mendalami Next.js 15, TypeScript strict mode, dan arsitektur aplikasi modern.' },
            { icon: Network, title: 'Network Engineering', desc: 'Mengembangkan pemahaman infrastruktur jaringan enterprise dan security.' },
            { icon: Server, title: 'DevOps & Deployment', desc: 'Mempelajari containerization, CI/CD, dan manajemen infrastruktur cloud.' },
          ].map((item) => (
            <div key={item.title} className="p-5 rounded-xl border bg-card/50 space-y-2">
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t" />

      {/* Visi */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Visi</h2>
        <blockquote className="border-l-4 border-primary pl-6 py-2">
          <p className="text-lg text-muted-foreground italic leading-relaxed">
            "Saya ingin menjadi seseorang yang tidak hanya menggunakan teknologi — 
            tetapi menciptakannya. Membangun sistem yang bertahan lama, bermanfaat bagi banyak orang, 
            dan mencerminkan keahlian serta nilai-nilai saya."
          </p>
        </blockquote>
        <div className="pt-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Lihat apa yang sedang saya bangun <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
