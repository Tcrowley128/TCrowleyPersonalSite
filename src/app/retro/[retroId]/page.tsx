"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RetroBoard from "@/components/retro/RetroBoard";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function RetroPage({
  params,
}: {
  params: Promise<{ retroId: string }>;
}) {
  const { retroId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // In a real app, you would fetch user info from auth
  // For now, using placeholder values
  const currentUserId = "user-1";
  const currentUserName = "Team Member";

  useEffect(() => {
    // Fetch retro data to get project_id
    fetch(`/api/retro/${retroId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.retrospective?.project_id) {
          setProjectId(data.retrospective.project_id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching retro:", err);
        setLoading(false);
      });
  }, [retroId]);

  const handleBack = () => {
    // Try to get return path from query params
    const returnUrl = searchParams.get("return");
    if (returnUrl) {
      router.push(returnUrl);
    } else if (projectId) {
      // Navigate to project sprint management page
      router.push(`/projects/${projectId}`);
    } else {
      // Fallback to browser back
      window.history.back();
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-y-auto pt-16">
        <RetroBoard
          retroId={retroId}
          projectId={projectId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
