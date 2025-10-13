// Initialize Vanta.js background
let vantaEffect = VANTA.NET({
    el: "#vanta-bg",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0xcc66ff,
    backgroundColor: '#1a0a2e',
    points: 10.00,
    maxDistance: 22.00,
    spacing: 17.00
});

// DOM Elements
const introScreen = document.getElementById('intro-screen');
const mainContent = document.getElementById('main-content');
const chatContainer = document.getElementById('chat-container');
const endingScreen = document.getElementById('ending-screen');
const easterEgg = document.getElementById('easter-egg');
const startBtn = document.getElementById('start-btn');
const chapterBtns = document.querySelectorAll('.chapter-btn');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const nextBtn = document.getElementById('next-btn');
const replayBtn = document.getElementById('replay-btn');
const nextChapterBtn = document.getElementById('next-chapter-btn');
const closeEggBtn = document.getElementById('close-egg-btn');
const filterBtn = document.getElementById('filter-btn');
const filterPanel = document.getElementById('filter-panel');
const applyFilter = document.getElementById('apply-filter');
const clearFilter = document.getElementById('clear-filter');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');

// State variables
let currentChapter = 'beginning';
let currentMessageIndex = 0;
let autoPlayInterval;
let isPlaying = false;
let globalStartDate = null;
let globalEndDate = null;
let hasStarted = false;

// Initialize Feather Icons
feather.replace();

// Close filter panel when clicking outside
document.addEventListener('click', (e) => {
    if (!filterBtn.contains(e.target) && !filterPanel.contains(e.target)) {
        filterPanel.classList.add('hidden');
    }
});

// Start button click handler
startBtn.addEventListener('click', () => {
    gsap.to(introScreen, { opacity: 0, duration: 1, onComplete: () => {
        introScreen.style.display = 'none';
        mainContent.style.display = 'block';
        hasStarted = true;
        loadChapter(currentChapter);
    }});
});

// Chapter button click handlers
chapterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentChapter = btn.dataset.chapter;
        currentMessageIndex = 0;
        loadChapter(currentChapter);
        
        // Update active chapter button
        chapterBtns.forEach(b => b.classList.remove('bg-pink-500'));
        btn.classList.add('bg-pink-500');
    });
});

// Control button handlers
playBtn.addEventListener('click', startAutoPlay);
pauseBtn.addEventListener('click', pauseAutoPlay);
nextBtn.addEventListener('click', showNextMessage);
replayBtn.addEventListener('click', resetJourney);
nextChapterBtn.addEventListener('click', () => {
    easterEgg.style.display = 'flex';
});
closeEggBtn.addEventListener('click', () => easterEgg.style.display = 'none');

// Filter button toggle
filterBtn.addEventListener('click', () => {
    filterPanel.classList.toggle('hidden');
});

// Apply date filter
applyFilter.addEventListener('click', () => {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    if (isNaN(startDate) || isNaN(endDate)) {
        alert('Please select both dates');
        return;
    }
    
    // Set end date to end of day for better filtering
    endDate.setHours(23, 59, 59, 999);
    
    // Set global date filters
    globalStartDate = startDate;
    globalEndDate = endDate;
    
    // Check if any messages exist across all chapters
    let totalFilteredMessages = 0;
    Object.keys(chatData).forEach(chapterKey => {
        totalFilteredMessages += getFilteredMessages(chapterKey).length;
    });
    
    if (totalFilteredMessages === 0) {
        alert('No messages found in this date range across any chapter. Please select a different date range.');
        globalStartDate = null;
        globalEndDate = null;
        return;
    }
    
    // Reload current chapter with filter
    chatContainer.innerHTML = '';
    currentMessageIndex = 0;
    loadChapter(currentChapter);
    filterPanel.classList.add('hidden');
});

// Clear filter
clearFilter.addEventListener('click', () => {
    globalStartDate = null;
    globalEndDate = null;
    startDateInput.value = '';
    endDateInput.value = '';
    chatContainer.innerHTML = '';
    currentMessageIndex = 0;
    loadChapter(currentChapter);
    filterPanel.classList.add('hidden');
});

// Get filtered messages based on global date filter
function getFilteredMessages(chapter) {
    const messages = chatData[chapter];
    
    if (!globalStartDate || !globalEndDate) {
        return messages;
    }
    
    return messages.filter(msg => {
        const msgDate = new Date(msg.date);
        return msgDate >= globalStartDate && msgDate <= globalEndDate;
    });
}

