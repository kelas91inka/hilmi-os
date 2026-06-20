import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, CalendarIcon, Globe, Lock, Star, Image as ImageIcon } from "lucide-react";
import { projectService } from "@/features/projects/services/project.service";
import { noteService } from "@/features/notes/services/note.service";
import { PROJECT_VISIBILITY } from "@/features/projects/types/project.types";
import { TaskBoard } from "@/features/tasks/components/TaskBoard";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TASK_STATUS, TASK_PRIORITY } from "@/features/tasks/types/task.types";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageContextSetter } from "@/features/ai/components/PageContextSetter";
import { ProjectTimelineForm } from "@/features/projects/components/ProjectTimelineForm";
import { DeleteTimelineEventButton } from "@/features/projects/components/DeleteTimelineEventButton";
import { ProjectStatusBadge } from "@/features/projects/components/ProjectStatusBadge";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await projectService.getProjectDetails(id);
  if (!project) return { title: "Project Not Found" };
  return { title: `${project.title} | Hilmi OS` };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await projectService.getProjectDetails(id);

  if (!project) {
    notFound();
  }

  // Fetch linked notes
  const notes = await noteService.getNotesByLinkedId('project', id);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 max-w-7xl mx-auto w-full">
      <PageContextSetter context={`Detail Proyek: ${project.title}`} />
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Link href="/portal/projects" className="hover:text-foreground flex items-center transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Proyek
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {project.title}
            {project.featured && <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />}
          </h2>
          
          <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-2 gap-4">
            <ProjectStatusBadge status={project.status} />
            
            <div className="flex items-center">
              {project.visibility === PROJECT_VISIBILITY.PUBLIC ? (
                <Globe className="mr-1 h-3 w-3" />
              ) : (
                <Lock className="mr-1 h-3 w-3" />
              )}
              {project.visibility === PROJECT_VISIBILITY.PUBLIC ? "Publik" : "Privat"}
            </div>

            {project.start_date && (
              <div className="flex items-center">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(new Date(project.start_date), "dd MMM yyyy", { locale: localeId })}
                {project.end_date ? ` - ${format(new Date(project.end_date), "dd MMM yyyy", { locale: localeId })}` : " - Sekarang"}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 border-b bg-transparent rounded-none w-full justify-start h-auto p-0 space-x-6 overflow-x-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-0 font-medium"
          >
            Ikhtisar
          </TabsTrigger>
          <TabsTrigger 
            value="tasks" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-0 font-medium"
          >
            Tugas
            <Badge variant="secondary" className="ml-2 bg-muted text-[10px] px-1.5">{project.tasks?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-0 font-medium"
          >
            Catatan
            <Badge variant="secondary" className="ml-2 bg-muted text-[10px] px-1.5">{notes.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="timeline" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none py-3 px-0 font-medium"
          >
            Linimasa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          {project.cover_image ? (
            <div className="w-full aspect-[21/9] sm:aspect-[3/1] bg-muted rounded-xl overflow-hidden relative border shadow-sm">
              <img 
                src={project.cover_image} 
                alt={project.title} 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[21/9] sm:aspect-[3/1] rounded-xl overflow-hidden relative border shadow-sm bg-gradient-to-br from-primary/10 via-primary/5 to-background flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-background rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">{project.title.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-medium opacity-80">{project.title}</h3>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {project.description ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Tentang Proyek</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                       {project.description}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-card">
                  <p className="text-muted-foreground">Belum ada deskripsi.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Detail</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <div className="mt-0.5">
                        <ProjectStatusBadge status={project.status} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Visibilitas</p>
                      <p className="text-sm font-medium capitalize">{project.visibility}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Tugas Proyek</h3>
              <p className="text-sm text-muted-foreground mt-1">Kelola tugas yang terkait dengan proyek ini.</p>
            </div>
            <TaskForm 
              projects={[project as any]}
              goals={[]}
              initialData={{ 
                title: "",
                description: "",
                status: TASK_STATUS.BELUM_DIMULAI,
                priority: TASK_PRIORITY.NORMAL,
                due_date: "",
                tags: [],
                project_id: project.id 
              }} 
            />
          </div>
          
          {project.tasks && project.tasks.length > 0 ? (
            <TaskBoard tasks={project.tasks as any} projects={[project as any]} goals={[]} />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 rounded-xl bg-card border-dashed">
              <p className="text-muted-foreground">Belum ada tugas di proyek ini.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Catatan Proyek</h3>
              <p className="text-sm text-muted-foreground mt-1">Dokumentasi, riset, dan referensi terkait proyek.</p>
            </div>
            <Link href={`/portal/notes/new?project_id=${project.id}`}>
              <Button>Tambah Catatan</Button>
            </Link>
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <Link key={note.id} href={`/portal/notes/${note.id}`} className="block">
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-base line-clamp-1 mb-2">{note.title}</h4>
                      {note.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{note.excerpt}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        Diperbarui: {format(new Date(note.updated_at), "dd MMM yyyy", { locale: localeId })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 rounded-xl bg-card border-dashed">
              <p className="text-muted-foreground">Belum ada catatan yang terkait.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Linimasa Proyek</h3>
              <p className="text-sm text-muted-foreground mt-1">Lacak pencapaian dan perubahan signifikan.</p>
            </div>
            <ProjectTimelineForm projectId={project.id} />
          </div>

          {project.project_timeline && project.project_timeline.length > 0 ? (
            <div className="relative border-l-2 border-muted ml-3 pl-6 space-y-8 mt-8">
              {[...project.project_timeline]
                .sort((a, b) => {
                  const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
                  const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
                  return dateA - dateB;
                })
                .map(event => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    <div className="bg-card border rounded-xl p-5 hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className="font-semibold text-base">{event.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {event.event_date && format(new Date(event.event_date), "dd MMM yyyy", { locale: localeId })}
                          </span>
                          <DeleteTimelineEventButton
                            eventId={event.id}
                            projectId={project.id}
                            eventTitle={event.title}
                          />
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 rounded-xl bg-card border-dashed">
              <p className="text-muted-foreground">Belum ada peristiwa linimasa.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
