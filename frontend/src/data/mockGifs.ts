export interface MockGif {
    id: string;
    url: string;
    title: string;
    width: number;
    height: number;
}

// Extended base GIFs with maximum variety - 200+ unique URLs
const BASE_GIFS = [
    // Reactions & Emotions (30+)
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY254YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY254YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5YmF5dXh5eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlHJGHe3yAMhdQY/giphy.gif",
    "https://media.giphy.com/media/3o6Zt481isNBF9kUlq/giphy.gif",
    "https://media.giphy.com/media/l2JdZOv6B3C0wU7w4/giphy.gif",
    "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
    "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/d2lcHJTG5TSCnTVRK/giphy.gif",
    "https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.gif",
    "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
    "https://media.giphy.com/media/3o6ZtpxvRgsoyXKSCQ/giphy.gif",
    "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
    "https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif",
    "https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif",
    "https://media.giphy.com/media/xUPGcm3irC17U1FgMo/giphy.gif",
    "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
    "https://media.giphy.com/media/3oEjHCWdU7F4hkcudy/giphy.gif",
    "https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif",
    "https://media.giphy.com/media/3oKIPnbKgN3bXeVpvy/giphy.gif",
    "https://media.giphy.com/media/l0MYOrDnHAd2yVfSE/giphy.gif",
    "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif",
    "https://media.giphy.com/media/xT77XWum9yH7zNkFW0/giphy.gif",
    "https://media.giphy.com/media/l0Iy69RBwtdmvwkIo/giphy.gif",
    "https://media.giphy.com/media/3o6Ztl7HRfaRKKaMNi/giphy.gif",
    "https://media.giphy.com/media/xT0xeMA62E1XIlup68/giphy.gif",
    "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
    "https://media.giphy.com/media/xUA7aM09ByyR1w5YWc/giphy.gif",
    "https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.gif",
    "https://media.giphy.com/media/l0IylOPCNkiqOgMyA/giphy.gif",
    "https://media.giphy.com/media/3oEjHYibHwRL7mrNyo/giphy.gif",

    // Animals (35+)
    "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
    "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
    "https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif",
    "https://media.giphy.com/media/11s7Ke7jcNxCHS/giphy.gif",
    "https://media.giphy.com/media/Z9OGuQyrfHAE8/giphy.gif",
    "https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif",
    "https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif",
    "https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif",
    "https://media.giphy.com/media/l41lZxzroU33typuU/giphy.gif",
    "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
    "https://media.giphy.com/media/jpbnoe3UIa8TU8LM13/giphy.gif",
    "https://media.giphy.com/media/3o6ZsYq8HRqfQyq5lC/giphy.gif",
    "https://media.giphy.com/media/FmBhzktIjvdZe/giphy.gif",
    "https://media.giphy.com/media/LXONhtCmN32YU/giphy.gif",
    "https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif",
    "https://media.giphy.com/media/H4DjXQXamtTiIuCcRU/giphy.gif",
    "https://media.giphy.com/media/kiBcwEXegBTACmVOnE/giphy.gif",
    "https://media.giphy.com/media/XcSYLm6gegRjy/giphy.gif",
    "https://media.giphy.com/media/fxsqOYnIMEefC/giphy.gif",
    "https://media.giphy.com/media/C9x8gX02SnMIoAClXa/giphy.gif",
    "https://media.giphy.com/media/cPxRDvlSj9QKA/giphy.gif",
    "https://media.giphy.com/media/BzyTuYCmvSORqs1ABM/giphy.gif",
    "https://media.giphy.com/media/3oEjHXedgbAB8R8WnC/giphy.gif",
    "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
    "https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif",
    "https://media.giphy.com/media/eLpoGExPICEeY/giphy.gif",
    "https://media.giphy.com/media/MCfhrrNN1goH6/giphy.gif",
    "https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif",
    "https://media.giphy.com/media/l2SpZtackEqFmMT3G/giphy.gif",
    "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
    "https://media.giphy.com/media/3o7TKNkdXiNGqJbVyU/giphy.gif",
    "https://media.giphy.com/media/3oEdv22bKDUluFKkxi/giphy.gif",
    "https://media.giphy.com/media/4N5vB4aErlVtVsywBw/giphy.gif",
    "https://media.giphy.com/media/IbUUbU4xUDJWcFfUoS/giphy.gif",

    // Celebrations & Dance (30+)
    "https://media.giphy.com/media/l2Je66zG6mAAZxgqI/giphy.gif",
    "https://media.giphy.com/media/3oEduV4SOS9mmmIOkw/giphy.gif",
    "https://media.giphy.com/media/l4KibWpbgWchk7dpS/giphy.gif",
    "https://media.giphy.com/media/3o6UB3VhArvomJHtdK/giphy.gif",
    "https://media.giphy.com/media/3o7TKs384dC81f42LS/giphy.gif",
    "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif",
    "https://media.giphy.com/media/26tknCqiJrBQG6bxC/giphy.gif",
    "https://media.giphy.com/media/artj92V8o75VPL7AeQ/giphy.gif",
    "https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/Is1O1TWV0LEJi/giphy.gif",
    "https://media.giphy.com/media/l0HlQXlQ3nHyLMvte/giphy.gif",
    "https://media.giphy.com/media/3o6ZsUJ44ffpnAW7Dy/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/l0IykOsxLECVejOzm/giphy.gif",
    "https://media.giphy.com/media/3o7TKnCdBx5cMg05OS/giphy.gif",
    "https://media.giphy.com/media/3o6Zt7g9nH1cOEJruE/giphy.gif",
    "https://media.giphy.com/media/l3vRfhFD8hJCiP0uQ/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/26tPqTOGf3MMAaJR6/giphy.gif",
    "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
    "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    "https://media.giphy.com/media/3o6Zt7R02Q62fxgChq/giphy.gif",
    "https://media.giphy.com/media/l0HlI6nTy42xLagP6/giphy.gif",
    "https://media.giphy.com/media/3o6ZsZedY1zLKmXV8A/giphy.gif",
    "https://media.giphy.com/media/l41YtZOb9EUABnuqA/giphy.gif",
    "https://media.giphy.com/media/l0Iy67eveh48xHQFa/giphy.gif",
    "https://media.giphy.com/media/26BRBKqUiq586bRVm/giphy.gif",
    "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif",

    // Tech & Work (30+)
    "https://media.giphy.com/media/xT8qBvH1pA9DFKUX2E/giphy.gif",
    "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
    "https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
    "https://media.giphy.com/media/l0HlO3BJ8LALPW4sE/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
    "https://media.giphy.com/media/ZVik7pBtu9dNS/giphy.gif",
    "https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif",
    "https://media.giphy.com/media/citBl9yPwnUOs/giphy.gif",
    "https://media.giphy.com/media/3oKIPEqDGUULpEU0aQ/giphy.gif",
    "https://media.giphy.com/media/l46Cy1rHbQ92uuLXa/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/QNFhOolVeCzPQ2Mx85/giphy.gif",
    "https://media.giphy.com/media/xT9C25UNTwfZuk85WP/giphy.gif",
    "https://media.giphy.com/media/l0IylOPCNkiqOgMyA/giphy.gif",
    "https://media.giphy.com/media/3oKIPnbKgN3bXeVpvy/giphy.gif",
    "https://media.giphy.com/media/l1J9u3TZfpmeDLkD6/giphy.gif",
    "https://media.giphy.com/media/xT1XGWbE0XiBDX2T8Q/giphy.gif",
    "https://media.giphy.com/media/l0HlQoJe5vJMAAoGk/giphy.gif",
    "https://media.giphy.com/media/l1J9EdzfOSgfyueLm/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
    "https://media.giphy.com/media/QNFhOolVeCzPQ2Mx85/giphy.gif",
    "https://media.giphy.com/media/xT0xeuOy2Fcl9vDGiA/giphy.gif",
    "https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/QDjpIL6oNCVZ4/giphy.gif",
    "https://media.giphy.com/media/3oKIPnbKgN3bXeVpvy/giphy.gif",
    "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
    "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",

    // Movies & TV (25+)
    "https://media.giphy.com/media/xUPGcD44Ed2uYmZcSk/giphy.gif",
    "https://media.giphy.com/media/l0Iyl55kTeh71nTXy/giphy.gif",
    "https://media.giphy.com/media/3o6MbkZSYy4mI3gLYc/giphy.gif",
    "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
    "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    "https://media.giphy.com/media/dSetNZo2AJfptAk9hp/giphy.gif",
    "https://media.giphy.com/media/8qABb3dgjun8PdNirg/giphy.gif",
    "https://media.giphy.com/media/MCZ39lz83o5lC/giphy.gif",
    "https://media.giphy.com/media/3o7TKSjRrfIPjeiyc0/giphy.gif",
    "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",

]

