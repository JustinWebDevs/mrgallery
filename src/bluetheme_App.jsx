import React, { useState, useEffect, useCallback } from 'react';
import { Folder, Image as ImageIcon, ChevronRight, ArrowLeft, Home, FileQuestion, X, Settings, RefreshCw } from 'lucide-react';

// --- MOCK DATA (SOLO PARA PREVISUALIZACIÓN WEB) ---
// Esto se usa si no detectamos Electron funcionando.
const MOCK_FILES = [
  { name: 'DEMO - Conecta Electron para ver tus archivos', type: 'folder', path: 'demo' },
  { name: 'foto_demo.jpg', type: 'image', src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80' }
];

export default function App() {
  // Estados
  const [rootPath, setRootPath] = useState(localStorage.getItem('gallery_root_path') || null);
  const [currentPath, setCurrentPath] = useState(null); // Ruta actual absoluta
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]); // Historial de rutas
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  // Detectar si estamos en Electron al iniciar
  useEffect(() => {
    if (window.electron && window.electron.readDir) {
      setIsElectron(true);
      if (rootPath) {
        loadFiles(rootPath);
        setHistory([{ name: 'Inicio', path: rootPath }]);
        setCurrentPath(rootPath);
      }
    } else {
      // Modo Web (Demo)
      setFiles(MOCK_FILES);
      setHistory([{ name: 'Inicio Demo', path: 'root' }]);
    }
  }, []);

  // Función principal para cargar archivos
  const loadFiles = async (path) => {
    if (!path) return;
    setLoading(true);
    try {
      if (window.electron) {
        const result = await window.electron.readDir(path);
        if (result.success) {
            // Ordenar: Carpetas primero, luego archivos
            const sorted = result.files.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
            setFiles(sorted);
        } else {
            console.error("Error leyendo directorio:", result.error);
        }
      }
    } catch (error) {
      console.error("Error de comunicación con Electron", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Seleccionar Carpeta Raíz (Configuración)
  const handleSelectRoot = async () => {
    if (!isElectron) {
        alert("Esta función solo sirve ejecutando la app en Electron.");
        return;
    }
    const newPath = await window.electron.selectFolder();
    if (newPath) {
      setRootPath(newPath);
      localStorage.setItem('gallery_root_path', newPath); // Guardar preferencia
      setCurrentPath(newPath);
      setHistory([{ name: 'Inicio', path: newPath }]);
      loadFiles(newPath);
    }
  };

  // 2. Entrar en una carpeta
  const handleEnterFolder = (folder) => {
    if (folder.type !== 'folder') return;
    
    const newPath = folder.path; // En Electron, esto será la ruta completa 'C:/Users/...'
    
    setHistory([...history, { name: folder.name, path: newPath }]);
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  // 3. Navegación Breadcrumb
  const handleNavigateBreadcrumb = (index) => {
    const targetItem = history[index];
    const newHistory = history.slice(0, index + 1);
    
    setHistory(newHistory);
    setCurrentPath(targetItem.path);
    loadFiles(targetItem.path);
  };

  // 4. Subir nivel
  const handleGoUp = () => {
    if (history.length > 1) {
      handleNavigateBreadcrumb(history.length - 2);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-md z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Folder className="w-6 h-6 text-blue-400" />
            </div>
            <div>
                <h1 className="text-lg font-bold leading-none">Local Gallery</h1>
                <span className="text-xs text-slate-500 font-mono truncate max-w-[200px] block">
                    {isElectron ? currentPath || 'Sin ruta' : 'Modo Web'}
                </span>
            </div>
          </div>

          <button 
            onClick={handleSelectRoot}
            className="flex items-center gap-2 bg-slate-700 hover:bg-blue-600 text-slate-200 px-4 py-2 rounded-lg transition-all text-sm font-medium border border-slate-600 hover:border-blue-500"
          >
            <Settings size={16} />
            {rootPath ? 'Cambiar' : 'Origen'}
          </button>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide mask-linear-fade">
            {history.length > 1 && (
                <button 
                onClick={handleGoUp}
                className="mr-2 p-1.5 hover:bg-slate-700 rounded-md transition-colors text-slate-400 hover:text-white"
                title="Subir nivel"
                >
                <ArrowLeft size={16} />
                </button>
            )}
            
            {history.map((item, index) => (
                <React.Fragment key={index}>
                <button
                    onClick={() => handleNavigateBreadcrumb(index)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors whitespace-nowrap text-sm
                    ${index === history.length - 1 
                        ? 'bg-slate-700/50 text-white font-medium cursor-default' 
                        : 'hover:bg-slate-700 text-slate-400'}`}
                    disabled={index === history.length - 1}
                >
                    {index === 0 && <Home size={14} />}
                    {item.name}
                </button>
                {index < history.length - 1 && (
                    <ChevronRight size={14} className="text-slate-600 min-w-[14px]" />
                )}
                </React.Fragment>
            ))}
            </nav>
            <div className="text-xs text-slate-500 ml-4 whitespace-nowrap">
                {files.length} items
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        {!rootPath && !isElectron ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin-slow" />
             </div>
             <p>Previsualización Web. <br/>Ejecuta en Electron para ver archivos reales.</p>
           </div>
        ) : !rootPath && isElectron ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
                <Folder className="w-24 h-24 opacity-10" />
                <div className="text-center">
                    <h3 className="text-xl font-medium text-slate-200">Bienvenido</h3>
                    <p className="mt-2 text-sm">Selecciona una carpeta para comenzar.</p>
                </div>
                <button onClick={handleSelectRoot} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-medium transition-transform active:scale-95 shadow-lg">
                    Seleccionar Carpeta
                </button>
            </div>
        ) : files.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Folder className="w-16 h-16 mb-4 opacity-20" />
            <p>Carpeta vacía</p>
          </div>
        ) : (
          // --- CAMBIO CLAVE: Grid Uniforme ---
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 pb-10">
            
            {/* Carpetas */}
            {files.filter(f => f.type === 'folder').map((folder, i) => (
                <div 
                  key={folder.path + i}
                  onClick={() => handleEnterFolder(folder)}
                  // CAMBIO: 'aspect-square' y 'justify-between' para centrar y distribuir
                  className="group cursor-pointer flex flex-col justify-between aspect-square bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex-1 flex items-center justify-center text-yellow-500/80 group-hover:text-yellow-400 transition-colors">
                    <Folder className="w-14 h-14 drop-shadow-md" fill="currentColor" fillOpacity={0.2} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-center truncate w-full text-slate-300 group-hover:text-white transition-colors">
                        {folder.name}
                    </span>
                    <span className="block text-[10px] text-center text-slate-600 mt-1 uppercase tracking-wider font-bold">Carpeta</span>
                  </div>
                </div>
            ))}

            {/* Imágenes */}
            {files.filter(f => f.type === 'image').map((image, i) => (
                <div 
                  key={image.path + i}
                  onClick={() => setSelectedImage(image)}
                  // CAMBIO: 'aspect-square' para igualar a las carpetas
                  className="group cursor-pointer relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <img 
                    src={image.src} 
                    alt={image.name}
                    // 'object-cover' hace el recorte inteligente para que llene el cuadrado
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
                    <span className="text-xs text-white truncate font-medium">{image.name}</span>
                  </div>
                </div>
            ))}
            
             {files.filter(f => f.type === 'unknown').map((file, i) => (
                <div key={i} className="flex flex-col aspect-square items-center justify-center bg-slate-800/20 border border-dashed border-slate-700 rounded-xl p-4 opacity-40 hover:opacity-60 transition-opacity">
                   <FileQuestion className="w-8 h-8 mb-2 text-slate-600"/>
                   <span className="text-[10px] text-center truncate w-full text-slate-500">{file.name}</span>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Modal / Lightbox */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X size={24} />
          </button>
          
          <div className="w-full h-full p-8 flex items-center justify-center">
            <img 
              src={selectedImage.src} 
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain shadow-2xl rounded-sm select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <span className="inline-block bg-black/50 px-4 py-2 rounded-full text-sm text-white backdrop-blur-sm">
                {selectedImage.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}