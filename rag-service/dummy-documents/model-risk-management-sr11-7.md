# Model Risk Management Comprehensive Guide - SR 11-7

## Introduction and Scope

Model risk is the potential for adverse consequences from decisions based on incorrect or misused model outputs and reports. Model risk can lead to financial loss, poor business and strategic decision making, or damage to a banking organization's reputation. Model risk occurs primarily for two reasons:

1. **Fundamental errors in the model**: Models may have errors due to flawed theory, inappropriate model specification, poor input data quality, or programming/implementation errors.

2. **Model misuse**: Even a fundamentally sound model may produce misleading information if it is used inappropriately or if users do not understand the model's limitations and assumptions.

This guidance applies to all models used by banking organizations, including models used for:
- Capital planning and stress testing
- Credit risk assessment and pricing
- Market risk measurement
- Operational risk assessment
- Asset-liability management
- Fair value measurement
- Anti-money laundering transaction monitoring

## Model Definition and Classification

### What Constitutes a Model

For purposes of this guidance, a model is defined as a quantitative method, system, or approach that applies statistical, economic, financial, or mathematical theories, techniques, and assumptions to process input data into quantitative estimates.

Models typically:
- Transform input data into estimates of expected outcomes
- Apply quantitative assumptions and theory
- Are used to inform business decisions
- Support risk measurement and management

### Model Classification System

Banking organizations should establish a model classification system that considers:

#### Risk Level Classification
- **High Risk**: Models with significant potential impact on earnings, capital, or reputation
- **Moderate Risk**: Models with limited impact but still material to business decisions  
- **Low Risk**: Models with minimal impact on financial condition or business operations

#### Business Use Classification
- **Regulatory**: Models used for regulatory reporting or compliance
- **Financial Reporting**: Models used for accounting and financial statement preparation
- **Risk Management**: Models used for risk identification, measurement, and control
- **Business Decision**: Models used for strategic planning and business operations

## Model Governance Framework

### Board and Senior Management Oversight

The board of directors and senior management are responsible for ensuring that model risk is appropriately identified, measured, monitored, and controlled. Key responsibilities include:

#### Board Responsibilities
- Approve model risk management framework and policies
- Ensure adequate resources for model risk management
- Review model risk reports and key metrics
- Oversee model risk appetite and tolerance levels

#### Senior Management Responsibilities
- Implement board-approved policies and procedures
- Establish model governance committee structure
- Ensure model risk is integrated into overall risk management
- Provide adequate resources for model development and validation

### Model Governance Committee Structure

Banking organizations should establish appropriate committee structures for model governance, typically including:

#### Model Risk Management Committee
- Oversee enterprise-wide model risk management
- Review and approve high-risk models
- Monitor model performance and validation results
- Escalate significant model issues to senior management

#### Model Review Committees
- Review model development and validation activities
- Assess model performance and ongoing appropriateness
- Approve model changes and updates
- Coordinate between model developers and validators

## Model Development Standards

### Model Development Process

Effective model development should follow a structured process that includes:

#### 1. Model Planning and Design
- Define model purpose and intended use
- Identify target variables and business requirements
- Assess data availability and quality
- Select appropriate modeling techniques and methodologies

#### 2. Data Preparation and Analysis
- Collect and clean input data
- Perform exploratory data analysis
- Address data quality issues and limitations
- Document data sources and transformations

#### 3. Model Specification and Estimation
- Specify model structure and functional form
- Estimate model parameters using appropriate techniques
- Test alternative model specifications
- Validate statistical assumptions

#### 4. Model Testing and Validation
- Conduct out-of-sample testing
- Perform sensitivity and scenario analysis
- Compare model performance to benchmarks
- Assess model stability and robustness

### Model Documentation Requirements

Comprehensive model documentation must include:

#### Model Purpose and Description
- Business purpose and intended use cases
- Target variables and outputs
- Model scope and limitations
- Key assumptions and dependencies

#### Methodology and Theory
- Conceptual framework and economic theory
- Mathematical and statistical foundations
- Model specification and functional form
- Parameter estimation techniques

#### Data Description
- Input data sources and definitions
- Data quality assessment and treatment
- Sample period and frequency
- Data transformations and adjustments

