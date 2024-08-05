export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    const handleClickOutside = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            onClick={handleClickOutside}
        >
            <div className="bg-sipe-blue-dark p-4 rounded-2xl overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export const ModalContent = ({ children }) => (
    <div className="p-4">{children}</div>
);

export const ModalHeader = ({ children }) => (
    <div className="border-b">{children}</div>
);

export const ModalFooter = ({ children }) => (
    <div className="border-t py-2 flex justify-between gap-6">{children}</div>
);

export const ModalBody = ({ children }) => (
    <div className="p-4">{children}</div>
);
