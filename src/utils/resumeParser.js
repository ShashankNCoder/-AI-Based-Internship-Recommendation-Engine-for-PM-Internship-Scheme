export class ResumeParser {
  static parseText(text) {
    return {
      skills: this.extractSkills(text),
      location: this.extractLocation(text),
      experience: this.extractExperience(text),
      education: this.extractEducation(text)
    };
  }

  static extractSkills(text) {
    const technicalSkills = [
      'javascript', 'react', 'node.js', 'mongodb', 'python', 'java',
      'html', 'css', 'express', 'machine learning', 'ai', 'data analysis',
      'sql', 'nosql', 'aws', 'docker', 'kubernetes', 'git', 'rest api'
    ];

    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'project management', 'analytical thinking', 'creativity'
    ];

    const allSkills = [...technicalSkills, ...softSkills];
    
    return allSkills.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(text)
    );
  }

  static extractLocation(text) {
    const cities = [
      'delhi', 'bangalore', 'hyderabad', 'jaipur', 'mumbai', 'chennai',
      'pune', 'kolkata', 'ahmedabad', 'gurgaon', 'noida'
    ];

    const foundCity = cities.find(city => 
      new RegExp(`\\b${city}\\b`, 'i').test(text)
    );

    return foundCity || 'remote';
  }

  static extractExperience(text) {
    const patterns = [
      /(\d+)\s*(years?|yrs?)/i,
      /experience.*?(\d+)/i,
      /(\d+)\+?\s*years?/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return parseInt(match[1]);
    }
    return 0;
  }

  static extractEducation(text) {
    const degrees = [
      'bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e.', 'm.e.',
      'bsc', 'msc', 'ba', 'ma', 'mbbs', 'bca', 'mca'
    ];

    return degrees.find(degree => 
      new RegExp(`\\b${degree}\\b`, 'i').test(text)
    ) || 'bachelor';
  }
}