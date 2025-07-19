import "./resume.css";

export default function ResumePage() {
  return (
    <div className="resume-container">
      <div className="resume-page">
        {/* Header Section */}
        <header className="resume-header">
          <h1 className="resume-name">Reo Harada</h1>
          <p className="resume-title">
            CTO at G.P. Eyece • Graduate Student • AI Engineer
          </p>
          <div className="resume-contact">
            <span>engbeatleos@gmail.com</span>
            <span className="separator">•</span>
            <span>Tokyo, Japan</span>
          </div>
          <div className="resume-links">
            <a
              href="https://github.com/leohara"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/leohara
            </a>
            <span className="separator">•</span>
            <a
              href="https://www.beatleos.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              beatleos.com
            </a>
            <span className="separator">•</span>
            <a
              href="https://www.linkedin.com/in/beatleos/"
              target="_blank"
              rel="noopener noreferrer"
            >
              linkedin.com/in/beatleos
            </a>
          </div>
        </header>

        {/* Summary Section */}
        <section className="resume-section">
          <h2 className="section-title">Professional Summary</h2>
          <p className="summary-text">
            AI Engineer and CTO with expertise in computer vision, natural
            language processing, and full-stack development. Currently pursuing
            graduate studies at The University of Tokyo while leading technical
            teams and developing cutting-edge AI applications. Proven track
            record of delivering production-ready ML models and scalable web
            applications across multiple industries including construction,
            dating services, and document processing.
          </p>
        </section>

        {/* Experience Section */}
        <section className="resume-section">
          <h2 className="section-title">Professional Experience</h2>

          <div className="experience-item">
            <div className="experience-header">
              <h3 className="company-name">KKGeneration Inc.</h3>
              <span className="date-range">Feb 2025 - Present</span>
            </div>
            <p className="job-title">PoC Engineer • AI Engineer</p>
            <ul className="responsibilities">
              <li>
                Developing AI system for construction blueprint analysis using
                computer vision techniques
              </li>
              <li>
                Implemented table extraction and symbol detection from technical
                drawings using fine-tuned models
              </li>
              <li>
                Built full-stack application with Next.js and FastAPI for
                document processing workflow
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3 className="company-name">G.P. Eyece Inc.</h3>
              <span className="date-range">Apr 2024 - Present</span>
            </div>
            <p className="job-title">Chief Technology Officer</p>
            <ul className="responsibilities">
              <li>
                Leading development of AI-powered dating counseling application
                serving 1000+ users
              </li>
              <li>
                Architected conversational AI agents using LangGraph for
                personalized user interactions
              </li>
              <li>
                Built cross-platform mobile app with React Native Expo and
                FastAPI backend
              </li>
              <li>
                Managed technical team and established development workflows and
                CI/CD pipelines
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3 className="company-name">LangCore Inc.</h3>
              <span className="date-range">Feb 2024 - Apr 2024</span>
            </div>
            <p className="job-title">Full Stack Engineer</p>
            <ul className="responsibilities">
              <li>
                Developed voice-based ordering system for retail stores using
                OpenAI&apos;s speech APIs
              </li>
              <li>
                Implemented voice recognition to enable customers to place
                orders through natural speech
              </li>
              <li>
                Built Progressive Web Application with Next.js for enhanced
                mobile experience
              </li>
              <li>
                Created real-time voice processing pipeline with low latency
                requirements
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3 className="company-name">ULURU Inc.</h3>
              <span className="date-range">Oct 2022 - Jun 2023</span>
            </div>
            <p className="job-title">AI Engineer • Backend Engineer</p>
            <ul className="responsibilities">
              <li>
                Fine-tuned BERT models for document information extraction
              </li>
              <li>
                Integrated ChatGPT API for intelligent document processing
                applications
              </li>
              <li>
                Developed Python-based backend services for large-scale document
                processing
              </li>
            </ul>
          </div>

          <div className="experience-item">
            <div className="experience-header">
              <h3 className="company-name">KIBE Inc.</h3>
              <span className="date-range">Feb 2022 - Present</span>
            </div>
            <p className="job-title">System Engineer</p>
            <ul className="responsibilities">
              <li>Automated CAD drawing generation using Python</li>
              <li>
                Developed custom tools for engineering workflow optimization
              </li>
            </ul>
          </div>
        </section>

        {/* Education Section */}
        <section className="resume-section">
          <h2 className="section-title">Education</h2>

          <div className="education-item">
            <div className="education-header">
              <h3 className="institution-name">The University of Tokyo</h3>
              <span className="date-range">Apr 2024 - Present</span>
            </div>
            <p className="degree">Master of Science in Computer Science</p>
            <p className="education-details">
              Machine Learning and Statistical Data Analysis Laboratory (Yokoya
              Lab)
            </p>
            <p className="education-details">
              Research Focus: View Transformation in Computer Vision
            </p>
          </div>

          <div className="education-item">
            <div className="education-header">
              <h3 className="institution-name">Tohoku University</h3>
              <span className="date-range">Apr 2020 - Mar 2024</span>
            </div>
            <p className="degree">
              Bachelor of Engineering in Aerospace Engineering
            </p>
            <p className="education-details">
              Computer Architecture Laboratory (Kobayashi Lab)
            </p>
            <p className="education-details">
              Research: Video Compression Acceleration
            </p>
            <p className="education-details">
              Award: IPSJ Student Incentive Award
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="resume-section">
          <h2 className="section-title">Technical Skills</h2>

          <div className="skills-grid">
            <div className="skill-category">
              <h3 className="skill-category-title">AI/Machine Learning</h3>
              <p className="skill-list">
                PyTorch, Computer Vision, Natural Language Processing,
                Fine-tuning, LangGraph
              </p>
            </div>

            <div className="skill-category">
              <h3 className="skill-category-title">Web Development</h3>
              <p className="skill-list">
                React, Next.js, Django, FastAPI, Flask, Nuxt.js, TypeScript,
                JavaScript
              </p>
            </div>

            <div className="skill-category">
              <h3 className="skill-category-title">Mobile & PWA</h3>
              <p className="skill-list">
                React Native (Expo), Progressive Web Apps, Cross-platform
                Development
              </p>
            </div>

            <div className="skill-category">
              <h3 className="skill-category-title">Cloud & Database</h3>
              <p className="skill-list">
                GCP, AWS, PostgreSQL (Supabase, Neon), CI/CD, Docker
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
