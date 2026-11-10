/**
 * Cognivibe AI - X (Twitter) Content Extraction Adapter
 */

window.CognivibeTwitterAdapter = {
  platform: 'Twitter/X',

  isMatch() {
    return window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com');
  },

  extractPosts() {
    const posts = [];
    const tweetElements = document.querySelectorAll('article[data-testid="tweet"]');

    tweetElements.forEach((el, index) => {
      const textContainer = el.querySelector('div[data-testid="tweetText"]');
      if (textContainer) {
        const text = textContainer.innerText.trim();
        if (text.length > 5) {
          posts.push({
            id: `tweet_${index}`,
            text: text,
            element: el,
            platform: 'Twitter/X',
            type: 'tweet'
          });
        }
      }
    });

    return posts;
  }
};

