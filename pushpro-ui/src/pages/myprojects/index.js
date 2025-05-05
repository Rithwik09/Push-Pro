import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import Pageheader from '../../../shared/layout-components/header/pageheader';
import MyProjects from '../../components/MyProjects';
import MyProjectsMobile from '../../components/mobile/MyProjectsMobile';
import { getDeviceType } from '../../utils/device';
import { useTranslation } from 'react-i18next';

const Index = () => {
    const [isMobile , setIsMobile] = useState();
    const [deviceType, setDeviceType] = useState('');
    const { t } = useTranslation();
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); 
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const type = getDeviceType();
            setDeviceType(type);
        }
    }, []);
    const breadcrumbItems = [
        { url: `${basePath}/dashboard`, title: t('breadCrumb.dashboard') },
        { url: `${basePath}/myprojects`, title: t('breadCrumb.myProjects') },
    ];  
    return (
        <>
         <Pageheader breadcrumbItems={breadcrumbItems} />
            <Card className="custom-card mt-4">
            {isMobile ? <MyProjectsMobile/> : <MyProjects/>}
            </Card>
            
        </>
    );
}
Index.layout = "Contentlayout"
export default Index;
