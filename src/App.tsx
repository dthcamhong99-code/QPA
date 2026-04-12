import React, { useState, useMemo } from 'react';
import { Search, Plus, Folder, Calendar, CheckCircle2, Circle, X, Compass, DollarSign, FileText, FileCheck, Pencil, AlignLeft, Maximize, PauseCircle, XCircle, Trash2, AlertTriangle, Download } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Project {
  id: string;
  year: number;
  planNumber: string;
  projectName: string;
  scale: string;
  totalInvestment: number;
  status: 'registered' | 'unregistered' | 'paused' | 'cancelled';
  pcgdDocument: string;
  evnhcmcDocument: string;
}

const DashboardLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Outer orbital lines */}
    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#0284c7" strokeWidth="0.5" />
    <path d="M 15 50 A 35 35 0 0 0 85 50" fill="none" stroke="#0284c7" strokeWidth="0.5" />
    <circle cx="50" cy="10" r="1.5" fill="#0284c7" />
    <circle cx="85" cy="50" r="1.5" fill="#0284c7" />

    {/* Main circular background */}
    <circle cx="50" cy="50" r="44" fill="#eff6ff" stroke="#1e3a8a" strokeWidth="1.5" />

    {/* Base platform */}
    <rect x="22" y="72" width="56" height="2" fill="#fde047" rx="1" />

    {/* Background Leaves */}
    <path d="M 65 72 C 70 55, 80 60, 75 72 Z" fill="#1e293b" />
    <path d="M 25 72 C 20 60, 15 65, 20 72 Z" fill="#1e293b" />

    {/* Tablet/Screen */}
    <rect x="32" y="26" width="36" height="46" rx="2" fill="#334155" />
    <rect x="34" y="28" width="32" height="42" fill="#ffffff" />
    <rect x="34" y="28" width="32" height="4" fill="#60a5fa" />
    <circle cx="36" cy="30" r="1" fill="#ffffff" />
    <circle cx="63" cy="30" r="1" fill="#ffffff" />

    {/* Inner Screen Content */}
    {/* Pie Chart Area */}
    <rect x="36" y="35" width="14" height="18" fill="#fef3c7" rx="1" />
    <circle cx="43" cy="42" r="4" fill="none" stroke="#fde047" strokeWidth="2" />
    <path d="M 43 42 L 43 38 A 4 4 0 0 1 47 42 Z" fill="#f472b6" />
    <rect x="38" y="48" width="4" height="4" fill="#fde047" />
    <rect x="38" y="54" width="4" height="4" fill="#f472b6" />

    {/* Floating Line Chart */}
    <rect x="52" y="36" width="20" height="12" fill="#fef08a" rx="1" />
    <path d="M 54 42 Q 57 38, 60 42 T 68 40" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="54" cy="45" r="2" fill="#f472b6" />

    {/* Bar Chart */}
    <rect x="48" y="62" width="1.5" height="6" fill="#db2777" />
    <rect x="51" y="58" width="1.5" height="10" fill="#db2777" />
    <rect x="54" y="60" width="1.5" height="8" fill="#db2777" />
    <rect x="57" y="54" width="1.5" height="14" fill="#db2777" />
    <rect x="60" y="57" width="1.5" height="11" fill="#db2777" />

    {/* Foreground Leaves */}
    <path d="M 62 72 C 68 62, 75 65, 70 72 Z" fill="#38bdf8" />
    <path d="M 28 72 C 22 65, 18 68, 24 72 Z" fill="#38bdf8" />

    {/* Person */}
    <circle cx="29" cy="46" r="2" fill="#0f172a" />
    <path d="M 26 50 Q 29 48, 32 50 L 31 56 L 27 56 Z" fill="#f9a8d4" />
    <path d="M 27 56 L 31 56 L 32 70 L 29 70 L 29 62 L 28 62 L 28 70 L 25 70 Z" fill="#db2777" />
    <circle cx="34" cy="51" r="1" fill="#f9a8d4" /> {/* Hand pointing */}
  </svg>
);

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    year: 2026,
    planNumber: 'PA-2026-001',
    projectName: 'Xây dựng mới 5km đường giao thông nông thôn',
    scale: 'Đường bê tông xi măng, rộng 3.5m, dày 20cm. Xây dựng hệ thống thoát nước dọc tuyến.',
    totalInvestment: 15000000000,
    status: 'registered',
    pcgdDocument: '12/PCGĐ',
    evnhcmcDocument: '123/QĐ-EVNHCMC',
  },
  {
    id: '2',
    year: 2026,
    planNumber: 'PA-2026-002',
    projectName: 'Cải tạo trường mầm non trung tâm',
    scale: 'Sơn sửa 5 phòng học, làm mới khu vui chơi ngoài trời 200m2, nâng cấp nhà bếp.',
    totalInvestment: 8500000000,
    status: 'unregistered',
    pcgdDocument: '',
    evnhcmcDocument: '',
  },
  {
    id: '3',
    year: 2025,
    planNumber: 'PA-2025-015',
    projectName: 'Nâng cấp trạm y tế xã',
    scale: 'Xây thêm 2 phòng chức năng, mua sắm trang thiết bị y tế cơ bản.',
    totalInvestment: 4200000000,
    status: 'registered',
    pcgdDocument: '05/PCGĐ',
    evnhcmcDocument: '45/QĐ-EVNHCMC',
  },
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingScaleProject, setViewingScaleProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    year: new Date().getFullYear(),
    status: 'unregistered',
    pcgdDocument: '',
    evnhcmcDocument: '',
    scale: '',
  });

  const years = useMemo(() => {
    const allYears = projects.map(p => p.year);
    const uniqueYears = Array.from(new Set([new Date().getFullYear(), ...allYears]));
    return uniqueYears.sort((a, b) => b - a);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesYear = p.year === selectedYear;
      const matchesSearch = p.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.pcgdDocument && p.pcgdDocument.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (p.evnhcmcDocument && p.evnhcmcDocument.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesYear && matchesSearch;
    });
  }, [projects, selectedYear, searchQuery]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      year: selectedYear,
      status: 'unregistered',
      pcgdDocument: '',
      evnhcmcDocument: '',
      planNumber: '',
      projectName: '',
      scale: '',
      totalInvestment: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setEditingId(project.id);
    setFormData(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.planNumber || !formData.projectName || !formData.totalInvestment || !formData.year) return;

    if (editingId) {
      setProjects(prev => prev.map(p => 
        p.id === editingId 
          ? { ...formData, id: editingId } as Project 
          : p
      ));
    } else {
      const project: Project = {
        id: Math.random().toString(36).substr(2, 9),
        year: Number(formData.year),
        planNumber: formData.planNumber,
        projectName: formData.projectName,
        scale: formData.scale || '',
        totalInvestment: Number(formData.totalInvestment),
        status: formData.status as 'registered' | 'unregistered' | 'paused' | 'cancelled',
        pcgdDocument: formData.pcgdDocument || '',
        evnhcmcDocument: formData.evnhcmcDocument || '',
      };
      setProjects(prev => [project, ...prev]);
      setSelectedYear(project.year);
    }
    
    setIsModalOpen(false);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Dự án năm ${selectedYear}`);

    // Define columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Năm thực hiện', key: 'year', width: 15 },
      { header: 'Số hiệu phương án', key: 'planNumber', width: 25 },
      { header: 'Tên dự án', key: 'projectName', width: 45 },
      { header: 'TMĐT (đ)', key: 'totalInvestment', width: 18 },
      { header: 'Quy mô dự án', key: 'scale', width: 55 },
      { header: 'PCGĐ đăng ký', key: 'pcgdDocument', width: 22 },
      { header: 'EVNHCMC chấp thuận', key: 'evnhcmcDocument', width: 22 },
      { header: 'Tình trạng', key: 'status', width: 18 }
    ];

    // Add rows
    filteredProjects.forEach((project, index) => {
      worksheet.addRow({
        stt: index + 1,
        year: project.year,
        planNumber: project.planNumber,
        projectName: project.projectName,
        totalInvestment: project.totalInvestment,
        scale: project.scale || '',
        pcgdDocument: project.pcgdDocument || '',
        evnhcmcDocument: project.evnhcmcDocument || '',
        status: project.status === 'registered' ? 'Đã đăng ký' : 
                project.status === 'unregistered' ? 'Chưa đăng ký' :
                project.status === 'paused' ? 'Tạm dừng' : 'Hủy'
      });
    });

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF9FF' } // RGB(239, 249, 255) -> Hex EFF9FF
      };
      cell.font = { name: 'Times New Roman', size: 13, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
    headerRow.height = 30;

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        
        cell.font = { name: 'Times New Roman', size: 13 };
        
        // Default alignment: center
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        // Tên dự án (col 4) and Quy mô dự án (col 6): justify and wrap text
        if (colNumber === 4 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'justify', wrapText: true };
        }
        
        // Format TMĐT (col 5) as number with comma separator
        if (colNumber === 5) {
          cell.numFmt = '#,##0';
        }
      });
    });

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Danh_sach_du_an_${selectedYear}.xlsx`);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 flex flex-col shadow-xl z-10 text-slate-300">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <DashboardLogo className="w-14 h-14 shrink-0 drop-shadow-md" />
            <h1 className="text-2xl font-bold tracking-tight leading-tight">QPA</h1>
          </div>
          <p className="text-base text-slate-400 mt-3 italic">Hệ thống quản lý phương án</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Năm thực hiện</h2>
          <div className="space-y-1">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all ${
                  selectedYear === year 
                    ? 'bg-slate-800 text-white border-l-4 border-amber-500 font-medium shadow-sm' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent font-normal'
                }`}
              >
                <Calendar className={`w-5 h-5 ${selectedYear === year ? 'text-amber-500' : 'text-slate-500'}`} />
                Năm {year}
                <span className={`ml-auto text-xs py-1 px-2.5 rounded-full font-medium ${
                  selectedYear === year ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {projects.filter(p => p.year === year).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between shadow-sm z-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dự án năm {selectedYear}</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Quản lý và theo dõi đăng ký danh mục các dự án ĐTXD</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm số hiệu, tên dự án, VB..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all w-96 text-slate-900 placeholder-slate-400 shadow-md hover:shadow-lg focus:shadow-lg"
              />
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg text-base font-semibold transition-all shadow-sm active:scale-95"
            >
              <Download className="w-5 h-5" />
              Export Excel
            </button>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-base font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Thêm mới
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-5 text-base font-bold text-slate-500 text-center whitespace-nowrap">Số hiệu</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-500 text-center w-2/5">Tên dự án</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-500 text-center whitespace-nowrap">TMĐT</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-500 text-center whitespace-nowrap">Tình trạng</th>
                  <th className="px-6 py-5 text-base font-bold text-slate-500 text-center w-24 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button 
                          onClick={() => setViewingScaleProject(project)}
                          className="flex w-full items-center justify-between gap-3 hover:bg-slate-100 p-2 pr-4 rounded-lg transition-colors border border-transparent hover:border-slate-200 group/btn"
                          title="Xem thông tin dự án"
                        >
                          <div className="w-9 h-9 rounded-md bg-yellow-400 flex items-center justify-center text-white group-hover/btn:bg-yellow-500 transition-colors shadow-sm">
                            <Folder className="w-5 h-5" />
                          </div>
                          <span className="text-slate-900 font-semibold text-base underline decoration-slate-300 underline-offset-4 group-hover/btn:decoration-slate-400 transition-colors">{project.planNumber}</span>
                        </button>
                      </td>
                      <td className="px-6 py-5 text-justify">
                        <p className="text-base font-medium text-slate-900">{project.projectName}</p>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <span className="text-base font-semibold text-slate-700">{formatCurrency(project.totalInvestment)}</span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium border ${
                          project.status === 'registered' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : project.status === 'unregistered'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : project.status === 'paused'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {project.status === 'registered' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {project.status === 'unregistered' && <Circle className="w-4 h-4 text-amber-600" />}
                          {project.status === 'paused' && <PauseCircle className="w-4 h-4 text-slate-500" />}
                          {project.status === 'cancelled' && <XCircle className="w-4 h-4 text-red-600" />}
                          {project.status === 'registered' ? 'Đã đăng ký' : 
                           project.status === 'unregistered' ? 'Chưa đăng ký' :
                           project.status === 'paused' ? 'Tạm dừng' : 'Hủy'}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2.5">
                          <button 
                            onClick={() => openEditModal(project)}
                            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 rounded-md transition-colors inline-flex"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setProjectToDelete(project)}
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors inline-flex"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Folder className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">Không tìm thấy dự án nào</p>
                        <p className="text-sm mt-1 text-slate-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm phương án mới.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* View Scale Modal */}
      {viewingScaleProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Maximize className="w-6 h-6 text-emerald-600" />
                Thông tin dự án
              </h3>
              <button 
                onClick={() => setViewingScaleProject(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-md hover:bg-slate-200/50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Số hiệu phương án</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base font-bold text-emerald-700">
                    {viewingScaleProject.planNumber}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Tình trạng</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base font-medium">
                    <div className={`inline-flex items-center gap-2 ${
                          viewingScaleProject.status === 'registered' 
                            ? 'text-emerald-700' 
                            : viewingScaleProject.status === 'unregistered'
                            ? 'text-amber-700'
                            : viewingScaleProject.status === 'paused'
                            ? 'text-slate-700'
                            : 'text-red-700'
                        }`}>
                          {viewingScaleProject.status === 'registered' && <CheckCircle2 className="w-5 h-5" />}
                          {viewingScaleProject.status === 'unregistered' && <Circle className="w-5 h-5" />}
                          {viewingScaleProject.status === 'paused' && <PauseCircle className="w-5 h-5" />}
                          {viewingScaleProject.status === 'cancelled' && <XCircle className="w-5 h-5" />}
                          {viewingScaleProject.status === 'registered' ? 'Đã đăng ký' : 
                           viewingScaleProject.status === 'unregistered' ? 'Chưa đăng ký' :
                           viewingScaleProject.status === 'paused' ? 'Tạm dừng' : 'Hủy'}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Tên dự án</p>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base text-slate-900 font-medium text-justify leading-relaxed">
                  {viewingScaleProject.projectName}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">PCGĐ đăng ký</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base text-slate-900 font-medium">
                    {viewingScaleProject.pcgdDocument ? (
                      <span className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-600"/> {viewingScaleProject.pcgdDocument}</span>
                    ) : <span className="text-slate-400 italic">Chưa có</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">EVNHCMC chấp thuận</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base text-slate-900 font-medium">
                    {viewingScaleProject.evnhcmcDocument ? (
                      <span className="flex items-center gap-2"><FileCheck className="w-5 h-5 text-emerald-600"/> {viewingScaleProject.evnhcmcDocument}</span>
                    ) : <span className="text-slate-400 italic">Chưa có</span>}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Chi tiết quy mô</p>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-800 text-base leading-relaxed whitespace-pre-wrap text-justify">
                  {viewingScaleProject.scale || <span className="text-slate-400 italic">Chưa có thông tin quy mô</span>}
                </div>
              </div>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setViewingScaleProject(null)}
                className="px-6 py-2.5 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <h3 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Chỉnh sửa phương án' : 'Thêm phương án mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-md hover:bg-slate-200/50"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProject} className="p-8 space-y-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Năm thực hiện
                  </label>
                  <input 
                    type="number" 
                    required
                    value={formData.year || ''}
                    onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Số hiệu phương án
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: .../PA-PCGĐ ngày .../.../..."
                    value={formData.planNumber || ''}
                    onChange={e => setFormData({...formData, planNumber: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlignLeft className="w-5 h-5 text-emerald-600" />
                  Tên dự án
                </label>
                <textarea 
                  required
                  rows={2}
                  placeholder="Nhập tên dự án..."
                  value={formData.projectName || ''}
                  onChange={e => setFormData({...formData, projectName: e.target.value})}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 resize-none bg-white placeholder-slate-400"
                />
              </div>

              <div className="space-y-3">
                <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Maximize className="w-5 h-5 text-emerald-600" />
                  Quy mô dự án
                </label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả quy mô dự án..."
                  value={formData.scale || ''}
                  onChange={e => setFormData({...formData, scale: e.target.value})}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 resize-none bg-white placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Tổng mức đầu tư (đ)
                  </label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="Nhập số tiền..."
                    value={formData.totalInvestment || ''}
                    onChange={e => setFormData({...formData, totalInvestment: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Tình trạng
                  </label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'registered' | 'unregistered' | 'paused' | 'cancelled'})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white"
                  >
                    <option value="unregistered">Chưa đăng ký</option>
                    <option value="registered">Đã đăng ký</option>
                    <option value="paused">Tạm dừng</option>
                    <option value="cancelled">Hủy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    PCGĐ đăng ký
                  </label>
                  <input 
                    type="text" 
                    placeholder="VD: .../PCGĐ-KH ngày .../.../..."
                    value={formData.pcgdDocument || ''}
                    onChange={e => setFormData({...formData, pcgdDocument: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    EVNHCMC chấp thuận
                  </label>
                  <input 
                    type="text" 
                    placeholder="VD: .../EVNHCMC-KH ngày .../.../..."
                    value={formData.evnhcmcDocument || ''}
                    onChange={e => setFormData({...formData, evnhcmcDocument: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="pt-8 flex gap-4 justify-end border-t border-slate-100 mt-10">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 text-base font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  Lưu phương án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Xác nhận xóa</h2>
              <p className="text-slate-600 text-base mb-8">
                Bạn có chắc chắn muốn xóa dự án <br/>
                <span className="font-bold text-slate-900 text-lg">{projectToDelete.planNumber}</span>?
                <br/>
                <span className="text-slate-500 mt-2 block">Hành động này không thể hoàn tác.</span>
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setProjectToDelete(null)}
                  className="px-6 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors w-full shadow-sm"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleDeleteProject}
                  className="px-6 py-3 text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 w-full active:scale-95"
                >
                  Xóa dự án
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
