import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  User,
  CreditCard,
  DollarSign,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  CheckCircle,
  Tag,
  Warehouse as WarehouseIcon,
  Coins,
  Barcode,
  Boxes,
  Sparkles,
  Zap,
  Gift,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  FileText,
  Building,
  QrCode,
  Layers,
  Percent,
  Send,
  SlidersHorizontal,
  Printer
} from 'lucide-react';
import { SaleItem, PaymentMethod, PaymentDetail, Combo, Promotion, TipoDte, TransmissionStepLog, DteDocumentoCompleto, Sale } from '../../types';
import { DteService, SaleDteInput } from '../../services/dteService';
import { DteTransmissionModal } from './DteTransmissionModal';
import { CATALOGO_ACTIVIDADES_ECONOMICAS, generateCodigoGeneracion, generateNumeroControl } from '../../utils/dteHelpers';
import {
  getComboAvailableStock,
  getComboBottleneckComponent,
  getRemainingProductStock,
  getComboAvailableStockWithCart,
  evaluateCartPromotions
} from '../../utils/promoLogic';

interface CartEntry {
  productId: string;
  productCode: string;
  productName: string;
  isCombo?: boolean;
  comboId?: string;
  comboComponents?: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercentage: number;
  promotionDiscount?: number;
}

export const PosView: React.FC = () => {
  const {
    products,
    categories,
    combos,
    promotions,
    clients,
    warehouses,
    sales,
    selectedBranchId,
    activeCashSession,
    currentUser,
    createSale,
    companySettings,
    setSelectedSaleForTicket,
    setCurrentModule,
    showToast
  } = useApp();

  // Search, Warehouse & Navigation Tab
  const [activeCatalogTab, setActiveCatalogTab] = useState<'products' | 'combos' | 'promotions'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouses.find(w => w.branchId === selectedBranchId)?.id || warehouses[0]?.id || ''
  );

  // Cart State
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  // Selected Client (default to Consumidor Final)
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.find(c => c.code === 'CLI-005')?.id || clients[0]?.id || ''
  );

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // DTE 2.0 Selection State
  const [selectedTipoDte, setSelectedTipoDte] = useState<TipoDte>(
    selectedClient.nrc ? '03' : '01'
  );
  const [clientDuiNit, setClientDuiNit] = useState<string>(selectedClient.taxId || '');
  const [clientCustomName, setClientCustomName] = useState<string>(selectedClient.name || '');
  const [clientNrc, setClientNrc] = useState<string>(selectedClient.nrc || '');
  const [clientActividad, setClientActividad] = useState<string>(selectedClient.codActividad || '47110');
  const [clientEsGranContribuyente, setClientEsGranContribuyente] = useState<boolean>(
    Boolean(selectedClient.esGranContribuyente)
  );

  // Sync when selected client changes
  useEffect(() => {
    if (selectedClient.nrc) {
      setSelectedTipoDte('03');
    } else {
      setSelectedTipoDte('01');
    }
    setClientDuiNit(selectedClient.taxId || '');
    setClientCustomName(selectedClient.name || '');
    setClientNrc(selectedClient.nrc || '');
    setClientActividad(selectedClient.codActividad || '47110');
    setClientEsGranContribuyente(Boolean(selectedClient.esGranContribuyente));
  }, [selectedClientId]);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'single' | 'split'>('single');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [creditDueDate, setCreditDueDate] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
  );

  // Split payment state
  const [splitPayments, setSplitPayments] = useState<{
    id: string;
    method: PaymentMethod;
    amount: number;
    percentage: number;
    amountReceived?: number;
    reference?: string;
  }[]>([]);

  // DTE Transmission Pipeline Modal State
  const [isTransmissionModalOpen, setIsTransmissionModalOpen] = useState(false);
  const [currentTransmissionStep, setCurrentTransmissionStep] = useState<string>('validando');
  const [transmissionLogs, setTransmissionLogs] = useState<TransmissionStepLog[]>([]);
  const [isTransmissionCompleted, setIsTransmissionCompleted] = useState(false);
  const [isTransmissionContingency, setIsTransmissionContingency] = useState(false);
  const [transmissionSello, setTransmissionSello] = useState<string | undefined>(undefined);
  const [transmissionFh, setTransmissionFh] = useState<string | undefined>(undefined);
  const [transmissionError, setTransmissionError] = useState<string | undefined>(undefined);
  const [transmissionObservaciones, setTransmissionObservaciones] = useState<string[] | undefined>(undefined);
  const [generatedDteDoc, setGeneratedDteDoc] = useState<DteDocumentoCompleto | undefined>(undefined);
  const [pendingSale, setPendingSale] = useState<Sale | null>(null);

  // Active Combos
  const activeCombos = useMemo(() => {
    return combos.filter(c => c.isActive);
  }, [combos]);

  // Filtered Products
  const availableProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.isActive) return false;
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.barcode.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Filtered Combos for POS
  const availableCombos = useMemo(() => {
    return activeCombos.filter(c => {
      const term = searchTerm.toLowerCase().trim();
      return (
        term === '' ||
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.barcode.includes(term) ||
        c.items.some(i => i.productName.toLowerCase().includes(term))
      );
    });
  }, [activeCombos, searchTerm]);

  // Real-time Promotion Engine Evaluation
  const promoEvaluation = useMemo(() => {
    return evaluateCartPromotions({
      cartItems,
      products,
      combos,
      promotions,
      couponCode: appliedCouponCode || undefined
    });
  }, [cartItems, products, combos, promotions, appliedCouponCode]);

  // Cart Calculations including combo savings and applied promotions
  const cartSummary = useMemo(() => {
    let grossSubtotal = 0;
    let clientDiscountTotal = 0;

    cartItems.forEach(item => {
      const gross = item.unitPrice * item.quantity;
      const clientDisc = gross * (item.discountPercentage / 100);
      grossSubtotal += gross;
      clientDiscountTotal += clientDisc;
    });

    const promoDiscount = promoEvaluation.totalPromoDiscount;
    const totalDiscount = clientDiscountTotal + promoDiscount;
    const netSubtotal = Math.max(0, grossSubtotal - totalDiscount);
    const tax = netSubtotal * (companySettings.defaultTaxRate / 100);
    const total = netSubtotal + tax;

    return {
      grossSubtotal: Math.round(grossSubtotal * 100) / 100,
      clientDiscount: Math.round(clientDiscountTotal * 100) / 100,
      promoDiscount: Math.round(promoDiscount * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      netSubtotal: Math.round(netSubtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }, [cartItems, promoEvaluation, companySettings]);

  // Check if a specific product has an active promotion
  const getProductPromotionBadge = (productId: string, categoryId: string) => {
    const directPromo = promotions.find(
      p =>
        p.isActive &&
        ((p.target === 'PRODUCTO' && p.targetId === productId) ||
          (p.target === 'CATEGORIA' && p.targetId === categoryId))
    );

    if (!directPromo) return null;

    if (directPromo.type === 'DOS_POR_UNO') return '2x1';
    if (directPromo.type === 'PORCENTAJE') return `${directPromo.discountValue}% OFF`;
    if (directPromo.type === 'MONTO_FIJO') return `-$${directPromo.discountValue}`;
    return 'Promo';
  };

  // Add standard product to cart
  const addToCart = (product: typeof products[0]) => {
    const remainingStock = getRemainingProductStock(product.id, selectedWarehouseId, products, cartItems);
    if (remainingStock < 1) {
      showToast(`Stock insuficiente en almacén (unidades ya reservadas en carrito o combos)`, 'warning');
      return;
    }

    const existingIndex = cartItems.findIndex(i => !i.isCombo && i.productId === product.id);

    if (existingIndex > -1) {
      setCartItems(prev =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems(prev => [
        ...prev,
        {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          isCombo: false,
          quantity: 1,
          unitPrice: product.sellingPrice,
          unitCost: product.costPrice,
          discountPercentage: selectedClient.discountPercentage || 0
        }
      ]);
    }
  };

  // Add Combo to cart (logical bundle handling)
  const addComboToCart = (combo: Combo) => {
    const availableAdditional = getComboAvailableStockWithCart(combo, selectedWarehouseId, products, cartItems);
    if (availableAdditional < 1) {
      const bottleneck = getComboBottleneckComponent(combo, selectedWarehouseId, products);
      showToast(
        bottleneck
          ? `No es posible armar otro combo: inventario insuficiente de ${bottleneck.componentName}`
          : 'Stock insuficiente de componentes para armar este combo',
        'warning'
      );
      return;
    }

    const existingIndex = cartItems.findIndex(i => i.isCombo && i.comboId === combo.id);
    if (existingIndex > -1) {
      setCartItems(prev =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      const components = combo.items.map(it => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitCost: it.unitCost
      }));

      // Average component cost
      const totalCost = combo.items.reduce((acc, it) => acc + it.unitCost * it.quantity, 0);

      setCartItems(prev => [
        ...prev,
        {
          productId: combo.id,
          productCode: combo.code,
          productName: combo.name,
          isCombo: true,
          comboId: combo.id,
          comboComponents: components,
          quantity: 1,
          unitPrice: combo.price,
          unitCost: totalCost,
          discountPercentage: selectedClient.discountPercentage || 0
        }
      ]);
      showToast(`Combo "${combo.name}" agregado al carrito`, 'success');
    }
  };

  // Update Item Quantity (with stock check for products and combos)
  const updateQuantity = (itemIndex: number, qty: number) => {
    const targetItem = cartItems[itemIndex];
    if (!targetItem) return;

    if (qty <= 0) {
      setCartItems(prev => prev.filter((_, idx) => idx !== itemIndex));
      return;
    }

    const diff = qty - targetItem.quantity;
    if (diff > 0) {
      if (targetItem.isCombo && targetItem.comboId) {
        const combo = combos.find(c => c.id === targetItem.comboId);
        if (combo) {
          const additionalCanMake = getComboAvailableStockWithCart(combo, selectedWarehouseId, products, cartItems);
          if (additionalCanMake < diff) {
            showToast(`Máximo de combos armables adicionales: ${additionalCanMake}`, 'warning');
            return;
          }
        }
      } else {
        const remaining = getRemainingProductStock(targetItem.productId, selectedWarehouseId, products, cartItems);
        if (remaining < diff) {
          showToast(`Stock adicional máximo disponible: ${remaining}`, 'warning');
          return;
        }
      }
    }

    setCartItems(prev =>
      prev.map((item, idx) => (idx === itemIndex ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (itemIndex: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== itemIndex));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCouponCode(null);
    setCouponCodeInput('');
  };

  // Quick Barcode Scanning / Enter Key in Search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchTerm.trim().toLowerCase();
      if (!query) return;

      // 1. Direct barcode or exact code match in products
      const matchedProd = products.find(
        p => p.isActive && (p.barcode.toLowerCase() === query || p.code.toLowerCase() === query)
      );
      if (matchedProd) {
        addToCart(matchedProd);
        setSearchTerm('');
        showToast(`Producto agregado: ${matchedProd.name}`, 'success');
        return;
      }

      // 2. Direct barcode or exact code match in combos
      const matchedCmb = combos.find(
        c => c.isActive && (c.barcode.toLowerCase() === query || c.code.toLowerCase() === query)
      );
      if (matchedCmb) {
        addComboToCart(matchedCmb);
        setSearchTerm('');
        return;
      }

      // 3. If there is exactly 1 filtered product matching, add it
      if (availableProducts.length === 1 && activeCatalogTab === 'products') {
        addToCart(availableProducts[0]);
        setSearchTerm('');
        showToast(`Producto agregado: ${availableProducts[0].name}`, 'success');
      } else if (availableCombos.length === 1 && activeCatalogTab === 'combos') {
        addComboToCart(availableCombos[0]);
        setSearchTerm('');
      }
    }
  };

  // Apply Coupon Code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCodeInput.trim().toUpperCase();
    if (!clean) return;

    const promo = promotions.find(p => p.code.toUpperCase() === clean);
    if (!promo) {
      showToast('Código promocional no encontrado o no válido', 'error');
      return;
    }
    if (!promo.isActive) {
      showToast('Esta promoción se encuentra inactiva o pausada', 'warning');
      return;
    }
    const today = new Date().toISOString().substring(0, 10);
    if (promo.startDate && today < promo.startDate) {
      showToast(`Esta promoción inicia el ${promo.startDate}`, 'warning');
      return;
    }
    if (promo.endDate && today > promo.endDate) {
      showToast('Esta promoción ha expirado', 'error');
      return;
    }

    setAppliedCouponCode(clean);
    showToast(`¡Cupón "${promo.name}" aplicado!`, 'success');
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponCodeInput('');
    showToast('Cupón removido del carrito', 'info');
  };

  // Split Payment Calculations & Helpers
  const handleUpdateSplitAmount = (id: string, val: number) => {
    const total = cartSummary.total;
    const clamped = Math.max(0, isNaN(val) ? 0 : val);
    setSplitPayments(prev =>
      prev.map(row => {
        if (row.id === id) {
          const pct = total > 0 ? Math.round((clamped / total) * 1000) / 10 : 0;
          return {
            ...row,
            amount: clamped,
            percentage: pct,
            amountReceived: row.method === 'Efectivo' ? (row.amountReceived ? Math.max(row.amountReceived, clamped) : clamped) : undefined
          };
        }
        return row;
      })
    );
  };

  const handleUpdateSplitPercentage = (id: string, pctVal: number) => {
    const total = cartSummary.total;
    const clampedPct = Math.max(0, Math.min(100, isNaN(pctVal) ? 0 : pctVal));
    const newAmt = Math.round(total * (clampedPct / 100) * 100) / 100;
    setSplitPayments(prev =>
      prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            amount: newAmt,
            percentage: clampedPct,
            amountReceived: row.method === 'Efectivo' ? (row.amountReceived ? Math.max(row.amountReceived, newAmt) : newAmt) : undefined
          };
        }
        return row;
      })
    );
  };

  const handleFillRemainder = (id: string) => {
    const total = cartSummary.total;
    const others = splitPayments.filter(r => r.id !== id).reduce((sum, r) => sum + r.amount, 0);
    const rem = Math.max(0, Math.round((total - others) * 100) / 100);
    handleUpdateSplitAmount(id, rem);
  };

  const handleAddSplitRow = () => {
    const total = cartSummary.total;
    const current = splitPayments.reduce((sum, r) => sum + r.amount, 0);
    const rem = Math.max(0, Math.round((total - current) * 100) / 100);
    const pct = total > 0 ? Math.round((rem / total) * 1000) / 10 : 0;
    setSplitPayments(prev => [
      ...prev,
      {
        id: 'sp-' + Date.now(),
        method: 'Transferencia',
        amount: rem,
        percentage: pct,
        reference: ''
      }
    ]);
  };

  const handleRemoveSplitRow = (id: string) => {
    if (splitPayments.length <= 1) return;
    setSplitPayments(prev => prev.filter(r => r.id !== id));
  };

  const handleApplyPreset = (preset: '50-50' | '70-30' | 'equal') => {
    const total = cartSummary.total;
    if (preset === '50-50') {
      const half1 = Math.round(total * 0.5 * 100) / 100;
      const half2 = Math.round((total - half1) * 100) / 100;
      setSplitPayments([
        { id: 'sp-1', method: 'Tarjeta', amount: half1, percentage: 50, reference: '' },
        { id: 'sp-2', method: 'Efectivo', amount: half2, percentage: 50, amountReceived: half2, reference: '' }
      ]);
    } else if (preset === '70-30') {
      const p70 = Math.round(total * 0.7 * 100) / 100;
      const p30 = Math.round((total - p70) * 100) / 100;
      setSplitPayments([
        { id: 'sp-1', method: 'Tarjeta', amount: p70, percentage: 70, reference: '' },
        { id: 'sp-2', method: 'Efectivo', amount: p30, percentage: 30, amountReceived: p30, reference: '' }
      ]);
    } else if (preset === 'equal') {
      const n = splitPayments.length || 2;
      const each = Math.round((total / n) * 100) / 100;
      const eachPct = Math.round((100 / n) * 10) / 10;
      setSplitPayments(prev =>
        prev.map((r, i) => {
          const amt = i === prev.length - 1 ? Math.round((total - each * (n - 1)) * 100) / 100 : each;
          return {
            ...r,
            amount: amt,
            percentage: eachPct,
            amountReceived: r.method === 'Efectivo' ? amt : undefined
          };
        })
      );
    }
  };

  const totalSplitAssigned = splitPayments.reduce((s, r) => s + (r.amount || 0), 0);
  const splitRemainder = Math.round((cartSummary.total - totalSplitAssigned) * 100) / 100;
  const splitChangeTotal = splitPayments.reduce((sum, r) => {
    if (r.method === 'Efectivo' && r.amountReceived && r.amountReceived > r.amount) {
      return sum + (r.amountReceived - r.amount);
    }
    return sum;
  }, 0);

  const pendingContingencyCount = useMemo(() => {
    return sales.filter(s => s.estadoDte === 'CONTINGENCIA').length;
  }, [sales]);

  // Open checkout modal
  const handleOpenCheckout = () => {
    if (cartItems.length === 0) {
      showToast('El carrito de compras está vacío', 'warning');
      return;
    }
    const total = cartSummary.total;
    setAmountReceived(total.toString());
    const half1 = Math.round(total * 0.5 * 100) / 100;
    const half2 = Math.round((total - half1) * 100) / 100;
    setSplitPayments([
      {
        id: 'sp-1',
        method: 'Tarjeta',
        amount: half1,
        percentage: 50,
        reference: ''
      },
      {
        id: 'sp-2',
        method: 'Efectivo',
        amount: half2,
        percentage: 50,
        amountReceived: half2,
        reference: ''
      }
    ]);
    setIsPaymentModalOpen(true);
  };

  // Confirm Sale & Execute Official DTE Transmission Pipeline (Normativa 2.0 MH)
  const executeDteProcess = async (forzarContingencia: boolean = false) => {
    const total = cartSummary.total;
    let finalPaymentMethod: PaymentMethod = paymentMethod;
    let finalAmountPaid = parseFloat(amountReceived) || 0;
    let finalChangeGiven = 0;
    let paymentDetailsToSend: PaymentDetail[] = [];
    let dtePagos: { codigo: string; montoPago: number; referencia?: string }[] = [];

    if (paymentMode === 'split') {
      finalPaymentMethod = 'Mixto';
      if (splitRemainder > 0.05) {
        showToast(`Faltan $${splitRemainder.toFixed(2)} por asignar para cubrir el total de la venta`, 'error');
        return;
      }

      // Check cash received if any cash row
      const cashRows = splitPayments.filter(r => r.method === 'Efectivo');
      for (const cr of cashRows) {
        const cashRec = cr.amountReceived !== undefined ? cr.amountReceived : cr.amount;
        if (cashRec < cr.amount) {
          showToast(`El efectivo recibido ($${cashRec.toFixed(2)}) no puede ser menor a los $${cr.amount.toFixed(2)} requeridos`, 'error');
          return;
        }
      }

      finalChangeGiven = splitChangeTotal;
      finalAmountPaid = totalSplitAssigned + splitChangeTotal;

      paymentDetailsToSend = splitPayments.map(p => ({
        method: p.method,
        amount: Number(p.amount.toFixed(2)),
        percentage: p.percentage,
        amountReceived: p.method === 'Efectivo' ? (p.amountReceived !== undefined ? p.amountReceived : p.amount) : undefined,
        changeGiven: p.method === 'Efectivo' ? Math.max(0, (p.amountReceived || p.amount) - p.amount) : 0,
        reference: p.reference || undefined
      }));

      dtePagos = splitPayments.map(p => ({
        codigo: p.method === 'Tarjeta' ? '02' : p.method === 'Transferencia' ? '05' : '01',
        montoPago: Number(p.amount.toFixed(2)),
        referencia: p.reference || undefined
      }));
    } else {
      // Single payment mode
      if (paymentMethod === 'Efectivo' && finalAmountPaid < total) {
        showToast('El monto recibido no puede ser inferior al total de la venta', 'error');
        return;
      }

      finalChangeGiven = paymentMethod === 'Efectivo' ? Math.max(0, finalAmountPaid - total) : 0;
      paymentDetailsToSend = [
        {
          method: paymentMethod,
          amount: total,
          percentage: 100,
          amountReceived: paymentMethod === 'Efectivo' ? finalAmountPaid : undefined,
          changeGiven: paymentMethod === 'Efectivo' ? finalChangeGiven : 0
        }
      ];

      dtePagos = [
        {
          codigo: paymentMethod === 'Tarjeta' ? '02' : paymentMethod === 'Transferencia' ? '05' : '01',
          montoPago: total
        }
      ];
    }

    if (finalPaymentMethod === 'Crédito') {
      const pendingDebt = selectedClient.currentDebt + total;
      if (selectedClient.creditLimit > 0 && pendingDebt > selectedClient.creditLimit) {
        showToast(
          `Límite de crédito excedido. Disponible: $${(selectedClient.creditLimit - selectedClient.currentDebt).toFixed(2)}`,
          'error'
        );
        return;
      }
    }

    // Regla 5.1: Factura Electrónica >= $200 exige receptor
    if (selectedTipoDte === '01' && total >= 200) {
      if (!clientCustomName || clientCustomName.toLowerCase().includes('consumidor final')) {
        showToast('En ventas >= $200.00 USD, debe especificar el nombre del cliente (Regla 5.1 DGII)', 'error');
        return;
      }
      const cleanDoc = (clientDuiNit || '').replace(/[^0-9kK]/g, '');
      if (!cleanDoc || cleanDoc.length < 8) {
        showToast('En ventas >= $200.00 USD, debe ingresar DUI o NIT del cliente', 'error');
        return;
      }
    }

    // Regla 5.2: Crédito Fiscal exige NIT, NRC y Actividad Económica
    if (selectedTipoDte === '03') {
      if (!clientNrc || clientNrc.trim() === '') {
        showToast('El Crédito Fiscal (CCF) exige el NRC del cliente (Regla 5.2 DGII)', 'error');
        return;
      }
      if (!clientDuiNit || clientDuiNit.trim() === '') {
        showToast('El Crédito Fiscal (CCF) exige el NIT del cliente', 'error');
        return;
      }
      if (!clientActividad) {
        showToast('El Crédito Fiscal exige la Actividad Económica (CAT-019)', 'error');
        return;
      }
    }

    // Open Transmission Pipeline Modal
    setIsTransmissionModalOpen(true);
    setCurrentTransmissionStep('validando');
    setTransmissionLogs([]);
    setIsTransmissionCompleted(false);
    setIsTransmissionContingency(false);
    setTransmissionSello(undefined);
    setTransmissionFh(undefined);
    setTransmissionError(undefined);
    setTransmissionObservaciones(undefined);
    setGeneratedDteDoc(undefined);

    const formattedItems = cartItems.map(item => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      isCombo: item.isCombo,
      comboId: item.comboId,
      comboComponents: item.comboComponents,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      discountPercentage: item.discountPercentage,
      promotionDiscount: promoEvaluation.itemPromotions[item.productId] || 0
    }));

    // Setup input for DTE Service
    const dteInput: SaleDteInput = {
      tipoDte: selectedTipoDte,
      cliente: {
        nombre: clientCustomName || selectedClient.name,
        taxId: clientDuiNit || selectedClient.taxId,
        nrc: clientNrc || selectedClient.nrc,
        codActividad: clientActividad || selectedClient.codActividad,
        descActividad: CATALOGO_ACTIVIDADES_ECONOMICAS.find(a => a.codigo === (clientActividad || selectedClient.codActividad))?.nombre,
        departamento: selectedClient.departamento || companySettings.dteConfig?.departamento || '03',
        municipio: selectedClient.municipio || companySettings.dteConfig?.municipio || '15',
        direccion: selectedClient.address,
        telefono: selectedClient.phone,
        correo: selectedClient.email,
        esGranContribuyente: clientEsGranContribuyente
      },
      items: cartItems.map(it => ({
        codigo: it.productCode,
        descripcion: it.productName,
        cantidad: it.quantity,
        precioUnitario: it.unitPrice,
        descuento: it.discountPercentage > 0 ? it.unitPrice * (it.discountPercentage / 100) * it.quantity : 0,
        esGravado: true
      })),
      correlativo: 1000 + (sales?.length || 0) + 1,
      condicionOperacion: finalPaymentMethod === 'Crédito' ? 2 : 1,
      tipoPagoCodigo: finalPaymentMethod === 'Tarjeta' ? '02' : finalPaymentMethod === 'Transferencia' ? '05' : '01',
      pagos: dtePagos,
      forzarContingencia
    };

    try {
      const result = await DteService.emitirDte(
        companySettings.dteConfig,
        dteInput,
        stepLog => {
          setCurrentTransmissionStep(stepLog.step);
          setTransmissionLogs(prev => [...prev, stepLog]);
        }
      );

      if (!result.success && !result.isContingency) {
        setTransmissionError(result.error || 'Error al emitir DTE');
        setTransmissionObservaciones(result.observaciones);
        return;
      }

      setGeneratedDteDoc(result.dteDocument);
      setTransmissionSello(result.selloRecibido);
      setTransmissionFh(result.fhProcesamiento);

      if (result.isContingency) {
        setIsTransmissionContingency(true);
      } else {
        setIsTransmissionCompleted(true);
      }

      // Persist the official Sale
      const created = createSale({
        clientId: selectedClientId,
        warehouseId: selectedWarehouseId,
        items: formattedItems,
        paymentMethod: finalPaymentMethod,
        paymentDetails: paymentDetailsToSend,
        amountPaid: finalPaymentMethod === 'Crédito' ? 0 : finalAmountPaid,
        changeGiven: finalChangeGiven,
        paymentStatus: finalPaymentMethod === 'Crédito' ? 'PENDIENTE' : 'PAGADO',
        dueDate: finalPaymentMethod === 'Crédito' ? creditDueDate : undefined,
        appliedPromotions: promoEvaluation.appliedPromotions,
        promotionDiscountTotal: promoEvaluation.totalPromoDiscount,

        // Official DTE 2.0 metadata
        dteType: selectedTipoDte,
        codigoGeneracion: result.dteDocument.identificacion.codigoGeneracion,
        numeroControl: result.dteDocument.identificacion.numeroControl,
        selloRecibido: result.selloRecibido,
        fhProcesamiento: result.fhProcesamiento,
        estadoDte: result.isContingency ? 'CONTINGENCIA' : 'PROCESADO',
        tipoModelo: result.dteDocument.identificacion.tipoModelo,
        dteJsonRaw: JSON.stringify(result.dteDocument),
        signedJws: result.signedJws,
        retencionIva1: result.dteDocument.resumen.ivaRete1
      });

      setPendingSale(created);
      setIsPaymentModalOpen(false);
      clearCart();
    } catch (err: any) {
      setTransmissionError(err.message || 'Error inesperado durante la transmisión con Hacienda');
    }
  };

  // Permite emitir el ticket de compra aún cuando la transmisión con Hacienda arroje error
  const handlePrintTicketOnError = () => {
    if (pendingSale) {
      setSelectedSaleForTicket(pendingSale);
      setIsTransmissionModalOpen(false);
      return;
    }

    if (cartItems.length === 0) {
      setIsTransmissionModalOpen(false);
      return;
    }

    const total = cartSummary.total;
    let finalPaymentMethod: PaymentMethod = paymentMethod;
    let finalAmountPaid = parseFloat(amountReceived) || 0;
    let finalChangeGiven = 0;
    let paymentDetailsToSend: PaymentDetail[] = [];

    if (paymentMode === 'split') {
      finalPaymentMethod = 'Mixto';
      finalChangeGiven = splitChangeTotal;
      finalAmountPaid = totalSplitAssigned + splitChangeTotal;
      paymentDetailsToSend = splitPayments.map(p => ({
        method: p.method,
        amount: Number(p.amount.toFixed(2)),
        percentage: p.percentage,
        amountReceived: p.method === 'Efectivo' ? (p.amountReceived !== undefined ? p.amountReceived : p.amount) : undefined,
        changeGiven: p.method === 'Efectivo' ? Math.max(0, (p.amountReceived || p.amount) - p.amount) : 0,
        reference: p.reference || undefined
      }));
    } else {
      finalChangeGiven = paymentMethod === 'Efectivo' ? Math.max(0, finalAmountPaid - total) : 0;
      paymentDetailsToSend = [
        {
          method: paymentMethod,
          amount: total,
          percentage: 100,
          amountReceived: paymentMethod === 'Efectivo' ? finalAmountPaid : undefined,
          changeGiven: paymentMethod === 'Efectivo' ? finalChangeGiven : 0
        }
      ];
    }

    const formattedItems = cartItems.map(item => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      isCombo: item.isCombo,
      comboId: item.comboId,
      comboComponents: item.comboComponents,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitCost: item.unitCost,
      discountPercentage: item.discountPercentage,
      promotionDiscount: promoEvaluation.itemPromotions[item.productId] || 0
    }));

    const codGen = generatedDteDoc?.identificacion?.codigoGeneracion || generateCodigoGeneracion();
    const correlativo = 1000 + (sales?.length || 0) + 1;
    const numControl = generatedDteDoc?.identificacion?.numeroControl ||
      generateNumeroControl(
        selectedTipoDte,
        companySettings.dteConfig?.tipoEstablecimiento || 'M',
        companySettings.dteConfig?.codEstablecimiento || '001',
        companySettings.dteConfig?.codPuntoVenta || '001',
        correlativo
      );
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const created = createSale({
      clientId: selectedClientId,
      warehouseId: selectedWarehouseId,
      items: formattedItems,
      paymentMethod: finalPaymentMethod,
      paymentDetails: paymentDetailsToSend,
      amountPaid: finalPaymentMethod === 'Crédito' ? 0 : finalAmountPaid,
      changeGiven: finalChangeGiven,
      paymentStatus: finalPaymentMethod === 'Crédito' ? 'PENDIENTE' : 'PAGADO',
      dueDate: finalPaymentMethod === 'Crédito' ? creditDueDate : undefined,
      appliedPromotions: promoEvaluation.appliedPromotions,
      promotionDiscountTotal: promoEvaluation.totalPromoDiscount,

      // Official DTE 2.0 metadata resguardado en Contingencia
      dteType: selectedTipoDte,
      codigoGeneracion: codGen,
      numeroControl: numControl,
      selloRecibido: undefined,
      fhProcesamiento: nowIso,
      estadoDte: 'CONTINGENCIA',
      tipoModelo: 2,
      dteJsonRaw: generatedDteDoc
        ? JSON.stringify({
            ...generatedDteDoc,
            identificacion: {
              ...generatedDteDoc.identificacion,
              tipoModelo: 2,
              tipoOperacion: 2
            }
          })
        : undefined,
      signedJws: undefined,
      retencionIva1:
        selectedTipoDte === '03' && clientEsGranContribuyente && cartSummary.total >= 100
          ? Number((cartSummary.total * 0.01).toFixed(2))
          : 0
    });

    setPendingSale(created);
    setIsTransmissionModalOpen(false);
    setIsPaymentModalOpen(false);
    clearCart();
    setSelectedSaleForTicket(created);
    showToast('¡Ticket emitido! La venta quedó resguardada en Contingencia para su retransmisión.', 'success');
  };

  const handleProcessSale = () => {
    executeDteProcess(false);
  };

  const changeToGive = Math.max(0, (parseFloat(amountReceived) || 0) - cartSummary.total);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
      {/* LEFT: Product Catalog, Combos & Deals */}
      <div className="flex-1 flex flex-col min-w-0 bg-white border border-slate-200 rounded-xl p-4 shadow-xs overflow-hidden">
        {/* Contingency Notification Banner */}
        {pendingContingencyCount > 0 && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                Hay <b>{pendingContingencyCount}</b> documento(s) DTE emitidos en contingencia pendientes de retransmitir a Hacienda.
              </span>
            </div>
            <button
              onClick={() => setCurrentModule('sales-dte')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="h-3 w-3" />
              <span>Ver y Retransmitir DTEs</span>
            </button>
          </div>
        )}

        {/* Top Controls: Search, Warehouse & Tabs */}
        <div className="space-y-3 pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Punto de Venta / Terminal de Facturación (POS)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Vende productos individuales, combos empaquetados o canjea promociones y cupones.
              </p>
            </div>

            {/* Warehouse Dispatch Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <WarehouseIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Despachar de:</span>
              <select
                value={selectedWarehouseId}
                onChange={e => setSelectedWarehouseId(e.target.value)}
                className="py-1 px-2 font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-xs cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Segment Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCatalogTab('products')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCatalogTab === 'products'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>📦 Todos los Productos</span>
              <span className="text-[10px] opacity-75 font-mono">({products.length})</span>
            </button>

            <button
              onClick={() => setActiveCatalogTab('combos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCatalogTab === 'combos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>🎁 Combos y Paquetes</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">
                {activeCombos.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCatalogTab('promotions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeCatalogTab === 'promotions'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-100'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>🏷️ Promociones Activas</span>
              <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">
                {promotions.filter(p => p.isActive).length}
              </span>
            </button>
          </div>

          {/* Search Bar & Barcode Scanner */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={
                activeCatalogTab === 'combos'
                  ? 'Buscar combos por nombre, código CMB o presiona Enter...'
                  : activeCatalogTab === 'promotions'
                  ? 'Buscar promociones y cupones disponibles...'
                  : 'Buscar por nombre, código PRD o escanear código de barra (Enter)...'
              }
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cash Drawer Status Alert Banner for Cashier UX */}
          {!activeCashSession && (
            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <b>Turno de caja cerrado:</b> Se aconseja realizar la apertura de turno con fondo inicial antes de realizar cobros en efectivo.
                </span>
              </div>
              <button
                onClick={() => setCurrentModule('cash-open')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                Abrir Caja Ahora
              </button>
            </div>
          )}

          {/* Category Tabs for Products */}
          {activeCatalogTab === 'products' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas las categorías
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Panel based on Active Catalog Tab */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1">
          {/* TAB 1: Standard Products */}
          {activeCatalogTab === 'products' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {availableProducts.map(product => {
                const currentStock = product.warehouseStock[selectedWarehouseId] || 0;
                const isOutOfStock = currentStock <= 0;
                const isLowStock = currentStock <= product.minStock;
                const promoBadge = getProductPromotionBadge(product.id, product.categoryId);

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm'
                    }`}
                  >
                    {/* Promo badge if product has discount rule */}
                    {promoBadge && (
                      <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide bg-pink-600 text-white shadow-xs">
                        {promoBadge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>{product.code}</span>
                        <span className="text-slate-500 font-sans">{product.brand}</span>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Precio</span>
                        <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono tabular-nums font-semibold block ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Agotado' : `${currentStock} en stock`}
                        </span>
                        <span className="text-[9px] text-slate-400">+{product.taxRate}% IVA</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 2: Combos & Bundles */}
          {activeCatalogTab === 'combos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {availableCombos.map(combo => {
                const availableStock = getComboAvailableStock(combo, selectedWarehouseId, products);
                const isOutOfStock = availableStock <= 0;

                return (
                  <div
                    key={combo.id}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all ${
                      isOutOfStock
                        ? 'opacity-60 bg-slate-50 border-slate-200'
                        : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {combo.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                          Ahorras ${combo.discountAmount.toFixed(2)} (-{combo.discountPercentage}%)
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{combo.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {combo.description}
                      </p>

                      {/* Components Preview */}
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          Incluye en el paquete:
                        </span>
                        {combo.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-700">
                            <span className="truncate pr-2">
                              <b>{it.quantity}x</b> {it.productName}
                            </span>
                            <span className="font-mono text-slate-400 shrink-0">
                              ${(it.regularUnitPrice * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 line-through block">
                          ${combo.originalTotal.toFixed(2)}
                        </span>
                        <span className="text-base font-black font-mono text-indigo-700 tabular-nums">
                          ${combo.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold block ${
                            availableStock > 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {availableStock > 0
                            ? `${availableStock} combos armables`
                            : 'Sin stock de componentes'}
                        </span>
                      </div>

                      <button
                        onClick={() => addComboToCart(combo)}
                        disabled={isOutOfStock}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar Combo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Active Promotions & Coupons */}
          {activeCatalogTab === 'promotions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {promotions.map(promo => {
                const today = new Date().toISOString().substring(0, 10);
                const isCurrent =
                  promo.isActive &&
                  (!promo.startDate || today >= promo.startDate) &&
                  (!promo.endDate || today <= promo.endDate);

                return (
                  <div
                    key={promo.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-linear-to-br from-pink-50/50 via-white to-amber-50/30 border-pink-200'
                        : 'opacity-50 bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-pink-100 text-pink-800">
                        {promo.code}
                      </span>
                      {promo.autoApply ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Zap className="h-3 w-3 fill-amber-500" />
                          Auto en Carrito
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setAppliedCouponCode(promo.code);
                            showToast(`Cupón ${promo.code} activado`, 'success');
                          }}
                          className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md hover:bg-indigo-100 cursor-pointer"
                        >
                          Usar este cupón
                        </button>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{promo.name}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{promo.description}</p>

                    <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                      {promo.minPurchaseAmount && (
                        <div>• Mínimo de compra requerido: ${promo.minPurchaseAmount.toFixed(2)}</div>
                      )}
                      <div>• Vigencia: {promo.startDate} al {promo.endDate}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {activeCatalogTab === 'products' && availableProducts.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          )}
          {activeCatalogTab === 'combos' && availableCombos.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No se encontraron combos o paquetes en este almacén.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Shopping Cart & Checkout Panel */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Cart Header & Client Selection */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Carrito de Venta</span>
              <span className="text-xs font-mono text-slate-500">
                ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Vaciar carrito"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Client Selector (RF-023 / RF-027) */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3 text-slate-400" />
                <span>Cliente:</span>
              </span>
              {selectedClient.discountPercentage > 0 && (
                <span className="text-emerald-700 font-semibold text-[10px]">
                  Desc. fidelidad {selectedClient.discountPercentage}%
                </span>
              )}
            </div>
            <select
              value={selectedClientId}
              onChange={e => {
                const nextId = e.target.value;
                setSelectedClientId(nextId);
                const nextClient = clients.find(c => c.id === nextId);
                if (nextClient && nextClient.discountPercentage > 0) {
                  setCartItems(prev =>
                    prev.map(item => ({
                      ...item,
                      discountPercentage: nextClient.discountPercentage
                    }))
                  );
                }
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Promotion Banner if auto-applied or coupon is active */}
        {promoEvaluation.appliedPromotions.length > 0 && (
          <div className="p-2.5 bg-linear-to-r from-pink-50 to-amber-50 border-b border-pink-200 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-pink-700 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-600" />
                <span>¡Promociones Aplicadas!</span>
              </span>
              <span className="font-mono font-bold text-pink-700">
                -${promoEvaluation.totalPromoDiscount.toFixed(2)}
              </span>
            </div>
            <div className="space-y-0.5">
              {promoEvaluation.appliedPromotions.map((ap, idx) => (
                <div key={idx} className="flex justify-between text-[10px] text-slate-600">
                  <span className="truncate pr-1">• {ap.name}:</span>
                  <span className="font-semibold text-emerald-700 shrink-0">
                    -${ap.discountAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupon code input field */}
        <div className="p-2.5 border-b border-slate-100 bg-white">
          {appliedCouponCode ? (
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-xs">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-pink-600" />
                <span className="text-[11px] text-slate-600">Cupón activo:</span>
                <span className="font-mono font-bold text-pink-700">{appliedCouponCode}</span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold"
              >
                Quitar
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Código de cupón o promoción..."
                value={couponCodeInput}
                onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                className="flex-1 py-1 px-2.5 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                Canjear
              </button>
            </form>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {cartItems.map((item, idx) => {
            const lineTotal = item.unitPrice * item.quantity * (1 - item.discountPercentage / 100);

            return (
              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.isCombo ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          COMBO
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-mono">
                          {item.productCode}
                        </span>
                      )}
                      <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                    </div>

                    {/* If combo, list component preview */}
                    {item.isCombo && item.comboComponents && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Incluye: {item.comboComponents.map(c => `${c.quantity}x ${c.productName}`).join(', ')}
                      </p>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono block">
                      ${item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>

                  <span className="font-mono font-bold text-slate-900 tabular-nums shrink-0">
                    ${lineTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2.5 text-xs font-mono font-bold text-slate-900 tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove action */}
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {cartItems.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <ShoppingCart className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-xs">El carrito está vacío</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Selecciona productos o combos para comenzar la venta.
              </p>
            </div>
          )}
        </div>

        {/* Totals & Checkout Button */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal regular:</span>
            <span className="font-mono tabular-nums">${cartSummary.grossSubtotal.toFixed(2)}</span>
          </div>

          {cartSummary.promoDiscount > 0 && (
            <div className="flex justify-between text-pink-700 font-medium">
              <span>Descuento de Promociones / Cupones:</span>
              <span className="font-mono tabular-nums">-${cartSummary.promoDiscount.toFixed(2)}</span>
            </div>
          )}

          {cartSummary.clientDiscount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Descuento Cliente:</span>
              <span className="font-mono tabular-nums">-${cartSummary.clientDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-500">
            <span>
              {companySettings.taxName} ({companySettings.defaultTaxRate}%):
            </span>
            <span className="font-mono tabular-nums">${cartSummary.tax.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <div>
              <span className="text-sm font-bold text-slate-900 block">TOTAL:</span>
              {cartSummary.totalDiscount > 0 && (
                <span className="text-[10px] text-emerald-600 font-semibold">
                  Ahorro total de ${cartSummary.totalDiscount.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-xl font-bold font-mono text-slate-950 tabular-nums">
              ${cartSummary.total.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleOpenCheckout}
            disabled={cartItems.length === 0}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              cartItems.length === 0
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <span>Cobrar Venta</span>
            <span className="font-mono tabular-nums">${cartSummary.total.toFixed(2)}</span>
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL (RF-047, RF-050) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Finalizar Cobro y Emisión de Ticket</h3>
                <p className="text-[11px] text-slate-500">Total a cobrar: ${cartSummary.total.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Selector de Tipo de Documento DTE (Normativa 2.0 MH) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Tipo de Documento Tributario (DTE)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Ambiente: {companySettings.dteConfig?.ambiente === '01' ? 'Producción (01)' : 'Pruebas (00)'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTipoDte('01')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTipoDte === '01'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Factura Electrónica</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800">
                        01
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Consumidor final (IVA 13% incluido)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTipoDte('03')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTipoDte === '03'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">Crédito Fiscal (CCF)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-100 text-indigo-800">
                        03
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Empresas con NRC y Actividad</p>
                  </button>
                </div>
              </div>

              {/* Regla 5.1: Factura >= $200 exige DUI/NIT y Nombre */}
              {selectedTipoDte === '01' && cartSummary.total >= 200 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Venta ≥ $200.00 USD: Identificación obligatoria (Regla 5.1 DGII)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                        Nombre Completo del Cliente *
                      </label>
                      <input
                        type="text"
                        value={clientCustomName}
                        onChange={e => setClientCustomName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-amber-900 mb-0.5">
                        Documento (DUI o NIT) *
                      </label>
                      <input
                        type="text"
                        value={clientDuiNit}
                        onChange={e => setClientDuiNit(e.target.value)}
                        placeholder="01234567-8"
                        className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Regla 5.2: Campos Obligatorios para Crédito Fiscal (03) */}
              {selectedTipoDte === '03' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-indigo-200 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-indigo-900 font-bold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-indigo-600" />
                      <span>Datos Fiscales del Contribuyente (CCF)</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-normal">Requisitos DGII</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        NIT del Contribuyente *
                      </label>
                      <input
                        type="text"
                        value={clientDuiNit}
                        onChange={e => setClientDuiNit(e.target.value)}
                        placeholder="0614-XXXXXX-XXX-X"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        NRC (Registro Contribuyente) *
                      </label>
                      <input
                        type="text"
                        value={clientNrc}
                        onChange={e => setClientNrc(e.target.value)}
                        placeholder="123456-7"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Actividad Económica (CAT-019) *
                    </label>
                    <select
                      value={clientActividad}
                      onChange={e => setClientActividad(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs truncate"
                    >
                      {CATALOGO_ACTIVIDADES_ECONOMICAS.map(act => (
                        <option key={act.codigo} value={act.codigo}>
                          {act.codigo} - {act.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={clientEsGranContribuyente}
                      onChange={e => setClientEsGranContribuyente(e.target.checked)}
                      className="rounded text-indigo-600 h-3.5 w-3.5"
                    />
                    <span className="text-[11px] text-slate-700">
                      Es Gran Contribuyente (Aplica retención 1% IVA si monto gravado ≥ $100.00)
                    </span>
                  </label>
                </div>
              )}

              {/* Selector de Modo de Pago: Único vs Múltiples Formas / Dividido */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Modalidad de Pago
                  </label>
                  <span className="text-[10px] text-blue-900 font-semibold">
                    Total: ${cartSummary.total.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('single')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMode === 'single'
                        ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Pago Único</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('split')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      paymentMode === 'split'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Múltiples Formas (Dividido)</span>
                  </button>
                </div>
              </div>

              {/* MODO 1: PAGO ÚNICO */}
              {paymentMode === 'single' && (
                <>
                  {/* Payment Methods */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Efectivo', 'Tarjeta', 'Transferencia', 'Crédito'] as PaymentMethod[]).map(
                        method => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(method);
                              if (method !== 'Efectivo') {
                                setAmountReceived(cartSummary.total.toString());
                              }
                            }}
                            className={`py-2 px-3 rounded-lg border text-left font-medium transition-all cursor-pointer ${
                              paymentMethod === method
                                ? 'bg-blue-50 border-blue-700 text-blue-950 font-bold ring-1 ring-blue-700'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {method}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Cash Denominations and Change calculation */}
                  {paymentMethod === 'Efectivo' && (
                    <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Efectivo Recibido ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={amountReceived}
                          onChange={e => setAmountReceived(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      {/* Quick bill selectors */}
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setAmountReceived(cartSummary.total.toFixed(2))}
                          className="py-1 px-2.5 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-md text-[11px] font-mono hover:bg-blue-100 cursor-pointer"
                        >
                          Exacto (${cartSummary.total.toFixed(2)})
                        </button>
                        {[5, 10, 20, 50, 100].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setAmountReceived(amt.toFixed(2))}
                            className="py-1 px-2.5 bg-white border border-slate-200 rounded-md text-[11px] font-mono hover:bg-slate-100 text-slate-700 cursor-pointer"
                          >
                            ${amt.toFixed(2)}
                          </button>
                        ))}
                      </div>

                      {/* Change output */}
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="font-semibold text-slate-600">Cambio / Vuelto:</span>
                        <span
                          className={`text-base font-bold font-mono tabular-nums ${
                            changeToGive >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          ${changeToGive.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Credit details */}
                  {paymentMethod === 'Crédito' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        <span>Venta al Crédito (Cuentas por Cobrar)</span>
                      </div>
                      <p className="text-[11px] text-amber-700">
                        Cliente: <b>{selectedClient.name}</b>. Deuda actual: $
                        {selectedClient.currentDebt.toFixed(2)} / Límite: $
                        {selectedClient.creditLimit.toFixed(2)}
                      </p>
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-900 mb-1">
                          Fecha de Vencimiento de Pago
                        </label>
                        <input
                          type="date"
                          value={creditDueDate}
                          onChange={e => setCreditDueDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* MODO 2: PAGO DIVIDIDO / MÚLTIPLES FORMAS DE PAGO */}
              {paymentMode === 'split' && (
                <div className="space-y-3 p-3 bg-slate-50/80 rounded-xl border border-blue-200 animate-in fade-in">
                  {/* Presets and Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <span className="text-[11px] font-bold text-slate-800">
                      Distribución de Pagos (% o Cantidad):
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('50-50')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="50% Tarjeta y 50% Efectivo"
                      >
                        50% / 50%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('70-30')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="70% Tarjeta y 30% Efectivo"
                      >
                        70% / 30%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset('equal')}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Partes iguales entre las formas configuradas"
                      >
                        Partes Iguales
                      </button>
                    </div>
                  </div>

                  {/* Payment Rows */}
                  <div className="space-y-2.5">
                    {splitPayments.map((row, idx) => (
                      <div
                        key={row.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <select
                              value={row.method}
                              onChange={e => {
                                const newMethod = e.target.value as PaymentMethod;
                                setSplitPayments(prev =>
                                  prev.map(r =>
                                    r.id === row.id
                                      ? {
                                          ...r,
                                          method: newMethod,
                                          amountReceived: newMethod === 'Efectivo' ? r.amount : undefined
                                        }
                                      : r
                                  )
                                );
                              }}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 cursor-pointer"
                            >
                              <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Transferencia">Transferencia Bancaria</option>
                              <option value="Crédito">Crédito</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFillRemainder(row.id)}
                              className="px-2 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 cursor-pointer"
                              title="Asignar el saldo restante a esta forma de pago"
                            >
                              Saldar Resto
                            </button>
                            {splitPayments.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSplitRow(row.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Eliminar fila"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Amount and Percentage synchronized inputs */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                              Monto a Pagar ($)
                            </label>
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={row.amount}
                                onChange={e => handleUpdateSplitAmount(row.id, parseFloat(e.target.value) || 0)}
                                className="w-full pl-6 pr-2 py-1 text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium mb-0.5">
                              Porcentaje (%)
                            </label>
                            <div className="relative">
                              <span className="absolute right-2.5 top-1.5 text-slate-400 font-mono text-xs">%</span>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={row.percentage}
                                onChange={e => handleUpdateSplitPercentage(row.id, parseFloat(e.target.value) || 0)}
                                className="w-full pl-2 pr-6 py-1 text-xs font-bold font-mono bg-slate-50 border border-slate-300 rounded-lg text-right"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Extra field for cash handed to calculate change for the cash part */}
                        {row.method === 'Efectivo' && (
                          <div className="pt-1 border-t border-dashed border-slate-200 flex items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[10px]">Entregó cliente:</span>
                              <input
                                type="number"
                                step="0.01"
                                value={row.amountReceived !== undefined ? row.amountReceived : row.amount}
                                onChange={e => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setSplitPayments(prev =>
                                    prev.map(r => (r.id === row.id ? { ...r, amountReceived: val } : r))
                                  );
                                }}
                                className="w-20 px-1.5 py-0.5 text-xs font-mono font-bold bg-amber-50/60 border border-amber-300 rounded"
                              />
                            </div>
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              Vuelto:{' '}
                              <b>
                                $
                                {Math.max(
                                  0,
                                  (row.amountReceived !== undefined ? row.amountReceived : row.amount) - row.amount
                                ).toFixed(2)}
                              </b>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Row Button */}
                  <button
                    type="button"
                    onClick={handleAddSplitRow}
                    className="w-full py-1.5 border border-dashed border-blue-400 text-blue-900 rounded-xl font-bold text-[11px] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Agregar otra forma de pago</span>
                  </button>

                  {/* Live Progress & Summary */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Venta:</span>
                      <span className="font-mono font-bold">${cartSummary.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-700">
                      <span>Total Asignado:</span>
                      <span className="font-mono font-bold text-blue-900">
                        ${totalSplitAssigned.toFixed(2)} ({cartSummary.total > 0 ? ((totalSplitAssigned / cartSummary.total) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>

                    {/* Balance / Remainder */}
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span>Faltante por cubrir:</span>
                      <span
                        className={`font-mono font-bold ${
                          Math.abs(splitRemainder) <= 0.05
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {Math.abs(splitRemainder) <= 0.05 ? '✓ Cubierto 100%' : `$${splitRemainder.toFixed(2)}`}
                      </span>
                    </div>

                    {splitChangeTotal > 0 && (
                      <div className="flex justify-between items-center text-emerald-800 font-semibold">
                        <span>Total Cambio a Devolver:</span>
                        <span className="font-mono font-bold text-xs">${splitChangeTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Confirm & Transmit */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessSale}
                  disabled={paymentMode === 'split' && splitRemainder > 0.05}
                  className={`flex-1 py-2.5 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    paymentMode === 'split' && splitRemainder > 0.05
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-blue-900 hover:bg-blue-800'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Transmitir y Emitir Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DTE TRANSMISSION PIPELINE MODAL (Sección 2 y 7 de la Normativa) */}
      <DteTransmissionModal
        isOpen={isTransmissionModalOpen}
        tipoDteNombre={selectedTipoDte === '03' ? 'Comprobante de Crédito Fiscal Electrónico (03)' : 'Factura Electrónica (01)'}
        clientName={clientCustomName || selectedClient.name}
        totalMonto={cartSummary.total}
        currentStep={currentTransmissionStep}
        logs={transmissionLogs}
        isCompleted={isTransmissionCompleted}
        isContingency={isTransmissionContingency}
        selloRecibido={transmissionSello}
        fhProcesamiento={transmissionFh}
        errorMessage={transmissionError}
        observaciones={transmissionObservaciones}
        dteDocument={generatedDteDoc}
        onRetry={() => executeDteProcess(false)}
        onSwitchToContingency={() => executeDteProcess(true)}
        onPrintTicketOnError={handlePrintTicketOnError}
        onClose={() => setIsTransmissionModalOpen(false)}
        onViewTicket={() => {
          setIsTransmissionModalOpen(false);
          if (pendingSale) {
            setSelectedSaleForTicket(pendingSale);
          }
        }}
      />
    </div>
  );
};
