// Rule-based expense categorizer
const categoryKeywords = {
  food: [
    'zomato', 'swiggy', 'restaurant', 'cafe', 'pizza', 'burger', 'coffee', 
    'tea', 'food', 'dining', 'kitchen', 'meal', 'lunch', 'dinner', 'breakfast',
    'dominos', 'kfc', 'mcdonalds', 'subway', 'bakery', 'ice cream'
  ],
  transport: [
    'uber', 'ola', 'taxi', 'bus', 'metro', 'train', 'fuel', 'petrol', 
    'diesel', 'transport', 'travel', 'ride', 'cab', 'auto', 'rickshaw',
    'parking', 'toll', 'rapido', 'namma yatri'
  ],
  shopping: [
    'amazon', 'flipkart', 'mall', 'store', 'shop', 'market', 'retail',
    'clothing', 'fashion', 'shoes', 'accessories', 'electronics', 'mobile',
    'laptop', 'grocery', 'supermarket', 'big bazaar', 'reliance', 'myntra'
  ],
  bills: [
    'electricity', 'water', 'phone', 'recharge', 'internet', 'wifi',
    'mobile', 'postpaid', 'prepaid', 'utility', 'gas', 'cylinder',
    'broadband', 'cable', 'dtv', 'airtel', 'jio', 'vi', 'bsnl'
  ],
  entertainment: [
    'movie', 'cinema', 'theater', 'game', 'sports', 'gym', 'fitness',
    'netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube', 'subscription',
    'entertainment', 'fun', 'party', 'event', 'concert'
  ],
  health: [
    'hospital', 'doctor', 'medical', 'pharmacy', 'medicine', 'clinic',
    'health', 'checkup', 'appointment', 'treatment', 'insurance',
    'apollo', 'fortis', 'medplus', 'wellness'
  ],
  education: [
    'school', 'college', 'university', 'course', 'book', 'study',
    'education', 'tuition', 'fee', 'exam', 'training', 'workshop',
    'certification', 'udemy', 'coursera'
  ]
};

export function categorizeExpense(text, merchant = '') {
  if (!text && !merchant) {
    return { category: 'other', confidence: 0 };
  }

  const searchText = `${text} ${merchant}`.toLowerCase();
  const categoryScores = {};

  // Initialize scores
  Object.keys(categoryKeywords).forEach(category => {
    categoryScores[category] = 0;
  });

  // Calculate scores for each category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (searchText.includes(keyword.toLowerCase())) {
        categoryScores[category] += 1;
      }
    });
  });

  // Find the category with the highest score
  let bestCategory = 'other';
  let maxScore = 0;
  
  Object.entries(categoryScores).forEach(([category, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });

  // Calculate confidence based on score and text length
  const totalWords = searchText.split(' ').length;
  const confidence = totalWords > 0 ? Math.min(maxScore / Math.max(totalWords * 0.1, 1), 1) : 0;

  // If confidence is too low, default to 'other'
  if (confidence < 0.3) {
    return { category: 'other', confidence: 0 };
  }

  return {
    category: bestCategory,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: categoryKeywords[bestCategory].filter(keyword => 
      searchText.includes(keyword.toLowerCase())
    )
  };
}

export function getCategoryIcon(category) {
  const icons = {
    food: '🍕',
    transport: '🚗',
    shopping: '🛍️',
    bills: '💡',
    entertainment: '🎬',
    health: '🏥',
    education: '📚',
    other: '📝'
  };
  
  return icons[category] || icons.other;
}

export function getCategoryLabel(category) {
  const labels = {
    food: 'Food & Dining',
    transport: 'Transportation',
    shopping: 'Shopping',
    bills: 'Bills & Utilities',
    entertainment: 'Entertainment',
    health: 'Healthcare',
    education: 'Education',
    other: 'Other'
  };
  
  return labels[category] || labels.other;
}