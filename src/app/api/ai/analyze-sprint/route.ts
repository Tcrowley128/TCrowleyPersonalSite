import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { sprintId, projectId } = await request.json();

    if (!sprintId || !projectId) {
      return NextResponse.json(
        { error: 'sprintId and projectId are required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    console.log('[Analyze Sprint] Fetching sprint data for:', sprintId);

    // Fetch sprint details
    const { data: sprint, error: sprintError } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    // Fetch all PBIs for this sprint
    const { data: pbis, error: pbisError } = await supabase
      .from('product_backlog_items')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('created_date', { ascending: true });

    if (pbisError) {
      console.error('[Analyze Sprint] Error fetching PBIs:', pbisError);
      return NextResponse.json(
        { error: 'Failed to fetch sprint PBIs' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const totalPbis = pbis?.length || 0;
    const completedPbis = pbis?.filter(pbi => pbi.status === 'done').length || 0;
    const inProgressPbis = pbis?.filter(pbi => pbi.status === 'in_progress').length || 0;
    const newPbis = pbis?.filter(pbi => pbi.status === 'new').length || 0;

    const plannedVelocity = sprint.planned_velocity || 0;
    const completedStoryPoints = pbis
      ?.filter(pbi => pbi.status === 'done')
      .reduce((sum, pbi) => sum + (pbi.story_points || 0), 0) || 0;

    const completionRate = totalPbis > 0 ? Math.round((completedPbis / totalPbis) * 100) : 0;
    const velocityAchievement = plannedVelocity > 0
      ? Math.round((completedStoryPoints / plannedVelocity) * 100)
      : 0;

    // Prepare context for AI
    const sprintContext = `
**Sprint Details:**
- Name: ${sprint.name}
- Goal: ${sprint.goal || 'Not specified'}
- Duration: ${sprint.start_date} to ${sprint.end_date}
- Status: ${sprint.status}

**Sprint Metrics:**
- Total PBIs: ${totalPbis}
- Completed: ${completedPbis} (${completionRate}%)
- In Progress: ${inProgressPbis}
- Not Started: ${newPbis}
- Planned Velocity: ${plannedVelocity} story points
- Actual Velocity: ${completedStoryPoints} story points (${velocityAchievement}% of planned)

**Work Items Breakdown:**
${pbis?.map((pbi, index) => {
  const type = pbi.item_type === 'epic' ? 'Epic' : pbi.item_type === 'user_story' ? 'User Story' : 'Task';
  const status = pbi.status === 'done' ? '✓ Done' : pbi.status === 'in_progress' ? '⏳ In Progress' : '○ Not Started';
  return `${index + 1}. [${type}] ${pbi.title}
   Status: ${status}
   Story Points: ${pbi.story_points || 'Not estimated'}
   Priority: ${pbi.priority || 'Not set'}`;
}).join('\n\n')}
`;

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are an experienced Agile coach and Scrum Master analyzing a completed sprint to prepare for a retrospective.

${sprintContext}

**Your Task:**
Analyze this sprint's performance and provide insights to guide an effective retrospective discussion.

**Required Output Format (JSON):**
{
  "summary": "2-3 sentence summary of the sprint performance highlighting key achievements and challenges",
  "recommendedTemplate": "template-id",
  "recommendedReason": "One sentence explaining why this template fits this sprint",
  "suggestedTopics": [
    "Discussion topic 1",
    "Discussion topic 2",
    "Discussion topic 3",
    "Discussion topic 4",
    "Discussion topic 5"
  ],
  "metrics": {
    "completionRate": "${completionRate}%",
    "velocityTrend": "On Track|Above|Below",
    "keyInsights": [
      "Insight 1",
      "Insight 2",
      "Insight 3"
    ]
  }
}

**Available Template IDs:**
- "start-stop-continue" - Best for teams needing clear action items and behavior changes
- "mad-sad-glad" - Best when there were emotional highs and lows, or team morale is a concern
- "four-ls" - Best for learning-focused sprints or when new processes were tried
- "sailboat" - Best when there are clear blockers to address and goals to pursue
- "went-well-improve" - Best for straightforward sprints with clear successes and areas to improve
- "rose-bud-thorn" - Best for balanced sprints with highlights, opportunities, and challenges

**Guidelines:**
1. Choose the template that best fits the sprint's story (high completion = went-well-improve, many blockers = sailboat, learning focus = four-ls, emotional journey = mad-sad-glad)
2. Suggested topics should be specific to this sprint's data, not generic
3. Topics should encourage meaningful discussion about what happened and why
4. Focus on actionable insights the team can use to improve
5. Velocity trend: "Above" if >${velocityAchievement > 100 ? 100 : 90}%, "Below" if <${velocityAchievement < 75 ? 75 : 80}%, otherwise "On Track"

Return ONLY the JSON object, no other text.`;

    console.log('[Analyze Sprint] Sending analysis request to Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('[Analyze Sprint] Received analysis from Claude');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[Analyze Sprint] Failed to parse AI response:', parseError);
      // Provide fallback analysis
      analysis = {
        summary: `Sprint completed ${completedPbis} of ${totalPbis} items (${completionRate}% completion rate) with ${completedStoryPoints} of ${plannedVelocity} planned story points delivered.`,
        recommendedTemplate: completionRate >= 70 ? 'went-well-improve' : 'sailboat',
        recommendedReason: completionRate >= 70
          ? 'This template works well for sprints with good completion rates to celebrate wins and identify improvements'
          : 'This template helps identify blockers and chart a path forward',
        suggestedTopics: [
          'What factors contributed to our completion rate?',
          'Were there any unexpected blockers or challenges?',
          'How effective was our sprint planning and estimation?',
          'What can we do differently in the next sprint?',
          'How well did we collaborate as a team?'
        ],
        metrics: {
          completionRate: `${completionRate}%`,
          velocityTrend: velocityAchievement > 90 ? 'Above' : velocityAchievement < 80 ? 'Below' : 'On Track',
          keyInsights: [
            `Completed ${completedPbis}/${totalPbis} items`,
            `Achieved ${velocityAchievement}% of planned velocity`,
            `${inProgressPbis} items left in progress`
          ]
        }
      };
    }

    console.log('[Analyze Sprint] Analysis complete');

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('[Analyze Sprint] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze sprint',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
