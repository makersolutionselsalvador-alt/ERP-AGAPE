import { Product, Combo, Promotion, AppliedPromotion } from '../types';

/**
 * Calculates how many units of a combo can be assembled based on available component stock in a warehouse.
 */
export function getComboAvailableStock(
  combo: Combo,
  warehouseId: string,
  products: Product[]
): number {
  if (!combo.items || combo.items.length === 0) return 0;

  let minAssembled = Infinity;
  for (const comp of combo.items) {
    const prod = products.find(p => p.id === comp.productId);
    const stock = prod?.warehouseStock[warehouseId] || 0;
    const canMake = Math.floor(stock / comp.quantity);
    if (canMake < minAssembled) {
      minAssembled = canMake;
    }
  }

  return minAssembled === Infinity ? 0 : Math.max(0, minAssembled);
}

/**
 * Identifies the bottleneck component product limiting a combo's assemble quantity.
 */
export function getComboBottleneckComponent(
  combo: Combo,
  warehouseId: string,
  products: Product[]
): { componentName: string; availableUnits: number; unitsRequired: number } | null {
  if (!combo.items || combo.items.length === 0) return null;

  let minAssembled = Infinity;
  let bottleneck: { componentName: string; availableUnits: number; unitsRequired: number } | null = null;

  for (const comp of combo.items) {
    const prod = products.find(p => p.id === comp.productId);
    const stock = prod?.warehouseStock[warehouseId] || 0;
    const canMake = Math.floor(stock / comp.quantity);
    if (canMake < minAssembled) {
      minAssembled = canMake;
      bottleneck = {
        componentName: comp.productName,
        availableUnits: stock,
        unitsRequired: comp.quantity
      };
    }
  }

  return bottleneck;
}

/**
 * Calculates remaining available stock of a product after accounting for units already reserved in cart.
 */
export function getRemainingProductStock(
  productId: string,
  warehouseId: string,
  products: Product[],
  cartItems: CartItemForPromo[]
): number {
  const prod = products.find(p => p.id === productId);
  if (!prod) return 0;
  const rawStock = prod.warehouseStock[warehouseId] || 0;

  // Subtract units allocated to individual products
  let allocated = 0;
  cartItems.forEach(item => {
    if (!item.isCombo && item.productId === productId) {
      allocated += item.quantity;
    } else if (item.isCombo && item.comboComponents) {
      const comp = item.comboComponents.find(c => c.productId === productId);
      if (comp) {
        allocated += comp.quantity * item.quantity;
      }
    }
  });

  return Math.max(0, rawStock - allocated);
}

/**
 * Calculates how many additional units of a combo can be added taking into account units already reserved in cart.
 */
export function getComboAvailableStockWithCart(
  combo: Combo,
  warehouseId: string,
  products: Product[],
  cartItems: CartItemForPromo[]
): number {
  if (!combo.items || combo.items.length === 0) return 0;

  let minAssembled = Infinity;
  for (const comp of combo.items) {
    const remaining = getRemainingProductStock(comp.productId, warehouseId, products, cartItems);
    const canMake = Math.floor(remaining / comp.quantity);
    if (canMake < minAssembled) {
      minAssembled = canMake;
    }
  }

  return minAssembled === Infinity ? 0 : Math.max(0, minAssembled);
}

export interface CartItemForPromo {
  productId: string;
  isCombo?: boolean;
  comboId?: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discountPercentage: number;
  comboComponents?: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
}

export interface PromoEvaluationResult {
  appliedPromotions: AppliedPromotion[];
  itemPromotions: Record<string, number>; // key -> discount amount
  totalPromoDiscount: number;
  matchedPromotions: Promotion[];
}

/**
 * Evaluates active promotions against current cart items, client, and manual coupon code.
 */
