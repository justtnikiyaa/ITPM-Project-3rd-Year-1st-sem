import { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const validateProfileForm = ({ form, profilePhoto, isSeller }) => {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = 'Full name is required.';
    } else if (form.name.trim().length < 3) {
        errors.name = 'Full name must be at least 3 characters.';
    } else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) {
        errors.name = 'Full name can contain only letters and spaces.';
    }

    if (profilePhoto) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(profilePhoto.type)) {
            errors.profilePhoto = 'Profile photo must be JPG, JPEG, or PNG.';
        } else if (profilePhoto.size > 2 * 1024 * 1024) {
            errors.profilePhoto = 'Profile photo size must be 2MB or less.';
        }
    }

    if (form.bio && form.bio.length > 250) {
        errors.bio = 'Bio/About cannot exceed 250 characters.';
    }

    if (!form.skills.trim()) {
        errors.skills = 'Skills are required.';
    } else {
        const rawSkills = form.skills.split(',');
        if (rawSkills.length < 1) {
            errors.skills = 'Enter comma-separated skills.';
        } else {
            const parsed = rawSkills.map((item) => item.trim());
            if (parsed.some((skill) => !skill || skill.length < 2)) {
                errors.skills = 'Each skill must be at least 2 characters.';
            }
        }
    }

    if (isSeller && form.portfolioSummary && form.portfolioSummary.length > 300) {
        errors.portfolioSummary = 'Portfolio summary cannot exceed 300 characters.';
    }

    if (isSeller && !['Active', 'Inactive'].includes(form.availability)) {
        errors.availability = 'Availability must be Active or Inactive.';
    }

    return errors;
};

const validatePasswordForm = (passwordForm) => {
    const errors = {};
    if (!passwordForm.currentPassword) {
        errors.currentPassword = 'Current password is required.';
    }
    if (!passwordForm.newPassword) {
        errors.newPassword = 'New password is required.';
    } else if (!STRONG_PASSWORD_REGEX.test(passwordForm.newPassword)) {
        errors.newPassword =
            'Use 8+ chars with uppercase, lowercase, number, and special character.';
    }
    if (!passwordForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password.';
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
        errors.confirmPassword = 'Confirm password must match new password.';
    }
    return errors;
};

