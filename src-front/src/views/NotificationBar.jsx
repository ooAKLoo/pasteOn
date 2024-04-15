import React, { useState, useEffect } from 'react';
import { useNotification } from '../hook/NotificationContext';

function NotificationBar() {
    const { notification } = useNotification();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification.message) {
            setVisible(true);
            setTimeout(() => {
                setVisible(false); // Trigger hide animation
            }, 2000); // Hide after 2 seconds, not 3 as your comment suggests
        }
    }, [notification]);

    if (!notification.message) return null;

    const bgColor = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const animation = visible ? 'animate-show-notification' : 'animate-hide-notification';

    return (
        <div className={`fixed top-0 right-0 left-0 z-50 p-2 text-center ${animation}`}>
            <div className={`bg-white w-1/3 max-w-sm mx-auto rounded-lg text-sm font-bold px-4 py-2 ${bgColor} relative`}>
                {notification.message}
                <div className={` absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${bgColor}`}></div>
            </div>
        </div>
    );
}

export default NotificationBar;