export function evaluateCartPromotions(params: {
  cartItems: CartItemForPromo[];
  products: Product[];
  combos: Combo[];
  promotions: Promotion[];
  couponCode?: string;
  todayDateStr?: string;
}): PromoEvaluationResult {
  const { cartItems, products, promotions, couponCode } = params;
  const today = params.todayDateStr || new Date().toISOString().substring(0, 10);

  const appliedPromotions: AppliedPromotion[] = [];
  const itemPromotions: Record<string, number> = {};
  const matchedPromotions: Promotion[] = [];
  let totalPromoDiscount = 0;

  if (cartItems.length === 0) {
    return { appliedPromotions, itemPromotions, totalPromoDiscount: 0, matchedPromotions };
  }

  // Calculate gross subtotal of the cart
  const grossSubtotal = cartItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  // Normalize coupon code
  const cleanCoupon = (couponCode || '').trim().toUpperCase();

  // Filter valid promotions (Active and within date range)
  const candidatePromotions = promotions.filter(promo => {
    if (!promo.isActive) return false;
    if (promo.startDate && today < promo.startDate) return false;
    if (promo.endDate && today > promo.endDate) return false;
    if (promo.usageLimit != null && promo.usageCount >= promo.usageLimit) return false;

    // Check if auto-applied or matches manual coupon
    if (promo.autoApply) return true;
    if (cleanCoupon && promo.code.toUpperCase() === cleanCoupon) return true;

    return false;
  });

  // Evaluate each candidate promo
  for (const promo of candidatePromotions) {
    let promoDiscount = 0;
    let isMatched = false;

    // Check min purchase amount condition
    if (promo.minPurchaseAmount && grossSubtotal < promo.minPurchaseAmount) {
      continue;
    }

    switch (promo.target) {
      case 'TODO_CARRITO': {
        if (promo.type === 'PORCENTAJE') {
          promoDiscount = Math.round(grossSubtotal * (promo.discountValue / 100) * 100) / 100;
          isMatched = promoDiscount > 0;
        } else if (promo.type === 'MONTO_FIJO') {
          promoDiscount = Math.min(grossSubtotal, promo.discountValue);
          isMatched = promoDiscount > 0;
        } else if (promo.type === 'DESCUENTO_ESCALONADO') {
          // Tiered discount on cart
          promoDiscount = Math.round(grossSubtotal * (promo.discountValue / 100) * 100) / 100;
          isMatched = promoDiscount > 0;
        }
        break;
      }

      case 'PRODUCTO': {
        // Find matching product items in cart
        const matchingItems = cartItems.filter(
          item => !item.isCombo && item.productId === promo.targetId
        );

        if (matchingItems.length > 0) {
          for (const item of matchingItems) {
            if (promo.minQuantity && item.quantity < promo.minQuantity) {
              continue;
            }

            let itemDiscount = 0;
            if (promo.type === 'DOS_POR_UNO') {
              // 2x1 promo: for every 2 items, 1 is free (50% off pairs)
              const freeUnits = Math.floor(item.quantity / 2);
              itemDiscount = freeUnits * item.unitPrice;
            } else if (promo.type === 'PORCENTAJE') {
              itemDiscount = item.unitPrice * item.quantity * (promo.discountValue / 100);
            } else if (promo.type === 'MONTO_FIJO') {
              itemDiscount = Math.min(promo.discountValue * item.quantity, item.unitPrice * item.quantity);
            }

            if (itemDiscount > 0) {
              itemDiscount = Math.round(itemDiscount * 100) / 100;
              itemPromotions[item.productId] = (itemPromotions[item.productId] || 0) + itemDiscount;
              promoDiscount += itemDiscount;
              isMatched = true;
            }
          }
        }
        break;
      }

      case 'CATEGORIA': {
        // Find items belonging to category
        for (const item of cartItems) {
          if (item.isCombo) continue;
          const prod = products.find(p => p.id === item.productId);
          if (prod && prod.categoryId === promo.targetId) {
            let itemDiscount = 0;
            if (promo.type === 'PORCENTAJE') {
              itemDiscount = item.unitPrice * item.quantity * (promo.discountValue / 100);
            } else if (promo.type === 'MONTO_FIJO') {
              itemDiscount = Math.min(promo.discountValue, item.unitPrice * item.quantity);
            }

            if (itemDiscount > 0) {
              itemDiscount = Math.round(itemDiscount * 100) / 100;
              itemPromotions[item.productId] = (itemPromotions[item.productId] || 0) + itemDiscount;
              promoDiscount += itemDiscount;
              isMatched = true;
            }
          }
        }
        break;
      }

      case 'COMBO': {
        // Special discount on combos
        for (const item of cartItems) {
          if (item.isCombo && (!promo.targetId || item.comboId === promo.targetId)) {
            let comboDiscount = 0;
            if (promo.type === 'PORCENTAJE') {
              comboDiscount = item.unitPrice * item.quantity * (promo.discountValue / 100);
            } else if (promo.type === 'MONTO_FIJO') {
              comboDiscount = Math.min(promo.discountValue * item.quantity, item.unitPrice * item.quantity);
            }

            if (comboDiscount > 0) {
              comboDiscount = Math.round(comboDiscount * 100) / 100;
              itemPromotions[item.productId] = (itemPromotions[item.productId] || 0) + comboDiscount;
              promoDiscount += comboDiscount;
              isMatched = true;
            }
          }
        }
        break;
      }
    }

    if (isMatched && promoDiscount > 0) {
      promoDiscount = Math.round(promoDiscount * 100) / 100;
      appliedPromotions.push({
        promotionId: promo.id,
        code: promo.code,
        name: promo.name,
        discountAmount: promoDiscount
      });
      matchedPromotions.push(promo);
      totalPromoDiscount += promoDiscount;
    }
  }

  // Cap total promo discount so it cannot exceed gross subtotal
  totalPromoDiscount = Math.min(grossSubtotal, Math.round(totalPromoDiscount * 100) / 100);

  return {
    appliedPromotions,
    itemPromotions,
    totalPromoDiscount,
    matchedPromotions
  };
}
