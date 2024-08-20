import React from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Icon from './Icon';
import { MoveRight } from 'lucide-react';
import { TEMPLATE_ICON_COLOR } from '../../constant/colors';
import * as LucidIcons from 'lucide-react';

type IconName = keyof typeof LucidIcons;

interface TemplateCardProps {
    template: {
        icon: string;
        aiRole: string;
        description: string;
    };
    theme: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, theme }) => {
    return (
        <Card className={`border-2 shadow-md ${
            theme === 'dark' 
            ? 'border-white bg-theme-800/20 backdrop-blur-sm'
            : 'border-theme-800 bg-white'
        }`}>
            <CardHeader className="justify-between">
                <Icon 
                    name={template.icon as IconName} 
                    size={30}
                    color={TEMPLATE_ICON_COLOR} 
                />
                <MoveRight color={theme === 'dark' ? '#fff' : TEMPLATE_ICON_COLOR} />
            </CardHeader>
            <CardBody>
                <div className="text-lg font-semibold mb-2">{template.aiRole}</div>
                <p>{template.description.substring(0, 100)}...</p>
            </CardBody>
        </Card>
    );
}

export default TemplateCard;