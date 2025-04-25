// 🔧 Normalise les usernames depuis une URL ou texte brut
function extractUsernameFromURL(url) {
  const match = url.match(/twitter\.com\/([a-zA-Z0-9_]{1,15})/);
  return match ? match[1].toLowerCase() : null;
}

// 🔘 Insertion d’un bouton Ban dans les pages de profil
function injectBanButtonInProfile() {
  const path = window.location.pathname;
  const username = extractUsernameFromURL(window.location.href);
  if (!username || !/^\/[a-zA-Z0-9_]{1,15}$/.test(path)) return;

  // Empêche les doublons
  if (document.querySelector('#ban-btn-profile')) return;

  const header = document.querySelector('div[data-testid="UserName"]');
  if (header) {
    const btn = document.createElement('button');
    btn.id = 'ban-btn-profile';
    btn.innerText = '🚫 Ban';
    btn.style = 'margin-left: 10px; padding: 4px 8px; background: #c00; color: white; border: none; border-radius: 4px; cursor: pointer;';
    btn.onclick = () => {
      chrome.runtime.sendMessage({ action: 'blockNow', username });
    };
    header.appendChild(btn);
  }
}

// 🔘 Insertion dans les tweets affichés
function injectBanButtonsInTweets() {
  const tweets = document.querySelectorAll('article div[data-testid="User-Names"]:not(.ban-injected)');

  tweets.forEach(tweet => {
    const userLink = tweet.querySelector('a[href^="/"]');
    if (!userLink) return;

    const username = extractUsernameFromURL(userLink.href);
    if (!username) return;

    const btn = document.createElement('button');
    btn.innerText = '🚫';
    btn.title = 'Ban';
    btn.style = 'margin-left: 6px; background: #c00; color: white; border: none; border-radius: 4px; font-size: 12px; padding: 2px 4px; cursor: pointer;';
    btn.onclick = (e) => {
      e.stopPropagation();
      chrome.runtime.sendMessage({ action: 'blockNow', username });
    };

    tweet.classList.add('ban-injected');
    tweet.appendChild(btn);
  });
}

// 👀 Observe Twitter dynamiquement (SPA)
const observer = new MutationObserver(() => {
  injectBanButtonInProfile();
  injectBanButtonsInTweets();
});

observer.observe(document.body, { childList: true, subtree: true });
