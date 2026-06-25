export const TOPICS = [
  { value: 'all',           label: 'All',           emoji: '🌐' },
  { value: 'general',       label: 'General',       emoji: '💬' },
  { value: 'politics',      label: 'Politics',      emoji: '🏛️' },
  { value: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { value: 'technology',    label: 'Technology',    emoji: '💻' },
  { value: 'sports',        label: 'Sports',        emoji: '⚽' },
  { value: 'science',       label: 'Science',       emoji: '🔬' },
  { value: 'health',        label: 'Health',        emoji: '🏥' },
  { value: 'business',      label: 'Business',      emoji: '💼' },
  { value: 'travel',        label: 'Travel',        emoji: '✈️' },
  { value: 'food',          label: 'Food',          emoji: '🍜' },
  { value: 'art',           label: 'Art',           emoji: '🎨' },
  { value: 'education',     label: 'Education',     emoji: '📚' },
]

export function getTopic(value) {
  return TOPICS.find((t) => t.value === value) || TOPICS[1]
}
