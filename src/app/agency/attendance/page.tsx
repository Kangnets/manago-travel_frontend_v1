'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  attendanceAPI,
  AttendanceRecord,
  AttendanceStatistics,
  AttendanceStatus,
} from '@/lib/agencyApi';

type EmployeeOption = { id: string; name: string; email: string; role: 'owner' | 'employee' };
type TodayStatus = {
  employeeId: string;
  employeeName: string;
  email: string;
  role: 'owner' | 'employee';
  record: AttendanceRecord | null;
};

export default function AttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [todayAll, setTodayAll] = useState<TodayStatus[]>([]);

  const isOwner = user?.userType === 'agency' && (user?.agencyRole === 'owner' || !user?.agencyRole);
  const isEmployee = user?.userType === 'agency' && user?.agencyRole === 'employee';

  // Filter states
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [selectedEmployee, setSelectedEmployee] = useState('전체');

  // Current time
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (authLoading || !user || !isOwner) return;
    try {
      const list = await attendanceAPI.getEmployees();
      setEmployees(Array.isArray(list) ? list : []);
    } catch (e) {
      setEmployees([]);
    }
  }, [authLoading, user, isOwner]);

  const fetchTodayAll = useCallback(async () => {
    if (authLoading || !user || !isOwner) return;
    try {
      const data = await attendanceAPI.getTodayAll();
      setTodayAll(Array.isArray(data) ? data : []);
    } catch (e) {
      setTodayAll([]);
    }
  }, [authLoading, user, isOwner]);

  const fetchTodayRecord = useCallback(async () => {
    if (authLoading || !user?.id) return;
    try {
      const record = await attendanceAPI.getTodayRecord();
      if (record && typeof record === 'object' && record.id) {
        setTodayRecord(record);
      } else {
        setTodayRecord(null);
      }
    } catch (error) {
      setTodayRecord(null);
    }
  }, [authLoading, user?.id]);

  const fetchAttendance = useCallback(async () => {
    if (authLoading || !user?.id) return;
    setLoading(true);
    try {
      const params: {
        startDate?: string;
        endDate?: string;
        employeeId?: string;
      } = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (isEmployee && user?.id) {
        params.employeeId = user.id;
      } else if (isOwner && selectedEmployee !== '전체') {
        params.employeeId = selectedEmployee;
      }

      const [recordsRes, statsRes] = await Promise.all([
        attendanceAPI.getAll(params),
        attendanceAPI.getStatistics(params),
      ]);

      setRecords(recordsRes.data);
      setStatistics(statsRes);
    } catch (error) {
      setRecords([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, startDate, endDate, selectedEmployee, user?.id, isOwner, isEmployee]);

  useEffect(() => {
    fetchEmployees();
    fetchTodayAll();
  }, [fetchEmployees, fetchTodayAll]);

  useEffect(() => {
    fetchTodayRecord();
    fetchAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchTodayRecord, fetchAttendance]);

  const handleCheckIn = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setActionLoading(true);
    try {
      const record = await attendanceAPI.checkIn({
        employeeId: user.id,
        employeeName: user.name || user.email || 'Unknown',
      });
      setTodayRecord(record);
      alert(`출근 등록되었습니다. (${record.checkIn})`);
      fetchAttendance();
      fetchTodayAll();
    } catch (error: any) {
      const message = error.response?.data?.message || '출근 등록에 실패했습니다.';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) {
      alert('출근 기록이 없습니다.');
      return;
    }

    setActionLoading(true);
    try {
      const record = await attendanceAPI.checkOut();
      setTodayRecord(record);
      alert(`퇴근 등록되었습니다. (${record.checkOut})\n총 근무시간: ${record.workHours}시간`);
      fetchAttendance();
      fetchTodayAll();
    } catch (error: any) {
      const message = error.response?.data?.message || '퇴근 등록에 실패했습니다.';
      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return '정상';
      case 'absent':
        return '결근';
      case 'late':
        return '지각';
      case 'early-leave':
        return '조퇴';
      case 'half-day':
        return '반차';
      default:
        return '-';
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'late':
        return 'bg-yellow-100 text-yellow-700';
      case 'early-leave':
        return 'bg-orange-100 text-orange-700';
      case 'half-day':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const inputCls =
    'px-2 py-1 border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#ffa726] bg-white w-full';

  return (
    <div className="min-h-screen bg-[#f0f2f5] -m-8 flex">
      {/* LEFT SIDEBAR - FILTERS */}
      <div className="w-[220px] bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-[14px] font-bold text-gray-800 mb-4">근태 관리</h2>

          <div className="space-y-3">
            {/* 필터 조회 */}
            <div className="pb-2 border-b border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500">필터 조회</span>
            </div>

            {/* 직원 선택: 사장은 전체/사장/직원 목록, 직원은 본인만 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">직원</label>
              <select
                value={isEmployee ? user?.id ?? '' : selectedEmployee}
                onChange={(e) => !isEmployee && setSelectedEmployee(e.target.value)}
                disabled={!!isEmployee}
                className={inputCls}
              >
                {isOwner && <option value="전체">전체</option>}
                {isOwner && employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.role === 'owner' ? `사장 · ${emp.name}` : `직원 · ${emp.name}`}
                  </option>
                ))}
                {isEmployee && (
                  <option value={user?.id ?? ''}>본인 ({user?.name || user?.email})</option>
                )}
                {!isOwner && !isEmployee && (
                  <option value={user?.id ?? ''}>{user?.name || user?.email || 'Unknown'}</option>
                )}
              </select>
            </div>

            {/* 기간 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] text-gray-600 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* 조회 버튼 */}
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="w-full py-2 bg-[#4a5dd8] text-white text-[12px] font-bold rounded hover:bg-[#3a4dc8] transition-colors disabled:opacity-50"
            >
              {loading ? '조회 중...' : '조회'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-bold text-gray-900">home &gt; 근태 관리</h1>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-gray-600">오늘의 할일</span>
              <span className="font-bold text-[#ffa726]">0/0</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">출근일정자</span>
              <span className="font-bold">{user?.name || user?.email || 'Unknown'}</span>
              {isOwner && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">사장</span>}
              {isEmployee && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded">직원</span>}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Time & Check In/Out */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-gray-800 mb-2">현재 시간</h3>
                <div className="text-[28px] font-bold text-[#ffa726] font-mono">
                  {currentTime.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
                <div className="text-[13px] text-gray-600 mt-1">
                  {currentTime.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={!!todayRecord?.checkIn || actionLoading}
                  className="px-6 py-3 bg-blue-600 text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? '처리 중...' : '출근'}
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut || actionLoading}
                  className="px-6 py-3 bg-red-600 text-white text-[14px] font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? '처리 중...' : '퇴근'}
                </button>
              </div>
            </div>

            {/* Today's Record */}
            {todayRecord && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">출근 시간</div>
                    <div className="text-[16px] font-bold text-gray-800">
                      {todayRecord.checkIn || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">퇴근 시간</div>
                    <div className="text-[16px] font-bold text-gray-800">
                      {todayRecord.checkOut || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">근무 시간</div>
                    <div className="text-[16px] font-bold text-blue-600">
                      {todayRecord.workHours ? `${todayRecord.workHours}시간` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-500 mb-1">상태</div>
                    <span
                      className={`px-2 py-1 rounded text-[12px] font-medium ${getStatusColor(
                        todayRecord.status
                      )}`}
                    >
                      {getStatusLabel(todayRecord.status)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 사장 전용: 오늘 직원 현황 */}
          {isOwner && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[15px] font-bold text-gray-900">오늘 직원 근태 현황</h2>
                <button
                  onClick={fetchTodayAll}
                  className="text-[11px] text-gray-400 hover:text-[#ffa726] transition-colors"
                >
                  새로고침
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {todayAll.length === 0 ? (
                  <div className="col-span-full py-6 text-center text-[13px] text-gray-400">
                    직원 정보를 불러오는 중...
                  </div>
                ) : (
                  todayAll.map((emp) => {
                    const hasCheckedIn = !!emp.record?.checkIn;
                    const hasCheckedOut = !!emp.record?.checkOut;
                    const statusColor = !hasCheckedIn
                      ? 'border-gray-200 bg-gray-50'
                      : hasCheckedOut
                      ? 'border-green-200 bg-green-50'
                      : 'border-blue-200 bg-blue-50';

                    return (
                      <div
                        key={emp.employeeId}
                        className={`rounded-lg border-2 p-3 transition-colors ${statusColor}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] font-bold text-gray-800 truncate flex-1">
                            {emp.employeeName}
                          </span>
                          <span
                            className={`ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded flex-shrink-0 ${
                              emp.role === 'owner'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {emp.role === 'owner' ? '사장' : '직원'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 w-8">출근</span>
                            <span className="text-[12px] font-mono font-medium text-gray-700">
                              {emp.record?.checkIn || (
                                <span className="text-gray-400">미출근</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 w-8">퇴근</span>
                            <span className="text-[12px] font-mono font-medium text-gray-700">
                              {emp.record?.checkOut || (
                                <span className="text-gray-400">
                                  {hasCheckedIn ? '근무중' : '-'}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                        {hasCheckedIn && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                emp.record?.status === 'present'
                                  ? 'bg-green-100 text-green-700'
                                  : emp.record?.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : emp.record?.status === 'early-leave'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {!hasCheckedOut
                                ? '근무중'
                                : emp.record?.status === 'present'
                                ? '정상'
                                : emp.record?.status === 'late'
                                ? '지각'
                                : emp.record?.status === 'early-leave'
                                ? '조퇴'
                                : emp.record?.status || '-'}
                            </span>
                            {emp.record?.workHours && (
                              <span className="ml-2 text-[10px] text-blue-600 font-medium">
                                {emp.record.workHours}시간
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Attendance Records */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-[16px] font-bold text-gray-900">
                근태 기록 ({records.length}건)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600 w-20">
                      NO
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      날짜
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      직원
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      출근 시간
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      퇴근 시간
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      근무 시간
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[13px] text-gray-500">로딩 중...</span>
                        </div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-gray-400">
                        근태 기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    records.map((record, idx) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-[13px] text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          {new Date(record.date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-900 font-medium">
                          {record.employeeName}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700 font-mono">
                          {record.checkIn || '-'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700 font-mono">
                          {record.checkOut || '-'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-blue-600 font-medium">
                          {record.workHours ? `${record.workHours}시간` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-[11px] font-medium ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {getStatusLabel(record.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-[11px] text-gray-500 mb-1">총 출근일</div>
              <div className="text-[24px] font-bold text-gray-800">
                {statistics?.totalDays ?? 0}일
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-[11px] text-gray-500 mb-1">정상 출근</div>
              <div className="text-[24px] font-bold text-green-600">
                {statistics?.presentDays ?? 0}일
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-[11px] text-gray-500 mb-1">지각</div>
              <div className="text-[24px] font-bold text-yellow-600">
                {statistics?.lateDays ?? 0}일
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-[11px] text-gray-500 mb-1">총 근무시간</div>
              <div className="text-[24px] font-bold text-blue-600">
                {statistics?.totalWorkHours?.toFixed(1) ?? 0}시간
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