// Load a chapter
function loadChapter(chapter) {
    chatContainer.innerHTML = '';
    currentMessageIndex = 0;
    
    if (isPlaying) {
        pauseAutoPlay();
    }
    
    // Set initial background color for the chapter
    const colorSchemes = getChapterColorScheme(chapter);
    
    if (vantaEffect) {
        vantaEffect.setOptions({
            color: colorSchemes.vantaStart,
            backgroundColor: colorSchemes.bgStart
        });
    }
    
    document.body.style.backgroundColor = colorSchemes.bgStart;
    
    // Show stats first
    showStats();
    
    // Check if there are messages to display
    const messages = getFilteredMessages(currentChapter);
    if (messages.length > 0) {
        // Show first message
        showNextMessage();
    }
}

// Show next message in current chapter
function showNextMessage() {
    const messages = getFilteredMessages(currentChapter);
    
    // If no messages in current chapter (filtered), try next chapter
    if (messages.length === 0) {
        if (currentChapter === 'forever') {
            showEnding();
        } else {
            const nextChapter = getNextChapter(currentChapter);
            if (nextChapter) {
                currentChapter = nextChapter;
                currentMessageIndex = 0;
                loadChapter(currentChapter);
                
                // Update active chapter button
                chapterBtns.forEach(b => b.classList.remove('bg-pink-500'));
                document.querySelector(`[data-chapter="${currentChapter}"]`).classList.add('bg-pink-500');
            }
        }
        return;
    }
    
    if (currentMessageIndex >= messages.length) {
        if (currentChapter === 'forever') {
            showEnding();
        } else {
            // Move to next chapter
            const nextChapter = getNextChapter(currentChapter);
            if (nextChapter) {
                currentChapter = nextChapter;
                currentMessageIndex = 0;
                loadChapter(currentChapter);
                
                // Update active chapter button
                chapterBtns.forEach(b => b.classList.remove('bg-pink-500'));
                document.querySelector(`[data-chapter="${currentChapter}"]`).classList.add('bg-pink-500');
            }
        }
        return;
    }
    
    const message = messages[currentMessageIndex];
    displayMessage(message);
    currentMessageIndex++;
}

// Display a single message
function displayMessage(message, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-4 flex ${message.sender === 'you' ? 'justify-end' : 'justify-start'} ${animate ? 'message-enter' : ''}`;
    
    let bubbleClass = message.sender === 'you' ? 
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-l-2xl rounded-tr-2xl' : 
        'bg-gray-700 text-gray-200 rounded-r-2xl rounded-tl-2xl';
    
    // Update background color based on progress in chapter
    updateBackgroundByProgress();
    
    // Create typing indicator first
    if (message.sender === 'her') {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'mb-2 flex justify-start';
        typingDiv.innerHTML = `
            <div class="typing-indicator bg-gray-700 rounded-full px-4 py-2">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        chatContainer.appendChild(typingDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Remove typing indicator after delay
        setTimeout(() => {
            typingDiv.remove();
            
            // Create actual message
            messageDiv.innerHTML = `
                <div class="max-w-xs md:max-w-md px-4 py-2 ${bubbleClass} shadow-md">
                    <div class="text-sm">${message.text}</div>
                    <div class="text-xs text-gray-300 text-right mt-1">${formatTime(message.date)}</div>
                </div>
            `;
            chatContainer.appendChild(messageDiv);
            
            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Create heart particles for love messages
            if (message.text.includes('❤️') || message.text.includes('💘') || message.text.includes('💕')) {
                createHeartParticles(messageDiv);
            }
        }, 1500 + (message.text.length * 30));
    } else {
        // Your messages appear instantly
        messageDiv.innerHTML = `
            <div class="max-w-xs md:max-w-md px-4 py-2 ${bubbleClass} shadow-md">
                <div class="text-sm">${message.text}</div>
                <div class="text-xs text-gray-300 text-right mt-1">${formatTime(message.date)}</div>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Create heart particles
function createHeartParticles(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    
    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-particle text-pink-400';
        heart.innerHTML = '❤️';
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 10 + 10}px`;
        document.body.appendChild(heart);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 1 + Math.random() * 2;
        const lifetime = 1000 + Math.random() * 1000;
        
        gsap.to(heart, {
            x: `+=${Math.cos(angle) * 100}`,
            y: `+=${Math.sin(angle) * 100 - 50}`,
            opacity: 0,
            duration: lifetime / 1000,
            ease: 'power1.out',
            onComplete: () => heart.remove()
        });
    }
}

