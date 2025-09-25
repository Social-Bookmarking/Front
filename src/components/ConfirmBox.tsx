import { createPortal } from 'react-dom';

interface ConfirmBoxProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBox = ({ message, onConfirm, onCancel }: ConfirmBoxProps) => {
  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
        <p className="mb-4 text-sm text-gray-700">{message}</p>
        <div className="flex justify-center gap-3">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={onCancel}>
            취소
          </button>
          <button
            className="px-3 py-1 rounded bg-red-500 text-white"
            onClick={onConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmBox;