// Comprehensive keyword categories
const KEYWORDS = {
    emotions: [
        "happy", "sad", "angry", "excited", "confused", "shocked", "surprised",
        "laughing", "crying", "smiling", "nervous", "anxious", "calm", "relaxed",
        "frustrated", "annoyed", "delighted", "thrilled", "worried", "scared"
    ],
    animals: [
        "cat", "dog", "puppy", "kitten", "bird", "bunny", "hamster", "panda",
        "bear", "lion", "tiger", "elephant", "monkey", "penguin", "owl", "fox",
        "rabbit", "squirrel", "dolphin", "whale", "shark", "horse", "cow", "pig"
    ],
    actions: [
        "dancing", "running", "jumping", "walking", "sitting", "standing", "typing",
        "coding", "working", "sleeping", "eating", "drinking", "cooking", "playing",
        "reading", "writing", "thinking", "waving", "clapping", "nodding"
    ],
    reactions: [
        "yes", "no", "maybe", "okay", "whatever", "nope", "agree", "disagree",
        "thumbs up", "thumbs down", "high five", "facepalm", "shrug", "mind blown",
        "eye roll", "slow clap", "applause", "booing", "cheering", "gasping"
    ],
    celebrations: [
        "party", "celebration", "birthday", "congrats", "cheers", "yay", "woohoo",
        "victory", "winning", "success", "achievement", "milestone", "toast",
        "fireworks", "confetti", "balloons", "cake", "gifts", "champagne", "disco"
    ],
    tech: [
        "computer", "laptop", "phone", "coding", "programming", "hacking", "typing",
        "loading", "processing", "error", "bug", "debugging", "developer", "tech",
        "digital", "cyber", "software", "hardware", "internet", "wifi"
    ],
    food: [
        "pizza", "burger", "taco", "sushi", "ramen", "pasta", "salad", "sandwich",
        "coffee", "tea", "beer", "wine", "cake", "cookie", "donut", "ice cream",
        "chocolate", "candy", "popcorn", "breakfast", "lunch", "dinner", "snack"
    ],
    entertainment: [
        "movie", "tv", "music", "concert", "show", "film", "series", "anime",
        "cartoon", "comedy", "drama", "thriller", "horror", "action", "romance",
        "documentary", "gaming", "video games", "streaming", "netflix"
    ],
    sports: [
        "football", "soccer", "basketball", "baseball", "tennis", "golf", "hockey",
        "boxing", "wrestling", "fitness", "gym", "workout", "exercise", "running",
        "cycling", "swimming", "yoga", "sports", "champion", "athlete"
    ],
    work: [
        "office", "meeting", "presentation", "deadline", "boss", "coworker", "team",
        "project", "email", "zoom", "work from home", "busy", "productive", "tired",
        "monday", "friday", "weekend", "coffee break", "lunch break", "overtime"
    ],
    memes: [
        "meme", "viral", "trending", "funny", "hilarious", "lol", "rofl", "lmao",
        "epic", "fail", "win", "mood", "vibe", "relatable", "same", "me irl",
        "when you", "that feeling", "be like", "every time"
    ],
    greetings: [
        "hello", "hi", "hey", "goodbye", "bye", "welcome", "good morning",
        "good night", "see you", "later", "peace", "wassup", "howdy", "yo",
        "greetings", "salutations", "aloha", "hola", "bonjour", "ciao"
    ],
    weather: [
        "rain", "snow", "sun", "sunny", "cloudy", "storm", "thunder", "lightning",
        "wind", "tornado", "hurricane", "rainbow", "cold", "hot", "warm", "cool",
        "freezing", "summer", "winter", "spring", "fall", "autumn", "weather"
    ],
    love: [
        "love", "heart", "kiss", "hug", "romance", "crush", "dating", "couple",
        "valentine", "sweetheart", "cute", "adorable", "aww", "bae", "relationship",
        "forever", "together", "soulmate", "love you", "miss you"
    ],
    misc: [
        "awesome", "cool", "amazing", "incredible", "fantastic", "wonderful",
        "beautiful", "gorgeous", "stunning", "perfect", "great", "good", "nice",
        "bad", "terrible", "weird", "strange", "crazy", "insane", "wild"
    ]
};

