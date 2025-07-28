const ContentFormatter = require('./src/utils/formatter');

// Sample response from your API
const sampleResponse = [
  {
    "post_title": "Unlocking AI Potential",
    "post_content": "As a developer, have you ever wondered how AI can enhance your projects? Our AI solutions can help you build more efficient and intelligent systems. Learn more about our AI capabilities and how they can benefit your work.",
    "suggested_hashtags": ["AIforDevelopers", "ArtificialIntelligence", "MachineLearning"],
    "best_platform": "LinkedIn",
    "engagement_strategy": "Ask developers to share their experiences with AI in the comments section"
  },
  {
    "post_title": "AI Myth-Busting",
    "post_content": "There are many misconceptions about AI and its applications. We're here to set the record straight and provide you with the facts. Check out our latest blog post to learn more about the reality of AI.",
    "suggested_hashtags": ["AIMyths", "AIReality", "ArtificialIntelligence"],
    "best_platform": "Twitter",
    "engagement_strategy": "Encourage followers to share their thoughts on AI myths and ask us to debunk them"
  },
  {
    "post_title": "Meet Our AI Experts",
    "post_content": "Our team of AI experts is dedicated to helping developers like you build innovative solutions. Meet our team and learn more about their experiences and expertise. Get in touch with us to discuss your AI project.",
    "suggested_hashtags": ["AIExperts", "MeetTheTeam", "ArtificialIntelligence"],
    "best_platform": "Instagram",
    "engagement_strategy": "Use Instagram Stories to introduce our team members and ask followers to ask them questions"
  }
];

console.log('🎨 Beautiful Formatting Demo\n');
console.log('📱 Original Response:');
console.log(JSON.stringify(sampleResponse, null, 2));

console.log('\n✨ Formatted Response:');
const formatted = ContentFormatter.formatSocialMediaPosts(sampleResponse);
console.log(JSON.stringify(formatted, null, 2));

console.log('\n📊 Summary:');
const summary = ContentFormatter.createBeautifulResponse(sampleResponse, 'socialMedia');
console.log(JSON.stringify(summary.summary, null, 2));

console.log('\n🎯 Individual Post Example:');
const firstPost = formatted[0];
console.log(`Title: ${firstPost.title}`);
console.log(`Content: ${firstPost.content}`);
console.log(`Platform: ${firstPost.platformIcon} ${firstPost.platform}`);
console.log(`Hashtags: ${firstPost.formattedHashtags.join(' ')}`);
console.log(`Engagement: ${firstPost.engagementStrategy}`); 