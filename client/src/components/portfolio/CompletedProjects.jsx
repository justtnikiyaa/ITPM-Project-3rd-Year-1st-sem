function CompletedProjects({ projects, loading, resolveImage }) {
    if (loading) return <p className="portfolio-muted">Loading completed projects...</p>;
    if (!projects.length) return <p className="portfolio-muted">No completed projects yet.</p>;

    return (
        <div className="portfolio-grid">
            {projects.map((project) => (
                <article key={project.orderId} className="portfolio-project-card">
                    {project.image ? (
                        <img
                            src={resolveImage ? resolveImage(project.image) : project.image}
                            alt={project.projectTitle}
                            className="project-image"
                        />
                    ) : (
                        <div className="project-image project-image-placeholder">No image</div>
                    )}
                    <h4 className="portfolio-card-title">{project.projectTitle}</h4>
                    <p className="portfolio-chip">{project.category}</p>
                    <p className="portfolio-card-text">{project.description || 'No description provided.'}</p>
                    <p className="portfolio-card-meta"><strong>Completed:</strong> {new Date(project.completionDate).toLocaleDateString()}</p>
                    <p className="portfolio-card-meta"><strong>Service:</strong> {project.relatedService?.title || 'N/A'}</p>
                </article>
            ))}
        </div>
    );
}

export default CompletedProjects;
