import React, { useState, useEffect } from 'react';
import useStore from '../../stores/gridStore';
import useResourcesStore from '../../stores/resourcesStore';
import '../../styles/Notifications.css';

const NotificationSystem = () => {
    const { tiles } = useStore();
    const { resources, notifications } = useResourcesStore();

    useEffect(() => {
        checkNotifications();
    }, [tiles, resources]);

    const checkNotifications = () => {
        let newNotifications = [];

        // Check for cleaner power options
        Object.entries(tiles).forEach(([key, tile]) => {
            if (tile.upgrades?.activeMods?.power?.[0] === 'coal power plant') {
                newNotifications.push({
                    id: `clean-power-${key}`,
                    message: `Building at ${key} can switch to a cleaner power option.`,
                    type: 'suggestion'
                });
            }
        });

        // Check building ratios
        const buildingCounts = countBuildingTypes(tiles);
        const totalBuildings = Object.values(buildingCounts).reduce((a, b) => a + b, 0);

        if (totalBuildings > 0) {
            const ratios = {
                residential: buildingCounts.residential / totalBuildings,
                commercial: buildingCounts.commercial / totalBuildings,
                industrial: buildingCounts.industrial / totalBuildings,
                services: buildingCounts.services / totalBuildings
            };

            if (ratios.residential < 0.3) newNotifications.push({ id: 'need-residential', message: 'More residential buildings needed.', type: 'warning' });
            if (ratios.commercial < 0.2) newNotifications.push({ id: 'need-commercial', message: 'More commercial buildings needed.', type: 'warning' });
            if (ratios.industrial < 0.1) newNotifications.push({ id: 'need-industrial', message: 'More industrial buildings needed.', type: 'warning' });
            if (ratios.services < 0.1) newNotifications.push({ id: 'need-services', message: 'More service buildings needed.', type: 'warning' });
        }

        setNotifications(newNotifications);
    };

    const countBuildingTypes = (tiles) => {
        return Object.values(tiles).reduce((counts, tile) => {
            if (tile.type.includes('home') || tile.type.includes('apartment')) counts.residential++;
            else if (tile.type.includes('retail') || tile.type.includes('office')) counts.commercial++;
            else if (tile.type.includes('warehouse') || tile.type.includes('factory')) counts.industrial++;
            else if (tile.type.includes('government') || tile.type.includes('hospital')) counts.services++;
            return counts;
        }, { residential: 0, commercial: 0, industrial: 0, services: 0 });
    };

    const removeNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    return (
        <div className="notification-system">
            {notifications.map(notification => (
                <div key={notification.id} className={`notification ${notification.type}`}>
                    {notification.message}
                    <button onClick={() => removeNotification(notification.id)}>×</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationSystem;