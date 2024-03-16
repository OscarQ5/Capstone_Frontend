import React from 'react';
import FetchLocation from "../Components/FetchLocation.jsx";
import SOSNotification from "../Components/SOSNotification.jsx";

const StateEmergency = () => {
    return (
        <div>
            <FetchLocation />
            <div className='SOSNotification'>
                <SOSNotification />
            </div>

        </div>
    );
};

export default StateEmergency;