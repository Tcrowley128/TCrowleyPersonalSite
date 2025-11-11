/**
 * Notification utility functions for creating notifications based on events
 */

interface CreateNotificationParams {
  userId: string;
  type: 'mention' | 'assignment' | 'status_change' | 'deadline' | 'comment' | 'risk';
  title: string;
  message?: string;
  entityType?: string;
  entityId?: string;
  linkUrl?: string;
  fromUserId?: string;
  fromUserName?: string;
}

/**
 * Creates a notification for a user
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        entity_type: params.entityType,
        entity_id: params.entityId,
        link_url: params.linkUrl,
        from_user_id: params.fromUserId,
        from_user_name: params.fromUserName
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Notify when someone is mentioned in a comment
 */
export async function notifyMention(
  mentionedUserId: string,
  fromUserId: string,
  fromUserName: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  linkUrl: string
): Promise<void> {
  await createNotification({
    userId: mentionedUserId,
    type: 'mention',
    title: `${fromUserName} mentioned you`,
    message: `in ${entityType}: "${entityTitle}"`,
    entityType,
    entityId,
    linkUrl,
    fromUserId,
    fromUserName
  });
}

/**
 * Notify when someone is assigned to an item
 */
export async function notifyAssignment(
  assignedUserId: string,
  fromUserId: string,
  fromUserName: string,
  itemType: string,
  itemId: string,
  itemTitle: string,
  linkUrl: string
): Promise<void> {
  await createNotification({
    userId: assignedUserId,
    type: 'assignment',
    title: `${fromUserName} assigned you to a ${itemType}`,
    message: `"${itemTitle}"`,
    entityType: itemType,
    entityId: itemId,
    linkUrl,
    fromUserId,
    fromUserName
  });
}

/**
 * Notify when item status changes
 */
export async function notifyStatusChange(
  userIds: string[],
  itemType: string,
  itemId: string,
  itemTitle: string,
  oldStatus: string,
  newStatus: string,
  changedBy: string,
  changedByName: string,
  linkUrl: string
): Promise<void> {
  const notifications = userIds.map(userId =>
    createNotification({
      userId,
      type: 'status_change',
      title: `${itemType} status changed`,
      message: `"${itemTitle}" moved from ${oldStatus} to ${newStatus}`,
      entityType: itemType,
      entityId: itemId,
      linkUrl,
      fromUserId: changedBy,
      fromUserName: changedByName
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify when a comment is added
 */
export async function notifyComment(
  userIds: string[],
  fromUserId: string,
  fromUserName: string,
  entityType: string,
  entityId: string,
  entityTitle: string,
  commentText: string,
  linkUrl: string
): Promise<void> {
  const notifications = userIds.map(userId =>
    createNotification({
      userId,
      type: 'comment',
      title: `${fromUserName} commented`,
      message: `on ${entityType}: "${entityTitle}"`,
      entityType,
      entityId,
      linkUrl,
      fromUserId,
      fromUserName
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify when a risk is created or escalated
 */
export async function notifyRisk(
  userIds: string[],
  fromUserId: string,
  fromUserName: string,
  riskId: string,
  riskTitle: string,
  severity: string,
  isEscalation: boolean,
  linkUrl: string
): Promise<void> {
  const notifications = userIds.map(userId =>
    createNotification({
      userId,
      type: 'risk',
      title: isEscalation ? `Risk escalated to ${severity}` : `New ${severity} risk identified`,
      message: `"${riskTitle}"`,
      entityType: 'risk',
      entityId: riskId,
      linkUrl,
      fromUserId,
      fromUserName
    })
  );

  await Promise.all(notifications);
}

/**
 * Notify when a deadline is approaching or passed
 */
export async function notifyDeadline(
  userIds: string[],
  itemType: string,
  itemId: string,
  itemTitle: string,
  deadline: Date,
  isPassed: boolean,
  linkUrl: string
): Promise<void> {
  const notifications = userIds.map(userId =>
    createNotification({
      userId,
      type: 'deadline',
      title: isPassed ? 'Deadline passed' : 'Deadline approaching',
      message: `${itemType}: "${itemTitle}" ${isPassed ? 'was' : 'is'} due ${deadline.toLocaleDateString()}`,
      entityType: itemType,
      entityId: itemId,
      linkUrl
    })
  );

  await Promise.all(notifications);
}

/**
 * Extract @mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(m => m.substring(1)) : []; // Remove the @ symbol
}
