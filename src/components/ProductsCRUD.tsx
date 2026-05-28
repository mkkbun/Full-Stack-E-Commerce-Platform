import { useState } from "react";
import { Plus, Trash2, Edit, Save, ArrowDownToLine, Check, Sparkles, Layers, ListFilter } from "lucide-react";
import { Product, ProductVariant } from "../types";

interface ProductsCRUDProps {
  products: Product[];
  onCreateProduct: (product: Product) => void;
  onUpdateProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

export default function ProductsCRUD({
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}: ProductsCRUDProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State parameters for New Product
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState(100);
  const [pCategory, setPCategory] = useState("Apparel");
  const [pImage, setPImage] = useState("");
  const [vColor, setVColor] = useState("Midnight Black");
  const [vSize, setVSize] = useState("M");
  const [vStock, setVStock] = useState(20);

  // Bulk parameters
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Edit fields map
  const [editPriceMap, setEditPriceMap] = useState<Record<string, number>>({});

  const handleToggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkPriceAdjustment = () => {
    if (selectedIds.size === 0) {
      alert("Please check target items first!");
      return;
    }
    products.forEach((p) => {
      if (selectedIds.has(p.id)) {
        onUpdateProduct(p.id, { price: p.price + 10 });
      }
    });
    setSelectedIds(new Set());
    alert("Bulk price adjustment adjusted +$10 to selected lines.");
  };

  const handleCreateProductSubmit = (e: any) => {
    e.preventDefault();
    if (!pName || !pDesc || !pImage) {
      alert("Please provide proper description, naming, and image link.");
      return;
    }

    const defaultVar: ProductVariant = {
      id: "v_" + Math.random().toString(36).substring(2, 6),
      size: vSize,
      color: vColor,
      colorCode: vColor.toLowerCase().includes("black") ? "#111827" : "#d97706",
      stock: vStock
    };

    const newProd: Product = {
      id: "prod_" + Math.random().toString(36).substring(2, 7),
      name: pName,
      description: pDesc,
      price: Number(pPrice),
      rating: 4.5,
      category: pCategory,
      images: [pImage],
      variants: [defaultVar],
      stock: vStock,
      featured: false
    };

    onCreateProduct(newProd);

    // Reset Form
    setPName("");
    setPDesc("");
    setPPrice(100);
    setPImage("");
    setShowAddForm(false);
  };

  // CSV Dynamic spreadsheet downloads logic
  const handleCSVExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Category,Price,Total Stock,Featured\n";

    products.forEach((p) => {
      const combinedStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
      csvContent += `"${p.id}","${p.name}","${p.category}",${p.price},${combinedStock},${p.featured ? "TRUE" : "FALSE"}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nexus_product_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & CSV export CTA button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            <span>Product Catalogue Admin</span>
          </h2>
          <p className="text-zinc-500 text-xs font-mono">CREATE INDIVIDUAL DESIGNS, BATCH PRICING & INVENTORY MANAGEMENT</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleCSVExport}
            className="px-4 py-2 bg-zinc-900 border border-zinc-805 hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowDownToLine className="h-4 w-4 text-amber-500" />
            <span>Export Catalog CSV</span>
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Design</span>
          </button>
        </div>
      </div>

      {/* Creation form dropdown menu */}
      {showAddForm && (
        <form onSubmit={handleCreateProductSubmit} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
            Create New Product design
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-mono text-zinc-500">PRODUCT TITLE</label>
              <input
                type="text"
                required
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="e.g. Neo-Mesh Cargo Vest"
                className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-mono text-zinc-500">CATEGORY</label>
              <select
                value={pCategory}
                onChange={(e) => setPCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="Accessories">Accessories</option>
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xxs font-mono text-zinc-500">DETAILED DESCRIPTION</label>
            <textarea
              required
              rows={3}
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              placeholder="Describe technical specification, cut, material compositions..."
              className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xxs font-mono text-zinc-500">BASE CATALOG PRICE ($)</label>
              <input
                type="number"
                required
                min={1}
                value={pPrice}
                onChange={(e) => setPPrice(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xxs font-mono text-zinc-500">IMAGE REPOSITORY SOURCE URL</label>
              <input
                type="text"
                required
                value={pImage}
                onChange={(e) => setPImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-zinc-900 border border-zinc-805 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Model options details */}
          <div className="p-4 bg-zinc-900/40 rounded-xl space-y-3/2">
            <span className="text-xxs font-mono text-zinc-500 font-bold block uppercase mb-1">Default Model Variant &amp; initial stocks</span>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xxxxs font-mono text-zinc-500">COLOR</label>
                <input
                  type="text"
                  value={vColor}
                  onChange={(e) => setVColor(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xxxxs font-mono text-zinc-500">SIZE</label>
                <input
                  type="text"
                  value={vSize}
                  onChange={(e) => setVSize(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs text-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xxxxs font-mono text-zinc-500">STOCK UNITS</label>
                <input
                  type="number"
                  value={vStock}
                  onChange={(e) => setVStock(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 px-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-lg text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-bold cursor-pointer"
            >
              Upload into Database
            </button>
          </div>
        </form>
      )}

      {/* Bulk actions Bar */}
      {selectedIds.size > 0 && (
        <div className="p-4 bg-zinc-900 border border-amber-500/20 text-white rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-250">
          <span className="text-xs font-mono text-zinc-300">
            Selected <span className="text-amber-500 font-bold">{selectedIds.size}</span> item lines for batch actions:
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPriceAdjustment}
              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xxs px-3.5 py-2 rounded-lg font-mono font-bold cursor-pointer transition-colors"
            >
              Adjust Price +$10
            </button>
            <button
              onClick={() => {
                if (confirm(`Remove ${selectedIds.size} selected design records?`)) {
                  selectedIds.forEach((id) => onDeleteProduct(id));
                  setSelectedIds(new Set());
                }
              }}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent text-xxs px-3.5 py-2 rounded-lg font-mono font-bold cursor-pointer transition-colors"
            >
              Bulk Delete Cards
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-zinc-400 hover:text-white text-xxs px-2"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Main product inventory list */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/40 text-xxs font-mono text-zinc-500 uppercase tracking-widest">
                <th className="p-4 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === products.length}
                    onChange={handleSelectAll}
                    className="accent-amber-500"
                  />
                </th>
                <th className="p-4">SKU Info</th>
                <th className="p-4">Categorization</th>
                <th className="p-4">Product Base Unit Price</th>
                <th className="p-4">Combined stock balance</th>
                <th className="p-4">Variants overview</th>
                <th className="p-4 text-right">Database Admin options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300 font-mono">
              {products.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const isEditing = editingId === p.id;
                const priceValue = editPriceMap[p.id] ?? p.price;

                return (
                  <tr key={p.id} className="hover:bg-zinc-900/20 transition-all">
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(p.id)}
                        onChange={() => handleToggleSelect(p.id)}
                        className="accent-amber-500"
                      />
                    </td>

                    {/* Image and title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-10 object-cover bg-zinc-900 border border-zinc-800 rounded-lg flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-sans font-semibold text-white text-xs">{p.name}</div>
                          <div className="text-xxs text-zinc-500">{p.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Categorization */}
                    <td className="p-4">
                      <span className="text-xxs font-mono font-bold text-zinc-400 bg-zinc-900/50 px-2 py-0.5 border border-zinc-850 rounded-md">
                        {p.category.toUpperCase()}
                      </span>
                    </td>

                    {/* Price field */}
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={priceValue}
                          onChange={(e) => setEditPriceMap({ ...editPriceMap, [p.id]: Number(e.target.value) })}
                          className="bg-zinc-900 border border-amber-500/50 text-white rounded px-2 py-1 w-20 font-bold"
                        />
                      ) : (
                        <span className="text-white font-bold font-sans">${p.price}.00</span>
                      )}
                    </td>

                    {/* Stock balance */}
                    <td className="p-4 text-zinc-200">
                      <span className={totalStock === 0 ? "text-red-500 font-bold" : totalStock < 10 ? "text-amber-500 font-bold" : "text-green-400"}>
                        {totalStock} AVAILABLE UNITS
                      </span>
                    </td>

                    {/* SKU Variants list inline */}
                    <td className="p-4 text-xxs text-zinc-500 flex flex-wrap gap-1 max-w-xs">
                      {p.variants.map((v) => (
                        <span key={v.id} className="bg-zinc-900 border border-zinc-850 rounded px-1.5 py-0.5 block flex-shrink-0 text-3xs">
                          {v.color}({v.size}): {v.stock}
                        </span>
                      ))}
                    </td>

                    {/* Action controls */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-zinc-400">
                        {isEditing ? (
                          <button
                            onClick={() => {
                              onUpdateProduct(p.id, { price: priceValue });
                              setEditingId(null);
                            }}
                            className="bg-green-500 text-zinc-950 p-1.5 rounded-lg hover:bg-green-400 shadow cursor-pointer transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditPriceMap({ ...editPriceMap, [p.id]: p.price });
                            }}
                            className="p-1.5 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-805 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Confirm dynamic deletion of ${p.name} from cloud catalogue?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 hover:text-red-500 hover:bg-zinc-900 border border-transparent hover:border-zinc-805 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
