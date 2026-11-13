const fab = document.createElement('button');
fab.className = 'chat-fab'; fab.type = 'button'; fab.textContent = '?';
fab.setAttribute('aria-label', 'Open help chatbot');
document.body.insertAdjacentHTML('beforeend', '<section class="chat-panel" id="chatPanel" hidden><div class="chat-head"><b>Artelier Help</b><button id="chatClose" type="button">×</button></div><div class="chat-log" id="chatLog"><div class="bot-msg">Hi! Ask me about Artelier.</div></div><form class="chat-form" id="chatForm"><input id="chatInput" placeholder="Type a question" required><button>Send</button></form></section>');
document.body.appendChild(fab);

const panel = document.getElementById('chatPanel');
const log = document.getElementById('chatLog');
fab.addEventListener('click', () => panel.hidden = !panel.hidden);
document.getElementById('chatClose').addEventListener('click', () => panel.hidden = true);

function addMessage(text, type) {
  const message = document.createElement('div');
  message.className = type; message.textContent = text;
  log.appendChild(message); log.scrollTop = log.scrollHeight;
}

function getReply(text) {
  text = text.toLowerCase();
  if (text.includes('animation') || text.includes('keyframe')) return 'Use Animation for videos and keyframe images.';
  if (text.includes('digital')) return 'Use Digital Art for digital drawings.';
  if (text.includes('traditional')) return 'Use Traditional Art for paper drawings and paintings.';
  if (text.includes('practice') || text.includes('task')) return 'Add a task in Daily Practice and tick it when complete.';
  if (text.includes('calculator')) return 'The calculator supports addition, subtraction, multiplication and division.';
  if (text.includes('dark') || text.includes('theme')) return 'Use the moon or sun button to change the theme.';
  if (text.includes('upload') || text.includes('image') || text.includes('video')) return 'Choose a file in the Add Artwork form. It is stored in this browser.';
  return 'Ask me about galleries, artwork uploads, practice, themes or the calculator.';
}

document.getElementById('chatForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  const question = input.value.trim();
  if (!question) return;
  addMessage(question, 'user-msg'); addMessage(getReply(question), 'bot-msg');
  input.value = '';
});
