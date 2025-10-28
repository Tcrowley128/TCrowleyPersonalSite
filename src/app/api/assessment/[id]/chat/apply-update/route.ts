import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.AI_API_KEY || process.env.ANTHROPIC_API_KEY,
});

interface UpdateRequest {
  messageId: string;
  conversationId: string;
  updates: Array<{
    updateType: string;
    sectionPath: string;
    oldValue: any;
    newValue: any;
    reason: string;
  }>;
  regenerateSection?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body: UpdateRequest = await request.json();
    const { messageId, conversationId, updates, regenerateSection = false } = body;

    console.log('[Apply Update] Starting update for assessment:', assessmentId);

    const supabase = createAdminClient();

    // 1. Get current assessment results from assessment_results table
    const { data: results, error: resultsError } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();

    if (resultsError || !results) {
      console.error('[Apply Update] Assessment results not found:', resultsError);
      return NextResponse.json(
        { error: 'Assessment results not found' },
        { status: 404 }
      );
    }

    // Get assessment for user_id
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('user_id')
      .eq('id', assessmentId)
      .single();

    if (assessmentError || !assessment) {
      console.error('[Apply Update] Assessment not found:', assessmentError);
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Create a mutable copy of the results
    const updatedResults = JSON.parse(JSON.stringify(results));

    // 2. Apply each update
    for (const update of updates) {
      const { updateType, sectionPath, oldValue, newValue, reason } = update;

      // Parse the section path (e.g., "tier1_citizen_led[0].name" or "quick_wins[0].description")
      const pathParts = sectionPath.split('.');
      let current: any = updatedResults;

      // Navigate to the parent of the target
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        const match = part.match(/^(.+?)\[(\d+)\]$/);

        if (match) {
          const key = match[1];
          const index = parseInt(match[2]);
          current = current[key][index];
        } else {
          current = current[part];
        }
      }

      // Update the final property
      const lastPart = pathParts[pathParts.length - 1];
      const lastMatch = lastPart.match(/^(.+?)\[(\d+)\]$/);

      if (lastMatch) {
        const key = lastMatch[1];
        const index = parseInt(lastMatch[2]);
        current[key][index] = newValue;
      } else {
        current[lastPart] = newValue;
      }

      // 3. Record the update in database
      await supabase.from('assessment_chat_updates').insert({
        assessment_id: assessmentId,
        conversation_id: conversationId,
        message_id: messageId,
        update_type: updateType,
        section_path: sectionPath,
        old_value: oldValue,
        new_value: newValue,
        reason: reason,
        applied_by: assessment.user_id,
      });

      console.log('[Apply Update] Applied update:', {
        type: updateType,
        path: sectionPath,
      });
    }

    // 4. Optionally regenerate section with AI
    if (regenerateSection && updates.length > 0) {
      console.log('[Apply Update] Regenerating section with AI...');

      const sectionToRegenerate = updates[0].updateType;
      const context = updates.map(u => u.reason).join('\n');

      try {
        // Get conversation context
        const { data: messages } = await supabase
          .from('conversation_messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true })
          .limit(10);

        const conversationContext = messages
          ?.map(m => `${m.role}: ${m.content}`)
          .join('\n\n') || '';

        // Call AI to regenerate section
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: `Based on this conversation:\n\n${conversationContext}\n\nUpdate the following section of the assessment results:\n\nSection: ${sectionToRegenerate}\nCurrent value: ${JSON.stringify(updates[0].oldValue, null, 2)}\nContext: ${context}\n\nProvide the updated section in JSON format that matches the original structure.`,
            },
          ],
        });

        const aiContent = response.content[0];
        if (aiContent.type === 'text') {
          // Extract JSON from AI response
          const jsonMatch = aiContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const regeneratedValue = JSON.parse(jsonMatch[0]);

            // Apply regenerated value
            const firstUpdate = updates[0];
            const pathParts = firstUpdate.sectionPath.split('.');
            let current: any = updatedResults;

            for (let i = 0; i < pathParts.length - 1; i++) {
              const part = pathParts[i];
              const match = part.match(/^(.+?)\[(\d+)\]$/);

              if (match) {
                const key = match[1];
                const index = parseInt(match[2]);
                current = current[key][index];
              } else {
                current = current[part];
              }
            }

            const lastPart = pathParts[pathParts.length - 1];
            current[lastPart] = regeneratedValue;

            console.log('[Apply Update] Section regenerated with AI');
          }
        }
      } catch (aiError) {
        console.error('[Apply Update] AI regeneration failed:', aiError);
        // Continue with manual updates even if AI fails
      }
    }

    // 5. Save updated results back to assessment_results table
    const { error: updateError } = await supabase
      .from('assessment_results')
      .update(updatedResults)
      .eq('assessment_id', assessmentId);

    if (updateError) {
      console.error('[Apply Update] Failed to save results:', updateError);
      return NextResponse.json(
        { error: 'Failed to save updates' },
        { status: 500 }
      );
    }

    console.log('[Apply Update] Updates applied successfully');

    return NextResponse.json({
      success: true,
      updatedSections: updates.map(u => u.updateType),
      message: 'Updates applied successfully',
    });
  } catch (error) {
    console.error('[Apply Update] Error:', error);
    return NextResponse.json(
      { error: 'Failed to apply updates' },
      { status: 500 }
    );
  }
}
