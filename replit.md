# AutoML Web Application

## Overview

This is a full-stack AutoML (Automated Machine Learning) web application that enables users to upload datasets, automatically detect task types, preprocess data, train multiple models, and visualize results. The system provides a beautiful, modern interface for non-technical users to perform complex machine learning tasks without coding.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with dark/light theme support
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Processing**: Multer for file uploads
- **API Design**: RESTful API endpoints
- **ML Service**: Custom ML service layer for model training and evaluation

## Key Components

### Data Management
- **Database Schema**: Four main tables (datasets, models, visualizations, training_jobs)
- **File Storage**: Local file system with multer for CSV/Excel uploads
- **Data Processing**: Pandas-like processing for tabular data analysis

### Machine Learning Pipeline
- **Task Detection**: Automatic classification vs regression detection
- **Model Types**: Support for Random Forest, XGBoost, Decision Trees, and Linear models
- **Preprocessing**: Automated data cleaning and feature engineering
- **Training**: Multi-model training with hyperparameter optimization
- **Evaluation**: Comprehensive metrics and visualizations

### User Interface
- **Progressive Steps**: Upload → Preprocess → Train → Results workflow
- **Real-time Updates**: Live training progress monitoring
- **Data Visualization**: Interactive charts using Recharts
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme Support**: Dark mode by default with light mode option

## Data Flow

1. **File Upload**: User uploads CSV/Excel via drag-and-drop interface
2. **Data Preview**: System parses and displays dataset sample
3. **Task Detection**: Automatic inference of classification/regression task
4. **Preprocessing**: Data cleaning, encoding, and feature engineering
5. **Model Training**: Parallel training of multiple ML models
6. **Evaluation**: Performance metrics calculation and visualization generation
7. **Results Display**: Model comparison, charts, and downloadable reports

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- UI components (Radix UI primitives, shadcn/ui components)
- Styling (Tailwind CSS, class-variance-authority)
- Charts (Recharts for data visualization)
- Forms (React Hook Form with Zod validation)
- File handling (React Dropzone)

### Backend Dependencies
- Express.js with TypeScript support
- Database (Drizzle ORM, Neon Database connector)
- File processing (Multer for uploads)
- Validation (Zod schemas)
- Development tools (TSX, ESBuild)

### Development Tools
- Vite for frontend bundling
- TypeScript for type safety
- Drizzle Kit for database migrations
- PostCSS with Tailwind CSS
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- Uses Vite dev server for hot module replacement
- TSX for TypeScript execution in development
- Express serves API endpoints on same port as frontend
- Drizzle handles database schema synchronization

### Production Build
- Vite builds optimized frontend bundle
- ESBuild bundles backend server code
- Static files served from Express
- Database migrations handled by Drizzle Kit

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- Neon Database for serverless PostgreSQL hosting
- File uploads stored in local uploads directory
- API and frontend served from single Express instance

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```