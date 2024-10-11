import { useState, useEffect } from 'react';
import { Modal, Input, Button, ModalHeader, ModalBody, ModalFooter, ModalContent } from '@nextui-org/react';
import { X, SaveAll, Pen } from 'lucide-react';

const SaveChatModal = ({ isOpen, onClose, onSave, savedName }) => {
    const [chatName, setChatName] = useState('');

    useEffect(() => {
        setChatName(savedName || '');
    }, [savedName]);

    const handleSave = () => {
        onSave(chatName);
        onClose();
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
                            <h4>Save Chat</h4>
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                name="name"
                                placeholder="Enter chat name"
                                startContent={<Pen className="text-xl text-default-400 pointer-events-none flex-shrink-0" />}
                                value={chatName}
                                onChange={(e) => setChatName(e.target.value)}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button auto flat color="error" onPress={onClose}>
                                <X size={16} />Close
                            </Button>
                            <Button auto onPress={handleSave}>
                                <SaveAll size={16} />Save
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
};

export default SaveChatModal;