import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MemberModal from './components/MemberModal';
import AttendanceModal from './components/AttendanceModal';
import MembershipModal from './components/MembershipModal';
import CsvUploadModal from './components/CsvUploadModal';
import RetentionAiModal from './components/RetentionAiModal';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Membership from './pages/Membership';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

import { getMembers, createMember, updateMember } from './services/memberService';

// Main App Layout containing persistent Navbar and Sidebar
const DashboardLayout = () => {
  const [membersList, setMembersList] = useState([]);
  
  // Modal states
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [attendanceTargetMember, setAttendanceTargetMember] = useState(null);

  const [membershipModalOpen, setMembershipModalOpen] = useState(false);
  const [membershipTargetMember, setMembershipTargetMember] = useState(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTargetMember, setAiTargetMember] = useState(null);

  const refreshMembers = async () => {
    try {
      const res = await getMembers({ limit: 100 });
      setMembersList(res.data || []);
    } catch (err) {
      console.error('Failed to preload members for modal picker', err);
    }
  };

  useEffect(() => {
    refreshMembers();
  }, []);

  const handleOpenMemberModal = (member = null) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  const handleSaveMember = async (formData) => {
    if (editingMember?._id) {
      await updateMember(editingMember._id, formData);
    } else {
      await createMember(formData);
    }
    await refreshMembers();
  };

  const handleOpenAttendance = (member = null) => {
    setAttendanceTargetMember(member);
    setAttendanceModalOpen(true);
  };

  const handleOpenMembership = (member = null) => {
    setMembershipTargetMember(member || (membersList.length > 0 ? membersList[0] : null));
    setMembershipModalOpen(true);
  };

  const handleOpenAiModal = (member = null) => {
    setAiTargetMember(member || (membersList.length > 0 ? membersList[0] : null));
    setAiModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b1120' }}>
      <Navbar onOpenAiModal={() => handleOpenAiModal(null)} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar onOpenUploadModal={() => setUploadModalOpen(true)} />

        <main style={{ flex: 1, padding: '2rem', overflowX: 'hidden' }}>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onOpenMemberModal={() => handleOpenMemberModal(null)}
                  onOpenAttendanceModal={() => handleOpenAttendance(null)}
                  onOpenAiModal={() => handleOpenAiModal(null)}
                />
              }
            />
            <Route
              path="/members"
              element={
                <Members
                  onOpenMemberModal={handleOpenMemberModal}
                  onOpenAttendanceModal={handleOpenAttendance}
                  onOpenMembershipModal={handleOpenMembership}
                  onOpenAiModal={handleOpenAiModal}
                />
              }
            />
            <Route
              path="/attendance"
              element={
                <Attendance
                  onOpenAttendanceModal={() => handleOpenAttendance(null)}
                />
              }
            />
            <Route
              path="/membership"
              element={
                <Membership
                  onOpenMembershipModal={handleOpenMembership}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                <Analytics
                  onOpenAiModal={handleOpenAiModal}
                  onOpenMembershipModal={handleOpenMembership}
                />
              }
            />
            <Route
              path="/reports"
              element={<Reports />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <MemberModal
        isOpen={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        onSave={handleSaveMember}
        initialData={editingMember}
      />

      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        members={membersList}
        onSuccess={refreshMembers}
      />

      <MembershipModal
        isOpen={membershipModalOpen}
        onClose={() => setMembershipModalOpen(false)}
        member={membershipTargetMember}
        onSuccess={refreshMembers}
      />

      <CsvUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={refreshMembers}
      />

      <RetentionAiModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        selectedMember={aiTargetMember}
        members={membersList}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<DashboardLayout />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
