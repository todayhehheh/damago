import { currentUser, updateUserLocal } from './auth.js';
import { db, doc, updateDoc } from './firebase-config.js';

// Configuration
const DECAY_RATE_PER_SECOND = 1 / 60; // Example: 1 point drop per minute (approx)
const INTERACTION_COST = 10;
const INTERACTION_GAIN = 15;

export function initPet() {
    console.log("Pet System Initialized");
    applyDecay();
    updatePetUI();
    startTicker();

    // Bind buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => handleInteraction(btn.dataset.action));
    });
}

function applyDecay() {
    if (!currentUser.data || !currentUser.data.pet) return;

    const lastLogin = new Date(currentUser.data.pet.lastLogin).getTime();
    const now = new Date().getTime();
    const diffSeconds = (now - lastLogin) / 1000;

    const decayAmount = Math.floor(diffSeconds * DECAY_RATE_PER_SECOND);

    if (decayAmount > 0) {
        // Decrease stats
        currentUser.data.pet.hunger = Math.max(0, currentUser.data.pet.hunger - decayAmount);
        currentUser.data.pet.cleanliness = Math.max(0, currentUser.data.pet.cleanliness - decayAmount);
        currentUser.data.pet.fun = Math.max(0, currentUser.data.pet.fun - decayAmount);

        // Update last login to now
        currentUser.data.pet.lastLogin = new Date().toISOString();

        // Sync to DB (Debounced normally, but here direct)
        savePetState();

        console.log(`Applied decay: -${decayAmount} points over ${Math.floor(diffSeconds / 60)} mins`);
    }
}

async function handleInteraction(action) {
    if (!currentUser.data) return;

    // Check Coins
    if (currentUser.data.coins < INTERACTION_COST) {
        showSpeech("코인이 부족해요! 😭");
        return;
    }

    // Apply Effect
    let speechText = "";
    if (action === 'feed') {
        currentUser.data.pet.hunger = Math.min(100, currentUser.data.pet.hunger + INTERACTION_GAIN);
        speechText = "냠냠! 맛있다!";
    } else if (action === 'clean') {
        currentUser.data.pet.cleanliness = Math.min(100, currentUser.data.pet.cleanliness + INTERACTION_GAIN);
        speechText = "상쾌해!";
    } else if (action === 'play') {
        currentUser.data.pet.fun = Math.min(100, currentUser.data.pet.fun + INTERACTION_GAIN);
        speechText = "헤헤! 재밌다!";
    }

    // Deduct Coin
    currentUser.data.coins -= INTERACTION_COST;

    // Save & Update
    updatePetUI();
    showSpeech(speechText);
    await savePetState();
}

async function savePetState() {
    if (!currentUser.id) return;
    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, {
        coins: currentUser.data.coins,
        pet: {
            ...currentUser.data.pet,
            lastLogin: new Date().toISOString()
        }
    });
    // Update header
    updateHeader();
}

function startTicker() {
    setInterval(() => {
        if (!currentUser.data) return;
        // Visual decay every minute (optional) or just speech updates
        updateSpeech();
    }, 10000);
}

export function updatePetUI() {
    if (!currentUser.data) return;
    const pet = currentUser.data.pet;

    // Bars
    document.getElementById('bar-hunger').style.width = `${pet.hunger}%`;
    document.getElementById('bar-clean').style.width = `${pet.cleanliness}%`;
    document.getElementById('bar-fun').style.width = `${pet.fun}%`;

    // Colors based on level
    updateBarColor('bar-hunger', pet.hunger);
    updateBarColor('bar-clean', pet.cleanliness);
    updateBarColor('bar-fun', pet.fun);

    updateHeader();
}

function updateBarColor(id, val) {
    const el = document.getElementById(id);
    if (val < 30) el.style.backgroundColor = "#e74c3c"; // Red
    else if (val < 70) el.style.backgroundColor = "#f1c40f"; // Yellow
    else el.style.backgroundColor = "#2ecc71"; // Green
}

function updateHeader() {
    document.getElementById('user-nickname').innerText = currentUser.data.nickname;
    document.getElementById('user-coins').innerText = currentUser.data.coins;
}

function updateSpeech() {
    const pet = currentUser.data.pet;
    if (pet.hunger < 30) showSpeech("배고파요...");
    else if (pet.cleanliness < 30) showSpeech("냄새나요...");
    else if (pet.fun < 30) showSpeech("심심해요...");
}

function showSpeech(text) {
    const el = document.getElementById('pet-speech');
    el.innerText = text;
    // Simple animation reset
    el.style.animation = 'none';
    el.offsetHeight; /* trigger reflow */
    el.style.animation = 'bounce 2s infinite';
}
