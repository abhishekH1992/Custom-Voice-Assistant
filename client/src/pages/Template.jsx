import React, { useEffect, useState, useCallback } from 'react';
import { useSubscription, useMutation, gql } from '@apollo/client';

const SPEECH_SUBSCRIPTION = gql`
  subscription OnSpeechUpdated {
    speechUpdated
  }
`;

const ADD_SPEECH_TEXT = gql`
  mutation AddSpeechText($text: String!) {
    addSpeechText(text: $text)
  }
`;

function Template() {
  const [speechText, setSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const { data } = useSubscription(SPEECH_SUBSCRIPTION);
  const [addSpeechText] = useMutation(ADD_SPEECH_TEXT);

  useEffect(() => {
    if (data) {
      setSpeechText(data.speechUpdated);
    }
  }, [data]);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          addSpeechText({ variables: { text: finalTranscript } });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      console.error('Web Speech API is not supported in this browser.');
    }
  }, [addSpeechText]);

  const stopListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.stop();
      setIsListening(false);
    }
  }, []);

  return (
    <div>
      <h2>Transcribed Text:</h2>
      <p>{speechText}</p>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
    </div>
  );
}

export default Template;