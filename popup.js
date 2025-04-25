const profileInput = document.getElementById('profileInput');
const addProfileBtn = document.getElementById('addProfile');
const blockAllBtn = document.getElementById('blockAll');
const clearListBtn = document.getElementById('clearList');
const syncBtn = document.getElementById('sync');
const profileList = document.getElementById('profileList');

const BLOCKLIST_URL = 'https://raw.githubusercontent.com/LoicmeyerMMI/XBLOCKLIST/refs/heads/main/blocklist.json'; // 🔁 À modifier
const PENDING_URL = 'https://raw.githubusercontent.com/LoicmeyerMMI/XBLOCKLIST/refs/heads/main/pending.json';   // 🔁 À modifier

// 🔧 Helper: Normalise un @username ou une URL en nom d'utilisateur
function extractUsername(input) {
  const match = input.match(/(?:https:\/\/twitter\.com\/)?@?([a-zA-Z0-9_]{1,15})/);
  return match ? match[1].toLowerCase() : null;
}

// 🔄 Affiche la liste actuelle
function renderList() {
  chrome.storage.local.get(['blockedProfiles'], (res) => {
    const profiles = res.blockedProfiles || [];
    profileList.innerHTML = '';

    profiles.forEach((username, index) => {
      const li = document.createElement('li');
      li.textContent = `@${username}`;

      const blockBtn = document.createElement('button');
      blockBtn.textContent = 'Ban';
      blockBtn.onclick = () => {
        chrome.runtime.sendMessage({ action: 'blockNow', username });
      };

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '❌';
      removeBtn.onclick = () => {
        profiles.splice(index, 1);
        chrome.storage.local.set({ blockedProfiles: profiles }, renderList);
      };

      li.appendChild(blockBtn);
      li.appendChild(removeBtn);
      profileList.appendChild(li);
    });
  });
}

// ➕ Ajoute un profil
addProfileBtn.addEventListener('click', () => {
  const username = extractUsername(profileInput.value);
  if (!username) return;

  chrome.storage.local.get(['blockedProfiles'], (res) => {
    const profiles = res.blockedProfiles || [];
    if (!profiles.includes(username)) {
      profiles.push(username);
      chrome.storage.local.set({ blockedProfiles: profiles }, renderList);
    }
    profileInput.value = '';
  });
});

// 🧹 Vider la liste
clearListBtn.addEventListener('click', () => {
  chrome.storage.local.set({ blockedProfiles: [] }, renderList);
});

// 💥 Bloquer tous
blockAllBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'blockAll' });
});

// 🔄 Synchronisation avec GitHub
syncBtn.addEventListener('click', () => {
  fetch(BLOCKLIST_URL)
    .then(res => res.json())
    .then(data => {
      const usernames = data.map(u => extractUsername(u)).filter(Boolean);
      chrome.storage.local.set({ blockedProfiles: usernames }, renderList);
      alert('✅ Synchro terminée');
    })
    .catch(err => {
      console.error('Erreur de synchro', err);
      alert('❌ Erreur de synchro');
    });
});

// ➤ Initialiser l'affichage
document.addEventListener('DOMContentLoaded', renderList);
