import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../Styles/SOSNotification.css'

const SOSNotification = () => {
    const [transcription, setTranscription] = useState('');
    const { t } = useTranslation();

    const handleSpeechRecognition = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = (event) => {
            console.log(event.results);
            const transcript = event.results[0][0].transcript;
            setTranscription(transcript);
        };
    };

    const handleChange = (event) => {
        setTranscription(event.target.value);
    };

    const handleSendNotification = () => {
        Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
                new Notification('SOS Notification', {
                    body: transcription,
                    data: { customNotification: transcription },
                    icon: 'VillageLogo.png',
                    vibrate: true,
                });
            }
        });
    };
    useEffect(() => {
        let notification;
        let interval;
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                const leaveDate = new Date();
                interval = setInterval(() => {
                    notification = new Notification("A villager is requesting your help. Please return to the Village App!", {
                        body: `Hey guy, you have been gone for ${Math.round((new Date() - leaveDate) / 1000)}  seconds: The village needs you!`,
                        tag: "Please return to the app"
                    });
                }, 100);
            } else {
                if (interval) clearInterval(interval)
                if (notification) notification.close()
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (interval) clearInterval(interval)
            if (notification) notification.close()
        };
    }, []);

    return (
        <div className='container'>
            <div className='textarea'>
                <textarea
                    placeholder={t('speechToText.placeholder')}
                    value={transcription}
                    onChange={handleChange}
                ></textarea>
            </div>
            <button className='micro' onClick={handleSpeechRecognition}>
                🎤
            </button>
            <button className='send' onClick={handleSendNotification}>
                Send SOS
            </button>
        </div>
    );
};

export default SOSNotification;