// Auto-play functions
function startAutoPlay() {
    if (isPlaying) return;
    isPlaying = true;
    playBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    autoPlayInterval = setInterval(showNextMessage, 2500);
}

function pauseAutoPlay() {
    isPlaying = false;
    playBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    clearInterval(autoPlayInterval);
}

// Get next chapter
function getNextChapter(current) {
    const chapters = ['beginning', 'love', 'talks', 'fights', 'forever'];
    const index = chapters.indexOf(current);
    return index < chapters.length - 1 ? chapters[index + 1] : null;
}

// Show ending screen
function showEnding() {
    pauseAutoPlay();
    mainContent.style.display = 'none';
    endingScreen.style.display = 'flex';
    
    // Calculate total stats
    let totalMessages = 0;
    let earliestDate = null;
    let latestDate = null;
    
    Object.keys(chatData).forEach(chapterKey => {
        const chapterMessages = getFilteredMessages(chapterKey);
        if (chapterMessages.length > 0) {
            totalMessages += chapterMessages.length;
            const chapterStart = new Date(chapterMessages[0].date);
            const chapterEnd = new Date(chapterMessages[chapterMessages.length-1].date);
            
            if (!earliestDate || chapterStart < earliestDate) earliestDate = chapterStart;
            if (!latestDate || chapterEnd > latestDate) latestDate = chapterEnd;
        }
    });
    
    const totalDays = earliestDate && latestDate ? 
        Math.round((latestDate - earliestDate) / (1000 * 60 * 60 * 24)) : 0;
    
    document.querySelector('#ending-screen p:nth-child(2)').textContent = 
        `${totalDays} days of memories`;
    document.querySelector('#ending-screen p:nth-child(3)').textContent = 
        `${totalMessages} messages shared`;
    
    // Create animated stats visualization
    const heartContainer = document.querySelector('.heart-animation');
    heartContainer.innerHTML = ''; // Clear previous content
    
    // Create a beautiful circular progress animation
    heartContainer.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center">
            <svg class="absolute" width="160" height="160" viewBox="0 0 160 160">
                <!-- Outer ring -->
                <circle cx="80" cy="80" r="70" fill="none" stroke="#ec4899" stroke-width="2" opacity="0.2"/>
                <circle id="progress-ring" cx="80" cy="80" r="70" fill="none" stroke="url(#gradient)" 
                        stroke-width="4" stroke-linecap="round" 
                        stroke-dasharray="440" stroke-dashoffset="440"
                        transform="rotate(-90 80 80)"/>
                
                <!-- Gradient definition -->
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- Center heart pulse -->
                <text x="80" y="90" text-anchor="middle" font-size="40" class="heart-pulse">💕</text>
            </svg>
            
            <!-- Orbiting icons -->
            <div class="orbit-container absolute w-full h-full">
                <div class="orbit-item" style="--delay: 0s">💝</div>
                <div class="orbit-item" style="--delay: 1s">💖</div>
                <div class="orbit-item" style="--delay: 2s">💗</div>
                <div class="orbit-item" style="--delay: 3s">💓</div>
            </div>
        </div>
    `;
    
    // Animate the progress ring
    gsap.to('#progress-ring', {
        strokeDashoffset: 0,
        duration: 3,
        ease: 'power2.out'
    });
    
    // Add pulse animation to center heart
    gsap.to('.heart-pulse', {
        scale: 1.2,
        opacity: 0.8,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        transformOrigin: 'center'
    });
}

// Reset the journey
function resetJourney() {
    endingScreen.style.display = 'none';
    mainContent.style.display = 'block';
    currentChapter = 'beginning';
    currentMessageIndex = 0;
    globalStartDate = null;
    globalEndDate = null;
    startDateInput.value = '';
    endDateInput.value = '';
    loadChapter(currentChapter);
    
    // Reset active chapter button
    chapterBtns.forEach(b => b.classList.remove('bg-pink-500'));
    document.querySelector('[data-chapter="beginning"]').classList.add('bg-pink-500');
}

// Show stats for current chapter
function showStats() {
    const messages = getFilteredMessages(currentChapter);
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'bg-gray-800 bg-opacity-70 p-4 rounded-lg mb-4 text-center';
    
    if (messages.length === 0) {
        statsDiv.innerHTML = `
            <h3 class="text-lg font-bold mb-2 text-yellow-400">${getChapterTitle(currentChapter)}</h3>
            <div class="bg-yellow-900 bg-opacity-40 p-3 rounded-lg border border-yellow-600">
                <p class="text-sm text-yellow-200">⚠️ No messages found in this date range</p>
                <p class="text-xs text-yellow-300 mt-1">Try a different date range or clear the filter</p>
            </div>
            ${globalStartDate ? '<p class="text-xs text-pink-400 mt-2">(filtered view active)</p>' : ''}
        `;
        chatContainer.prepend(statsDiv);
        return;
    }
    
    const startDate = new Date(messages[0].date);
    const endDate = new Date(messages[messages.length-1].date);
    const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    statsDiv.innerHTML = `
        <h3 class="text-lg font-bold mb-2">${getChapterTitle(currentChapter)}</h3>
        <p class="text-sm">${messages.length} messages</p>
        <p class="text-sm">${days} days</p>
        <p class="text-sm">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
        ${globalStartDate ? '<p class="text-xs text-pink-400 mt-1">(filtered view active)</p>' : ''}
    `;
    chatContainer.prepend(statsDiv);
}

// Helper function to get chapter title
function getChapterTitle(chapter) {
    const titles = {
        'beginning': '🩵 THE BEGINNING',
        'love': '💞 FALLING IN LOVE',
        'talks': '💬 LATE-NIGHT TALKS',
        'fights': '😤 CRAZY FIGHTS',
        'forever': '💌 FOREVER & ALWAYS'
    };
    return titles[chapter] || chapter.toUpperCase();
}

// Update background color based on progress within the chapter
function updateBackgroundByProgress() {
    const messages = getFilteredMessages(currentChapter);
    const totalMessages = messages.length;
    const progress = currentMessageIndex / totalMessages;
    
    // Get color schemes for current chapter
    const colorSchemes = getChapterColorScheme(currentChapter);
    
    // Interpolate between start and end colors based on progress
    const bgColor = interpolateColor(colorSchemes.bgStart, colorSchemes.bgEnd, progress);
    const vantaColor = interpolateHexColor(colorSchemes.vantaStart, colorSchemes.vantaEnd, progress);
    
    // Update colors
    if (vantaEffect) {
        vantaEffect.setOptions({
            color: vantaColor,
            backgroundColor: bgColor
        });
    }
    document.body.style.backgroundColor = bgColor;
}

// Get color scheme for each chapter (start to end gradient)
function getChapterColorScheme(chapter) {
    const schemes = {
        beginning: {
            bgStart: '#1a0a2e',    // Deep purple
            bgEnd: '#2d1b4e',      // Lighter purple
            vantaStart: 0xcc66ff,  // Light purple
            vantaEnd: 0xe699ff     // Lighter purple
        },
        love: {
            bgStart: '#2d1b3d',    // Purple-pink
            bgEnd: '#4a1f4f',      // Brighter purple-pink
            vantaStart: 0xff66cc,  // Pink
            vantaEnd: 0xff99dd     // Lighter pink
        },
        talks: {
            bgStart: '#0f1b3d',    // Deep blue
            bgEnd: '#1a2f5f',      // Lighter blue
            vantaStart: 0x3366ff,  // Blue
            vantaEnd: 0x6699ff     // Lighter blue
        },
        fights: {
            bgStart: '#2d1111',    // Deep red
            bgEnd: '#4a1f1f',      // Lighter red
            vantaStart: 0xff3333,  // Red
            vantaEnd: 0xff6666     // Lighter red
        },
        forever: {
            bgStart: '#1a0d2e',    // Deep violet
            bgEnd: '#3d1f5f',      // Brighter violet
            vantaStart: 0x9933ff,  // Purple
            vantaEnd: 0xcc66ff     // Lighter purple
        }
    };
    return schemes[chapter] || schemes.beginning;
}

// Interpolate between two hex color strings (e.g., '#1a0a2e' to '#2d1b4e')
function interpolateColor(color1, color2, progress) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * progress);
    const g = Math.round(c1.g + (c2.g - c1.g) * progress);
    const b = Math.round(c1.b + (c2.b - c1.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Interpolate between two hex numbers (e.g., 0xcc66ff to 0xe699ff)
function interpolateHexColor(color1, color2, progress) {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    return (r << 16) | (g << 8) | b;
}

// Convert hex string to RGB object
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Don't auto-load on page load, wait for user to click start
feather.replace();
