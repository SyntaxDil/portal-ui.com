import React from 'react';
import { PortalService } from '../../../types';
import PortalWrapper from './PortalWrapper';

const PortalView: React.FC<{ portal: PortalService; onReturn: () => void; }> = ({ portal, onReturn }) => {
    const PortalComponent = portal.component;
    return (
        <PortalWrapper portal={portal} onReturn={onReturn}>
            <PortalComponent />
        </PortalWrapper>
    );
};

export default PortalView;
