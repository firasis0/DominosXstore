// Storefront helpers for product variants.
//
// product.variants = option values  [{ id, type, value, color_hex, image_url }]
// product.skus     = sellable combos [{ id, price, discount_price, stock, options: { type: value } }]
// selection        = what the customer picked so far { type: value }

export const COLOR_TYPE = "color";

const hasStock = (sku) => Number(sku.stock) > 0;

const matches = (sku, selection) =>
    Object.entries(selection).every(
        ([type, value]) => sku.options?.[type] === value
    );

export const getOptionGroups = (product) => {
    const groups = [];

    for (const variant of product?.variants ?? []) {
        let group = groups.find((item) => item.type === variant.type);

        if (!group) {
            group = { type: variant.type, values: [] };
            groups.push(group);
        }

        group.values.push(variant);
    }

    return groups;
};

export const isFullySelected = (product, selection) =>
    getOptionGroups(product).every((group) => Boolean(selection?.[group.type]));

export const findSku = (product, selection) => {
    if (!isFullySelected(product, selection ?? {})) {
        return null;
    }

    return (product.skus ?? []).find((sku) => matches(sku, selection)) ?? null;
};

export const getSkuPrices = (product, sku) => {
    const onSale = product.is_on_sale && sku.discount_price !== null;

    return {
        price: onSale ? Number(sku.discount_price) : Number(sku.price),
        oldPrice: onSale ? Number(sku.price) : null,
    };
};

// A product with a single combination starts with it already selected.
export const initialSelection = (product) =>
    (product?.skus?.length ?? 0) === 1 ? { ...product.skus[0].options } : {};

// Can this value be clicked, given what is already selected?
export const getValueStatus = (product, selection, type, value) => {
    const withValue = (product.skus ?? []).filter(
        (sku) => sku.options?.[type] === value
    );

    if (!withValue.some(hasStock)) {
        return { disabled: true, reason: "sold-out" };
    }

    // Only the options listed BEFORE this one limit it (Color limits Model, not the
    // other way round), so the customer can always switch Color; incompatible later
    // choices are then dropped by selectValue().
    const order = getOptionGroups(product).map((group) => group.type);
    const earlier = order.slice(0, order.indexOf(type));
    const others = {};

    for (const earlierType of earlier) {
        if (selection[earlierType]) {
            others[earlierType] = selection[earlierType];
        }
    }

    if (!withValue.some((sku) => hasStock(sku) && matches(sku, others))) {
        return { disabled: true, reason: "unavailable" };
    }

    return { disabled: false, reason: null };
};

// Click on a value. Clicking the selected one again un-selects it.
// Other choices that no longer fit (Blue + 40mm when 40mm only exists in Red) are dropped.
export const selectValue = (product, selection, type, value) => {
    if (selection[type] === value) {
        const next = { ...selection };
        delete next[type];
        return next;
    }

    const next = { [type]: value };

    for (const [otherType, otherValue] of Object.entries(selection)) {
        if (otherType === type) continue;

        const probe = { ...next, [otherType]: otherValue };

        if ((product.skus ?? []).some((sku) => hasStock(sku) && matches(sku, probe))) {
            next[otherType] = otherValue;
        }
    }

    return next;
};

// Price shown for the current selection: exact when everything is chosen,
// otherwise the cheapest in-stock combination that still fits ("From ...").
export const getPriceInfo = (product, selection) => {
    const exact = findSku(product, selection ?? {});

    if (exact) {
        return { ...getSkuPrices(product, exact), isFrom: false, sku: exact };
    }

    const skus = product.skus ?? [];

    if (skus.length === 0) {
        return {
            price: Number(product.discount_price ?? product.price),
            oldPrice: product.discount_price ? Number(product.price) : null,
            isFrom: false,
            sku: null,
        };
    }

    const compatible = skus.filter((sku) => matches(sku, selection ?? {}));
    const inStock = compatible.filter(hasStock);
    const pool = inStock.length > 0 ? inStock : compatible.length > 0 ? compatible : skus;

    const priced = pool
        .map((sku) => getSkuPrices(product, sku))
        .sort((a, b) => a.price - b.price);

    return {
        ...priced[0],
        isFrom: new Set(priced.map((item) => item.price)).size > 1,
        sku: null,
    };
};

export const getAvailableStock = (product, selection) => {
    const exact = findSku(product, selection ?? {});

    if (exact) {
        return Number(exact.stock);
    }

    const skus = product.skus ?? [];

    if (skus.length === 0) {
        return Number(product.stock ?? 0);
    }

    return skus
        .filter((sku) => matches(sku, selection ?? {}))
        .reduce((sum, sku) => sum + Number(sku.stock), 0);
};

// Photo linked to the selected values (the last one chosen that has a photo)
export const getVariantImage = (product, selection) => {
    let image = null;

    for (const [type, value] of Object.entries(selection ?? {})) {
        const variant = (product.variants ?? []).find(
            (item) => item.type === type && item.value === value
        );

        if (variant?.image_url) {
            image = variant.image_url;
        }
    }

    return image;
};
