/**
 * Cognivibe AI - YouTube Content Extraction Adapter
 */

window.CognivibeYouTubeAdapter = {
  platform: 'YouTube',

  isMatch() {
    return window.location.hostname.includes('youtube.com');
  },

  extractPosts() {
    const posts = [];
    // YouTube comments and community posts
    const commentNodes = document.querySelectorAll('ytd-comment-thread-renderer #content-text, ytd-backstage-post-renderer #content-text');

    commentNodes.forEach((node, index) => {
      const text = node.innerText.trim();
      if (text.length > 10) {
        posts.push({
          id: `yt_comment_${index}`,
          text: text,
          element: node.closest('ytd-comment-thread-renderer') || node,
          platform: 'YouTube',
          type: 'comment'
        });
      }
    });

    return posts;
  }
};

