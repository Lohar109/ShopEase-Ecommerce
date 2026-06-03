import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Award, BadgeCheck, Bath, BatteryCharging, Bed, Bluetooth, Box, Brain, Briefcase, Check, ChevronDown, Clipboard, Clock, Code, Coffee, Cpu, Crown, Database, Diamond, Droplets, Edit2, Fingerprint, Flower, Folder, Gift, Globe, Hammer, HardDrive, Headphones, Heart, HelpCircle, Home, Image, Info, Keyboard, Lamp, Layers, Layout, Leaf, MapPin, Medal, Monitor, Moon, Mouse, Package, Palette, PenTool, Plane, Plus, Recycle, Ruler, Scale, Scissors, Shield, ShieldCheck, Ship, ShoppingBag, Smartphone, Smile, Sofa, Sparkles, Star, Sun, ThumbsUp, Trash2, Truck, Utensils, Verified, Video, Wifi, Wind, Wrench, X, Zap, Bone, Activity } from 'lucide-react';

                                      <option value="" disabled hidden>
                                        Select Value
                                      </option>
const CrystalIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0%" stopColor="#A855F7" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <g filter="url(#f1)">
      <path d="M12 2L16.5 8.5L12 22L7.5 8.5L12 2Z" fill="url(#g1)" stroke="rgba(255,255,255,0.36)" strokeWidth="0.6" />
    </g>
  </svg>
);
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConfirmModal from '../components/ConfirmModal';
import QuickAddModal from '../components/QuickAddModal';
import { useAdmin } from '../context/AdminContext';
import { addCategory } from '../services/categoryService';
import {
  deleteDesignGallery,
  fetchDesignGalleries,
  fetchProductById,
  saveDesignGallery,
  saveProduct,
  updateProduct,
  updateVariantDiscount
} from '../services/productService';

const STEPS = [
  { key: 'magic', label: 'Magic Fill', icon: Sparkles },
  { key: 'general', label: 'General' },
  { key: 'specifications', label: 'Specifications' },
  { key: 'media', label: 'Media' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'galleries', label: 'Galleries' },
  { key: 'offers', label: 'Offers' },
  { key: 'overview', label: 'Overview' },
  { key: 'inclusions', label: 'Inclusions' },
  { key: 'how_to_use', label: 'How to Use' },
  { key: 'faqs', label: 'FAQs' },
];

const normalizeId = (value) => String(value ?? '').trim();
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizeId(value));
const MAGIC_FILL_DRAFT_KEY = 'shopease.productform.magicfill.draft';

