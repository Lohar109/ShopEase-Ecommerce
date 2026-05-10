import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Box, Check, ChevronDown, Image, Info, Layers, Plus, Trash2, AlertTriangle, Video, Edit2, Sparkles, Brain, Folder } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import QuickAddModal from '../components/QuickAddModal';
import { addCategory, fetchCategories } from '../services/categoryService';
import {
  deleteDesignGallery,
  fetchDesignGalleries,
  fetchProductById,
  saveDesignGallery,
  saveProduct,
  updateProduct
} from '../services/productService';

const STEPS = [
  { key: 'magic', label: 'Magic Fill', icon: Sparkles },
  { key: 'general', label: 'General' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'media', label: 'Media' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'galleries', label: 'Galleries' },
  { key: 'offers', label: 'Offers' },
];

const normalizeId = (value) => String(value ?? '').trim();
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizeId(value));
const MAGIC_FILL_DRAFT_KEY = 'shopease.productform.magicfill.draft';

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const mk = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newSpec = () => ({ sk: mk(), key: '', value: '' });
  const newVar = (img = '') => ({ vk: mk(), size: '', color: '', price: '', override_discount: false, discount_type: 'Percentage', discount_value: '', stock: '', sku: '', image: img, use_separate_gallery: false });
  const [activeTab, setActiveTab] = useState('magic');
  const [saving, setSaving] = useState(false);
  const [duplicateSkuError, setDuplicateSkuError] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [loadErr, setLoadErr] = useState('');
  const [editProductData, setEditProductData] = useState(null);
  const navigate = useNavigate();
  // General Details state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [subSubcategoryId, setSubSubcategoryId] = useState('');
  const [audience, setAudience] = useState('unisex');
  const [categories, setCategories] = useState([]);
  const [m, setM] = useState(false);
  const [d, setD] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [val, setVal] = useState('');
  const [t, setT] = useState('category');
  const [pId, setPId] = useState('');
  const [img, setImg] = useState('');
  const [addingQuickCat, setAddingQuickCat] = useState(false);
  const [editingDiscountVariantIndex, setEditingDiscountVariantIndex] = useState(null);
  // Dynamic specifications
  const [specs, setSpecs] = useState([newSpec()]);

  // Quick Paste state
  const [showQuickPasteModal, setShowQuickPasteModal] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [quickPasteWarning, setQuickPasteWarning] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [isProcessHovered, setIsProcessHovered] = useState(false);
  const [isPrettifyHovered, setIsPrettifyHovered] = useState(false);
  const [isValidateHovered, setIsValidateHovered] = useState(false);
  const [showMagicFillModal, setShowMagicFillModal] = useState(false);
  const [magicFillText, setMagicFillText] = useState('');
  const [magicFillError, setMagicFillError] = useState('');
  const [highlightCategory, setHighlightCategory] = useState(false);
  const [highlightSubcategory, setHighlightSubcategory] = useState(false);
  const [highlightSubSubcategory, setHighlightSubSubcategory] = useState(false);
  const [highlightAudience, setHighlightAudience] = useState(false);
  const [isMagicProcessHovered, setIsMagicProcessHovered] = useState(false);
  const [isMagicCancelHovered, setIsMagicCancelHovered] = useState(false);
  const [magicAuditRows, setMagicAuditRows] = useState([]);
  const [magicSyncStates, setMagicSyncStates] = useState({ general: 'idle', specifications: 'idle', inventory: 'idle' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  const [activeBlueprintGroup, setActiveBlueprintGroup] = useState('general');
  const [isBlueprintEditorOpen, setIsBlueprintEditorOpen] = useState(false);
  const [isEditorSlidingOut, setIsEditorSlidingOut] = useState(false);
  const magicEditorRef = useRef(null);
  const magicPreviewRef = useRef(null);
  const magicSyncTimersRef = useRef([]);

  // VS Code Light syntax highlighter for JSON
  const highlightJSON = (code) => {
    if (!code) return '';
    const BOLD_KEYS = ['specs', 'variants', 'specifications', 'inventory'];
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const tokenRegex = /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}\[\],:])/g;
    const wrap = (text, color, extra = '') => `<span style="color:${color}${extra ? `;${extra}` : ''}">${text}</span>`;
    const isKey = (index, text) => {
      let nextIndex = index + text.length;
      while (nextIndex < escaped.length && /\s/.test(escaped[nextIndex])) nextIndex += 1;
      return escaped[nextIndex] === ':';
    };

    let output = '';
    let lastIndex = 0;
    let match;
    while ((match = tokenRegex.exec(escaped)) !== null) {
      output += escaped.slice(lastIndex, match.index);

      if (match[1]) {
        const token = match[1];
        const keyName = token.slice(1, -1);
        const keyToken = wrap(token, '#005cc5', BOLD_KEYS.includes(keyName) ? 'font-weight:700' : '');
        output += isKey(match.index, token) ? keyToken : wrap(token, '#22863a');
      } else if (match[2]) {
        output += wrap(match[2], '#6f42c1');
      } else if (match[3]) {
        output += wrap(match[3], '#6f42c1');
      } else if (match[4]) {
        output += wrap(match[4], '#64748b');
      }

      lastIndex = tokenRegex.lastIndex;
    }

    output += escaped.slice(lastIndex);
    return output;
  };

  const clearMagicSyncTimers = () => {
    magicSyncTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    magicSyncTimersRef.current = [];
  };

  const syncMagicScroll = (sourceEl) => {
    const previewEl = magicPreviewRef.current;
    const editorEl = magicEditorRef.current;
    if (!previewEl || !editorEl || !sourceEl) return;

    const { scrollTop = 0, scrollLeft = 0 } = sourceEl;
    if (previewEl !== sourceEl) {
      previewEl.scrollTop = scrollTop;
      previewEl.scrollLeft = scrollLeft;
    }
    if (editorEl !== sourceEl) {
      editorEl.scrollTop = scrollTop;
      editorEl.scrollLeft = scrollLeft;
    }
  };

  const formatMagicTimestamp = (date = new Date()) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const createMagicBlueprintData = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return null;

    const normalizeSpecRows = (rows) => {
      if (Array.isArray(rows)) {
        return rows.map((item) => ({
          key: String(item?.key || ''),
          value: String(item?.value || ''),
        }));
      }

      if (rows && typeof rows === 'object') {
        return Object.entries(rows).map(([key, value]) => ({
          key: String(key || ''),
          value: String(value ?? ''),
        }));
      }

      return [];
    };

    const normalizeInventoryRows = (rows) => {
      const sourceRows = Array.isArray(rows) ? rows : [];
      return sourceRows.map((item) => ({
        size: String(item?.size || ''),
        color: String(item?.color || ''),
        price: String(item?.price ?? ''),
        stock: String(item?.stock ?? ''),
        sku: String(item?.sku || ''),
        image: String(item?.image || ''),
      }));
    };

    return {
      name: String(parsed.name || ''),
      brand: String(parsed.brand || ''),
      description: String(parsed.description || ''),
      audience: String(parsed.audience || ''),
      category_label: String(parsed.category_label || parsed.category || ''),
      subcategory_label: String(parsed.subcategory_label || parsed.sub_category || ''),
      sub_subcategory_label: String(parsed.sub_subcategory_label || parsed.sub_sub_category || ''),
      specifications: normalizeSpecRows(parsed.specifications || parsed.specs),
      inventory: normalizeInventoryRows(parsed.inventory || parsed.variants),
    };
  };

  const getMagicBlueprintData = () => mappedData || createMagicBlueprintData(magicPreview.parsed);

  const commitMagicBlueprintData = (nextData) => {
    if (!nextData) return;
    setMappedData(nextData);
    setMagicFillText(JSON.stringify(nextData, null, 2));
    setMagicFillError('');
  };

  const formatMagicBlueprintInventoryValue = (variant) => {
    if (!variant) return '';

    return [
      variant.size ? `Size: ${variant.size}` : '',
      variant.color ? `Color: ${variant.color}` : '',
      variant.price !== '' ? `Price: ${variant.price}` : '',
      variant.stock !== '' ? `Stock: ${variant.stock}` : '',
      variant.sku ? `SKU: ${variant.sku}` : '',
    ].filter(Boolean).join(' | ');
  };

  const parseMagicBlueprintInventoryValue = (value, fallback = {}) => {
    const nextVariant = { ...fallback };
    const raw = String(value || '').trim();

    if (!raw) {
      return nextVariant;
    }

    raw.split('|').forEach((segment) => {
      const [rawKey, ...rest] = segment.split(':');
      const key = String(rawKey || '').trim().toLowerCase();
      const segmentValue = rest.join(':').trim();

      if (!key) return;
      if (key === 'size') nextVariant.size = segmentValue;
      else if (key === 'color') nextVariant.color = segmentValue;
      else if (key === 'price') nextVariant.price = segmentValue;
      else if (key === 'stock') nextVariant.stock = segmentValue;
      else if (key === 'sku') nextVariant.sku = segmentValue;
      else if (key === 'image') nextVariant.image = segmentValue;
    });

    return nextVariant;
  };

  const buildMagicBlueprintEditorRows = (group, data) => {
    if (!data) return [];

    if (group === 'general') {
      return [
        { id: 'name', fieldName: 'Name', value: data.name || '', kind: 'general', key: 'name', editable: true },
        { id: 'brand', fieldName: 'Brand', value: data.brand || '', kind: 'general', key: 'brand', editable: true },
        { id: 'description', fieldName: 'Description', value: data.description || '', kind: 'general', key: 'description', editable: true },
        { id: 'audience', fieldName: 'Audience', value: data.audience || '', kind: 'general', key: 'audience', editable: true },
      ];
    }

    if (group === 'categories') {
      return [
        { id: 'category_label', fieldName: 'Category', value: data.category_label || data.category || '', kind: 'category', key: 'category_label', editable: true },
        { id: 'subcategory_label', fieldName: 'Subcategory', value: data.subcategory_label || data.sub_category || '', kind: 'category', key: 'subcategory_label', editable: true },
        { id: 'sub_subcategory_label', fieldName: 'Sub-subcategory', value: data.sub_subcategory_label || data.sub_sub_category || '', kind: 'category', key: 'sub_subcategory_label', editable: true },
      ];
    }

    if (group === 'specifications') {
      const sourceRows = Array.isArray(data.specifications) ? data.specifications : (Array.isArray(data.specs) ? data.specs : []);
      return sourceRows.map((item, index) => ({
        id: `spec-${index}`,
        fieldName: item?.key || `Specification ${index + 1}`,
        value: item?.value || '',
        kind: 'specification',
        index,
        editable: true,
      }));
    }

    if (group === 'inventory') {
      const sourceRows = Array.isArray(data.inventory) ? data.inventory : (Array.isArray(data.variants) ? data.variants : []);
      return sourceRows.map((item, index) => ({
        id: `variant-${index}`,
        fieldName: item?.sku || `Variant ${index + 1}`,
        value: formatMagicBlueprintInventoryValue(item),
        kind: 'inventory',
        index,
        editable: true,
      }));
    }

    return [];
  };

  const updateMagicBlueprintField = (key, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    commitMagicBlueprintData({ ...baseData, [key]: value });
  };

  const updateMagicBlueprintSpecification = (index, key, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData || !Array.isArray(baseData.specifications)) return;

    const nextSpecifications = baseData.specifications.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [key]: value } : row
    ));
    commitMagicBlueprintData({ ...baseData, specifications: nextSpecifications });
  };

  const updateMagicBlueprintInventory = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData || !Array.isArray(baseData.inventory)) return;

    const nextInventory = baseData.inventory.map((row, rowIndex) => (
      rowIndex === index ? parseMagicBlueprintInventoryValue(value, row) : row
    ));
    commitMagicBlueprintData({ ...baseData, inventory: nextInventory });
  };

  const removeMagicBlueprintSpecification = (index) => {
    const baseData = getMagicBlueprintData();
    if (!baseData || !Array.isArray(baseData.specifications)) return;

    commitMagicBlueprintData({
      ...baseData,
      specifications: baseData.specifications.filter((_, rowIndex) => rowIndex !== index),
    });
  };

  const removeMagicBlueprintInventory = (index) => {
    const baseData = getMagicBlueprintData();
    if (!baseData || !Array.isArray(baseData.inventory)) return;

    commitMagicBlueprintData({
      ...baseData,
      inventory: baseData.inventory.filter((_, rowIndex) => rowIndex !== index),
    });
  };

  const addMagicBlueprintRow = () => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;

    if (activeBlueprintGroup === 'inventory') {
      commitMagicBlueprintData({
        ...baseData,
        inventory: [...(Array.isArray(baseData.inventory) ? baseData.inventory : []), { size: '', color: '', price: '', stock: '', sku: '', image: '' }],
      });
      return;
    }

    if (activeBlueprintGroup === 'specifications') {
      commitMagicBlueprintData({
        ...baseData,
        specifications: [...(Array.isArray(baseData.specifications) ? baseData.specifications : []), { key: '', value: '' }],
      });
    }
  };

  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(MAGIC_FILL_DRAFT_KEY);
      if (savedDraft && !magicFillText) {
        setMagicFillText(savedDraft);
      }
    } catch {
      // ignore storage access failures
    }
  }, []);

  useEffect(() => {
    try {
      if (magicFillText) {
        sessionStorage.setItem(MAGIC_FILL_DRAFT_KEY, magicFillText);
      } else {
        sessionStorage.removeItem(MAGIC_FILL_DRAFT_KEY);
      }
    } catch {
      // ignore storage access failures
    }
  }, [magicFillText]);


  const magicPreview = useMemo(() => {
    try {
      const txt = magicFillText.trim();
      if (!txt) {
        return {
          parsed: null,
          prettyJson: '',
          category: 'None',
          categoryHierarchy: [],
          hasFullCategoryHierarchy: false,
          specsCount: 0,
          variantsCount: 0,
          sizes: [],
          error: null,
        };
      }
      const parsed = JSON.parse(txt);
      const prettyJson = JSON.stringify(parsed, null, 2);

      // Category detection (raw JSON hierarchy first)
      let detectedCategory = 'None';
      const categoryHierarchy = [];
      const rawMainCategory = String(parsed.category_label || parsed.category || '').trim();
      const rawSubCategory = String(parsed.subcategory_label || parsed.sub_category || '').trim();
      const rawSubSubCategory = String(parsed.sub_subcategory_label || parsed.sub_sub_category || '').trim();

      if (rawMainCategory) categoryHierarchy.push(rawMainCategory);
      if (rawSubCategory) categoryHierarchy.push(rawSubCategory);
      if (rawSubSubCategory) categoryHierarchy.push(rawSubSubCategory);

      const hasFullCategoryHierarchy = Boolean(rawMainCategory && rawSubCategory && rawSubSubCategory);

      const catLabel = String(parsed.category_label || parsed.category || '').toLowerCase().trim();
      if (catLabel) {
        const normalizeId = id => id ? String(id) : '';
        const level1Cats = categories.filter(c => c.level === 1 || c.parent_id === null);
        const matched = level1Cats.find(c => String(c.name || '').toLowerCase().trim() === catLabel);
        if (matched) {
          detectedCategory = `${matched.name} (ID: ${matched.id})`;
        } else {
          detectedCategory = `"${parsed.category_label || parsed.category}" (No Match)`;
        }
      }

      // Specs count detection
      let specsCount = 0;
      if (Array.isArray(parsed.specifications)) {
        specsCount = parsed.specifications.length;
      } else if (Array.isArray(parsed.specs)) {
        specsCount = parsed.specs.length;
      } else if (parsed.specifications && typeof parsed.specifications === 'object') {
        specsCount = Object.keys(parsed.specifications).length;
      } else if (parsed.specs && typeof parsed.specs === 'object') {
        specsCount = Object.keys(parsed.specs).length;
      }

      // Variants summary detection
      let variantsCount = 0;
      let uniqueSizesList = [];
      const varArr = parsed.inventory || parsed.variants;
      if (Array.isArray(varArr)) {
        variantsCount = varArr.length;
        const sizes = varArr.map(v => String(v.size || '')).filter(Boolean);
        uniqueSizesList = [...new Set(sizes)];
      }

      return {
        parsed,
        prettyJson,
        category: detectedCategory,
        categoryHierarchy,
        hasFullCategoryHierarchy,
        specsCount,
        variantsCount,
        sizes: uniqueSizesList,
        error: null
      };
    } catch (e) {
      return {
        parsed: null,
        prettyJson: magicFillText,
        category: 'None',
        categoryHierarchy: [],
        hasFullCategoryHierarchy: false,
        specsCount: 0,
        variantsCount: 0,
        sizes: [],
        error: e.message
      };
    }
  }, [magicFillText, categories]);

  useEffect(() => {
    if (magicPreview.parsed) {
      setMappedData(createMagicBlueprintData(magicPreview.parsed));
      return;
    }

    setMappedData(null);
    setIsBlueprintEditorOpen(false);
    setActiveBlueprintGroup('general');
  }, [magicPreview.parsed]);

  useEffect(() => () => {
    clearMagicSyncTimers();
  }, []);

  const handlePrettifyPaste = () => {
    setQuickPasteWarning('');
    const txt = quickPasteText.trim();
    if (!txt) return;

    if (txt.startsWith('[') || txt.startsWith('{')) {
      try {
        const parsed = JSON.parse(txt);
        setQuickPasteText(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setQuickPasteWarning('Invalid JSON format: Cannot prettify.');
      }
    } else {
      const lines = txt.split('\n');
      const cleanedLines = lines
        .map(line => {
          const parts = line.split(/[,\t]+/).map(p => p.trim());
          if (parts.length >= 4) {
            return parts.slice(0, 4).join(', ');
          }
          return line.trim();
        })
        .filter(Boolean);
      setQuickPasteText(cleanedLines.join('\n'));
    }
  };

  const buildMagicFillAuditRows = (data, status = 'Success') => {
    const auditRows = [];
    const addAuditRow = (step, type, action, rowStatus = status) => {
      auditRows.push({
        id: auditRows.length + 1,
        step,
        type,
        timestamp: formatMagicTimestamp(),
        action,
        status: rowStatus,
      });
    };

    if (data.name) addAuditRow('Step 1', 'General', 'Name Auto-Mapped');
    if (data.brand) addAuditRow('Step 1', 'General', 'Brand Auto-Mapped');
    if (data.description) addAuditRow('Step 1', 'General', 'Description Auto-Mapped');

    const audVal = String(data.audience || '').toLowerCase().trim();
    let matchedAudience = '';
    if (audVal === 'unisex') matchedAudience = 'unisex';
    else if (audVal === 'men' || audVal === 'man' || audVal === 'male') matchedAudience = 'men';
    else if (audVal === 'women' || audVal === 'woman' || audVal === 'female') matchedAudience = 'women';
    else if (audVal === 'kids' || audVal === 'child' || audVal === 'children') matchedAudience = 'kids';

    if (matchedAudience) {
      addAuditRow('Step 1', 'General', `Audience matched to ${matchedAudience}`);
    } else if (audVal) {
      addAuditRow('Step 1', 'General', 'Audience needs manual selection', 'Error');
    }

    const level1Cats = categories.filter((c) => c.level === 1 || c.parent_id === null);
    const catLabel = String(data.category_label || data.category || '').toLowerCase().trim();
    const matchedCat = level1Cats.find((c) => String(c.name || '').toLowerCase().trim() === catLabel);

    if (matchedCat) {
      const catId = normalizeId(matchedCat.id);
      addAuditRow('Step 1', 'General', `Category matched: ${matchedCat.name}`);

      const subCatLabel = String(data.subcategory_label || data.sub_category || '').toLowerCase().trim();
      if (subCatLabel) {
        const subCats = categories.filter((c) => normalizeId(c.parent_id) === catId);
        const matchedSubCat = subCats.find((c) => String(c.name || '').toLowerCase().trim() === subCatLabel);
        if (matchedSubCat) {
          const subCatId = normalizeId(matchedSubCat.id);
          addAuditRow('Step 1', 'General', `Subcategory matched: ${matchedSubCat.name}`);

          const subSubCatLabel = String(data.sub_subcategory_label || data.sub_sub_category || '').toLowerCase().trim();
          if (subSubCatLabel) {
            const subSubCats = categories.filter((c) => normalizeId(c.parent_id) === subCatId);
            const matchedSubSubCat = subSubCats.find((c) => String(c.name || '').toLowerCase().trim() === subSubCatLabel);
            if (matchedSubSubCat) {
              addAuditRow('Step 1', 'General', `Sub-subcategory matched: ${matchedSubSubCat.name}`);
            } else {
              addAuditRow('Step 1', 'General', 'Sub-subcategory needs manual selection', 'Error');
            }
          }
        } else {
          addAuditRow('Step 1', 'General', 'Subcategory needs manual selection', 'Error');
        }
      }
    } else if (catLabel) {
      addAuditRow('Step 1', 'General', 'Category needs manual selection', 'Error');
    }

    let mappedSpecsCount = 0;
    if (Array.isArray(data.specifications)) mappedSpecsCount = data.specifications.length;
    else if (Array.isArray(data.specs)) mappedSpecsCount = data.specs.length;
    else if (data.specifications && typeof data.specifications === 'object') mappedSpecsCount = Object.keys(data.specifications).length;
    else if (data.specs && typeof data.specs === 'object') mappedSpecsCount = Object.keys(data.specs).length;
    if (mappedSpecsCount > 0) {
      addAuditRow('Step 2', 'Specs', `${mappedSpecsCount} specifications auto-mapped`);
    }

    const varArr = data.inventory || data.variants;
    if (Array.isArray(varArr) && varArr.length > 0) {
      addAuditRow('Step 4', 'Inventory', `${varArr.length} variants auto-mapped`);
    }

    if (auditRows.length === 0) {
      addAuditRow('Scan', 'Blueprint', 'No mappable fields found in current JSON', 'Error');
    }

    return auditRows;
  };

  const runMagicFillWorkflow = (mode = 'apply') => {
    clearMagicSyncTimers();
    const isValidation = mode === 'validate';
    setIsAnalyzing(true);

    try {
      try {
        const data = getMagicBlueprintData() || JSON.parse(magicFillText);
        const auditRows = buildMagicFillAuditRows(data, isValidation ? 'Preview' : 'Success');

        if (isValidation) {
          setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle' });
          setMagicFillError('');
          setMagicAuditRows(auditRows);
          setToastMsg('Blueprint validated. Audit log refreshed.');
          setToastType('success');
          setTimeout(() => setToastMsg(''), 3000);
          return;
        }

        setMagicSyncStates({ general: 'pulse', specifications: 'idle', inventory: 'idle' });

        const generalTimer = setTimeout(() => {
          setMagicSyncStates((prev) => ({ ...prev, general: 'green' }));
        }, 420);
        const specsPulseTimer = setTimeout(() => {
          setMagicSyncStates((prev) => ({ ...prev, specifications: 'pulse' }));
        }, 650);
        const specsGreenTimer = setTimeout(() => {
          setMagicSyncStates((prev) => ({ ...prev, specifications: 'green' }));
        }, 1080);
        const inventoryPulseTimer = setTimeout(() => {
          setMagicSyncStates((prev) => ({ ...prev, inventory: 'pulse' }));
        }, 1320);
        const inventoryGreenTimer = setTimeout(() => {
          setMagicSyncStates((prev) => ({ ...prev, inventory: 'green' }));
        }, 1760);

        magicSyncTimersRef.current = [generalTimer, specsPulseTimer, specsGreenTimer, inventoryPulseTimer, inventoryGreenTimer];

        if (data.name) {
          setName(data.name);
        }
        if (data.brand) {
          setBrand(data.brand);
        }
        if (data.description) {
          setDescription(data.description);
        }

        let matchedAudience = '';
        const audVal = String(data.audience || '').toLowerCase().trim();
        if (audVal === 'unisex') matchedAudience = 'unisex';
        else if (audVal === 'men' || audVal === 'man' || audVal === 'male') matchedAudience = 'men';
        else if (audVal === 'women' || audVal === 'woman' || audVal === 'female') matchedAudience = 'women';
        else if (audVal === 'kids' || audVal === 'child' || audVal === 'children') matchedAudience = 'kids';

        if (matchedAudience) {
          setAudience(matchedAudience);
          setHighlightAudience(false);
        } else {
          setAudience('');
          setHighlightAudience(true);
        }

        const level1Cats = categories.filter((c) => c.level === 1 || c.parent_id === null);
        const catLabel = String(data.category_label || data.category || '').toLowerCase().trim();
        const matchedCat = level1Cats.find((c) => String(c.name || '').toLowerCase().trim() === catLabel);

        if (matchedCat) {
          const catId = normalizeId(matchedCat.id);
          setCategoryId(catId);
          setHighlightCategory(false);

          const subCatLabel = String(data.subcategory_label || data.sub_category || '').toLowerCase().trim();
          if (subCatLabel) {
            const subCats = categories.filter((c) => normalizeId(c.parent_id) === catId);
            const matchedSubCat = subCats.find((c) => String(c.name || '').toLowerCase().trim() === subCatLabel);
            if (matchedSubCat) {
              const subCatId = normalizeId(matchedSubCat.id);
              setSubcategoryId(subCatId);
              setHighlightSubcategory(false);

              const subSubCatLabel = String(data.sub_subcategory_label || data.sub_sub_category || '').toLowerCase().trim();
              if (subSubCatLabel) {
                const subSubCats = categories.filter((c) => normalizeId(c.parent_id) === subCatId);
                const matchedSubSubCat = subSubCats.find((c) => String(c.name || '').toLowerCase().trim() === subSubCatLabel);
                if (matchedSubSubCat) {
                  setSubSubcategoryId(normalizeId(matchedSubSubCat.id));
                  setHighlightSubSubcategory(false);
                } else {
                  setSubSubcategoryId('');
                  setHighlightSubSubcategory(true);
                }
              } else {
                setSubSubcategoryId('');
                setHighlightSubSubcategory(false);
              }
            } else {
              setSubcategoryId('');
              setHighlightSubcategory(true);
              setSubSubcategoryId('');
              setHighlightSubSubcategory(false);
            }
          } else {
            setSubcategoryId('');
            setHighlightSubcategory(false);
            setSubSubcategoryId('');
            setHighlightSubSubcategory(false);
          }
        } else {
          setCategoryId('');
          setHighlightCategory(true);
          setSubcategoryId('');
          setHighlightSubcategory(false);
          setSubSubcategoryId('');
          setHighlightSubSubcategory(false);
        }

        if (Array.isArray(data.specifications)) {
          const newSpecs = data.specifications.map((s) => ({
            sk: mk(),
            key: String(s.key || ''),
            value: String(s.value || ''),
          }));
          if (newSpecs.length > 0) {
            setSpecs(newSpecs);
          }
        } else if (Array.isArray(data.specs)) {
          const newSpecs = data.specs.map((s) => ({
            sk: mk(),
            key: String(s.key || ''),
            value: String(s.value || ''),
          }));
          if (newSpecs.length > 0) {
            setSpecs(newSpecs);
          }
        } else if (data.specifications && typeof data.specifications === 'object') {
          const newSpecs = Object.entries(data.specifications).map(([k, v]) => ({
            sk: mk(),
            key: String(k || ''),
            value: String(v || ''),
          }));
          if (newSpecs.length > 0) {
            setSpecs(newSpecs);
          }
        } else if (data.specs && typeof data.specs === 'object') {
          const newSpecs = Object.entries(data.specs).map(([k, v]) => ({
            sk: mk(),
            key: String(k || ''),
            value: String(v || ''),
          }));
          if (newSpecs.length > 0) {
            setSpecs(newSpecs);
          }
        }

        if (Array.isArray(data.inventory || data.variants)) {
          const varArr = data.inventory || data.variants;
          const newVariants = varArr.map((v) => {
            const size = String(v.size || '');
            const color = String(v.color || '');
            const priceVal = Number(v.price || 0);
            const stockVal = Number(v.stock || 0);

            const normalizedSlug = slug || (data.name || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const cleanColor = color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const cleanSize = size.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

            return {
              vk: mk(),
              size,
              color,
              price: priceVal,
              override_discount: false,
              discount_type: 'Percentage',
              discount_value: '',
              stock: stockVal,
              sku: autoSku,
              image: mainImage || '',
              use_separate_gallery: false,
            };
          });

          if (newVariants.length > 0) {
            setVariantRows(newVariants);
          }
        }

        setMagicFillError('');
        setMagicAuditRows(auditRows);
        setToastMsg('Magic Fill finalized and applied.');
        setToastType('success');
        setTimeout(() => setToastMsg(''), 4000);
      } catch (e) {
        setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle' });
        setMagicFillError('Invalid JSON format: ' + e.message);
        setMagicAuditRows([
          {
            id: 1,
            step: 'Parse',
            type: 'JSON',
            timestamp: formatMagicTimestamp(),
            action: 'Parse Failed',
            status: 'Error',
          },
        ]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMagicFillValidate = () => runMagicFillWorkflow('validate');

  const handleMagicFillApply = () => {
    setIsEditorSlidingOut(true);
    setTimeout(() => {
      setIsBlueprintEditorOpen(false);
      setIsEditorSlidingOut(false);
      runMagicFillWorkflow('apply');
      setTimeout(() => {
        setToastMsg('Applied successfully! Blueprint is now live.');
        setToastType('success');
        setTimeout(() => setToastMsg(''), 3500);
      }, 100);
    }, 400);
  };

  const handleProcessQuickPaste = () => {
    setQuickPasteWarning('');
    const txt = quickPasteText.trim();
    if (!txt) {
      setQuickPasteWarning('Paste input is empty.');
      return;
    }

    let newVariants = [];
    let skippedCount = 0;

    if (txt.startsWith('[') || txt.startsWith('{')) {
      try {
        let parsed = JSON.parse(txt);
        if (!Array.isArray(parsed)) {
          parsed = [parsed];
        }

        parsed.forEach(item => {
          if (!item || typeof item !== 'object') {
            skippedCount++;
            return;
          }

          const keys = Object.keys(item);
          const getVal = (possibleKeys) => {
            const foundKey = keys.find(k => possibleKeys.includes(k.toLowerCase()));
            return foundKey ? item[foundKey] : undefined;
          };

          const size = getVal(['size', 'sz']);
          const color = getVal(['color', 'clr', 'colour']);
          const priceVal = Number(getVal(['price', 'prc', 'rate']));
          const stockVal = Number(getVal(['stock', 'stk', 'qty', 'quantity']));

          if (size === undefined || color === undefined || isNaN(priceVal) || isNaN(stockVal)) {
            skippedCount++;
            return;
          }

          const normalizedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const cleanColor = String(color).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cleanSize = String(size).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

          newVariants.push({
            vk: mk(),
            size: String(size),
            color: String(color),
            price: priceVal,
            override_discount: false,
            discount_type: 'Percentage',
            discount_value: '',
            stock: stockVal,
            sku: autoSku,
            image: mainImage || '',
            use_separate_gallery: false
          });
        });
      } catch (err) {
        setQuickPasteWarning('Invalid JSON format: ' + err.message);
        return;
      }
    } else {
      const lines = txt.split('\n');
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const parts = trimmedLine.split(/[,\t]+/).map(p => p.trim());
        if (parts.length < 4) {
          skippedCount++;
          return;
        }

        const size = parts[0];
        const color = parts[1];
        const priceVal = Number(parts[2]);
        const stockVal = Number(parts[3]);

        if (isNaN(priceVal) || isNaN(stockVal)) {
          skippedCount++;
          return;
        }

        const normalizedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const cleanColor = color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = size.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

        newVariants.push({
          vk: mk(),
          size: size,
          color: color,
          price: priceVal,
          override_discount: false,
          discount_type: 'Percentage',
          discount_value: '',
          stock: stockVal,
          sku: autoSku,
          image: mainImage || '',
          use_separate_gallery: false
        });
      });
    }

    if (newVariants.length === 0) {
      setQuickPasteWarning(`No valid variants found. Skipped ${skippedCount} invalid lines.`);
      return;
    }

    setIsProcessingSuccess(true);

    setTimeout(() => {
      setVariantRows(prev => {
        const filteredPrev = prev.filter(v => v.size || v.color || v.price || v.stock);
        return [...filteredPrev, ...newVariants];
      });

      const addedCount = newVariants.length;
      let msg = `Successfully added ${addedCount} variants!`;
      if (skippedCount > 0) {
        msg += ` Skipped ${skippedCount} invalid lines.`;
      }

      setToastMsg(msg);
      setToastType(skippedCount > 0 ? 'warning' : 'success');
      setShowQuickPasteModal(false);
      setQuickPasteText('');
      setQuickPasteWarning('');
      setIsProcessingSuccess(false);
      setTimeout(() => setToastMsg(''), 4000);
    }, 1200);
  };


  // Media state (Cloudinary URLs only)
  const [mainImage, setMainImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [galleryImages, setGalleryImages] = useState(['']);

  // Design specific gallery state
  const [designColorName, setDesignColorName] = useState('');
  const [designImagesInput, setDesignImagesInput] = useState('');
  const [designVideoInput, setDesignVideoInput] = useState('');
  const [designGalleries, setDesignGalleries] = useState([]);
  const [loadingDesignGalleries, setLoadingDesignGalleries] = useState(false);
  const [savingDesignGallery, setSavingDesignGallery] = useState(false);
  const [deletingDesignGalleryId, setDeletingDesignGalleryId] = useState('');
  const [editingGalleryId, setEditingGalleryId] = useState('');
  const [selectedGalleryVariantId, setSelectedGalleryVariantId] = useState(null);

  // Gallery handlers
  const handleGalleryImageChange = (idx, value) => {
    setGalleryImages(imgs => imgs.map((img, i) => (i === idx ? value : img)));
  };
  const addGalleryImage = () => setGalleryImages(imgs => [...imgs, '']);
  const removeGalleryImage = idx => setGalleryImages(imgs => imgs.filter((_, i) => i !== idx));
  useEffect(() => {
    setSlug(
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  }, [name]);

  // Fetch categories
  const fetchCats = () => {
    return fetchCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  useEffect(() => {
    const refreshCategories = () => fetchCats();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshCategories();
    };

    window.addEventListener('focus', refreshCategories);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshCategories);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    const loadProduct = async () => {
      setLoadingProduct(true);
      setLoadErr('');
      try {
        const data = await fetchProductById(id);
        const p = data?.product && typeof data.product === 'object' ? data.product : data;
        const vs = Array.isArray(data?.variants) ? data.variants : (Array.isArray(p?.variants) ? p.variants : []);

        if (!p || typeof p !== 'object' || Array.isArray(p)) {
          throw new Error('Invalid product data format');
        }

        setName(p?.name || '');
        setSlug(p?.slug || '');
        setBrand(p?.brand || '');
        setDescription(p?.description || '');
        setAudience(p?.audience || 'unisex');
        setMainImage(p?.main_image || '');
        setVideoUrl(p?.video_url || '');

        setGalleryImages(Array.isArray(p?.images) && p.images.length > 0 ? p.images : []);

        const rawSpecs = p.specifications;
        const specEntries = rawSpecs && typeof rawSpecs === 'object' && !Array.isArray(rawSpecs)
          ? Object.entries(rawSpecs)
          : [];
        setSpecs(specEntries.length > 0 ? specEntries.map(([key, value]) => ({ sk: mk(), key: String(key || ''), value: String(value || '') })) : [newSpec()]);

        setVariantRows(
          vs.length > 0
            ? vs.map(v => ({
              id: v.id || '',
              vk: mk(),
              size: v.size || '',
              color: v.color || '',
              price: v.price ?? '',
              override_discount: v.override_discount ?? false,
              discount_type: v.discount_type || 'Percentage',
              discount_value: v.discount_value ?? '',
              stock: v.stock ?? '',
              sku: v.sku || '',
              image: v.image || '',
              use_separate_gallery: v.use_separate_gallery ?? false
            }))
            : [newVar(p?.main_image || '')]
        );

        setEditProductData(p || null);
      } catch (err) {
        setLoadErr(err.message || 'Failed to load product details');
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, isEditMode, navigate]);

  const loadDesignGalleries = async (productId) => {
    if (!productId) return;

    setLoadingDesignGalleries(true);
    try {
      const galleries = await fetchDesignGalleries(productId);
      setDesignGalleries(Array.isArray(galleries) ? galleries : []);
    } catch (err) {
      setDesignGalleries([]);
      alert(err.message || 'Failed to load design galleries');
    } finally {
      setLoadingDesignGalleries(false);
    }
  };

  useEffect(() => {
    if (!isEditMode || !id) return;
    loadDesignGalleries(id);
  }, [id, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !editProductData?.category_id || categories.length === 0) return;

    const savedCategoryId = normalizeId(editProductData.category_id);
    const targetCategory = categories.find(c => normalizeId(c.id) === savedCategoryId);

    if (!targetCategory) return;

    const getParent = (childId) => {
      const child = categories.find(c => normalizeId(c.id) === normalizeId(childId));
      return child?.parent_id ? categories.find(c => normalizeId(c.id) === normalizeId(child.parent_id)) : null;
    };

    let level1Id = '';
    let level2Id = '';
    let level3Id = '';

    const parent1 = getParent(targetCategory.id);
    if (parent1) {
      const parent2 = getParent(parent1.id);
      if (parent2) {
        level3Id = savedCategoryId;
        level2Id = normalizeId(parent1.id);
        level1Id = normalizeId(parent2.id);
      } else {
        level2Id = savedCategoryId;
        level1Id = normalizeId(parent1.id);
      }
    } else {
      level1Id = savedCategoryId;
    }

    setCategoryId(level1Id);
    setSubcategoryId(level2Id);
    setSubSubcategoryId(level3Id);
  }, [isEditMode, editProductData, categories]);

  const subcategoriesOptions = useMemo(
    () => categories.filter(c => normalizeId(c.parent_id) === normalizeId(categoryId)),
    [categories, categoryId]
  );

  const subSubcategoriesOptions = useMemo(
    () => (subcategoryId ? categories.filter(c => normalizeId(c.parent_id) === normalizeId(subcategoryId)) : []),
    [categories, subcategoryId]
  );

  // Dynamic specifications handlers
  const handleSpecChange = (idx, field, value) => {
    setSpecs(specs => specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };
  const addSpec = () => setSpecs([...specs, newSpec()]);
  const removeSpec = idx => setSpecs(specs => specs.filter((_, i) => i !== idx));

  // --- Variant state and handlers ---
  const [variantRows, setVariantRows] = useState([
    newVar()
  ]);

  // Helper to get product initials
  const getProductInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0]?.toUpperCase() || '')
      .join('');
  };

  // SKU generation logic
  const generateSKU = (brand, name, color, size) => {
    const brandCode = brand?.slice(0, 2).toUpperCase() || '';
    const initials = getProductInitials(name);
    const colorCode = color?.slice(0, 3).toUpperCase() || '';
    const sizeCode = size?.toString().toUpperCase() || '';
    return [brandCode, initials, colorCode, sizeCode].filter(Boolean).join('-');
  };

  // Update variant row and always auto-generate SKU
  const handleVariantChange = (idx, field, value) => {
    setDuplicateSkuError(null);
    setVariantRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      let updated = { ...row, [field]: value };
      updated.sku = generateSKU(brand, name, updated.color, updated.size);
      return updated;
    }));
  };

  // When brand or name changes, update all SKUs
  useEffect(() => {
    setDuplicateSkuError(null);
    setVariantRows(rows => rows.map(row => ({
      ...row,
      sku: generateSKU(brand, name, row.color, row.size)
    })));
    // eslint-disable-next-line
  }, [brand, name]);

  // Keep the primary variant image synced with main image to avoid duplicate entry.
  useEffect(() => {
    setVariantRows((rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return rows;

      if ((rows[0]?.image || '') === (mainImage || '')) {
        return rows;
      }

      return rows.map((row, idx) => (idx === 0 ? { ...row, image: mainImage || '' } : row));
    });
  }, [mainImage]);

  const addVariant = () => setVariantRows([...variantRows, newVar()]);
  const removeVariant = idx => setVariantRows(rows => rows.filter((_, i) => i !== idx));

  const getVariantLabelById = (variantId) => {
    if (!variantId) return 'Shared Gallery';

    const matchedVariant = variantRows.find((variant) => normalizeId(variant.id) === normalizeId(variantId));
    if (!matchedVariant) return 'Variant Gallery';

    const size = matchedVariant.size || 'Size';
    const color = matchedVariant.color || 'Color';
    return `${size} + ${color}`;
  };

  const rem = () => {
    const f = {
      n: '',
      b: '',
      ds: '',
      c: '',
      s: '',
      a: 'unisex',
      m: '',
      vi: '',
      sp: [],
      g: [],
      v: [],
      dc: '',
      di: '',
      dg: [],
    };

    setName(f.n);
    setSlug('');
    setBrand(f.b);
    setDescription(f.ds);
    setCategoryId(f.c);
    setSubcategoryId(f.s);
    setSubSubcategoryId('');
    setAudience(f.a);
    setMainImage(f.m);
    setVideoUrl(f.vi || '');
    setSpecs(f.sp);
    setGalleryImages(f.g);
    setVariantRows(f.v);
    setDesignColorName(f.dc);
    setDesignImagesInput(f.di);
    setDesignVideoInput('');
    setDesignGalleries(f.dg);
    setEditingGalleryId('');
    setDeletingDesignGalleryId('');
    setEditProductData(null);
    setPId('');
    setVal('');
    setImg('');
    setT('category');
    setM(false);
    setActiveTab('general');
    setD(false);
  };

  // Toggle SKU edit mode
  const toggleSkuEditable = (idx) => {
    setVariantRows(rows => rows.map((row, i) => i === idx ? { ...row, skuEditable: !row.skuEditable } : row));
  };
  // Mark SKU as manually edited
  const handleSkuManualEdit = (idx, value) => {
    setDuplicateSkuError(null);
    setVariantRows(rows => rows.map((row, i) => i === idx ? { ...row, sku: value, skuManuallyEdited: true } : row));
  };

  const handleSubmitProduct = async () => {
    if (!categoryId) {
      alert('Please select a category.');
      return;
    }

    setSaving(true);
    setDuplicateSkuError(null);
    try {
      const productData = {
        name,
        slug,
        brand,
        description,
        global_discount_type: 'Percentage',
        global_discount_value: 0,
        category_id: subSubcategoryId || subcategoryId || categoryId,
        audience,
        main_image: mainImage,
        video_url: videoUrl,
        images: galleryImages.filter(Boolean),
        specifications: Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value])),
        variants: variantRows.map(v => ({
          id: v.id || null,
          size: v.size,
          color: v.color,
          price: v.price,
          override_discount: v.override_discount,
          discount_type: v.override_discount ? v.discount_type : 'Percentage',
          discount_value: v.override_discount ? (v.discount_value === '' ? 0 : Number(v.discount_value)) : 0,
          stock: v.stock,
          sku: v.sku,
          image: v.image,
          use_separate_gallery: v.use_separate_gallery || false
        }))
      };

      if (isEditMode) {
        const updated = await updateProduct(id, productData);
        // If backend returned updated product and variants, refresh local state so UI reflects persisted flags
        if (updated && updated.variants) {
          const vs = Array.isArray(updated.variants) ? updated.variants : [];
          setVariantRows(
            vs.length > 0
              ? vs.map(v => ({
                id: v.id || '',
                vk: mk(),
                size: v.size || '',
                color: v.color || '',
                price: v.price ?? '',
                override_discount: v.override_discount ?? false,
                discount_type: v.discount_type || 'Percentage',
                discount_value: v.discount_value ?? '',
                stock: v.stock ?? '',
                sku: v.sku || '',
                image: v.image || '',
                use_separate_gallery: v.use_separate_gallery ?? false
              }))
              : [newVar(mainImage || '')]
          );
          setEditProductData(updated.product || editProductData);
        }
      } else {
        await saveProduct(productData);
      }

      setSaving(false);
      navigate('/products');
    } catch (err) {
      const message = err.message || 'Failed to save product';
      if (err.sku || /duplicate|already exists|unique constraint/i.test(message)) {
        setDuplicateSkuError(err.sku || variantRows.find(v => message.includes(v.sku))?.sku || variantRows.find(v => v.sku)?.sku || null);
        setActiveTab('inventory');
        setSaving(false);
        return;
      }
      setSaving(false);
      alert(message);
    }
  };

  const startEditGallery = (gallery) => {
    setEditingGalleryId(gallery.id);
    setDesignColorName(gallery.color_name);
    setSelectedGalleryVariantId(isUuid(gallery.variant_id) ? String(gallery.variant_id) : null);
    const imageUrls = Array.isArray(gallery.images) ? gallery.images.join('\n') : '';
    setDesignImagesInput(imageUrls);
    setDesignVideoInput(gallery.video_url || '');

    // Scroll to form
    setTimeout(() => {
      const formSection = document.querySelector('[data-gallery-form]');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const cancelEditGallery = () => {
    setEditingGalleryId('');
    setDesignColorName('');
    setDesignImagesInput('');
    setDesignVideoInput('');
    setSelectedGalleryVariantId(null);
  };

  const handleSaveDesignGallery = async () => {
    if (!isEditMode || !id) {
      alert('Please save the product first, then add design galleries.');
      return;
    }

    const normalizedColor = designColorName.trim();
    const parsedImages = designImagesInput
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);
    const normalizedVideoUrl = designVideoInput.trim();

    if (!normalizedColor || parsedImages.length === 0) {
      alert('Please provide color name and at least one image URL.');
      return;
    }

    setSavingDesignGallery(true);
    try {
      await saveDesignGallery({
        id: editingGalleryId || null,
        product_id: id,
        color_name: normalizedColor,
        images: parsedImages,
        video_url: normalizedVideoUrl || null,
        variant_id: isUuid(selectedGalleryVariantId) ? selectedGalleryVariantId : null,
      });
      setDesignColorName('');
      setDesignImagesInput('');
      setDesignVideoInput('');
      setEditingGalleryId('');
      setSelectedGalleryVariantId(null);
      await loadDesignGalleries(id);
    } catch (err) {
      alert(err.message || 'Failed to save design gallery');
    } finally {
      setSavingDesignGallery(false);
    }
  };

  const handleDeleteDesignGallery = async (galleryId) => {
    const confirmed = window.confirm('Delete this design gallery?');
    if (!confirmed) return;

    setDeletingDesignGalleryId(galleryId);
    try {
      await deleteDesignGallery(galleryId);
      setDesignGalleries((prev) => prev.filter((gallery) => gallery.id !== galleryId));
    } catch (err) {
      alert(err.message || 'Failed to delete design gallery');
    } finally {
      setDeletingDesignGalleryId('');
    }
  };

  const openQuickAdd = (type) => {
    if (type === 'subsubcategory' && !subcategoryId) {
      setShowWarningModal(true);
      return;
    }
    setT(type);
    setVal('');
    setImg('');
    setPId(type === 'subsubcategory' ? subcategoryId : type === 'subcategory' ? categoryId : '');
    setM(true);
  };

  const closeQuickAdd = () => {
    if (addingQuickCat) return;
    setM(false);
    setVal('');
    setPId('');
    setImg('');
  };

  const handleQuickAdd = async () => {
    const nameValue = val.trim();
    if (!nameValue || ((t === 'subcategory' || t === 'subsubcategory') && !pId)) return;

    setAddingQuickCat(true);
    try {
      const created = await addCategory({
        name: nameValue,
        image: (t === 'subcategory' || t === 'subsubcategory') ? (img.trim() || null) : null,
        parent_id: (t === 'subcategory' || t === 'subsubcategory') ? pId : null,
      });

      await fetchCats();

      if (t === 'subsubcategory') {
        setSubSubcategoryId(String(created?.id || ''));
      } else if (t === 'subcategory') {
        setCategoryId(String(pId));
        setSubcategoryId(String(created?.id || ''));
        setSubSubcategoryId('');
      } else {
        setCategoryId(String(created?.id || ''));
        setSubcategoryId('');
        setSubSubcategoryId('');
      }

      setPId('');
      setM(false);
      setVal('');
      setImg('');
    } catch (err) {
      alert(err.message || 'Failed to add category');
    } finally {
      setAddingQuickCat(false);
    }
  };

  const activeIdx = Math.max(0, STEPS.findIndex((s) => s.key === activeTab));
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < STEPS.length - 1;

  const stepDone = useMemo(() => {
    const general = Boolean(name.trim() && brand.trim() && description.trim() && categoryId);

    const usedSpecs = specs.filter((s) => String(s?.key || '').trim() || String(s?.value || '').trim());
    const specifications = usedSpecs.length > 0 && usedSpecs.every((s) => String(s?.key || '').trim() && String(s?.value || '').trim());

    const media = Boolean(String(mainImage || '').trim() && galleryImages.some((img) => String(img || '').trim()));

    const inventory =
      Array.isArray(variantRows) &&
      variantRows.length > 0 &&
      variantRows.every((v) => {
        const size = String(v?.size || '').trim();
        const color = String(v?.color || '').trim();
        const price = Number(v?.price);
        const stock = Number(v?.stock);
        return size && color && Number.isFinite(price) && price >= 0 && Number.isFinite(stock) && stock >= 0;
      });

    const galleries = isEditMode ? Array.isArray(designGalleries) && designGalleries.length > 0 : false;

    const offers = true;
    const magic = Boolean(magicFillText.trim() && !magicFillError);

    return {
      magic,
      general,
      specifications,
      media,
      inventory,
      galleries,
      offers,
    };
  }, [name, brand, description, categoryId, specs, mainImage, galleryImages, variantRows, isEditMode, designGalleries, magicFillText, magicFillError]);

  const goNext = () => {
    if (!canNext) return;
    setActiveTab(STEPS[activeIdx + 1].key);
  };

  const goBack = () => {
    if (!canPrev) return;
    setActiveTab(STEPS[activeIdx - 1].key);
  };

  const parentOptions = useMemo(() => categories.filter((c) => c.parent_id === null), [categories]);
  const currentParentOptions = t === 'subsubcategory' ? subcategoriesOptions : parentOptions;
  const canQuickAdd = (t === 'subcategory' || t === 'subsubcategory') ? Boolean(pId && val.trim()) : Boolean(val.trim());
  const variantCols = '8% 10% 12% 8% 20% 22% 14% auto';

  if (isEditMode && !editProductData && loadingProduct) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif' }}>
        Loading...
      </div>
    );
  }

  if (isEditMode && !editProductData && loadErr) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', padding: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 12, padding: 20, maxWidth: 440, width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Unable to load product</h3>
          <p style={{ margin: '8px 0 0', color: '#4b5563', fontSize: 14 }}>{loadErr}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f9',
      fontFamily: 'Poppins, sans-serif',
      paddingBottom: '80px'
    }}>
      <QuickAddModal
        m={m}
        title={t === 'subsubcategory' ? 'Add Sub-Subcategory' : t === 'subcategory' ? 'Add Subcategory' : 'Add Category'}
        val={val}
        setVal={setVal}
        isSubcategory={t === 'subcategory' || t === 'subsubcategory'}
        pId={pId}
        setPId={setPId}
        img={img}
        setImg={setImg}
        parentOptions={currentParentOptions}
        canAdd={canQuickAdd}
        onClose={closeQuickAdd}
        onAdd={handleQuickAdd}
        loading={addingQuickCat}
      />
      {showWarningModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowWarningModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: 24,
              fontFamily: 'Poppins, sans-serif',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ background: '#fef2f2', padding: 12, borderRadius: '50%', color: '#ef4444' }}>
                <AlertTriangle size={32} />
              </div>
            </div>
            <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#111827' }}>
              Action Required
            </h4>
            <p style={{ margin: '8px 0 24px', color: '#4b5563', fontSize: 15 }}>
              Please select a Subcategory first.
            </p>

            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 8,
                border: 'none',
                background: '#000',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {d && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setD(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 320,
            background: 'rgba(15, 23, 42, 0.22)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e4e4e7',
              boxShadow: '0 20px 44px rgba(15, 23, 42, 0.14)',
              padding: 20,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '0.02em' }}>
              Discard Changes?
            </h4>
            <p style={{ margin: '10px 0 0', color: '#4b5563', fontSize: 14, lineHeight: 1.5 }}>
              Are you sure you want to clear all fields? This action cannot be undone.
            </p>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                onClick={() => setD(false)}
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid #e4e4e7',
                  background: 'transparent',
                  color: '#4b5563',
                  padding: '0 14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={rem}
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: '1px solid #c8507a',
                  background: '#c8507a',
                  color: '#ffffff',
                  padding: '0 14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yes, Discard
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-input { transition: border-color 0.2s ease; font-family: 'Poppins', sans-serif; }
        .custom-input:focus { border-color: #000 !important; outline: none; box-shadow: 0 0 0 1px #000; }
        input.custom-input[type='text'],
        input.custom-input[type='url'],
        input.custom-input[type='number'] {
          height: 40px !important;
          box-sizing: border-box;
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        select.custom-input {
          height: 44px !important;
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        textarea.custom-input {
          border-radius: 8px !important;
          background: #f9fafb !important;
        }
        .pf-step-layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .pf-step-layout {
            grid-template-columns: 1fr;
          }
        }
        .pf-select-wrap { position: relative; }
        .pf-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-right: 48px !important;
        }
        .pf-select-icon {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          color: #71717a;
          pointer-events: none;
        }
        .pf-step-pane {
          animation: pf-fade-slide-up 220ms ease;
        }
        .pf-check-anim {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: pf-check-pop 220ms ease-out;
          transform-origin: center;
        }
        @keyframes pf-fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pf-check-pop {
          from {
            opacity: 0;
            transform: scale(0.78);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .pf-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
        }
        .pf-section-title-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #f3d1dc;
          background: #fff1f6;
          color: #c8507a;
        }
        .pf-outline-accent-btn {
          transition: all 0.2s ease;
          background: #ffffff;
          color: #c8507a;
          border: 1px solid #c8507a;
          border-radius: 10px;
          padding: 8px 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          white-space: nowrap;
        }
        .pf-outline-accent-btn:hover {
          background: #fff1f6;
        }
        .pf-image-link-btn {
          transition: all 0.2s ease;
          background: #ffffff;
          color: #c8507a;
          border: 1px solid #e4e4e7;
          border-radius: 10px;
          height: 44px;
          padding: 0 24px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Poppins', sans-serif;
          white-space: nowrap;
          width: fit-content;
        }
        .pf-image-link-btn:hover {
          background: #f9fafb;
        }
        .pf-mini-plus-btn {
          height: 24px;
          border: 1px solid #c8507a;
          border-radius: 8px;
          background: #ffffff;
          color: #c8507a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
          padding: 0 8px;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          font-family: 'Poppins', sans-serif;
        }
        .pf-mini-plus-btn:hover {
          background: #fff1f6;
        }
        .pf-ghost-back-btn {
          height: 40px;
          border: none;
          border-radius: 12px;
          background: #18181b;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .pf-ghost-back-btn:hover {
          background: #27272a;
          color: #ffffff;
        }
        .pf-ghost-action-btn {
          height: 40px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fff1f2;
          color: #dc2626;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .pf-ghost-action-btn:hover {
          background: #fee2e2;
          color: #b91c1c;
        }
        .outline-btn { transition: all 0.2s ease; background: #000 !important; color: #fff !important; border: 1px solid #000 !important; border-radius: 12px !important; padding: 8px 16px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Poppins', sans-serif; white-space: nowrap; }
        .outline-btn:hover { background: #333 !important; border-color: #333 !important; }
        .remove-tag-btn { transition: all 0.2s ease; background: #eee; border: none; border-radius: 50%; width: 28px; height: 28px; padding: 0; cursor: pointer; color: #555; display: inline-flex; align-items: center; justify-content: center; }
        .remove-tag-btn:hover { background: #e53935; color: #fff; }
        .remove-tag-btn svg { width: 14px; height: 14px; stroke-width: 2; flex-shrink: 0; }
        .pf-preview-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 16px;
        }
        .pf-preview-img {
          width: 96px;
          height: 96px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 12px;
          border: 1px solid #f4f4f5;
          transition: transform 200ms ease;
          transform: scale(1);
          display: block;
        }
        .pf-preview-img:hover {
          transform: scale(1.05);
        }
        .auto-sync-tooltip-wrap { position: relative; display: inline-block; }
        .auto-sync-tooltip-bubble {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translateX(-50%) scale(0.96);
          transform-origin: bottom center;
          background: #111827;
          color: #fff;
          font-size: 12px;
          line-height: 1.2;
          text-align: center;
          white-space: nowrap;
          padding: 4px 8px;
          border-radius: 6px;
          opacity: 0;
          pointer-events: none;
          transition: all 200ms ease;
          z-index: 5;
        }
        .auto-sync-tooltip-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 100%;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #111827;
        }
        .auto-sync-tooltip-wrap:hover .auto-sync-tooltip-bubble,
        .auto-sync-tooltip-wrap:focus-within .auto-sync-tooltip-bubble {
          opacity: 1;
          transform: translateX(-50%) scale(1);
        }
      `}</style>
      {/* Sticky Header & Breadcrumbs */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 120,
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '12px 28px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        boxShadow: '0 1px 0 rgba(0,0,0,0.02)',
        borderBottom: '1px solid #f4f4f5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', minWidth: 0 }}>
          <button
            type="button"
            className="pf-ghost-back-btn"
            onClick={() => navigate('/products')}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', minWidth: 0 }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#18181b', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'end' }}>
          <button
            type="button"
            className="pf-ghost-action-btn"
            onClick={() => setD(true)}
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            Discard
          </button>
          <button
            type="button"
            style={{
              background: saving ? '#888' : '#000',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              height: 40,
              padding: '0 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            disabled={saving}
            onClick={handleSubmitProduct}
          >
            {saving && (
              <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
              </svg>
            )}
            {saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '36px auto 0' }}>
        <div className="pf-step-layout">
          <aside
            style={{
              position: 'sticky',
              top: 86,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #eceff3',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              padding: '18px 16px',
            }}
          >
            {STEPS.map((step, idx) => {
              const completed = Boolean(stepDone[step.key]);
              const active = idx === activeIdx;
              const isMagic = step.key === 'magic';
              const lineColor = '#e4e4e7';
              const syncState = magicSyncStates[step.key] || 'idle';
              const isSyncPulse = syncState === 'pulse';
              const isSyncGreen = syncState === 'green';

              return (
                <div key={step.key} style={{ position: 'relative', paddingBottom: idx < STEPS.length - 1 ? 26 : 0 }}>
                  {idx < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 15,
                        top: 32,
                        width: 1,
                        height: 26,
                        background: lineColor,
                      }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab(step.key)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      backdropFilter: 'none',
                      width: '100%',
                      padding: 0,
                      borderRadius: 0,
                      marginLeft: 0,
                      boxShadow: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span
                      className={isSyncPulse ? 'pf-sync-dot sidebar-sync-pulse' : `pf-sync-dot ${isSyncGreen ? 'sidebar-sync-green' : ''}`}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isMagic ? 'none' : ((isSyncGreen || completed) ? '1px solid rgba(34,197,94,0.28)' : active ? 'none' : '1px solid #d4d4d8'),
                        background: isMagic ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' : ((isSyncGreen || completed) ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : active ? '#c8507a' : '#f4f4f5'),
                        color: isMagic ? '#ffffff' : ((isSyncGreen || completed) ? '#ffffff' : active ? '#ffffff' : '#9ca3af'),
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        boxShadow: isMagic ? '0 2px 10px rgba(168, 85, 247, 0.3)' : ((isSyncPulse || isSyncGreen || completed) ? '0 0 12px rgba(34,197,94,0.18)' : 'none')
                      }}
                    >
                      {isMagic ? <Sparkles size={16} /> : ((isSyncGreen || completed) ? <Check size={16} /> : idx)}
                    </span>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: active ? 700 : completed ? 600 : 500,
                        color: isMagic ? '#7c3aed' : (active ? '#111827' : '#64748b'),
                      }}
                    >
                      {step.label}
                    </span>
                  </button>
                </div>
              );
            })}
          </aside>

          <section>
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #eceff3',
                padding: '34px 36px',
              }}
            >
              <div key={activeTab} className="pf-step-pane">
                {activeTab === 'magic' && (
                  <>
                    <div className="pf-section-title" style={{ marginBottom: 24 }}>
                      <span className="pf-section-title-icon" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: '#fff', border: 'none' }}><Sparkles size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Magic Fill Automation</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                      Paste a JSON object to automatically populate general product information, generate specifications, and batch variants.
                    </p>

                    <div style={{ marginBottom: 24 }}>
                      <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        .smart-hub-card {
                          min-height: 820px;
                          height: auto;
                          display: flex;
                          flex-direction: column;
                          font-family: 'Inter', 'Satoshi', 'Poppins', sans-serif;
                          border-radius: 24px;
                          border: 1px solid rgba(255, 255, 255, 0.95);
                          background: linear-gradient(135deg, rgba(248, 250, 252, 0.72), rgba(255, 255, 255, 0.5));
                          backdrop-filter: blur(40px);
                          -webkit-backdrop-filter: blur(40px);
                          box-shadow: 0 12px 40px rgba(124, 58, 237, 0.08);
                          overflow: visible;
                        }
                        .smart-hub-body {
                          flex: 1;
                          min-height: 0;
                          display: flex;
                          flex-direction: column;
                          gap: 0;
                          overflow: visible;
                        }
                        .smart-hub-body {
                          flex: 1;
                          min-height: 0;
                          display: flex;
                          flex-direction: column;
                          gap: 0;
                        }
                        .smart-editor-panel {
                          position: relative;
                          min-height: 240px;
                          border-radius: 24px 24px 0 0;
                          border: 0;
                          background: transparent;
                          overflow: hidden;
                          padding: 24px;
                        }
                        .smart-paste-input {
                          position: absolute;
                          inset: 0;
                          opacity: 0;
                          pointer-events: none;
                          resize: none;
                          border: none;
                          outline: none;
                        }
                        .smart-paste-zone {
                          width: 100%;
                          height: 100%;
                          min-height: 192px;
                          border-radius: 24px;
                          border: 1px dashed rgba(167, 139, 250, 0.7);
                          background: rgba(255, 255, 255, 0.42);
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          gap: 8px;
                          color: #6d28d9;
                          cursor: text;
                          transition: all 0.24s ease;
                        }
                        .smart-paste-zone:hover {
                          border-color: rgba(124, 58, 237, 0.9);
                          background: rgba(255, 255, 255, 0.55);
                        }
                        .smart-paste-title {
                          font-size: 18px;
                          font-weight: 700;
                          color: #4c1d95;
                        }
                        .smart-paste-sub {
                          font-size: 13px;
                          font-weight: 500;
                          color: #64748b;
                          text-align: center;
                          max-width: 460px;
                        }
                        .smart-analyzing-wrap {
                          height: 100%;
                          min-height: 192px;
                          border-radius: 24px;
                          border: 1px dashed rgba(167, 139, 250, 0.6);
                          background: rgba(255, 255, 255, 0.5);
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          gap: 10px;
                        }
                        .smart-analyzing-spinner {
                          width: 38px;
                          height: 38px;
                          border-radius: 999px;
                          border: 2px solid rgba(167, 139, 250, 0.3);
                          border-top-color: #7c3aed;
                          animation: smartSpin 1s linear infinite;
                        }
                        @keyframes smartSpin {
                          to { transform: rotate(360deg); }
                        }
                        .smart-analyzing-title {
                          font-size: 16px;
                          font-weight: 700;
                          color: #5b21b6;
                        }
                        .smart-analyzing-bars {
                          display: flex;
                          gap: 6px;
                        }
                        .smart-analyzing-bars span {
                          width: 6px;
                          height: 16px;
                          border-radius: 999px;
                          background: rgba(124, 58, 237, 0.65);
                          animation: smartBars 1.1s ease-in-out infinite;
                        }
                        .smart-analyzing-bars span:nth-child(2) { animation-delay: 0.12s; }
                        .smart-analyzing-bars span:nth-child(3) { animation-delay: 0.24s; }
                        @keyframes smartBars {
                          0%, 100% { transform: scaleY(0.6); opacity: 0.45; }
                          50% { transform: scaleY(1.2); opacity: 1; }
                        }
                        .smart-hub-insights {
                          position: relative;
                          flex: 1;
                          min-height: 0;
                          display: flex;
                          flex-direction: column;
                          gap: 14px;
                          padding: 20px 22px 24px;
                          border-top: 2px solid #e9d5ff;
                          border-radius: 0 0 24px 24px;
                          background: rgba(248, 250, 252, 0.5);
                          backdrop-filter: blur(14px);
                          -webkit-backdrop-filter: blur(14px);
                        }
                        .smart-intelligence-row {
                          display: grid;
                          grid-template-columns: 200px 1fr;
                          gap: 14px;
                        }
                        .smart-ring-shell {
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        .smart-ring {
                          width: 142px;
                          height: 142px;
                          border-radius: 999px;
                          position: relative;
                          display: grid;
                          place-items: center;
                        }
                        .smart-ring-center {
                          width: 104px;
                          height: 104px;
                          border-radius: 999px;
                          background: rgba(255, 255, 255, 0.92);
                          border: 1px solid rgba(196, 181, 253, 0.35);
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                        }
                        .smart-ring-count {
                          font-size: 28px;
                          font-weight: 800;
                          line-height: 1;
                          color: #4c1d95;
                        }
                        .smart-ring-label {
                          margin-top: 3px;
                          font-size: 11px;
                          color: #64748b;
                          font-weight: 600;
                        }
                        .smart-ring-dot {
                          position: absolute;
                          width: 9px;
                          height: 9px;
                          border-radius: 999px;
                          transform: translate(-50%, -50%);
                        }
                        .smart-ring-dot.ok {
                          background: #22c55e;
                          box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
                        }
                        .smart-ring-dot.miss {
                          background: #ef4444;
                          box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.14);
                        }
                        .smart-summary-stack {
                          display: flex;
                          flex-direction: column;
                          gap: 10px;
                        }
                        .smart-stats-grid {
                          display: grid;
                          grid-template-columns: repeat(4, minmax(0, 1fr));
                          gap: 10px;
                        }
                        .smart-stat-pill {
                          display: flex;
                          flex-direction: column;
                          gap: 6px;
                          border-radius: 16px;
                          border: 1px solid rgba(196, 181, 253, 0.3);
                          background: rgba(167, 139, 250, 0.12);
                          box-shadow: 0 0 0 1px rgba(196, 181, 253, 0.15) inset;
                          padding: 10px 12px;
                          transition: all 0.25s ease;
                        }
                        .smart-stat-pill.active {
                          background: rgba(139, 92, 246, 0.2);
                          box-shadow: 0 0 16px rgba(139, 92, 246, 0.15);
                        }
                        .smart-stat-pill.selected {
                          border-color: rgba(124, 58, 237, 0.55);
                          box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.16) inset, 0 10px 24px rgba(124, 58, 237, 0.12);
                        }
                        .smart-stat-pill-head {
                          display: flex;
                          align-items: center;
                          justify-content: space-between;
                          gap: 8px;
                        }
                        .smart-stat-pill .k {
                          display: block;
                          font-size: 10px;
                          text-transform: uppercase;
                          letter-spacing: 0.08em;
                          color: #6b7280;
                          margin-bottom: 4px;
                        }
                        .smart-stat-pill .v {
                          font-size: 14px;
                          font-weight: 700;
                          color: #5b21b6;
                        }
                        .smart-intelligence-tag {
                          display: inline-flex;
                          align-items: center;
                          gap: 10px;
                          border-radius: 999px;
                          width: fit-content;
                          border: 1px solid rgba(255, 255, 255, 0.92);
                          background: rgba(255, 255, 255, 0.55);
                          padding: 9px 14px;
                          backdrop-filter: blur(24px);
                          -webkit-backdrop-filter: blur(24px);
                        }
                        .smart-brain-pulse {
                          width: 24px;
                          height: 24px;
                          border-radius: 999px;
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          color: #7c3aed;
                          background: rgba(167, 139, 250, 0.16);
                          animation: smartBrainPulse 1.6s ease-in-out infinite;
                        }
                        @keyframes smartBrainPulse {
                          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.18); }
                          50% { box-shadow: 0 0 0 6px rgba(124, 58, 237, 0); }
                        }
                        .smart-category-value {
                          font-size: 14px;
                          font-weight: 700;
                          color: #312e81;
                          letter-spacing: 0.01em;
                        }
                        .smart-stat-edit {
                          width: 20px;
                          height: 20px;
                          border-radius: 999px;
                          border: 1px solid rgba(196, 181, 253, 0.46);
                          background: rgba(255, 255, 255, 0.82);
                          color: #7c3aed;
                          display: inline-flex;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          transition: all 0.2s ease;
                          flex-shrink: 0;
                        }
                        .smart-stat-edit:hover,
                        .smart-stat-edit.active {
                          background: rgba(124, 58, 237, 0.12);
                          border-color: rgba(124, 58, 237, 0.58);
                          transform: translateY(-1px);
                        }
                        .smart-blueprint-editor {
                          width: 100%;
                          box-sizing: border-box;
                          border-radius: 12px;
                          border: 1px solid rgba(196, 181, 253, 0.36);
                          background: rgba(255, 255, 255, 0.8);
                          backdrop-filter: blur(18px);
                          -webkit-backdrop-filter: blur(18px);
                          padding: 14px;
                          display: flex;
                          flex-direction: column;
                          gap: 12px;
                          box-shadow: 0 10px 28px rgba(124, 58, 237, 0.08);
                          animation: blueprintEnter 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        }
                        .smart-blueprint-editor.sliding-out {
                          animation: blueprintExit 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
                        }
                        @keyframes blueprintEnter {
                          from {
                            opacity: 0;
                            transform: translateY(-10px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                        @keyframes blueprintExit {
                          from {
                            opacity: 1;
                            transform: translateY(0);
                          }
                          to {
                            opacity: 0;
                            transform: translateY(20px);
                          }
                        }
                        .smart-blueprint-editor-head {
                          display: flex;
                          align-items: flex-start;
                          justify-content: space-between;
                          gap: 12px;
                        }
                        .smart-blueprint-editor-title {
                          font-size: 13px;
                          font-weight: 800;
                          color: #312e81;
                          letter-spacing: 0.01em;
                        }
                        .smart-blueprint-editor-sub {
                          margin-top: 3px;
                          font-size: 11px;
                          color: #64748b;
                        }
                        .smart-blueprint-close,
                        .smart-blueprint-add,
                        .smart-blueprint-action {
                          border-radius: 10px;
                          border: 1px solid rgba(196, 181, 253, 0.36);
                          background: rgba(255, 255, 255, 0.9);
                          color: #5b21b6;
                          font-size: 12px;
                          font-weight: 700;
                          cursor: pointer;
                          transition: all 0.2s ease;
                        }
                        .smart-blueprint-close:hover,
                        .smart-blueprint-add:hover,
                        .smart-blueprint-action:hover {
                          background: rgba(124, 58, 237, 0.08);
                          border-color: rgba(124, 58, 237, 0.45);
                        }
                        .smart-blueprint-close {
                          padding: 8px 12px;
                        }
                        .smart-blueprint-table-wrap {
                          overflow: hidden;
                          border-radius: 12px;
                          border: 1px solid rgba(196, 181, 253, 0.26);
                          background: rgba(255, 255, 255, 0.92);
                        }
                        .smart-blueprint-table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        .smart-blueprint-table th {
                          text-align: left;
                          font-size: 11px;
                          letter-spacing: 0.08em;
                          text-transform: uppercase;
                          color: #7c3aed;
                          padding: 11px 12px;
                          border-bottom: 1px solid rgba(196, 181, 253, 0.28);
                          background: rgba(245, 243, 255, 0.78);
                        }
                        .smart-blueprint-table td {
                          padding: 10px 12px;
                          border-bottom: 1px solid rgba(226, 232, 240, 0.72);
                          vertical-align: middle;
                        }
                        .smart-blueprint-field {
                          font-size: 13px;
                          font-weight: 700;
                          color: #1f2937;
                        }
                        .smart-blueprint-input {
                          width: 100%;
                          border-radius: 10px;
                          border: 1px solid rgba(196, 181, 253, 0.34);
                          background: rgba(255, 255, 255, 0.94);
                          padding: 9px 10px;
                          font-size: 13px;
                          color: #111827;
                          outline: none;
                          transition: all 0.2s ease;
                        }
                        .smart-blueprint-input:focus {
                          border-color: rgba(124, 58, 237, 0.6);
                          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
                        }
                        .smart-blueprint-fixed {
                          display: inline-flex;
                          align-items: center;
                          border-radius: 999px;
                          padding: 4px 10px;
                          background: rgba(241, 245, 249, 0.92);
                          color: #64748b;
                          font-size: 11px;
                          font-weight: 700;
                        }
                        .smart-blueprint-action {
                          padding: 7px 10px;
                        }
                        .smart-blueprint-add {
                          align-self: flex-start;
                          padding: 9px 14px;
                        }
                        .smart-audit-scroller {
                          max-height: 300px;
                          overflow-y: auto;
                          border-radius: 16px;
                          border: 1px solid rgba(196, 181, 253, 0.3);
                          background: rgba(255, 255, 255, 0.72);
                        }
                        .smart-audit-table {
                          width: 100%;
                          border-collapse: collapse;
                        }
                        .smart-audit-table th {
                          text-align: left;
                          font-size: 11px;
                          letter-spacing: 0.08em;
                          text-transform: uppercase;
                          color: #7c3aed;
                          padding: 11px 12px;
                          border-bottom: 1px solid rgba(196, 181, 253, 0.28);
                          background: rgba(245, 243, 255, 0.75);
                          position: sticky;
                          top: 0;
                          z-index: 1;
                        }
                        .smart-audit-table td {
                          padding: 10px 12px;
                          border-bottom: 1px solid rgba(226, 232, 240, 0.72);
                          font-size: 13px;
                          color: #0f172a;
                        }
                        .smart-audit-status {
                          display: inline-flex;
                          align-items: center;
                          border-radius: 999px;
                          padding: 4px 9px;
                          font-size: 11px;
                          font-weight: 700;
                        }
                        .smart-audit-status.ok {
                          background: rgba(34, 197, 94, 0.15);
                          color: #047857;
                        }
                        .smart-audit-status.err {
                          background: rgba(239, 68, 68, 0.14);
                          color: #b91c1c;
                        }
                        .smart-error-banner {
                          background: rgba(254, 242, 242, 0.9);
                          border: 1px solid rgba(252, 165, 165, 0.5);
                          border-radius: 10px;
                          padding: 10px 12px;
                          color: #b91c1c;
                          font-size: 12px;
                          font-weight: 600;
                          display: flex;
                          align-items: center;
                          gap: 8px;
                        }
                        .smart-hub-actions {
                          position: relative;
                          z-index: 10;
                          display: flex;
                          justify-content: flex-end;
                          gap: 12px;
                          padding: 9px 0 0;
                          margin-top: 20px;
                          margin-bottom: 20px;
                        }
                        .smart-hub-footer {
                          position: relative;
                          z-index: 10;
                          display: flex;
                          justify-content: flex-end;
                        }
                        @keyframes magicApplyPulse {
                          0% { transform: scale(1); box-shadow: 0 10px 20px -10px rgba(124,58,237,0.35); }
                          50% { transform: scale(1.03); box-shadow: 0 14px 28px -10px rgba(124,58,237,0.5); }
                          100% { transform: scale(1); box-shadow: 0 10px 20px -10px rgba(124,58,237,0.35); }
                        }
                        .magic-primary-apply {
                          animation: magicApplyPulse 1.5s ease-in-out infinite;
                        }
                        @media (max-width: 900px) {
                          .smart-hub-card { height: auto; min-height: 860px; }
                          .smart-intelligence-row { grid-template-columns: 1fr; }
                          .smart-ring-shell { justify-content: flex-start; }
                          .smart-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                          .smart-hub-actions {
                            margin-top: 16px;
                            align-self: stretch;
                            justify-content: flex-end;
                          }
                          .smart-hub-insights { padding-bottom: 18px; }
                        }
                        @keyframes smartPulse { 0% { transform: scale(1); } 40% { transform: scale(1.04); } 100% { transform: scale(1); } }
                        .sidebar-sync-pulse { animation: smartPulse 0.7s ease; }
                        .sidebar-sync-green { background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.2)) !important; border-color: rgba(34,197,94,0.3) !important; box-shadow: 0 8px 20px rgba(34,197,94,0.12) !important; }
                        .sidebar-sync-green .pf-sync-dot { background: #22c55e !important; color: #fff !important; }
                      `}</style>

                      {(() => {
                        const hasMagicInput = Boolean(magicFillText.trim());
                        const blueprintData = getMagicBlueprintData();
                        const summarySource = blueprintData || magicPreview?.parsed || null;
                        const generalCount = summarySource ? ['name', 'brand', 'description', 'audience'].filter((k) => String(summarySource?.[k] || '').trim()).length : 0;
                        const specsCount = Array.isArray(summarySource?.specifications)
                          ? summarySource.specifications.length
                          : Array.isArray(summarySource?.specs)
                            ? summarySource.specs.length
                            : 0;
                        const variantsCount = Array.isArray(summarySource?.inventory)
                          ? summarySource.inventory.length
                          : Array.isArray(summarySource?.variants)
                            ? summarySource.variants.length
                            : 0;
                        const level1Cats = categories.filter((c) => c.level === 1 || c.parent_id === null);
                        const categoryLabel = (() => {
                          const catLabel = String(summarySource?.category_label || summarySource?.category || '').toLowerCase().trim();
                          if (!summarySource || !catLabel) return 'Awaiting Category Match...';
                          const matchedCat = level1Cats.find((c) => String(c.name || '').toLowerCase().trim() === catLabel);
                          return matchedCat ? `${matchedCat.name} (ID: ${matchedCat.id})` : `"${summarySource.category_label || summarySource.category}" (No Match)`;
                        })();
                        const categoryMatched = Boolean(summarySource && categoryLabel.includes('(ID:'));
                        const totalMapped = generalCount + (categoryMatched ? 1 : 0) + specsCount + variantsCount;
                        const ringStates = [
                          { key: 'general', label: 'General', ok: generalCount > 0 },
                          { key: 'categories', label: 'Categories', ok: categoryMatched },
                          { key: 'specs', label: 'Specs', ok: specsCount > 0 },
                          { key: 'inventory', label: 'Inventory', ok: variantsCount > 0 },
                        ];
                        const completedGroups = ringStates.filter((s) => s.ok).length;
                        const ringPercent = Math.round((completedGroups / ringStates.length) * 100);
                        const ringDots = [
                          { top: '8%', left: '50%' },
                          { top: '50%', left: '92%' },
                          { top: '92%', left: '50%' },
                          { top: '50%', left: '8%' },
                        ];
                        const activeBlueprintRows = buildMagicBlueprintEditorRows(activeBlueprintGroup, summarySource);

                        return (
                          <div className="smart-hub-card">
                            <div className="smart-hub-body">
                              <div className="smart-editor-panel">
                                <textarea
                                  ref={magicEditorRef}
                                  className="smart-paste-input"
                                  value={magicFillText}
                                  onChange={(e) => {
                                    setMagicFillText(e.target.value);
                                    setMagicFillError('');
                                    setMagicAuditRows([]);
                                  }}
                                  spellCheck={false}
                                  autoComplete="off"
                                  autoCorrect="off"
                                  aria-label="Magic Fill JSON input"
                                />

                                {!hasMagicInput ? (
                                  <button
                                    type="button"
                                    className="smart-paste-zone"
                                    onClick={() => magicEditorRef.current?.focus()}
                                  >
                                    <Sparkles size={22} color="#7c3aed" />
                                    <div className="smart-paste-title">Minimalist Paste Zone</div>
                                    <div className="smart-paste-sub">Click here and paste product JSON to trigger intelligence mapping</div>
                                  </button>
                                ) : isAnalyzing ? (
                                  <div className="smart-analyzing-wrap">
                                    <div className="smart-analyzing-spinner" aria-hidden="true" />
                                    <div className="smart-analyzing-title">Analyzing Data...</div>
                                    <div className="smart-analyzing-bars" aria-hidden="true">
                                      <span />
                                      <span />
                                      <span />
                                    </div>
                                  </div>
                                ) : null}
                              </div>

                              <div className="smart-hub-insights">
                                <div className="smart-intelligence-row">
                                  <div className="smart-ring-shell">
                                    <div
                                      className="smart-ring"
                                      style={{
                                        background: `conic-gradient(#7c3aed ${ringPercent}%, rgba(226, 232, 240, 0.9) ${ringPercent}% 100%)`,
                                      }}
                                    >
                                      <div className="smart-ring-center">
                                        <div className="smart-ring-count">{totalMapped}</div>
                                        <div className="smart-ring-label">Fields Mapped</div>
                                      </div>
                                      {ringDots.map((dot, idx) => (
                                        <span
                                          key={`ring-dot-${idx}`}
                                          className={`smart-ring-dot ${ringStates[idx]?.ok ? 'ok' : 'miss'}`}
                                          style={{ top: dot.top, left: dot.left }}
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="smart-summary-stack">
                                    <div className="smart-stats-grid">
                                      <div className={`smart-stat-pill ${generalCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'general' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">General</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'general' ? 'active' : ''}`}
                                            aria-label="Edit General blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'general';
                                              setActiveBlueprintGroup('general');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{generalCount}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${categoryMatched ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'categories' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">Categories</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'categories' ? 'active' : ''}`}
                                            aria-label="Edit Categories blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'categories';
                                              setActiveBlueprintGroup('categories');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{categoryMatched ? 1 : 0}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${specsCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'specifications' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">Specs</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'specifications' ? 'active' : ''}`}
                                            aria-label="Edit Specs blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'specifications';
                                              setActiveBlueprintGroup('specifications');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{specsCount}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${variantsCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'inventory' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">Inventory</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'inventory' ? 'active' : ''}`}
                                            aria-label="Edit Inventory blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'inventory';
                                              setActiveBlueprintGroup('inventory');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{variantsCount}</span>
                                      </div>
                                    </div>

                                    <div className="smart-intelligence-tag">
                                      <span className="smart-brain-pulse"><Brain size={14} /></span>
                                      <span className="smart-category-value">{categoryLabel}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="smart-hub-footer">
                                  <div className="smart-hub-actions">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        try {
                                          const parsedJson = JSON.parse(magicFillText);
                                          setMagicFillText(JSON.stringify(parsedJson, null, 2));
                                          setMagicFillError('');
                                        } catch (e) {
                                          setMagicFillError('Cannot prettify. Invalid JSON: ' + e.message);
                                        }
                                      }}
                                      onMouseEnter={() => setIsPrettifyHovered(true)}
                                      onMouseLeave={() => setIsPrettifyHovered(false)}
                                      style={{
                                        background: isPrettifyHovered ? 'rgba(124,58,237,0.08)' : '#ffffff',
                                        color: '#5b21b6',
                                        border: '1px solid rgba(124,58,237,0.24)',
                                        borderRadius: 12,
                                        padding: '10px 18px',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: 'Inter, Satoshi, Poppins, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      Prettify JSON
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleMagicFillValidate}
                                      onMouseEnter={() => setIsValidateHovered(true)}
                                      onMouseLeave={() => setIsValidateHovered(false)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        background: isValidateHovered ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.95)',
                                        color: '#5b21b6',
                                        border: '1px solid rgba(196,181,253,0.85)',
                                        borderRadius: 12,
                                        padding: '10px 18px',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: 'Inter, Satoshi, Poppins, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <Check size={14} />
                                      Validate Blueprint
                                    </button>

                                    <button
                                      type="button"
                                      className="magic-primary-apply"
                                      onClick={handleMagicFillApply}
                                      onMouseEnter={() => setIsMagicProcessHovered(true)}
                                      onMouseLeave={() => setIsMagicProcessHovered(false)}
                                      style={{
                                        background: isMagicProcessHovered ? 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 12,
                                        padding: '10px 22px',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: 'Inter, Satoshi, Poppins, sans-serif',
                                        cursor: 'pointer',
                                        boxShadow: '0 12px 26px -12px rgba(79, 70, 229, 0.6)',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      Finalize & Apply
                                    </button>
                                  </div>
                                </div>

                                {isBlueprintEditorOpen && summarySource && (
                                  <div className={`smart-blueprint-editor${isEditorSlidingOut ? ' sliding-out' : ''}`}>
                                    <div className="smart-blueprint-editor-head">
                                      <div>
                                        <div className="smart-blueprint-editor-title">Blueprint Detail Editor</div>
                                        <div className="smart-blueprint-editor-sub">Inline edits update the mapped blueprint immediately.</div>
                                      </div>
                                      <button
                                        type="button"
                                        className="smart-blueprint-close"
                                        onClick={() => setIsBlueprintEditorOpen(false)}
                                      >
                                        Close
                                      </button>
                                    </div>

                                    <div className="smart-blueprint-table-wrap">
                                      <table className="smart-blueprint-table">
                                        <thead>
                                          <tr>
                                            <th>Field Name</th>
                                            <th>Detected Value</th>
                                            <th>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {activeBlueprintRows.length > 0 ? activeBlueprintRows.map((row) => (
                                            <tr key={row.id}>
                                              <td>
                                                <span className="smart-blueprint-field">{row.fieldName}</span>
                                              </td>
                                              <td>
                                                {(row.kind === 'specification' || row.kind === 'inventory' || row.kind === 'general' || row.kind === 'category') && (
                                                  <input
                                                    className="smart-blueprint-input"
                                                    value={row.value}
                                                    onChange={(e) => {
                                                      if (row.kind === 'specification') {
                                                        updateMagicBlueprintSpecification(row.index, 'value', e.target.value);
                                                      } else if (row.kind === 'inventory') {
                                                        updateMagicBlueprintInventory(row.index, e.target.value);
                                                      } else {
                                                        updateMagicBlueprintField(row.key, e.target.value);
                                                      }
                                                    }}
                                                  />
                                                )}
                                              </td>
                                              <td>
                                                {row.kind === 'specification' ? (
                                                  <button
                                                    type="button"
                                                    className="smart-blueprint-action"
                                                    onClick={() => removeMagicBlueprintSpecification(row.index)}
                                                  >
                                                    Remove
                                                  </button>
                                                ) : row.kind === 'inventory' ? (
                                                  <button
                                                    type="button"
                                                    className="smart-blueprint-action"
                                                    onClick={() => removeMagicBlueprintInventory(row.index)}
                                                  >
                                                    Remove
                                                  </button>
                                                ) : (
                                                  <span className="smart-blueprint-fixed">Locked</span>
                                                )}
                                              </td>
                                            </tr>
                                          )) : (
                                            <tr>
                                              <td colSpan={3} style={{ color: '#64748b' }}>No editable fields are available for this section.</td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>

                                    {(activeBlueprintGroup === 'specifications' || activeBlueprintGroup === 'inventory') && (
                                      <button
                                        type="button"
                                        className="smart-blueprint-add"
                                        onClick={addMagicBlueprintRow}
                                      >
                                        + Add Field
                                      </button>
                                    )}
                                  </div>
                                )}

                                <div className="smart-audit-scroller">
                                  <table className="smart-audit-table">
                                    <thead>
                                      <tr>
                                        <th>ID</th>
                                        <th>Step</th>
                                        <th>Type</th>
                                        <th>Timestamp</th>
                                        <th>Action</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {magicAuditRows.length > 0 ? magicAuditRows.map((row) => (
                                        <tr key={`${row.id}-${row.step}-${row.type}`}>
                                          <td>{row.id}</td>
                                          <td>{row.step}</td>
                                          <td>{row.type}</td>
                                          <td>{row.timestamp}</td>
                                          <td>{row.action}</td>
                                          <td>
                                            <span className={`smart-audit-status ${row.status === 'Error' ? 'err' : 'ok'}`}>
                                              {row.status}
                                            </span>
                                          </td>
                                        </tr>
                                      )) : (
                                        <tr>
                                          <td colSpan={6} style={{ color: '#64748b' }}>Paste JSON to begin. Validate Blueprint previews actions without applying data.</td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>

                                {magicFillError && (
                                  <div className="smart-error-banner">
                                    <AlertTriangle size={14} />
                                    {magicFillError}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </>
                )}
                {activeTab === 'general' && (
                  <>
                     <div className="pf-section-title">
                       <span className="pf-section-title-icon"><Info size={16} /></span>
                       <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>General Details</h3>
                     </div>
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontWeight: 500 }}>Product Name</label>
                      <input
                        className="custom-input"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500 }}>Target Audience</label>
                        <div className="pf-select-wrap">
                          <select
                            className="custom-input pf-select"
                            value={audience}
                            onChange={aud => {
                              setAudience(aud.target.value);
                              setHighlightAudience(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: highlightAudience ? '2px solid #eab308' : '1px solid #a0a0a0',
                              background: highlightAudience ? '#fef9c3' : '#fff',
                              marginTop: 4,
                              transition: 'all 0.2s ease',
                            }}
                            required
                          >
                            <option value="unisex">Unisex</option>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="kids">Kids</option>
                          </select>
                          <ChevronDown size={16} className="pf-select-icon" style={{ top: 'calc(50% + 2px)' }} />
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500 }}>Slug (auto-generated)</label>
                        <input
                          className="custom-input"
                          type="text"
                          value={slug}
                          readOnly
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', background: '#f5f6fa', marginTop: 4 }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontWeight: 500 }}>Brand</label>
                      <input
                        className="custom-input"
                        type="text"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                        placeholder="Enter brand name"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontWeight: 500 }}>Description</label>
                      <textarea
                        className="custom-input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', minHeight: 80, marginTop: 4 }}
                        placeholder="Enter product description"
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 4 }}>
                      {/* ── Level 1: Category ── */}
                      <div>
                        <label style={{ fontWeight: 500, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          Category
                          <button type="button" className="pf-mini-plus-btn" onClick={() => openQuickAdd('category')} title="Quick add category">
                            <span>+</span>
                          </button>
                        </label>
                        <div className="pf-select-wrap">
                          <select
                            className="custom-input pf-select"
                            value={categoryId}
                            onChange={e => {
                              setCategoryId(e.target.value);
                              setSubcategoryId('');
                              setSubSubcategoryId('');
                              setHighlightCategory(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: highlightCategory ? '2px solid #eab308' : '1px solid #a0a0a0',
                              background: highlightCategory ? '#fef9c3' : '#fff',
                              transition: 'all 0.2s ease',
                            }}
                            required
                          >
                            <option value="">Select category</option>
                            {categories.filter(c => c.level === 1 || c.parent_id === null).map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="pf-select-icon" />
                        </div>
                      </div>

                      {/* ── Level 2: Subcategory ── */}
                      <div>
                        <label style={{ fontWeight: 500, color: !categoryId ? '#aaa' : '#000', display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          Subcategory
                          <button
                            type="button"
                            className="pf-mini-plus-btn"
                            onClick={() => openQuickAdd('subcategory')}
                            title="Quick add subcategory"
                          >
                            <span>+</span>
                          </button>
                        </label>
                        <div className="pf-select-wrap">
                          <select
                            className="custom-input pf-select"
                            value={subcategoryId}
                            onChange={e => {
                              setSubcategoryId(e.target.value);
                              setSubSubcategoryId('');
                              setHighlightSubcategory(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: highlightSubcategory ? '2px solid #eab308' : '1px solid #a0a0a0',
                              opacity: !categoryId ? 0.6 : 1,
                              background: highlightSubcategory ? '#fef9c3' : (!categoryId ? '#f5f6fa' : '#fff'),
                              transition: 'all 0.2s ease',
                            }}
                            disabled={!categoryId}
                          >
                            <option value="">Select subcategory</option>
                            {subcategoriesOptions.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="pf-select-icon" />
                        </div>
                      </div>

                      {/* ── Level 3: Sub-Subcategory ── */}
                      <div>
                        <label style={{ fontWeight: 500, color: (!subcategoryId || subSubcategoriesOptions.length === 0) ? '#aaa' : '#000', display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                          Sub-Subcategory
                          <button
                            type="button"
                            className="pf-mini-plus-btn"
                            onClick={() => openQuickAdd('subsubcategory')}
                            title="Quick add sub-subcategory"
                          >
                            <span>+</span>
                          </button>
                        </label>
                        <div className="pf-select-wrap">
                          <select
                            className="custom-input pf-select"
                            value={subSubcategoryId}
                            onChange={e => {
                              setSubSubcategoryId(e.target.value);
                              setHighlightSubSubcategory(false);
                            }}
                            disabled={!subcategoryId || subSubcategoriesOptions.length === 0}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: highlightSubSubcategory ? '2px solid #eab308' : '1px solid #a0a0a0',
                              opacity: (!subcategoryId || subSubcategoriesOptions.length === 0) ? 0.6 : 1,
                              background: highlightSubSubcategory ? '#fef9c3' : ((!subcategoryId || subSubcategoriesOptions.length === 0) ? '#f5f6fa' : '#fff'),
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <option value="">
                              {!subcategoryId
                                ? 'Select subcategory first'
                                : subSubcategoriesOptions.length === 0
                                  ? 'No sub-subcategories'
                                  : 'Select sub-subcategory'}
                            </option>
                            {subSubcategoriesOptions.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>


                  </>
                )}

                {activeTab === 'specifications' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Layers size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Specifications</h3>
                    </div>
                    <div style={{ marginBottom: 6 }}>
                      <label style={{ fontWeight: 500 }}>Product Specifications</label>
                      {specs.map((spec, idx) => (
                        <div key={spec.sk || `spec-${idx}`} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                          <input
                            className="custom-input"
                            type="text"
                            value={spec.key}
                            onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                            placeholder="Key (e.g. Material)"
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                          />
                          <input
                            className="custom-input"
                            type="text"
                            value={spec.value}
                            onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                            placeholder="Value (e.g. Cotton)"
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            title="Remove specification"
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: 8,
                              padding: 8,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="pf-outline-accent-btn" onClick={addSpec} style={{ marginTop: 8 }}><Plus size={14} />Add Specification</button>
                    </div>
                  </>
                )}

                {activeTab === 'media' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Image size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Media</h3>
                    </div>
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ fontWeight: 500 }}>Main Image URL</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="custom-input"
                          type="text"
                          value={mainImage}
                          onChange={e => setMainImage(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                          placeholder="Paste Cloudinary main image URL"
                          required
                        />
                        {mainImage && (
                          <button
                            type="button"
                            onClick={() => setMainImage('')}
                            title="Clear image URL"
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: 'calc(50% + 2px)',
                              transform: 'translateY(-50%)',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: 6,
                              padding: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {mainImage && (
                        <img src={mainImage} alt="Main" style={{ marginTop: 10, maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                      )}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ fontWeight: 500 }}>Product Video URL</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="custom-input"
                          type="text"
                          value={videoUrl}
                          onChange={e => setVideoUrl(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                          placeholder="Paste Cloudinary video link (e.g., https://res.cloudinary.com/.../video.mp4)"
                        />
                        {videoUrl && (
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            title="Clear video URL"
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: 'calc(50% + 2px)',
                              transform: 'translateY(-50%)',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: 6,
                              padding: 6,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {videoUrl && (
                        <video
                          src={videoUrl}
                          controls
                          muted
                          playsInline
                          className="w-full max-h-[300px] rounded-lg border border-gray-200 shadow-sm"
                          style={{ marginTop: 10, width: '100%', maxHeight: 300, borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                        />
                      )}
                      {videoUrl && !/\.(mp4|webm|mov)$/i.test(videoUrl) && (
                        <div style={{ marginTop: 6, color: '#d97706', fontSize: 12 }}>
                          Warning: URL does not end with a common video extension (.mp4, .webm, .mov)
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontWeight: 500 }}>Gallery Image URLs</label>
                      {galleryImages.map((img, idx) => (
                        <div key={`g-${idx}-${String(img || '').slice(0, 24)}`} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                          <input
                            className="custom-input"
                            type="text"
                            value={img}
                            onChange={e => handleGalleryImageChange(idx, e.target.value)}
                            placeholder="Paste Cloudinary image URL"
                            style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: '1px solid #a0a0a0' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            title="Remove image URL"
                            style={{
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: 'none',
                              borderRadius: 8,
                              padding: 8,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="pf-image-link-btn" onClick={addGalleryImage} style={{ marginTop: 4 }}><Plus size={14} />Add Image Link</button>
                    </div>

                    {(() => {
                      const imgs = galleryImages.filter(Boolean);
                      if (imgs.length === 0) return null;

                      return (
                        <div className="pf-preview-grid">
                          {imgs.map((url, i) => (
                            <img key={`gp-${i}-${String(url || '').slice(0, 24)}`} src={url} alt="Gallery" className="pf-preview-img" />
                          ))}
                        </div>
                      );
                    })()}
                    <div style={{ color: '#888', fontSize: 14, marginTop: 16 }}>
                      (Paste Cloudinary image links. You can add as many as you want.)
                    </div>
                  </>
                )}

                {activeTab === 'inventory' && (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <div className="pf-section-title" style={{ margin: 0 }}>
                        <span className="pf-section-title-icon"><Box size={16} /></span>
                        <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Inventory</h3>
                      </div>
                    </div>
                    <label style={{ fontWeight: 600, marginBottom: 16, display: 'block', fontSize: 13, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>Product Variants</label>
                    <div className="custom-scrollbar-container" style={{ width: '100%', overflowX: 'auto', marginBottom: 16, fontFamily: 'Poppins, sans-serif' }}>
                      <div style={{ minWidth: 950, padding: '0 4px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: variantCols,
                            gap: 12,
                            background: '#f8f9fa',
                            borderBottom: '2px solid #e9ecef',
                            padding: '10px 10px',
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Size</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Color</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Price</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Stock</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>SKU</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Image</div>
                          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Sep. Gallery</div>
                          <div />
                        </div>

                        <div style={{ display: 'grid', gap: 8 }}>
                          {variantRows.map((variant, index) => {
                            const currentSku = variant.sku.trim();
                            const isLocalDuplicate = currentSku !== '' && variantRows.findIndex(v => v.sku.trim() === currentSku) !== index;
                            const hasDuplicateSkuError = isLocalDuplicate || duplicateSkuError === variant.sku;

                            return (
                              <div
                                key={variant.vk || `var-${index}`}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: variantCols,
                                  gap: 12,
                                  alignItems: 'center',
                                  borderBottom: '1px solid #f1f3f5',
                                  padding: '5px 10px',
                                }}
                              >
                                <input className="custom-input" type="text" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                <input className="custom-input" type="text" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                <input className="custom-input" type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                <input className="custom-input" type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                <div
                                  className={`relative w-full rounded-md ${hasDuplicateSkuError ? 'border border-red-500' : 'border border-transparent'}`}
                                  style={{
                                    position: 'relative',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <input
                                    className={`custom-input ${hasDuplicateSkuError ? 'border-red-500 focus:ring-red-500' : ''}`}
                                    type="text"
                                    value={variant.sku}
                                    readOnly
                                    style={{
                                      width: '100%',
                                      height: 40,
                                      padding: '0 8px',
                                      borderRadius: 12,
                                      border: hasDuplicateSkuError ? '1px solid #ef4444' : '1px solid #a0a0a0',
                                      background: '#f5f6fa',
                                      color: '#888',
                                      textAlign: 'center'
                                    }}
                                  />
                                  {hasDuplicateSkuError && (
                                    <p
                                      className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap"
                                      style={{
                                        position: 'absolute',
                                        bottom: -18,
                                        left: 2,
                                        margin: 0,
                                        fontSize: 11,
                                        lineHeight: 1,
                                        color: '#ef4444',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      SKU already exists
                                    </p>
                                  )}
                                </div>
                                {index === 0 ? (
                                  <span className="auto-sync-tooltip-wrap" style={{ width: '100%' }}>
                                    <input
                                      className="custom-input"
                                      type="text"
                                      value={variant.image}
                                      readOnly
                                      style={{
                                        width: '100%',
                                        height: 40,
                                        padding: '0 8px',
                                        borderRadius: 12,
                                        border: '1px solid #d1d5db',
                                        background: '#f3f4f6',
                                        color: '#6b7280',
                                        cursor: 'text',
                                        textAlign: 'center'
                                      }}
                                      placeholder="Auto-synced"
                                    />
                                    <span className="auto-sync-tooltip-bubble" role="tooltip">
                                      Auto-synced from Main Image
                                      <span className="auto-sync-tooltip-arrow" />
                                    </span>
                                  </span>
                                ) : (
                                  <input
                                    className="custom-input"
                                    type="text"
                                    value={variant.image}
                                    onChange={e => handleVariantChange(index, 'image', e.target.value)}
                                    style={{
                                      width: '100%',
                                      height: 40,
                                      padding: '0 8px',
                                      borderRadius: 12,
                                      border: '1px solid #a0a0a0',
                                      background: '#fff',
                                      color: '#111',
                                      cursor: 'text',
                                      textAlign: 'center'
                                    }}
                                  />
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={variant.use_separate_gallery || false}
                                    onChange={e => handleVariantChange(index, 'use_separate_gallery', e.target.checked)}
                                    title="Use separate gallery images for this variant"
                                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeVariant(index)}
                                  title="Remove variant"
                                  style={{
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: 12,
                                    height: 40,
                                    width: 40,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    justifySelf: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="pf-outline-accent-btn" onClick={addVariant}><Plus size={14} />Add Variant</button>
                  </>
                )}

                {activeTab === 'galleries' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Image size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Design Specific Galleries</h3>
                    </div>
                    {!isEditMode ? (
                      <div style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                        Save the product first, then you can add color-specific galleries.
                      </div>
                    ) : (
                      <>
                        <div data-gallery-form>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 500 }}>Variant Selection</label>
                            <select
                              value={selectedGalleryVariantId || ''}
                              onChange={(e) => setSelectedGalleryVariantId(e.target.value || null)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4, fontFamily: 'Poppins, sans-serif' }}
                            >
                              <option value="">All Variants (Shared Gallery)</option>
                              {variantRows.length > 0 && variantRows
                                .filter((variant) => Boolean(variant.id) && Boolean(variant.use_separate_gallery))
                                .map((variant) => (
                                  <option key={variant.id} value={variant.id}>
                                    {variant.size && variant.color ? `${variant.size} + ${variant.color}` : 'Variant'}
                                  </option>
                                ))}
                            </select>
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 500 }}>Color Name</label>
                            <input
                              className="custom-input"
                              type="text"
                              value={designColorName}
                              onChange={(e) => setDesignColorName(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                              placeholder="e.g. Red, Floral, Midnight Blue"
                            />
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 500 }}>Image URLs (comma or new line separated)</label>
                            <textarea
                              className="custom-input"
                              value={designImagesInput}
                              onChange={(e) => setDesignImagesInput(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', minHeight: 100, marginTop: 4 }}
                              placeholder={'https://res.cloudinary.com/.../image1.jpg\nhttps://res.cloudinary.com/.../image2.jpg'}
                            />
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontWeight: 500 }}>Color Video URL (optional)</label>
                            <input
                              className="custom-input"
                              type="text"
                              value={designVideoInput}
                              onChange={(e) => setDesignVideoInput(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4 }}
                              placeholder="https://res.cloudinary.com/.../video.mp4"
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="outline-btn"
                              onClick={handleSaveDesignGallery}
                              disabled={savingDesignGallery}
                              style={{ opacity: savingDesignGallery ? 0.7 : 1 }}
                            >
                              {savingDesignGallery ? (editingGalleryId ? 'Updating Gallery...' : 'Saving Gallery...') : (editingGalleryId ? 'Update Gallery' : 'Save Gallery')}
                            </button>
                            {editingGalleryId && (
                              <button
                                type="button"
                                className="pf-ghost-action-btn"
                                onClick={cancelEditGallery}
                              >
                                Cancel Edit
                              </button>
                            )}
                          </div>
                        </div>

                        <div style={{ marginTop: 24 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#111' }}>Added Galleries</h4>
                          {loadingDesignGalleries ? (
                            <div style={{ color: '#666', fontSize: 14 }}>Loading galleries...</div>
                          ) : designGalleries.length === 0 ? (
                            <div style={{ color: '#666', fontSize: 14 }}>No design specific galleries added yet.</div>
                          ) : (
                            <div style={{ display: 'grid', gap: 8 }}>
                              {designGalleries.map((gallery) => (
                                <div key={gallery.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 12 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ fontWeight: 600, color: '#111' }}>{gallery.color_name}</div>
                                      <div style={{ fontSize: 12, color: '#6b7280' }}>{getVariantLabelById(gallery.variant_id)}</div>
                                      {gallery.video_url && (
                                        <a
                                          href={gallery.video_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="View Video"
                                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: '#f0f0f0', color: '#555', textDecoration: 'none', fontSize: 12, fontWeight: 500, transition: 'all 0.2s ease' }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#e8e8e8';
                                            e.currentTarget.style.color = '#333';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f0f0f0';
                                            e.currentTarget.style.color = '#555';
                                          }}
                                        >
                                          <Video size={12} />
                                          View Video
                                        </a>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <button
                                        type="button"
                                        onClick={() => startEditGallery(gallery)}
                                        title="Edit gallery"
                                        style={{
                                          background: '#f9fafb',
                                          color: '#374151',
                                          border: '1px solid #e5e7eb',
                                          borderRadius: 8,
                                          padding: 8,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          transition: 'background 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDesignGallery(gallery.id)}
                                        disabled={deletingDesignGalleryId === gallery.id}
                                        title="Delete gallery"
                                        style={{
                                          background: '#fef2f2',
                                          color: '#ef4444',
                                          border: 'none',
                                          borderRadius: 8,
                                          padding: 8,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          transition: 'background 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="pf-preview-grid" style={{ marginTop: 12 }}>
                                    {(gallery.images || []).map((url, i) => (
                                      <img
                                        key={`${gallery.id}-${i}`}
                                        src={url}
                                        alt={`${gallery.color_name} ${i + 1}`}
                                        className="pf-preview-img"
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeTab === 'offers' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Box size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Offers & Discounts</h3>
                    </div>
                    <label style={{ fontWeight: 600, marginBottom: 16, display: 'block', fontSize: 13, textTransform: 'uppercase', color: '#888', letterSpacing: '0.5px' }}>Variant Discount Configuration</label>
                    <div style={{ display: 'grid', gap: 16, fontFamily: 'Poppins, sans-serif' }}>
                      {variantRows.map((variant, index) => {
                        const originalPrice = Number(variant.price) || 0;
                        const hasOverride = variant.override_discount || false;
                        const discType = variant.discount_type || 'Percentage';
                        const discValue = Number(variant.discount_value) || 0;

                        // Safe math calculation
                        let finalPrice = originalPrice;
                        if (hasOverride) {
                          if (discType === 'Percentage') {
                            finalPrice = originalPrice * (1 - discValue / 100);
                          } else {
                            finalPrice = originalPrice - discValue;
                          }
                        }
                        if (finalPrice < 0) finalPrice = 0;

                        return (
                          <div
                            key={`offer-${index}`}
                            style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)',
                              border: '1px solid rgba(228, 228, 231, 0.6)',
                              borderRadius: 16,
                              padding: 20,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                              gap: 16,
                              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
                            }}
                          >
                            {/* Top Part: Variant Info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>
                                  Variant #{index + 1} ({variant.size || 'No Size'} / {variant.color || 'No Color'})
                                </h4>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                                  SKU: {variant.sku || 'N/A'} | Stock: {variant.stock || 0}
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={hasOverride}
                                    onChange={(e) => handleVariantChange(index, 'override_discount', e.target.checked)}
                                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                                  />
                                  Apply Discount
                                </label>
                              </div>
                            </div>

                            {/* Right Part: Inputs & Price Summary Card horizontally aligned side-by-side */}
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24 }}>
                              {hasOverride && (
                                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                  <div style={{ width: 180 }}>
                                    <label style={{ fontSize: 12, fontWeight: 500, color: '#4b5563', marginBottom: 4, display: 'block' }}>Type</label>
                                    <select
                                      className="custom-input"
                                      value={discType}
                                      onChange={(e) => handleVariantChange(index, 'discount_type', e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', height: 38 }}
                                    >
                                      <option value="Percentage">Percentage (%)</option>
                                      <option value="Fixed">Fixed (₹)</option>
                                    </select>
                                  </div>
                                  <div style={{ width: 100 }}>
                                    <label style={{ fontSize: 12, fontWeight: 500, color: '#4b5563', marginBottom: 4, display: 'block' }}>Value</label>
                                    <input
                                      className="custom-input"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      placeholder="0"
                                      value={variant.discount_value || ''}
                                      onChange={(e) => handleVariantChange(index, 'discount_value', e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', height: 38 }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Price Summary Card */}
                              <div
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 12,
                                  padding: '12px 16px',
                                  width: 296,
                                  minWidth: 296,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 8,
                                  fontFamily: 'Poppins, sans-serif',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>Original Price</span>
                                  <span style={{ fontSize: 13, textDecoration: hasOverride ? 'line-through' : 'none', color: hasOverride ? '#94a3b8' : '#1e293b', fontWeight: 600 }}>
                                    ₹{originalPrice.toFixed(2)}
                                  </span>
                                </div>
                                {hasOverride && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 400 }}>Discount</span>
                                      <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                                        {discType === 'Percentage' ? `${discValue}%` : `₹${discValue.toFixed(2)}`}
                                      </span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '2px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 400 }}>Final Price</span>
                                      <span style={{ fontSize: 15, color: '#16a34a', fontWeight: 700 }}>
                                        ₹{finalPrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: 28, paddingTop: 14, borderTop: '1px solid #eef0f3', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={goBack}
                  disabled={!canPrev}
                  style={{
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d4d4d8',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: canPrev ? 'pointer' : 'not-allowed',
                    opacity: canPrev ? 1 : 0.5,
                  }}
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNext}
                  style={{
                    background: '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: canNext ? 'pointer' : 'not-allowed',
                    opacity: canNext ? 1 : 0.5,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {editingDiscountVariantIndex !== null && (
        <div className="cart-offers-modal-overlay" onClick={() => setEditingDiscountVariantIndex(null)} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, width: 300 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>Custom Discount (Variant {editingDiscountVariantIndex + 1})</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Discount Type</label>
              <select className="custom-input" value={variantRows[editingDiscountVariantIndex].discount_type || 'Percentage'} onChange={e => handleVariantChange(editingDiscountVariantIndex, 'discount_type', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, marginTop: 4 }}>
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Discount Value</label>
              <input className="custom-input" type="number" value={variantRows[editingDiscountVariantIndex].discount_value} onChange={e => handleVariantChange(editingDiscountVariantIndex, 'discount_value', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, marginTop: 4 }} />
            </div>
            <button type="button" onClick={() => setEditingDiscountVariantIndex(null)} style={{ background: '#ff3f6c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', width: '100%' }}>Done</button>
          </div>
        </div>
      )}

      {/* Floating Success/Warning Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            background: toastType === 'success' ? '#10b981' : '#f59e0b',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 12,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Check size={18} />
          {toastMsg}
        </div>
      )}

      {/* Glassmorphic Quick Paste Modal */}
      {showQuickPasteModal && (
        <div
          onClick={() => {
            if (!isProcessingSuccess) {
              setShowQuickPasteModal(false);
              setQuickPasteText('');
              setQuickPasteWarning('');
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <style>{`
            @keyframes premiumModalScaleIn {
              from { transform: scale(0.96); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
            .premium-modal-card {
              animation: premiumModalScaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            textarea.quick-paste-textarea {
              background: rgba(255, 255, 255, 0.5) !important;
              background-color: rgba(255, 255, 255, 0.5) !important;
              color: #1e293b !important;
              font-family: 'Fira Code', 'Courier New', Courier, monospace !important;
            }
            .custom-preview-panel::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-preview-panel::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-preview-panel::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.1);
              border-radius: 10px;
            }
            .custom-preview-panel:hover::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.15);
            }
          `}</style>
          <div
            className="premium-modal-card"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 32,
              width: '85%',
              height: '85%',
              maxWidth: 1200,
              maxHeight: 800,
              padding: 40,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
            }}
            onClick={e => e.stopPropagation()}
          >
            {isProcessingSuccess ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <div
                  className="pulsing-checkmark"
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '4px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    marginBottom: 20,
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <Check size={44} strokeWidth={3} />
                </div>
                <h4 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#059669' }}>Variants Imported!</h4>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: '#047857' }}>Adding new variants to inventory list...</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Quick Paste Variants
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    Paste raw CSV/Tab-separated lines or a valid JSON array. Each variant requires: <strong>Size, Color, Price, Stock</strong>.
                  </p>
                </div>

                {/* 2-Column Code-Editor IDE Area */}
                <div style={{ display: 'flex', gap: 28, flex: 1, minHeight: 0, marginBottom: 24 }}>
                  {/* Left Column: Light Editor */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, fontFamily: 'monospace' }}>
                        DATA INPUT (JSON or CSV FORMAT)
                      </label>
                      <button
                        type="button"
                        onClick={handlePrettifyPaste}
                        onMouseEnter={() => setIsPrettifyHovered(true)}
                        onMouseLeave={() => setIsPrettifyHovered(false)}
                        style={{
                          background: isPrettifyHovered ? 'rgba(79, 70, 229, 0.1)' : 'rgba(79, 70, 229, 0.04)',
                          color: '#4f46e5',
                          border: '1px solid rgba(79, 70, 229, 0.25)',
                          borderRadius: 8,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        ✨ Prettify JSON
                      </button>
                    </div>

                    <textarea
                      className="custom-input quick-paste-textarea"
                      value={quickPasteText}
                      onChange={e => setQuickPasteText(e.target.value)}
                      onFocus={() => setIsTextareaFocused(true)}
                      onBlur={() => setIsTextareaFocused(false)}
                      placeholder={'[ \n  { "size": "M", "color": "Red", "price": 150, "stock": 100 }\n]\n\nOR\n\nM, Red, 150, 100'}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        flex: 1,
                        padding: 24,
                        borderRadius: 16,
                        border: isTextareaFocused ? '1px solid #6366f1' : '1px solid #cbd5e1',
                        background: 'rgba(255, 255, 255, 0.5)',
                        boxShadow: isTextareaFocused ? 'inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 12px rgba(99, 102, 241, 0.2)' : 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                        color: '#1e293b',
                        fontFamily: 'Fira Code, Courier New, Courier, monospace',
                        fontSize: 13,
                        lineHeight: 1.6,
                        resize: 'none',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </div>

                  {/* Right Column: Live Highlighted Preview */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', height: 26 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, fontFamily: 'monospace' }}>
                        LIVE PREVIEW & SYNTAX VALIDATION
                      </label>
                    </div>

                    <div
                      className="custom-preview-panel"
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        padding: 24,
                        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                        overflowY: 'auto',
                        color: '#334155',
                      }}
                    >
                      {(() => {
                        if (!quickPasteText.trim()) {
                          return (
                            <div style={{ color: '#94a3b8', fontStyle: 'italic', fontFamily: 'monospace', fontSize: 13 }}>
                              Waiting for code input to generate preview...
                            </div>
                          );
                        }
                        try {
                          if (quickPasteText.trim().startsWith('[') || quickPasteText.trim().startsWith('{')) {
                            const parsed = JSON.parse(quickPasteText);
                            const pretty = JSON.stringify(parsed, null, 2);
                            const tokens = pretty.split('\n').map((line, idx) => {
                              const match = line.match(/^(\s*)"([^"]+)":\s*(.*)$/);
                              if (match) {
                                const indent = match[1];
                                const key = match[2];
                                const val = match[3];
                                return (
                                  <div key={idx} style={{ fontFamily: 'Fira Code, monospace', fontSize: 13, lineHeight: '1.6', whiteSpace: 'pre' }}>
                                    <span>{indent}</span>
                                    <span style={{ color: '#059669', fontWeight: 600 }}>"{key}"</span>: <span style={{ color: '#ea580c' }}>{val}</span>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} style={{ fontFamily: 'Fira Code, monospace', fontSize: 13, lineHeight: '1.6', color: '#475569', whiteSpace: 'pre' }}>
                                  {line}
                                </div>
                              );
                            });
                            return <div style={{ textAlign: 'left' }}>{tokens}</div>;
                          } else {
                            const lines = quickPasteText.split('\n').filter(l => l.trim());
                            return (
                              <div style={{ textAlign: 'left' }}>
                                <div style={{ color: '#4f46e5', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                                  Parsed CSV Rows:
                                </div>
                                {lines.map((line, idx) => {
                                  const parts = line.split(/[,\t]+/).map(p => p.trim());
                                  return (
                                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, fontFamily: 'Fira Code, monospace', fontSize: 13, alignItems: 'center' }}>
                                      <span style={{ color: '#94a3b8', width: 24, display: 'inline-block' }}>{idx + 1}</span>
                                      {parts.map((p, pIdx) => {
                                        let color = '#334155';
                                        let label = '';
                                        if (pIdx === 0) { color = '#059669'; label = 'Size'; }
                                        if (pIdx === 1) { color = '#0284c7'; label = 'Color'; }
                                        if (pIdx === 2) { color = '#ea580c'; label = 'Price'; }
                                        if (pIdx === 3) { color = '#7c3aed'; label = 'Stock'; }
                                        return (
                                          <span key={pIdx} style={{ color, background: 'rgba(0,0,0,0.03)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(0,0,0,0.04)', fontSize: 11 }}>
                                            <strong style={{ opacity: 0.6, marginRight: 4, fontWeight: 500, fontSize: 10 }}>{label}:</strong>{p}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                        } catch (e) {
                          return (
                            <div style={{ color: '#b91c1c', fontFamily: 'Fira Code, monospace', fontSize: 13, textAlign: 'left', background: 'rgba(239, 68, 68, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                              <strong style={{ color: '#ef4444', display: 'block', marginBottom: 4 }}>⚠️ Syntax Error</strong>
                              {e.message}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {quickPasteWarning && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      color: '#b91c1c',
                      fontSize: 12,
                      fontWeight: 500,
                      marginBottom: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={14} />
                    {quickPasteWarning}
                  </div>
                )}

                {/* Bottom Footer Actions */}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuickPasteModal(false);
                      setQuickPasteText('');
                      setQuickPasteWarning('');
                    }}
                    onMouseEnter={() => setIsCancelHovered(true)}
                    onMouseLeave={() => setIsCancelHovered(false)}
                    style={{
                      background: isCancelHovered ? 'rgba(241, 245, 249, 0.6)' : 'transparent',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: 12,
                      padding: '12px 28px',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      transform: isCancelHovered ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessQuickPaste}
                    onMouseEnter={() => setIsProcessHovered(true)}
                    onMouseLeave={() => setIsProcessHovered(false)}
                    style={{
                      background: isProcessHovered ? 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 12,
                      padding: '12px 32px',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      boxShadow: isProcessHovered ? '0 10px 25px -5px rgba(99, 102, 241, 0.4)' : '0 4px 15px rgba(99, 102, 241, 0.2)',
                      transform: isProcessHovered ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Process Input
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
}

export default ProductForm;