#### Model Performance
- Development sample results
- Out-of-sample validation results
- Benchmark comparisons
- Sensitivity analysis results

#### Implementation Details
- System and technology requirements
- User procedures and instructions
- Model limitations and appropriate use
- Monitoring and maintenance procedures

## Model Validation Framework

### Independence Requirements

Model validation must be conducted by qualified personnel who are independent of the model development process. Independence can be achieved through:

#### Organizational Independence
- Separate reporting lines from model developers
- Independent budget and resource allocation
- Direct reporting to senior management or board
- No conflicts of interest with model outcomes

#### Functional Independence
- Separate validation team from development team
- Independent access to data and systems
- Ability to challenge model assumptions and findings
- Authority to recommend model changes or restrictions

### Validation Activities

Comprehensive model validation includes three core activities:

#### 1. Evaluation of Conceptual Soundness
- Review of model theory and logic
- Assessment of methodology appropriateness
- Evaluation of assumptions and limitations
- Comparison to industry practices and standards

#### 2. Ongoing Monitoring
- Regular assessment of model performance
- Monitoring of key performance indicators
- Tracking of model usage and applications
- Identification of performance deterioration

#### 3. Outcomes Analysis
- Comparison of model outputs to actual outcomes
- Analysis of prediction accuracy and bias
- Assessment of model stability over time
- Evaluation of model effectiveness for intended use

### Validation Frequency and Scope

Validation frequency should be risk-based and consider:

#### High-Risk Models
- Annual comprehensive validation
- Quarterly monitoring reports
- Semi-annual outcomes analysis
- Immediate validation for significant changes

#### Moderate-Risk Models
- Validation every two years
- Semi-annual monitoring reports
- Annual outcomes analysis
- Validation for material changes

#### Low-Risk Models
- Validation every three years
- Annual monitoring reports
- Outcomes analysis as appropriate
- Validation for significant changes

## Model Performance Monitoring

### Key Performance Indicators

Banking organizations should establish KPIs to monitor model performance, including:

#### Accuracy Metrics
- Prediction error measures (RMSE, MAE, MAPE)
- Classification accuracy (sensitivity, specificity)
- Calibration statistics
- Discrimination measures (ROC, Gini coefficient)

#### Stability Metrics
- Population stability index (PSI)
- Characteristic stability index (CSI)
- Model score distributions
- Parameter stability measures

#### Usage Metrics
- Model utilization rates
- Override frequencies and reasons
- User feedback and issues
- System performance metrics

### Performance Deterioration Triggers

Banking organizations should establish clear triggers for model review and potential remediation:

#### Quantitative Triggers
- Accuracy metrics below acceptable thresholds
- Stability metrics indicating significant shifts
- Outcomes analysis showing systematic bias
- Usage patterns indicating potential misuse

#### Qualitative Triggers
- Changes in business environment or strategy
- Regulatory changes affecting model use
- Data quality deterioration
- System or process changes

## Model Change Management

### Change Management Process

All model changes should follow a structured change management process:

#### Change Request and Approval
- Formal change request documentation
- Impact assessment and risk analysis
- Appropriate approval authorities
- Change scheduling and planning

#### Change Implementation
- Controlled implementation procedures
- Testing and quality assurance
- User training and communication
- Rollback procedures if needed

#### Post-Implementation Review
- Validation of change effectiveness
- Performance monitoring and assessment
- Documentation updates
- Lessons learned analysis

### Types of Model Changes

Different types of changes require different levels of review and approval:

#### Minor Changes
- Data refreshes and routine updates
- Bug fixes and technical corrections
- Performance optimizations
- Documentation updates

#### Major Changes
- Methodology or specification changes
- New data sources or variables
- Significant parameter changes
- Scope or use case expansions

#### Model Replacements
- Complete model redevelopment
- Vendor model implementations
- Technology platform changes
- Regulatory requirement changes

## Model Issue Management

### Issue Identification and Classification

Model issues should be promptly identified and classified by severity:

#### Critical Issues
- Fundamental model flaws affecting reliability
- Regulatory compliance violations
- Significant financial impact
- Immediate remediation required

