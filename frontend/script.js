// State Management
const state = {
    mode: 'default',
    bionicActive: false,
    focusMaskActive: false,
    complexity: 'academic'
};

// DOM Elements
const body = document.body;
const inputView = document.getElementById('input-view');
const articleContainer = document.getElementById('article-container');
const focusMask = document.getElementById('focus-mask');
const distressModal = document.getElementById('distress-modal');
const analysisResults = document.getElementById('analysis-results');
const recBanner = document.getElementById('recommendation-banner');
const recText = document.getElementById('rec-text');

// --- Core Logic ---

// 1. Process Input
function processText() {
    const rawText = document.getElementById('user-input').value.trim();
    if (!rawText) return alert("Please enter some text first!");

    // Analyze Text
    const analysis = analyzeText(rawText);
    updateAnalysisUI(analysis);
    
    // Generate Content
    renderContent(rawText);
    
    // Auto-Recommend Mode based on Logic
    autoRecommend(analysis);

    // Switch Views
    inputView.classList.add('hidden');
    articleContainer.classList.remove('hidden');
    
    // Update Meta
    document.getElementById('meta-time').innerText = Math.ceil(rawText.split(' ').length / 200) + " min read";
    document.getElementById('meta-complexity').innerText = analysis.complexityLevel;
}

// 2. Cognitive Analyzer (The "Intelligence")
function analyzeText(text) {
    const words = text.split(/\s+/);
    const wordCount = words.length;
    
    // Calculate Average Word Length (Complexity heuristic)
    const totalChars = words.join('').length;
    const avgWordLength = totalChars / wordCount;

    // Calculate Sentence Length (Cognitive Load heuristic)
    const sentences = text.split(/[.!?]+/);
    const avgSentenceLength = wordCount / sentences.length;

    // Determine Complexity Level
    let complexityLevel = "Standard";
    if (avgWordLength > 6) complexityLevel = "Academic/Complex";
    else if (avgWordLength < 4) complexityLevel = "Simple";

    return {
        wordCount,
        avgWordLength: avgWordLength.toFixed(1),
        avgSentenceLength: avgSentenceLength.toFixed(1),
        complexityLevel
    };
}

// 3. Update UI with Analysis
function updateAnalysisUI(data) {
    analysisResults.innerHTML = `
        <div class="stat-row"><span>Word Count:</span> <span class="stat-val">${data.wordCount}</span></div>
        <div class="stat-row"><span>Avg Word Len:</span> <span class="stat-val">${data.avgWordLength}</span></div>
        <div class="stat-row"><span>Avg Sentence Len:</span> <span class="stat-val">${data.avgSentenceLength}</span></div>
    `;
}

// 4. Auto-Recommend Logic
function autoRecommend(data) {
    let recommendation = "";
    let targetMode = "default";

    // Logic: Long texts with long sentences -> ADHD (Focus issues)
    if (data.wordCount > 150 && data.avgSentenceLength > 15) {
        recommendation = "Content is lengthy and dense. ADHD Focus Mode recommended.";
        targetMode = "adhd";
    } 
    // Logic: Complex words (long avg length) -> Dyslexia (Reading difficulty)
    else if (data.avgWordLength > 6) {
        recommendation = "High vocabulary density detected. Dyslexia Mode recommended.";
        targetMode = "dyslexia";
    } else {
        recommendation = "Content looks standard. Default Mode recommended.";
        targetMode = "default";
    }

    // Show Banner
    recText.innerText = recommendation;
    recBanner.classList.remove('hidden');
    
    // Apply the mode automatically
    setMode(targetMode);
}

