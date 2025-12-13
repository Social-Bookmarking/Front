import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axios from 'axios';

interface User {
  nickname: string;
  profileImageUrl: string;
  permission: string;
}

const initialState: User = {
  nickname: 'User',
  profileImageUrl: '',
  permission: '',
};

export const fetchUserInfo = createAsyncThunk<User>('user/fetch', async () => {
  const res = await axios.get('https://www.marksphere.link/api/me/profile', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data;
});

export const updateUserInfo = createAsyncThunk<
  Partial<User>,
  Partial<{ nickname: string; imageKey: string }>
>('user/update', async (payload) => {
  try {
    await axios.patch('https://www.marksphere.link/api/me/profile', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    toast.success('저장 성공!');
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error('중복된 닉네임 입니다');
      } else {
        toast.error('저장에 문제가 발생했습니다');
      }
    }
  }
  return payload;
});

export const changePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>('user/changePassword', async (payload, { rejectWithValue }) => {
  try {
    await axios.patch('https://www.marksphere.link/api/me/password', payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 400) {
        toast.error('현재 비밀번호가 일치하지 않습니다.');
        return rejectWithValue('wrong-current-password');
      }
      return rejectWithValue('비밀번호 변경 실패');
    }
    return rejectWithValue('알 수 없는 에러');
  }
});

export const getPermission = createAsyncThunk<{ permission: string }, number>(
  'user/getPermission',
  async (groupId) => {
    const res = await axios.get<{ permission: string }>(
      `https://www.marksphere.link/api/groups/${groupId}/permission`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return res.data;
  }
);

const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchUserInfo.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.nickname = action.payload.nickname;
          state.profileImageUrl = action.payload.profileImageUrl;
        }
      )
      .addCase(getPermission.fulfilled, (state, action) => {
        state.permission = action.payload.permission;
      });
  },
});

export default userSlice.reducer;
