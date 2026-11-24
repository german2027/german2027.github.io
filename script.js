let token = null;
let lastAudio = null;
let speechSpeed = 0.7; 

function repeatLast() {
  if (!lastAudio) return;
  new Audio(lastAudio).play();
}

const API_BASE = 'https://openai-server-xrvo.onrender.com';
const params = new URLSearchParams(window.location.search);

fetch(`${API_BASE}/checka`,
{
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
  aaa: params.get('aaa'),
  t: params.get('t'),
  s: params.get('s')
 })
})

.then(response => response.json())
.then(data => {
 if (data.success) token = data.token;
 else alert('Entschuldigung.');
})
.catch(error => console.error('Eroare:', error));

let sendButton = window.document.getElementById('sendButton');
let inp = window.document.getElementById('textInput');
let outp = window.document.getElementById('textOutput');

const schoolClass = document.getElementById('schoolClass');

function createInitialPrompt() {
  const selectedClass = schoolClass.value;

  return `
Du bist ein freundlicher Deutschlehrer.

Sie sprechen mit einem Schüler in der Klasse ${selectedClass}.

Vokabular, Fragen und Erklärungen anpassen
auf der Ebene eines Schülers in der Klasse ${selectedClass}.

Verwenden Sie klare und leicht verständliche Sätze.

Stellen Sie kurze und interessante Fragen.

Korrigieren Sie die Fehler des Schülers vorsichtig.

Ermutigen Sie den Schüler, auf Deutsch zu sprechen.

Setzen Sie das Gespräch auf Deutsch fort.
`;
}

let conversation = [
  {
    role: "system",
    content: createInitialPrompt()
  }
];

schoolClass.addEventListener('change', () => {
  conversation = [
    {
      role: "system",
      content: createInitialPrompt()
    }
  ];

  inp.value = '';
  outp.value = '';
  lastAudio = null;
});

let speech2text = new webkitSpeechRecognition();

const speech = () => {
 speech2text.lang = 'de-DE';
 speech2text.start();
 sendButton.innerText = 'Sprechen...';
}

const talk = async (text) => {
  try {
    const res = await axios.post(`${API_BASE}/api/tts`, {
      text: text,
      token: token,
      speed: speechSpeed
    });

    lastAudio = res.data.audio;

    const audio = new Audio(lastAudio);
    audio.play();

    audio.onended = () => {
      sendButton.innerText =
        'Möchten Sie noch etwas sagen? Klicken Sie hier – und reden Sie';
    };

  } catch (e) {
    console.error('TTS error:', e);
    sendButton.innerText = 'Eroare TTS';
  }
};

speech2text.onresult = (event) => {                    
 inp.value = event.results[0][0].transcript;
 requestFunc();
}
const requestFunc = () => {
 if (inp.value && token) {
  sendButton.innerText = 'Einen Moment...';
  let message = { "role": "user", "content": inp.value };
  conversation.push(message);

  axios.post(`${API_BASE}/api/chat`,
  {
   messages: conversation,
   token: token
  })
  
   .then(response => {
   let aiResponse = response.data.choices[0].message.content;
   outp.value = aiResponse;
   conversation.push({ "role": "assistant", "content": aiResponse });
   talk(aiResponse);
  })
  .catch(error => {
   console.error("Error request:", error);
   sendButton.innerText = 'Fehler...';
  });
 }
}
