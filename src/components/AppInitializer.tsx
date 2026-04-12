import { useEffect, useState, type ReactNode } from 'react';
import { fetchGroups } from '../Util/groupSlice';
import { useAppDispatch } from '../Util/hook';
import { fetchUserInfo, getPermission } from '../Util/user';
import { fetchMembers } from '../Util/memberSlice';
import { fetchCategories } from '../Util/categorySlice';
import { fetchGroupDetail } from '../Util/groupDetailSlice';
import { AnimatePresence, motion } from 'motion/react';
import toast from 'react-hot-toast';

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const dispatch = useAppDispatch();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const groups = await dispatch(fetchGroups()).unwrap();

      await dispatch(fetchUserInfo());

      const groupId = groups?.[0]?.teamId;

      if (!groupId) {
        toast.error('오류가 발생했습니다.');
        setReady(true);
        return;
      }

      await Promise.all([
        dispatch(getPermission(groupId)),
        dispatch(fetchMembers(groupId)),
        dispatch(fetchCategories(groupId)),
        dispatch(fetchGroupDetail(groupId)),
      ]);

      setReady(true);
    };

    initialize();
  }, [dispatch]);

  if (!ready) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-white z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-3 h-3 bg-violet-500 rounded-full"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
