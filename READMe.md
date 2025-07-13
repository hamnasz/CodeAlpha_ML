
# Credit Scoring Model Platform

![Python](https://img.shields.io/badge/python-v3.11+-blue.svg)
![Streamlit](https://img.shields.io/badge/streamlit-1.46.1+-red.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

A production-ready Credit Scoring Model Platform built with Streamlit that provides a comprehensive solution for building, evaluating, and deploying credit risk assessment systems. The platform implements a complete machine learning pipeline from data upload through model deployment, specifically designed for predicting individual creditworthiness using historical financial data.

## 🚀 Features

- **Complete ML Pipeline**: 6-stage pipeline from data upload to credit scoring
- **Multiple Algorithms**: Support for Logistic Regression, Decision Trees, Random Forest, Gradient Boosting, and SVM
- **Advanced Feature Engineering**: Automated feature creation, encoding, and selection
- **Model Interpretability**: SHAP values and feature importance analysis
- **Bias Detection**: Comprehensive fairness and regulatory compliance analysis
- **Real-time Scoring**: Single applicant and batch scoring capabilities
- **Interactive Visualizations**: Plotly-powered charts and analysis
- **Professional UI**: Clean, intuitive Streamlit interface

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🛠️ Installation

### Option 1: Download and Run Locally

1. **Download the project**:
   - Click the green "Code" button on GitHub
   - Select "Download ZIP"
   - Extract the ZIP file to your desired location

2. **Install Python dependencies**:
   ```bash
   # Navigate to project directory
   cd MachineLearningProject
   
   # Install dependencies using pip
   pip install streamlit pandas numpy plotly scikit-learn scipy seaborn matplotlib
   ```

3. **Run the application**:
   ```bash
   streamlit run app.py --server.port 5000
   ```

4. **Access the application**:
   Open your browser and go to `http://localhost:5000`

### Option 2: GitHub Codespaces

1. **Open in Codespaces**:
   - Click the green "Code" button on GitHub
   - Select "Codespaces" tab
   - Click "Create codespace on main"

2. **Install dependencies** (in Codespaces terminal):
   ```bash
   pip install streamlit pandas numpy plotly scikit-learn scipy seaborn matplotlib
   ```

3. **Run the application**:
   ```bash
   streamlit run app.py --server.port 5000
   ```

4. **Access the application**:
   Codespaces will automatically forward the port and provide a URL

### Option 3: Using UV Package Manager (Recommended)

If you have UV installed:

```bash
# Clone the repository
git clone https://github.com/hamnasz/MachineLearningProject
cd MachineLearningProject

# Install dependencies with UV
uv sync

# Run the application
streamlit run app.py --server.port 5000
```

## 🚀 Quick Start

1. **Start the application** using one of the installation methods above

2. **Upload your data**:
   - Navigate to "Data Upload" page
   - Upload a CSV file with credit-related features
   - Or use the "Create Sample Dataset" button for testing

3. **Follow the ML Pipeline**:
   - **Data Preprocessing**: Clean and prepare your data
   - **Feature Engineering**: Create and select relevant features
   - **Model Training**: Train multiple classification models
   - **Model Evaluation**: Assess model performance and bias
   - **Credit Scoring**: Use trained models for predictions

## 📁 Project Structure

```
MachineLearningProject/
├── app.py                      # Main Streamlit application
├── pages/                      # Streamlit pages
│   ├── 1_Data_Upload.py       # Data upload and initial analysis
│   ├── 2_Data_Preprocessing.py # Data cleaning and preprocessing
│   ├── 3_Feature_Engineering.py # Feature creation and selection
│   ├── 4_Model_Training.py    # Model training and tuning
│   ├── 5_Model_Evaluation.py  # Model evaluation and interpretability
│   └── 6_Credit_Scoring.py    # Credit scoring and predictions
├── utils/                      # Core utility modules
│   ├── data_processor.py      # Data preprocessing utilities
│   ├── feature_engineer.py    # Feature engineering utilities
│   ├── model_trainer.py       # Model training utilities
│   ├── model_evaluator.py     # Model evaluation utilities
│   └── bias_detector.py       # Bias detection and fairness analysis
├── .streamlit/
│   └── config.toml            # Streamlit configuration
├── pyproject.toml             # Project dependencies
└── README.md                  # This file
```

## 📖 Usage Guide

### Data Requirements

Your CSV dataset should include features such as:

- **Annual Income**: Customer's yearly income
- **Total Debts**: Total outstanding debt amount
- **Payment History**: Number of late payments
- **Employment Status**: Current employment situation
- **Credit Utilization Rate**: Percentage of credit limit used
- **Demographics**: Age, education level, etc.
- **Target Variable**: Binary indicator (0=Bad, 1=Good credit)

### Pipeline Stages

1. **Data Upload**: Upload CSV files and perform initial analysis
2. **Data Preprocessing**: Handle missing values, outliers, and data cleaning
3. **Feature Engineering**: Create derived features and encode variables
4. **Model Training**: Train multiple ML algorithms with hyperparameter tuning
5. **Model Evaluation**: Comprehensive performance analysis and bias detection
6. **Credit Scoring**: Real-time scoring for individual applicants or batch processing

### Key Features

- **Automated Feature Engineering**: Creates financial ratios and risk indicators
- **Model Comparison**: Side-by-side comparison of multiple algorithms
- **Bias Detection**: Ensures fairness across demographic groups
- **Interpretability**: SHAP values and feature importance analysis
- **Business Metrics**: ROI calculations and portfolio analysis

## 🔧 Development

### Prerequisites

- Python 3.11+
- Streamlit 1.46.1+
- Modern web browser

### Setting up Development Environment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/hamnasz/MachineLearningProject.git
   cd MachineLearningProject
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   # or with UV
   uv sync
   ```

3. **Run in development mode**:
   ```bash
   streamlit run app.py --server.port 5000
   ```

### Code Structure

- **Modular Design**: Each utility class handles a specific aspect of the ML pipeline
- **Session State**: Maintains data consistency across Streamlit pages
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive UI**: Works on desktop and tablet devices

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**:
   - Follow the existing code style
   - Add docstrings to new functions
   - Update README if needed
4. **Test your changes**:
   ```bash
   streamlit run app.py --server.port 5000
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Types of Contributions

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Additional ML algorithms
- 📊 New visualization options
- 🔒 Security enhancements

### Development Guidelines

- **Code Style**: Follow PEP 8 for Python code
- **Documentation**: Add docstrings for all functions and classes
- **Testing**: Test your changes thoroughly
- **Commits**: Use clear, descriptive commit messages
- **Issues**: Check existing issues before creating new ones

### Areas for Contribution

- Add support for additional ML algorithms
- Implement advanced feature selection techniques
- Add more bias detection metrics
- Improve model interpretability features
- Add export/import functionality for models
- Enhance data visualization options
- Add API endpoints for model serving

## 🆘 Support

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/hamnasz/MachineLearningProject)
- **Documentation**: Check the code comments and docstrings for detailed information
- **Community**: Join discussions in the GitHub repository

## 🎯 Roadmap

- [ ] Add ensemble model support
- [ ] Implement automated model retraining
- [ ] Add model monitoring and drift detection
- [ ] Create REST API for model serving
- [ ] Add database integration
- [ ] Implement user authentication
- [ ] Add model versioning and experiment tracking

---

**Built with ❤️ using Streamlit and scikit-learn**
