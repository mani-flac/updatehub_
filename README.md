# UpdateHub 🔄

A modern, cross-platform app update manager for Windows & macOS.

## ✨ Features

### 🎯 Core Functionality
- **Smart App Detection** - Automatically scans for installed applications
- **One-Click Updates** - Update individual apps or all at once
- **Real-time Progress** - Live update progress with detailed status
- **Version Intelligence** - Semantic version comparison and urgency classification

### 🔔 Advanced Features
- **Desktop Notifications** - Get notified about available updates and completion
- **Scheduled Scanning** - Automatic background checks (hourly/daily/weekly)
- **System Tray Integration** - Run in background with quick access
- **Update History** - Complete tracking of all update activities
- **Statistics Dashboard** - Success rates, timing, and trends

### 🛠️ Technical Features
- **Cross-Platform** - Windows (winget) and macOS (brew) support
- **Modern UI** - Beautiful dark theme with responsive design
- **Secure Architecture** - Sandboxed Electron with IPC bridge
- **Error Handling** - Comprehensive error recovery and logging

## 🚀 Installation

### Download Installer
- **Windows**: `UpdateHub Setup 1.0.0.exe` (~77MB)
- **macOS**: Available in Phase 3 release

### Development Setup
```bash
git clone https://github.com/mani-flac/Updatehub.git
cd updatehub
npm install
npm run dev
```

## 📖 Usage

### Quick Start
1. **Launch UpdateHub** - Desktop app or system tray
2. **Scan Apps** - Click "Rescan" to detect installed applications
3. **View Updates** - Navigate to "Updates" tab for available updates
4. **Update Apps** - Individual updates or "Update All" for bulk operations

### Advanced Features
- **Settings** - Configure scan intervals and notifications
- **History** - View past update activities and statistics
- **System Tray** - Right-click for quick actions and settings

## 🏗️ Architecture

### Three-Layer Design
1. **UI Layer** - Electron + React with modern components
2. **Agent Layer** - Node.js service for package manager integration
3. **OS Layer** - Native winget (Windows) and brew (macOS) integration

### Key Components
- **`agent.js`** - Core scanning and update engine
- **`notifications.js`** - Desktop notification system
- **`scheduler.js`** - Background task automation
- **`versionUtils.js`** - Semantic version comparison
- **React Components** - Modern UI with hooks and state management

## 📋 Development Phases

### ✅ Phase 1: Foundation
- [x] Project structure and build system
- [x] Electron + React UI framework
- [x] Basic app scanning (mock data)
- [x] IPC bridge and window management

### ✅ Phase 2: Core Features
- [x] Real winget/brew integration
- [x] Version comparison engine
- [x] Update history and statistics
- [x] Enhanced error handling

### ✅ Phase 3: Polish & Ship
- [x] Desktop notifications system
- [x] Scheduled automatic scanning
- [x] System tray integration
- [x] Packaged installer (electron-builder)
- [x] Auto-update mechanism
- [x] Complete documentation

## 🔧 Technical Stack

- **Frontend**: React 18 + Vite + Modern CSS
- **Backend**: Electron 28 + Node.js
- **Package Managers**: winget (Windows) + brew (macOS)
- **Build Tools**: electron-builder + concurrently
- **Architecture**: ES Modules + IPC + Context Bridge

## 📊 System Requirements

- **Windows**: Windows 10/11 with winget
- **macOS**: macOS 10.15+ with homebrew
- **Memory**: 4GB RAM minimum
- **Storage**: 200MB available space
- **Network**: Internet connection for package manager operations

## 🔄 Update Process

1. **Detection** - Scan installed applications via package managers
2. **Comparison** - Compare current vs latest versions
3. **Classification** - Determine update urgency and significance
4. **Execution** - Run package manager update commands
5. **Tracking** - Record results and trigger notifications
6. **History** - Maintain comprehensive update logs

## 🛡️ Security & Privacy

- **Sandboxed** - Electron security best practices
- **Local Only** - No data sent to external servers
- **Package Managers** - Uses trusted system package managers
- **Context Isolation** - Secure IPC bridge implementation
- **No Tracking** - No telemetry or analytics collection

## 🐛 Troubleshooting

### Common Issues
- **winget not found**: Install Windows Package Manager
- **brew not found**: Install Homebrew on macOS
- **Permission denied**: Run as administrator if needed
- **Update failures**: Check package manager logs

### Debug Mode
```bash
# Development with dev tools
npm run dev

# Production build
npm run build

# Create installer
npm run dist:win  # Windows
npm run dist:mac  # macOS
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- ES6+ with modules
- React hooks for state
- Semantic versioning
- Comprehensive error handling

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Electron Team** - Cross-platform desktop framework
- **Vite Team** - Fast build tooling
- **React Team** - Modern UI library
- **winget** - Windows Package Manager
- **Homebrew** - macOS Package Manager

---

**UpdateHub v1.0.0** - Keep your applications updated, automatically. 🚀
