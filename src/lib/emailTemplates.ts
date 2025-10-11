// Email templates for quick replies

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'thank-you',
    name: 'Thank You',
    subject: 'Thank you for reaching out!',
    message: `Hi {name},

Thank you for reaching out! I received your message and appreciate you taking the time to contact me.

I'll review your message and get back to you as soon as possible.

Best regards,
Tyler Crowley`,
  },
  {
    id: 'meeting-request',
    name: 'Meeting Request',
    subject: 'Re: Meeting Request',
    message: `Hi {name},

Thank you for your interest in connecting! I'd be happy to schedule a meeting to discuss this further.

Please share your availability for the coming week, and I'll send over a calendar invite.

Looking forward to our conversation!

Best regards,
Tyler Crowley`,
  },
  {
    id: 'opportunity',
    name: 'Opportunity Response',
    subject: 'Re: Opportunity',
    message: `Hi {name},

Thank you for thinking of me for this opportunity. I'm interested in learning more about this.

Could you provide some additional details about:
- The scope and timeline
- Key responsibilities
- Any specific requirements

I look forward to discussing this further.

Best regards,
Tyler Crowley`,
  },
  {
    id: 'collaboration',
    name: 'Collaboration Interest',
    subject: 'Re: Collaboration',
    message: `Hi {name},

I'm excited about the possibility of collaborating on this project!

Let's set up a time to discuss the details. I'm particularly interested in understanding:
- The project goals and vision
- Timeline and milestones
- How I can contribute

Please share your availability and we can take it from there.

Best regards,
Tyler Crowley`,
  },
  {
    id: 'not-interested',
    name: 'Polite Decline',
    subject: 'Re: Your message',
    message: `Hi {name},

Thank you for reaching out and for thinking of me.

Unfortunately, I'm not able to take on new commitments at this time due to my current workload and priorities.

I appreciate your understanding, and I wish you the best with your project.

Best regards,
Tyler Crowley`,
  },
  {
    id: 'more-info',
    name: 'Request More Info',
    subject: 'Re: {subject}',
    message: `Hi {name},

Thank you for your message! To better understand how I can help, could you provide some additional information:

- [Add specific questions here]
- [Add specific questions here]

Once I have these details, I'll be able to provide a more helpful response.

Best regards,
Tyler Crowley`,
  },
];

// Helper function to fill template with submission data
export function fillTemplate(template: EmailTemplate, data: { name: string; subject?: string }): EmailTemplate {
  return {
    ...template,
    subject: template.subject.replace('{subject}', data.subject || 'Your message'),
    message: template.message.replace('{name}', data.name),
  };
}
