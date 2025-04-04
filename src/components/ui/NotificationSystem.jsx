import React from 'react';
import useResourcesStore from '../../stores/resourcesStore';
import '../../styles/NotificationSystem.css';

const NotificationComponent = () => {
    const { notifications } = useResourcesStore();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="notification-container">
            {notifications.map((notification, index) => (
                <div key={index} className="notification">
                    {notification}
                </div>
            ))}
        </div>
    );
};

export default NotificationComponent;