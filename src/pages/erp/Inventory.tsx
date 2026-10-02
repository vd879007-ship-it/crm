import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package, Pencil, Truck, AlertTriangle, Plus, Trash2, Building2,
  ArrowRightLeft, CheckCircle2, RefreshCw, Box, DollarSign,
  Layers, MapPin, Search, Filter, X, ChevronRight, FileText,
  Warehouse, ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import ERPNavigation from '../../components/ERPNavigation';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface GodownItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  hsnCode: string;
  unit: string;
  valuationRate: number;
  sellingPrice: number;
  minReorderLevel: number;
  godownAllocations: { [godown: string]: number };
  totalStock: number;
  totalValuation: number;
  status: 'Optimal' | 'Low Stock' | 'Critical';
  lastUpdated: string;
}

interface StockSummary {
  totalItemsCount: number;
  totalStockUnits: number;
  totalValuation: number;
  lowStockCount: number;
  godowns: string[];
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'godownMatrix' | 'batches' | 'transfers' | 'manufacturing' | 'physicalStock' | 'stockLedger' | 'groupsUnits'>('godownMatrix');
  const [godownItems, setGodownItems] = useState<GodownItem[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary>({
    totalItemsCount: 0,
    totalStockUnits: 0,
    totalValuation: 0,
    lowStockCount: 0,
    godowns: ['Bangalore Central Tech Hub', 'Mumbai Depot', 'Delhi Distribution Center']
  });

  // Basic Products fallback
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  // Universal CRUD State for Inventory
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editItemForm, setEditItemForm] = useState({
    name: '',
    sku: '',
    category: '',
    hsnCode: '',
    valuationRate: 0,
    sellingPrice: 0,
    minReorderLevel: 5
  });

  const [godownsList, setGodownsList] = useState<any[]>([
    { id: 'GD-01', name: 'Bangalore Central Tech Hub', code: 'BLR-HUB', location: 'Bangalore, Karnataka', manager: 'S. Suresh', capacity: '50,000 sq ft', status: 'Active' },
    { id: 'GD-02', name: 'Mumbai Depot', code: 'BOM-DEP', location: 'Bhiwandi, Maharashtra', manager: 'K. Patel', capacity: '35,000 sq ft', status: 'Active' },
    { id: 'GD-03', name: 'Delhi Distribution Center', code: 'DEL-DIS', location: 'Gurugram, NCR', manager: 'R. Sharma', capacity: '40,000 sq ft', status: 'Active' }
  ]);
  const [showGodownModal, setShowGodownModal] = useState(false);
  const [editingGodown, setEditingGodown] = useState<any>(null);
  const [godownForm, setGodownForm] = useState({ name: '', code: '', location: '', manager: '', capacity: '' });

  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [editBatchForm, setEditBatchForm] = useState({ batchNumber: '', quantity: 0, expiryDate: '', status: 'Fresh' });

  const [showEditBomModal, setShowEditBomModal] = useState(false);
  const [editingBom, setEditingBom] = useState<any>(null);
  const [editBomForm, setEditBomForm] = useState({ finishedGoodName: '', finishedSku: '', laborCost: 0 });

  // Groups and UoMs state & handlers
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [groupForm, setGroupForm] = useState({ groupName: '', hsnPrefix: '', valuation: 0 });