const formatAudienceLabel = (aud) => {
  return aud
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ICON_CATEGORIES = [
  {
    group: "Trust & Quality",
    icons: ["Award", "BadgeCheck", "ShieldCheck", "Star", "Medal", "Verified", "ThumbsUp", "Heart", "Sparkles", "Zap", "Fingerprint", "Crown"]
  },
  {
    group: "Shipping & Service",
    icons: ["Truck", "Box", "Package", "Globe", "Clock", "Plane", "Ship", "ShoppingBag", "Gift", "Headphones", "MapPin"]
  },
  {
    group: "Home & Lifestyle",
    icons: ["Home", "Bed", "Sofa", "Lamp", "Bath", "Utensils", "Coffee", "Leaf", "Recycle", "Droplets", "Wind", "Sun", "Moon", "Flower"]
  },
  {
    group: "Tech & Specs",
    icons: ["Smartphone", "Monitor", "Cpu", "Code", "Database", "BatteryCharging", "Wifi", "Bluetooth", "HardDrive", "Mouse", "Keyboard"]
  },
  {
    group: "Materials & Design",
    icons: ["Layers", "Layout", "Scissors", "PenTool", "Ruler", "Palette", "Hammer", "Wrench", "Diamond", "Scale"]
  }
];

const IconSearchableSelect = ({ value, onChange, iconCategories, renderIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = (iconCategories || []).map(group => {
    const matchedIcons = (group.icons || []).filter(icon =>
      String(icon).toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...group, icons: matchedIcons };
  }).filter(group => group.icons.length > 0);

  const handleSelect = (option) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: '0 0 160px', alignSelf: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="custom-input"
          type="text"
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "Search icons..." : (value || "Select Icon")}
          style={{
            width: '100%',
            padding: '10px 34px 10px 14px',
            borderRadius: 12,
            border: '1px solid #a0a0a0',
            cursor: 'text',
            background: '#fff',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            maxHeight: '280px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 999,
            padding: '6px',
          }}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((group, gIdx) => (
              <div key={group.group || gIdx}>
                <div style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderTop: gIdx > 0 ? '1px solid #f3f4f6' : 'none',
                  marginTop: gIdx > 0 ? '4px' : 0
                }}>
                  {group.group}
                </div>
                {(group.icons || []).map((option) => {
                  const isSelected = value === option;
                  return (
                    <div
                      key={option}
                      onClick={() => handleSelect(option)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ color: '#c8507a', display: 'flex', alignItems: 'center' }}>
                        {renderIcon(option)}
                      </span>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#374151', 
                        fontWeight: isSelected ? 600 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {option}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
              No matching icons
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const mk = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const newSpec = () => ({ sk: mk(), key: '', value: '' });
  const parseVariantSize = (rawSize = '') => {
    const normalized = String(rawSize || '').trim();
    if (!normalized) return { size_value: '', size_unit: '', size_info: '' };

    const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z%]+)?\s*(.*)$/);
    if (!match) return { size_value: normalized, size_unit: '', size_info: '' };

    return {
      size_value: String(match[1] || '').trim(),
      size_unit: String(match[2] || '').trim(),
      size_info: String(match[3] || '').trim(),
    };
  };

  const composeVariantSize = (variant = {}) => {
    const fallback = parseVariantSize(variant?.size || '');
    const sizeValue = String(variant?.size_value || fallback.size_value || '').trim();
    const sizeUnit = String(variant?.size_unit || fallback.size_unit || '').trim();
    const subSize = String(variant?.sub_size || '').trim();
    const subSizeUnit = String(variant?.sub_size_unit || '').trim();
    const sizeInfo = String(variant?.size_info || fallback.size_info || '').trim();
    const base = [sizeValue, sizeUnit].filter(Boolean).join(' ');
    const subBase = [subSize, subSizeUnit].filter(Boolean).join(' ');
    return [base, subBase, sizeInfo].filter(Boolean).join(' ').trim();
  };

  const newVar = (img = '') => ({
    vk: mk(),
    size_value: '',
    sub_size: '',
    size_unit: '',
    sub_size_unit: '',
    variety: '',
    variety_label: '',
    size_info: '',
    color: '',
    price: '',
    override_discount: false,
    discount_type: 'Percentage',
    discount_value: '',
    stock: '',
    sku: '',
    image: img,
    use_separate_gallery: false
  });
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
  const [audience, setAudience] = useState('');
  const [activeSubStep, setActiveSubStep] = useState(1);
  const [overviewSubstepperCompleted, setOverviewSubstepperCompleted] = useState(false);
  const [overviewData, setOverviewData] = useState({
    intro: { heading: '', text: '', bullets: [{ icon: 'Check', text: '' }] },
    use_cases: [{ image: '', icon: 'Layout', label: '', description: '' }],
    perfect_for: [{ icon: 'Smile', label: '' }],
    why_love_it: [{ icon: 'Heart', text: '' }]
  });
  const [inclusions, setInclusions] = useState({
    title: '',
    description: '',
    hero_image_url: '',
    items: [{ short_description: '', image_url: '' }]
  });
  const [howToUse, setHowToUse] = useState({
    title: '',
    description: '',
    tip: '',
    hero_image_url: '',
    items: [{ short_description: '', image_url: '' }]
  });
  const [faqs, setFaqs] = useState([]);
  const [faqsHeaderImage, setFaqsHeaderImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [audiencesLoading, setAudiencesLoading] = useState(false);
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
  const [specDescription, setSpecDescription] = useState('');
  const [specVideoUrl, setSpecVideoUrl] = useState('');
  const [specImage, setSpecImage] = useState('');
  const [spec_bottom_banner, setSpec_bottom_banner] = useState('');
  const [specs, setSpecs] = useState([newSpec()]);
  const newHighlight = () => ({ icon: 'Zap', value: '', title: '', subtitle: '' });
  const [specHighlights, setSpecHighlights] = useState({ grid_title: '', grid_items: [newHighlight(), newHighlight(), newHighlight()] });
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isCancelHovered, setIsCancelHovered] = useState(false);
  const [isProcessHovered, setIsProcessHovered] = useState(false);
  const [isPrettifyHovered, setIsPrettifyHovered] = useState(false);
  const [isClearHovered, setIsClearHovered] = useState(false);
  const [isValidateHovered, setIsValidateHovered] = useState(false);
  const [showMagicFillModal, setShowMagicFillModal] = useState(false);
  const [magicFillText, setMagicFillText] = useState('');
  const [magicFillError, setMagicFillError] = useState('');
  const [highlightCategory, setHighlightCategory] = useState(false);
  const [highlightSubcategory, setHighlightSubcategory] = useState(false);
  const [highlightSubSubcategory, setHighlightSubSubcategory] = useState(false);
  const [highlightAudience, setHighlightAudience] = useState(false);
  const [saveValidationErrors, setSaveValidationErrors] = useState({
    name: false,
    brand: false,
    description: false,
    category: false,
    subcategory: false,
    audience: false,
    mainImage: false,
    videoUrl: false,
    galleryImages: false,
    specifications: {
      specDescription: false,
      specImage: false,
      specVideoUrl: false,
      specBottomBanner: false,
      specRows: [],
      highlightsTitle: false,
      highlightRows: [],
    },
    inventory: [],
    overview: {
      introHeading: false,
      introDescription: false,
      introBullets: [],
      useCases: [],
      perfectFor: [],
      whyLoveIt: [],
    },
    inclusions: {
      title: false,
      heroImageUrl: false,
      description: false,
      items: [],
    },
    howToUse: {
      title: false,
      heroImageUrl: false,
      description: false,
      tip: false,
      items: [],
    },
    faqs: {
      headerImage: false,
      rows: [],
    },
  });
  const [isMagicProcessHovered, setIsMagicProcessHovered] = useState(false);
  const {
    categories: cachedCategories,
    audiences: cachedAudiences,
    getCategories: getCachedCategories,
    getAudiences: getCachedAudiences,
    addCategory: syncAddCategory,
    addAudience: syncAddAudience,
    updateAudience: syncUpdateAudience,
    deleteAudience: syncDeleteAudience,
  } = useAdmin();
  const [isMagicCancelHovered, setIsMagicCancelHovered] = useState(false);
  const [magicAuditRows, setMagicAuditRows] = useState([]);
  const [magicSyncStates, setMagicSyncStates] = useState({ general: 'idle', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  const [activeBlueprintGroup, setActiveBlueprintGroup] = useState('general');
  const [isBlueprintEditorOpen, setIsBlueprintEditorOpen] = useState(false);
  const [isEditorSlidingOut, setIsEditorSlidingOut] = useState(false);
  const magicEditorRef = useRef(null);
  const magicPreviewRef = useRef(null);
  const magicAuditTableRef = useRef(null);
  const magicSyncTimersRef = useRef([]);
  const [animatingRowIds, setAnimatingRowIds] = useState(new Set());
  const [spinnerRowIds, setSpinnerRowIds] = useState(new Set());
  const [magicLabPulse, setMagicLabPulse] = useState(false);
  const [magicRingCount, setMagicRingCount] = useState(0);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showQuickPasteModal, setShowQuickPasteModal] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [quickPasteWarning, setQuickPasteWarning] = useState('');
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [audienceName, setAudienceName] = useState('');
  const [addingAudience, setAddingAudience] = useState(false);
  const [showManageAudiencesModal, setShowManageAudiencesModal] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState(null);
  const [editingAudienceName, setEditingAudienceName] = useState('');
  const [isEditAudienceIconHovered, setIsEditAudienceIconHovered] = useState(false);
  const [isCloseAudienceButtonHovered, setIsCloseAudienceButtonHovered] = useState(false);
  const [audienceToDelete, setAudienceToDelete] = useState(null);
  const [deletingAudience, setDeletingAudience] = useState(false);
  const magicLabPulseTimerRef = useRef(null);
  const magicRingTimerRef = useRef(null);

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

  const resetMagicFillState = () => {
    clearMagicSyncTimers();
    setMagicFillText('');
    setMagicFillError('');
    setMappedData(null);
    setMagicAuditRows([]);
    setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });
    setMagicRingCount(0);
    setMagicLabPulse(false);
    setIsBlueprintEditorOpen(false);
    setIsEditorSlidingOut(false);
    setIsAnalyzing(false);

    try {
      sessionStorage.removeItem(MAGIC_FILL_DRAFT_KEY);
    } catch {
      // ignore storage access failures
    }
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

    // Inventory: Variety, Sub Size, Sub Unit are OPTIONAL — only include when present in source data
    const normalizeInventoryRows = (rows) => {
      const sourceRows = Array.isArray(rows) ? rows : [];
      return sourceRows.map((item) => {
        const parsedSize = parseVariantSize(item?.size || '');
        const row = {
          size_value: String(item?.size_value || parsedSize.size_value || ''),
          size_unit: String(item?.size_unit || parsedSize.size_unit || ''),
          size_info: String(item?.size_info || item?.extra_info || parsedSize.size_info || ''),
          color: String(item?.color || ''),
          price: String(item?.price ?? ''),
          stock: String(item?.stock ?? ''),
          sku: String(item?.sku || ''),
          image: String(item?.image || ''),
        };
        // Only attach optional fields when the source data explicitly provides them
        const variety = String(item?.variety_label || item?.variety || '');
        if (variety) row.variety_label = variety;
        const subSize = String(item?.sub_size || '');
        if (subSize) row.sub_size = subSize;
        const subUnit = String(item?.sub_size_unit || item?.sub_unit || '');
        if (subUnit) row.sub_size_unit = subUnit;
        return row;
      });
    };

    // Overview helpers
    const normalizeOverviewBullets = (src) => {
      const arr = Array.isArray(src?.overview_key_features)
        ? src.overview_key_features
        : Array.isArray(src?.overview?.intro?.bullets)
          ? src.overview.intro.bullets
          : Array.isArray(src?.intro?.bullets)
            ? src.intro.bullets
            : [];
      return arr.map((b) => ({
        icon: String(b?.icon || 'Check'),
        text: String(b?.text || b?.label || ''),
      })).filter((b) => b.text);
    };

    const normalizePerfectFor = (src) => {
      const arr = Array.isArray(src?.perfect_for_scenarios)
        ? src.perfect_for_scenarios
        : Array.isArray(src?.perfect_for)
          ? src.perfect_for
          : Array.isArray(src?.overview?.perfect_for)
            ? src.overview.perfect_for
            : [];
      return arr.map((p) => ({
        icon: String(p?.icon || 'Smile'),
        label: String(p?.label || p?.text || ''),
      })).filter((p) => p.label);
    };

    const normalizeWhyLoveIt = (src) => {
      const arr = Array.isArray(src?.value_proposition)
        ? src.value_proposition
        : Array.isArray(src?.why_love_it)
          ? src.why_love_it
          : Array.isArray(src?.overview?.why_love_it)
            ? src.overview.why_love_it
            : [];
      return arr.map((w) => ({
        icon: String(w?.icon || 'Heart'),
        text: String(w?.text || w?.label || ''),
      })).filter((w) => w.text);
    };

    const normalizeInclusionsItems = (src) => {
      const arr = Array.isArray(src?.inclusions_items)
        ? src.inclusions_items
        : Array.isArray(src?.inclusions?.items)
          ? src.inclusions.items
          : [];
      return arr.map((i) => ({
        short_description: String(i?.short_description || i?.text || i?.name || ''),
        image_url: String(i?.image_url || i?.image || ''),
      })).filter((i) => i.short_description);
    };

    const normalizeHowToUseSteps = (src) => {
      const arr = Array.isArray(src?.how_to_use_steps)
        ? src.how_to_use_steps
        : Array.isArray(src?.how_to_use?.items)
          ? src.how_to_use.items
          : [];
      return arr.map((s) => ({
        short_description: String(s?.short_description || s?.text || s?.step || s?.name || ''),
        image_url: String(s?.image_url || s?.image || ''),
      })).filter((s) => s.short_description);
    };

    const normalizeFaqs = (src) => {
      const arr = Array.isArray(src?.faqs) ? src.faqs : [];
      return arr.map((f) => ({
        question: String(f?.question || f?.q || ''),
        answer: String(f?.answer || f?.a || ''),
      })).filter((f) => f.question);
    };

    const overviewBullets = normalizeOverviewBullets(parsed);
    const perfectFor = normalizePerfectFor(parsed);
    const whyLoveIt = normalizeWhyLoveIt(parsed);
    const inclusionsItems = normalizeInclusionsItems(parsed);
    const howToUseSteps = normalizeHowToUseSteps(parsed);
    const faqsList = normalizeFaqs(parsed);

    return {
      name: String(parsed.name || ''),
      brand: String(parsed.brand || ''),
      description: String(parsed.description || ''),
      audience: String(parsed.audience || ''),
      category_label: String(parsed.category_label || parsed.category || ''),
      subcategory_label: String(parsed.subcategory_label || parsed.sub_category || ''),
      sub_subcategory_label: String(parsed.sub_subcategory_label || parsed.sub_sub_category || ''),
      specifications: normalizeSpecRows(parsed.specifications || parsed.specs),
      specification_description: String(
        parsed.specification_description ||
        parsed.spec_description ||
        parsed.overview?.specification_description ||
        ''
      ),
      specification_highlights_grid_title: String(
        parsed.specification_highlights_grid_title ||
        parsed.spec_highlights_grid_title ||
        parsed.spec_highlights?.grid_title ||
        ''
      ),
      specification_highlights_items: (() => {
        const src =
          parsed.specification_highlights_items ||
          parsed.spec_highlights?.items ||
          parsed.spec_highlights_items ||
          [];
        const arr = Array.isArray(src) ? src : [];
        return arr.map((h) => ({
          icon: String(h?.icon || 'Zap'),
          value: String(h?.value || h?.stat || ''),
          title: String(h?.title || h?.label || ''),
          subtitle: String(h?.subtitle || h?.description || h?.desc || ''),
        })).filter((h) => h.value || h.title);
      })(),
      inventory: normalizeInventoryRows(parsed.inventory || parsed.variants),
      overview_intro_heading: String(
        parsed.overview_intro_heading ||
        parsed.overview?.intro?.heading ||
        parsed.intro?.heading ||
        ''
      ),
      overview_intro_description: String(
        parsed.overview_intro_description ||
        parsed.overview?.intro?.text ||
        parsed.intro?.text ||
        ''
      ),
      overview_key_features: overviewBullets,
      perfect_for_scenarios: perfectFor,
      value_proposition: whyLoveIt,
      inclusions_title: String(
        parsed.inclusions_title ||
        parsed.inclusions?.title ||
        ''
      ),
      inclusions_description: String(
        parsed.inclusions_description ||
        parsed.inclusions?.description ||
        ''
      ),
      inclusions_items: inclusionsItems,
      how_to_use_title: String(
        parsed.how_to_use_title ||
        parsed.how_to_use?.title ||
        ''
      ),
      how_to_use_description: String(
        parsed.how_to_use_description ||
        parsed.how_to_use?.description ||
        ''
      ),
      how_to_use_tip: String(
        parsed.how_to_use_tip ||
        parsed.how_to_use?.tip ||
        ''
      ),
      how_to_use_steps: howToUseSteps,
      faqs: faqsList,
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
      variant.size_value ? `Size: ${variant.size_value}` : '',
      variant.size_unit ? `Unit: ${variant.size_unit}` : '',
      variant.sub_size ? `Sub Size: ${variant.sub_size}` : '',
      variant.sub_size_unit ? `Sub Unit: ${variant.sub_size_unit}` : '',
      variant.variety_label ? `Variety: ${variant.variety_label}` : '',
      variant.size_info ? `Extra Info: ${variant.size_info}` : '',
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

    // Track which optional fields were explicitly mentioned in the editor value
    const mentionedOptionals = { variety: false, sub_size: false, sub_unit: false };

    raw.split('|').forEach((segment) => {
      const [rawKey, ...rest] = segment.split(':');
      const key = String(rawKey || '').trim().toLowerCase();
      const segmentValue = rest.join(':').trim();

      if (!key) return;
      if (key === 'size') {
        const parsedSize = parseVariantSize(segmentValue);
        nextVariant.size_value = parsedSize.size_value;
        nextVariant.size_unit = parsedSize.size_unit;
        nextVariant.size_info = parsedSize.size_info;
      }
      else if (key === 'size value') nextVariant.size_value = segmentValue;
      else if (key === 'unit' || key === 'size unit') nextVariant.size_unit = segmentValue;
      else if (key === 'sub size' || key === 'sub_size' || key === 'subsize') {
        nextVariant.sub_size = segmentValue;
        mentionedOptionals.sub_size = true;
      }
      else if (key === 'sub unit' || key === 'sub_unit' || key === 'subunit') {
        nextVariant.sub_size_unit = segmentValue;
        mentionedOptionals.sub_unit = true;
      }
      else if (key === 'variety' || key === 'variety label' || key === 'variety_label') {
        nextVariant.variety_label = segmentValue;
        mentionedOptionals.variety = true;
      }
      else if (key === 'extra info' || key === 'size info') nextVariant.size_info = segmentValue;
      else if (key === 'color') nextVariant.color = segmentValue;
      else if (key === 'price') nextVariant.price = segmentValue;
      else if (key === 'stock') nextVariant.stock = segmentValue;
      else if (key === 'sku') nextVariant.sku = segmentValue;
      else if (key === 'image') nextVariant.image = segmentValue;
    });

    // If an optional field was NOT mentioned in the editor, clear it so it doesn't persist from fallback
    if (!mentionedOptionals.variety) nextVariant.variety_label = '';
    if (!mentionedOptionals.sub_size) nextVariant.sub_size = '';
    if (!mentionedOptionals.sub_unit) nextVariant.sub_size_unit = '';

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
      const rows = [];
      // Meta fields first
      if (data.specification_description !== undefined)
        rows.push({ id: 'spec_desc', fieldName: 'Spec Description', value: data.specification_description || '', kind: 'general', key: 'specification_description', editable: true });
      if (data.specification_highlights_grid_title !== undefined)
        rows.push({ id: 'spec_grid_title', fieldName: 'Highlights Grid Title', value: data.specification_highlights_grid_title || '', kind: 'general', key: 'specification_highlights_grid_title', editable: true });
      // Highlight items
      (data.specification_highlights_items || []).forEach((h, i) =>
        rows.push({ id: `spec_hl_${i}`, fieldName: `Highlight ${i + 1}`, value: [h.icon && `Icon:${h.icon}`, h.value && `Value:${h.value}`, h.title && `Title:${h.title}`, h.subtitle && `Subtitle:${h.subtitle}`].filter(Boolean).join(' | '), kind: 'general', key: `__hl_${i}`, editable: false })
      );
      // Spec rows
      const sourceRows = Array.isArray(data.specifications) ? data.specifications : (Array.isArray(data.specs) ? data.specs : []);
      sourceRows.forEach((item, index) => rows.push({
        id: `spec-${index}`,
        fieldName: item?.key || `Specification ${index + 1}`,
        value: item?.value || '',
        kind: 'specification',
        index,
        editable: true,
      }));
      return rows;
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

    if (group === 'overview') {
      const rows = [];
      rows.push({ id: 'ov_heading', fieldName: 'Intro Heading', value: data.overview_intro_heading || '', kind: 'general', key: 'overview_intro_heading', editable: true });
      rows.push({ id: 'ov_desc', fieldName: 'Intro Description', value: data.overview_intro_description || '', kind: 'general', key: 'overview_intro_description', editable: true });
      (data.overview_key_features || []).forEach((b, i) =>
        rows.push({ id: `ov_feat_${i}`, fieldName: `Key Feature ${i + 1}`, value: b.text || '', kind: 'overview_bullet', index: i, editable: true })
      );
      (data.perfect_for_scenarios || []).forEach((p, i) =>
        rows.push({ id: `pf_${i}`, fieldName: `Perfect For ${i + 1}`, value: p.label || '', kind: 'perfect_for', index: i, editable: true })
      );
      (data.value_proposition || []).forEach((w, i) =>
        rows.push({ id: `vp_${i}`, fieldName: `Why Love It ${i + 1}`, value: w.text || '', kind: 'why_love_it', index: i, editable: true })
      );
      return rows;
    }

    if (group === 'inclusions') {
      const rows = [];
      rows.push({ id: 'inc_title', fieldName: 'Section Title', value: data.inclusions_title || '', kind: 'general', key: 'inclusions_title', editable: true });
      rows.push({ id: 'inc_desc', fieldName: 'Description', value: data.inclusions_description || '', kind: 'general', key: 'inclusions_description', editable: true });
      (data.inclusions_items || []).forEach((item, i) =>
        rows.push({ id: `inc_item_${i}`, fieldName: `Item ${i + 1}`, value: item.short_description || '', kind: 'inclusion_item', index: i, editable: true })
      );
      return rows;
    }

    if (group === 'how_to_use') {
      const rows = [];
      rows.push({ id: 'htu_title', fieldName: 'Section Title', value: data.how_to_use_title || '', kind: 'general', key: 'how_to_use_title', editable: true });
      rows.push({ id: 'htu_desc', fieldName: 'Description', value: data.how_to_use_description || '', kind: 'general', key: 'how_to_use_description', editable: true });
      rows.push({ id: 'htu_tip', fieldName: 'TIP', value: data.how_to_use_tip || '', kind: 'general', key: 'how_to_use_tip', editable: true });
      (data.how_to_use_steps || []).forEach((step, i) =>
        rows.push({ id: `htu_step_${i}`, fieldName: `Step ${i + 1}`, value: step.short_description || '', kind: 'how_to_use_step', index: i, editable: true })
      );
      return rows;
    }

    if (group === 'faqs') {
      const rows = [];
      (data.faqs || []).forEach((faq, i) => {
        rows.push({ id: `faq_q_${i}`, fieldName: `Q${i + 1}: Question`, value: faq.question || '', kind: 'faq_question', index: i, editable: true });
        rows.push({ id: `faq_a_${i}`, fieldName: `Q${i + 1}: Answer`, value: faq.answer || '', kind: 'faq_answer', index: i, editable: true });
      });
      return rows;
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

  const updateMagicBlueprintOverviewBullet = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.overview_key_features || []).map((b, i) => i === index ? { ...b, text: value } : b);
    commitMagicBlueprintData({ ...baseData, overview_key_features: next });
  };

  const updateMagicBlueprintPerfectFor = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.perfect_for_scenarios || []).map((p, i) => i === index ? { ...p, label: value } : p);
    commitMagicBlueprintData({ ...baseData, perfect_for_scenarios: next });
  };

  const updateMagicBlueprintWhyLoveIt = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.value_proposition || []).map((w, i) => i === index ? { ...w, text: value } : w);
    commitMagicBlueprintData({ ...baseData, value_proposition: next });
  };

  const updateMagicBlueprintInclusionItem = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.inclusions_items || []).map((item, i) => i === index ? { ...item, short_description: value } : item);
    commitMagicBlueprintData({ ...baseData, inclusions_items: next });
  };

  const updateMagicBlueprintHowToUseStep = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.how_to_use_steps || []).map((s, i) => i === index ? { ...s, short_description: value } : s);
    commitMagicBlueprintData({ ...baseData, how_to_use_steps: next });
  };

  const updateMagicBlueprintFaqQuestion = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.faqs || []).map((f, i) => i === index ? { ...f, question: value } : f);
    commitMagicBlueprintData({ ...baseData, faqs: next });
  };

  const updateMagicBlueprintFaqAnswer = (index, value) => {
    const baseData = getMagicBlueprintData();
    if (!baseData) return;
    const next = (baseData.faqs || []).map((f, i) => i === index ? { ...f, answer: value } : f);
    commitMagicBlueprintData({ ...baseData, faqs: next });
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
        inventory: [...(Array.isArray(baseData.inventory) ? baseData.inventory : []), { size_value: '', size_unit: '', size_info: '', color: '', price: '', stock: '', sku: '', image: '' }],
      });
      return;
    }
    if (activeBlueprintGroup === 'specifications') {
      commitMagicBlueprintData({
        ...baseData,
        specifications: [...(Array.isArray(baseData.specifications) ? baseData.specifications : []), { key: '', value: '' }],
      });
      return;
    }
    if (activeBlueprintGroup === 'overview') {
      commitMagicBlueprintData({
        ...baseData,
        overview_key_features: [...(baseData.overview_key_features || []), { icon: 'Check', text: '' }],
      });
      return;
    }
    if (activeBlueprintGroup === 'inclusions') {
      commitMagicBlueprintData({
        ...baseData,
        inclusions_items: [...(baseData.inclusions_items || []), { short_description: '', image_url: '' }],
      });
      return;
    }
    if (activeBlueprintGroup === 'how_to_use') {
      commitMagicBlueprintData({
        ...baseData,
        how_to_use_steps: [...(baseData.how_to_use_steps || []), { short_description: '', image_url: '' }],
      });
      return;
    }
    if (activeBlueprintGroup === 'faqs') {
      commitMagicBlueprintData({
        ...baseData,
        faqs: [...(baseData.faqs || []), { question: '', answer: '' }],
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

  useEffect(() => {
    resetMagicFillState();

    return () => {
      resetMagicFillState();
    };
    // Reset whenever the route identity changes so a previous product session cannot leak into the next one.
  }, [id, isEditMode]);


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
        const sizes = varArr.map(v => composeVariantSize(v)).filter(Boolean);
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
    else if (audVal === 'adult dog' || audVal === 'adult dogs') matchedAudience = 'adult dog';

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
    if (mappedSpecsCount > 0) addAuditRow('Step 2', 'Specs', `${mappedSpecsCount} specifications auto-mapped`);
    if (data.specification_description) addAuditRow('Step 2', 'Specs', 'Spec Description Auto-Mapped');
    if (data.specification_highlights_grid_title) addAuditRow('Step 2', 'Specs', 'Highlights Grid Title Auto-Mapped');

    const varArr = data.inventory || data.variants;
    if (Array.isArray(varArr) && varArr.length > 0) {
      addAuditRow('Step 3', 'Inventory', `${varArr.length} variants auto-mapped`);
      const hasVariety = varArr.some(v => v.variety_label || v.variety);
      const hasSubSize = varArr.some(v => v.sub_size);
      if (hasVariety) addAuditRow('Step 3', 'Inventory', 'Variety labels included (product-specific)');
      if (hasSubSize) addAuditRow('Step 3', 'Inventory', 'Sub Size/Unit included (product-specific)');
    }

    if (data.overview_intro_heading) addAuditRow('Step 4', 'Overview', 'Intro Heading Auto-Mapped');
    if (data.overview_intro_description) addAuditRow('Step 4', 'Overview', 'Intro Description Auto-Mapped');
    const featCount = (data.overview_key_features || []).length;
    if (featCount > 0) addAuditRow('Step 4', 'Overview', `${featCount} Key Features Auto-Mapped`);
    const pfCount = (data.perfect_for_scenarios || []).length;
    if (pfCount > 0) addAuditRow('Step 4', 'Overview', `${pfCount} Perfect For Scenarios Auto-Mapped`);
    const vpCount = (data.value_proposition || []).length;
    if (vpCount > 0) addAuditRow('Step 4', 'Overview', `${vpCount} Value Propositions Auto-Mapped`);

    if (data.inclusions_title) addAuditRow('Step 5', 'Inclusions', 'Section Title Auto-Mapped');
    if (data.inclusions_description) addAuditRow('Step 5', 'Inclusions', 'Description Auto-Mapped');
    const incCount = (data.inclusions_items || []).length;
    if (incCount > 0) addAuditRow('Step 5', 'Inclusions', `${incCount} items Auto-Mapped`);

    if (data.how_to_use_title) addAuditRow('Step 6', 'How to Use', 'Section Title Auto-Mapped');
    if (data.how_to_use_description) addAuditRow('Step 6', 'How to Use', 'Description Auto-Mapped');
    if (data.how_to_use_tip) addAuditRow('Step 6', 'How to Use', 'TIP Auto-Mapped');
    const stepsCount = (data.how_to_use_steps || []).length;
    if (stepsCount > 0) addAuditRow('Step 6', 'How to Use', `${stepsCount} steps Auto-Mapped`);

    const faqCount = (data.faqs || []).length;
    if (faqCount > 0) addAuditRow('Step 7', 'FAQs', `${faqCount} Q&As Auto-Mapped`);

    if (auditRows.length === 0) {
      addAuditRow('Scan', 'Blueprint', 'No mappable fields found in current JSON', 'Error');
    }

    return auditRows;
  };

  // Helper function for sequential delays
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Append audit rows sequentially with animation
  const appendAuditRowsSequentially = async (rows) => {
    setMagicAuditRows([]);
    setAnimatingRowIds(new Set());
    setSpinnerRowIds(new Set());

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Show spinner for 100ms
      setSpinnerRowIds((prev) => new Set(prev).add(row.id));
      await delay(100);
      
      // Remove spinner and add row with animation
      setSpinnerRowIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
      
      setAnimatingRowIds((prev) => new Set(prev).add(row.id));
      setMagicAuditRows((prev) => [...prev, row]);
      
      // Auto-scroll to bottom
      await delay(50);
      if (magicAuditTableRef.current) {
        magicAuditTableRef.current.scrollTop = magicAuditTableRef.current.scrollHeight;
      }
      
      // Stagger delay between rows
      await delay(150);
      
      // Remove animation class after fade-in
      setAnimatingRowIds((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    }
  };

  const runMagicFillWorkflow = async (mode = 'apply') => {
    clearMagicSyncTimers();
    const isValidation = mode === 'validate';
    setIsAnalyzing(true);

    try {
      try {
        const data = getMagicBlueprintData() || JSON.parse(magicFillText);
        const auditRows = buildMagicFillAuditRows(data, isValidation ? 'Preview' : 'Success');

        if (isValidation) {
          setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });
          setMagicFillError('');
          await appendAuditRowsSequentially(auditRows);
          setIsAnalyzing(false);
          setToastMsg('Blueprint validated. Audit log refreshed.');
          setToastType('success');
          setTimeout(() => setToastMsg(''), 3000);
          return;
        }

        setMagicSyncStates({ general: 'pulse', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });

        // Sequential sync animation across all 7 sections
        const t1  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, general: 'green' })), 420);
        const t2  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, specifications: 'pulse' })), 650);
        const t3  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, specifications: 'green' })), 1080);
        const t4  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, inventory: 'pulse' })), 1320);
        const t5  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, inventory: 'green' })), 1760);
        const t6  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, overview: 'pulse' })), 2000);
        const t7  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, overview: 'green' })), 2440);
        const t8  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, inclusions: 'pulse' })), 2680);
        const t9  = setTimeout(() => setMagicSyncStates((p) => ({ ...p, inclusions: 'green' })), 3100);
        const t10 = setTimeout(() => setMagicSyncStates((p) => ({ ...p, how_to_use: 'pulse' })), 3340);
        const t11 = setTimeout(() => setMagicSyncStates((p) => ({ ...p, how_to_use: 'green' })), 3760);
        const t12 = setTimeout(() => setMagicSyncStates((p) => ({ ...p, faqs: 'pulse' })), 4000);
        const t13 = setTimeout(() => setMagicSyncStates((p) => ({ ...p, faqs: 'green' })), 4420);

        magicSyncTimersRef.current = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13];

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
        else if (audVal === 'adult dog' || audVal === 'adult dogs') matchedAudience = 'adult dog';

        if (matchedAudience) {
          // Find the audience ID by name
          const matchedAudienceObj = audiences.find((a) => String(a.name || '').toLowerCase().trim() === matchedAudience);
          if (matchedAudienceObj) {
            setAudience(matchedAudienceObj.id);
            setHighlightAudience(false);
          } else {
            setAudience('');
            setHighlightAudience(true);
          }
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
            const parsedSize = parseVariantSize(v.size || '');
            const sizeValue = String(v.size_value || parsedSize.size_value || '');
            const sizeUnit  = String(v.size_unit  || parsedSize.size_unit  || '');
            const sizeInfo  = String(v.size_info  || v.extra_info || parsedSize.size_info || '');
            const color = String(v.color || '');
            const priceVal = Number(v.price || 0);
            const stockVal = Number(v.stock || 0);

            // Optional fields: only include when explicitly provided in source data
            const variety      = String(v.variety_label || v.variety || '');
            const subSize      = String(v.sub_size || '');
            const subSizeUnit  = String(v.sub_size_unit || v.sub_unit || '');

            const size = composeVariantSize({ size_value: sizeValue, size_unit: sizeUnit, size_info: sizeInfo });
            const normalizedSlug = slug || (data.name || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const cleanColor = color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const cleanSize = size.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

            return {
              vk: mk(),
              size_value: sizeValue,
              size_unit: sizeUnit,
              size_info: sizeInfo,
              variety: variety,
              variety_label: variety,
              sub_size: subSize,
              sub_size_unit: subSizeUnit,
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

        // ── Specifications meta ────────────────────────────────────────────
        const specDesc = String(
          data.specification_description ||
          data.spec_description ||
          ''
        );
        if (specDesc) setSpecDescription(specDesc);

        const gridTitle = String(
          data.specification_highlights_grid_title ||
          data.spec_highlights_grid_title ||
          data.spec_highlights?.grid_title ||
          ''
        );
        if (gridTitle) {
          const gridItemsSrc =
            data.specification_highlights_items ||
            data.spec_highlights?.items ||
            data.spec_highlights_items ||
            [];
          const parsedGridItems = Array.isArray(gridItemsSrc) && gridItemsSrc.length > 0
            ? gridItemsSrc.map((h) => ({
                icon: String(h?.icon || 'Zap'),
                value: String(h?.value || h?.stat || ''),
                title: String(h?.title || h?.label || ''),
                subtitle: String(h?.subtitle || h?.description || h?.desc || ''),
              }))
            : null;
          setSpecHighlights((prev) => ({
            ...prev,
            grid_title: gridTitle,
            ...(parsedGridItems ? { grid_items: parsedGridItems } : {}),
          }));
        } else {
          // Even if no title, still apply grid_items if provided
          const gridItemsSrc =
            data.specification_highlights_items ||
            data.spec_highlights?.items ||
            data.spec_highlights_items ||
            [];
          if (Array.isArray(gridItemsSrc) && gridItemsSrc.length > 0) {
            const parsedGridItems = gridItemsSrc.map((h) => ({
              icon: String(h?.icon || 'Zap'),
              value: String(h?.value || h?.stat || ''),
              title: String(h?.title || h?.label || ''),
              subtitle: String(h?.subtitle || h?.description || h?.desc || ''),
            }));
            setSpecHighlights((prev) => ({ ...prev, grid_items: parsedGridItems }));
          }
        }

        // ── Overview ──────────────────────────────────────────────────────
        const ovHeading = String(data.overview_intro_heading || data.overview?.intro?.heading || '');
        const ovText    = String(data.overview_intro_description || data.overview?.intro?.text || '');
        const ovBullets = Array.isArray(data.overview_key_features) && data.overview_key_features.length > 0
          ? data.overview_key_features.map((b) => ({ icon: String(b.icon || 'Check'), text: String(b.text || '') }))
          : null;
        const pfScenarios = Array.isArray(data.perfect_for_scenarios) && data.perfect_for_scenarios.length > 0
          ? data.perfect_for_scenarios.map((p) => ({ icon: String(p.icon || 'Smile'), label: String(p.label || '') }))
          : null;
        const vpItems = Array.isArray(data.value_proposition) && data.value_proposition.length > 0
          ? data.value_proposition.map((w) => ({ icon: String(w.icon || 'Heart'), text: String(w.text || '') }))
          : null;

        if (ovHeading || ovText || ovBullets || pfScenarios || vpItems) {
          setOverviewData((prev) => ({
            ...prev,
            intro: {
              heading: ovHeading || prev.intro?.heading || '',
              text: ovText || prev.intro?.text || '',
              bullets: ovBullets || prev.intro?.bullets || [{ icon: 'Check', text: '' }],
            },
            perfect_for: pfScenarios || prev.perfect_for || [{ icon: 'Smile', label: '' }],
            why_love_it: vpItems || prev.why_love_it || [{ icon: 'Heart', text: '' }],
          }));
          if (ovHeading) setOverviewSubstepperCompleted(true);
        }

        // ── Inclusions ────────────────────────────────────────────────────
        const incTitle = String(data.inclusions_title || data.inclusions?.title || '');
        const incDesc  = String(data.inclusions_description || data.inclusions?.description || '');
        const incItems = Array.isArray(data.inclusions_items) && data.inclusions_items.length > 0
          ? data.inclusions_items
          : null;

        if (incTitle || incDesc || incItems) {
          setInclusions((prev) => ({
            ...prev,
            title: incTitle || prev.title || '',
            description: incDesc || prev.description || '',
            items: incItems || prev.items || [{ short_description: '', image_url: '' }],
          }));
        }

        // ── How to Use ────────────────────────────────────────────────────
        const htuTitle = String(data.how_to_use_title || data.how_to_use?.title || '');
        const htuDesc  = String(data.how_to_use_description || data.how_to_use?.description || '');
        const htuTip   = String(data.how_to_use_tip || data.how_to_use?.tip || '');
        const htuSteps = Array.isArray(data.how_to_use_steps) && data.how_to_use_steps.length > 0
          ? data.how_to_use_steps
          : null;

        if (htuTitle || htuDesc || htuTip || htuSteps) {
          setHowToUse((prev) => ({
            ...prev,
            title: htuTitle || prev.title || '',
            description: htuDesc || prev.description || '',
            tip: htuTip || prev.tip || '',
            items: htuSteps || prev.items || [{ short_description: '', image_url: '' }],
          }));
        }

        // ── FAQs ──────────────────────────────────────────────────────────
        if (Array.isArray(data.faqs) && data.faqs.length > 0) {
          setFaqs(data.faqs.map((f) => ({
            question: String(f.question || f.q || ''),
            answer: String(f.answer || f.a || ''),
          })));
        }

        setMappedData(createMagicBlueprintData(data));

        setMagicFillError('');
        setMagicAuditRows(auditRows);
        setToastMsg('Magic Fill finalized and applied.');
        setToastType('success');
        setTimeout(() => setToastMsg(''), 4000);
      } catch (e) {
        setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });
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

  const handleMagicFillClear = () => {
    // Clear core data sources
    setMagicFillText('');
    setMagicFillError('');
    setMappedData(null);
    setMagicAuditRows([]);

    // Reset UI states: sync badges, ring, editor
    setMagicSyncStates({ general: 'idle', specifications: 'idle', inventory: 'idle', overview: 'idle', inclusions: 'idle', how_to_use: 'idle', faqs: 'idle' });
    setMagicRingCount(0);
    setIsBlueprintEditorOpen(false);
    setMagicLabPulse(false);

    // Clear any running timers used for paste feedback
    if (magicLabPulseTimerRef.current) {
      clearTimeout(magicLabPulseTimerRef.current);
      magicLabPulseTimerRef.current = null;
    }
    if (magicRingTimerRef.current) {
      clearTimeout(magicRingTimerRef.current);
      magicRingTimerRef.current = null;
    }

    // User feedback
    setToastMsg('Blueprint cleared.');
    setToastType('success');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        setToastMsg('Clipboard not available');
        setToastType('error');
        setTimeout(() => setToastMsg(''), 2500);
        return;
      }

      const txt = (await navigator.clipboard.readText()) || '';
      const trimmed = txt.trim();
      if (!trimmed) {
        setToastMsg('Clipboard is empty');
        setToastType('error');
        setTimeout(() => setToastMsg(''), 2500);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch (err) {
        setToastMsg('Clipboard does not contain valid JSON');
        setToastType('error');
        setTimeout(() => setToastMsg(''), 2500);
        return;
      }

      // Set normalized blueprint data
      const normalizedData = createMagicBlueprintData(parsed);
      setMappedData(normalizedData);
      setMagicFillText('');
      setMagicFillError('');
      setMagicAuditRows([]);

      // Trigger paste feedback (pulse, ring animation, toast)
      triggerMagicPasteFeedback();
    } catch (ex) {
      setToastMsg('Failed to read clipboard');
      setToastType('error');
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  const triggerMagicPasteFeedback = () => {
    // Activate 2-second purple border pulse
    setMagicLabPulse(true);
    
    // Clear existing timers
    if (magicLabPulseTimerRef.current) clearTimeout(magicLabPulseTimerRef.current);
    if (magicRingTimerRef.current) clearTimeout(magicRingTimerRef.current);
    
    // Animate ring count from 0 to mapped count (23 for full blueprint)
    setMagicRingCount(0);
    let currentCount = 0;
    const targetCount = 23; // Full mapped fields
    const stepDuration = 100; // ms per step
    const totalSteps = targetCount;
    const stepIncrement = Math.ceil(targetCount / totalSteps);
    
    const animateRing = () => {
      currentCount += stepIncrement;
      if (currentCount >= targetCount) {
        currentCount = targetCount;
        setMagicRingCount(currentCount);
      } else {
        setMagicRingCount(currentCount);
        magicRingTimerRef.current = setTimeout(animateRing, stepDuration);
      }
    };
    animateRing();
    
    // Show success toast
    setToastMsg('Blueprint Synced Successfully');
    setToastType('success');
    setTimeout(() => setToastMsg(''), 3000);
    
    // Reset border pulse after 2 seconds
    magicLabPulseTimerRef.current = setTimeout(() => {
      setMagicLabPulse(false);
    }, 2000);
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
          const sizeValue = getVal(['size_value', 'size value', 'value']);
          const sizeUnit = getVal(['size_unit', 'size unit', 'unit']);
          const sizeInfo = getVal(['size_info', 'size info', 'extra info', 'info']);
          const color = getVal(['color', 'clr', 'colour']);
          const priceVal = Number(getVal(['price', 'prc', 'rate']));
          const stockVal = Number(getVal(['stock', 'stk', 'qty', 'quantity']));

          const parsedSize = parseVariantSize(size);
          const normalizedSizeValue = String(sizeValue ?? parsedSize.size_value ?? '').trim();
          const normalizedSizeUnit = String(sizeUnit ?? parsedSize.size_unit ?? '').trim();
          const normalizedSizeInfo = String(sizeInfo ?? parsedSize.size_info ?? '').trim();
          const fullSize = composeVariantSize({
            size_value: normalizedSizeValue,
            size_unit: normalizedSizeUnit,
            size_info: normalizedSizeInfo,
          });

          if (!fullSize || color === undefined || isNaN(priceVal) || isNaN(stockVal)) {
            skippedCount++;
            return;
          }

          const normalizedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const cleanColor = String(color).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const cleanSize = fullSize.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

          newVariants.push({
            vk: mk(),
            size_value: normalizedSizeValue,
            size_unit: normalizedSizeUnit,
            size_info: normalizedSizeInfo,
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
        const parsedSize = parseVariantSize(size);
        const fullSize = composeVariantSize(parsedSize);

        if (!fullSize || isNaN(priceVal) || isNaN(stockVal)) {
          skippedCount++;
          return;
        }

        const normalizedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const cleanColor = color.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanSize = fullSize.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const autoSku = [normalizedSlug, cleanColor, cleanSize].filter(Boolean).join('-');

        newVariants.push({
          vk: mk(),
          size_value: parsedSize.size_value,
          size_unit: parsedSize.size_unit,
          size_info: parsedSize.size_info,
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
        const filteredPrev = prev.filter(v => composeVariantSize(v) || v.color || v.price || v.stock);
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
    clearSaveValidationError('galleryImages');
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
  const fetchCats = async () => {
    try {
      if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
        setCategories(cachedCategories);
        return cachedCategories;
      }

      const data = await getCachedCategories();
      const nextCategories = Array.isArray(data) ? data : [];
      setCategories(nextCategories);
      return nextCategories;
    } catch {
      setCategories([]);
      return [];
    }
  };

  // Fetch audiences
  const fetchAudiences = async () => {
    try {
      if (Array.isArray(cachedAudiences) && cachedAudiences.length > 0) {
        setAudiences(cachedAudiences);
        return cachedAudiences;
      }

      setAudiencesLoading(true);
      const data = await getCachedAudiences();
      const nextAudiences = Array.isArray(data) ? data : [];
      setAudiences(nextAudiences);
      return nextAudiences;
    } catch (err) {
      console.error('Failed to fetch audiences:', err);
      setAudiences([]);
      return [];
    } finally {
      setAudiencesLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
    fetchAudiences();
  }, []);

  useEffect(() => {
    const refreshCategories = () => {
      if (Array.isArray(cachedCategories) && cachedCategories.length > 0) {
        setCategories(cachedCategories);
        return;
      }
      fetchCats();
    };
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
        setAudience(p?.audience ? parseInt(p.audience) : '');
        setMainImage(p?.main_image || '');
        setVideoUrl(p?.video_url || '');
        
        const loadedOverview = p?.overview || {};
        
        const safeBullets = (() => {
          const bulletsArray = Array.isArray(loadedOverview.intro?.bullets) 
            ? loadedOverview.intro.bullets 
            : (Array.isArray(loadedOverview.bullets) ? loadedOverview.bullets : []);
          if (bulletsArray.length === 0) return [{ icon: 'Check', text: '' }];
          return bulletsArray.map(b => typeof b === 'string' ? { icon: 'Check', text: b } : { icon: b.icon || 'Check', text: b.text || '' });
        })();

        const safeUseCases = (() => {
          const ucArray = Array.isArray(loadedOverview.use_cases) ? loadedOverview.use_cases : [];
          if (ucArray.length === 0) return [{ image: '', icon: 'Layout', label: '', description: '' }];
          return ucArray.map(uc => ({
            image: uc.image || '',
            icon: uc.icon || 'Layout',
            label: uc.label || uc.title || '',
            description: uc.description || ''
          }));
        })();

        setOverviewData({
          intro: {
            heading: loadedOverview.intro?.heading || '',
            text: loadedOverview.intro?.text || '',
            bullets: safeBullets,
          },
          use_cases: safeUseCases,
          perfect_for: Array.isArray(loadedOverview.perfect_for) && loadedOverview.perfect_for.length > 0
            ? loadedOverview.perfect_for.map(pf => ({ icon: pf.icon || 'Smile', label: pf.label || '' }))
            : [{ icon: 'Smile', label: '' }],
          why_love_it: Array.isArray(loadedOverview.why_love_it) && loadedOverview.why_love_it.length > 0
            ? loadedOverview.why_love_it.map(w => ({ icon: w.icon || 'Heart', text: w.text || '' }))
            : [{ icon: 'Heart', text: '' }]
        });

        if (loadedOverview.intro?.heading && (safeBullets.some(b => b.text) || safeUseCases.some(u => u.label))) {
          setOverviewSubstepperCompleted(true);
        }

        setGalleryImages(Array.isArray(p?.images) && p.images.length > 0 ? p.images : []);

        setSpecDescription(p?.spec_description || '');
        setSpecVideoUrl(p?.spec_video_url || '');
        setSpecImage(p?.spec_image || '');
        setSpec_bottom_banner(p?.spec_bottom_banner || p?.specBottomBanner || '');
        const loadedSpecHighlights = p?.spec_highlights || p?.specHighlights || {};
        setSpecHighlights({
          grid_title: String(loadedSpecHighlights.grid_title || ''),
          grid_items: Array.isArray(loadedSpecHighlights.grid_items) && loadedSpecHighlights.grid_items.length > 0
            ? loadedSpecHighlights.grid_items.map(item => ({
                icon: String(item?.icon || 'Zap'),
                value: String(item?.value || ''),
                title: String(item?.title || ''),
                subtitle: String(item?.subtitle || '')
              }))
            : [newHighlight(), newHighlight(), newHighlight()]
        });
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
              ...parseVariantSize(v.size || ''),
              size_value: String(v.size_value || parseVariantSize(v.size || '').size_value || ''),
              size_unit: String(v.size_unit || parseVariantSize(v.size || '').size_unit || ''),
              size_info: String(v.size_info || parseVariantSize(v.size || '').size_info || ''),
              variety: String(v.variety || v.variety_label || ''),
              variety_label: String(v.variety_label || v.variety || ''),
              sub_size: String(v.sub_size || ''),
              sub_size_unit: String(v.sub_size_unit || ''),
              color: v.color || '',
              price: v.price ?? '',
              override_discount: v.override_discount ?? false,
              discount_type: v.discount_type || '',
              discount_value: v.discount_value ?? '',
              stock: v.stock ?? '',
              sku: v.sku || '',
              image: v.image || '',
              use_separate_gallery: v.use_separate_gallery ?? false
            }))
            : [newVar(p?.main_image || '')]
        );

        // Initialize baseline snapshot for comparison tracking
        const discountSnapshots = {};
        vs.forEach(v => {
          if (v.id) {
            discountSnapshots[v.id] = {
              override_discount: v.override_discount ?? false,
              discount_type: v.discount_type || '',
              discount_value: Number(v.discount_value) || 0
            };
          }
        });
        setSavedVariantDiscounts(discountSnapshots);

        setEditProductData(p || null);

        const loadedInclusions = p?.inclusions || p?.package_inclusions || {};
        setInclusions({
          title: loadedInclusions.title || '',
          description: loadedInclusions.description || '',
          hero_image_url: loadedInclusions.hero_image_url || loadedInclusions.hero_image || '',
          items: Array.isArray(loadedInclusions.items) && loadedInclusions.items.length > 0
            ? loadedInclusions.items.map(i => ({ 
                short_description: i.short_description || i.text || '', 
                image_url: i.image_url || i.image || '' 
              }))
            : [{ short_description: '', image_url: '' }]
        });

        const loadedHowToUse = p?.how_to_use || {};
        setHowToUse({
          title: loadedHowToUse.title || '',
          description: loadedHowToUse.description || '',
          tip: loadedHowToUse.tip || '',
          hero_image_url: loadedHowToUse.hero_image_url || loadedHowToUse.hero_image || '',
          items: Array.isArray(loadedHowToUse.items) && loadedHowToUse.items.length > 0
            ? loadedHowToUse.items.map(i => ({ 
                short_description: i.short_description || i.text || '', 
                image_url: i.image_url || i.image || '' 
              }))
            : [{ short_description: '', image_url: '' }]
        });
        
        setFaqs(p?.faqs || []);
        setFaqsHeaderImage(p?.faqs_header_image || '');
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
    clearSaveValidationError('specifications.specRows', idx, field);
  };
  const addSpec = () => setSpecs([...specs, newSpec()]);
  const removeSpec = idx => setSpecs(specs => specs.filter((_, i) => i !== idx));

  // Specification highlights handlers
  const handleHighlightChange = (idx, field, value) => {
    setSpecHighlights(prev => ({
      ...prev,
      grid_items: prev.grid_items.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    }));
    clearSaveValidationError('specifications.highlightRows', idx, field);
  };
  const addHighlight = () => setSpecHighlights(prev => ({ ...prev, grid_items: [...prev.grid_items, newHighlight()] }));
  const removeHighlight = (idx) => setSpecHighlights(prev => ({ ...prev, grid_items: prev.grid_items.filter((_, i) => i !== idx) }));

  const renderHighlightIcon = (name) => {
    const n = String(name || '').trim().toLowerCase();
    switch (n) {
      case 'zap': return <Zap size={16} />;
      case 'shield': return <Shield size={16} />;
      case 'heart': return <Heart size={16} />;
      case 'bone': return <Bone size={16} />;
      case 'activity': return <Activity size={16} />;
      case 'check': return <Check size={16} />;
      case 'badgecheck': return <BadgeCheck size={16} />;
      case 'shieldcheck': return <ShieldCheck size={16} />;
      case 'award': return <Award size={16} />;
      case 'medal': return <Medal size={16} />;
      case 'verified': return <Verified size={16} />;
      case 'fingerprint': return <Fingerprint size={16} />;
      case 'crown': return <Crown size={16} />;
      case 'box': return <Box size={16} />;
      case 'package': return <Package size={16} />;
      case 'globe': return <Globe size={16} />;
      case 'plane': return <Plane size={16} />;
      case 'ship': return <Ship size={16} />;
      case 'shoppingbag': return <ShoppingBag size={16} />;
      case 'headphones': return <Headphones size={16} />;
      case 'mappin': return <MapPin size={16} />;
      case 'bed': return <Bed size={16} />;
      case 'sofa': return <Sofa size={16} />;
      case 'lamp': return <Lamp size={16} />;
      case 'bath': return <Bath size={16} />;
      case 'utensils': return <Utensils size={16} />;
      case 'coffee': return <Coffee size={16} />;
      case 'leaf': return <Leaf size={16} />;
      case 'recycle': return <Recycle size={16} />;
      case 'droplets': return <Droplets size={16} />;
      case 'wind': return <Wind size={16} />;
      case 'sun': return <Sun size={16} />;
      case 'moon': return <Moon size={16} />;
      case 'flower': return <Flower size={16} />;
      case 'smartphone': return <Smartphone size={16} />;
      case 'monitor': return <Monitor size={16} />;
      case 'code': return <Code size={16} />;
      case 'database': return <Database size={16} />;
      case 'batterycharging': return <BatteryCharging size={16} />;
      case 'wifi': return <Wifi size={16} />;
      case 'bluetooth': return <Bluetooth size={16} />;
      case 'harddrive': return <HardDrive size={16} />;
      case 'mouse': return <Mouse size={16} />;
      case 'keyboard': return <Keyboard size={16} />;
      case 'layers': return <Layers size={16} />;
      case 'scissors': return <Scissors size={16} />;
      case 'pentool': return <PenTool size={16} />;
      case 'ruler': return <Ruler size={16} />;
      case 'palette': return <Palette size={16} />;
      case 'hammer': return <Hammer size={16} />;
      case 'wrench': return <Wrench size={16} />;
      case 'diamond': return <Diamond size={16} />;
      case 'scale': return <Scale size={16} />;
      default: return <Zap size={16} />;
    }
  };

  // --- Variant state and handlers ---
  const [variantRows, setVariantRows] = useState([
    newVar()
  ]);
  const [savedVariantDiscounts, setSavedVariantDiscounts] = useState({});
  const [updatingVariantDiscountId, setUpdatingVariantDiscountId] = useState(null);

  const updateDiscountForSpecificVariant = async (idx) => {
    const variant = variantRows[idx];
    if (!variant?.id) return;
    
    setUpdatingVariantDiscountId(variant.id);
    try {
      const payload = {
        override_discount: !!variant.override_discount,
        discount_type: variant.discount_type || '',
        discount_value: Number(variant.discount_value) || 0
      };
      
      await updateVariantDiscount(variant.id, payload);
      
      setSavedVariantDiscounts(prev => ({
        ...prev,
        [variant.id]: payload
      }));
      
      setToastType('success');
      setToastMsg(`Discount applied to Variant #${idx + 1}`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setToastType('warning');
      setToastMsg(`Failed: ${err.message}`);
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setUpdatingVariantDiscountId(null);
    }
  };

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
    clearSaveValidationError('inventory', idx, field);
    setVariantRows(rows => rows.map((row, i) => {
      if (i !== idx) return row;
      let updated = { ...row, [field]: value };
      // When enabling discount, reset type and value so placeholder shows
      if (field === 'override_discount' && value === true) {
        updated.discount_type = '';
        updated.discount_value = '';
      }
      updated.sku = generateSKU(brand, name, updated.color, composeVariantSize(updated));
      return updated;
    }));
  };

  // When brand or name changes, update all SKUs
  useEffect(() => {
    setDuplicateSkuError(null);
    setVariantRows(rows => rows.map(row => ({
      ...row,
      sku: generateSKU(brand, name, row.color, composeVariantSize(row))
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

    const size = composeVariantSize(matchedVariant) || 'Size';
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
      a: '',
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
    setSpecDescription('');
    setSpecVideoUrl('');
    setSpecImage('');
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

  const clearSaveValidationError = (field, index = null, variantField = null) => {
    setSaveValidationErrors((prev) => {
      if (field === 'inventory' && index !== null) {
        const nextInventory = Array.isArray(prev.inventory) ? prev.inventory.map((row, rowIndex) => {
          if (rowIndex !== index) return row;
          const nextRow = { ...(row || {}) };
          if (variantField === 'size_value' || variantField === 'size_unit') {
            nextRow.size_value = false;
            nextRow.size_unit = false;
          } else if (variantField) {
            nextRow[variantField] = false;
          }
          return nextRow;
        }) : [];
        return { ...prev, inventory: nextInventory };
      }

      if (typeof field === 'string' && field.includes('.')) {
        const copy = JSON.parse(JSON.stringify(prev));
        const parts = field.split('.');
        let current = copy;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) return prev;
          current = current[parts[i]];
        }
        const lastPart = parts[parts.length - 1];

        if (index !== null) {
          if (Array.isArray(current[lastPart])) {
            if (variantField !== null && typeof current[lastPart][index] === 'object' && current[lastPart][index] !== null) {
              current[lastPart][index][variantField] = false;
            } else {
              current[lastPart][index] = false;
            }
          }
        } else {
          current[lastPart] = false;
        }
        return copy;
      }

      return { ...prev, [field]: false };
    });
  };

  const buildSaveValidationErrors = () => {
    const nextErrors = {
      name: false,
      brand: false,
      description: false,
      category: false,
      subcategory: false,
      audience: false,
      mainImage: false,
      videoUrl: false,
      galleryImages: false,
      specifications: {
        specDescription: false,
        specImage: false,
        specVideoUrl: false,
        specBottomBanner: false,
        specRows: [],
        highlightsTitle: false,
        highlightRows: [],
      },
      inventory: [],
      overview: {
        introHeading: false,
        introDescription: false,
        introBullets: [],
        useCases: [],
        perfectFor: [],
        whyLoveIt: [],
      },
      inclusions: {
        title: false,
        heroImageUrl: false,
        description: false,
        items: [],
      },
      howToUse: {
        title: false,
        heroImageUrl: false,
        description: false,
        tip: false,
        items: [],
      },
      faqs: {
        headerImage: false,
        rows: [],
      },
    };

    const missingSections = [];

    if (!String(name || '').trim()) {
      nextErrors.name = true;
      missingSections.push('general');
    }

    if (!String(brand || '').trim()) {
      nextErrors.brand = true;
      if (!missingSections.includes('general')) missingSections.push('general');
    }

    if (!String(description || '').trim()) {
      nextErrors.description = true;
      if (!missingSections.includes('general')) missingSections.push('general');
    }

    if (!String(categoryId || '').trim()) {
      nextErrors.category = true;
      if (!missingSections.includes('general')) missingSections.push('general');
    }

    if (!String(subcategoryId || '').trim()) {
      nextErrors.subcategory = true;
      if (!missingSections.includes('general')) missingSections.push('general');
    }

    if (!String(audience || '').trim()) {
      nextErrors.audience = true;
      if (!missingSections.includes('general')) missingSections.push('general');
    }

    if (!String(mainImage || '').trim()) {
      nextErrors.mainImage = true;
      if (!missingSections.includes('media')) missingSections.push('media');
    }

    // Product Video URL is optional

    const galleryList = Array.isArray(galleryImages) ? galleryImages : [];
    const hasGalleryFilled = galleryList.some((img) => String(img || '').trim());
    if (!hasGalleryFilled || galleryList.some((img) => String(img || '').trim() === '')) {
      nextErrors.galleryImages = true;
      if (!missingSections.includes('media')) missingSections.push('media');
    }

    const specRows = Array.isArray(specs) ? specs : [];
    if (!String(specDescription || '').trim()) nextErrors.specifications.specDescription = true;
    if (!String(specImage || '').trim()) nextErrors.specifications.specImage = true;
    // specVideoUrl is optional
    if (!String(spec_bottom_banner || '').trim()) nextErrors.specifications.specBottomBanner = true;
    if (!String(specHighlights?.grid_title || '').trim()) nextErrors.specifications.highlightsTitle = true;
    nextErrors.specifications.specRows = specRows.map((spec) => ({
      key: !String(spec?.key || '').trim(),
      value: !String(spec?.value || '').trim(),
    }));
    nextErrors.specifications.highlightRows = (Array.isArray(specHighlights?.grid_items) ? specHighlights.grid_items : []).map((item) => ({
      value: !String(item?.value || '').trim(),
      title: !String(item?.title || '').trim(),
      subtitle: !String(item?.subtitle || '').trim(),
    }));
    const specsInvalid = nextErrors.specifications.specDescription ||
      nextErrors.specifications.specImage ||
      nextErrors.specifications.specVideoUrl ||
      nextErrors.specifications.specBottomBanner ||
      nextErrors.specifications.highlightsTitle ||
      nextErrors.specifications.specRows.length === 0 ||
      nextErrors.specifications.specRows.some((row) => row.key || row.value) ||
      nextErrors.specifications.highlightRows.length === 0 ||
      nextErrors.specifications.highlightRows.some((row) => row.value || row.title || row.subtitle);
    if (specsInvalid && !missingSections.includes('specifications')) {
      missingSections.push('specifications');
    }

    const inventoryRows = Array.isArray(variantRows) ? variantRows : [];
    if (inventoryRows.length === 0) {
      missingSections.push('inventory');
    } else {
      nextErrors.inventory = inventoryRows.map((variant) => {
        const sizeValue = String(variant?.size_value || '').trim();
        const sizeUnit = String(variant?.size_unit || '').trim();
        const color = String(variant?.color || '').trim();
        const price = String(variant?.price ?? '').trim();
        const stock = String(variant?.stock ?? '').trim();
        const image = String(variant?.image || '').trim();

        return {
          size_value: !sizeValue,
          size_unit: false,
          color: !color,
          price: price === '',
          stock: stock === '',
          image: !image || image === 'Auto-synced',
        };
      });

      if (nextErrors.inventory.some((row) => Object.values(row || {}).some(Boolean))) {
        if (!missingSections.includes('inventory')) missingSections.push('inventory');
      }
    }

    const overviewBullets = Array.isArray(overviewData?.intro?.bullets) ? overviewData.intro.bullets : [];
    const overviewUseCases = Array.isArray(overviewData?.use_cases) ? overviewData.use_cases : [];
    const overviewPerfectFor = Array.isArray(overviewData?.perfect_for) ? overviewData.perfect_for : [];
    const overviewWhyLoveIt = Array.isArray(overviewData?.why_love_it) ? overviewData.why_love_it : [];
    nextErrors.overview.introHeading = !String(overviewData?.intro?.heading || '').trim();
    nextErrors.overview.introDescription = !String(overviewData?.intro?.text || '').trim();
    nextErrors.overview.introBullets = overviewBullets.map((bullet) => !String(bullet?.text || '').trim());
    nextErrors.overview.useCases = overviewUseCases.map((uc) => !String(uc?.image || '').trim());
    nextErrors.overview.perfectFor = overviewPerfectFor.map((pf) => !String(pf?.label || '').trim());
    nextErrors.overview.whyLoveIt = overviewWhyLoveIt.map((row) => !String(row?.text || '').trim());
    const overviewInvalid = nextErrors.overview.introHeading ||
      nextErrors.overview.introDescription ||
      nextErrors.overview.introBullets.length === 0 ||
      nextErrors.overview.introBullets.some(Boolean) ||
      nextErrors.overview.useCases.length === 0 ||
      nextErrors.overview.useCases.some(Boolean) ||
      nextErrors.overview.perfectFor.length === 0 ||
      nextErrors.overview.perfectFor.some(Boolean) ||
      nextErrors.overview.whyLoveIt.length === 0 ||
      nextErrors.overview.whyLoveIt.some(Boolean);
    if (overviewInvalid && !missingSections.includes('overview')) {
      missingSections.push('overview');
    }

    const inclusionsItems = Array.isArray(inclusions?.items) ? inclusions.items : [];
    nextErrors.inclusions.title = !String(inclusions?.title || '').trim();
    nextErrors.inclusions.heroImageUrl = false;
    nextErrors.inclusions.description = !String(inclusions?.description || '').trim();
    nextErrors.inclusions.items = inclusionsItems.map((item) => ({
      short_description: !String(item?.short_description || '').trim(),
      image_url: !String(item?.image_url || '').trim(),
    }));
    const inclusionsInvalid = nextErrors.inclusions.title ||
      nextErrors.inclusions.description ||
      nextErrors.inclusions.items.length === 0 ||
      nextErrors.inclusions.items.some((item) => item.short_description || item.image_url);
    if (inclusionsInvalid && !missingSections.includes('inclusions')) {
      missingSections.push('inclusions');
    }

    const howToUseItems = Array.isArray(howToUse?.items) ? howToUse.items : [];
    nextErrors.howToUse.title = !String(howToUse?.title || '').trim();
    nextErrors.howToUse.heroImageUrl = !String(howToUse?.hero_image_url || '').trim();
    nextErrors.howToUse.description = !String(howToUse?.description || '').trim();
    nextErrors.howToUse.tip = !String(howToUse?.tip || '').trim();
    nextErrors.howToUse.items = howToUseItems.map((item) => ({
      short_description: !String(item?.short_description || '').trim(),
      image_url: !String(item?.image_url || '').trim(),
    }));
    const howToUseInvalid = nextErrors.howToUse.title ||
      nextErrors.howToUse.heroImageUrl ||
      nextErrors.howToUse.description ||
      nextErrors.howToUse.tip ||
      nextErrors.howToUse.items.length === 0 ||
      nextErrors.howToUse.items.some((item) => item.short_description || item.image_url);
    if (howToUseInvalid && !missingSections.includes('how_to_use')) {
      missingSections.push('how_to_use');
    }

    nextErrors.faqs.headerImage = !String(faqsHeaderImage || '').trim();
    nextErrors.faqs.rows = (Array.isArray(faqs) ? faqs : []).map((faq) => ({
      question: !String(faq?.question || '').trim(),
      answer: !String(faq?.answer || '').trim(),
    }));
    const faqsInvalid = nextErrors.faqs.headerImage ||
      nextErrors.faqs.rows.length === 0 ||
      nextErrors.faqs.rows.some((row) => row.question || row.answer);
    if (faqsInvalid && !missingSections.includes('faqs')) {
      missingSections.push('faqs');
    }

    return { nextErrors, missingSections };
  };

  const handleSubmitProduct = async () => {
    const { nextErrors, missingSections } = buildSaveValidationErrors();
    setSaveValidationErrors(nextErrors);

    const hasErrors = missingSections.length > 0;
    if (hasErrors) {
      setHighlightCategory(Boolean(nextErrors.category));
      setHighlightAudience(Boolean(nextErrors.audience));

      if (missingSections.includes('general')) {
        setActiveTab('general');
      } else if (missingSections.includes('specifications')) {
        setActiveTab('specifications');
      } else if (missingSections.includes('media')) {
        setActiveTab('media');
      } else if (missingSections.includes('inventory')) {
        setActiveTab('inventory');
      } else if (missingSections.includes('overview')) {
        setActiveTab('overview');
        if (nextErrors.overview.introHeading || nextErrors.overview.introDescription || (Array.isArray(nextErrors.overview.introBullets) && nextErrors.overview.introBullets.some(Boolean))) {
          setActiveSubStep(1);
        } else if (Array.isArray(nextErrors.overview.useCases) && nextErrors.overview.useCases.some(Boolean)) {
          setActiveSubStep(2);
        } else if (Array.isArray(nextErrors.overview.perfectFor) && nextErrors.overview.perfectFor.some(Boolean)) {
          setActiveSubStep(3);
        } else if (Array.isArray(nextErrors.overview.whyLoveIt) && nextErrors.overview.whyLoveIt.some(Boolean)) {
          setActiveSubStep(4);
        }
      } else if (missingSections.includes('inclusions')) {
        setActiveTab('inclusions');
      } else if (missingSections.includes('how_to_use')) {
        setActiveTab('how_to_use');
      } else if (missingSections.includes('faqs')) {
        setActiveTab('faqs');
      } else {
        setActiveTab('general');
      }
      // After switching tab, scroll to the first invalid field marker
      setTimeout(() => {
        const first = document.querySelector('.pf-error');
        if (first) {
          try {
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof first.focus === 'function') first.focus();
          } catch (e) {
            // ignore
          }
        }
      }, 120);

      return;
    }

    setSaving(true);
    setDuplicateSkuError(null);
    try {
      // Safe extraction regardless of whether the state is named 'inclusions' or 'whats_in_the_box'
      const inclusionsPayload = {
        title: inclusions?.title || inclusions?.whats_in_the_box?.title || '',
        hero_image_url: '',
        description: inclusions?.description || inclusions?.whats_in_the_box?.description || '',
        items: (inclusions?.items || inclusions?.whats_in_the_box?.items || []).map(item => ({
          short_description: item?.short_description || item?.name || item?.text || '',
          image_url: item?.image_url || item?.image || ''
        })).filter(item => item.short_description)
      };

      const formData = {
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
        spec_description: specDescription,
        spec_image: specImage,
        spec_video_url: specVideoUrl,
        spec_bottom_banner: spec_bottom_banner,
        spec_highlights: specHighlights,
        specifications: Object.fromEntries(specs.filter(s => s.key && s.value).map(s => [s.key, s.value])),
        overview: {
          intro: {
            heading: String(overviewData.intro?.heading || '').trim(),
            text: String(overviewData.intro?.text || '').trim(),
            bullets: (overviewData.intro?.bullets || [])
              .map(b => ({ icon: String(b.icon || 'Check').trim(), text: String(b.text || '').trim() }))
              .filter(b => b.text)
          },
          use_cases: (overviewData.use_cases || [])
            .map(uc => ({
              image: String(uc.image || '').trim(),
              icon: String(uc.icon || 'Layout').trim(),
              label: String(uc.label || '').trim(),
              description: String(uc.description || '').trim()
            }))
            .filter(uc => uc.label || uc.image || uc.description),
          perfect_for: (overviewData.perfect_for || [])
            .map(pf => ({
              icon: String(pf.icon || 'Smile').trim(),
              label: String(pf.label || '').trim()
            }))
            .filter(pf => pf.label),
          why_love_it: (overviewData.why_love_it || [])
            .map(w => ({
              icon: String(w.icon || 'Heart').trim(),
              text: String(w.text || '').trim()
            }))
            .filter(w => w.text)
        },
        inclusions: inclusionsPayload,
        how_to_use: {
          title: howToUse?.title || '',
          hero_image_url: howToUse?.hero_image_url || howToUse?.hero_image || '',
          description: howToUse?.description || '',
          tip: howToUse?.tip || '',
          items: (howToUse?.items || []).map(item => ({
            short_description: item?.short_description || item?.name || item?.text || '',
            image_url: item?.image_url || item?.image || ''
          })).filter(item => item.short_description)
        },
        faqs: faqs,
        faqs_header_image: faqsHeaderImage,
        variants: variantRows.map(v => ({
          id: v.id || null,
          size: composeVariantSize(v),
          size_value: v.size_value || '',
          size_unit: v.size_unit || '',
          size_info: v.size_info || '',
          variety: v.variety || v.variety_label || '',
          variety_label: v.variety_label || v.variety || '',
          sub_size: v.sub_size || '',
          sub_size_unit: v.sub_size_unit || '',
          color: v.color,
          price: v.price,
          override_discount: v.override_discount,
          discount_type: v.override_discount ? (v.discount_type || '') : '',
          discount_value: v.override_discount ? (v.discount_value === '' ? 0 : Number(v.discount_value)) : 0,
          stock: v.stock,
          sku: v.sku,
          image: v.image,
          use_separate_gallery: v.use_separate_gallery || false
        }))
      };

      console.log("FINAL SUBMIT PAYLOAD:", formData);

      if (isEditMode) {
        const updated = await updateProduct(id, formData);
        // If backend returned updated product and variants, refresh local state so UI reflects persisted flags
        if (updated && updated.variants) {
          const vs = Array.isArray(updated.variants) ? updated.variants : [];
          setVariantRows(
            vs.length > 0
              ? vs.map(v => ({
                id: v.id || '',
                vk: mk(),
                ...parseVariantSize(v.size || ''),
                sub_size: v.sub_size || '',
                sub_size_unit: v.sub_size_unit || '',
                variety: v.variety || v.variety_label || '',
                variety_label: v.variety || v.variety_label || '',
                color: v.color || '',
                price: v.price ?? '',
                override_discount: v.override_discount ?? false,
                discount_type: v.discount_type || '',
                discount_value: v.discount_value ?? '',
                stock: v.stock ?? '',
                sku: v.sku || '',
                image: v.image || '',
                use_separate_gallery: v.use_separate_gallery ?? false
              }))
              : [newVar(mainImage || '')]
          );
          
          if (updated.product) {
            setEditProductData(updated.product);
            // Ensure spec description, video and highlights are refreshed from the response
            setSpecDescription(updated.product.spec_description || '');
            setSpecImage(updated.product.spec_image || '');
            setSpecVideoUrl(updated.product.spec_video_url || '');
            setSpec_bottom_banner(updated.product.spec_bottom_banner || updated.product.specBottomBanner || '');
            const respHighlights = updated.product.spec_highlights || updated.product.specHighlights || {};
            setSpecHighlights({
              grid_title: String(respHighlights.grid_title || ''),
              grid_items: Array.isArray(respHighlights.grid_items) && respHighlights.grid_items.length > 0
                ? respHighlights.grid_items.map(item => ({
                    icon: String(item?.icon || 'Zap'),
                    value: String(item?.value || ''),
                    title: String(item?.title || ''),
                    subtitle: String(item?.subtitle || '')
                  }))
                : [newHighlight(), newHighlight(), newHighlight()]
            });
          }
        }
      } else {
        await saveProduct(formData);
      }

      resetMagicFillState();

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

  const openAudienceModal = () => {
    setAudienceName('');
    setShowAudienceModal(true);
  };

  const closeAudienceModal = () => {
    if (addingAudience) return;
    setShowAudienceModal(false);
    setAudienceName('');
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

      syncAddCategory(created);
      setCategories((prev) => [...prev.filter((category) => String(category.id) !== String(created?.id)), created]);

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

  const handleAddAudience = async () => {
    const nameValue = audienceName.trim();
    if (!nameValue) return;

    setAddingAudience(true);
    try {
      const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
      const response = await fetch(`${apiOrigin}/api/audiences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameValue }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add audience');
      }

      syncAddAudience(result);
      setAudiences((prev) => [...prev.filter((aud) => String(aud.id) !== String(result?.id)), result]);
      if (result?.id) {
        setAudience(result.id);
      }

      setShowAudienceModal(false);
      setAudienceName('');
      setToastMsg('Audience added successfully.');
      setToastType('success');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to add audience');
    } finally {
      setAddingAudience(false);
    }
  };

  const openManageAudiencesModal = () => {
    setShowManageAudiencesModal(true);
  };

  const closeManageAudiencesModal = () => {
    setShowManageAudiencesModal(false);
    setEditingAudienceId(null);
    setEditingAudienceName('');
  };

  const handleEditAudience = async (audienceId, newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      alert('Name cannot be empty');
      return;
    }

    try {
      const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
      const response = await fetch(`${apiOrigin}/api/audiences/${audienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update audience');
      }

      syncUpdateAudience(result);
      setAudiences((prev) => prev.map((aud) => (String(aud.id) === String(result?.id) ? result : aud)));
      setEditingAudienceId(null);
      setEditingAudienceName('');
      setToastMsg('Audience updated successfully.');
      setToastType('success');
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update audience');
    }
  };

  const handleDeleteAudience = (audienceId, audienceName) => {
    setAudienceToDelete({ id: audienceId, name: audienceName });
  };

  const handleConfirmDeleteAudience = async () => {
    if (!audienceToDelete) return;

    setDeletingAudience(true);
    try {
      const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api$/, '');
      const response = await fetch(`${apiOrigin}/api/audiences/${audienceToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          alert(result.error || 'Cannot delete this audience as it is in use.');
          return;
        }
        throw new Error(result.error || 'Failed to delete audience');
      }

      syncDeleteAudience(audienceToDelete.id);
      setAudiences((prev) => prev.filter((aud) => String(aud.id) !== String(audienceToDelete.id)));
      setToastMsg('Audience deleted successfully.');
      setToastType('success');
      setTimeout(() => setToastMsg(''), 3000);
      setAudienceToDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to delete audience');
    } finally {
      setDeletingAudience(false);
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
        const size = composeVariantSize(v);
        const color = String(v?.color || '').trim();
        const price = Number(v?.price);
        const stock = Number(v?.stock);
        const image = String(v?.image || '').trim();
        // Image must be present, not empty, and not the default 'Auto-synced' placeholder
        const hasValidImage = image && image !== 'Auto-synced';
        return size && color && Number.isFinite(price) && price >= 0 && Number.isFinite(stock) && stock >= 0 && hasValidImage;
      });

    const galleries = isEditMode ? Array.isArray(designGalleries) && designGalleries.length > 0 : false;

    const offers =
      Array.isArray(variantRows) &&
      variantRows.some((v) => {
        const isOverride = Boolean(v?.override_discount);
        const discountVal = Number(v?.discount_value);
        return isOverride && Number.isFinite(discountVal) && discountVal > 0;
      });

    const magic = Boolean(magicFillText.trim() && !magicFillError);

    const overviewHeadingValid = Boolean(overviewData?.intro?.heading?.trim());
    const overviewBulletsValid = Array.isArray(overviewData?.intro?.bullets) && overviewData.intro.bullets.some((b) => String(b?.text || '').trim() !== '');
    const overviewUseCasesValid = Array.isArray(overviewData?.use_cases) && overviewData.use_cases.some((uc) => String(uc?.label || '').trim() !== '');
    
    const dataValid = overviewHeadingValid && (overviewBulletsValid || overviewUseCasesValid);
    const isCompletedViaSubstepper = Boolean(overviewSubstepperCompleted);
    const overviewStepValid = dataValid || isCompletedViaSubstepper;

    const inclusionsValid = Boolean(
      inclusions?.title?.trim() &&
      inclusions?.description?.trim() &&
      Array.isArray(inclusions?.items) &&
      inclusions.items.some(i => String(i?.short_description || '').trim() !== '')
    );

    return {
      magic,
      general,
      specifications,
      media,
      inventory,
      galleries,
      offers,
      overview: overviewStepValid,
      inclusions: inclusionsValid,
    };
  }, [name, brand, description, categoryId, specs, mainImage, galleryImages, variantRows, isEditMode, designGalleries, magicFillText, magicFillError, overviewData, overviewSubstepperCompleted, inclusions]);

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
  const variantCols = '80px 70px 180px 180px 80px 70px 120px 100px 80px 150px 120px 80px auto';

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
      <QuickAddModal
        m={showAudienceModal}
        title="Add Audience"
        val={audienceName}
        setVal={setAudienceName}
        onClose={closeAudienceModal}
        onAdd={handleAddAudience}
        loading={addingAudience}
        canAdd={Boolean(audienceName.trim())}
        placeholder="Audience Name"
      />
      {showManageAudiencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeManageAudiencesModal}
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
              background: '#fff',
              borderRadius: 12,
              maxWidth: 500,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ padding: 20, borderBottom: '1px solid #e4e4e7', background: '#f9fafb' }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111827' }}>Manage Audiences</h2>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              {audiences.length === 0 ? (
                <p style={{ margin: 0, color: '#6b7280', textAlign: 'center', padding: 20 }}>No audiences yet. Click "+" to add one.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {audiences.map((aud) => (
                    <div
                      key={aud.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 12,
                        background: '#f9fafb',
                        borderRadius: 8,
                        border: '1px solid #e4e4e7',
                      }}
                    >
                      {editingAudienceId === aud.id ? (
                        <>
                          <input
                            type="text"
                            value={editingAudienceName}
                            onChange={(e) => setEditingAudienceName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #d1d5db',
                              fontFamily: 'Poppins, sans-serif',
                              fontSize: 14,
                            }}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditAudience(aud.id, editingAudienceName);
                              } else if (e.key === 'Escape') {
                                setEditingAudienceId(null);
                                setEditingAudienceName('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleEditAudience(aud.id, editingAudienceName)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              padding: 0,
                              background: '#10b981',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              color: '#fff',
                            }}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAudienceId(null);
                              setEditingAudienceName('');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              padding: 0,
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: 6,
                              cursor: 'pointer',
                              color: '#fff',
                            }}
                            title="Cancel"
                          >
                            <span style={{ fontSize: 18, fontWeight: 'bold' }}>×</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: 1, fontSize: 14, color: '#111827', fontWeight: 500 }}>
                            {aud.name.charAt(0).toUpperCase() + aud.name.slice(1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAudienceId(aud.id);
                              setEditingAudienceName(aud.name);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              padding: 0,
                              background: 'none',
                              border: '1px solid #d1d5db',
                              borderRadius: 6,
                              cursor: 'pointer',
                              color: '#6b7280',
                            }}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: 16, borderTop: '1px solid #e4e4e7', background: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={closeManageAudiencesModal}
                onMouseEnter={() => setIsCloseAudienceButtonHovered(true)}
                onMouseLeave={() => setIsCloseAudienceButtonHovered(false)}
                style={{
                  height: 40,
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  background: isCloseAudienceButtonHovered ? '#fee2e2' : '#fff1f2',
                  color: isCloseAudienceButtonHovered ? '#b91c1c' : '#dc2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 20px',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={Boolean(audienceToDelete)}
        title="Are you sure?"
        message={audienceToDelete ? `Delete audience "${audienceToDelete.name}"? This action cannot be undone.` : ''}
        cancelLabel="Cancel"
        confirmLabel={deletingAudience ? 'Deleting...' : 'Delete'}
        onCancel={() => setAudienceToDelete(null)}
        onConfirm={handleConfirmDeleteAudience}
        isConfirming={deletingAudience}
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
        .pf-spec-section-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .pf-spec-field-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pf-spec-label {
          color: #9ca3af;
          letter-spacing: 0.05em;
          margin: 0;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .pf-spec-divider-block {
          margin-top: 4px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        .pf-spec-repeat-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pf-spec-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .pf-spec-icon-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
          align-self: center;
        }
        .pf-spec-action {
          margin-top: 8px;
          width: fit-content;
          align-self: flex-start;
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
          <Link
            to="/products"
            className="pf-ghost-back-btn"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={14} />
            Back
          </Link>
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
              background: 'transparent',
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              padding: 0,
            }}
          >
            {/* Featured Magic Fill at top (aligned with stepper) */}
            {(() => {
              const magicStep = STEPS.find((s) => s.key === 'magic');
              const active = activeTab === 'magic';
              return (
                <div key="magic-featured" style={{ position: 'relative', paddingBottom: 26 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('magic')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      width: '100%',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        <Sparkles size={14} />
                      </span>

                      <span style={{ fontSize: 14, fontWeight: active ? 700 : 600, color: '#111827' }}>{magicStep?.label}</span>
                    </div>
                  </button>
                </div>
              );
            })()}

            {/* Minimalist vertical stepper matching CouponForm */}
            {STEPS.filter((s) => s.key !== 'magic').map((step, idx) => {
              const completed = Boolean(stepDone[step.key]);
              const active = step.key === activeTab;
              const lineColor = completed ? '#bbf7d0' : '#e4e4e7';

              return (
                <div key={step.key} style={{ position: 'relative', paddingBottom: idx < STEPS.length - 2 ? 26 : 0 }}>
                  {idx < STEPS.length - 2 && (
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
                      width: '100%',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: completed ? '1px solid #bbf7d0' : active ? 'none' : '1px solid #d4d4d8',
                          background: completed ? '#f0fdf4' : active ? '#C8507A' : '#f4f4f5',
                          color: completed ? '#16a34a' : active ? '#ffffff' : '#9ca3af',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {completed ? <Check size={16} /> : idx + 1}
                      </span>

                      <span style={{ fontSize: 14, fontWeight: active ? 700 : completed ? 600 : 500, color: active ? '#111827' : completed ? '#374151' : '#9ca3af' }}>
                        {step.label}
                      </span>
                    </div>
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
                        @keyframes navPulse { 0% { box-shadow: 0 6px 18px rgba(168,85,247,0.08); } 50% { box-shadow: 0 12px 32px rgba(168,85,247,0.14); } 100% { box-shadow: 0 6px 18px rgba(168,85,247,0.08); } }
                        .magic-text-pulse { animation: navPulse 1.6s ease-in-out infinite; }
                        @keyframes auditRowSlideIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                        .sidebar-sync-pulse { animation: smartPulse 0.7s ease; }
                        .sidebar-sync-green { background: linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.2)) !important; border-color: rgba(34,197,94,0.3) !important; box-shadow: 0 8px 20px rgba(34,197,94,0.12) !important; }
                        .sidebar-sync-green .pf-sync-dot { background: #22c55e !important; color: #fff !important; }
                        .audit-row-animating { animation: auditRowSlideIn 0.4s ease forwards; }
                        @keyframes spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        @keyframes magicBorderPulse { 0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4); } 50% { box-shadow: 0 0 0 12px rgba(124, 58, 237, 0); } 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); } }
                        .smart-editor-panel.magic-pulse-active { animation: magicBorderPulse 2s ease-in-out 1; }
                        .audit-row-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(124, 58, 237, 0.3); border-top-color: #7c3aed; border-radius: 50%; animation: spinner 0.6s linear infinite; }
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

                        // New section counts
                        const overviewCount = summarySource ? [
                          summarySource.overview_intro_heading,
                          summarySource.overview_intro_description,
                          ...(summarySource.overview_key_features || []),
                          ...(summarySource.perfect_for_scenarios || []),
                          ...(summarySource.value_proposition || []),
                        ].filter(Boolean).length : 0;
                        const inclusionsCount = summarySource ? [
                          summarySource.inclusions_title,
                          summarySource.inclusions_description,
                          ...(summarySource.inclusions_items || []),
                        ].filter(Boolean).length : 0;
                        const howToUseCount = summarySource ? [
                          summarySource.how_to_use_title,
                          summarySource.how_to_use_description,
                          summarySource.how_to_use_tip,
                          ...(summarySource.how_to_use_steps || []),
                        ].filter(Boolean).length : 0;
                        const faqsCount = Array.isArray(summarySource?.faqs) ? summarySource.faqs.length : 0;

                        const totalMapped = generalCount + (categoryMatched ? 1 : 0) + specsCount + variantsCount + overviewCount + inclusionsCount + howToUseCount + faqsCount;
                        const ringStates = [
                          { key: 'general',     label: 'General',     ok: generalCount > 0 },
                          { key: 'categories',  label: 'Categories',  ok: categoryMatched },
                          { key: 'specs',       label: 'Specs',       ok: specsCount > 0 },
                          { key: 'inventory',   label: 'Inventory',   ok: variantsCount > 0 },
                          { key: 'overview',    label: 'Overview',    ok: overviewCount > 0 },
                          { key: 'inclusions',  label: 'Inclusions',  ok: inclusionsCount > 0 },
                          { key: 'how_to_use',  label: 'How to Use',  ok: howToUseCount > 0 },
                          { key: 'faqs',        label: 'FAQs',        ok: faqsCount > 0 },
                        ];
                        const completedGroups = ringStates.filter((s) => s.ok).length;
                        const ringPercent = Math.round((completedGroups / ringStates.length) * 100);
                        // 8 evenly spaced dots around a circle
                        const ringDots = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                          const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                          const r = 42; // percentage radius from center (50%)
                          return {
                            top: `${50 + r * Math.sin(angle)}%`,
                            left: `${50 + r * Math.cos(angle)}%`,
                          };
                        });
                        const activeBlueprintRows = buildMagicBlueprintEditorRows(activeBlueprintGroup, summarySource);

                        return (
                          <div className="smart-hub-card">
                            <div className="smart-hub-body">
                              <div className={`smart-editor-panel${magicLabPulse ? ' magic-pulse-active' : ''}`}>
                                <textarea
                                  ref={magicEditorRef}
                                  className="smart-paste-input"
                                  value={magicFillText}
                                  onChange={(e) => {
                                    setMagicFillText(e.target.value);
                                    setMagicFillError('');
                                    setMagicAuditRows([]);
                                  }}
                                  onPaste={(e) => {
                                    const pasted = e.clipboardData?.getData('text/plain') || '';
                                    const trimmed = pasted.trim();
                                    if (!trimmed) return;
                                    try {
                                      JSON.parse(trimmed);
                                      // Valid JSON detected - trigger paste feedback
                                      window.setTimeout(() => {
                                        triggerMagicPasteFeedback();
                                      }, 0);
                                    } catch {
                                      // Not valid JSON, normal paste behavior
                                    }
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
                                        background: `conic-gradient(#7c3aed ${magicRingCount > 0 ? Math.min(100, Math.round((magicRingCount / 23) * 100)) : ringPercent}%, rgba(226, 232, 240, 0.9) ${magicRingCount > 0 ? Math.min(100, Math.round((magicRingCount / 23) * 100)) : ringPercent}% 100%)`,
                                      }}
                                    >
                                      <div className="smart-ring-center">
                                        <div className="smart-ring-count">{magicRingCount > 0 ? magicRingCount : totalMapped}</div>
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
                                      <div className={`smart-stat-pill ${overviewCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'overview' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">Overview</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'overview' ? 'active' : ''}`}
                                            aria-label="Edit Overview blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'overview';
                                              setActiveBlueprintGroup('overview');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{overviewCount}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${inclusionsCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'inclusions' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">Inclusions</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'inclusions' ? 'active' : ''}`}
                                            aria-label="Edit Inclusions blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'inclusions';
                                              setActiveBlueprintGroup('inclusions');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{inclusionsCount}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${howToUseCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'how_to_use' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">How to Use</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'how_to_use' ? 'active' : ''}`}
                                            aria-label="Edit How to Use blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'how_to_use';
                                              setActiveBlueprintGroup('how_to_use');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{howToUseCount}</span>
                                      </div>
                                      <div className={`smart-stat-pill ${faqsCount > 0 ? 'active' : ''} ${isBlueprintEditorOpen && activeBlueprintGroup === 'faqs' ? 'selected' : ''}`}>
                                        <div className="smart-stat-pill-head">
                                          <span className="k">FAQs</span>
                                          <button
                                            type="button"
                                            className={`smart-stat-edit ${isBlueprintEditorOpen && activeBlueprintGroup === 'faqs' ? 'active' : ''}`}
                                            aria-label="Edit FAQs blueprint"
                                            onClick={() => {
                                              const isSameGroup = isBlueprintEditorOpen && activeBlueprintGroup === 'faqs';
                                              setActiveBlueprintGroup('faqs');
                                              setIsBlueprintEditorOpen(!isSameGroup);
                                            }}
                                          >
                                            <Edit2 size={11} />
                                          </button>
                                        </div>
                                        <span className="v">{faqsCount}</span>
                                      </div>
                                    </div>

                                    <div className="smart-intelligence-tag">
                                      {magicRingCount > 0 ? (
                                        <>
                                          <motion.span 
                                            animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                          >
                                            <Sparkles size={14} color="#7c3aed" />
                                          </motion.span>
                                          <span className="smart-category-value">JSON Data Mapped Successfully ({magicRingCount} Fields)</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="smart-brain-pulse"><Brain size={14} /></span>
                                          <span className="smart-category-value">{categoryLabel}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="smart-hub-footer">
                                  <div className="smart-hub-actions">
                                    <button
                                      type="button"
                                      onClick={handlePasteFromClipboard}
                                      onMouseEnter={() => setIsCancelHovered(true)}
                                      onMouseLeave={() => setIsCancelHovered(false)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        background: isCancelHovered ? '#f3e8ff' : '#faf5ff',
                                        color: isCancelHovered ? '#6d28d9' : '#8b5cf6',
                                        border: '1px solid #6c3aa0',
                                        borderRadius: 12,
                                        padding: '10px 18px',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: 'Inter, Satoshi, Poppins, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <Clipboard size={14} />
                                      Paste
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleMagicFillClear}
                                      onMouseEnter={() => setIsClearHovered(true)}
                                      onMouseLeave={() => setIsClearHovered(false)}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        background: isClearHovered ? '#fee2e2' : '#fff1f2',
                                        color: isClearHovered ? '#b91c1c' : '#dc2626',
                                        border: '1px solid #fecaca',
                                        borderRadius: 12,
                                        padding: '10px 18px',
                                        fontWeight: 700,
                                        fontSize: 13,
                                        fontFamily: 'Inter, Satoshi, Poppins, sans-serif',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <Trash2 size={14} />
                                      Clear
                                    </button>

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
                                                {row.editable && (
                                                  <input
                                                    className="smart-blueprint-input"
                                                    value={row.value}
                                                    onChange={(e) => {
                                                      if (row.kind === 'specification') {
                                                        updateMagicBlueprintSpecification(row.index, 'value', e.target.value);
                                                      } else if (row.kind === 'inventory') {
                                                        updateMagicBlueprintInventory(row.index, e.target.value);
                                                      } else if (row.kind === 'overview_bullet') {
                                                        updateMagicBlueprintOverviewBullet(row.index, e.target.value);
                                                      } else if (row.kind === 'perfect_for') {
                                                        updateMagicBlueprintPerfectFor(row.index, e.target.value);
                                                      } else if (row.kind === 'why_love_it') {
                                                        updateMagicBlueprintWhyLoveIt(row.index, e.target.value);
                                                      } else if (row.kind === 'inclusion_item') {
                                                        updateMagicBlueprintInclusionItem(row.index, e.target.value);
                                                      } else if (row.kind === 'how_to_use_step') {
                                                        updateMagicBlueprintHowToUseStep(row.index, e.target.value);
                                                      } else if (row.kind === 'faq_question') {
                                                        updateMagicBlueprintFaqQuestion(row.index, e.target.value);
                                                      } else if (row.kind === 'faq_answer') {
                                                        updateMagicBlueprintFaqAnswer(row.index, e.target.value);
                                                      } else {
                                                        updateMagicBlueprintField(row.key, e.target.value);
                                                      }
                                                    }}
                                                  />
                                                )}
                                              </td>
                                              <td>
                                                {row.kind === 'specification' ? (
                                                  <button type="button" className="smart-blueprint-action" onClick={() => removeMagicBlueprintSpecification(row.index)}>Remove</button>
                                                ) : row.kind === 'inventory' ? (
                                                  <button type="button" className="smart-blueprint-action" onClick={() => removeMagicBlueprintInventory(row.index)}>Remove</button>
                                                ) : (row.kind === 'overview_bullet' || row.kind === 'perfect_for' || row.kind === 'why_love_it' || row.kind === 'inclusion_item' || row.kind === 'how_to_use_step') ? (
                                                  <span className="smart-blueprint-fixed">Editable</span>
                                                ) : (row.kind === 'faq_question' || row.kind === 'faq_answer') ? (
                                                  <span className="smart-blueprint-fixed">Editable</span>
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

                                    {['specifications', 'inventory', 'overview', 'inclusions', 'how_to_use', 'faqs'].includes(activeBlueprintGroup) && (
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

                                <div className="smart-audit-scroller" ref={magicAuditTableRef}>
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
                                        <tr key={`${row.id}-${row.step}-${row.type}`} className={animatingRowIds.has(row.id) ? 'audit-row-animating' : ''}>
                                          <td>{row.id}</td>
                                          <td>{row.step}</td>
                                          <td>{row.type}</td>
                                          <td>{row.timestamp}</td>
                                          <td>{row.action}</td>
                                          <td>
                                            {spinnerRowIds.has(row.id) ? (
                                              <div className="audit-row-spinner" />
                                            ) : (
                                              <span className={`smart-audit-status ${row.status === 'Error' ? 'err' : 'ok'}`}>
                                                {row.status}
                                              </span>
                                            )}
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
                        id="pf-name"
                        className={`custom-input ${saveValidationErrors.name ? 'pf-error' : ''}`}
                        type="text"
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          clearSaveValidationError('name');
                        }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.name ? '2px solid #ef4444' : '1px solid #a0a0a0', marginTop: 4 }}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                      <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500, display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                          Target Audience
                          <button type="button" className="pf-mini-plus-btn" onClick={openAudienceModal} title="Quick add audience">
                            <span>+</span>
                          </button>
                          <button
                            type="button"
                            onClick={openManageAudiencesModal}
                            onMouseEnter={() => setIsEditAudienceIconHovered(true)}
                            onMouseLeave={() => setIsEditAudienceIconHovered(false)}
                            title="Manage audiences"
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              border: isEditAudienceIconHovered ? '1px solid #d1d5db' : '1px solid #e4e4e7',
                              background: isEditAudienceIconHovered ? '#f3f4f6' : '#ffffff',
                              color: isEditAudienceIconHovered ? '#1f2937' : '#111827',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              padding: 0
                            }}
                          >
                            <Edit2 size={15} />
                          </button>
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div className="pf-select-wrap">
                              <select
                                id="pf-audience"
                                className={`custom-input pf-select ${saveValidationErrors.audience ? 'pf-error' : ''}`}
                                value={audience}
                                onChange={aud => {
                                  const id = aud.target.value ? parseInt(aud.target.value) : '';
                                  setAudience(id);
                                  setHighlightAudience(false);
                                  clearSaveValidationError('audience');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: 12,
                                  border: saveValidationErrors.audience ? '2px solid #ef4444' : (highlightAudience ? '2px solid #eab308' : '1px solid #a0a0a0'),
                                  background: saveValidationErrors.audience ? '#fef2f2' : (highlightAudience ? '#fef9c3' : '#fff'),
                                  marginTop: 4,
                                  transition: 'all 0.2s ease',
                                }}
                                required
                              >
                                <option value="">Select an audience</option>
                                {audiences.map(aud => (
                                  <option key={aud.id} value={aud.id}>{aud.name.charAt(0).toUpperCase() + aud.name.slice(1)}</option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="pf-select-icon" style={{ top: 'calc(50% + 2px)' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontWeight: 500, marginBottom: 4 }}>Slug (auto-generated)</label>
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
                        id="pf-brand"
                        className={`custom-input ${saveValidationErrors.brand ? 'pf-error' : ''}`}
                        type="text"
                        value={brand}
                        onChange={e => {
                          setBrand(e.target.value);
                          clearSaveValidationError('brand');
                        }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.brand ? '2px solid #ef4444' : '1px solid #a0a0a0', marginTop: 4 }}
                        placeholder="Enter brand name"
                        required
                      />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontWeight: 500 }}>Description</label>
                      <textarea
                        id="pf-description"
                        className={`custom-input ${saveValidationErrors.description ? 'pf-error' : ''}`}
                        value={description}
                        onChange={e => {
                          setDescription(e.target.value);
                          clearSaveValidationError('description');
                        }}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.description ? '2px solid #ef4444' : '1px solid #a0a0a0', minHeight: 80, marginTop: 4 }}
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
                            id="pf-category"
                            className={`custom-input pf-select ${saveValidationErrors.category ? 'pf-error' : ''}`}
                            value={categoryId}
                            onChange={e => {
                              setCategoryId(e.target.value);
                              setSubcategoryId('');
                              setSubSubcategoryId('');
                              setHighlightCategory(false);
                              clearSaveValidationError('category');
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: saveValidationErrors.category ? '2px solid #ef4444' : (highlightCategory ? '2px solid #eab308' : '1px solid #a0a0a0'),
                              background: saveValidationErrors.category ? '#fef2f2' : (highlightCategory ? '#fef9c3' : '#fff'),
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
                            id="pf-subcategory"
                            className={`custom-input pf-select ${saveValidationErrors.subcategory ? 'pf-error' : ''}`}
                            value={subcategoryId}
                            onChange={e => {
                              setSubcategoryId(e.target.value);
                              setSubSubcategoryId('');
                              setHighlightSubcategory(false);
                              clearSaveValidationError('subcategory');
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: saveValidationErrors.subcategory ? '2px solid #ef4444' : (highlightSubcategory ? '2px solid #eab308' : '1px solid #a0a0a0'),
                              opacity: !categoryId ? 0.6 : 1,
                              background: saveValidationErrors.subcategory ? '#fef2f2' : (highlightSubcategory ? '#fef9c3' : (!categoryId ? '#f5f6fa' : '#fff')),
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
                    <div className="pf-spec-section-stack">
                      {/* Field 1: Description Group */}
                      <div className="pf-spec-field-group">
                        <label className="pf-spec-label">Specification Description</label>
                        <textarea
                          className={`custom-textarea ${saveValidationErrors.specifications?.specDescription ? 'pf-error' : ''}`}
                          value={specDescription}
                          onChange={(e) => {
                            setSpecDescription(e.target.value);
                            clearSaveValidationError('specifications.specDescription');
                          }}
                          placeholder="Enter a brief intro for product specifications..."
                          rows={6}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 14,
                            border: saveValidationErrors.specifications?.specDescription ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            resize: 'vertical',
                            fontSize: '14px',
                            height: 'auto',
                            lineHeight: '1.6'
                          }}
                        />
                      </div>

                      {/* Field 2: Image URL Group */}
                      <div className="pf-spec-field-group">
                        <label className="pf-spec-label">Specification Image URL</label>
                        <input
                          className={`custom-input ${saveValidationErrors.specifications?.specImage ? 'pf-error' : ''}`}
                          type="text"
                          value={specImage}
                          onChange={(e) => {
                            setSpecImage(e.target.value);
                            clearSaveValidationError('specifications.specImage');
                          }}
                          placeholder="Image URL..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 14,
                            border: saveValidationErrors.specifications?.specImage ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      {/* Field 3: Video URL Group */}
                      <div className="pf-spec-field-group">
                        <label className="pf-spec-label">Specification Video URL (optional)</label>
                        <input
                          className={`custom-input ${saveValidationErrors.specifications?.specVideoUrl ? 'pf-error' : ''}`}
                          type="text"
                          value={specVideoUrl}
                          onChange={(e) => {
                            setSpecVideoUrl(e.target.value);
                            clearSaveValidationError('specifications.specVideoUrl');
                          }}
                          placeholder="Video URL..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 14,
                            border: saveValidationErrors.specifications?.specVideoUrl ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div className="pf-spec-divider-block">
                        <label className="pf-spec-label">Product Specifications</label>
                      </div>

                      <div className="pf-spec-repeat-list">
                        {specs.map((spec, idx) => (
                          <div key={spec.sk || `spec-${idx}`} className="pf-spec-row">
                            <input
                              className={`custom-input ${saveValidationErrors.specifications?.specRows?.[idx]?.key ? 'pf-error' : ''}`}
                              type="text"
                              value={spec.key}
                              onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                              placeholder="Key (e.g. Material)"
                              style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: saveValidationErrors.specifications?.specRows?.[idx]?.key ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                            />
                            <input
                              className={`custom-input ${saveValidationErrors.specifications?.specRows?.[idx]?.value ? 'pf-error' : ''}`}
                              type="text"
                              value={spec.value}
                              onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. Cotton)"
                              style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: saveValidationErrors.specifications?.specRows?.[idx]?.value ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
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
                        <button type="button" className="pf-outline-accent-btn pf-spec-action w-fit inline-flex items-center justify-center px-5 py-2.5" onClick={addSpec}><Plus size={14} />Add Specification</button>
                      </div>

                      {/* Specification Highlights Grid */}
                      <div className="pf-spec-divider-block pf-spec-section-stack" style={{ gap: 12 }}>
                        <label className="pf-spec-label">Specification Highlights Grid Title</label>
                        <input
                          className={`custom-input ${saveValidationErrors.specifications?.highlightsTitle ? 'pf-error' : ''}`}
                          type="text"
                          value={specHighlights.grid_title}
                          onChange={(e) => {
                            setSpecHighlights(prev => ({ ...prev, grid_title: e.target.value }));
                            clearSaveValidationError('specifications.highlightsTitle');
                          }}
                          placeholder="Highlights title..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 14,
                            border: saveValidationErrors.specifications?.highlightsTitle ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            fontSize: '14px'
                          }}
                        />

                        <div className="custom-scrollbar-container" style={{ width: '100%', overflowX: 'auto' }}>
                          <div style={{ minWidth: 'max-content', padding: '0 4px' }}>
                            <div className="pf-spec-repeat-list">
                              {specHighlights.grid_items.map((it, i) => (
                                <div key={`sh-${i}`} className="pf-spec-row" style={{ width: 'max-content' }}>
                                <div className="pf-spec-icon-group">
                                  <div className="w-12 h-12 border border-gray-100 rounded-xl bg-gray-50 shrink-0" style={{ width: 48, height: 48, minWidth: 48, borderRadius: 12, border: '1px solid #f3f4f6', background: '#f9fafb', alignSelf: 'center', position: 'relative' }}>
                                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
                                      {renderHighlightIcon(it.icon || 'Zap')}
                                    </span>
                                  </div>
                                  <IconSearchableSelect
                                    value={it.icon || 'Zap'}
                                    onChange={value => handleHighlightChange(i, 'icon', value)}
                                    iconCategories={typeof ICON_CATEGORIES !== 'undefined' ? ICON_CATEGORIES : []}
                                    renderIcon={renderHighlightIcon}
                                  />
                                </div>
                                  <input
                                    className={`custom-input ${saveValidationErrors.specifications?.highlightRows?.[i]?.value ? 'pf-error' : ''}`}
                                    type="text"
                                    value={it.value}
                                    onChange={e => handleHighlightChange(i, 'value', e.target.value)}
                                    placeholder="e.g. 24% Protein"
                                    style={{ width: 200, minWidth: 200, flex: '0 0 200px', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.specifications?.highlightRows?.[i]?.value ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                  />
                                  <input
                                    className={`custom-input ${saveValidationErrors.specifications?.highlightRows?.[i]?.title ? 'pf-error' : ''}`}
                                    type="text"
                                    value={it.title}
                                    onChange={e => handleHighlightChange(i, 'title', e.target.value)}
                                    placeholder="e.g. Protein"
                                    style={{ width: 180, minWidth: 180, flex: '0 0 180px', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.specifications?.highlightRows?.[i]?.title ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                  />
                                  <input
                                    className={`custom-input ${saveValidationErrors.specifications?.highlightRows?.[i]?.subtitle ? 'pf-error' : ''}`}
                                    type="text"
                                    value={it.subtitle}
                                    onChange={e => handleHighlightChange(i, 'subtitle', e.target.value)}
                                    placeholder="e.g. Supports strong muscles"
                                    style={{ width: 260, minWidth: 260, flex: '0 0 260px', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.specifications?.highlightRows?.[i]?.subtitle ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeHighlight(i)}
                                    title="Remove highlight"
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
                                      flex: '0 0 auto',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button type="button" className="pf-outline-accent-btn pf-spec-action w-fit inline-flex items-center justify-center px-5 py-2.5" onClick={addHighlight}><Plus size={14} />Add Highlight</button>
                      </div>

                      {/* SPECIFICATION BOTTOM BANNER IMAGE URL */}
                      <div className="pf-spec-field-group">
                        <label className="pf-spec-label">Specification Bottom Banner Image URL</label>
                        <input
                          className={`custom-input ${saveValidationErrors.specifications?.specBottomBanner ? 'pf-error' : ''}`}
                          type="text"
                          value={spec_bottom_banner}
                          onChange={(e) => {
                            setSpec_bottom_banner(e.target.value);
                            clearSaveValidationError('specifications.specBottomBanner');
                          }}
                          placeholder="Banner Image URL..."
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 14,
                            border: saveValidationErrors.specifications?.specBottomBanner ? '2px solid #ef4444' : '1px solid #e5e7eb',
                            backgroundColor: '#fff',
                            fontSize: '14px'
                          }}
                        />
                      </div>
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
                          id="pf-mainImage"
                          className={`custom-input ${saveValidationErrors.mainImage ? 'pf-error' : ''}`}
                          type="text"
                          value={mainImage}
                          onChange={e => {
                            setMainImage(e.target.value);
                            clearSaveValidationError('mainImage');
                            clearSaveValidationError('inventory', 0, 'image');
                          }}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.mainImage ? '2px solid #ef4444' : '1px solid #a0a0a0', marginTop: 4 }}
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
                              top: '50%',
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
                        <div style={{ marginTop: 10 }}>
                          <img src={mainImage} alt="Main" style={{ marginTop: 10, maxWidth: 180, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
                        </div>
                      )}

                      <div style={{ marginBottom: 24, marginTop: 12 }}>
                        <label style={{ fontWeight: 500 }}>Product Video URL (optional)</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="pf-videoUrl"
                            className={`custom-input ${saveValidationErrors.videoUrl ? 'pf-error' : ''}`}
                            type="text"
                            value={videoUrl}
                            onChange={e => { setVideoUrl(e.target.value); clearSaveValidationError('videoUrl'); }}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.videoUrl ? '2px solid #ef4444' : '1px solid #a0a0a0', marginTop: 4 }}
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
                              id={`pf-gallery-${idx}`}
                              className={`custom-input ${saveValidationErrors.galleryImages && !String(img || '').trim() ? 'pf-error' : ''}`}
                              type="text"
                              value={img}
                              onChange={e => handleGalleryImageChange(idx, e.target.value)}
                              placeholder="Paste Cloudinary image URL"
                              style={{ flex: 1, padding: '8px 10px', borderRadius: 12, border: (saveValidationErrors.galleryImages && !String(img || '').trim()) ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
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
                      <div style={{ minWidth: 'max-content', padding: '0 4px' }}>
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
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Size</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Unit</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Extra Info</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Variety</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Sub Size</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Sub Unit</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Color</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Price</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Stock</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>SKU</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Image</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Sep. Gallery</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} />
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
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className={`custom-input ${saveValidationErrors.inventory?.[index]?.size_value ? 'pf-error' : ''}`} type="text" value={variant.size_value || ''} onChange={e => handleVariantChange(index, 'size_value', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: saveValidationErrors.inventory?.[index]?.size_value ? '2px solid #ef4444' : '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className={`custom-input ${saveValidationErrors.inventory?.[index]?.size_unit ? 'pf-error' : ''}`} type="text" value={variant.size_unit || ''} onChange={e => handleVariantChange(index, 'size_unit', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: saveValidationErrors.inventory?.[index]?.size_unit ? '2px solid #ef4444' : '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className="custom-input" type="text" value={variant.size_info || ''} onChange={e => handleVariantChange(index, 'size_info', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'left' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className="custom-input" type="text" value={variant.variety || variant.variety_label || ''} onChange={e => handleVariantChange(index, 'variety', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className="custom-input" type="text" value={variant.sub_size || ''} onChange={e => handleVariantChange(index, 'sub_size', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className="custom-input" type="text" value={variant.sub_size_unit || ''} onChange={e => handleVariantChange(index, 'sub_size_unit', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className={`custom-input ${saveValidationErrors.inventory?.[index]?.color ? 'pf-error' : ''}`} type="text" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: saveValidationErrors.inventory?.[index]?.color ? '2px solid #ef4444' : '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className={`custom-input ${saveValidationErrors.inventory?.[index]?.price ? 'pf-error' : ''}`} type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: saveValidationErrors.inventory?.[index]?.price ? '2px solid #ef4444' : '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <input className={`custom-input ${saveValidationErrors.inventory?.[index]?.stock ? 'pf-error' : ''}`} type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{ width: '100%', height: 40, padding: '0 8px', borderRadius: 12, border: saveValidationErrors.inventory?.[index]?.stock ? '2px solid #ef4444' : '1px solid #a0a0a0', textAlign: 'center' }} />
                                </div>
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
                                      className={`custom-input ${saveValidationErrors.inventory?.[index]?.image ? 'pf-error' : ''}`}
                                      type="text"
                                      value={variant.image}
                                      readOnly
                                      style={{
                                        width: '100%',
                                        height: 40,
                                        padding: '0 8px',
                                        borderRadius: 12,
                                        border: saveValidationErrors.inventory?.[index]?.image ? '2px solid #ef4444' : '1px solid #d1d5db',
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
                                    className={`custom-input ${saveValidationErrors.inventory?.[index]?.image ? 'pf-error' : ''}`}
                                    type="text"
                                    value={variant.image}
                                    onChange={e => handleVariantChange(index, 'image', e.target.value)}
                                    style={{
                                      width: '100%',
                                      height: 40,
                                      padding: '0 8px',
                                      borderRadius: 12,
                                      border: saveValidationErrors.inventory?.[index]?.image ? '2px solid #ef4444' : '1px solid #a0a0a0',
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
                            <div className="pf-select-wrap" style={{ width: '100%', maxWidth: 300 }}>
                              <select
                                className="custom-input pf-select"
                                value={selectedGalleryVariantId || ''}
                                onChange={(e) => setSelectedGalleryVariantId(e.target.value || null)}
                                style={{ width: '100%', padding: '10px 64px 10px 14px', borderRadius: 12, border: '1px solid #a0a0a0', marginTop: 4, fontFamily: 'Poppins, sans-serif' }}
                              >
                                <option value="">All Variants (Shared Gallery)</option>
                                {variantRows.length > 0 && variantRows
                                    .filter((variant) => Boolean(variant.id) && Boolean(variant.use_separate_gallery))
                                  .map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {composeVariantSize(variant) && variant.color ? `${composeVariantSize(variant)} + ${variant.color}` : 'Variant'}
                                    </option>
                                  ))}
                              </select>
                              <ChevronDown size={16} className="pf-select-icon" style={{ right: 15 }} />
                            </div>
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
                        const discType = variant.discount_type || '';
                        const discValue = Number(variant.discount_value) || 0;

                        // Check for unpersisted local changes
                        const originalSnapshot = savedVariantDiscounts[variant.id];
                        const hasChanges = !originalSnapshot 
                          ? true 
                          : (
                            Boolean(variant.override_discount) !== Boolean(originalSnapshot.override_discount) ||
                            variant.discount_type !== originalSnapshot.discount_type ||
                            Number(variant.discount_value) !== Number(originalSnapshot.discount_value)
                          );
                        const isUpdatingThis = updatingVariantDiscountId === variant.id;

                        // Safe math calculation
                        let finalPrice = originalPrice;
                        if (hasOverride && discType) {
                          if (discType === 'Percentage') {
                            finalPrice = originalPrice * (1 - discValue / 100);
                          } else if (discType === 'Fixed') {
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
                                  Variant #{index + 1} ({composeVariantSize(variant) || 'No Size'} / {variant.color || 'No Color'})
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
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                              {hasOverride && (
                                <div style={{ width: 180 }}>
                                  <label style={{ fontSize: 12, fontWeight: 500, color: '#4b5563', marginBottom: 4, display: 'block' }}>Type</label>
                                  <div className="pf-select-wrap">
                                    <select
                                      className="custom-input pf-select"
                                      value={discType}
                                      onChange={(e) => handleVariantChange(index, 'discount_type', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '8px 64px 8px 12px',
                                        borderRadius: 8,
                                        border: '1px solid #d1d5db',
                                        height: 38,
                                      }}
                                    >
                                      <option value="" disabled>Select Value</option>
                                      <option value="Percentage">Percentage (%)</option>
                                      <option value="Fixed">Fixed (₹)</option>
                                    </select>
                                    <ChevronDown size={16} className="pf-select-icon" style={{ right: 10 }} />
                                  </div>
                                </div>
                              )}

                              {/* Nested stack wrapping everything starting from the Value block to effectively scope horizontal bounds */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                                {/* Top content row holds inputs + price summary card */}
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 24 }}>
                                  {hasOverride && (
                                    <div style={{ width: 100 }}>
                                      <label style={{ fontSize: 12, fontWeight: 500, color: '#4b5563', marginBottom: 4, display: 'block' }}>Value</label>
                                      <input
                                        className="custom-input"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0"
                                        disabled={!discType}
                                        value={!discType ? '' : (variant.discount_value || '')}
                                        onChange={(e) => handleVariantChange(index, 'discount_value', e.target.value)}
                                        style={{ 
                                          width: '100%', 
                                          padding: '8px 12px', 
                                          borderRadius: 8, 
                                          border: '1px solid #d1d5db', 
                                          height: 38,
                                          opacity: !discType ? 0.6 : 1,
                                          cursor: !discType ? 'not-allowed' : 'text'
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Price Summary Card (establishes the Right Edge for the wrapper) */}
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
                                      <span style={{ fontSize: 13, textDecoration: (hasOverride && discType) ? 'line-through' : 'none', color: (hasOverride && discType) ? '#94a3b8' : '#1e293b', fontWeight: 600 }}>
                                        ₹{originalPrice.toFixed(2)}
                                      </span>
                                    </div>
                                    {hasOverride && (
                                      <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 400 }}>Discount</span>
                                          <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                                            {discType === 'Percentage' ? `${discValue}%` : discType === 'Fixed' ? `₹${discValue.toFixed(2)}` : '—'}
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

                                {/* Action Button: Positioned here automatically aligns to Wrapper Right Edge (Price Box edge) */}
                                {variant.id && hasOverride && (
                                  <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={(!isUpdatingThis && hasChanges) ? { backgroundColor: '#c0456b', scale: 1.02 } : {}}
                                    whileTap={(!isUpdatingThis && hasChanges) ? { scale: 0.98 } : {}}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => updateDiscountForSpecificVariant(index)}
                                    disabled={isUpdatingThis || !hasChanges}
                                    style={{
                                      background: (isUpdatingThis || !hasChanges) ? '#E5E7EB' : '#d6517c',
                                      color: (isUpdatingThis || !hasChanges) ? '#9CA3AF' : '#ffffff',
                                      border: 'none',
                                      borderRadius: 8,
                                      padding: '8px 16px',
                                      fontSize: 13,
                                      fontWeight: 600,
                                      cursor: (isUpdatingThis || !hasChanges) ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      height: 38
                                    }}
                                  >
                                    {isUpdatingThis ? 'Applying...' : 'Update Discount'}
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'overview' && (() => {
                  const iconOptions = Array.from(new Set([
                    'Check', 'Smile', 'Heart', 'Layout', 'Sparkles', 'Star', 'Gift', 'Zap', 'Award', 'Cpu', 'Shield', 'Truck', 'Package', 'Home', 'Briefcase', 'Clock', 'ThumbsUp',
                    ...(typeof ICON_CATEGORIES !== 'undefined' ? ICON_CATEGORIES.flatMap(cat => cat.icons) : [])
                  ]));
                  const renderIcon = (name) => {
                    const lower = String(name || '').trim().toLowerCase();
                    switch (lower) {
                      case 'cpu': return <Cpu size={16} />;
                      case 'zap': return <Zap size={16} />;
                      case 'award': return <Award size={16} />;
                      case 'shield': return <Shield size={16} />;
                      case 'truck': return <Truck size={16} />;
                      case 'package': return <Package size={16} />;
                      case 'home': return <Home size={16} />;
                      case 'briefcase': return <Briefcase size={16} />;
                      case 'heart': return <Heart size={16} />;
                      case 'smile': return <Smile size={16} />;
                      case 'star': return <Star size={16} />;
                      case 'gift': return <Gift size={16} />;
                      case 'clock': return <Clock size={16} />;
                      case 'thumbsup': return <ThumbsUp size={16} />;
                      case 'layout': return <Layout size={16} />;
                      case 'sparkles': return <Sparkles size={16} />;
                      case 'check': return <Check size={16} />;
                      
                      // Trust & Quality
                      case 'badgecheck': return <BadgeCheck size={16} />;
                      case 'shieldcheck': return <ShieldCheck size={16} />;
                      case 'medal': return <Medal size={16} />;
                      case 'verified': return <Verified size={16} />;
                      case 'fingerprint': return <Fingerprint size={16} />;
                      case 'crown': return <Crown size={16} />;
                      
                      // Shipping & Service
                      case 'box': return <Box size={16} />;
                      case 'globe': return <Globe size={16} />;
                      case 'plane': return <Plane size={16} />;
                      case 'ship': return <Ship size={16} />;
                      case 'shoppingbag': return <ShoppingBag size={16} />;
                      case 'headphones': return <Headphones size={16} />;
                      case 'mappin': return <MapPin size={16} />;
                      
                      // Home & Lifestyle
                      case 'bed': return <Bed size={16} />;
                      case 'sofa': return <Sofa size={16} />;
                      case 'lamp': return <Lamp size={16} />;
                      case 'bath': return <Bath size={16} />;
                      case 'utensils': return <Utensils size={16} />;
                      case 'coffee': return <Coffee size={16} />;
                      case 'leaf': return <Leaf size={16} />;
                      case 'recycle': return <Recycle size={16} />;
                      case 'droplets': return <Droplets size={16} />;
                      case 'wind': return <Wind size={16} />;
                      case 'sun': return <Sun size={16} />;
                      case 'moon': return <Moon size={16} />;
                      case 'flower': return <Flower size={16} />;
                      case 'flowers': return <Flower size={16} />;
                      
                      // Tech & Specs
                      case 'smartphone': return <Smartphone size={16} />;
                      case 'monitor': return <Monitor size={16} />;
                      case 'code': return <Code size={16} />;
                      case 'database': return <Database size={16} />;
                      case 'batterycharging': return <BatteryCharging size={16} />;
                      case 'wifi': return <Wifi size={16} />;
                      case 'bluetooth': return <Bluetooth size={16} />;
                      case 'harddrive': return <HardDrive size={16} />;
                      case 'mouse': return <Mouse size={16} />;
                      case 'keyboard': return <Keyboard size={16} />;
                      
                      // Materials & Design
                      case 'layers': return <Layers size={16} />;
                      case 'scissors': return <Scissors size={16} />;
                      case 'pentool': return <PenTool size={16} />;
                      case 'ruler': return <Ruler size={16} />;
                      case 'palette': return <Palette size={16} />;
                      case 'hammer': return <Hammer size={16} />;
                      case 'wrench': return <Wrench size={16} />;
                      case 'tool': return <Wrench size={16} />;
                      case 'diamond': return <Diamond size={16} />;
                      case 'scale': return <Scale size={16} />;

                      default: return <HelpCircle size={16} />;
                    }
                  };

                  const subStepValidStates = {
                    1: (() => {
                      const heading = String(overviewData.intro?.heading || '').trim();
                      const desc = String(overviewData.intro?.text || '').trim();
                      const hasBullet = Array.isArray(overviewData.intro?.bullets) &&
                        overviewData.intro.bullets.some(b => String(b?.text || '').trim() !== '');
                      return Boolean(heading && desc && hasBullet);
                    })(),
                    2: (() => {
                      return Array.isArray(overviewData.use_cases) &&
                        overviewData.use_cases.some(uc => String(uc?.image || '').trim() !== '');
                    })(),
                    3: (() => {
                      return Array.isArray(overviewData.perfect_for) &&
                        overviewData.perfect_for.some(pf => String(pf?.label || '').trim() !== '');
                    })(),
                    4: (() => {
                      return Array.isArray(overviewData.why_love_it) &&
                        overviewData.why_love_it.some(w => String(w?.text || '').trim() !== '');
                    })(),
                  };

                  return (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid #eef0f3', paddingBottom: 20, marginBottom: 28 }}>
                        <div className="pf-section-title" style={{ marginBottom: 0 }}>
                          <span className="pf-section-title-icon"><Layout size={16} /></span>
                          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, fontFamily: "'Outfit', 'Inter', sans-serif" }}>Overview Configuration</h3>
                        </div>

                        {/* Sub-Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
                          {[
                            { step: 1, label: 'Intro' },
                            { step: 2, label: 'Use Cases' },
                            { step: 3, label: 'Perfect For' },
                            { step: 4, label: 'Value' }
                          ].map((item, index, arr) => {
                            const stepNum = item.step;
                            const isActive = activeSubStep === stepNum;
                            const isStepValid = Boolean(subStepValidStates[stepNum]);
                            return (
                              <React.Fragment key={stepNum}>
                                <button
                                  type="button"
                                  onClick={() => setActiveSubStep(stepNum)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none', background: 'none', padding: '4px 8px', borderRadius: 8, transition: 'all 0.2s ease', opacity: (isStepValid || isActive) ? 1 : 0.55 }}
                                  title={`Navigate to ${item.label}`}
                                >
                                  <div style={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: isStepValid ? '#22c55e' : (isActive ? '#c8507a' : '#f3f4f6'),
                                    color: (isStepValid || isActive) ? '#fff' : '#6b7280',
                                    border: isStepValid ? 'none' : (isActive ? 'none' : '1px solid #d1d5db'),
                                    transition: 'all 0.2s'
                                  }}>
                                    {isStepValid ? <Check size={13} /> : stepNum}
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: (isActive || isStepValid) ? 700 : 500, color: isStepValid ? '#22c55e' : (isActive ? '#c8507a' : '#4b5563') }}>
                                    {item.label}
                                  </span>
                                </button>
                                {index < arr.length - 1 && (() => {
                                  const isLineConnected = Boolean(subStepValidStates[stepNum] && subStepValidStates[stepNum + 1]);
                                  return (
                                    <div style={{ 
                                      width: 20, 
                                      height: 2, 
                                      background: isLineConnected ? '#22c55e' : '#e4e4e7', 
                                      borderRadius: 1,
                                      transition: 'all 0.2s ease'
                                    }} />
                                  );
                                })()}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content Rendering per Sub-Step */}
                      <div style={{ minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                        {activeSubStep === 1 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                              <label style={{ fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: 6 }}>Intro Heading</label>
                              <input
                                className={`custom-input ${saveValidationErrors.overview?.introHeading ? 'pf-error' : ''}`}
                                type="text"
                                value={overviewData.intro?.heading || ''}
                                onChange={(e) => {
                                  setOverviewData((prev) => ({
                                    ...prev,
                                    intro: { ...prev.intro, heading: e.target.value },
                                  }));
                                  clearSaveValidationError('overview.introHeading');
                                }}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.introHeading ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                placeholder="e.g. Organize Everything. Simplify Your Space."
                              />
                            </div>
                            
                            <div>
                              <label style={{ fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: 6 }}>Intro Description</label>
                              <textarea
                                className={`custom-input ${saveValidationErrors.overview?.introDescription ? 'pf-error' : ''}`}
                                rows={3}
                                value={overviewData.intro?.text || ''}
                                onChange={(e) => {
                                  setOverviewData((prev) => ({
                                    ...prev,
                                    intro: { ...prev.intro, text: e.target.value },
                                  }));
                                  clearSaveValidationError('overview.introDescription');
                                }}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.introDescription ? '2px solid #ef4444' : '1px solid #a0a0a0', resize: 'vertical' }}
                                placeholder="e.g. Maximize your living and workspaces with this durable, multi-purpose storage solution..."
                              />
                            </div>

                            <div>
                              <label style={{ fontWeight: 500, color: '#1f2937', display: 'block', marginBottom: 10 }}>Key Features & Highlights</label>
                              {(overviewData.intro?.bullets || []).map((b, idx) => (
                                <div key={`bullet-${idx}`} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                  {/* Col 1: Icon Preview Box */}
                                  <div style={{
                                    width: 45,
                                    height: 45,
                                    minWidth: 45,
                                    border: '1px solid #d1d5db',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#c8507a',
                                    background: '#f9fafb',
                                  }}>
                                    {renderIcon(b.icon)}
                                  </div>

                                  {/* Col 2: Searchable Icon Select */}
                                  <IconSearchableSelect
                                    value={b.icon}
                                    onChange={(newIcon) => {
                                      const updated = [...(overviewData.intro?.bullets || [])];
                                      updated[idx] = { ...updated[idx], icon: newIcon };
                                      setOverviewData((prev) => ({ ...prev, intro: { ...prev.intro, bullets: updated } }));
                                    }}
                                    iconCategories={typeof ICON_CATEGORIES !== 'undefined' ? ICON_CATEGORIES : []}
                                    renderIcon={renderIcon}
                                  />

                                  {/* Col 3: Highlight Description */}
                                  <input
                                    className={`custom-input ${saveValidationErrors.overview?.introBullets?.[idx] ? 'pf-error' : ''}`}
                                    type="text"
                                    value={b.text || ''}
                                    onChange={(e) => {
                                      const updated = [...(overviewData.intro?.bullets || [])];
                                      updated[idx] = { ...updated[idx], text: e.target.value };
                                      setOverviewData((prev) => ({ ...prev, intro: { ...prev.intro, bullets: updated } }));
                                      clearSaveValidationError('overview.introBullets', idx);
                                    }}
                                    placeholder="e.g. High grade acrylic material..."
                                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.introBullets?.[idx] ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (overviewData.intro?.bullets || []).filter((_, i) => i !== idx);
                                      setOverviewData((prev) => ({ ...prev, intro: { ...prev.intro, bullets: updated } }));
                                    }}
                                    style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'inline-flex' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="pf-outline-accent-btn"
                                onClick={() => setOverviewData((prev) => ({
                                  ...prev,
                                  intro: { ...prev.intro, bullets: [...(prev.intro?.bullets || []), { icon: 'Check', text: '' }] }
                                }))}
                                style={{ marginTop: 6, gap: 6, display: 'inline-flex', alignItems: 'center' }}
                              >
                                <Plus size={14} /> Add Highlight
                              </button>
                            </div>
                          </div>
                        )}

                        {activeSubStep === 2 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <label style={{ fontWeight: 500, color: '#1f2937', display: 'block' }}>Product Use Cases</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {(overviewData.use_cases || []).map((uc, idx) => (
                                <div key={`usecase-${idx}`} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                  <div style={{ flex: 1 }}>
                                    <input
                                      className={`custom-input ${saveValidationErrors.overview?.useCases?.[idx] ? 'pf-error' : ''}`}
                                      type="text"
                                      value={uc.image || ''}
                                      onChange={(e) => {
                                        const updated = [...(overviewData.use_cases || [])];
                                        updated[idx] = { ...updated[idx], image: e.target.value };
                                        setOverviewData(prev => ({ ...prev, use_cases: updated }));
                                        clearSaveValidationError('overview.useCases', idx);
                                      }}
                                      placeholder="e.g. https://cloudinary.com/use-case-image.jpg"
                                      style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.useCases?.[idx] ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (overviewData.use_cases || []).filter((_, i) => i !== idx);
                                      setOverviewData(prev => ({ ...prev, use_cases: updated }));
                                    }}
                                    style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'inline-flex' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              className="pf-outline-accent-btn"
                              onClick={() => setOverviewData(prev => ({
                                ...prev,
                                use_cases: [...(prev.use_cases || []), { image: '' }]
                              }))}
                              style={{ width: 'max-content', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6 }}
                            >
                              <Plus size={14} /> Add Image
                            </button>
                          </div>
                        )}

                        {activeSubStep === 3 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <label style={{ fontWeight: 500, color: '#1f2937', display: 'block' }}>Perfect For Scenarios</label>
                            {(overviewData.perfect_for || []).map((pf, idx) => (
                              <div key={`perfect-${idx}`} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                {/* Col 1: Icon Preview Box */}
                                <div style={{
                                  width: 45,
                                  height: 45,
                                  minWidth: 45,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#c8507a',
                                  background: '#f9fafb',
                                }}>
                                  {renderIcon(pf.icon)}
                                </div>

                                {/* Col 2: Searchable Icon Select */}
                                <IconSearchableSelect
                                  value={pf.icon}
                                  onChange={(newIcon) => {
                                    const updated = [...(overviewData.perfect_for || [])];
                                    updated[idx] = { ...updated[idx], icon: newIcon };
                                    setOverviewData(prev => ({ ...prev, perfect_for: updated }));
                                  }}
                                  iconCategories={typeof ICON_CATEGORIES !== 'undefined' ? ICON_CATEGORIES : []}
                                  renderIcon={renderIcon}
                                />

                                {/* Col 3: Scenario Context */}
                                <input
                                  className={`custom-input ${saveValidationErrors.overview?.perfectFor?.[idx] ? 'pf-error' : ''}`}
                                  type="text"
                                  value={pf.label || ''}
                                  onChange={(e) => {
                                    const updated = [...(overviewData.perfect_for || [])];
                                    updated[idx] = { ...updated[idx], label: e.target.value };
                                    setOverviewData(prev => ({ ...prev, perfect_for: updated }));
                                    clearSaveValidationError('overview.perfectFor', idx);
                                  }}
                                  placeholder="e.g. Workspaces, Makeup Counters, Bedrooms..."
                                  style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.perfectFor?.[idx] ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (overviewData.perfect_for || []).filter((_, i) => i !== idx);
                                    setOverviewData(prev => ({ ...prev, perfect_for: updated }));
                                  }}
                                  style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'inline-flex' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="pf-outline-accent-btn"
                              onClick={() => setOverviewData(prev => ({
                                ...prev,
                                perfect_for: [...(prev.perfect_for || []), { icon: 'Smile', label: '' }]
                              }))}
                              style={{ width: 'max-content', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Plus size={14} /> Add Destination Scenario
                            </button>
                          </div>
                        )}

                        {activeSubStep === 4 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <label style={{ fontWeight: 500, color: '#1f2937', display: 'block' }}>Why You'll Love It (Value Proposition)</label>
                            {(overviewData.why_love_it || []).map((w, idx) => (
                              <div key={`love-${idx}`} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                {/* Col 1: Icon Preview Box */}
                                <div style={{
                                  width: 45,
                                  height: 45,
                                  minWidth: 45,
                                  border: '1px solid #d1d5db',
                                  borderRadius: 12,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#c8507a',
                                  background: '#f9fafb',
                                }}>
                                  {renderIcon(w.icon)}
                                </div>

                                {/* Col 2: Searchable Icon Select */}
                                <IconSearchableSelect
                                  value={w.icon}
                                  onChange={(newIcon) => {
                                    const updated = [...(overviewData.why_love_it || [])];
                                    updated[idx] = { ...updated[idx], icon: newIcon };
                                    setOverviewData(prev => ({ ...prev, why_love_it: updated }));
                                  }}
                                  iconCategories={typeof ICON_CATEGORIES !== 'undefined' ? ICON_CATEGORIES : []}
                                  renderIcon={renderIcon}
                                />

                                {/* Col 3: Value Proposition Description */}
                                <input
                                  className={`custom-input ${saveValidationErrors.overview?.whyLoveIt?.[idx] ? 'pf-error' : ''}`}
                                  type="text"
                                  value={w.text || ''}
                                  onChange={(e) => {
                                    const updated = [...(overviewData.why_love_it || [])];
                                    updated[idx] = { ...updated[idx], text: e.target.value };
                                    setOverviewData(prev => ({ ...prev, why_love_it: updated }));
                                    clearSaveValidationError('overview.whyLoveIt', idx);
                                  }}
                                  placeholder="e.g. Durable design that stands the test of time..."
                                  style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: saveValidationErrors.overview?.whyLoveIt?.[idx] ? '2px solid #ef4444' : '1px solid #a0a0a0' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (overviewData.why_love_it || []).filter((_, i) => i !== idx);
                                    setOverviewData(prev => ({ ...prev, why_love_it: updated }));
                                  }}
                                  style={{ padding: 8, background: '#fef2f2', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444', display: 'inline-flex' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="pf-outline-accent-btn"
                              onClick={() => setOverviewData(prev => ({
                                ...prev,
                                why_love_it: [...(prev.why_love_it || []), { icon: 'Heart', text: '' }]
                              }))}
                              style={{ width: 'max-content', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Plus size={14} /> Add Value Proposition
                            </button>
                          </div>
                        )}
                      </div>


                    </>
                  );
                })()}

                {activeTab === 'inclusions' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Package size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Package Inclusions</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                      Define what's included in the box for this product.
                    </p>

                    <div style={{ display: 'grid', gap: 24 }}>
                      <div>
                        <label className="pf-label">Section Title</label>
                        <input
                          className={`custom-input ${saveValidationErrors.inclusions?.title ? 'pf-error' : ''}`}
                          type="text"
                          placeholder="e.g. What's in the Box"
                          value={inclusions.title}
                          onChange={(e) => {
                            setInclusions(prev => ({ ...prev, title: e.target.value }));
                            clearSaveValidationError('inclusions.title');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.inclusions?.title ? '2px solid #ef4444' : undefined }}
                        />
                      </div>


                      <div>
                        <label className="pf-label">Description</label>
                        <textarea
                          className={`custom-input ${saveValidationErrors.inclusions?.description ? 'pf-error' : ''}`}
                          rows={4}
                          placeholder="Description..."
                          value={inclusions.description}
                          onChange={(e) => {
                            setInclusions(prev => ({ ...prev, description: e.target.value }));
                            clearSaveValidationError('inclusions.description');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.inclusions?.description ? '2px solid #ef4444' : undefined }}
                        />
                      </div>

                      <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <label className="pf-label" style={{ margin: 0 }}>Items</label>
                          <button
                            type="button"
                            onClick={() => setInclusions(prev => ({ ...prev, items: [...prev.items, { short_description: '', image_url: '' }] }))}
                            className="pf-outline-accent-btn"
                            style={{ padding: '6px 12px', fontSize: 12, height: 'auto' }}
                          >
                            <Plus size={14} /> Add Item
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: 12 }}>
                          {inclusions.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <input
                                  className={`custom-input ${saveValidationErrors.inclusions?.items?.[idx]?.short_description ? 'pf-error' : ''}`}
                                  type="text"
                                  placeholder="Short Description"
                                  value={item.short_description}
                                  onChange={(e) => {
                                    const newItems = [...inclusions.items];
                                    newItems[idx].short_description = e.target.value;
                                    setInclusions(prev => ({ ...prev, items: newItems }));
                                    clearSaveValidationError('inclusions.items', idx, 'short_description');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.inclusions?.items?.[idx]?.short_description ? '2px solid #ef4444' : undefined }}
                                />
                                <input
                                  className={`custom-input ${saveValidationErrors.inclusions?.items?.[idx]?.image_url ? 'pf-error' : ''}`}
                                  type="text"
                                  placeholder="Image URL"
                                  value={item.image_url || ''}
                                  onChange={(e) => {
                                    const newItems = [...inclusions.items];
                                    newItems[idx].image_url = e.target.value;
                                    setInclusions(prev => ({ ...prev, items: newItems }));
                                    clearSaveValidationError('inclusions.items', idx, 'image_url');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.inclusions?.items?.[idx]?.image_url ? '2px solid #ef4444' : undefined }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (inclusions.items.length > 1) {
                                    setInclusions(prev => ({
                                      ...prev,
                                      items: prev.items.filter((_, i) => i !== idx)
                                    }));
                                  }
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'how_to_use' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><Info size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>How to Use</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                      Provide instructions or steps on how to use this product.
                    </p>

                    <div style={{ display: 'grid', gap: 24 }}>
                      <div>
                        <label className="pf-label">Section Title</label>
                        <input
                          className={`custom-input ${saveValidationErrors.howToUse?.title ? 'pf-error' : ''}`}
                          type="text"
                          placeholder="e.g. How to Use"
                          value={howToUse.title}
                          onChange={(e) => {
                            setHowToUse(prev => ({ ...prev, title: e.target.value }));
                            clearSaveValidationError('howToUse.title');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.howToUse?.title ? '2px solid #ef4444' : undefined }}
                        />
                      </div>
                      <div>
                        <label className="pf-label">Hero Image URL</label>
                        <input
                          className={`custom-input ${saveValidationErrors.howToUse?.heroImageUrl ? 'pf-error' : ''}`}
                          type="text"
                          placeholder="Image URL"
                          value={howToUse.hero_image_url}
                          onChange={(e) => {
                            setHowToUse(prev => ({ ...prev, hero_image_url: e.target.value }));
                            clearSaveValidationError('howToUse.heroImageUrl');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.howToUse?.heroImageUrl ? '2px solid #ef4444' : undefined }}
                        />
                      </div>

                      <div>
                        <label className="pf-label">Description</label>
                        <textarea
                          className={`custom-input ${saveValidationErrors.howToUse?.description ? 'pf-error' : ''}`}
                          rows={4}
                          placeholder="Description..."
                          value={howToUse.description}
                          onChange={(e) => {
                            setHowToUse(prev => ({ ...prev, description: e.target.value }));
                            clearSaveValidationError('howToUse.description');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.howToUse?.description ? '2px solid #ef4444' : undefined }}
                        />
                      </div>

                      <div>
                        <label className="pf-label">TIP</label>
                        <textarea
                          className={`custom-input ${saveValidationErrors.howToUse?.tip ? 'pf-error' : ''}`}
                          rows={4}
                          placeholder="e.g. Tip: Clean with a soft, damp cloth for long-lasting use."
                          value={howToUse.tip}
                          onChange={(e) => {
                            setHowToUse(prev => ({ ...prev, tip: e.target.value }));
                            clearSaveValidationError('howToUse.tip');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.howToUse?.tip ? '2px solid #ef4444' : undefined }}
                        />
                      </div>

                      <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <label className="pf-label" style={{ margin: 0 }}>Steps / Items</label>
                          <button
                            type="button"
                            onClick={() => setHowToUse(prev => ({ ...prev, items: [...prev.items, { short_description: '', image_url: '' }] }))}
                            className="pf-outline-accent-btn"
                            style={{ padding: '6px 12px', fontSize: 12, height: 'auto' }}
                          >
                            <Plus size={14} /> Add Step
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: 12 }}>
                          {howToUse.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <input
                                  className={`custom-input ${saveValidationErrors.howToUse?.items?.[idx]?.short_description ? 'pf-error' : ''}`}
                                  type="text"
                                  placeholder="Short Description / Step Info"
                                  value={item.short_description}
                                  onChange={(e) => {
                                    const newItems = [...howToUse.items];
                                    newItems[idx].short_description = e.target.value;
                                    setHowToUse(prev => ({ ...prev, items: newItems }));
                                    clearSaveValidationError('howToUse.items', idx, 'short_description');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.howToUse?.items?.[idx]?.short_description ? '2px solid #ef4444' : undefined }}
                                />
                                <input
                                  className={`custom-input ${saveValidationErrors.howToUse?.items?.[idx]?.image_url ? 'pf-error' : ''}`}
                                  type="text"
                                  placeholder="Image URL"
                                  value={item.image_url || ''}
                                  onChange={(e) => {
                                    const newItems = [...howToUse.items];
                                    newItems[idx].image_url = e.target.value;
                                    setHowToUse(prev => ({ ...prev, items: newItems }));
                                    clearSaveValidationError('howToUse.items', idx, 'image_url');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.howToUse?.items?.[idx]?.image_url ? '2px solid #ef4444' : undefined }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (howToUse.items.length > 1) {
                                    setHowToUse(prev => ({
                                      ...prev,
                                      items: prev.items.filter((_, i) => i !== idx)
                                    }));
                                  }
                                }}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'faqs' && (
                  <>
                    <div className="pf-section-title">
                      <span className="pf-section-title-icon"><HelpCircle size={16} /></span>
                      <h3 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>FAQs</h3>
                    </div>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                      Provide frequently asked questions for this product.
                    </p>

                    <div style={{ display: 'grid', gap: 24 }}>
                      <div>
                        <label className="pf-label">Header Image URL</label>
                        <input
                          className={`custom-input ${saveValidationErrors.faqs?.headerImage ? 'pf-error' : ''}`}
                          type="text"
                          placeholder="https://..."
                          value={faqsHeaderImage}
                          onChange={(e) => {
                            setFaqsHeaderImage(e.target.value);
                            clearSaveValidationError('faqs.headerImage');
                          }}
                          style={{ width: '100%', border: saveValidationErrors.faqs?.headerImage ? '2px solid #ef4444' : undefined }}
                        />
                      </div>
                      <div style={{ borderTop: '1px solid #f4f4f5', paddingTop: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <label className="pf-label" style={{ margin: 0 }}>Questions & Answers</label>
                          <button
                            type="button"
                            onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                            className="pf-outline-accent-btn"
                            style={{ padding: '6px 12px', fontSize: 12, height: 'auto' }}
                          >
                            <Plus size={14} /> Add FAQ
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gap: 12 }}>
                          {faqs.map((faq, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                              <div style={{ flex: 1, display: 'grid', gap: 12 }}>
                                <input
                                  className={`custom-input ${saveValidationErrors.faqs?.rows?.[idx]?.question ? 'pf-error' : ''}`}
                                  type="text"
                                  placeholder="Question"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[idx].question = e.target.value;
                                    setFaqs(newFaqs);
                                    clearSaveValidationError('faqs.rows', idx, 'question');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.faqs?.rows?.[idx]?.question ? '2px solid #ef4444' : undefined }}
                                />
                                <textarea
                                  className={`custom-input ${saveValidationErrors.faqs?.rows?.[idx]?.answer ? 'pf-error' : ''}`}
                                  rows={2}
                                  placeholder="Answer"
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const newFaqs = [...faqs];
                                    newFaqs[idx].answer = e.target.value;
                                    setFaqs(newFaqs);
                                    clearSaveValidationError('faqs.rows', idx, 'answer');
                                  }}
                                  style={{ width: '100%', border: saveValidationErrors.faqs?.rows?.[idx]?.answer ? '2px solid #ef4444' : undefined }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: 10 }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          {faqs.length === 0 && (
                            <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: 14 }}>
                              No FAQs added yet. Click "Add FAQ" to start.
                            </div>
                          )}
                        </div>
                      </div>
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
                  onClick={activeTab === 'faqs' ? handleSubmitProduct : goNext}
                  disabled={saving || (activeTab !== 'faqs' && !canNext)}
                  style={{
                    background: activeTab === 'faqs' ? '#c8507a' : '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 20px',
                    fontWeight: 600,
                    cursor: (saving || (activeTab !== 'faqs' && !canNext)) ? 'not-allowed' : 'pointer',
                    opacity: (saving || (activeTab !== 'faqs' && !canNext)) ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Saving...' : (activeTab === 'faqs' ? (isEditMode ? 'Update Product' : 'Save Product') : 'Next')}
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
              <select className="custom-input" value={variantRows[editingDiscountVariantIndex].discount_type || ''} onChange={e => handleVariantChange(editingDiscountVariantIndex, 'discount_type', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 8, marginTop: 4 }}>
                <option value="" disabled>Select Value</option>
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed (₹)</option>
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