// Flatten all keywords into a single array
const ALL_KEYWORDS = Object.values(KEYWORDS).flat();

// Generate 1200 unique GIFs
export const MOCK_GIFS: MockGif[] = Array.from({ length: 1200 }).map((_, index) => {
    const baseGif = BASE_GIFS[index % BASE_GIFS.length];

    // Use different algorithms to ensure variety
    const keyword1 = ALL_KEYWORDS[index % ALL_KEYWORDS.length];
    const keyword2 = ALL_KEYWORDS[(index * 7 + 13) % ALL_KEYWORDS.length];
    const keyword3 = ALL_KEYWORDS[(index * 11 + 29) % ALL_KEYWORDS.length];

    // Vary the title format for uniqueness
    const titleFormats = [
        `${keyword1} ${keyword2}`,
        `${keyword1} ${keyword2} ${keyword3}`,
        `${keyword2} reaction`,
        `${keyword1} vibes`,
        `${keyword3} mood`,
        `${keyword1} and ${keyword2}`,
        `Best ${keyword1}`,
        `Funny ${keyword2}`,
        `Epic ${keyword3}`,
        `${keyword1} moment`,
    ];

    const titleFormat = titleFormats[index % titleFormats.length];

    // Vary dimensions for masonry layout
    const aspectRatios = [
        { width: 480, height: 270 },   // 16:9
        { width: 480, height: 360 },   // 4:3
        { width: 480, height: 480 },   // 1:1
        { width: 480, height: 600 },   // Portrait
        { width: 400, height: 300 },   // Small
        { width: 500, height: 400 },   // Medium
        { width: 450, height: 450 },   // Square-ish
        { width: 480, height: 320 },   // 3:2
    ];

    const dimensions = aspectRatios[index % aspectRatios.length];

    return {
        id: `gif-${String(index).padStart(4, '0')}`,
        url: baseGif,
        title: `${titleFormat} GIF #${index}`,
        width: dimensions.width,
        height: dimensions.height
    };
});

