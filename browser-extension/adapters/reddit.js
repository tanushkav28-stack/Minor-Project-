/**
 * Cognivibe AI - Reddit Content Extraction Adapter
 */

window.CognivibeRedditAdapter = {
  platform: 'Reddit',
  
  isMatch() {
    return window.location.hostname.includes('reddit.com');
  },

  extractPosts() {
    const posts = [];
    // Reddit modern & old selectors
    const postElements = document.querySelectorAll('shreddit-post, div[data-testid="post-container"], .Post');
    
    postElements.forEach((el, index) => {
      const titleEl = el.querySelector('h1, h2, [slot="title"], a[data-click-id="body"]');
      const bodyEl = el.querySelector('[slot="text-body"], .RichTextJSON-root, div[data-testid="post-comment-header"] ~ div');
      
      const title = titleEl ? titleEl.innerText.trim() : '';
      const body = bodyEl ? bodyEl.innerText.trim() : '';
      const fullText = (title + ' ' + body).trim();

      if (fullText.length > 10) {
        posts.push({
          id: `reddit_post_${index}`,
          text: fullText,
          element: el,
          platform: 'Reddit',
          type: 'post'
        });
      }
    });

    return posts;
  }
};

