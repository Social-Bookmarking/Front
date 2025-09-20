import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  hideCloseButton?: boolean;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  hideCloseButton,
}) => {
  // 모달 열릴 때 body 스크롤 차단
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 모달 뒷배경 */}
          <motion.div
            className={`fixed inset-0 z-40 bg-black/80`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 모달 박스 */}
          <motion.div
            className={`fixed z-50 inset-0 flex items-center justify-center `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              className="bg-white rounded-2xl shadow-md p-6 relative inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {!hideCloseButton && (
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
                  onClick={onClose}
                >
                  ✕
                </button>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
