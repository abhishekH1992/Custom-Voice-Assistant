import toast from 'react-hot-toast';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { STOP_RECORDING } from '../graphql/mutations/conversation.mutation';

const useVoiceDetection = (templateId, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping, currentType, getCurrentTime, isInterrupted) => {
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [recognition, setRecognition] = useState(null);
    const messagesSentRef = useRef(false);

    const [stopRecording] = useMutation(STOP_RECORDING);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();

            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscription(currentTranscript);
            };
            recognitionInstance.onend = () => {
                setIsListening(false);
            };
            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            setRecognition(recognitionInstance);
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            setTranscription('');
            recognition.start();
            setIsListening(true);
            messagesSentRef.current = false;
        }
    }, [recognition]);

    const sendMessageToServer = useCallback(async (messages) => {
        if (messagesSentRef.current) return;
        messagesSentRef.current = true;
        
        try {
            console.log('Sending message to server');
            await stopRecording({
                variables: {
                    templateId: templateId,
                    messages: messages,
                    type: currentType
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Something went wrong! Retry again.')
        }
    }, [stopRecording, templateId, currentType]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
            setIsTyping(true);
            const currentTime = getCurrentTime();
            setMessages(prevMessages => {
                const newMessages = !isEmpty(currentStreamedMessage)
                    ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content, type: currentStreamedMessage.type, timeStamp: currentStreamedMessage.timeStamp }, { role: 'user', content: transcription, type: currentType, timeStamp: currentTime, isInterrupted: isInterrupted }]
                    : [...prevMessages, { role: 'user', content: transcription, type: currentType, timeStamp: currentTime, isInterrupted: isInterrupted }];
                sendMessageToServer(newMessages);
                return newMessages;
            });

            setCurrentStreamedMessage({});
        }
    }, [currentStreamedMessage, currentType, getCurrentTime, isEmpty, isInterrupted, recognition, sendMessageToServer, setCurrentStreamedMessage, setIsTyping, setMessages, transcription]);

    return {
        isListening,
        startListening,
        stopListening,
        transcription,
    };
};

export default useVoiceDetection;