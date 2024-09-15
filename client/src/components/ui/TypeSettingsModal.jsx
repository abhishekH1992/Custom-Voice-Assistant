import { useState } from 'react';
import { Modal, Card, CardBody, Button, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider, Slider } from '@nextui-org/react';
import { TEMPLATE_ICON_COLOR } from '../../constant/colors';
import Icon from './Icon';
import { X } from 'lucide-react';

const TypeSettingsModal = ({ isOpen, onClose, types, onSelectType, selectedType }) => {
    const [durationValues, setDurationValues] = useState({});

    const handleDurationChange = (typeId, value) => {
        setDurationValues(prev => ({ ...prev, [typeId]: value }));
    };

    const handleTypeSelect = (type) => {
        const updatedType = { 
            ...type, 
            duration: durationValues[type.id] || type.duration 
        };
        onSelectType(updatedType);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            placement={window.innerWidth > 768 ? "center" : "bottom"}
            backdrop="blur"
            scrollBehavior="inside"
            radius="sm"
            size="5xl"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <h4>Settings</h4>
                        </ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {types.map((type) => (
                                <Card 
                                    key={type.id} 
                                    isPressable 
                                    isHoverable 
                                    variant="bordered"
                                    onPress={() => handleTypeSelect(type)}
                                    className={`bg-opacity-20 ${selectedType && selectedType.id === type.id ? 'bg-theme-200 border-theme-800' : ''}`}
                                >
                                    <CardBody>
                                        <div className="flex items-center space-x-2 sm:space-x-4 py-2">
                                            {type.icon && (
                                                <Icon 
                                                    name={type.icon} 
                                                    size={30}
                                                    color={TEMPLATE_ICON_COLOR}
                                                />
                                            )}
                                            <h5>{type.name}</h5>
                                        </div>
                                        <Divider />
                                        <div className="py-2">{type.description}</div>
                                        {type.isAudio && type.duration !== null && (
                                            <div className="mt-2">
                                                <p className="text-sm mb-1">Duration: {durationValues[type.id] || type.duration}s</p>
                                                <Slider
                                                    size="sm"
                                                    step={1}
                                                    maxValue={60}
                                                    minValue={1}
                                                    defaultValue={type.duration}
                                                    value={durationValues[type.id] || type.duration}
                                                    onChange={(value) => handleDurationChange(type.id, value)}
                                                    className="max-w-md"
                                                />
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            ))}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                <X icon={16} />Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default TypeSettingsModal;