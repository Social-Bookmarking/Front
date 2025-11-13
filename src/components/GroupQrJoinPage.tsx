import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../Util/hook';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { setGroupParticipationModal } from '../Util/modalSlice';

const GroupQrJoinPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!code) {
      toast.error('유효하지 않은 초대 코드입니다.');
      navigate('/');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.setItem('pendingInviteCode', code);
      navigate('/login');
      return;
    }

    localStorage.setItem('inviteCodeFromQR', code);
    dispatch(setGroupParticipationModal(true));
    navigate('/');
  }, [code, navigate, dispatch]);

  return null;
};

export default GroupQrJoinPage;
