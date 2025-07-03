# CreditScore AI - Automated Credit Scoring Platform

## Overview

CreditScore AI is a full-stack web application that provides automated credit scoring using machine learning. Users can upload financial datasets (CSV, Excel), and the system automatically processes the data, engineers features, trains multiple ML models, and presents comprehensive evaluation results through an interactive dashboard.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Theme**: Dark/light mode support with CSS variables

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API**: RESTful endpoints with WebSocket support for real-time updates
- **File Processing**: Multer for handling file uploads
- **ML Integration**: Python subprocess execution for model training

### Database & ORM
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Zod validation
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless PostgreSQL

## Key Components

### Data Processing Pipeline
1. **File Upload**: Supports CSV and Excel formats with validation
2. **Data Cleaning**: Automatic handling of missing values and inconsistencies
3. **Feature Engineering**: Automated creation of derived features like debt-to-income ratio
4. **Model Training**: Parallel training of multiple ML models (Logistic Regression, Decision Trees, Random Forest)
5. **Evaluation**: Comprehensive metrics including ROC-AUC curves and feature importance

### Machine Learning Components
- **Python ML Pipeline**: Scikit-learn based models with automated hyperparameter tuning
- **Model Types**: Logistic Regression, Decision Trees, Random Forest
- **Evaluation Metrics**: Accuracy, Precision, Recall, F1-Score, ROC-AUC
- **Feature Engineering**: Automated calculation of financial ratios and indicators

### Real-time Communication
- **WebSocket Integration**: Real-time updates for training progress and status
- **Progress Tracking**: Multi-step process visualization (Upload → Processing → Training → Results)
- **Live Notifications**: Toast notifications for user feedback

## Data Flow

1. **Upload Phase**: User uploads dataset through drag-and-drop interface
2. **Processing Phase**: Server validates file, extracts data, and performs initial analysis
3. **Feature Engineering**: Python script generates additional features and cleans data
4. **Training Phase**: Multiple ML models trained in parallel with hyperparameter optimization
5. **Evaluation Phase**: Models compared and best performer selected based on combined metrics
6. **Results Phase**: Interactive dashboard displays model performance, feature importance, and ROC curves

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI Components (Radix UI primitives, Lucide React icons)
- Data Visualization (Chart.js for ROC curves and performance charts)
- Form Handling (React Hook Form with Zod resolvers)
- Styling (Tailwind CSS, class-variance-authority)

### Backend Dependencies
- Express.js with TypeScript support
- Database (Drizzle ORM, PostgreSQL via Neon)
- File Processing (Multer for uploads)
- WebSocket (ws library for real-time communication)
- Python Integration (Child process execution)

### Python ML Dependencies
- Core ML (scikit-learn, pandas, numpy)
- Visualization (matplotlib, seaborn)
- Data Processing (openpyxl for Excel support)
- Model Persistence (joblib)

## Deployment Strategy

### Development Setup
- Vite dev server for frontend hot reloading
- tsx for TypeScript execution in development
- Concurrent frontend and backend development
- Environment variable configuration for database connections

### Production Build
- Vite build for optimized frontend bundle
- esbuild for backend compilation to ESM
- Static file serving from Express
- PostgreSQL database deployment via Neon

### Architecture Decisions

#### Database Choice
- **Problem**: Need for structured data storage with relationships
- **Solution**: PostgreSQL with Drizzle ORM
- **Rationale**: Type-safe database operations, excellent TypeScript integration, and scalable for complex queries

#### Real-time Updates
- **Problem**: Long-running ML training processes need progress feedback
- **Solution**: WebSocket integration with status broadcasting
- **Rationale**: Better user experience compared to polling, efficient for multiple concurrent users

#### Python Integration
- **Problem**: Need for robust ML capabilities not available in JavaScript
- **Solution**: Subprocess execution with JSON communication
- **Rationale**: Leverages mature Python ML ecosystem while maintaining Node.js backend

#### Component Architecture
- **Problem**: Complex UI with multiple data visualization needs
- **Solution**: Modular React components with shadcn/ui
- **Rationale**: Consistent design system, accessibility built-in, and maintainable code structure

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```