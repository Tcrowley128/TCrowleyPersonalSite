import { calculateReadingTime, formatReadingTime, getReadingTime } from './readingTime';

describe('Reading Time Utilities', () => {
  describe('calculateReadingTime', () => {
    it('should calculate reading time for basic text', () => {
      // 200 words should take 1 minute at 200 wpm
      const text = 'word '.repeat(200);
      const result = calculateReadingTime(text);
      expect(result).toBe(1);
    });

    it('should calculate reading time for longer text', () => {
      // 600 words should take 3 minutes at 200 wpm
      const text = 'word '.repeat(600);
      const result = calculateReadingTime(text);
      expect(result).toBe(3);
    });

    it('should round up to the nearest minute', () => {
      // 250 words should round up to 2 minutes (1.25 minutes)
      const text = 'word '.repeat(250);
      const result = calculateReadingTime(text);
      expect(result).toBe(2);
    });

    it('should have a minimum of 1 minute', () => {
      const text = 'Just a few words';
      const result = calculateReadingTime(text);
      expect(result).toBe(1);
    });

    it('should handle empty string', () => {
      const result = calculateReadingTime('');
      expect(result).toBe(1); // Minimum 1 minute
    });

    it('should remove HTML tags before counting', () => {
      const htmlText = '<p>Hello</p> <strong>world</strong> <a href="#">test</a> content';
      const plainText = 'Hello world test content';

      const htmlResult = calculateReadingTime(htmlText);
      const plainResult = calculateReadingTime(plainText);

      expect(htmlResult).toBe(plainResult);
    });

    it('should handle text with multiple spaces', () => {
      const text = 'word    word   word  word';
      const result = calculateReadingTime(text);
      expect(result).toBe(1); // 4 words
    });

    it('should use custom words per minute', () => {
      // 300 words at 100 wpm should take 3 minutes
      const text = 'word '.repeat(300);
      const result = calculateReadingTime(text, 100);
      expect(result).toBe(3);
    });

    it('should handle complex HTML content', () => {
      const htmlContent = `
        <h1>Title</h1>
        <p>This is a paragraph with some <strong>bold text</strong> and <em>italic text</em>.</p>
        <ul>
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
        <p>Another paragraph with <a href="https://example.com">a link</a>.</p>
      `;
      const result = calculateReadingTime(htmlContent);
      expect(result).toBeGreaterThan(0);
      expect(result).toBe(1); // Should be 1 minute for this short content
    });

    it('should handle newlines and whitespace', () => {
      const text = `
        word
        word
        word
        word
      `;
      const result = calculateReadingTime(text);
      expect(result).toBe(1); // 4 words
    });
  });

  describe('formatReadingTime', () => {
    it('should format 1 minute correctly', () => {
      const result = formatReadingTime(1);
      expect(result).toBe('1 min read');
    });

    it('should format multiple minutes correctly', () => {
      const result = formatReadingTime(5);
      expect(result).toBe('5 min read');
    });

    it('should handle large numbers', () => {
      const result = formatReadingTime(20);
      expect(result).toBe('20 min read');
    });

    it('should handle zero (edge case)', () => {
      const result = formatReadingTime(0);
      expect(result).toBe('0 min read');
    });
  });

  describe('getReadingTime', () => {
    it('should calculate and format reading time in one step', () => {
      const text = 'word '.repeat(200);
      const result = getReadingTime(text);
      expect(result).toBe('1 min read');
    });

    it('should handle HTML content', () => {
      const htmlText = '<p>' + 'word '.repeat(400) + '</p>';
      const result = getReadingTime(htmlText);
      expect(result).toBe('2 min read');
    });

    it('should use custom words per minute', () => {
      const text = 'word '.repeat(300);
      const result = getReadingTime(text, 100);
      expect(result).toBe('3 min read');
    });

    it('should handle empty content', () => {
      const result = getReadingTime('');
      expect(result).toBe('1 min read'); // Minimum 1 minute
    });

    it('should handle realistic blog post content', () => {
      // Simulate a typical blog post (about 500 words)
      const blogPost = `
        <h1>My Blog Post Title</h1>
        <p>This is the introduction paragraph with some interesting content about technology and innovation.</p>
        <p>${'word '.repeat(500)}</p>
        <h2>Conclusion</h2>
        <p>This is the conclusion paragraph summarizing the main points.</p>
      `;
      const result = getReadingTime(blogPost);
      expect(result).toBe('3 min read'); // ~500 words / 200 wpm = 2.5 → 3 minutes
    });
  });

  describe('Edge Cases', () => {
    it('should handle text with special characters', () => {
      const text = 'Hello! How are you? I\'m fine, thanks. What\'s new?';
      const result = calculateReadingTime(text);
      expect(result).toBe(1);
    });

    it('should handle text with numbers', () => {
      const text = 'There are 123 apples and 456 oranges in the basket.';
      const result = calculateReadingTime(text);
      expect(result).toBe(1);
    });

    it('should handle text with emojis', () => {
      const text = 'Hello 👋 world 🌍 this is a test 🧪';
      const result = calculateReadingTime(text);
      expect(result).toBe(1);
    });

    it('should handle mixed content with code blocks', () => {
      const htmlWithCode = `
        <p>Here is some text before the code.</p>
        <pre><code>
          function example() {
            return "This is code";
          }
        </code></pre>
        <p>Here is some text after the code.</p>
      `;
      const result = calculateReadingTime(htmlWithCode);
      expect(result).toBeGreaterThan(0);
    });
  });
});
