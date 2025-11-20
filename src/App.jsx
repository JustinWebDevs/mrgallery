import React, { useState, useEffect, useCallback } from 'react';
import { 
  Folder, Image as ImageIcon, ChevronRight, ArrowLeft, Home, Heart, 
  X, Settings, Sparkles, Camera, FileQuestion, ChevronLeft, 
  ZoomIn, ZoomOut, ExternalLink, AlertCircle 
} from 'lucide-react';

// --- COMPONENTE 1: VISUALIZADOR DE IMÁGENES (LIGHTBOX) ---
// Maneja zoom, navegación, favoritos y abrir en carpeta
const ImageViewer = ({ image, onClose, onNext, onPrev, isFavorite, onToggleFavorite }) => {
  const [zoom, setZoom] = useState(1);
  const [imgError, setImgError] = useState(false);

  // Resetear estado al cambiar de imagen
  useEffect(() => {
    setZoom(1);
    setImgError(false);
  }, [image]);

  // Manejo de Teclado (Escape y Flechas)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Función para abrir ubicación en Windows/Mac
  const handleShowInFolder = () => {
    if (window.electron && window.electron.showItemInFolder) {
      window.electron.showItemInFolder(image.path);
    } else {
      alert(`Ruta simulada: ${image.path}`);
    }
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0a15]/95 backdrop-blur-xl animate-in fade-in duration-300 select-none"
        onClick={onClose} // Click afuera cierra
    >
      {/* Botones Superiores */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-50" onClick={(e) => e.stopPropagation()}>
        <button 
            onClick={handleShowInFolder}
            className="p-3 bg-white/5 hover:bg-[#B973FA] text-white rounded-full transition-colors border border-white/10 hover:border-[#B973FA]"
            title="Abrir ubicación del archivo"
        >
            <ExternalLink size={20} />
        </button>
        <button 
            onClick={onToggleFavorite}
            className={`p-3 rounded-full transition-colors border border-white/10 hover:border-[#B973FA] ${
                isFavorite ? 'bg-[#B973FA] text-white' : 'bg-white/5 text-white hover:bg-[#B973FA]/50'
            }`}
            title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-red-500 text-white rounded-full transition-colors border border-white/10 hover:border-red-400"
        >
            <X size={20} />
        </button>
      </div>

      {/* Flecha Izquierda */}
      <button 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-10 p-4 text-white/50 hover:text-[#B973FA] hover:bg-white/5 rounded-full transition-all z-50"
      >
        <ChevronLeft size={40} />
      </button>

      {/* Contenido Principal (Imagen) */}
      <div 
        className="w-full h-full p-4 md:p-10 flex flex-col items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evitar cerrar al hacer click en controles
      >
        {imgError ? (
            <div className="flex flex-col items-center text-red-400 animate-pulse">
                <AlertCircle size={64} className="mb-4" />
                <p>No se pudo cargar la imagen</p>
                <span className="text-xs opacity-50 mt-2">¿Quizás fue movida o eliminada?</span>
            </div>
        ) : (
            <div 
                className="relative transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
                style={{ transform: `scale(${zoom})` }}
            >
                <img 
                  src={image.src} 
                  alt={image.name}
                  onError={() => setImgError(true)}
                  className="max-w-full max-h-[80vh] object-contain shadow-[0_0_50px_rgba(185,115,250,0.2)] rounded-lg"
                  draggable={false}
                />
            </div>
        )}

        {/* Barra de Herramientas Inferior */}
        <div className="mt-6 px-6 py-3 bg-[#1a1025]/80 border border-[#B973FA]/20 rounded-full backdrop-blur-md flex items-center gap-6 shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <span className="text-white/90 text-sm font-medium tracking-wide flex items-center gap-2 max-w-[200px] truncate">
                {image.name}
            </span>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 hover:text-[#B973FA] transition-colors text-slate-300"><ZoomOut size={18}/></button>
                <span className="text-xs text-[#B973FA] font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 hover:text-[#B973FA] transition-colors text-slate-300"><ZoomIn size={18}/></button>
            </div>
        </div>
      </div>

      {/* Flecha Derecha */}
      <button 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-10 p-4 text-white/50 hover:text-[#B973FA] hover:bg-white/5 rounded-full transition-all z-50"
      >
        <ChevronRight size={40} />
      </button>
    </div>
  );
};

// --- COMPONENTE 2: HEADER ---
const Header = ({ currentPath, history, onNavigate, onGoUp, onSelectRoot, isElectron, filesCount }) => (
  <div className="bg-[#1a1025]/70 backdrop-blur-xl border-b border-[#B973FA]/20 p-5 shadow-[0_4px_20px_-5px_rgba(185,115,250,0.1)] z-20">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-[#B973FA]/10 rounded-xl border border-[#B973FA]/20 shadow-[0_0_15px_rgba(185,115,250,0.2)]">
            <Sparkles className="w-6 h-6 text-[#B973FA]" />
        </div>
        <div>
            <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-[#B973FA] bg-clip-text text-transparent">
                Galería Mágica
            </h1>
            <span className="text-xs text-[#B973FA]/70 font-medium tracking-wider uppercase">
                {isElectron ? 'Explorador Local' : 'Modo Demo'}
            </span>
        </div>
      </div>

      <button 
        onClick={onSelectRoot}
        className="group flex items-center gap-2 bg-[#2d1f3a] hover:bg-[#B973FA] text-[#B973FA] hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-semibold border border-[#B973FA]/30 hover:border-[#B973FA] shadow-lg shadow-black/20 hover:shadow-[#B973FA]/30"
      >
        <Settings size={16} className="group-hover:rotate-90 transition-transform duration-500" />
        {currentPath ? 'Cambiar Carpeta' : 'Configurar'}
      </button>
    </div>

    {/* Breadcrumbs */}
    <div className="flex items-center justify-between px-1">
        <nav className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide">
        {history.length > 1 && (
            <button onClick={onGoUp} className="p-2 hover:bg-[#B973FA]/10 rounded-full transition-colors text-[#B973FA]" title="Atrás">
                <ArrowLeft size={18} />
            </button>
        )}
        
        {history.map((item, index) => (
            <div key={index} className="flex items-center animate-in fade-in slide-in-from-left-2 duration-300">
                <button
                    onClick={() => onNavigate(index)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-xs font-medium tracking-wide
                    ${index === history.length - 1 
                        ? 'bg-[#B973FA] text-white shadow-[0_0_10px_rgba(185,115,250,0.4)] cursor-default transform scale-105' 
                        : 'hover:bg-[#B973FA]/10 text-slate-400 hover:text-[#B973FA]'}`}
                    disabled={index === history.length - 1}
                >
                    {index === 0 && <Home size={12} />}
                    {item.name}
                </button>
                {index < history.length - 1 && <ChevronRight size={14} className="text-[#B973FA]/40 mx-1" />}
            </div>
        ))}
        </nav>
        <div className="hidden sm:block text-xs text-[#B973FA]/60 font-medium px-3 py-1 rounded-full bg-[#B973FA]/5 border border-[#B973FA]/10">
            {filesCount} recuerdos
        </div>
    </div>
  </div>
);

// --- COMPONENTE 3: GRID DE ARCHIVOS ---
const FileGrid = ({ files, onEnterFolder, onSelectImage, favorites }) => {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-[#B973FA]/30">
                <Camera className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-light">Esta carpeta está vacía</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
            {/* Carpetas */}
            {files.filter(f => f.type === 'folder').map((folder, i) => (
                <div 
                  key={folder.path + i}
                  onClick={() => onEnterFolder(folder)}
                  className="group cursor-pointer flex flex-col justify-between aspect-square 
                             bg-[#1a1025]/60 backdrop-blur-sm border border-[#B973FA]/20 hover:border-[#B973FA] 
                             rounded-3xl p-5 transition-all duration-300 hover:-translate-y-2 
                             shadow-lg shadow-black/20 hover:shadow-[0_0_20px_rgba(185,115,250,0.15)]"
                >
                  <div className="flex-1 flex items-center justify-center text-[#B973FA] transition-transform group-hover:scale-110 duration-300">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#B973FA] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <Folder className="w-16 h-16 relative z-10" strokeWidth={1.5} fill="#B973FA" fillOpacity={0.1} />
                    </div>
                  </div>
                  <div className="text-center z-10">
                    <span className="block text-sm font-medium truncate w-full text-slate-200 group-hover:text-[#B973FA] transition-colors">
                        {folder.name}
                    </span>
                    <span className="block text-[10px] text-[#B973FA]/50 mt-1 uppercase tracking-widest font-bold">Abrir</span>
                  </div>
                </div>
            ))}

            {/* Imágenes */}
            {files.filter(f => f.type === 'image').map((image, i) => {
                const isFav = favorites.includes(image.path);
                return (
                    <div 
                      key={image.path + i}
                      onClick={() => onSelectImage(image)}
                      className="group cursor-pointer relative aspect-square 
                                 bg-[#2d1f3a] rounded-3xl overflow-hidden 
                                 border border-white/5 hover:border-[#B973FA]/50 
                                 shadow-md transition-all duration-500 hover:shadow-[0_0_25px_rgba(185,115,250,0.25)] hover:scale-105 z-0 hover:z-10"
                    >
                      <img 
                        src={image.src} 
                        alt={image.name}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {isFav && (
                          <div className="absolute top-3 right-3 z-20 bg-[#B973FA] p-1.5 rounded-full shadow-lg animate-in zoom-in">
                              <Heart size={12} fill="white" className="text-white" />
                          </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1025] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-xs text-white font-medium truncate drop-shadow-md flex items-center gap-2">
                            <Sparkles size={10} className="text-[#B973FA]" />
                            {image.name}
                        </span>
                      </div>
                    </div>
                );
            })}

            {/* Desconocidos */}
            {files.filter(f => f.type === 'unknown').map((file, i) => (
                <div key={i} className="flex flex-col aspect-square items-center justify-center bg-[#1a1025]/30 backdrop-blur-sm border border-dashed border-[#B973FA]/20 rounded-3xl p-4 opacity-60 hover:opacity-80 hover:border-[#B973FA]/40 hover:bg-[#1a1025]/50 transition-all duration-300">
                   <FileQuestion className="w-8 h-8 mb-2 text-[#B973FA]/40"/>
                   <span className="text-[10px] text-center truncate w-full text-[#B973FA]/40 font-medium">{file.name}</span>
                </div>
            ))}
        </div>
    );
};

// --- MOCK DATA (SOLO DEMO) ---
const MOCK_FILES = [
  { name: 'Fotos del Verano', type: 'folder', path: 'demo' },
  { name: 'Diseños', type: 'folder', path: 'demo2' },
  { name: 'selfie_bonita.jpg', type: 'image', path:'mock1', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
  { name: 'flores_regalo.jpg', type: 'image', path:'mock2', src: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80' },
];

// --- APP PRINCIPAL ---
export default function App() {
  const [rootPath, setRootPath] = useState(localStorage.getItem('gallery_root_path') || null);
  const [currentPath, setCurrentPath] = useState(null); 
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]); 
  
  // Estado para el visor
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Estado para favoritos
  const [favorites, setFavorites] = useState(() => {
    try {
        return JSON.parse(localStorage.getItem('gallery_favorites') || '[]');
    } catch { return []; }
  });

  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (window.electron && window.electron.readDir) {
      setIsElectron(true);
      if (rootPath) {
        loadFiles(rootPath);
        setHistory([{ name: 'Inicio', path: rootPath }]);
        setCurrentPath(rootPath);
      }
    } else {
      setFiles(MOCK_FILES);
      setHistory([{ name: 'Mi Galería', path: 'root' }]);
    }
  }, []);

  // Guardar favoritos cuando cambien
  useEffect(() => {
    localStorage.setItem('gallery_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const loadFiles = async (path) => {
    if (!path) return;
    setLoading(true);
    try {
      if (window.electron) {
        const result = await window.electron.readDir(path);
        if (result.success) {
            const sorted = result.files.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
            setFiles(sorted);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACCIONES DE NAVEGACIÓN ---
  const handleSelectRoot = async () => {
    if (!isElectron) return alert("Necesitas ejecutar esto en la aplicación de escritorio.");
    const newPath = await window.electron.selectFolder();
    if (newPath) {
      setRootPath(newPath);
      localStorage.setItem('gallery_root_path', newPath); 
      setCurrentPath(newPath);
      setHistory([{ name: 'Inicio', path: newPath }]);
      loadFiles(newPath);
    }
  };

  const handleEnterFolder = (folder) => {
    if (folder.type !== 'folder') return;
    const newPath = folder.path; 
    setHistory([...history, { name: folder.name, path: newPath }]);
    setCurrentPath(newPath);
    loadFiles(newPath);
  };

  const handleNavigateBreadcrumb = (index) => {
    const targetItem = history[index];
    const newHistory = history.slice(0, index + 1);
    setHistory(newHistory);
    setCurrentPath(targetItem.path);
    loadFiles(targetItem.path);
  };

  const handleGoUp = () => {
    if (history.length > 1) handleNavigateBreadcrumb(history.length - 2);
  };

  // --- LÓGICA DEL VISUALIZADOR ---
  const toggleFavorite = (imagePath) => {
      if (favorites.includes(imagePath)) {
          setFavorites(prev => prev.filter(p => p !== imagePath));
      } else {
          setFavorites(prev => [...prev, imagePath]);
      }
  };

  const handleNextImage = () => {
      if (!selectedImage) return;
      const images = files.filter(f => f.type === 'image');
      const currentIndex = images.findIndex(img => img.path === selectedImage.path);
      const nextIndex = (currentIndex + 1) % images.length;
      setSelectedImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
      if (!selectedImage) return;
      const images = files.filter(f => f.type === 'image');
      const currentIndex = images.findIndex(img => img.path === selectedImage.path);
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      setSelectedImage(images[prevIndex]);
  };

  return (
    <div className="flex flex-col h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1b3d] via-[#0f0a15] to-[#050308] text-slate-100 font-sans overflow-hidden select-none">
      
      <Header 
        currentPath={rootPath}
        history={history}
        onNavigate={handleNavigateBreadcrumb}
        onGoUp={handleGoUp}
        onSelectRoot={handleSelectRoot}
        isElectron={isElectron}
        filesCount={files.length}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth custom-scrollbar">
        {!rootPath && !isElectron ? (
           <div className="flex flex-col items-center justify-center h-full text-[#B973FA]/50 space-y-6">
             <div className="w-24 h-24 bg-[#B973FA]/5 rounded-full flex items-center justify-center border border-[#B973FA]/20 animate-pulse">
                <Heart className="w-10 h-10" />
             </div>
             <p className="text-[#B973FA]/80 font-light tracking-widest uppercase text-xs">Esperando conexión...</p>
           </div>
        ) : !rootPath && isElectron ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#B973FA] blur-3xl opacity-20 rounded-full"></div>
                    <Folder className="relative w-28 h-28 text-[#B973FA] drop-shadow-[0_0_15px_rgba(185,115,250,0.5)]" strokeWidth={1} />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Bienvenida a tu espacio</h3>
                    <p className="text-[#B973FA]/70 font-light">Selecciona la carpeta donde guardas tus momentos.</p>
                </div>
                <button onClick={handleSelectRoot} className="bg-gradient-to-r from-[#B973FA] to-[#9333ea] hover:brightness-110 text-white px-8 py-3 rounded-full font-bold tracking-wide transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(185,115,250,0.4)]">
                    Comenzar Aventura
                </button>
            </div>
        ) : (
            <FileGrid 
                files={files}
                favorites={favorites}
                onEnterFolder={handleEnterFolder}
                onSelectImage={setSelectedImage}
            />
        )}
      </main>

      {/* VISUALIZADOR DE IMÁGENES */}
      {selectedImage && (
          <ImageViewer 
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={handleNextImage}
            onPrev={handlePrevImage}
            isFavorite={favorites.includes(selectedImage.path)}
            onToggleFavorite={() => toggleFavorite(selectedImage.path)}
          />
      )}
    </div>
  );
}