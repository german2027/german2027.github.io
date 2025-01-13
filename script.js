        let sendButton = window.document.getElementById('sendButton');
        let inp = window.document.getElementById('textInput');
        let outp = window.document.getElementById('textOutput');
        let conversation = [];

        let speechRecognizer = new webkitSpeechRecognition();        // recunoaștere voce
        let speechSynthesis = window.speechSynthesis;                // sinteză voce

        const speech = () => {
            speechRecognizer.lang = 'de-DE';
            // speechRecognizer.continuous = true;                      
            // speechRecognizer.interimResults = true;                  
            speechRecognizer.start();
            sendButton.innerText = 'Sprechen...';
        }

        const talk = (text) => {
            let textToTalk = new SpeechSynthesisUtterance(text);
            textToTalk.onend = function(event) {
                sendButton.innerText = 'Möchten Sie noch etwas sagen? Klicken Sie hier – und reden Sie';
            };
            textToTalk.lang = 'de-DE';
            textToTalk.rate = 0.5;
            // textToTalk.pitch = 1.0;
            speechSynthesis.speak(textToTalk);
        }

        speechRecognizer.onresult = (event) => {                    
            inp.value = event.results[0][0].transcript;
            requestFunc();
        }

        const requestFunc = () => {
            if (inp.value) {
                sendButton.innerText = 'Einen Moment...';
                let message = {
                    "role": "user",
                    "content": inp.value
                }
                conversation.push(message);

                // Transmitere la server
                axios.post('http://openai-server-n8xl.onrender.com/api/chat', { messages: conversation })
                    .then(response => {
                        let aiResponse = response.data.choices[0].message.content;
                        outp.value = aiResponse;

                        let gptMessage = {
                            "role": "assistant",
                            "content": aiResponse
                        }
                        conversation.push(gptMessage);
                        talk(aiResponse);
                    })
                    .catch(error => {
                        console.error("Error request:", error.message);
                        sendButton.innerText = 'Fehler. Sie es erneut.';

                    });
            }
        }