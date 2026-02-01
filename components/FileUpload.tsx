
import React from 'react';
import { FileData } from '../types';

interface FileUploadProps {
  label: string;
  multiple?: boolean;
  accept?: string;
  files: FileData[];
  onFilesChange: (files: FileData[]) => void;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, multiple, accept, files, onFilesChange, id }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles: FileData[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const base64 = await fileToBase64(file);
      newFiles.push({
        name: file.name,
        type: file.type,
        base64: base64.split(',')[1]
      });
    }

    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest" htmlFor={id}>
        {label}
      </label>
      <div className="flex flex-col space-y-4">
        <label className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all duration-300 bg-white">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-blue-100 transition-colors mb-2">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <p className="text-xs text-slate-500 font-bold group-hover:text-blue-600 transition-colors">Importar PDF</p>
          </div>
          <input id={id} type="file" className="hidden" multiple={multiple} accept={accept} onChange={handleFileChange} />
        </label>

        {files.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold shadow-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path></svg>
                  <span className="truncate max-w-[120px] text-slate-600 uppercase tracking-tight">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(idx)}
                  className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
