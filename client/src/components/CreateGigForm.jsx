import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './CreateGigForm.css';
import {
    Plus,
    X,
    Upload,
    Package,
    Gift,
    HelpCircle,
    Tag,
    Zap,
    Clock,
    ChevronDown,
    Trash2,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORIES = [
    'Web Development',
    'Graphic Design',
    'Content Writing',
    'Video Editing',
    'Data Entry',
    'Tutoring',
    'Translation',
    'AI & Machine Learning',
    'Mobile App Dev',
    'Other',
];

const CreateGigForm = ({ onSuccess, onCancel, initialGig = null }) => {
    const isEditMode = Boolean(initialGig?._id);
    // ✅ GIG SERVICE CREATION - FORM STATE & FIELDS
    
    // Basic Info
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    // Image & Gallery
    const [coverImage, setCoverImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const dropzoneRef = useRef(null);

    // Packages
    const [packages, setPackages] = useState([
        { name: 'Basic', description: '', price: '', deliveryDays: '', revisions: 0, features: [] },
    ]);

    // Add-ons
    const [addons, setAddons] = useState([]);

    // Requirements
    const [requirements, setRequirements] = useState([]);

    // Rush Delivery
    const [rushDeliveryAvailable, setRushDeliveryAvailable] = useState(false);
    const [rushDeliveryPrice, setRushDeliveryPrice] = useState('');
    const [rushDeliveryDays, setRushDeliveryDays] = useState('');

    // UI State
    const [activeTab, setActiveTab] = useState('basic');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!initialGig) return;

        setTitle(initialGig.title || '');
        setShortDescription(initialGig.shortDescription || '');
        setDescription(initialGig.description || '');
        setCategory(initialGig.category || '');
        setTags(Array.isArray(initialGig.tags) ? initialGig.tags : []);

        if (Array.isArray(initialGig.packages) && initialGig.packages.length > 0) {
            setPackages(
                initialGig.packages.map((pkg, index) => ({
                    name: pkg?.name || ['Basic', 'Standard', 'Premium'][index] || `Package ${index + 1}`,
                    description: pkg?.description || '',
                    price: pkg?.price ?? '',
                    deliveryDays: pkg?.deliveryDays ?? '',
                    revisions: pkg?.revisions ?? 0,
                    features: Array.isArray(pkg?.features) ? pkg.features : [],
                }))
            );
        } else {
            setPackages([
                {
                    name: 'Basic',
                    description: '',
                    price: initialGig.price ?? '',
                    deliveryDays: initialGig.deliveryTime ? parseInt(initialGig.deliveryTime, 10) || '' : '',
                    revisions: 0,
                    features: [],
                },
            ]);
        }

        setAddons(Array.isArray(initialGig.addons) ? initialGig.addons : []);
        setRequirements(Array.isArray(initialGig.requirements) ? initialGig.requirements : []);

        setRushDeliveryAvailable(Boolean(initialGig.rushDeliveryAvailable));
        setRushDeliveryPrice(initialGig.rushDeliveryPrice ?? '');
        setRushDeliveryDays(initialGig.rushDeliveryDays ?? '');

        if (initialGig.coverImage) {
            const backendBase = (API_BASE.replace(/\/api\/?$/, '') || 'http://localhost:5000').replace(/\/$/, '');
            const normalized = String(initialGig.coverImage).replace(/\\/g, '/');
            setImagePreview(/^https?:\/\//i.test(normalized) ? normalized : `${backendBase}${normalized.startsWith('/') ? normalized : `/${normalized}`}`);
        } else {
            setImagePreview(null);
        }

        setCoverImage(null);
        setTagInput('');
        setError('');
        setSuccess('');
        setActiveTab('basic');
    }, [initialGig]);

    // Image Handling
    const handleImageUpload = (file) => {
        if (file && file.type.startsWith('image/')) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    };

    // Tags
    const addTag = () => {
        if (tagInput.trim() && tags.length < 10) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // Packages
    const updatePackage = (index, field, value) => {
        const newPackages = [...packages];
        newPackages[index][field] = value;
        setPackages(newPackages);
    };

    const addPackageFeature = (packageIndex) => {
        const newPackages = [...packages];
        newPackages[packageIndex].features.push('');
        setPackages(newPackages);
    };

    const updatePackageFeature = (packageIndex, featureIndex, value) => {
        const newPackages = [...packages];
        newPackages[packageIndex].features[featureIndex] = value;
        setPackages(newPackages);
    };

    const removePackageFeature = (packageIndex, featureIndex) => {
        const newPackages = [...packages];
        newPackages[packageIndex].features.splice(featureIndex, 1);
        setPackages(newPackages);
    };

    // Add-ons
    const addAddon = () => {
        setAddons([...addons, { title: '', price: '', deliveryDays: 0 }]);
    };

    const updateAddon = (index, field, value) => {
        const newAddons = [...addons];
        newAddons[index][field] = value;
        setAddons(newAddons);
    };

    const removeAddon = (index) => {
        setAddons(addons.filter((_, i) => i !== index));
    };

    // Requirements
    const addRequirement = () => {
        setRequirements([...requirements, { question: '', type: 'text', options: [], required: true }]);
    };

    const updateRequirement = (index, field, value) => {
        const newRequirements = [...requirements];
        newRequirements[index][field] = value;
        setRequirements(newRequirements);
    };

    const removeRequirement = (index) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // ✅ CLIENT-SIDE VALIDATION 1: Check required fields (title, description, category)
        if (!title.trim() || !description.trim() || !category) {
            setError('Please fill in all required fields');
            return;
        }

        // ✅ CLIENT-SIDE VALIDATION 2: Ensure all packages have price and delivery days
        if (packages.some(p => !p.price || !p.deliveryDays)) {
            setError('All packages must have a price and delivery time');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('shortDescription', shortDescription);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('tags', JSON.stringify(tags));
            formData.append('packages', JSON.stringify(packages.map(p => ({
                ...p,
                price: parseFloat(p.price),
                deliveryDays: parseInt(p.deliveryDays),
            }))));
            formData.append('addons', JSON.stringify(addons.map(a => ({
                ...a,
                price: parseFloat(a.price),
                deliveryDays: parseInt(a.deliveryDays) || 0,
            }))));
            formData.append('requirements', JSON.stringify(requirements));
            formData.append('rushDeliveryAvailable', rushDeliveryAvailable);
            if (rushDeliveryAvailable) {
                formData.append('rushDeliveryPrice', parseFloat(rushDeliveryPrice) || 0);
                formData.append('rushDeliveryDays', parseInt(rushDeliveryDays) || 1);
            }

            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            const endpoint = isEditMode ? `/api/services/${initialGig._id}` : '/api/services';
            const method = isEditMode ? 'patch' : 'post';
            const res = await axios({
                method,
                url: endpoint,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess(isEditMode ? 'Gig updated successfully!' : 'Gig created successfully!');
            setTimeout(() => {
                onSuccess(res.data);
            }, 1000);
        } catch (err) {
            setError(err.response?.data?.message || (isEditMode ? 'Failed to update gig' : 'Failed to create gig'));
        } finally {
            setSubmitting(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info' },
        { id: 'packages', label: 'Pricing' },
        { id: 'addons', label: 'Add-ons' },
        { id: 'requirements', label: 'Requirements' },
    ];

    return (
        <form onSubmit={handleSubmit} className="create-gig-form">
            {/* Tabs */}
            <div className="create-gig-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`create-gig-tab ${activeTab === tab.id ? 'create-gig-tab--active' : ''}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && <div className="create-gig-alert create-gig-alert--error">{error}</div>}
            {success && <div className="create-gig-alert create-gig-alert--success">{success}</div>}

            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
                <div className="create-gig-tab-content">
                    <h3>Basic Information</h3>

                    {/* Title */}
                    <div className="create-gig-field">
                        <label>Gig Title *</label>
                        <input
                            type="text"
                            placeholder="e.g., I will design a professional website for your business"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <small>{title.length}/100</small>
                    </div>

                    {/* Short Description */}
                    <div className="create-gig-field">
                        <label>Short Description</label>
                        <textarea
                            placeholder="Brief summary (max 150 chars)"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            maxLength={150}
                            rows={2}
                        />
                        <small>{shortDescription.length}/150</small>
                    </div>

                    {/* Full Description */}
                    <div className="create-gig-field">
                        <label>Full Description *</label>
                        <textarea
                            placeholder="Describe your gig in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                        />
                    </div>

                    {/* Category */}
                    <div className="create-gig-field">
                        <label>Category *</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tags */}
                    <div className="create-gig-field">
                        <label>Skills/Tags (up to 10)</label>
                        <div className="create-gig-tags-input">
                            <input
                                type="text"
                                placeholder="Add a skill and press Enter"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="create-gig-tag-btn"
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>
                        <div className="create-gig-tags-list">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="create-gig-tag">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(idx)}
                                        className="create-gig-tag-remove"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="create-gig-field">
                        <label>Cover Image</label>
                        <div
                            ref={dropzoneRef}
                            className={`create-gig-dropzone ${isDragging ? 'create-gig-dropzone--dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="create-gig-preview" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="create-gig-remove-image"
                                    >
                                        <X /> Change Image
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload size={32} />
                                    <p>Drag and drop your image here</p>
                                    <small>or</small>
                                    <label className="create-gig-file-label">
                                        Browse Files
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e.target.files[0])}
                                            hidden
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'packages' && (
                <div className="create-gig-tab-content">
                    <h3>Pricing Packages</h3>
                    <p className="create-gig-help">Create multiple pricing tiers for different service levels</p>

                    {packages.map((pkg, pkgIdx) => (
                        <div key={pkgIdx} className="create-gig-package">
                            <div className="create-gig-package-header">
                                <h4>{pkg.name} Package</h4>
                            </div>

                            {/* Package Description */}
                            <div className="create-gig-field">
                                <label>Package Description</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Perfect for small projects"
                                    value={pkg.description}
                                    onChange={(e) => updatePackage(pkgIdx, 'description', e.target.value)}
                                />
                            </div>

                            {/* Package Price */}
                            <div className="create-gig-row">
                                <div className="create-gig-field">
                                    <label>Price (LKR) *</label>
                                    <input
                                        type="number"
                                        placeholder="5000"
                                        value={pkg.price}
                                        onChange={(e) => updatePackage(pkgIdx, 'price', e.target.value)}
                                        min="0"
                                        step="100"
                                    />
                                </div>

                                <div className="create-gig-field">
                                    <label>Delivery Days *</label>
                                    <input
                                        type="number"
                                        placeholder="5"
                                        value={pkg.deliveryDays}
                                        onChange={(e) => updatePackage(pkgIdx, 'deliveryDays', e.target.value)}
                                        min="1"
                                    />
                                </div>

                                <div className="create-gig-field">
                                    <label>Revisions</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={pkg.revisions}
                                        onChange={(e) => updatePackage(pkgIdx, 'revisions', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Package Features */}
                            <div className="create-gig-field">
                                <label>Features Included</label>
                                {pkg.features.map((feature, featureIdx) => (
                                    <div key={featureIdx} className="create-gig-feature-input">
                                        <input
                                            type="text"
                                            placeholder="e.g., Unlimited revisions"
                                            value={feature}
                                            onChange={(e) => updatePackageFeature(pkgIdx, featureIdx, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePackageFeature(pkgIdx, featureIdx)}
                                            className="create-gig-btn-remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addPackageFeature(pkgIdx)}
                                    className="create-gig-btn-secondary"
                                >
                                    <Plus size={16} /> Add Feature
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Rush Delivery */}
                    <div className="create-gig-section">
                        <h4>Rush Delivery</h4>
                        <label className="create-gig-checkbox">
                            <input
                                type="checkbox"
                                checked={rushDeliveryAvailable}
                                onChange={(e) => setRushDeliveryAvailable(e.target.checked)}
                            />
                            Enable Rush Delivery Option
                        </label>

                        {rushDeliveryAvailable && (
                            <div className="create-gig-row">
                                <div className="create-gig-field">
                                    <label>Rush Delivery Price (LKR)</label>
                                    <input
                                        type="number"
                                        placeholder="2000"
                                        value={rushDeliveryPrice}
                                        onChange={(e) => setRushDeliveryPrice(e.target.value)}
                                        min="0"
                                        step="100"
                                    />
                                </div>
                                <div className="create-gig-field">
                                    <label>Rush Delivery Days</label>
                                    <input
                                        type="number"
                                        placeholder="1"
                                        value={rushDeliveryDays}
                                        onChange={(e) => setRushDeliveryDays(e.target.value)}
                                        min="1"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add-ons Tab */}
            {activeTab === 'addons' && (
                <div className="create-gig-tab-content">
                    <h3>Add-ons</h3>
                    <p className="create-gig-help">Let buyer add extra services to their order</p>

                    {addons.map((addon, addonIdx) => (
                        <div key={addonIdx} className="create-gig-addon">
                            <div className="create-gig-row">
                                <div className="create-gig-field">
                                    <label>Add-on Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., SEO Optimization"
                                        value={addon.title}
                                        onChange={(e) => updateAddon(addonIdx, 'title', e.target.value)}
                                    />
                                </div>
                                <div className="create-gig-field">
                                    <label>Price (LKR)</label>
                                    <input
                                        type="number"
                                        placeholder="1000"
                                        value={addon.price}
                                        onChange={(e) => updateAddon(addonIdx, 'price', e.target.value)}
                                        min="0"
                                        step="100"
                                    />
                                </div>
                                <div className="create-gig-field">
                                    <label>Delivery Days</label>
                                    <input
                                        type="number"
                                        placeholder="2"
                                        value={addon.deliveryDays}
                                        onChange={(e) => updateAddon(addonIdx, 'deliveryDays', e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeAddon(addonIdx)}
                                    className="create-gig-btn-remove-addon"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addAddon}
                        className="create-gig-btn-secondary"
                    >
                        <Plus size={16} /> Add Another Add-on
                    </button>
                </div>
            )}

            {/* Requirements Tab */}
            {activeTab === 'requirements' && (
                <div className="create-gig-tab-content">
                    <h3>Buyer Requirements</h3>
                    <p className="create-gig-help">Ask buyers for information they need to provide before ordering</p>

                    {requirements.map((req, reqIdx) => (
                        <div key={reqIdx} className="create-gig-requirement">
                            <div className="create-gig-row">
                                <div className="create-gig-field">
                                    <label>Question</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., What is your website's main goal?"
                                        value={req.question}
                                        onChange={(e) => updateRequirement(reqIdx, 'question', e.target.value)}
                                    />
                                </div>
                                <div className="create-gig-field">
                                    <label>Answer Type</label>
                                    <select
                                        value={req.type}
                                        onChange={(e) => updateRequirement(reqIdx, 'type', e.target.value)}
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Multiple Choice</option>
                                        <option value="file">File Upload</option>
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRequirement(reqIdx)}
                                    className="create-gig-btn-remove-addon"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <label className="create-gig-checkbox">
                                <input
                                    type="checkbox"
                                    checked={req.required}
                                    onChange={(e) => updateRequirement(reqIdx, 'required', e.target.checked)}
                                />
                                This field is required
                            </label>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addRequirement}
                        className="create-gig-btn-secondary"
                    >
                        <Plus size={16} /> Add Another Question
                    </button>
                </div>
            )}

            {/* Form Actions */}
            <div className="create-gig-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    className="create-gig-btn create-gig-btn-cancel"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="create-gig-btn create-gig-btn-primary"
                >
                    {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Gig' : 'Create Gig')}
                </button>
            </div>
        </form>
    );
};

export default CreateGigForm;
