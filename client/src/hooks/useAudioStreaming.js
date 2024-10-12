import { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation } from '@apollo/client';
import { useSubscription } from '@apollo/client';
import { AUDIO_SUBSCRIPTION } from '../graphql/subscriptions/conversation.subscription';
import { STOP_STREAMING } from '../graphql/mutations/conversation.mutation';

const useAudioStreaming = (templateId, setIsSystemAudioComplete) => {
    const audioContextRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);

    const [stopStreaming] = useMutation(STOP_STREAMING);

    const { data: audioData } = useSubscription(AUDIO_SUBSCRIPTION, {
        variables: { templateId },
    });

    const initAudioContext = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
    }, []);

    const base64ToArrayBuffer = useCallback((base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }, []);

    const playNextInQueue = useCallback(async () => {
        if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
            setIsSystemAudioComplete(true);
            return;
        }

        isPlayingRef.current = true;
        setIsPlaying(true);

        const audioBuffer = audioQueueRef.current.shift();
        initAudioContext();

        if (!audioContextRef.current) return;

        try {
            const decodedData = await audioContextRef.current.decodeAudioData(audioBuffer);
            sourceNodeRef.current = audioContextRef.current.createBufferSource();
            sourceNodeRef.current.buffer = decodedData;
            sourceNodeRef.current.connect(audioContextRef.current.destination);
            
            sourceNodeRef.current.onended = () => {
                isPlayingRef.current = false;
                setIsPlaying(false);
                if (audioQueueRef.current.length === 0) {
                    setIsSystemAudioComplete(true);
                } else {
                    playNextInQueue();
                }
            };

            sourceNodeRef.current.start();
        } catch (error) {
            console.error('Error playing audio chunk:', error);
            isPlayingRef.current = false;
            setIsPlaying(false);
            playNextInQueue();
        }
    }, [initAudioContext, setIsSystemAudioComplete]);

    const queueAudioChunk = useCallback((audioBuffer) => {
        audioQueueRef.current.push(audioBuffer);
        if (!isPlayingRef.current) {
            playNextInQueue();
        }
    }, [playNextInQueue]);

    useEffect(() => {
        initAudioContext();

        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [initAudioContext]);

    useEffect(() => {
        if (audioData && audioData.audioStreamed && audioData.audioStreamed.content) {
            const audioBuffer = base64ToArrayBuffer(audioData.audioStreamed.content);
            queueAudioChunk(audioBuffer);
        }
    }, [audioData, base64ToArrayBuffer, queueAudioChunk]);

    const stopAudio = useCallback(async () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setIsPlaying(false);
        try {
            await stopStreaming({ variables: { templateId } });
        } catch (error) {
            console.error('Error stopping stream:', error);
        }
    }, [templateId, stopStreaming]);

    return { isPlaying, stopAudio };
};

export default useAudioStreaming;