#### High-Priority Issues
- Material performance deterioration
- Data quality problems affecting results
- Control weaknesses in model processes
- Remediation within specified timeframes

#### Medium-Priority Issues
- Minor performance issues
- Documentation deficiencies
- Process improvement opportunities
- Remediation as resources permit

### Remediation Planning

Remediation plans should include:

#### Issue Assessment
- Root cause analysis
- Impact assessment
- Risk evaluation
- Resource requirements

#### Remediation Actions
- Specific corrective measures
- Responsible parties and timelines
- Resource allocation and budgets
- Success criteria and metrics

#### Monitoring and Reporting
- Progress tracking and updates
- Escalation procedures
- Completion verification
- Ongoing monitoring requirements

## Model Inventory and Documentation

### Comprehensive Model Inventory

Banking organizations must maintain a comprehensive inventory of all models, including:

#### Model Identification
- Unique model identifiers
- Model names and versions
- Business owners and users
- Development and validation teams

#### Model Classification
- Risk level and business use categories
- Regulatory and accounting applications
- Model complexity and sophistication
- Validation requirements and frequency

#### Model Status
- Development and approval status
- Validation status and findings
- Performance monitoring results
- Issue status and remediation plans

### Documentation Management

Effective documentation management includes:

#### Document Standards
- Standardized documentation templates
- Version control and change tracking
- Approval and review procedures
- Storage and retention policies

#### Document Repository
- Centralized document storage
- Controlled access and security
- Search and retrieval capabilities
- Backup and disaster recovery

## Regulatory Considerations

### Supervisory Expectations

Bank supervisors expect banking organizations to:

#### Demonstrate Sound Model Risk Management
- Comprehensive policies and procedures
- Adequate resources and expertise
- Effective governance and oversight
- Regular assessment and improvement

#### Maintain Appropriate Documentation
- Complete and current model documentation
- Evidence of validation activities
- Issue tracking and remediation
- Compliance with regulatory requirements

#### Ensure Model Reliability
- Robust development and validation processes
- Ongoing monitoring and maintenance
- Prompt issue identification and resolution
- Continuous improvement initiatives

### Examination Procedures

Supervisory examinations of model risk management typically include:

#### Policy and Governance Review
- Assessment of governance framework
- Review of policies and procedures
- Evaluation of board and management oversight
- Analysis of organizational structure

#### Model Sampling and Testing
- Selection of models for detailed review
- Assessment of development and validation quality
- Testing of model performance and accuracy
- Review of change management processes

#### Issue Assessment and Corrective Actions
- Identification of deficiencies and weaknesses
- Assessment of management responses
- Evaluation of remediation efforts
- Determination of supervisory actions

## Implementation Considerations

### Organizational Readiness

Successful implementation requires:

#### Leadership Commitment
- Strong support from board and senior management
- Adequate resource allocation
- Clear accountability and responsibility
- Integration with business strategy

#### Staff Capabilities
- Qualified model development staff
- Independent validation expertise
- Risk management knowledge
- Technology and analytical skills

#### Infrastructure Development
- Appropriate systems and technology
- Data management capabilities
- Documentation and reporting tools
- Governance and control processes

### Implementation Approach

Banking organizations should consider a phased implementation approach:

#### Phase 1: Foundation Building
- Establish governance framework
- Develop policies and procedures
- Build model inventory
- Train staff and management

#### Phase 2: Process Implementation
- Implement validation processes
- Establish monitoring procedures
- Deploy change management
- Begin issue management

#### Phase 3: Continuous Improvement
- Enhance processes based on experience
- Expand capabilities and coverage
- Integrate with broader risk management
- Maintain regulatory compliance

## Conclusion

Effective model risk management is essential for banking organizations to safely and soundly use models in their business operations. This comprehensive framework provides the foundation for identifying, measuring, monitoring, and controlling model risk while meeting supervisory expectations and regulatory requirements.

Banking organizations should tailor their model risk management programs to their size, complexity, and risk profile while ensuring that all key elements of sound model risk management are appropriately addressed. Regular assessment and continuous improvement of model risk management practices will help ensure ongoing effectiveness and regulatory compliance.
