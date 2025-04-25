const BLOCKLIST_URL = 'https://raw.githubusercontent.com/TON_USER/TON_REPO/main/blocklist.json'; // 🔁 à remplacer
const PENDING_POST_URL = 'https://api.github.com/repos/TON_USER/TON_REPO/contents/pending.json'; // 🔁 si tu veux gérer en POST via API GitHub
const GITHUB_TOKEN = ''; // 🔒 ton token personnel, si jamais tu veux automatiser l'envoi

// 🔧 Ouvre un profil Twitter dans un onglet pour le bloquer
function openAndBlock(username) {
  chrome.tabs.create({ url: `https://twitter.com/${username}`, active: false }, (tab) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const openMenu = () => {
            const btn = document.querySelector('div[aria-label="Plus d’options"]');
            if (btn) btn.click();
          };

          const clickBlock = () => {
            const items = [...document.querySelectorAll('div[role="menuitem"]')];
            const blockBtn = items.find(el => el.innerText.toLowerCase().includes("bloquer"));
            if (blockBtn) blockBtn.click();
          };

          const confirmBlock = () => {
            const confirm = [...document.querySelectorAll('div[role="button"]')].find(btn =>
              btn.innerText.toLowerCase().includes("bloquer"));
            if (confirm) confirm.click();
          };

          setTimeout(openMenu, 1000);
          setTimeout(clickBlock, 2000);
          setTimeout(confirmBlock, 3000);
        }
      }, () => {
        setTimeout(() => chrome.tabs.remove(tab.id), 5000);
      });
    }, 1500);
  });
}

// 🔁 Ajoute à pending.json (ici on stocke en local, à toi de l’ajouter manuellement au JSON GitHub)
function proposePending(username) {
  chrome.storage.local.get(['pendingQueue'], (res) => {
    const current = res.pendingQueue || [];
    if (!current.includes(username)) {
      current.push(username);
      chrome.storage.local.set({ pendingQueue: current });
    }
  });
}

// 📨 Gestion des messages venant du popup ou du content_script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'blockNow' && msg.username) {
    openAndBlock(msg.username);
    proposePending(msg.username);
  }

  if (msg.action === 'blockAll') {
    chrome.storage.local.get(['blockedProfiles'], (res) => {
      const list = res.blockedProfiles || [];
      list.forEach(username => {
        openAndBlock(username);
        proposePending(username);
      });
    });
  }
});
