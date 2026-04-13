import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Plus, Folder, Calendar, CheckCircle2, Circle, X, Compass, DollarSign, FileText, FileCheck, Pencil, AlignLeft, Maximize, PauseCircle, XCircle, Trash2, AlertTriangle, Download, Upload, Eye, Paperclip, CalendarCheck2, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'motion/react';

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
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

const DashboardLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Background */}
    <circle cx="50" cy="50" r="48" fill="#ffffff" />
    
    {/* Arrow */}
    <path d="M 15 55 L 75 15" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
    <path d="M 60 15 L 75 15 L 75 30" fill="none" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

    {/* Bars */}
    <rect x="15" y="50" width="14" height="30" fill="#2596be" stroke="#1e293b" strokeWidth="3" rx="1" />
    <rect x="34" y="42" width="14" height="38" fill="#2596be" stroke="#1e293b" strokeWidth="3" rx="1" />
    <rect x="53" y="32" width="14" height="48" fill="#2596be" stroke="#1e293b" strokeWidth="3" rx="1" />

    {/* Gear */}
    <g transform="translate(68, 72)">
      {/* Teeth */}
      <rect x="-4" y="-20" width="8" height="40" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" rx="1.5" />
      <rect x="-4" y="-20" width="8" height="40" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" rx="1.5" transform="rotate(45)" />
      <rect x="-4" y="-20" width="8" height="40" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" rx="1.5" transform="rotate(90)" />
      <rect x="-4" y="-20" width="8" height="40" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" rx="1.5" transform="rotate(135)" />
      
      {/* Main body */}
      <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#1e293b" strokeWidth="3" />
      
      {/* Inner hole */}
      <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
    </g>
  </svg>
);

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    year: 2026,
    planNumber: '123/PA-PCGĐ ngày 01/01/2026',
    projectName: 'Xây dựng mới lộ ra 22kV Tư giản - Trạm 110kV Tham Lương',
    scale: 'Đường bê tông xi măng, rộng 3.5m, dày 20cm. Xây dựng hệ thống thoát nước dọc tuyến.',
    totalInvestment: 15000000000,
    status: 'registered',
    pcgdDocument: '12/PCGĐ',
    evnhcmcDocument: '123/QĐ-EVNHCMC',
    notes: '',
  },
  {
    id: '2',
    year: 2026,
    planNumber: '124/PA-PCGĐ ngày 15/02/2026',
    projectName: 'Nâng cấp, phát triển trạm và lưới hạ thế',
    scale: 'Sơn sửa 5 phòng học, làm mới khu vui chơi ngoài trời 200m2, nâng cấp nhà bếp.',
    totalInvestment: 8500000000,
    status: 'unregistered',
    pcgdDocument: '',
    evnhcmcDocument: '',
    notes: '',
  },
  {
    id: '3',
    year: 2027,
    planNumber: '001/PA-PCGĐ ngày 01/01/2027',
    projectName: 'Cải tạo lưới trung thế khu vực phường 14',
    scale: 'Xây thêm 2 phòng chức năng, mua sắm trang thiết bị y tế cơ bản.',
    totalInvestment: 4200000000,
    status: 'registered',
    pcgdDocument: '05/PCGĐ',
    evnhcmcDocument: '45/QĐ-EVNHCMC',
    notes: '',
  },
];

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Local Storage Loader
  useEffect(() => {
    const savedData = localStorage.getItem('qpa_projects');
    if (savedData) {
      try {
        setProjects(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse local storage data', e);
        setProjects(INITIAL_PROJECTS);
      }
    } else {
      setProjects(INITIAL_PROJECTS);
    }
    setLoading(false);
  }, []);

  // Sync to Local Storage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('qpa_projects', JSON.stringify(projects));
    }
  }, [projects, loading]);

  const [selectedYear, setSelectedYear] = useState<number | 'all'>(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    notes: '',
  });

  const years = useMemo(() => {
    const allYears = projects.map(p => Number(p.year)).filter(y => !isNaN(y));
    const uniqueYears = Array.from(new Set([new Date().getFullYear(), ...allYears]));
    return uniqueYears.sort((a, b) => b - a);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesYear = selectedYear === 'all' || String(p.year) === String(selectedYear);
      const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchesSearch = p.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.pcgdDocument && p.pcgdDocument.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (p.evnhcmcDocument && p.evnhcmcDocument.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesYear && matchesStatus && matchesSearch;
    });
  }, [projects, selectedYear, selectedStatus, searchQuery]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      year: selectedYear === 'all' ? new Date().getFullYear() : Number(selectedYear),
      status: 'unregistered',
      pcgdDocument: '',
      evnhcmcDocument: '',
      planNumber: '',
      projectName: '',
      scale: '',
      notes: '',
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
      setProjects(prev => prev.map(p => p.id === editingId ? {
        ...formData,
        id: editingId,
        updatedAt: new Date().toISOString()
      } as Project : p));
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const newProject: Project = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Project;
      setProjects(prev => [newProject, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheetName = selectedYear === 'all' ? 'Tất cả các năm' : `Dự án năm ${selectedYear}`;
    const worksheet = workbook.addWorksheet(sheetName);

    // Define columns
    worksheet.columns = [
      { header: 'STT', key: 'stt', width: 6 },
      { header: 'Năm thực hiện', key: 'year', width: 15 },
      { header: 'Số hiệu phương án', key: 'planNumber', width: 25 },
      { header: 'Tên dự án', key: 'projectName', width: 45 },
      { header: 'TMĐT (đồng)', key: 'totalInvestment', width: 18 },
      { header: 'Quy mô dự án', key: 'scale', width: 55 },
      { header: 'PCGĐ đăng ký', key: 'pcgdDocument', width: 22 },
      { header: 'EVNHCMC chấp thuận', key: 'evnhcmcDocument', width: 30 },
      { header: 'Tình trạng', key: 'status', width: 18 },
      { header: 'Ghi chú', key: 'notes', width: 30 }
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
                project.status === 'paused' ? 'Tạm dừng' : 'Hủy',
        notes: project.notes || ''
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

        // Tên dự án (col 4), Quy mô dự án (col 6), EVNHCMC (col 8) and Ghi chú (col 11): justify and wrap text
        if (colNumber === 4 || colNumber === 6 || colNumber === 8 || colNumber === 11) {
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
    const fileName = selectedYear === 'all' ? 'Danh_sach_du_an_tat_ca_cac_nam.xlsx' : `Danh_sach_du_an_${selectedYear}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        alert('File Excel không hợp lệ hoặc không có dữ liệu.');
        return;
      }

      const projectsToImport: Project[] = [];
      let isHeader = true;

      // Helper to get string value from cell
      const getVal = (cell: ExcelJS.Cell) => {
        if (!cell || cell.value === null || cell.value === undefined) return '';
        if (typeof cell.value === 'object') {
          if ('result' in cell.value) return String(cell.value.result || '');
          if ('text' in cell.value) return String(cell.value.text || '');
          if ('richText' in cell.value) return cell.value.richText.map(rt => rt.text).join('');
          return '';
        }
        return String(cell.value);
      };

      // Helper to get number value from cell
      const getNum = (cell: ExcelJS.Cell) => {
        if (!cell || cell.value === null || cell.value === undefined) return 0;
        if (typeof cell.value === 'object' && 'result' in cell.value) return Number(cell.value.result) || 0;
        return Number(cell.value) || 0;
      };

      worksheet.eachRow((row, rowNumber) => {
        if (isHeader) {
          isHeader = false;
          return;
        }

        const yearVal = getNum(row.getCell(2));
        const planNumberVal = getVal(row.getCell(3));
        const projectNameVal = getVal(row.getCell(4));
        const totalInvestmentVal = getNum(row.getCell(5));
        const scaleVal = getVal(row.getCell(6));
        const pcgdDocumentVal = getVal(row.getCell(7));
        const evnhcmcDocumentVal = getVal(row.getCell(8));
        const statusValText = getVal(row.getCell(9));
        const notesVal = getVal(row.getCell(10));

        // Debug log for the first few rows
        if (rowNumber <= 5) {
          console.log(`Row ${rowNumber} read:`, { yearVal, planNumberVal, projectNameVal, statusValText });
        }

        let status: Project['status'] = 'unregistered';
        if (statusValText === 'Đã đăng ký') status = 'registered';
        else if (statusValText === 'Tạm dừng') status = 'paused';
        else if (statusValText === 'Hủy' || statusValText === 'Đã hủy') status = 'cancelled';

        if (projectNameVal || planNumberVal) {
          projectsToImport.push({
            id: Math.random().toString(36).substr(2, 9),
            year: yearVal || new Date().getFullYear(),
            planNumber: planNumberVal,
            projectName: projectNameVal,
            totalInvestment: totalInvestmentVal,
            scale: scaleVal,
            pcgdDocument: pcgdDocumentVal,
            evnhcmcDocument: evnhcmcDocumentVal,
            status: status,
            notes: notesVal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      if (projectsToImport.length > 0) {
        setLoading(true);
        // Replace all data as requested
        setProjects(projectsToImport);
        alert(`Đã làm mới dữ liệu thành công! Đã xóa dữ liệu cũ và import ${projectsToImport.length} dự án mới.`);
      } else {
        alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
      }
    } catch (error) {
      console.error('Lỗi khi import Excel:', error);
      alert('Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
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
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Năm thực hiện</h2>
            <div className="space-y-1">
              {/* All Years Filter */}
              <button
                onClick={() => setSelectedYear('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all ${
                  selectedYear === 'all' 
                    ? 'bg-slate-700 text-white border-l-4 border-amber-500 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent font-normal'
                }`}
              >
                <Folder className={`w-5 h-5 ${selectedYear === 'all' ? 'text-amber-500' : 'text-slate-500'}`} />
                Tất cả các năm
                <span className={`ml-auto text-xs py-1 px-2.5 rounded-full font-medium ${
                  selectedYear === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {projects.length}
                </span>
              </button>

              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all ${
                    selectedYear === year 
                      ? 'bg-slate-700 text-white border-l-4 border-amber-500 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent font-normal'
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${selectedYear === year ? 'text-amber-500' : 'text-slate-500'}`} />
                  Năm {year}
                  <span className={`ml-auto text-xs py-1 px-2.5 rounded-full font-medium ${
                    String(selectedYear) === String(year) ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {projects.filter(p => String(p.year) === String(year)).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Tình trạng dự án</h2>
            <div className="space-y-1">
              {/* All Projects Filter */}
              <button
                onClick={() => setSelectedStatus('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all ${
                  selectedStatus === 'all' 
                    ? 'bg-slate-700 text-white border-l-4 border-amber-500 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent font-normal'
                }`}
              >
                <AlignLeft className={`w-5 h-5 ${selectedStatus === 'all' ? 'text-amber-500' : 'text-slate-500'}`} />
                Tất cả
                <span className={`ml-auto text-xs py-1 px-2.5 rounded-full font-medium ${
                  selectedStatus === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {projects.filter(p => (selectedYear === 'all' || String(p.year) === String(selectedYear))).length}
                </span>
              </button>

              {/* Sub-items */}
              <div className="space-y-1 mt-1">
                {[
                  { id: 'registered', label: 'Đã đăng ký', icon: CheckCircle2, color: 'text-emerald-500' },
                  { id: 'unregistered', label: 'Chưa đăng ký', icon: Circle, color: 'text-amber-500' },
                  { id: 'paused', label: 'Tạm dừng', icon: PauseCircle, color: 'text-slate-400' },
                  { id: 'cancelled', label: 'Hủy', icon: XCircle, color: 'text-red-500' },
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => setSelectedStatus(status.id)}
                    className={`w-full flex items-center gap-3 pl-10 pr-4 py-2 rounded-lg text-sm transition-all ${
                      selectedStatus === status.id 
                        ? 'bg-slate-700/80 text-white border-l-4 border-amber-500/70 font-medium shadow-sm ring-1 ring-amber-500/10' 
                        : 'text-slate-500 hover:bg-slate-800/30 hover:text-slate-300 border-l-4 border-transparent font-normal'
                    }`}
                  >
                    <status.icon className={`w-4 h-4 ${selectedStatus === status.id ? 'text-amber-500' : status.color}`} />
                    {status.label}
                    <span className={`ml-auto text-[10px] py-0.5 px-2 rounded-full font-medium ${
                      selectedStatus === status.id ? 'bg-amber-500/80 text-white' : 'bg-slate-800/50 text-slate-500'
                    }`}>
                      {projects.filter(p => (selectedYear === 'all' || String(p.year) === String(selectedYear)) && p.status === status.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 mt-auto">
          <div className="flex items-center justify-center py-2">
            <p className="text-[10px] text-slate-500 italic">
              Đã lưu {projects.length} dự án vào trình duyệt
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-0 gap-4">
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 mb-0.5">
              <CalendarCheck2 className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold tracking-tight text-slate-900">
                {selectedYear === 'all' ? 'Tất cả các năm' : `Năm ${selectedYear}`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal italic">Quản lý và theo dõi danh mục dự án</p>
          </div>
          
          <div className="flex-1 px-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm số hiệu, tên dự án, VB..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 hover:border-yellow-500 transition-all w-full text-slate-900 placeholder-slate-400 shadow-sm hover:shadow-md focus:shadow-md"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all active:scale-95"
                title="Làm mới dữ liệu"
              >
                <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImportExcel}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-yellow-400 hover:border-yellow-400 hover:text-slate-900 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-yellow-400 hover:border-yellow-400 hover:text-slate-900 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 shadow-emerald-700/20 active:scale-95 active:translate-y-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm mới
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 bg-slate-100 overflow-hidden flex flex-col relative">
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-slate-100/40 backdrop-blur-[2px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Đang xử lý...</p>
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex-1 flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-sm font-medium text-slate-900 text-center w-[380px]">Phương án</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-900 text-center w-[35%]">Tên dự án</th>
                    <th className="px-4 py-3 text-sm font-medium text-slate-900 text-center whitespace-nowrap w-40">TMĐT (đồng)</th>
                    <th className="px-4 py-3 text-sm font-medium text-slate-900 text-center whitespace-nowrap w-32">Tình trạng</th>
                    <th className="px-6 py-3 text-sm font-medium text-slate-900 text-center w-[20%]">Ghi chú</th>
                    <th className="px-4 py-3 text-sm font-medium text-slate-900 text-center w-16 whitespace-nowrap">Thao tác</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-4 w-[380px]">
                        <span className="text-slate-900 font-normal text-sm w-full whitespace-pre-wrap">
                          {project.planNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-justify w-[35%]">
                        <p className="text-sm font-normal text-slate-900 break-words">{project.projectName}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-normal text-slate-700">{formatCurrency(project.totalInvestment)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-left">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-normal border ${
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
                      <td className="px-6 py-4 text-justify w-[20%]">
                        <p className="text-sm font-normal text-slate-700 break-words">{project.notes || '-'}</p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center w-16">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openEditModal(project)}
                            className="p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 rounded-md transition-colors inline-flex"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setViewingScaleProject(project)}
                            className="p-1 text-slate-400 hover:bg-yellow-50 hover:text-yellow-600 rounded-md transition-colors inline-flex"
                            title="Xem thông tin dự án"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setProjectToDelete(project)}
                            className="p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors inline-flex"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                        
                        {projects.length === 0 && !loading && (
                          <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl max-w-md text-center">
                            <p className="text-xs text-amber-800 mb-2 font-bold flex items-center justify-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> LƯU Ý VỀ DỮ LIỆU
                            </p>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                              Dữ liệu hiện đang được lưu trực tiếp trên trình duyệt Chrome của máy tính này. 
                              Nếu bạn xóa lịch sử duyệt web hoặc đổi máy tính, dữ liệu sẽ không còn. 
                              Hãy sử dụng chức năng <strong>Export</strong> để sao lưu dữ liệu thường xuyên.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </main>
      </div>

      {/* View Scale Modal */}
      {viewingScaleProject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col">
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
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Số hiệu phương án</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base font-bold text-slate-900">
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
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {viewingScaleProject.pcgdDocument ? (
                      <div className="flex gap-2"><FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/> <span>{viewingScaleProject.pcgdDocument}</span></div>
                    ) : <span className="text-slate-400 italic">Chưa có</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">EVNHCMC chấp thuận</p>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-base text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                    {viewingScaleProject.evnhcmcDocument ? (
                      <div className="flex gap-2"><FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/> <span>{viewingScaleProject.evnhcmcDocument}</span></div>
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
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">Ghi chú</p>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-800 text-base leading-relaxed whitespace-pre-wrap text-justify">
                  {viewingScaleProject.notes || <span className="text-slate-400 italic">Không có ghi chú</span>}
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
                  <textarea 
                    required
                    rows={2}
                    placeholder="VD: .../PA-PCGĐ ngày .../.../..."
                    value={formData.planNumber || ''}
                    onChange={e => setFormData({...formData, planNumber: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 resize-none bg-white placeholder-slate-400"
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
                  <textarea 
                    rows={2}
                    placeholder="VD: .../PCGĐ-KH ngày .../.../..."
                    value={formData.pcgdDocument || ''}
                    onChange={e => setFormData({...formData, pcgdDocument: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400 resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    EVNHCMC chấp thuận
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="VD: .../EVNHCMC-KH ngày .../.../..."
                    value={formData.evnhcmcDocument || ''}
                    onChange={e => setFormData({...formData, evnhcmcDocument: e.target.value})}
                    className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 bg-white placeholder-slate-400 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Ghi chú
                </label>
                <textarea 
                  rows={2}
                  placeholder="Nhập ghi chú nếu có..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-5 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 outline-none transition-all text-base text-slate-900 resize-none bg-white placeholder-slate-400"
                />
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
                  className="px-8 py-3 text-base font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors shadow-md shadow-emerald-700/20 active:scale-95"
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
