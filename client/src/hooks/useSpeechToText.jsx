import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SEND_AUDIO_MESSAGE } from '../graphql/mutations/conversation.mutation';
import { useMutation } from '@apollo/client';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export const useSpeechToText = (templateId, streamingMessage, setStreamingMessage, setMessages, setIsThinking, isEmpty) => {
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
                const newMessages = !isEmpty(streamingMessage)
                    ? [...prevMessages, { role: 'system', content: streamingMessage.content }]
                    : [...prevMessages];
                
                setCurrentTranscript({ messages: newMessages, transcript });
                setShouldSendAudio(true);
                
                return newMessages;
            });
            setStreamingMessage({});
        } else {
            console.error('No transcript available');
            toast.error('No speech detected. Please try again.');
        }
        resetTranscript();
    }, [isEmpty, setIsListening, setIsThinking, setMessages, setStreamingMessage, streamingMessage, transcript, resetTranscript]);

    return {
        isListening,
        onStartListening,
        onStopRecording
    };
};