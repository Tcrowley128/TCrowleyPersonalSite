import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { projectId, pbis, totalStoryPoints, sprintDuration } = await request.json();

    if (!pbis || pbis.length === 0) {
      return NextResponse.json(
        { error: 'No PBIs provided' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Prepare PBI context for AI
    const pbiContext = pbis.map((pbi: any, index: number) => {
      const type = pbi.item_type === 'epic' ? 'Epic' : pbi.item_type === 'user_story' ? 'User Story' : 'Task';
      return `${index + 1}. [${type}] ${pbi.title}
   Description: ${pbi.description || 'N/A'}
   Story Points: ${pbi.story_points || 'Not estimated'}
   Priority: ${pbi.priority || 'Not set'}`;
    }).join('\n\n');

    const prompt = `You are an experienced Scrum Master helping a team craft an effective sprint goal.

**Sprint Context:**
- Sprint Duration: ${sprintDuration} days
- Total Story Points Committed: ${totalStoryPoints}
- Number of Items: ${pbis.length}

**Backlog Items Selected for Sprint:**
${pbiContext}

**Your Task:**
Generate 3 compelling sprint goal options that:
1. Are concise (1-2 sentences each)
2. Focus on business value and user outcomes, not technical tasks
3. Are specific and measurable
4. Inspire and align the team
5. Can realistically be achieved in this sprint

**Format your response as a JSON array of 3 sprint goal strings:**
["Sprint goal option 1", "Sprint goal option 2", "Sprint goal option 3"]

**Important Guidelines:**
- Start each goal with an action verb (Deliver, Enable, Achieve, etc.)
- Include the "why" (business value) not just the "what"
- Make it team-focused ("Deliver X so that users can Y")
- Avoid jargon and keep it understandable by non-technical stakeholders

Return ONLY the JSON array, no other text.`;

    console.log('[Generate Sprint Goal] Sending request to Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('[Generate Sprint Goal] Received response from Claude');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let suggestions: string[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines and clean up
        suggestions = responseText
          .split('\n')
          .filter(line => line.trim().length > 10)
          .slice(0, 3)
          .map(line => line.replace(/^[\d\.\-\*]\s*/, '').replace(/^["']|["']$/g, '').trim());
      }
    } catch (parseError) {
      console.error('[Generate Sprint Goal] Failed to parse AI response:', parseError);
      // Fallback suggestions
      suggestions = [
        `Deliver key features from ${pbis.length} backlog items to enhance user experience`,
        `Complete ${totalStoryPoints} story points worth of high-priority work to advance project goals`,
        `Achieve sprint commitment by delivering value in ${sprintDuration} days`
      ];
    }

    // Ensure we have exactly 3 suggestions
    if (suggestions.length < 3) {
      suggestions.push(`Accomplish sprint objectives by completing ${totalStoryPoints} story points`);
    }
    suggestions = suggestions.slice(0, 3);

    console.log('[Generate Sprint Goal] Generated suggestions:', suggestions.length);

    return NextResponse.json({
      suggestions,
      tokenUsage: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('[Generate Sprint Goal] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate sprint goal',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
