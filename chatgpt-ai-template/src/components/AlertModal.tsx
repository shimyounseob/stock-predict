import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    Text,
} from '@chakra-ui/react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

export const AlertModal = ({ isOpen, onClose, title, message }: AlertModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            {/* ModalOverlay의 배경만 투명하게 조정 */}
            <ModalOverlay
                bg="rgba(0, 0, 0, 0.4)" // 배경만 투명하게 설정 (모달 배경을 어둡게 하면서 약간 투명하게)
            />
            <ModalContent bg="white"> {/* 모달 내부 콘텐츠의 배경색을 명확하게 설정 */}
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text whiteSpace="pre-line">{message}</Text>
                </ModalBody>
                <ModalFooter>
                    <Button
                        backgroundColor="#4a25e1"
                        color="white"
                        _hover={{ backgroundColor: '#6a4ce1' }}
                        mr={2}
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
