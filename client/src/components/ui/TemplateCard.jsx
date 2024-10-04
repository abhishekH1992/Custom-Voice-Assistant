import { Card, CardHeader, CardBody } from "@nextui-org/react";
import Icon from './Icon';
import { MoveRight } from 'lucide-react';
import { TEMPLATE_ICON_COLOR } from '../../constant/colors';
import { Chip } from "@nextui-org/react";

const TemplateCard = ({ template, theme }) => {
    return (
        <Card className={`border-2 shadow-md ${
            theme === 'dark' 
            ? 'border-white bg-theme-800/20 backdrop-blur-sm'
            : 'border-theme-800 bg-white'
        }`}>
            <CardHeader className="justify-between">
                <Icon 
                    name={template.icon} 
                    size={30}
                    color={TEMPLATE_ICON_COLOR} 
                />
                <MoveRight color={theme === 'dark' ? '#fff' : TEMPLATE_ICON_COLOR} />
            </CardHeader>
            <CardBody>
                <div className="text-lg font-semibold mb-2">{template.name ? template.name : template.aiRole}</div>
                {template.name &&
                    <Chip 
                            color='secondary' 
                            variant="flat" 
                            size="sm"
                            className="mb-2"
                    >
                            {template.aiRole}
                    </Chip>
                }
                <p>{template.description.substring(0, 100)}...</p>
            </CardBody>
        </Card>
    );
}

export default TemplateCard;