function EditProfilePage() {
    const [form, setForm] = useState({
        name: '',
        bio: '',
        skills: '',
        portfolioSummary: '',
        availability: 'Active',
        budgetPreference: '',
    });
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSeller, setIsSeller] = useState(false);
    const [error, setError] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [profileTouched, setProfileTouched] = useState({});
    const [passwordTouched, setPasswordTouched] = useState({});
    const [profileSubmitAttempted, setProfileSubmitAttempted] = useState(false);
    const [passwordSubmitAttempted, setPasswordSubmitAttempted] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const load = async () => {
            const { data } = await apiClient.get('/api/portfolio/me');
            setIsSeller(Boolean(data.isStudentSeller));
            setForm({
                name: data.name || '',
                bio: data.bio || '',
                skills: (data.skills || []).join(', '),
                portfolioSummary: data.portfolioSummary || '',
                availability: data.availability === 'Away' ? 'Inactive' : 'Active',
                budgetPreference: data.budgetPreference || '',
            });
            setPreviewUrl(data.profileImage ? `${API_BASE}${data.profileImage}` : '');
        };
        load().catch(() => setError('Failed to load profile data'));
    }, []);

    const profileErrors = useMemo(
        () => validateProfileForm({ form, profilePhoto, isSeller }),
        [form, profilePhoto, isSeller]
    );
    const passwordErrors = useMemo(() => validatePasswordForm(passwordForm), [passwordForm]);

    const showProfileError = (field) => profileSubmitAttempted || profileTouched[field];
    const showPasswordError = (field) => passwordSubmitAttempted || passwordTouched[field];

    const submit = async (e) => {
        e.preventDefault();
        setProfileSubmitAttempted(true);
        setProfileMessage('');
        setLoading(true);
        setError('');
        if (Object.keys(profileErrors).length > 0) {
            setLoading(false);
            return;
        }
        try {
            const payload = new FormData();
            payload.append('name', form.name.trim());
            payload.append('bio', form.bio.trim());
            payload.append('skills', form.skills.trim());
            if (profilePhoto) payload.append('profilePhoto', profilePhoto);
            if (isSeller) {
                payload.append('portfolioSummary', form.portfolioSummary.trim());
                payload.append('availability', form.availability === 'Inactive' ? 'Away' : 'Active');
            } else {
                payload.append('budgetPreference', form.budgetPreference.trim());
            }
            await apiClient.put('/api/portfolio/me', payload);
            setProfileMessage('Profile updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const submitPasswordChange = async (e) => {
        e.preventDefault();
        setPasswordSubmitAttempted(true);
        setPasswordError('');
        setPasswordMessage('');
        if (Object.keys(passwordErrors).length > 0) {
            return;
        }

        setPasswordLoading(true);
        try {
            const { data } = await apiClient.put('/api/portfolio/me/password', passwordForm);
            setPasswordMessage(data.message || 'Password updated successfully.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <section className="profile-page-light">
            <div className="page-wrap">
                <form onSubmit={submit} className="profile-form-card">
                    <div className="profile-form-head">
                        <h2>Edit Your Profile</h2>
                        <p>Keep your profile professional and attractive.</p>
                    </div>

                    <label className="profile-label">Full Name</label>
                    <input
                        className={`profile-input ${showProfileError('name') && profileErrors.name ? 'input-invalid' : ''}`}
                        value={form.name}
                        onBlur={() => setProfileTouched((prev) => ({ ...prev, name: true }))}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Name"
                        required
                    />
                    {showProfileError('name') && profileErrors.name ? <p className="field-error">{profileErrors.name}</p> : null}

                    <label className="profile-label">Profile Photo</label>
                    <input
                        className={`profile-input ${showProfileError('profilePhoto') && profileErrors.profilePhoto ? 'input-invalid' : ''}`}
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            setProfilePhoto(file || null);
                            setProfileTouched((prev) => ({ ...prev, profilePhoto: true }));
                            if (file) setPreviewUrl(URL.createObjectURL(file));
                        }}
                    />
                    {showProfileError('profilePhoto') && profileErrors.profilePhoto ? <p className="field-error">{profileErrors.profilePhoto}</p> : null}
                    {previewUrl ? <img src={previewUrl} alt="Profile preview" className="profile-photo-preview" /> : null}

                    <label className="profile-label">Bio/About</label>
                    <textarea
                        className={`profile-input ${showProfileError('bio') && profileErrors.bio ? 'input-invalid' : ''}`}
                        value={form.bio}
                        onBlur={() => setProfileTouched((prev) => ({ ...prev, bio: true }))}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Bio"
                    />
                    {showProfileError('bio') && profileErrors.bio ? <p className="field-error">{profileErrors.bio}</p> : null}

                    <label className="profile-label">{isSeller ? 'Skills (comma separated)' : 'Hiring Categories / Interests (comma separated)'}</label>
                    <input
                        className={`profile-input ${showProfileError('skills') && profileErrors.skills ? 'input-invalid' : ''}`}
                        value={form.skills}
                        onBlur={() => setProfileTouched((prev) => ({ ...prev, skills: true }))}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        placeholder="Skills (comma separated)"
                    />
                    {showProfileError('skills') && profileErrors.skills ? <p className="field-error">{profileErrors.skills}</p> : null}
                    {isSeller ? (
                        <>
                            <label className="profile-label">Portfolio Summary</label>
                            <textarea
                                className={`profile-input ${showProfileError('portfolioSummary') && profileErrors.portfolioSummary ? 'input-invalid' : ''}`}
                                value={form.portfolioSummary}
                                onBlur={() => setProfileTouched((prev) => ({ ...prev, portfolioSummary: true }))}
                                onChange={(e) => setForm({ ...form, portfolioSummary: e.target.value })}
                                placeholder="Portfolio summary"
                            />
                            {showProfileError('portfolioSummary') && profileErrors.portfolioSummary ? <p className="field-error">{profileErrors.portfolioSummary}</p> : null}
                            <label className="profile-label">Availability</label>
                            <select
                                className={`profile-input ${showProfileError('availability') && profileErrors.availability ? 'input-invalid' : ''}`}
                                value={form.availability}
                                onBlur={() => setProfileTouched((prev) => ({ ...prev, availability: true }))}
                                onChange={(e) => setForm({ ...form, availability: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            {showProfileError('availability') && profileErrors.availability ? <p className="field-error">{profileErrors.availability}</p> : null}
                        </>
                    ) : (
                        <>
                            <label className="profile-label">Budget Preference</label>
                            <input
                                className="profile-input"
                                value={form.budgetPreference}
                                onChange={(e) => setForm({ ...form, budgetPreference: e.target.value })}
                                placeholder="e.g. LKR 10,000 - 30,000 per project"
                            />
                        </>
                    )}
                    {error ? <p className="text-error">{error}</p> : null}
                    {profileMessage ? <p className="text-success">{profileMessage}</p> : null}
                    <button type="submit" className="btn-primary profile-edit-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </form>

                <form onSubmit={submitPasswordChange} className="profile-form-card">
                    <div className="profile-form-head">
                        <h2>Password & Security</h2>
                        <p>Update your password to keep your account secure.</p>
                    </div>

                    <label className="profile-label">Current Password</label>
                    <input
                        type="password"
                        className={`profile-input ${showPasswordError('currentPassword') && passwordErrors.currentPassword ? 'input-invalid' : ''}`}
                        value={passwordForm.currentPassword}
                        onBlur={() => setPasswordTouched((prev) => ({ ...prev, currentPassword: true }))}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                    />
                    {showPasswordError('currentPassword') && passwordErrors.currentPassword ? <p className="field-error">{passwordErrors.currentPassword}</p> : null}

                    <label className="profile-label">New Password</label>
                    <input
                        type="password"
                        className={`profile-input ${showPasswordError('newPassword') && passwordErrors.newPassword ? 'input-invalid' : ''}`}
                        value={passwordForm.newPassword}
                        onBlur={() => setPasswordTouched((prev) => ({ ...prev, newPassword: true }))}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                    />
                    {showPasswordError('newPassword') && passwordErrors.newPassword ? <p className="field-error">{passwordErrors.newPassword}</p> : null}

                    <label className="profile-label">Confirm New Password</label>
                    <input
                        type="password"
                        className={`profile-input ${showPasswordError('confirmPassword') && passwordErrors.confirmPassword ? 'input-invalid' : ''}`}
                        value={passwordForm.confirmPassword}
                        onBlur={() => setPasswordTouched((prev) => ({ ...prev, confirmPassword: true }))}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Re-enter new password"
                    />
                    {showPasswordError('confirmPassword') && passwordErrors.confirmPassword ? <p className="field-error">{passwordErrors.confirmPassword}</p> : null}

                    <p className="portfolio-muted">Password rule: 8+ chars with uppercase, lowercase, number, and special character.</p>
                    {passwordError ? <p className="text-error">{passwordError}</p> : null}
                    {passwordMessage ? <p className="text-success">{passwordMessage}</p> : null}
                    <button type="submit" className="btn-primary profile-edit-btn" disabled={passwordLoading}>
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default EditProfilePage;
