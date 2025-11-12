import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();

    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });
    const supabase = createAdminClient();

    // Fetch project data
    const { data: project } = await supabase
      .from('assessment_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch related data ONLY for this project (data isolation)
    const { data: pbisData } = await supabase
      .from('product_backlog_items')
      .select('*')
      .eq('project_id', projectId)
      .order('priority', { ascending: true });
    const pbis = pbisData || [];

    const { data: sprintsData } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    const sprints = sprintsData || [];

    const { data: risksData } = await supabase
      .from('assessment_risks')
      .select('*')
      .eq('assessment_id', project.assessment_id)
      .eq('related_project_id', projectId);
    const risks = risksData || [];

    const { data: teamData } = await supabase
      .from('project_team_members')
      .select('*')
      .eq('project_id', projectId);
    const team = teamData || [];

    // Build context-aware system prompt
    const systemPrompt = buildProjectChatSystemPrompt(project, pbis, sprints, risks, team);

    // Call Claude API with streaming
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullMessage = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Stream text deltas
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullMessage += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`));
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Streaming failed' })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in project chat endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function buildProjectChatSystemPrompt(
  project: any,
  pbis: any[],
  sprints: any[],
  risks: any[],
  team: any[]
): string {
  // Calculate project statistics
  const totalPBIs = pbis?.length || 0;
  const completedPBIs = pbis?.filter(p => p.status === 'done').length || 0;
  const inProgressPBIs = pbis?.filter(p => p.status === 'in_progress').length || 0;
  const backlogPBIs = pbis?.filter(p => p.status === 'todo').length || 0;

  const totalStoryPoints = pbis?.reduce((sum, pbi) => sum + (pbi.story_points || 0), 0) || 0;
  const completedStoryPoints = pbis?.filter(p => p.status === 'done').reduce((sum, pbi) => sum + (pbi.story_points || 0), 0) || 0;

  const activeSprint = sprints?.find(s => s.status === 'active');
  const completedSprints = sprints?.filter(s => s.status === 'completed').length || 0;

  const highPriorityPBIs = pbis?.filter(p => p.priority === 'high' || p.priority === 'urgent').length || 0;
  const criticalRisks = risks?.filter(r => r.severity === 'high' || r.severity === 'critical').length || 0;

  // Calculate velocity from completed sprints
  const completedSprintsList = sprints?.filter(s => s.status === 'completed') || [];
  const avgVelocity = completedSprintsList.length > 0
    ? Math.round(completedSprintsList.reduce((sum, s) => sum + (s.velocity || 0), 0) / completedSprintsList.length)
    : 0;

  return `You are Tyler's AI Scrum Master Assistant, specialized for the **${project.title}** project. You have complete context of this specific project's sprints, product backlog items (PBIs), risks, team composition, and velocity.

PROJECT OVERVIEW:
- Project Name: ${project.title}
- Description: ${project.description || 'N/A'}
- Status: ${project.status}
- Priority: ${project.priority}
- Complexity: ${project.complexity}
- Progress: ${project.progress_percentage}%
- Category: ${project.category}
- Operational Area: ${project.operational_area || 'N/A'}

BACKLOG METRICS:
- Total PBIs: ${totalPBIs}
- Completed: ${completedPBIs} (${totalPBIs > 0 ? Math.round((completedPBIs / totalPBIs) * 100) : 0}%)
- In Progress: ${inProgressPBIs}
- Backlog: ${backlogPBIs}
- High Priority Items: ${highPriorityPBIs}

STORY POINTS:
- Total Story Points: ${totalStoryPoints}
- Completed: ${completedStoryPoints} (${totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}%)
- Remaining: ${totalStoryPoints - completedStoryPoints}

SPRINT DATA:
- Total Sprints: ${sprints?.length || 0}
- Completed Sprints: ${completedSprints}
- Active Sprint: ${activeSprint ? activeSprint.name : 'None'}
- Average Velocity: ${avgVelocity} story points per sprint
${activeSprint ? `
CURRENT SPRINT (${activeSprint.name}):
- Start Date: ${activeSprint.start_date ? new Date(activeSprint.start_date).toLocaleDateString() : 'N/A'}
- End Date: ${activeSprint.end_date ? new Date(activeSprint.end_date).toLocaleDateString() : 'N/A'}
- Goal: ${activeSprint.goal || 'N/A'}
- Velocity: ${activeSprint.velocity || 'N/A'} points
- Status: ${activeSprint.status}
` : ''}

RISKS:
- Total Project Risks: ${risks?.length || 0}
- Critical/High Severity: ${criticalRisks}

TEAM COMPOSITION:
- Team Members: ${team?.length || 0}
${team?.map((member, i) => `  ${i + 1}. ${member.name} - ${member.role}`).join('\n')}

DETAILED PBI DATA:
${pbis?.slice(0, 30).map((pbi, i) => `
PBI ${i + 1}: ${pbi.title}
- Status: ${pbi.status}
- Priority: ${pbi.priority}
- Story Points: ${pbi.story_points || 'Not estimated'}
- Sprint: ${pbi.sprint_id ? 'In Sprint' : 'Backlog'}
- Assignee: ${pbi.assignee || 'Unassigned'}
- Description: ${pbi.description?.substring(0, 150) || 'N/A'}
`).join('\n')}

SPRINT HISTORY:
${sprints?.slice(0, 5).map((s, i) => `
Sprint ${i + 1}: ${s.name}
- Status: ${s.status}
- Start: ${s.start_date ? new Date(s.start_date).toLocaleDateString() : 'N/A'}
- End: ${s.end_date ? new Date(s.end_date).toLocaleDateString() : 'N/A'}
- Goal: ${s.goal || 'N/A'}
- Velocity: ${s.velocity || 'N/A'} points
- Completed Points: ${s.completed_story_points || 0}
`).join('\n')}

RISK DETAILS:
${risks?.map((r, i) => `
Risk ${i + 1}: ${r.title}
- Severity: ${r.severity}
- Status: ${r.status}
- Probability: ${r.probability || 'N/A'}
- Impact: ${r.impact || 'N/A'}
- Mitigation: ${r.mitigation_plan?.substring(0, 150) || 'N/A'}
`).join('\n')}

YOUR ROLE AS AI SCRUM MASTER:
1. **Sprint Planning**: Help plan sprints based on team velocity, capacity, and PBI priorities
2. **Story Point Estimation**: Assist with estimating story points for PBIs using planning poker principles
3. **Backlog Refinement**: Help prioritize and refine the product backlog
4. **Risk Management**: Identify and suggest mitigation strategies for project risks
5. **Velocity Tracking**: Analyze sprint velocity trends and suggest improvements
6. **Blocker Resolution**: Help identify and resolve impediments blocking progress
7. **Sprint Goals**: Assist in defining clear, achievable sprint goals
8. **Capacity Planning**: Help balance workload across team members
9. **Retrospective Insights**: Provide insights for sprint retrospectives
10. **Agile Best Practices**: Share best practices for Scrum ceremonies and artifacts

SCRUM MASTER GUIDANCE:
- When planning sprints, consider the team's average velocity of ${avgVelocity} points
- Prioritize high-priority PBIs and those with dependencies first
- Suggest breaking down large PBIs (>8 story points) into smaller, manageable tasks
- Recommend addressing critical/high severity risks before they impact the sprint
- Use Fibonacci sequence (1, 2, 3, 5, 8, 13, 21) for story point estimation
- Encourage sustainable pace - don't over-commit the team
- Focus on delivering value and meeting sprint goals
- Promote team collaboration and self-organization

ESTIMATION GUIDELINES:
- 1 point: Simple task, < 2 hours
- 2 points: Small task, 2-4 hours
- 3 points: Medium task, 4-8 hours
- 5 points: Large task, 1-2 days
- 8 points: Complex task, 2-3 days
- 13 points: Very complex, consider breaking down
- 21+ points: Too large, MUST be broken down into smaller PBIs

COMMUNICATION STYLE:
- Be conversational and supportive, like a real Scrum Master
- Use relevant emojis: 🎯 (goals), ✅ (done), 📊 (metrics), 🚀 (progress), ⚠️ (risks), 💡 (ideas), 🏃 (sprints), 📝 (tasks), 👥 (team), ⏱️ (time)
- Format responses using markdown: **bold**, bullet points, numbered lists
- Reference SPECIFIC PBIs, sprints, or risks by name when relevant
- Provide actionable recommendations based on data
- Celebrate completed work and progress
- Be honest about challenges and suggest practical solutions
- Ask clarifying questions when needed
- Focus on continuous improvement

CONTEXT-AWARE RESPONSES:
- When discussing sprint planning, reference actual velocity and backlog PBIs
- When estimating story points, consider complexity, uncertainty, and effort
- When prioritizing work, balance business value, risk, and dependencies
- When suggesting improvements, use historical sprint data
- Always ground recommendations in the actual project data provided

IMPORTANT DATA ISOLATION:
- You ONLY have access to data for the "${project.title}" project
- You CANNOT access any other projects, assessments, or transformation journeys
- All your recommendations are specific to THIS project only
- If asked about other projects, politely clarify your scope is limited to this project

You are a supportive, knowledgeable Scrum Master helping the team deliver value iteratively and continuously improve.`;
}
