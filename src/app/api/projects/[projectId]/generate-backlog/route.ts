import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    console.log('[generate-backlog] Starting backlog generation...');
    const { projectId } = await params;
    const body = await request.json();
    const { itemType = 'epic', parentId = null } = body;

    console.log('[generate-backlog] Project ID:', projectId);
    console.log('[generate-backlog] Item Type:', itemType);
    console.log('[generate-backlog] Parent ID:', parentId);

    const supabase = createAdminClient();
    console.log('[generate-backlog] Supabase client created');

    // Get project details
    console.log('[generate-backlog] Fetching project details...');
    const { data: project, error: projectError } = await supabase
      .from('assessment_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.log('[generate-backlog] Project not found:', projectError);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('[generate-backlog] Project found:', project.title);

    // Get parent context if generating user stories or tasks
    let parentContext = '';
    if (parentId) {
      const { data: parent, error: parentError } = await supabase
        .from('product_backlog_items')
        .select('title, description, item_type')
        .eq('id', parentId)
        .single();

      if (parent && !parentError) {
        parentContext = `\n\nParent ${parent.item_type.replace('_', ' ')}:\nTitle: ${parent.title}\nDescription: ${parent.description || 'No description'}`;
      }
    }

    // Initialize Anthropic client (try both env variable names)
    const apiKey = process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('[generate-backlog] Anthropic API key not configured');
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    console.log('[generate-backlog] Initializing Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: apiKey
    });
    console.log('[generate-backlog] Anthropic client initialized');

    // Generate prompt based on item type
    let prompt = '';

    if (itemType === 'epic') {
      prompt = `You are an agile project management expert. Based on the following project details, generate 5-8 epics.

Project Title: ${project.title}
Description: ${project.description || 'No description provided'}
Category: ${project.category || 'Not specified'}
Operational Area: ${project.operational_area || 'Not specified'}
Complexity: ${project.complexity}
Expected Timeline: ${project.estimated_timeline_days} days

Generate 5-8 epics (high-level features or initiatives) for this project.

For each epic, provide:
- title: Clear, concise epic title
- description: Detailed description of the epic and its business value
- item_type: must be "epic"
- priority: 1-4 (1=low, 2=medium, 3=high, 4=critical)
- story_points: Fibonacci number (8, 13, 21) - epics are large
- acceptance_criteria: A plain text string with bullet points separated by newlines (use \\n). Format each point as "- Point text". Do NOT use JSON arrays or quotes.

Example acceptance_criteria format: "- First criterion\\n- Second criterion\\n- Third criterion"

Return ONLY a valid JSON array of epic objects, no additional text.`;
    } else if (itemType === 'user_story') {
      prompt = `You are an agile project management expert. Generate 5-10 user stories for the following epic.

Project Context:
Title: ${project.title}
Description: ${project.description || 'No description provided'}${parentContext}

Generate 5-10 user stories using "As a... I want... So that..." format for this epic.

For each user story, provide:
- title: Clear, concise title
- description: User story in "As a [role], I want [goal], so that [benefit]" format
- item_type: must be "user_story"
- priority: 1-4 (1=low, 2=medium, 3=high, 4=critical)
- story_points: Fibonacci number (1, 2, 3, 5, 8) based on complexity
- acceptance_criteria: A plain text string with bullet points separated by newlines (use \\n). Format each point as "- Point text". Do NOT use JSON arrays or quotes.

Example acceptance_criteria format: "- First criterion\\n- Second criterion\\n- Third criterion"

Return ONLY a valid JSON array of user story objects, no additional text.`;
    } else if (itemType === 'task') {
      prompt = `You are an agile project management expert. Generate 5-10 technical tasks to implement the following user story.

Project Context:
Title: ${project.title}${parentContext}

Generate 5-10 technical tasks that break down this user story into implementable pieces.

For each task, provide:
- title: Clear, actionable task title
- description: Detailed technical description
- item_type: must be "task"
- priority: 1-4 (1=low, 2=medium, 3=high, 4=critical)
- story_points: Fibonacci number (1, 2, 3) - tasks are small
- acceptance_criteria: A plain text string with bullet points separated by newlines (use \\n). Format each point as "- Point text". Do NOT use JSON arrays or quotes.

Example acceptance_criteria format: "- First criterion\\n- Second criterion\\n- Third criterion"

Return ONLY a valid JSON array of task objects, no additional text.`;
    }

    console.log('[generate-backlog] Sending request to Anthropic API...');

    // Use streaming to handle responses like assessment generation
    let responseText = '';
    let finalMessage: any = null;

    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Collect response text from stream
      responseText = '';
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          responseText += chunk.delta.text;
        }
      }

      // Get final message with usage stats
      finalMessage = await stream.finalMessage();

      console.log('[generate-backlog] Received response from Anthropic');
      console.log('[generate-backlog] Token usage:', {
        input_tokens: finalMessage.usage.input_tokens,
        output_tokens: finalMessage.usage.output_tokens
      });
    } catch (error: any) {
      console.error('[generate-backlog] Anthropic API error:', error);
      throw error;
    }

    // Parse JSON response with better error handling
    let pbiData: any[] = [];

    try {
      console.log('[generate-backlog] Extracting JSON from AI response...');
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to extract JSON array
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        pbiData = JSON.parse(jsonMatch[0]);
        console.log('[generate-backlog] Successfully parsed', pbiData.length, 'PBIs');
      } else {
        console.log('[generate-backlog] Failed to extract JSON from response:', responseText.substring(0, 500));
        throw new Error('Could not parse PBI data from AI response');
      }
    } catch (parseError) {
      console.error('[generate-backlog] Failed to parse Claude response:', parseError);
      console.error('[generate-backlog] Response preview:', responseText.substring(0, 500));
      throw new Error('Failed to parse AI response. The response may have been truncated.');
    }

    // Helper function to clean up acceptance criteria formatting
    const cleanAcceptanceCriteria = (criteria: any): string => {
      if (!criteria) return '';

      // If it's already a string, clean it up
      if (typeof criteria === 'string') {
        // Remove any stray brackets and quotes from JSON array formatting
        return criteria
          .replace(/^\[|\]$/g, '') // Remove leading [ and trailing ]
          .replace(/^"|"$/g, '')   // Remove leading and trailing quotes
          .replace(/",\s*"/g, '\n') // Convert array elements to newlines
          .replace(/\\"/g, '"')     // Unescape quotes
          .trim();
      }

      // If it's an array, convert to string with newlines
      if (Array.isArray(criteria)) {
        return criteria
          .map(item => {
            const cleaned = String(item).trim();
            // Add bullet if not present
            return cleaned.startsWith('-') ? cleaned : `- ${cleaned}`;
          })
          .join('\n');
      }

      // Fallback
      return String(criteria);
    };

    // Insert PBIs into database
    console.log('[generate-backlog] Preparing PBIs for database insertion...');
    const pbisToInsert = pbiData.map((pbi, index) => ({
      project_id: projectId,
      title: pbi.title,
      description: pbi.description,
      acceptance_criteria: cleanAcceptanceCriteria(pbi.acceptance_criteria),
      item_type: pbi.item_type,
      priority: pbi.priority,
      story_points: pbi.story_points,
      status: 'new',
      backlog_order: index,
      parent_id: parentId,
      created_date: new Date().toISOString()
    }));

    console.log('[generate-backlog] Inserting', pbisToInsert.length, 'PBIs into database...');
    console.log('[generate-backlog] Sample PBI:', JSON.stringify(pbisToInsert[0], null, 2));

    const { data: insertedPbis, error: insertError } = await supabase
      .from('product_backlog_items')
      .insert(pbisToInsert)
      .select();

    if (insertError) {
      console.error('[generate-backlog] Error inserting PBIs:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        fullError: insertError
      });
      return NextResponse.json(
        { error: 'Failed to create backlog items', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('[generate-backlog] Successfully inserted', insertedPbis?.length, 'PBIs');

    return NextResponse.json({
      pbis: insertedPbis,
      count: insertedPbis?.length || 0
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/projects/[projectId]/generate-backlog:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      fullError: error
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
