
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/apiClient';

export const fetchIssues = createAsyncThunk(
  'issues/fetchAll',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/issues/admin');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch issues'
      );
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/update',
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.patch(`/issues/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to update issue'
      );
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'issues/fetchDepartments',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/departments');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch departments'
      );
    }
  }
);

export const fetchDepartmentUsers = createAsyncThunk(
  'issues/fetchDepartmentUsers',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/admin/department-users');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch department users'
      );
    }
  }
);

export const createDepartmentUser = createAsyncThunk(
  'issues/createDepartmentUser',
  async (payload, thunkAPI) => {
    try {
      const res = await api.post('/admin/department-users', payload);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to create department user'
      );
    }
  }
);

export const updateDepartmentUser = createAsyncThunk(
  'issues/updateDepartmentUser',
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.patch(`/admin/department-users/${id}`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to update department user'
      );
    }
  }
);

export const deleteDepartmentUser = createAsyncThunk(
  'issues/deleteDepartmentUser',
  async (id, thunkAPI) => {
    try {
      const res = await api.delete(`/admin/department-users/${id}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to delete department user'
      );
    }
  }
);

export const fetchDepartmentIssues = createAsyncThunk(
  'issues/fetchDepartmentIssues',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/issues/department');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch department issues'
      );
    }
  }
);

export const departmentUpdateIssue = createAsyncThunk(
  'issues/departmentUpdateIssue',
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.patch(`/issues/${id}/department-update`, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to update issue from department'
      );
    }
  }
);

export const fetchMyIssues = createAsyncThunk(
  'issues/fetchMyIssues',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/issues/mine');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch your issues'
      );
    }
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState: {
    items: [],
    departments: [],
    departmentUsers: [],
    departmentIssues: [],
    myIssues: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentUsers.fulfilled, (state, action) => {
        state.departmentUsers = action.payload;
      })
      .addCase(createDepartmentUser.fulfilled, (state, action) => {
        state.departmentUsers.push(action.payload);
      })
      .addCase(updateDepartmentUser.fulfilled, (state, action) => {
        const idx = state.departmentUsers.findIndex(
          (u) => u._id === action.payload._id
        );
        if (idx !== -1) state.departmentUsers[idx] = action.payload;
      })
      .addCase(deleteDepartmentUser.fulfilled, (state, action) => {
        const id = action.payload.id;
        state.departmentUsers = state.departmentUsers.filter((u) => u._id !== id);
      })
      .addCase(fetchDepartmentIssues.fulfilled, (state, action) => {
        state.departmentIssues = action.payload;
      })
      .addCase(departmentUpdateIssue.fulfilled, (state, action) => {
        const updated = action.payload;
        const idxDept = state.departmentIssues.findIndex((i) => i._id === updated._id);
        if (idxDept !== -1) state.departmentIssues[idxDept] = updated;
        const idxAdmin = state.items.findIndex((i) => i._id === updated._id);
        if (idxAdmin !== -1) state.items[idxAdmin] = updated;
        const idxCitizen = state.myIssues.findIndex((i) => i._id === updated._id);
        if (idxCitizen !== -1) state.myIssues[idxCitizen] = updated;
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.myIssues = action.payload;
      });
  },
});

export default issuesSlice.reducer;
