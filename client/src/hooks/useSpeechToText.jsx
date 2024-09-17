import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SEND_AUDIO_MESSAGE } from '../graphql/mutations/conversation.mutation';
import { useMutation, useSubscription } from '@apollo/client';
import { MESSAGE_SUBSCRIPTION, USER_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const useSpeechToText = (templateId, scrollToBottom, messages, setMessages) => {
    const [isListening, setIsListening] = useState(false);
    const {
        transcript,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const [sendAudioMessage] = useMutation(SEND_AUDIO_MESSAGE);

    const sendAudioMessageToServer = useCallback(async (text) => {
        try {
            await sendAudioMessage({
                variables: {
                    templateId,
                    messages,
                    userTranscribe: text
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Something went wrong!');
        }
    }, [messages, sendAudioMessage, templateId]);

    useSubscription(MESSAGE_SUBSCRIPTION, {
        variables: { templateId },
        onData: ({ data }) => {
            if (data?.data?.messageStreamed) {
                setMessages((prevMessages) => [...prevMessages, data.data.messageStreamed]);
                scrollToBottom();
            }
        },
    });

    useSubscription(USER_SUBSCRIPTION, {
        variables: { templateId },
        onData: ({ data }) => {
            if (data?.data?.userStreamed) {
                // You might want to handle this differently now that we're using react-speech-recognition
                console.log('User streamed:', data.data.userStreamed);
            }
        },
    });

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            console.error('Speech recognition not supported');
            toast.error('Speech recognition not supported in your browser');
        }
    }, [browserSupportsSpeechRecognition]);

    const onStartListening = useCallback(() => {
        if (browserSupportsSpeechRecognition && !isListening) {
            try {
                SpeechRecognition.startListening({ continuous: true });
                setIsListening(true);
                resetTranscript();
                console.log('Started listening');
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                toast.error(`Error starting speech recognition: ${error.message}`);
            }
        }
    }, [isListening, browserSupportsSpeechRecognition, resetTranscript]);

    const onStopRecording = useCallback(() => {
        if (isListening) {
            SpeechRecognition.stopListening();
            setIsListening(false);
            console.log('Stopping recording. Final transcript:', transcript);
            if (transcript) {
                sendAudioMessageToServer(transcript);
            } else {
                console.error('No transcript available');
                toast.error('No speech detected. Please try again.');
            }
        }
    }, [isListening, sendAudioMessageToServer, transcript]);

    return { isListening, transcript, onStartListening, onStopRecording };
};

export default useSpeechToText;