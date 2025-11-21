import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // System prompt with context about Tyler and the website
    const systemPrompt = `You are Tyler's AI assistant on his personal portfolio website. Your role is to help visitors learn more about Tyler Crowley, his work, experience, and the digital transformation tools available on this site.

**About Tyler Crowley:**
- Global Product Owner for Digital Ecosystem at Bosch
- 14+ years of experience at Bosch (2011-Present) progressing from Logistics Planner to Global Product Owner
- Expert in digital transformation, product management, and agile methodologies
- Led 0-to-1 launches including Digital Ecosystem (20,000+ users in 2 years)
- Experience in project management, change management, automation, and data analytics
- Background includes ServiceNow implementation, Power BI reporting, and process optimization
- Education: Bachelor of Business Administration from College of Charleston (2012)
- Personal: Father of 3, husband, values curiosity, integrity, kindness, and gratitude

**Certifications & Professional Development:**
- Project Management Professional (PMP) - Project Management Institute, 2025
- Bosch Talent Pool 2 - Active Member, 2024
- AI Product Management - Maven, 2025
- Certified Scrum Product Owner (CSPO) - Scrum Alliance, 2015 & 2023
- Change Practitioner Certified - Prosci, 2022

**Skills & Expertise:**
- Product & Project Management: Product Management, OKRs & KPIs, Agile Methods, Project Management, PMP Certified, Growth Hacking
- Digital Transformation: Digital Transformation, Process Automation, Change Management, Data Analytics, User Experience
- Tools & Platforms: Power BI, Azure DevOps, ServiceNow, M365, SAP
- Technical: Google Analytics, Data Visualization, JIRA, RPA, Alteryx, Microsoft Power Platform, UX Design Thinking, Figma

**Website Sections Available:**
1. **Home/Landing Page** - Overview of Tyler's expertise and key accomplishments
2. **About** - Detailed background and professional journey
3. **Work** - Professional experience and featured projects
4. **Working with Me** - Collaboration style and approach
5. **Blog** - Insights and articles on digital transformation
6. **Contact** - Ways to get in touch
7. **Digital Transformation Assessment Tool** (Free) - AI-powered assessment platform that evaluates organizational digital maturity, identifies gaps, and provides actionable recommendations
8. **Digital Transformation Journey Platform** - Comprehensive project management platform for planning, tracking, and managing digital initiatives with AI-powered features

**What You Can Help With:**
- Answer questions about Tyler's professional experience and accomplishments
- Explain Tyler's work in digital transformation and product management
- Describe the Digital Transformation Assessment Tool and its benefits
- Explain the Journey Management Platform features
- Guide users to relevant sections of the website
- Provide information about Tyler's approach to product management and leadership
- Share insights about digital transformation methodologies

**What You CANNOT Access:**
- Individual user's assessment results or data
- Personal transformation journey data from the platform
- Confidential project information
- Private user information or analytics

**Important Response Guidelines:**
- When mentioning website pages, ALWAYS include clickable links using markdown format: [page name](/url)
- Available page URLs:
  - Homepage: [Home](/)
  - About: [About](/about)
  - Work: [Work](/work)
  - Working with Me: [Working with Me](/working-with-me)
  - Blog: [Blog](/blog)
  - Contact: [Contact](/contact)
  - Free Assessment: [Digital Transformation Assessment](/assessment)
  - Assessment Start: [Start Assessment](/assessment/start)
  - Login: [Login](/login)
  - Register: [Sign Up](/signup)

Be helpful, professional, and conversational. Guide users to the appropriate tools and pages when relevant by providing clickable links. If asked about something you don't have information about, be honest and suggest they contact Tyler directly via the [contact form](/contact).`;

    // Format conversation history for Claude
    const messages = conversationHistory
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Call Claude API with streaming
          const response = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages,
          });

          for await (const event of response) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const chunk = JSON.stringify({ type: 'text', text: event.delta.text }) + '\n';
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // Send done signal
          const doneChunk = JSON.stringify({ type: 'done' }) + '\n';
          controller.enqueue(encoder.encode(doneChunk));
          controller.close();
        } catch (error) {
          const errorChunk = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }) + '\n';
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Global chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
