// Client-side ML utilities for resume processing and matching

export class MLService {
  static extractSkills(text) {
    const skillsKeywords = [
      'javascript', 'react', 'node.js', 'mongodb', 'python', 'java',
      'html', 'css', 'express', 'machine learning', 'ai', 'data analysis',
      'sql', 'nosql', 'aws', 'docker', 'kubernetes', 'git', 'rest api',
      'typescript', 'angular', 'vue', 'django', 'flask', 'fastapi'
    ];

    const foundSkills = skillsKeywords.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  static extractLocation(text) {
    const locations = [
      'delhi', 'bangalore', 'hyderabad', 'jaipur', 'mumbai', 'chennai',
      'pune', 'kolkata', 'ahmedabad', 'gurgaon', 'noida', 'remote'
    ];

    const foundLocation = locations.find(location => 
      text.toLowerCase().includes(location.toLowerCase())
    );
    
    return foundLocation || 'remote';
  }

  static extractExperience(text) {
    const experiencePatterns = [
      /(\d+)\s*(years?|yrs?)/i,
      /experience.*?(\d+)/i,
      /(\d+)\+?\s*years?/i
    ];

    for (const pattern of experiencePatterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    return 0;
  }

  static calculateMatchScore(internship, userProfile) {
    let score = 0;
    
    // Skill matching (50% weight)
    const skillMatches = internship.skills.filter(skill => 
      userProfile.skills.includes(skill.toLowerCase())
    ).length;
    
    score += (skillMatches / Math.max(internship.skills.length, 1)) * 50;

    // Location matching (20% weight)
    if (internship.location.toLowerCase() === userProfile.location.toLowerCase()) {
      score += 20;
    } else if (internship.location.toLowerCase() === 'remote') {
      score += 15;
    }

    // Experience matching (15% weight)
    if (userProfile.experience >= internship.minExperience) {
      score += 15;
    }

    // Category matching (15% weight)
    if (internship.category.toLowerCase() === userProfile.preferredCategory?.toLowerCase()) {
      score += 15;
    }

    return Math.min(Math.round(score), 100);
  }

  static getRecommendations(internships, userProfile, limit = 10) {
    const scoredInternships = internships.map(internship => ({
      ...internship,
      matchScore: this.calculateMatchScore(internship, userProfile)
    }));

    return scoredInternships
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }
}