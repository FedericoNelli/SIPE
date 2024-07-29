import React from 'react';

export const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-sipe-blue-dark p-4 rounded-lg overflow-hidden">
                <button onClick={onClose} className="block text-sipe-white text-sm font-bold"> x </button>
                {children}
            </div>
        </div>
    );
};

export const ModalContent = ({ children }) => (
    <div className="p-6">{children}</div>
);

export const ModalHeader = ({ children }) => (
    <div className="border-b p-4">{children}</div>
);

export const ModalFooter = ({ children }) => (
    <div className="border-t p-4 flex justify-end">{children}</div>
);

export const ModalBody = ({ children }) => (
    <div className="p-4">{children}</div>
);
