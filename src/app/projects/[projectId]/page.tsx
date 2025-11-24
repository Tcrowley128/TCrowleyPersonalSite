'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';
import { SprintManagement } from '@/components/agile/SprintManagement';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectChat, { ProjectChatHandle } from '@/components/project/ProjectChat';

interface Project {
  id: string;
  assessment_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
}

export default function ProjectSprintManagement() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const projectChatRef = useRef<ProjectChatHandle>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        // API returns { project: {...} } so we need to extract the project
        setProject(data.project || data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Check if there's a return URL in query params
    const returnUrl = searchParams.get("return");
    if (returnUrl) {
      router.push(returnUrl);
    } else if (project?.assessment_id) {
      // Navigate back to journey with the project selected
      router.push(`/assessment/journey/${project.assessment_id}?section=sprints&project=${projectId}`);
    } else {
      router.back();
    }
  };

  const handleAskAI = (message: string) => {
    // Open project-specific AI chat
    if (projectChatRef.current) {
      projectChatRef.current.openWithMessage(message);
    }
  };

  const handleOpenChat = () => {
    const chatTrigger = document.querySelector('[data-project-chat-trigger]') as HTMLButtonElement;
    if (chatTrigger) {
      chatTrigger.click();
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The project you're looking for doesn't exist.</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  console.log('Project data:', project); // Debug log

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
        <Navigation />
        <div className="flex-1 overflow-y-auto pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Section - Clean Plain Text */}
            <div className="mb-6 space-y-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Journey</span>
              </button>
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {project.title}
                  </h1>
                  <button
                    onClick={handleOpenChat}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0"
                    title="AI Scrum Master"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm font-medium">AI Scrum Master</span>
                  </button>
                </div>
                {project.description && (
                  <p className="text-base text-gray-600 dark:text-gray-400 max-w-3xl mt-2">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Sprint Management Content */}
            <SprintManagement
              projectId={projectId}
              onAskAI={handleAskAI}
            />
          </div>
        </div>

        {/* Footer - Full Width */}
        <Footer />
      </div>

      {/* Project Chat */}
      <ProjectChat ref={projectChatRef} projectId={projectId} />
    </>
  );
}
