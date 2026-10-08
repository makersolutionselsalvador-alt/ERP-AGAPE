import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, Package } from 'lucide-react';
import { Category } from '../../types';

export const CategoriesView: React.FC = () => {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory
  } = useApp();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  // Subcategory modal
  const [selectedCatForSub, setSelectedCatForSub] = useState<string | null>(null);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');

  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryCode(`CAT-${(categories.length + 1).toString().padStart(2, '0')}`);
    setCategoryName('');
    setCategoryDesc('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryCode(cat.code);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || '');
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        code: categoryCode,
        name: categoryName,
        description: categoryDesc
      });
    } else {
      addCategory({
        code: categoryCode,
        name: categoryName,
        description: categoryDesc
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleAddSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForSub || !subName.trim()) return;
    addSubcategory(selectedCatForSub, {
      code: subCode || `SUB-${Date.now().toString().slice(-3)}`,
      name: subName
    });
    setSelectedCatForSub(null);
    setSubName('');
    setSubCode('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Categorías & Subcategorías (RF-021 / RF-022)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza el árbol jerárquico de clasificación del catálogo de productos.
          </p>
        </div>

        <button
          onClick={openNewCategory}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Nueva Categoría (RF-021)</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => {
          const productCount = products.filter(p => p.categoryId === cat.id).length;

          return (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {cat.code}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{cat.description || 'Sin descripción'}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditCategory(cat)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    title="Editar categoría"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la categoría "${cat.name}"?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subcategories (RF-022) */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Subcategorías:</span>
                  <button
                    onClick={() => {
                      setSelectedCatForSub(cat.id);
                      setSubCode(`SUB-${cat.code.replace('CAT-', '')}-0${cat.subcategories.length + 1}`);
                      setSubName('');
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Agregar Subcategoría (RF-022)
                  </button>
                </div>

                <div className="space-y-1">
                  {cat.subcategories.map(sub => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                        <span className="font-medium text-slate-800">{sub.name}</span>
                        <span className="font-mono text-[9px] text-slate-400">({sub.code})</span>
                      </div>
                      <button
                        onClick={() => deleteSubcategory(cat.id, sub.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {cat.subcategories.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic block py-1">
                      No hay subcategorías definidas.
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{productCount} productos asociados</span>
                <span className="font-mono text-[10px]">ID: {cat.id}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código</label>
                <input
                  type="text"
                  required
                  value={categoryCode}
                  onChange={e => setCategoryCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  placeholder="Ej. Redes, Accesorios..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={categoryDesc}
                  onChange={e => setCategoryDesc(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL */}
      {selectedCatForSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Agregar Subcategoría</h3>

            <form onSubmit={handleAddSubcategory} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código</label>
                <input
                  type="text"
                  required
                  value={subCode}
                  onChange={e => setSubCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  placeholder="Ej. Teclados Mecánicos, Cables..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCatForSub(null)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Guardar Subcategoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
