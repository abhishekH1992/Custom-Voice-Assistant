import toast from 'react-hot-toast';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { STOP_RECORDING } from '../graphql/mutations/conversation.mutation';
import vad from 'voice-activity-detection';

const useVoiceDetection = (templateId, setMessages, currentStreamedMessage, setCurrentStreamedMessage, isEmpty, setIsTyping, currentType, getCurrentTime, isInterrupted, selectedType, vadRef, isCallActiveRef, audioJammer) => {
    const [isListening, setIsListening] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [recognition, setRecognition] = useState(null);
    const messagesSentRef = useRef(false);
    const isContinousModeRef = useRef(false);
    const transcriptionRef = useRef('');

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
                    if (event.results[i].isFinal) {
                        currentTranscript += event.results[i][0].transcript + ' ';
                    }
                }
                setTranscription(prevTranscription => prevTranscription + currentTranscript);
                transcriptionRef.current += currentTranscript;
            };
            recognitionInstance.onend = () => {
                console.log('Recognition ended');
                setIsListening(false);
                if (isContinousModeRef.current && isCallActiveRef.current) {
                    recognitionInstance.start();
                }
            };
            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
            setRecognition(recognitionInstance);
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }, [isCallActiveRef]);

    const startListening = useCallback(() => {
        if (recognition) {
            setTranscription('');
            transcriptionRef.current = '';
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
        } finally {
            messagesSentRef.current = false;
        }
    }, [stopRecording, templateId, currentType]);

    // const getCurrentStreamedMessage = useCallback(() => {
    //     let latestMessage;
    //     setCurrentStreamedMessage(prevMessage => {
    //         latestMessage = prevMessage;
    //         return prevMessage;
    //     });
    //     return latestMessage;
    // }, []);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
            const finalTranscription = selectedType?.isContinous ? transcriptionRef.current : transcription;
            console.log('Final transcription:', finalTranscription);
            console.log(currentStreamedMessage);
            if (finalTranscription.trim()) {
                setIsListening(false);
                setIsTyping(true);
                const currentTime = getCurrentTime();
                setMessages(prevMessages => {
                    const newMessages = !isEmpty(currentStreamedMessage)
                        ? [...prevMessages, { role: 'system', content: currentStreamedMessage.content, type: currentStreamedMessage.type, timeStamp: currentStreamedMessage.timeStamp }, { role: 'user', content: finalTranscription, type: currentType, timeStamp: currentTime, isInterrupted: isInterrupted }]
                        : [...prevMessages, { role: 'user', content: finalTranscription, type: currentType, timeStamp: currentTime, isInterrupted: isInterrupted }];
                    sendMessageToServer(newMessages);
                    return newMessages;
                });

                setCurrentStreamedMessage({});
            }
            
            setTranscription('');
            transcriptionRef.current = '';
        }
    }, [currentStreamedMessage, currentType, getCurrentTime, isEmpty, isInterrupted, recognition, selectedType?.isContinous, sendMessageToServer, setCurrentStreamedMessage, setIsTyping, setMessages, transcription]);

    const startVoiceActivityDetection = useCallback(() => {
        console.log(isCallActiveRef.current);
        if (vadRef?.current || !recognition || !isCallActiveRef.current) return;
        isContinousModeRef.current = true;
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const audioContext = new AudioContext();
                vadRef.current = vad(audioContext, stream, {
                    onVoiceStart: () => {
                        console.log('Voice detected, starting recognition');
                        try {
                            audioJammer();
                            setTranscription('');
                            transcriptionRef.current = '';
                            setIsListening(true);
                            messagesSentRef.current = false;
                            recognition.start();
                        } catch (error) {
                            console.log('Recognition is already started');
                        }
                    },
                    onVoiceStop: () => {
                        console.log('Voice stopped, current transcription:', transcriptionRef.current);
                        recognition.stop();
                        stopListening();
                    },
                    noiseCaptureDuration: 1000,
                    minNoiseLevel: 0.1,
                    maxNoiseLevel: 0.9,
                });
            })
            .catch(err => console.error('Error accessing microphone:', err));
    }, [audioJammer, isCallActiveRef, recognition, stopListening, vadRef]);

    const startTheCall = useCallback(() => {
        if(selectedType?.isContinous) {
            startVoiceActivityDetection();
        } else {
            console.log('called');
            isContinousModeRef.current = false;
            startListening();
        }
    }, [selectedType?.isContinous, startListening, startVoiceActivityDetection]);

    return {
        isListening,
        startTheCall,
        stopListening,
        recognition,
        transcription
    };
};

export default useVoiceDetection;