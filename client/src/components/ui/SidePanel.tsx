import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, Card, CardBody, CardFooter, Radio, RadioGroup } from "@nextui-org/react";

export interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    types: TypesProps[];
    onTypeChange: (typeId: number) => void;
}

interface TypesProps {
    id: number;
    name: string;
    description: string;
    isAudio: boolean;
    duration: number;
    isText: boolean;
    icon: string;
}

const SidePanel: React.FC<SidePanelProps> = ({ isOpen, onClose, types, onTypeChange }) => {
    const [selectedType, setSelectedType] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (types.length > 0 && !selectedType) {
            setSelectedType(types[0].id);
            onTypeChange(types[0].id);
        }
    }, [types, selectedType, onTypeChange]);

    const handleTypeChange = (typeId: string) => {
        const id = parseInt(typeId, 10);
        setSelectedType(id);
        onTypeChange(id);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            size="full"
            classNames={{
                base: "w-full sm:w-[400px] h-full",
                wrapper: "justify-end",
                body: "p-0",
                closeButton: "top-3 right-3",
            }}
        >
            <ModalBody>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Select Type</h2>
                    <RadioGroup
                        value={selectedType?.toString()}
                        onValueChange={handleTypeChange}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {types.map((type) => (
                                <Card key={type.id} className="w-full">
                                    <CardBody className="flex items-center">
                                        <Radio value={type.id.toString()} className="mr-2">
                                            {type.name}
                                        </Radio>
                                        <img src={type.icon} alt={type.name} className="w-6 h-6 ml-auto" />
                                    </CardBody>
                                    <CardFooter className="text-small text-default-500">
                                        {type.description}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default SidePanel;