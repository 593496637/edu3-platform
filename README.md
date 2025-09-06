# 🎯 EDU3 Platform - Quick Fix Guide

**✅ ISSUES FIXED**: Apollo Client warnings and API 404 errors resolved!

## 🚀 Quick Start (Fixed Version)

### Option 1: Automated Setup (Recommended)
```bash
git clone https://github.com/593496637/edu3-platform.git
cd edu3-platform
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup
```bash
# Terminal 1 - API Server
cd api
cp .env.example .env
pnpm install
pnpm dev

# Terminal 2 - Web App  
cd web
cp .env.example .env
pnpm install
pnpm dev
```

## ✅ Recent Fixes Applied

### 1. Apollo Client Deprecation Warning - FIXED ✅
- **Issue**: `connectToDevTools` deprecated in Apollo Client 3.14.0
- **Fix**: Updated `web/src/lib/graph-client.ts` to use new `devtools.enabled` config
- **Result**: No more deprecation warnings in console

### 2. API 404 Error - FIXED ✅  
- **Issue**: Frontend requesting `/api/courses` but route didn't exist
- **Fix**: Added missing GET routes in `api/src/routes/courses.ts`
- **Result**: Course API now returns mock data successfully

### 3. Environment Configuration - IMPROVED ✅
- **Added**: `web/.env.example` with proper API URL configuration
- **Added**: Development startup script for easy setup
- **Result**: Consistent environment setup across development

## 🔍 Verification Steps

### 1. Check API Health
```bash
curl http://localhost:3000/health
# Should return: {"status": "healthy", ...}
```

### 2. Test Courses Endpoint  
```bash
curl http://localhost:3000/api/courses
# Should return: {"success": true, "data": {"courses": [...]}}
```

### 3. Verify Frontend
- Open http://localhost:5173
- Console should be clean (no Apollo warnings)
- Course list should load without 404 errors

## 🏗️ Project Architecture

### Backend (Express + TypeScript)
```
api/
├── src/routes/courses.ts    # ✅ Fixed - Added GET /courses
├── src/index.ts            # Main server with CORS and routes
└── .env.example            # Environment template
```

### Frontend (React + Vite + Web3)
```
web/
├── src/lib/graph-client.ts  # ✅ Fixed - Apollo Client config
├── src/hooks/useApi.ts     # API integration hooks  
└── .env.example            # ✅ Added - Environment template
```

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Web3**: Wagmi, Viem, RainbowKit, Apollo Client
- **Backend**: Express, TypeScript, Ethers.js
- **Development**: pnpm, hot reload, TypeScript strict mode

## 🎓 Web3 Features

- **Wallet Connection**: MetaMask integration via RainbowKit
- **Token Exchange**: ETH ↔ YD Token (1 ETH = 4000 YD)
- **Course Purchases**: Blockchain-verified course access
- **Smart Contracts**: YDToken (ERC20) + CoursePlatform

## 📱 User Interface

- **Modern Design**: Gradients, glass morphism, smooth animations
- **Responsive**: Desktop sidebar + mobile bottom navigation  
- **Web3 UX**: Transaction feedback, loading states, error handling
- **Pages**: Course Market, Token Exchange, My Courses

## 🔧 Development Features

- **Hot Reload**: Both frontend and backend with file watching
- **TypeScript**: Full type safety across the stack
- **Environment**: Separate configs for dev/staging/production
- **Error Handling**: Graceful fallbacks for blockchain connection issues

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port conflicts | `lsof -ti:3000 \| xargs kill -9` |
| Missing .env | `cp .env.example .env` in both api/ and web/ |
| Node modules | `rm -rf node_modules && pnpm install` |
| Blockchain errors | Expected in dev mode - uses mock data |

## 🎯 Next Steps

1. **✅ Start Development**: Use the automated script or manual setup
2. **🔧 Configure Web3**: Add your Infura/Alchemy RPC URLs
3. **💾 Database Setup**: Configure PostgreSQL for production data
4. **🚀 Deploy**: Follow deployment guides for your hosting platform

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify both servers are running on correct ports
3. Confirm environment variables are properly set
4. Review the troubleshooting guide in the repository

## 🌟 Features Overview

### Course Market (HomePage)
- Browse available Web3 courses
- View course details and pricing
- Purchase courses with YD tokens
- Real-time price conversion

### Token Exchange
- Convert ETH to YD tokens
- Convert YD tokens back to ETH
- Live balance display
- Transaction history

### My Courses
- View purchased courses
- Access course content
- Track learning progress
- Download completion certificates

## 📋 Development Workflow

1. **Setup**: Run the startup script or manual commands
2. **Develop**: Edit code with hot reload enabled
3. **Test**: Use browser and API testing tools
4. **Debug**: Check logs in terminal and browser console
5. **Deploy**: Follow production deployment guides

---

**Ready to start?** Run `./start-dev.sh` and begin exploring Web3 development!

For detailed documentation, see:
- `QUICKSTART.md` - Step-by-step setup guide
- `README-SIMPLIFIED.md` - Simplified version documentation
- `web/README.md` - Frontend-specific documentation
- `api/README.md` - Backend API documentation