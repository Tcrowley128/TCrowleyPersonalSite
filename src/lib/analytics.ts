// Client-side analytics utilities

export const trackPageView = async (path: string, title?: string) => {
  try {
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    await fetch('/api/analytics/page-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        title,
        referrer,
      }),
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

export const trackPostView = async (postId: string) => {
  try {
    await fetch('/api/analytics/post-views', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
      }),
    });
  } catch (error) {
    console.error('Failed to track post view:', error);
  }
};
