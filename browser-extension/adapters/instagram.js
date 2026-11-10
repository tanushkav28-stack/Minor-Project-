/**
 * Cognivibe AI - Instagram Content Extraction Adapter
 */

window.CognivibeInstagramAdapter = {
  platform: 'Instagram',

  isMatch() {
    return window.location.hostname.includes('instagram.com');
  },

  extractPosts() {
    const posts = [];
    // Instagram feed posts and comment sections
    const articles = document.querySelectorAll('article, div[role="dialog"]');

    articles.forEach((el, index) => {
      // Captions & comments
      const textNodes = el.querySelectorAll('h1, span._aacl, ul div span');
      let combinedText = '';
      textNodes.forEach(node => {
        const t = node.innerText.trim();
        if (t.length > 5 && !combinedText.includes(t)) {
          combinedText += ' ' + t;
        }
      });

      combinedText = combinedText.trim();
      if (combinedText.length > 10) {
        posts.push({
          id: `insta_post_${index}`,
          text: combinedText,
          element: el,
          platform: 'Instagram',
          type: 'caption/comment'
        });
      }
    });

    return posts;
  }
};