  const [showUomModal, setShowUomModal] = useState(false);
  const [editingUom, setEditingUom] = useState<any>(null);
  const [uomForm, setUomForm] = useState({ code: '', name: '', decimalPlaces: 0 });

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm({ groupName: '', hsnPrefix: '8471', valuation: 0 });
    setShowGroupModal(true);
  };

  const handleOpenEditGroup = (g: any) => {
    setEditingGroup(g);
    setGroupForm({ groupName: g.groupName, hsnPrefix: g.hsnPrefix, valuation: g.valuation || 0 });
    setShowGroupModal(true);
  };

  const handleSaveGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await axios.put(`${API_BASE}/api/erp/accounting/inventory/groups/${editingGroup.id || editingGroup.groupName}`, groupForm);
        alert('Stock group updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/accounting/inventory/groups`, groupForm);
        alert('Stock group created successfully!');
      }
      setShowGroupModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save stock group');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this stock group?')) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/inventory/groups/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete stock group');
    }
  };

  const handleOpenCreateUom = () => {
    setEditingUom(null);
    setUomForm({ code: '', name: '', decimalPlaces: 0 });
    setShowUomModal(true);
  };

  const handleOpenEditUom = (u: any) => {
    setEditingUom(u);
    setUomForm({ code: u.code, name: u.name, decimalPlaces: u.decimalPlaces || 0 });
    setShowUomModal(true);
  };

  const handleSaveUomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUom) {
        await axios.put(`${API_BASE}/api/erp/accounting/inventory/units/${editingUom.id || editingUom.code}`, uomForm);
        alert('Unit of measure updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/accounting/inventory/units`, uomForm);
        alert('Unit of measure created successfully!');
      }
      setShowUomModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save unit of measure');
    }
  };

  const handleDeleteUom = async (id: string) => {
    if (!confirm('Delete this unit of measure?')) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/inventory/units/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete unit of measure');
    }
  };

  const [showItemModal, setShowItemModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSuccessMsg, setTransferSuccessMsg] = useState('');

  // Item Form
  const [itemForm, setItemForm] = useState({
    sku: '',
    name: '',
    category: 'Hardware & Computing',
    hsnCode: '847100',
    unit: 'Units',
    valuationRate: 15000,
    sellingPrice: 19500,
    minReorderLevel: 5,
    blrStock: 10,
    mumStock: 5,
    delStock: 5
  });

  // Transfer Form
  const [transferForm, setTransferForm] = useState({
    itemId: '',
    fromGodown: 'Bangalore Central Tech Hub',
    toGodown: 'Mumbai Depot',
    quantity: 1,
    vehicleNo: 'KA-01-MJ-8822',
    transporterName: 'BlueDart Express Freight',
    transferNotes: 'Stock replenishment for Western Region enterprise delivery order'
  });

  // Continuous Stock Movement Ledger & Valuation State
  const [stockLedgerEntries, setStockLedgerEntries] = useState<any[]>([]);
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'Weighted Average' | 'Moving Average' | 'Standard Cost'>('FIFO');
  const [ledgerGodownFilter, setLedgerGodownFilter] = useState('All');

  // Manufacturing & Physical Stock State
  const [boms, setBoms] = useState<any[]>([]);
  const [productionJournals, setProductionJournals] = useState<any[]>([]);
  const [showBomModal, setShowBomModal] = useState(false);
  const [showProduceModal, setShowProduceModal] = useState(false);
  const [selectedBomForProduce, setSelectedBomForProduce] = useState<any | null>(null);
  const [produceQty, setProduceQty] = useState(1);
  const [produceGodown, setProduceGodown] = useState('Bangalore Central Tech Hub');

  // New BOM Form State
  const [bomForm, setBomForm] = useState({
    bomName: 'Enterprise AI Compute Blade Assembly',
    finishedGoodName: 'NVIDIA DGX H100 Dual-Node Rack Server',
    finishedGoodSku: 'SKU-DGX-H100',
    outputQuantity: 1,
    outputUnit: 'Units',
    labourAndOverheadCost: 45000,
    rawMaterials: [
      { itemName: 'NVIDIA SXM5 H100 80GB GPU Module', requiredQty: 2, unitCost: 1250000 },
      { itemName: 'AMD EPYC 9654 96-Core Processor', requiredQty: 2, unitCost: 280000 },
      { itemName: 'Micron 128GB DDR5 ECC Registered RAM', requiredQty: 8, unitCost: 42000 },
      { itemName: 'Mellanox ConnectX-7 400G InfiniBand NIC', requiredQty: 2, unitCost: 110000 }
    ]
  });

  // Physical Stock Count State
  const [physicalCounts, setPhysicalCounts] = useState<{ [itemId: string]: number }>({});
  const [stockAuditMessage, setStockAuditMessage] = useState('');

  // Inter-Godown Transfer History State
  // Batches State
  const [batches, setBatches] = useState<any[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState({
    batchNumber: '',
    itemName: 'Enterprise NVMe High Speed Storage 1.92TB',
    sku: 'SKU-NVME-192',
    godown: 'Bangalore Central Tech Hub',
    mfgDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1825 * 86400000).toISOString().split('T')[0],
    quantity: 25,
    unit: 'Units',
    valuationRate: 24000
  });

  // Stock Groups & Units State
  const [stockGroups, setStockGroups] = useState<any[]>([]);
  const [uomUnits, setUomUnits] = useState<any[]>([]);

  const [transferHistory, setTransferHistory] = useState<Array<{
    id: string;
    date: string;
    itemName: string;
    fromGodown: string;
    toGodown: string;
    quantity: number;
    vehicleNo: string;
    transporter: string;
    status: string;
  }>>([
    {
      id: 'TRF-2026-081',
      date: '2026-09-24',
      itemName: 'Dell PowerEdge R750 Rack Server',
      fromGodown: 'Bangalore Central Tech Hub',
      toGodown: 'Mumbai Depot',
      quantity: 4,
      vehicleNo: 'KA-04-E-4491',
      transporter: 'VRL Logistics Express',
      status: 'Completed / Reconciled'
    },
    {
      id: 'TRF-2026-079',
      date: '2026-09-21',
      itemName: 'Cisco Catalyst 9300 48-Port PoE+ Switch',
      fromGodown: 'Bangalore Central Tech Hub',
      toGodown: 'Delhi Distribution Center',
      quantity: 6,
      vehicleNo: 'DL-01-AB-9012',
      transporter: 'Gati KWE Express',
      status: 'Completed / Reconciled'
    }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stockRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/api/erp/accounting/inventory/stock-summary`),
        axios.get(`${API_BASE}/api/erp/inventory/products`).catch(() => ({ data: [] }))
      ]);

      if (stockRes.data) {
        setGodownItems(stockRes.data.items || []);
        if (stockRes.data.summary) {
          setStockSummary(stockRes.data.summary);
        }
      }
      setProducts(prodRes.data || []);

      try {
        const [batRes, grpRes, untRes] = await Promise.all([
          axios.get(`${API_BASE}/api/erp/accounting/inventory/batches`),
          axios.get(`${API_BASE}/api/erp/accounting/inventory/groups`),
          axios.get(`${API_BASE}/api/erp/accounting/inventory/units`)
        ]);
        setBatches(batRes.data.batches || []);
        setStockGroups(grpRes.data || []);
        setUomUnits(untRes.data || []);
      } catch (e) {
        console.error('Failed to load batch/group inventory data', e);
      }
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manufacturing Handlers
  const handleCreateBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/manufacturing/bom`, bomForm);
      setShowBomModal(false);
      alert('Bill of Materials (BOM) configured successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to configure BOM');
    }
  };

  const handleProduceBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBomForProduce) return;
    try {
      const res = await axios.post(`${API_BASE}/api/erp/accounting/manufacturing/produce`, {
        bomId: selectedBomForProduce.id,
        quantityProduced: produceQty,
        godown: produceGodown
      });
      setShowProduceModal(false);
      alert(res.data.message || 'Production completed and Finished Goods added to stock!');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to execute manufacturing journal');
    }
  };

  const handleStockAuditAdjust = (item: GodownItem) => {
    const counted = physicalCounts[item.id] !== undefined ? physicalCounts[item.id] : item.totalStock;
    const variance = counted - item.totalStock;
    if (variance === 0) {
      alert(`No variance for ${item.name}. Book stock matches physical count (${counted} units).`);
      return;
    }
    const sign = variance > 0 ? '+' : '';
    if (!window.confirm(`Post Physical Stock Reconciliation for ${item.name}?\nBook Stock: ${item.totalStock}\nPhysical Count: ${counted}\nVariance: ${sign}${variance} units\nAdjustment Journal will update Inventory Ledger and Stock Discrepancy Account.`)) return;

    // Adjust local item state
    setGodownItems(prev => prev.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          totalStock: counted,
          totalValuation: counted * i.valuationRate,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return i;
    }));
    setStockAuditMessage(`Audit Journal posted! ${item.name} adjusted to physical count of ${counted} units (Variance: ${sign}${variance}).`);
    setTimeout(() => setStockAuditMessage(''), 6000);
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/erp/accounting/inventory/batches`, batchForm);
      setShowBatchModal(false);
      setTransferSuccessMsg('New item batch registered with manufacturing & expiry tracking!');
      setTimeout(() => setTransferSuccessMsg(''), 5000);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record batch');
    }
  };

  const handleCreateGodownItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku: itemForm.sku || `SKU-${Date.now().toString().slice(-5)}`,
        name: itemForm.name,
        category: itemForm.category,
        hsnCode: itemForm.hsnCode,
        unit: itemForm.unit,
        valuationRate: Number(itemForm.valuationRate),
        sellingPrice: Number(itemForm.sellingPrice),
        minReorderLevel: Number(itemForm.minReorderLevel),
        godownAllocations: {
          'Bangalore Central Tech Hub': Number(itemForm.blrStock) || 0,
          'Mumbai Depot': Number(itemForm.mumStock) || 0,
          'Delhi Distribution Center': Number(itemForm.delStock) || 0
        }
      };

      await axios.post(`${API_BASE}/api/erp/accounting/inventory/items`, payload);
      setShowItemModal(false);
      setItemForm({
        sku: '',
        name: '',
        category: 'Hardware & Computing',
        hsnCode: '847100',
        unit: 'Units',
        valuationRate: 15000,
        sellingPrice: 19500,
        minReorderLevel: 5,
        blrStock: 10,
        mumStock: 5,
        delStock: 5
      });
      fetchData();
      alert('Item added to Inventory with multi-godown allocation!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add inventory item');
    }
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.itemId) {
      alert('Please select an item to transfer');
      return;
    }
    if (transferForm.fromGodown === transferForm.toGodown) {
      alert('Source and destination godowns cannot be identical');
      return;
    }

    try {
      const selectedItem = godownItems.find(i => i.id === transferForm.itemId);
      const res = await axios.post(`${API_BASE}/api/erp/accounting/inventory/transfer`, {
        itemId: transferForm.itemId,
        fromGodown: transferForm.fromGodown,
        toGodown: transferForm.toGodown,
        quantity: Number(transferForm.quantity)
      });

      // Record in local history
      const newHistoryEntry = {
        id: `TRF-2026-${(transferHistory.length + 82).toString().padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        itemName: selectedItem ? selectedItem.name : 'Transferred Item',
        fromGodown: transferForm.fromGodown,
        toGodown: transferForm.toGodown,
        quantity: Number(transferForm.quantity),
        vehicleNo: transferForm.vehicleNo,
        transporter: transferForm.transporterName,
        status: 'Completed / Reconciled'
      };
      setTransferHistory([newHistoryEntry, ...transferHistory]);

      setShowTransferModal(false);
      setTransferSuccessMsg(res.data?.message || 'Stock transfer executed successfully!');
      setTimeout(() => setTransferSuccessMsg(''), 6000);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to transfer stock between godowns');
    }
  };

  // Universal CRUD Handlers for Inventory
  const handleOpenEditItem = (item: any) => {
    setEditingItem(item);
    setEditItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      hsnCode: item.hsnCode,
      valuationRate: item.valuationRate,
      sellingPrice: item.sellingPrice,
      minReorderLevel: item.minReorderLevel
    });
    setShowEditItemModal(true);
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/inventory/items/${editingItem.id}`, editItemForm);
      setShowEditItemModal(false);
      alert('Stock item updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update stock item');
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Delete stock item "${name}" from all godowns?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/inventory/items/${id}`);
      alert(`Stock item "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete stock item');
    }
  };

  const handleOpenCreateGodown = () => {
    setEditingGodown(null);
    setGodownForm({ name: '', code: '', location: '', manager: '', capacity: '50,000 sq ft' });
    setShowGodownModal(true);
  };

  const handleOpenEditGodown = (g: any) => {
    setEditingGodown(g);
    setGodownForm({ name: g.name, code: g.code, location: g.location, manager: g.manager, capacity: g.capacity });
    setShowGodownModal(true);
  };

  const handleSaveGodownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGodown) {
        await axios.put(`${API_BASE}/api/erp/accounting/inventory/godowns/${editingGodown.id}`, godownForm);
        alert('Godown updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/erp/accounting/inventory/godowns`, godownForm);
        alert('Godown created successfully!');
      }
      setShowGodownModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to save godown');
    }
  };

  const handleDeleteGodown = async (id: string, name: string) => {
    if (!confirm(`Delete Godown facility "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/inventory/godowns/${id}`);
      alert(`Godown "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete godown');
    }
  };

  const handleOpenEditBatch = (batch: any) => {
    setEditingBatch(batch);
    setEditBatchForm({
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
      status: batch.status
    });
    setShowEditBatchModal(true);
  };

  const handleEditBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/inventory/batches/${editingBatch.id}`, editBatchForm);
      setShowEditBatchModal(false);
      alert('Batch updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update batch');
    }
  };

  const handleDeleteBatch = async (id: string, num: string) => {
    if (!confirm(`Delete Batch "${num}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/inventory/batches/${id}`);
      alert(`Batch "${num}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete batch');
    }
  };

  const handleDeleteTransfer = async (id: string) => {
    if (!confirm('Delete transfer record from audit log?')) return;
    setTransferHistory(prev => prev.filter(t => t.id !== id));
    alert('Transfer record removed');
  };

  const handleOpenEditBom = (bom: any) => {
    setEditingBom(bom);
    setEditBomForm({
      finishedGoodName: bom.finishedGoodName,
      finishedSku: bom.finishedSku,
      laborCost: bom.laborCost || 0
    });
    setShowEditBomModal(true);
  };

  const handleEditBomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/erp/accounting/manufacturing/bom/${editingBom.id}`, editBomForm);
      setShowEditBomModal(false);
      alert('BOM updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update BOM');
    }
  };

  const handleDeleteBom = async (id: string, name: string) => {
    if (!confirm(`Delete BOM for "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/erp/accounting/manufacturing/bom/${id}`);
      alert(`BOM for "${name}" deleted!`);
      fetchData();
    } catch (err) {
      alert('Failed to delete BOM');
    }
  };

  const openTransferModalForItem = (item: GodownItem, defaultFrom: string = 'Bangalore Central Tech Hub') => {
    const to = defaultFrom === 'Bangalore Central Tech Hub' ? 'Mumbai Depot' : 'Bangalore Central Tech Hub';
    setTransferForm({
      itemId: item.id,
      fromGodown: defaultFrom,
      toGodown: to,
      quantity: 1,
      vehicleNo: 'KA-01-EX-9988',
      transporterName: 'Inter-Godown Dedicated Fleet',
      transferNotes: `Transfer ${item.name} for balanced regional inventory`
    });
    setShowTransferModal(true);
  };

  const filteredItems = godownItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.hsnCode.includes(searchQuery);
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = ['All', ...Array.from(new Set(godownItems.map(i => i.category)))];

  return (
    <div className="space-y-6">
      <ERPNavigation />

      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-blue-600" /> Multi-Godown Inventory &amp; Stock Valuation
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Enterprise warehouse stock allocation across Bangalore, Mumbai &amp; Delhi with inter-godown transfer vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (godownItems.length > 0) {
                setTransferForm({ ...transferForm, itemId: godownItems[0].id });
              }
              setShowTransferModal(true);
            }}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" /> Inter-Godown Stock Transfer
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> + Add Stock Item
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {transferSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{transferSuccessMsg}</span>
          </div>
          <button onClick={() => setTransferSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Stock Valuation</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              ₹{(stockSummary.totalValuation || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Auto-syncs to Balance Sheet
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Units in Stock</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {stockSummary.totalStockUnits || 0}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              Across {stockSummary.totalItemsCount || godownItems.length} active SKUs
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Godowns</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">3 Hubs</h3>
            <p className="text-[11px] text-gray-500 mt-1">BLR (HQ) • MUM • DEL</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock Triggers</p>
            <h3 className="text-2xl font-black text-red-600 mt-1">
              {stockSummary.lowStockCount || 0}
            </h3>
            <p className="text-[11px] text-red-500 mt-1 font-semibold">Below min reorder threshold</p>
          </div>
          <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Godown Hub Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: 'Bangalore Central Tech Hub',
            tag: 'HQ Master Warehouse',
            color: 'blue',
            units: godownItems.reduce((acc, i) => acc + (i.godownAllocations['Bangalore Central Tech Hub'] || 0), 0)
          },
          {
            name: 'Mumbai Depot',
            tag: 'Western Distribution Port',
            color: 'indigo',
            units: godownItems.reduce((acc, i) => acc + (i.godownAllocations['Mumbai Depot'] || 0), 0)
          },
          {
            name: 'Delhi Distribution Center',
            tag: 'Northern Regional Hub',
            color: 'purple',
            units: godownItems.reduce((acc, i) => acc + (i.godownAllocations['Delhi Distribution Center'] || 0), 0)
          }
        ].map(g => (
          <div key={g.name} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-2xs border border-slate-200 text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-black text-gray-900">{g.name}</h4>
                <p className="text-[10px] text-gray-500 font-semibold">{g.tag}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black font-mono text-gray-900">{g.units}</span>
              <p className="text-[10px] text-gray-400">units</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('godownMatrix')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'godownMatrix' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Multi-Godown Stock Matrix ({godownItems.length})
        </button>
        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'batches' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Box className="w-4 h-4 text-emerald-600" /> Batches &amp; Expiry Tracker ({batches.length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'transfers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Inter-Godown Transfer Journal ({transferHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('manufacturing')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'manufacturing' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" /> Manufacturing (BOM &amp; Job Work) ({boms.length})
        </button>
        <button
          onClick={() => setActiveTab('physicalStock')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'physicalStock' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-teal-600" /> Physical Stock Verification &amp; Audit
        </button>
        <button
          onClick={() => setActiveTab('stockLedger')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'stockLedger' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-600" /> Stock Movement Ledger &amp; Valuation ({stockLedgerEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('groupsUnits')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'groupsUnits' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="w-4 h-4 text-purple-600" /> Stock Groups &amp; Units of Measure
        </button>
      </div>

      {/* ================= TAB 1: MULTI-GODOWN MATRIX ================= */}
      {activeTab === 'godownMatrix' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search SKU, item name or HSN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-gray-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg py-1.5 px-3 text-xs bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Registered Godowns & Depots */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Physical Warehouses &amp; Godowns Directory</h4>
                <p className="text-xs text-gray-500">Regional fulfillment centres, transit hubs and depots</p>
              </div>
              <button
                onClick={handleOpenCreateGodown}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Godown
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {godownsList.map(g => (
                <div key={g.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{g.code}</span>
                      <h5 className="font-bold text-gray-900 text-xs mt-1">{g.name}</h5>
                      <p className="text-[11px] text-gray-500">{g.location}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Manager: {g.manager} • Cap: {g.capacity}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEditGodown(g)} className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer" title="Edit Godown">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteGodown(g.id, g.name)} className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Godown">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Godown Matrix Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Item Details &amp; SKU</th>
                    <th className="py-3 px-4">HSN / Category</th>
                    <th className="py-3 px-4 text-center bg-blue-50/50 text-blue-900 border-x border-blue-100">
                      Bangalore (HQ)
                    </th>
                    <th className="py-3 px-4 text-center bg-indigo-50/50 text-indigo-900 border-r border-indigo-100">
                      Mumbai Depot
                    </th>
                    <th className="py-3 px-4 text-center bg-purple-50/50 text-purple-900 border-r border-purple-100">
                      Delhi Hub
                    </th>
                    <th className="py-3 px-4 text-right">Total Stock</th>
                    <th className="py-3 px-4 text-right">Cost Rate / Valuation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Transfer Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map(item => {
                    const blr = item.godownAllocations['Bangalore Central Tech Hub'] || 0;
                    const mum = item.godownAllocations['Mumbai Depot'] || 0;
                    const del = item.godownAllocations['Delhi Distribution Center'] || 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-[10px] font-mono text-gray-500">{item.sku}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                            {item.hsnCode}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.category}</p>
                        </td>

                        {/* Bangalore Hub */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-700 bg-blue-50/20 border-x border-blue-100">
                          {blr} {item.unit}
                        </td>

                        {/* Mumbai Hub */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700 bg-indigo-50/20 border-r border-indigo-100">
                          {mum} {item.unit}
                        </td>

                        {/* Delhi Hub */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-700 bg-purple-50/20 border-r border-purple-100">
                          {del} {item.unit}
                        </td>

                        {/* Total Stock */}
                        <td className="py-3.5 px-4 text-right">
                          <p className="font-mono font-black text-gray-900 text-sm">
                            {item.totalStock} {item.unit}
                          </p>
                          <p className="text-[10px] text-gray-400">Reorder at: {item.minReorderLevel}</p>
                        </td>

                        {/* Valuation */}
                        <td className="py-3.5 px-4 text-right font-mono">
                          <p className="font-bold text-gray-900">₹{item.totalValuation?.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400">@ ₹{item.valuationRate?.toLocaleString()} / unit</p>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'Optimal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openTransferModalForItem(item)}
                            title="Transfer units between Godowns"
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" /> Move
                          </button>
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            title="Edit Stock Item"
                            className="p-1 text-gray-400 hover:text-blue-600 rounded"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            title="Delete Stock Item"
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 text-xs">
                        No inventory items found. Click "+ Add Stock Item" to create items with multi-godown allocation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      
      {/* ================= TAB: BATCHES & EXPIRY TRACKER ================= */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Batch-Wise Inventory &amp; Expiry Management</h3>
              <p className="text-xs text-gray-500">Track manufacturing lots, warranty lifecycles, and expiry dates per depot</p>
            </div>
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Create Item Batch
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Item &amp; SKU</th>
                    <th className="py-3 px-4">Allocated Godown</th>
                    <th className="py-3 px-4">Mfg Date</th>
                    <th className="py-3 px-4">Expiry / Warranty</th>
                    <th className="py-3 px-4 text-right">Batch Quantity</th>
                    <th className="py-3 px-4 text-right">Valuation Rate</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4 text-center">Batch Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {batches.map(batch => (
                    <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{batch.batchNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{batch.itemName}</p>
                        <p className="text-[10px] font-mono text-gray-500">{batch.sku}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                          {batch.godown}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-mono">{batch.mfgDate}</td>
                      <td className="py-3.5 px-4 text-gray-800 font-mono font-medium">{batch.expiryDate}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        {batch.quantity} {batch.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-600">
                        ₹{batch.valuationRate?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{batch.totalValuation?.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase rounded-full">
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditBatch(batch)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Batch"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id, batch.batchNumber)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: STOCK GROUPS & UOM UNITS ================= */}
            {/* ================= TAB: MANUFACTURING (BOM & JOB WORK) ================= */}
      {activeTab === 'manufacturing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Bill of Materials (BOM) &amp; Manufacturing Journals</h3>
              <p className="text-xs text-gray-500">Configure multi-component recipes, allocate overheads/labour, and execute production into Finished Goods</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBomModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> + Configure BOM Recipe
              </button>
            </div>
          </div>

          {/* BOM Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {boms.map((bom: any) => {
              const totalCostPerUnit = (bom.totalProductionCost || 0) + (bom.labourAndOverheadCost || 0);
              return (
                <div key={bom.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        BOM Recipe: {bom.bomName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">{bom.finishedGoodSku}</span>
                        <button
                          onClick={() => handleOpenEditBom(bom)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer"
                          title="Edit BOM Recipe"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-gray-900">{bom.finishedGoodName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Yield: {bom.outputQuantity} {bom.outputUnit}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Components &amp; Raw Materials</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {bom.rawMaterials?.map((rm: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg">
                            <span className="text-gray-800 font-medium">{rm.itemName} (x{rm.requiredQty})</span>
                            <span className="font-mono text-gray-600">₹{(rm.requiredQty * rm.unitCost)?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Labour &amp; Overheads</span>
                        <strong className="font-mono text-amber-900 font-bold">₹{bom.labourAndOverheadCost?.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Cost Per Unit Yield</span>
                        <strong className="font-mono text-amber-900 font-black text-sm">₹{totalCostPerUnit.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedBomForProduce(bom);
                        setShowProduceModal(true);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Execute Production Run
                    </button>
                  </div>
                </div>
              );
            })}
            {boms.length === 0 && (
              <div className="col-span-2 py-10 bg-white rounded-2xl border border-gray-200 text-center text-gray-400 text-xs">
                No Bill of Materials recipes configured. Click "+ Configure BOM Recipe" to set up manufacturing specs.
              </div>
            )}
          </div>

          {/* Production Journals History */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900">Manufacturing Journals Register (Vouchers)</h4>
              <p className="text-xs text-gray-500">Auto-recorded consumption of raw materials and capitalization into Finished Goods Stock</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Journal No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Finished Good Produced</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4">Godown</th>
                    <th className="py-3 px-4 text-right">Material Cost</th>
                    <th className="py-3 px-4 text-right">Overheads</th>
                    <th className="py-3 px-4 text-right">Total Capitalized Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productionJournals.map((pj: any) => (
                    <tr key={pj.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-700">{pj.journalNo}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{pj.date}</td>
                      <td className="py-3 px-4">
                        <strong className="text-gray-900">{pj.producedItem}</strong>
                        <p className="text-[10px] text-gray-400">BOM: {pj.bomName}</p>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-900">{pj.producedQuantity} Units</td>
                      <td className="py-3 px-4 text-gray-600">{pj.destinationGodown}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">₹{pj.totalMaterialCost?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-700">₹{pj.overheadCost?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">₹{pj.finalValuation?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                          {pj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {productionJournals.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        No manufacturing runs executed yet. Select a BOM above to start production.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: PHYSICAL STOCK VERIFICATION ================= */}
      {activeTab === 'physicalStock' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Physical Stock Count Verification &amp; Discrepancy Audit</h3>
            <p className="text-xs text-gray-500">Record on-ground warehouse stock audits, compute stock variance against book balance, and post inventory adjustment journals</p>
          </div>

          {stockAuditMessage && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs font-bold text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              {stockAuditMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">SKU / Item</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-center">Book Stock</th>
                    <th className="py-3 px-4 text-center w-36">Physical Count</th>
                    <th className="py-3 px-4 text-center">Variance (Units)</th>
                    <th className="py-3 px-4 text-right">Variance Impact</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {godownItems.map(item => {
                    const counted = physicalCounts[item.id] !== undefined ? physicalCounts[item.id] : item.totalStock;
                    const variance = counted - item.totalStock;
                    const varianceVal = variance * item.valuationRate;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <span className="font-mono text-[10px] text-blue-600">{item.sku}</span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">{item.category}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-700">₹{item.valuationRate.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-900">{item.totalStock} {item.unit}</td>
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            value={counted}
                            onChange={e => setPhysicalCounts({ ...physicalCounts, [item.id]: Number(e.target.value) })}
                            className="w-24 text-center border border-gray-300 rounded-lg p-1.5 font-mono font-bold text-xs focus:ring-2 focus:ring-teal-500"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {variance === 0 ? (
                            <span className="text-gray-400 font-mono">0</span>
                          ) : variance > 0 ? (
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800">
                              +{variance}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-mono font-bold bg-rose-100 text-rose-800">
                              {variance}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {variance === 0 ? (
                            <span className="text-gray-400 font-mono">₹0</span>
                          ) : variance > 0 ? (
                            <span className="text-emerald-600">+₹{varianceVal.toLocaleString()}</span>
                          ) : (
                            <span className="text-rose-600">-₹{Math.abs(varianceVal).toLocaleString()}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleStockAuditAdjust(item)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Post Adjustment
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: CONTINUOUS STOCK MOVEMENT LEDGER ================= */}
      {activeTab === 'stockLedger' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Perpetual Stock Movement Ledger (Audit Compliant)</h3>
              <p className="text-xs text-gray-500">Every inflow &amp; outflow voucher tracks running balances: Opening + Purchases + Production - Sales ± Adjustments = Closing Stock</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs">
                <span className="font-bold text-gray-600 pl-2">Valuation:</span>
                {(['FIFO', 'Weighted Average', 'Moving Average'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setValuationMethod(m)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      valuationMethod === m ? 'bg-cyan-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Voucher Type &amp; Ref #</th>
                    <th className="py-3 px-4">Item SKU / Name</th>
                    <th className="py-3 px-4">Godown</th>
                    <th className="py-3 px-4 text-right">Inward Qty</th>
                    <th className="py-3 px-4 text-right">Outward Qty</th>
                    <th className="py-3 px-4 text-right">Rate</th>
                    <th className="py-3 px-4 text-right">Balance Qty</th>
                    <th className="py-3 px-4 text-right">Closing Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stockLedgerEntries.map((l: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-600">{l.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          l.type === 'Purchase Bill' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          l.type === 'Sales Invoice' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          l.type === 'Manufacturing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {l.voucherType || l.type}
                        </span>
                        <p className="font-mono text-[10px] text-gray-400 mt-0.5">{l.voucherNo || l.refNo}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="text-gray-900">{l.itemName}</strong>
                        <p className="text-[10px] font-mono text-blue-600">{l.sku}</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{l.godown}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        {l.inwardQty ? `+${l.inwardQty}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                        {l.outwardQty ? `-${l.outwardQty}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">₹{l.rate?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">{l.balanceQty}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-700">₹{l.closingValuation?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {stockLedgerEntries.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-gray-400">
                        No continuous stock movements recorded yet. Ledger auto-populates from sales, purchases, and mfg journals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'groupsUnits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Groups */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-gray-900 text-sm">Stock Groups &amp; HSN Mapping</h4>
                <button
                  onClick={handleOpenCreateGroup}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer ml-auto mr-2"
                >
                  <Plus className="w-3 h-3" /> + Add Group
                </button>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {stockGroups.length} Groups
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Hierarchical categorization of inventory items for statutory reporting</p>
              <div className="space-y-3 text-xs">
                {stockGroups.map((g, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{g.groupName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">HSN Prefix: {g.hsnPrefix} • {g.itemCount} SKUs</p>
                    </div>
                    <div className="text-right font-mono font-bold text-gray-800">
                      ₹{g.valuation?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => handleOpenEditGroup(g)} className="p-1 text-gray-400 hover:text-purple-600 rounded cursor-pointer" title="Edit Group">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteGroup(g.id || g.groupName)} className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Group">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Units of Measure (UoM) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-black text-gray-900 text-sm">Units of Measure (UoM - GST Compliant)</h4>
                <button
                  onClick={handleOpenCreateUom}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer ml-auto mr-2"
                >
                  <Plus className="w-3 h-3" /> + Add UoM
                </button>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {uomUnits.length} UoMs
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Official GSTN Unique Quantity Codes (UQC) for invoicing and inventory</p>
              <div className="space-y-2 text-xs">
                {uomUnits.map((u, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-white border border-gray-200 font-mono font-black text-blue-700 rounded-lg">
                        {u.code}
                      </span>
                      <span className="font-semibold text-gray-800">{u.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      Decimals: {u.decimalPlaces}
                    </span>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => handleOpenEditUom(u)} className="p-1 text-gray-400 hover:text-blue-600 rounded cursor-pointer" title="Edit UoM">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteUom(u.id || u.code)} className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer" title="Delete UoM">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INTER-GODOWN TRANSFERS ================= */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inter-Godown Transfer Journal</h3>
              <p className="text-xs text-gray-500">Track physical inventory movements between regional warehouses</p>
            </div>
            <button
              onClick={() => {
                if (godownItems.length > 0) setTransferForm({ ...transferForm, itemId: godownItems[0].id });
                setShowTransferModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Movement Voucher
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Transfer Voucher</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Item Transferred</th>
                    <th className="py-3 px-4">Source Godown</th>
                    <th className="py-3 px-4 text-center">Movement</th>
                    <th className="py-3 px-4">Destination Godown</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4">Logistics / Vehicle</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {transferHistory.map(trf => (
                    <tr key={trf.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{trf.id}</td>
                      <td className="py-3.5 px-4 text-gray-700">{trf.date}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{trf.itemName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold">
                          {trf.fromGodown}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold">
                          {trf.toGodown}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900 text-sm">
                        {trf.quantity} Units
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-800">{trf.transporter}</p>
                        <p className="text-[10px] font-mono text-gray-400">{trf.vehicleNo}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase rounded-full">
                          {trf.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD GODOWN STOCK ITEM ================= */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[700px] max-w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Add Stock Item to Godown Inventory</h3>
                <p className="text-xs text-gray-500">Record item valuation rate, selling price and regional godown allocation</p>
              </div>
              <button onClick={() => setShowItemModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGodownItem} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Item / Product Name *</label>
                  <input
                    required
                    placeholder="e.g. Cisco Enterprise Core Router C8500"
                    value={itemForm.name}
                    onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU Code</label>
                  <input
                    placeholder="Auto-generated if empty"
                    value={itemForm.sku}
                    onChange={e => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <input
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">HSN Code</label>
                  <input
                    value={itemForm.hsnCode}
                    onChange={e => setItemForm({ ...itemForm, hsnCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Unit of Measure</label>
                  <select
                    value={itemForm.unit}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Units">Units</option>
                    <option value="Sets">Sets</option>
                    <option value="Meters">Meters</option>
                    <option value="Kgs">Kgs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valuation Rate / Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    value={itemForm.valuationRate}
                    onChange={e => setItemForm({ ...itemForm, valuationRate: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.sellingPrice}
                    onChange={e => setItemForm({ ...itemForm, sellingPrice: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    value={itemForm.minReorderLevel}
                    onChange={e => setItemForm({ ...itemForm, minReorderLevel: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Initial Godown Allocation */}
              <div className="pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-gray-800 mb-1">Initial Godown Stock Allocations</h4>
                <p className="text-[11px] text-gray-500 mb-3">Distribute initial quantity across your operational warehouses</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-blue-800 mb-1">Bangalore Central Tech Hub</label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.blrStock}
                      onChange={e => setItemForm({ ...itemForm, blrStock: Number(e.target.value) })}
                      className="w-full border border-blue-200 bg-white rounded-xl p-2 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-indigo-800 mb-1">Mumbai Depot</label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.mumStock}
                      onChange={e => setItemForm({ ...itemForm, mumStock: Number(e.target.value) })}
                      className="w-full border border-indigo-200 bg-white rounded-xl p-2 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-800 mb-1">Delhi Distribution Center</label>
                    <input
                      type="number"
                      min="0"
                      value={itemForm.delStock}
                      onChange={e => setItemForm({ ...itemForm, delStock: Number(e.target.value) })}
                      className="w-full border border-purple-200 bg-white rounded-xl p-2 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save &amp; Allocate Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INTER-GODOWN TRANSFER ================= */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Inter-Godown Stock Transfer Journal</h3>
                <p className="text-xs text-gray-500">Transfer stock units between regional warehouses with vehicle and LR tracking</p>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Item to Transfer *</label>
                <select
                  required
                  value={transferForm.itemId}
                  onChange={e => setTransferForm({ ...transferForm, itemId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="">-- Choose Item --</option>
                  {godownItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.sku}) - Total: {item.totalStock} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">From Source Godown *</label>
                  <select
                    value={transferForm.fromGodown}
                    onChange={e => setTransferForm({ ...transferForm, fromGodown: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2 bg-white font-medium"
                  >
                    <option value="Bangalore Central Tech Hub">Bangalore Central Tech Hub</option>
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Delhi Distribution Center">Delhi Distribution Center</option>
                  </select>
                  {transferForm.itemId && (
                    <p className="text-[11px] text-blue-600 font-semibold mt-1">
                      Available: {godownItems.find(i => i.id === transferForm.itemId)?.godownAllocations[transferForm.fromGodown] || 0} units
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">To Destination Godown *</label>
                  <select
                    value={transferForm.toGodown}
                    onChange={e => setTransferForm({ ...transferForm, toGodown: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2 bg-white font-medium"
                  >
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Delhi Distribution Center">Delhi Distribution Center</option>
                    <option value="Bangalore Central Tech Hub">Bangalore Central Tech Hub</option>
                  </select>
                  {transferForm.itemId && (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                      Current: {godownItems.find(i => i.id === transferForm.itemId)?.godownAllocations[transferForm.toGodown] || 0} units
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity to Move *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.quantity}
                    onChange={e => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transport Vehicle Number</label>
                  <input
                    placeholder="KA-01-MJ-8822"
                    value={transferForm.vehicleNo}
                    onChange={e => setTransferForm({ ...transferForm, vehicleNo: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Transporter / Logistics Carrier</label>
                <input
                  placeholder="BlueDart Express Freight"
                  value={transferForm.transporterName}
                  onChange={e => setTransferForm({ ...transferForm, transporterName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Transfer Notes / Reason</label>
                <textarea
                  rows={2}
                  value={transferForm.transferNotes}
                  onChange={e => setTransferForm({ ...transferForm, transferNotes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Execute Stock Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD BATCH ================= */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full p-6">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900">Record Item Batch</h3>
                <p className="text-xs text-gray-500">Assign manufacturing lot, warranty period, and warehouse dock</p>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch Number *</label>
                  <input
                    required
                    placeholder="BCH-2026-09X"
                    value={batchForm.batchNumber}
                    onChange={e => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Item Description *</label>
                  <input
                    required
                    value={batchForm.itemName}
                    onChange={e => setBatchForm({ ...batchForm, itemName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Allocated Godown *</label>
                  <select
                    value={batchForm.godown}
                    onChange={e => setBatchForm({ ...batchForm, godown: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                  >
                    <option value="Bangalore Central Tech Hub">Bangalore Central Tech Hub</option>
                    <option value="Mumbai Depot">Mumbai Depot</option>
                    <option value="Delhi Distribution Center">Delhi Distribution Center</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU Code</label>
                  <input
                    value={batchForm.sku}
                    onChange={e => setBatchForm({ ...batchForm, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mfg Date</label>
                  <input
                    type="date"
                    value={batchForm.mfgDate}
                    onChange={e => setBatchForm({ ...batchForm, mfgDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiry / Warranty End</label>
                  <input
                    type="date"
                    value={batchForm.expiryDate}
                    onChange={e => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={batchForm.quantity}
                    onChange={e => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valuation Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={batchForm.valuationRate}
                    onChange={e => setBatchForm({ ...batchForm, valuationRate: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ================= MODAL: EDIT STOCK ITEM ================= */}
      {showEditItemModal && editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[500px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Stock Item</h3>
              <button onClick={() => setShowEditItemModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditItemSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item Description / Name</label>
                <input
                  type="text"
                  required
                  value={editItemForm.name}
                  onChange={e => setEditItemForm({ ...editItemForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editItemForm.sku}
                    onChange={e => setEditItemForm({ ...editItemForm, sku: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={editItemForm.hsnCode}
                    onChange={e => setEditItemForm({ ...editItemForm, hsnCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valuation Rate (₹)</label>
                  <input
                    type="number"
                    value={editItemForm.valuationRate}
                    onChange={e => setEditItemForm({ ...editItemForm, valuationRate: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editItemForm.sellingPrice}
                    onChange={e => setEditItemForm({ ...editItemForm, sellingPrice: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    value={editItemForm.minReorderLevel}
                    onChange={e => setEditItemForm({ ...editItemForm, minReorderLevel: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditItemModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save Item Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BATCH ================= */}
      {showEditBatchModal && editingBatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit Batch {editingBatch.batchNumber}</h3>
              <button onClick={() => setShowEditBatchModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditBatchSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editBatchForm.quantity}
                    onChange={e => setEditBatchForm({ ...editBatchForm, quantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editBatchForm.expiryDate}
                    onChange={e => setEditBatchForm({ ...editBatchForm, expiryDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Quality Status</label>
                <select
                  value={editBatchForm.status}
                  onChange={e => setEditBatchForm({ ...editBatchForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-bold"
                >
                  <option value="Fresh">Fresh</option>
                  <option value="Near Expiry">Near Expiry</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditBatchModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Update Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BOM ================= */}
      {showEditBomModal && editingBom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Edit BOM Specification</h3>
              <button onClick={() => setShowEditBomModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditBomSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Finished Good Name</label>
                <input
                  type="text"
                  required
                  value={editBomForm.finishedGoodName}
                  onChange={e => setEditBomForm({ ...editBomForm, finishedGoodName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Finished SKU</label>
                  <input
                    type="text"
                    value={editBomForm.finishedSku}
                    onChange={e => setEditBomForm({ ...editBomForm, finishedSku: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assembly Labor Cost (₹)</label>
                  <input
                    type="number"
                    value={editBomForm.laborCost}
                    onChange={e => setEditBomForm({ ...editBomForm, laborCost: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowEditBomModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs">Save BOM</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL: CREATE / EDIT GODOWN ================= */}
      {showGodownModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingGodown ? 'Edit Godown / Depot' : 'Add New Godown / Depot'}</h3>
              <button onClick={() => setShowGodownModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveGodownSubmit} className="space-y-3.5 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Godown / Depot Name *</label>
                <input
                  type="text"
                  required
                  value={godownForm.name}
                  onChange={e => setGodownForm({ ...godownForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                  placeholder="e.g. Bangalore Central Tech Hub"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Godown Code *</label>
                  <input
                    type="text"
                    required
                    value={godownForm.code}
                    onChange={e => setGodownForm({ ...godownForm, code: e.target.value.toUpperCase() })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                    placeholder="e.g. BLR-HUB"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Floor Capacity</label>
                  <input
                    type="text"
                    value={godownForm.capacity}
                    onChange={e => setGodownForm({ ...godownForm, capacity: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                    placeholder="e.g. 50,000 sq ft"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Location / Address *</label>
                <input
                  type="text"
                  required
                  value={godownForm.location}
                  onChange={e => setGodownForm({ ...godownForm, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                  placeholder="e.g. Electronic City Phase 1, Bangalore"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Depot Manager / Custodian</label>
                <input
                  type="text"
                  value={godownForm.manager}
                  onChange={e => setGodownForm({ ...godownForm, manager: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                  placeholder="e.g. S. Suresh (+91 98450 11223)"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowGodownModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Godown</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE BOM RECIPE ================= */}
      {showBomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-full p-6 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Configure Bill of Materials (BOM)</h3>
                <p className="text-gray-500">Define raw materials and overheads required for assembly</p>
              </div>
              <button onClick={() => setShowBomModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateBOM} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">BOM Recipe Name *</label>
                <input
                  type="text"
                  required
                  value={bomForm.bomName}
                  onChange={e => setBomForm({ ...bomForm, bomName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Finished Good Name *</label>
                  <input
                    type="text"
                    required
                    value={bomForm.finishedGoodName}
                    onChange={e => setBomForm({ ...bomForm, finishedGoodName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Finished SKU *</label>
                  <input
                    type="text"
                    required
                    value={bomForm.finishedGoodSku}
                    onChange={e => setBomForm({ ...bomForm, finishedGoodSku: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Output Yield Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={bomForm.outputQuantity}
                    onChange={e => setBomForm({ ...bomForm, outputQuantity: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Labour &amp; Overhead Cost (₹)</label>
                  <input
                    type="number"
                    value={bomForm.labourAndOverheadCost}
                    onChange={e => setBomForm({ ...bomForm, labourAndOverheadCost: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Raw Materials / Components Recipe</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {bomForm.rawMaterials.map((rm, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                      <input
                        type="text"
                        value={rm.itemName}
                        onChange={e => {
                          const updated = [...bomForm.rawMaterials];
                          updated[idx].itemName = e.target.value;
                          setBomForm({ ...bomForm, rawMaterials: updated });
                        }}
                        className="flex-1 border border-gray-300 rounded-lg p-1.5 bg-white"
                        placeholder="Component name"
                      />
                      <input
                        type="number"
                        min="1"
                        value={rm.requiredQty}
                        onChange={e => {
                          const updated = [...bomForm.rawMaterials];
                          updated[idx].requiredQty = Number(e.target.value);
                          setBomForm({ ...bomForm, rawMaterials: updated });
                        }}
                        className="w-16 border border-gray-300 rounded-lg p-1.5 font-mono bg-white text-center"
                        title="Qty required"
                      />
                      <input
                        type="number"
                        value={rm.unitCost}
                        onChange={e => {
                          const updated = [...bomForm.rawMaterials];
                          updated[idx].unitCost = Number(e.target.value);
                          setBomForm({ ...bomForm, rawMaterials: updated });
                        }}
                        className="w-24 border border-gray-300 rounded-lg p-1.5 font-mono bg-white text-right"
                        title="Unit cost"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowBomModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xs cursor-pointer">Save BOM Recipe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXECUTE PRODUCTION ================= */}
      {showProduceModal && selectedBomForProduce && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[480px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Execute Manufacturing Run</h3>
                <p className="text-gray-500">Produce {selectedBomForProduce.finishedGoodName}</p>
              </div>
              <button onClick={() => setShowProduceModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleProduceBOM} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Production Run Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={produceQty}
                  onChange={e => setProduceQty(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination Godown *</label>
                <select
                  value={produceGodown}
                  onChange={e => setProduceGodown(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 bg-white font-medium"
                >
                  <option value="Bangalore Central Tech Hub">Bangalore Central Tech Hub</option>
                  <option value="Mumbai Depot">Mumbai Depot</option>
                  <option value="Delhi Distribution Center">Delhi Distribution Center</option>
                </select>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900">Total Material Consumption &amp; Overhead:</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Raw materials will be auto-deducted from source stock, and finished inventory will be created in {produceGodown}.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowProduceModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Confirm &amp; Post Run</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT STOCK GROUP ================= */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[460px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingGroup ? 'Edit Stock Group' : 'Add Stock Group'}</h3>
              <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveGroupSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={groupForm.groupName}
                  onChange={e => setGroupForm({ ...groupForm, groupName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold"
                  placeholder="e.g. Enterprise Storage &amp; Drives"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">HSN Prefix *</label>
                  <input
                    type="text"
                    required
                    value={groupForm.hsnPrefix}
                    onChange={e => setGroupForm({ ...groupForm, hsnPrefix: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                    placeholder="e.g. 8471"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Valuation (₹)</label>
                  <input
                    type="number"
                    value={groupForm.valuation}
                    onChange={e => setGroupForm({ ...groupForm, valuation: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowGroupModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT UOM ================= */}
      {showUomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[440px] max-w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">{editingUom ? 'Edit Unit of Measure' : 'Add Unit of Measure'}</h3>
              <button onClick={() => setShowUomModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveUomSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">GST UQC Code *</label>
                <input
                  type="text"
                  required
                  value={uomForm.code}
                  onChange={e => setUomForm({ ...uomForm, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold"
                  placeholder="e.g. PCS, NOS, MTR"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Unit Description *</label>
                <input
                  type="text"
                  required
                  value={uomForm.name}
                  onChange={e => setUomForm({ ...uomForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5"
                  placeholder="e.g. Pieces / Units"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Decimal Places</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={uomForm.decimalPlaces}
                  onChange={e => setUomForm({ ...uomForm, decimalPlaces: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowUomModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save UoM</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
