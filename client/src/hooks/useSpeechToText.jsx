import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SEND_AUDIO_MESSAGE } from '../graphql/mutations/conversation.mutation';
import { useMutation } from '@apollo/client';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useSpeechToText = (templateId, streamingMessage, setStreamingMessage, userStreamingMessage, setUserStreamingMessage, setMessages, setIsThinking, isEmpty) => {
    const [isListening, setIsListening] = useState(false);
    const [shouldSendAudio, setShouldSendAudio] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');

    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [sendAudioMessage] = useMutation(SEND_AUDIO_MESSAGE);

    useEffect(() => {
        if (shouldSendAudio && currentTranscript) {
            const sendAudioMessageToServer = async () => {
                try {
                    await sendAudioMessage({
                        variables: {
                            templateId,
                            messages: currentTranscript.messages,
                            userTranscribe: currentTranscript.transcript
                        }
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                    toast.error('Something went wrong!');
                    setIsThinking(false);
                }
            };

            sendAudioMessageToServer();
            setShouldSendAudio(false);
            setCurrentTranscript('');
        }
    }, [shouldSendAudio, currentTranscript, sendAudioMessage, templateId, setIsThinking]);

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error('Speech recognition not supported');
            toast.error('Speech recognition not supported in your browser');
        }
    }, [browserSupportsSpeechRecognition]);

    const onStartListening = useCallback(() => {
        if (browserSupportsSpeechRecognition) {
            try {
                SpeechRecognition.startListening({ continuous: false });
                setIsListening(true);
                resetTranscript();
                console.log('Started listening');
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                toast.error(`Error starting speech recognition: ${error.message}`);
            }
        }
    }, [browserSupportsSpeechRecognition, resetTranscript, setIsListening]);

    const onStopRecording = useCallback(() => {
        SpeechRecognition.stopListening();
        console.log('Stopping recording. Final transcript:', transcript);
        if (transcript) {
            setIsThinking(true);
            setIsListening(false);
            setMessages(prevMessages => {
                let newMessages = [...prevMessages];
                if (!isEmpty(userStreamingMessage)) {
                    newMessages = [...newMessages, { role: 'user', content: userStreamingMessage.content }];
                }
                if (!isEmpty(streamingMessage)) {
                    newMessages = [...newMessages, { role: 'system', content: streamingMessage.content }];
                }
                setCurrentTranscript({ messages: newMessages, transcript });
                setShouldSendAudio(true);
                
                return newMessages;
            });
            setStreamingMessage({});
            setUserStreamingMessage({})
        } else {
            console.error('No transcript available');
            toast.error('No speech detected. Please try again.');
        }
        resetTranscript();
    }, [transcript, resetTranscript, setIsThinking, setMessages, setStreamingMessage, setUserStreamingMessage, isEmpty, userStreamingMessage, streamingMessage]);

    return {
        isListening,
        onStartListening,
        onStopRecording
    };
};