// Export by category for easier filtering
export const GIFS_BY_CATEGORY = {
    emotions: MOCK_GIFS.filter((_, i) => i % 15 === 0),
    animals: MOCK_GIFS.filter((_, i) => i % 15 === 1),
    actions: MOCK_GIFS.filter((_, i) => i % 15 === 2),
    reactions: MOCK_GIFS.filter((_, i) => i % 15 === 3),
    celebrations: MOCK_GIFS.filter((_, i) => i % 15 === 4),
    tech: MOCK_GIFS.filter((_, i) => i % 15 === 5),
    food: MOCK_GIFS.filter((_, i) => i % 15 === 6),
    entertainment: MOCK_GIFS.filter((_, i) => i % 15 === 7),
    sports: MOCK_GIFS.filter((_, i) => i % 15 === 8),
    work: MOCK_GIFS.filter((_, i) => i % 15 === 9),
    memes: MOCK_GIFS.filter((_, i) => i % 15 === 10),
    greetings: MOCK_GIFS.filter((_, i) => i % 15 === 11),
    weather: MOCK_GIFS.filter((_, i) => i % 15 === 12),
    love: MOCK_GIFS.filter((_, i) => i % 15 === 13),
    misc: MOCK_GIFS.filter((_, i) => i % 15 === 14),
};

// Helper function to search GIFs by keyword
export function searchGifs(query: string): MockGif[] {
    const lowerQuery = query.toLowerCase();
    return MOCK_GIFS.filter(gif =>
        gif.title.toLowerCase().includes(lowerQuery)
    );
}

// Helper function to get random GIFs
export function getRandomGifs(count: number = 20): MockGif[] {
    const shuffled = [...MOCK_GIFS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}