// 5. Render Content & Simulate AI Simplification
function renderContent(text) {
    // -- Academic (Original) --
    // Use textContent for safety, then format paragraphs
    const academicDiv = document.getElementById('content-academic');
    academicDiv.innerHTML = ''; // Clear previous
    
    // Simple paragraph formatting
    const paragraphs = text.split(/\n\n+/);
    paragraphs.forEach(p => {
        const para = document.createElement('p');
        para.textContent = p; // SAFE injection
        academicDiv.appendChild(para);
    });

    // -- Simplified (Mock AI) --
    const simplifiedDiv = document.getElementById('content-simplified');
    // Mock Logic: Take first sentence of every paragraph and bullet it
    const simplePoints = paragraphs.map(p => p.split(/[.!?]/)[0]);
    
    simplifiedDiv.innerHTML = '<h3>Summary & Key Points</h3><ul>' + 
        simplePoints.map(s => `<li>${s}.</li>`).join('') + 
        '</ul><p><em>(AI Generated Summary)</em></p>';

    // Visual Summary Logic for ADHD
    updateVisualSummary(paragraphs[0]);
}

// 6. Safe Bionic Reading
function applyBionicReading(active) {
    const container = document.getElementById('content-academic');
    const paragraphs = container.querySelectorAll('p');

    paragraphs.forEach(p => {
        if (active) {
            // Process only if not already processed
            if (!p.dataset.bionic) {
                const text = p.textContent; // Read raw text
                const words = text.split(' ');
                
                const newHtml = words.map(word => {
                    // Skip short words or punctuation-only
                    if (word.length < 3) return word;
                    const half = Math.ceil(word.length / 2);
                    // Create safe HTML structure
                    return `<span class="bionic">${word.slice(0, half)}</span>${word.slice(half)}`;
                }).join(' ');

                p.innerHTML = newHtml; // Re-inject safe HTML
                p.dataset.bionic = "true";
            }
        } else {
            // Revert to original text (stored in textContent)
            const text = p.textContent;
            p.innerHTML = text; // Resets formatting
            delete p.dataset.bionic;
        }
    });
}

// --- UI Interaction Functions ---

function setMode(mode) {
    body.classList.remove('mode-dyslexia', 'mode-adhd');
    document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    state.mode = mode;
    
    if (mode === 'dyslexia') {
        body.classList.add('mode-dyslexia');
        toggleBionic(true);
        document.getElementById('toggle-bionic').checked = true;
    } else if (mode === 'adhd') {
        body.classList.add('mode-adhd');
        // Show simplified view by default for ADHD? Optional.
        // changeComplexity('simplified'); 
    } else {
        toggleBionic(false);
        document.getElementById('toggle-bionic').checked = false;
    }
}

function toggleBionic(isActive) {
    state.bionicActive = isActive;
    applyBionicReading(isActive);
}

function changeComplexity(level) {
    state.complexity = level;
    const academic = document.getElementById('content-academic');
    const simplified = document.getElementById('content-simplified');

    if (level === 'academic') {
        academic.classList.remove('hidden');
        simplified.classList.add('hidden');
    } else {
        academic.classList.add('hidden');
        simplified.classList.remove('hidden');
    }
}

function toggleFocusMask(isActive) {
    state.focusMaskActive = isActive;
    if (isActive) {
        focusMask.classList.add('active');
        document.addEventListener('mousemove', moveFocusMask);
    } else {
        focusMask.classList.remove('active');
        document.removeEventListener('mousemove', moveFocusMask);
    }
}

function moveFocusMask(e) {
    focusMask.style.clipPath = `ellipse(80% 120px at 50% ${e.clientY}px)`;
}

function updateVisualSummary(firstParagraph) {
    // Very simple heuristic: show first 3 words as "Topic"
    const words = firstParagraph.split(' ');
    const topic = words.slice(0, 3).join(' ') + '...';
    const summary = document.getElementById('visual-summary');
    // Update the card text dynamically
    summary.querySelector('.card:last-child .text').innerText = topic;
}

function goBack() {
    articleContainer.classList.add('hidden');
    inputView.classList.remove('hidden');
    // Reset analysis
    recBanner.classList.add('hidden');
    analysisResults.innerHTML = '<p class="placeholder-text">Paste text to begin analysis...</p>';
}

function triggerBreak() { distressModal.classList.remove('hidden'); }
function closeBreak() { distressModal.classList.add('hidden'); }

// Initialize
document.addEventListener('DOMContentLoaded', () => setMode('default'));
