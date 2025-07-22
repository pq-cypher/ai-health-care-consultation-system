# AI Healthcare Consultation System

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/pq-cypher/ai-health-care-consultation-system/pulls)

## 🏥 Overview

An intelligent healthcare consultation system that leverages artificial intelligence to provide preliminary medical guidance and health information. This system aims to bridge the gap between patients and healthcare professionals by offering accessible, immediate health consultations while emphasizing the importance of professional medical care.

## ⚠️ Medical Disclaimer

**This system is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns. In case of medical emergencies, contact your local emergency services immediately.**

## ✨ Features

- **🤖 AI-Powered Consultations**: Interactive chat interface for health-related queries
- **📋 Symptom Assessment**: Preliminary symptom evaluation and guidance
- **📚 Health Information Database**: Access to reliable health information and resources
- **🔐 Privacy-First Design**: Secure handling of sensitive health information
- **📱 Responsive Interface**: Optimized for desktop, tablet, and mobile devices
- **🌐 Real-time Interactions**: Fast and responsive user experience
- **🎨 Intuitive UI/UX**: Clean, professional interface designed for healthcare context

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0 or higher)
- **npm** or **yarn** package manager
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pq-cypher/ai-health-care-consultation-system.git
   cd ai-health-care-consultation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables in the `.env` file:
   ```env
   APP_NAME="ai-health-care-consultation-system"
   DB_HOST=""
   DB_USER=""
   DB_PASS=""
   GROQ_API_KEY=""
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to access the application.

### Configure Backend**
    When running locally make sure to configure your xampp to use ai-health-care-consultation-system.local and it should point to the backend folder

## 🏗️ Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **Linting**: ESLint
- **Development**: Hot Module Replacement (HMR)


## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** and commit them
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📝 API Documentation

3. **Environment variables not loading**
   - Ensure `.env` file is in backend directory
   - Prefix variables with `VITE_`
   - Restart development server

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** - For AI consultation capabilities
- **React Team** - For the amazing frontend framework
- **Vite Team** - For the fast build tool
- **Healthcare Community** - For guidance on medical best practices

## 📞 Support & Contact

- **GitHub Issues**: [Create an issue](https://github.com/pq-cypher/ai-health-care-consultation-system/issues)
- **Documentation**: [Wiki](https://github.com/pq-cypher/ai-health-care-consultation-system/wiki)
- **Email**: [Contact maintainer](mailto:your-email@example.com)

## 🔄 Version History

- **v1.0.0** - Initial release with basic consultation features
---

<div align="center">

**⚕️ Building the future of accessible healthcare through technology ⚕️**

Made with ❤️ by [pq-cypher](https://github.com/pq-cypher)

</div>