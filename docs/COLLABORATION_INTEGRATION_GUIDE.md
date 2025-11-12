# Collaboration Features Integration Guide

This guide shows you how to integrate the collaboration features into your transformation workspace.

## Overview

The collaboration system provides:
- **Unified Activity Feed** - Track all changes across projects, sprints, PBIs, and risks
- **Comments with @Mentions** - Allow team discussions on any entity
- **Notifications** - Alert users of mentions, assignments, and updates
- **Team Transparency** - Everyone sees what's happening in real-time

## Database Setup

Already completed! You ran the SQL migration that created these tables:
- `activity_feed` - Unified activity log
- `comments` - Threaded comments system
- `notifications` - User notifications
- `user_presence` - Track who's online
- `collaboration_metrics` - Team engagement analytics

## API Routes Created

✅ `/api/activity` - Activity feed CRUD
✅ `/api/comments` - Comments CRUD
✅ `/api/notifications` - Notifications CRUD

## React Components Created

✅ `ActivityFeed.tsx` - Display activity feed
✅ `CommentsSection.tsx` - Comments with @mentions
✅ `NotificationsDropdown.tsx` - Notification bell dropdown
✅ `TeamCollaborationDashboard.tsx` - Full collaboration dashboard

## Integration Examples

### 1. Add Activity Feed to Journey Page

```tsx
// src/app/assessment/journey/[id]/page.tsx
import { ActivityFeed } from '@/components/collaboration/ActivityFeed';

export default function JourneyWorkspace() {
  const assessmentId = params.id as string;

  return (
    <div>
      {/* Your existing content */}

      {/* Add Activity Feed Tab */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2">
          <ActivityFeed assessmentId={assessmentId} limit={20} />
        </div>
      </div>
    </div>
  );
}
```

### 2. Add Comments to Project Cards

```tsx
// src/components/journey/ProjectBoard.tsx
import { CommentsSection } from '@/components/collaboration/CommentsSection';
import { MessageSquare } from 'lucide-react';

function ProjectCard({ project }: { project: Project }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div>
      {/* Project content */}

      <button onClick={() => setShowComments(!showComments)}>
        <MessageSquare size={16} />
        {project.comment_count > 0 && (
          <span>{project.comment_count}</span>
        )}
      </button>

      {showComments && (
        <CommentsSection
          entityType="project"
          entityId={project.id}
          currentUserId="user@example.com"
          currentUserName="User Name"
        />
      )}
    </div>
  );
}
```

### 3. Add Notifications to Header

```tsx
// src/components/layout/Header.tsx
import { NotificationsDropdown } from '@/components/collaboration/NotificationsDropdown';

function Header() {
  return (
    <header>
      {/* Other header items */}

      <NotificationsDropdown
        userId="user@example.com"
        onNavigate={(url) => router.push(url)}
      />
    </header>
  );
}
```

### 4. Log Activity When Updating Entities

```tsx
// When updating a project status
const handleProjectUpdate = async (projectId: string, updates: any) => {
  // Update the project
  await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });

  // Log activity
  if (updates.status) {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'project',
        entity_id: projectId,
        activity_type: 'status_changed',
        user_id: 'user@example.com',
        user_name: 'User Name',
        description: `Status changed from ${oldStatus} to ${updates.status}`,
        assessment_id: assessmentId,
        project_id: projectId,
        field_name: 'status',
        old_value: oldStatus,
        new_value: updates.status
      })
    });
  }
};
```

### 5. Add Collaboration Tab to Journey

```tsx
// Add a new tab in JourneyWorkspace
const [activeSection, setActiveSection] = useState<'projects' | 'sprints' | 'risks' | 'collaboration'>('projects');

// In your navigation tabs:
<button
  onClick={() => setActiveSection('collaboration')}
  className={/* tab styling */}
>
  <Users size={20} />
  Team Collaboration
</button>

// In your content area:
{activeSection === 'collaboration' && (
  <TeamCollaborationDashboard
    assessmentId={assessmentId}
    currentUserId="user@example.com"
    currentUserName="User Name"
  />
)}
```

## Real-World Usage Examples

### Sprint Board with Comments

Add comments to PBIs in the sprint board:

```tsx
// In SprintBoard.tsx
<PBICard pbi={pbi}>
  {/* PBI content */}

  <div className="mt-4">
    <CommentsSection
      entityType="pbi"
      entityId={pbi.id}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
    />
  </div>
</PBICard>
```

### Risk Management with Activity

Track who's updating risks:

```tsx
// When creating/updating a risk
await fetch('/api/activity', {
  method: 'POST',
  body: JSON.stringify({
    entity_type: 'risk',
    entity_id: riskId,
    activity_type: 'updated',
    user_id: userId,
    user_name: userName,
    description: `${userName} updated mitigation plan for ${riskTitle}`,
    project_id: projectId
  })
});
```

### Project with Full Collaboration

Complete integration example:

