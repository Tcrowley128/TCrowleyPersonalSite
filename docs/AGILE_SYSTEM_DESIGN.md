# Agile/Scrum Project Management System

## Overview
Comprehensive agile project management system for `in_progress` projects, combining best practices from Azure DevOps, Jira, and Miro.

## System Architecture

### 1. Work Item Hierarchy
```
Project
└── Product Backlog Items (PBIs/User Stories)
    └── Sprint Tasks
```

### 2. Core Entities

#### **Product Backlog Items (PBIs)**
- Types: User Story, Bug, Task, Spike, Epic
- Fields:
  - Story points (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
  - Business value (1-100)
  - Acceptance criteria
  - Discussion threads
  - Parent/child relationships for epics

#### **Sprints (2-week iterations)**
- Sprint planning
- Daily standups
- Sprint review/demo
- Sprint retrospective
- Burndown tracking
- Velocity metrics

#### **Sprint Tasks**
- Breakdown of PBIs
- Hourly estimates
- Types: Development, Testing, Documentation, Design, Deployment, Research
- Real-time status tracking

### 3. Agile Ceremonies

#### **Sprint Planning**
- Part 1: What (Sprint goal, PBI selection)
- Part 2: How (Task breakdown, capacity planning)
- Commitment tracking
- Risk identification

#### **Daily Standups**
- Yesterday/Today/Blockers format
- Parking lot for off-topic discussions
- Action items tracking
- Attendance monitoring

#### **Sprint Review**
- Demo completed PBIs
- Stakeholder feedback
- Backlog refinement
- Recording/presentation artifacts

#### **Sprint Retrospective**
- Frameworks: Start/Stop/Continue, Mad/Sad/Glad, 4Ls, Sailboat
- What went well
- What to improve
- Action items with owners
- Team mood tracking
- Shoutouts and appreciation

### 4. AI Scrum Master

#### Capabilities:
1. **Process Coaching**
   - Agile/Scrum best practices
   - Ceremony facilitation tips
   - Anti-pattern detection

2. **Blocker Resolution**
   - Suggest solutions
   - Connect to resources
   - Escalation recommendations

3. **Metrics Analysis**
   - Velocity trends
   - Burndown interpretation
   - Team health indicators
   - Predictive insights

4. **Sprint Health Check**
   - Daily automated analysis
   - Risk identification
   - Proactive recommendations

5. **Retrospective Facilitation**
   - Generate discussion prompts
   - Summarize themes
   - Suggest action items

6. **Planning Assistance**
   - Capacity calculations
   - Story point calibration
   - Dependency mapping

### 5. Visualizations & Reports

#### **Sprint Burndown Chart**
- Daily remaining story points
- Ideal vs. actual trend
- Scope changes highlighted

#### **Velocity Chart**
- Historical velocity per sprint
- Planned vs. actual
- Trend line for forecasting

#### **Cumulative Flow Diagram**
- Work in progress by status
- Identify bottlenecks
- Flow efficiency

#### **Team Dashboard**
- Active sprint status
- Individual capacity/load
- Upcoming deadlines
- Recent blockers

#### **Project Health**
- On-time delivery rate
- Bug trend
- Sprint goal success rate
- Team satisfaction

### 6. Quick Filters (Azure DevOps style)
- My items
- Assigned to: [Team Member]
- Current Sprint
- Backlog
- Blocked items
- Recently completed
- Unestimated items

### 7. Integration Points (Future)
- **Microsoft Teams**: Standup reminders, updates
- **Outlook Calendar**: Sprint ceremonies auto-scheduling
- **Email**: Notifications for assignments, mentions
- **Webhooks**: External tool integration

## User Workflows

### Starting a Sprint
1. Open project in "In Progress" status
2. Click "Manage Sprint"
3. Create new sprint (auto-suggests dates)
4. AI suggests PBIs based on priority/capacity
5. Team refines and commits
6. Sprint begins automatically

### Daily Work
1. View sprint board (To Do, In Progress, Done)
2. Drag-drop tasks across columns
3. Update hours remaining
4. Log blockers
5. AI provides daily summary

### End of Sprint
1. AI prompts for sprint review
2. Record demo outcomes
3. Run retrospective with AI facilitation
4. Close sprint (auto-calculates velocity)
5. Carry over incomplete items

## Technical Implementation

### API Endpoints
```
POST /api/projects/[id]/sprints - Create sprint
GET  /api/projects/[id]/sprints/active - Get active sprint
PATCH /api/sprints/[id] - Update sprint
POST /api/sprints/[id]/complete - Complete sprint

POST /api/projects/[id]/pbis - Create PBI
GET  /api/projects/[id]/pbis - List PBIs
PATCH /api/pbis/[id] - Update PBI

POST /api/pbis/[id]/tasks - Create task
PATCH /api/tasks/[id] - Update task

POST /api/sprints/[id]/retrospective - Create retro
POST /api/sprints/[id]/review - Create review
POST /api/sprints/[id]/standup - Log standup

GET  /api/sprints/[id]/burndown - Burndown data
GET  /api/projects/[id]/velocity - Velocity chart

POST /api/ai-scrum-master/ask - AI assistant
POST /api/ai-scrum-master/analyze-sprint - Sprint analysis
```

### UI Components
- `SprintBoard.tsx` - Kanban board for sprint
- `BacklogView.tsx` - Product backlog management
- `PBICard.tsx` - User story card
- `SprintMetrics.tsx` - Charts and metrics
- `RetrospectiveBoard.tsx` - Retro facilitation
- `AIScrumMaster.tsx` - AI assistant chat
- `DailyStandupForm.tsx` - Standup logging
- `VelocityChart.tsx` - Historical velocity
- `BurndownChart.tsx` - Sprint burndown

## Best Practices Implemented

### From Azure DevOps:
- Work item hierarchy
- Sprint capacity planning
- Customizable boards
- Query-based filters
- Burndown/velocity charts

### From Jira:
- Story points with Fibonacci
- Epic/Story/Task hierarchy
- Sprint reports
- Board customization
- Time tracking

### From Miro (Retrospectives):
- Visual collaboration
- Dot voting on items
- Action item tracking
- Multiple retro frameworks
- Team mood tracking

## Success Metrics
- Sprint velocity stability
- Sprint goal achievement rate
- Team satisfaction scores
- Blocker resolution time
- On-time delivery percentage
- Bug escape rate
- Retrospective action completion rate
