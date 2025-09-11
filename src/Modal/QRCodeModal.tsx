import axios from 'axios';
import { selectSelectedGroup } from '../Util/groupSlice';
import { setQRcodeModal } from '../Util/modalSlice';
import { QrCode, Download } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../Util/hook';
import { useEffect, useState } from 'react';

const QRCodeModal = () => {
  const groupId = useAppSelector(selectSelectedGroup);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!groupId) return;
    const fetchQR = async () => {
      try {
        const res = await axios.get(
          `https://www.marksphere.link/api/groups/${groupId}/invite-qr`,
          {
            // 이미지로 받음
            responseType: 'blob',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'image/png',
            },
          }
        );
        setQrUrl(URL.createObjectURL(res.data));
      } catch (err) {
        console.error('QR 요청 실패', err);
      }
    };
    fetchQR();
  }, [groupId]);

  return (
    <div className="w-[30vw] min-w-[320px] max-w-md flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-violet-600">
          <QrCode className="w-5 h-5" />
          그룹 초대 QR 코드
        </h2>
      </div>

      <p className="text-sm text-gray-500">
        이 QR 코드를 스캔하면 그룹 초대 링크로 접속할 수 있습니다.
      </p>

      <div className="flex justify-center items-center p-4 border rounded-xl bg-gray-50">
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="그룹 초대 QR"
            className="w-48 h-48 object-contain"
          />
        ) : (
          <span className="text-gray-400 text-sm">로딩 중...</span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {qrUrl && (
          <a
            href={qrUrl}
            download={`group-${groupId}-invite.png`}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 text-sm"
          >
            <Download className="w-4 h-4" />
            다운로드
          </a>
        )}
        <button
          className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
          onClick={() => dispatch(setQRcodeModal(false))}
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