```tsx
function ProjectDetailsModal({ projectId }: { projectId: string }) {
  return (
    <div>
      {/* Project Details */}

      {/* Tabs */}
      <Tabs>
        <Tab label="Overview">
          {/* Project info */}
        </Tab>

        <Tab label="Activity">
          <ActivityFeed
            projectId={projectId}
            limit={50}
          />
        </Tab>

        <Tab label="Comments">
          <CommentsSection
            entityType="project"
            entityId={projectId}
            currentUserId={userId}
            currentUserName={userName}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
```

## Best Practices

### 1. Always Log Important Actions

```tsx
// Good: Log when status changes
await logActivity('project', projectId, 'status_changed', ...);

// Good: Log when someone is assigned
await logActivity('task', taskId, 'assigned', ...);

// Good: Log when items are moved between sprints
await logActivity('pbi', pbiId, 'moved_to_sprint', ...);
```

### 2. Use @Mentions Effectively

```tsx
// In comments, users can mention others:
// "@john.doe can you review this?"
// "@jane.smith this is blocked"

// The system automatically:
// - Extracts mentions
// - Creates notifications for mentioned users
// - Highlights mentions in blue
```

### 3. Provide Context in Activity Descriptions

```tsx
// ❌ Bad
description: "Updated"

// ✅ Good
description: "Sarah updated the project timeline from 30 days to 45 days"

// ✅ Good
description: "Mike moved 'User Authentication' from Backlog to Sprint 2"
```

### 4. Use Entity Metadata for Rich Context

```tsx
await fetch('/api/activity', {
  method: 'POST',
  body: JSON.stringify({
    // ... other fields
    metadata: {
      project_name: 'Customer Portal',
      sprint_name: 'Sprint 2',
      previous_assignee: 'John',
      new_assignee: 'Sarah'
    }
  })
});
```

## Features Summary

### ✅ What's Working Now

1. **Activity Feed**
   - Unified log of all changes
   - Filterable by assessment, project, entity type
   - Real-time updates
   - User attribution

2. **Comments System**
   - Thread discussions on any entity
   - @mention team members
   - Edit and delete comments
   - Reply to comments

3. **Notifications**
   - Bell dropdown with unread count
   - Auto-notifications for mentions
   - Mark as read / delete
   - Link to source entity

4. **Database Functions**
   - `log_activity()` - Easy activity logging
   - `create_notification()` - Send notifications
   - `extract_mentions()` - Parse @mentions
   - Auto-updating comment counts

### 🚀 Next Steps to Enhance

1. **Real-time Updates** - Add WebSocket/Supabase Realtime for live updates
2. **User Presence** - Show who's currently online and viewing what
3. **Rich Notifications** - Email/Slack integration
4. **Activity Analytics** - Dashboard showing team engagement metrics
5. **File Attachments** - Add files to comments
6. **Reactions** - Add emoji reactions to comments
7. **Search** - Search across all comments and activities

## Example: Complete Integration in Journey Page

Here's a full example of adding collaboration to your journey page:

```tsx
// src/app/assessment/journey/[id]/page.tsx
'use client';

import { useState } from 'react';
import { Rocket, Users, Activity as ActivityIcon } from 'lucide-react';
import { ActivityFeed } from '@/components/collaboration/ActivityFeed';
import { NotificationsDropdown } from '@/components/collaboration/NotificationsDropdown';
import { TeamCollaborationDashboard } from '@/components/collaboration/TeamCollaborationDashboard';

export default function JourneyWorkspace() {
  const assessmentId = params.id as string;
  const [activeSection, setActiveSection] = useState<'projects' | 'sprints' | 'risks' | 'activity'>('projects');

  // Mock user data - replace with actual auth
  const currentUserId = 'user@example.com';
  const currentUserName = 'John Doe';

  return (
    <div className="bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto pb-8">
        {/* Header with Notifications */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Rocket className="text-blue-600" />
              Transformation Journey
            </h1>
          </div>

          <NotificationsDropdown userId={currentUserId} />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button onClick={() => setActiveSection('projects')} /* styling */>
              Projects
            </button>
            <button onClick={() => setActiveSection('sprints')} /* styling */>
              Sprints
            </button>
            <button onClick={() => setActiveSection('risks')} /* styling */>
              Risks
            </button>
            <button onClick={() => setActiveSection('activity')} /* styling */>
              <ActivityIcon size={20} />
              Team Activity
            </button>
          </div>
        </div>

        {/* Content */}
        {activeSection === 'activity' && (
          <TeamCollaborationDashboard
            assessmentId={assessmentId}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
        )}

        {/* Other sections... */}
      </div>
    </div>
  );
}
```

## Support

For questions or issues with collaboration features, refer to:
- Database schema: `supabase/migrations/20250204_add_collaboration_features.sql`
- API routes: `src/app/api/activity`, `/comments`, `/notifications`
- Components: `src/components/collaboration/`

Happy collaborating! 🚀
