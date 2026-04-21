import { ImageIcon, Maximize2 } from 'lucide-react';

function CompletedProjects({ projects, loading, resolveImage, onImageClick }) {
    if (loading) return <p className="portfolio-muted">Loading completed projects...</p>;
    if (!projects.length) return <p className="portfolio-muted">No completed projects yet.</p>;

    return (
        <div className="portfolio-grid">
            {projects.map((project) => (
                <article key={project.orderId} className="portfolio-project-card group animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="relative overflow-hidden cursor-zoom-in" onClick={() => onImageClick && onImageClick(resolveImage ? resolveImage(project.image) : project.image, project.projectTitle)}>
                        {project.image ? (
                            <img
                                src={resolveImage ? resolveImage(project.image) : project.image}
                                alt={project.projectTitle}
                                className="project-image transition-transform duration-500 group-hover:scale-110"
                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px 8px 0 0' }}
                            />
                        ) : (
                            <div className="project-image project-image-placeholder" style={{ width: '100%', height: '180px', backgroundColor: '#f0f0f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0b5', borderRadius: '8px 8px 0 0' }}>
                                <ImageIcon size={48} />
                                <span style={{ marginLeft: '8px' }}>No image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 text-white">
                                <Maximize2 size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <h4 className="portfolio-card-title">{project.projectTitle}</h4>
                        <p className="portfolio-chip">{project.category}</p>
                        <p className="portfolio-card-text">{project.description || 'No description provided.'}</p>
                        <p className="portfolio-card-meta"><strong>Completed:</strong> {new Date(project.completionDate).toLocaleDateString()}</p>
                        <p className="portfolio-card-meta"><strong>Service:</strong> {project.relatedService?.title || 'N/A'}</p>
                    </div>
                </article>
            ))}
        </div>
    );
}

export default CompletedProjects;
